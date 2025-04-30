// File: pages/api/find-emails.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';

// ---------- Supabase setup ----------
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY || SUPABASE_ANON_KEY
);

// ---------- Helpers & constants ----------
const EMAIL_PATTERNS = [
  '{firstName}.{lastName}@{domain}',
  '{firstName}{lastName}@{domain}',
  '{firstInitial}{lastName}@{domain}',
  '{firstName}.{lastInitial}@{domain}',
  '{firstName}@{domain}',
];
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function logMetric(params: {
  eventType: string;
  domain?: string;
  isCatchall?: boolean;
  patternTried?: string;
  smtpSuccess?: boolean;
  latencyMs?: number;
  errorMessage?: string;
}) {
  try {
    await supabase.from('metrics').insert({
      event_type:   params.eventType,
      domain:       params.domain,
      is_catchall:  params.isCatchall,
      pattern_tried:params.patternTried,
      smtp_success: params.smtpSuccess,
      latency_ms:   params.latencyMs,
      error_message:params.errorMessage,
    });
  } catch (e) {
    console.error('Failed writing metric:', e);
  }
}

// Delegate to Railway-verifier service:
const RAILWAY_BASE = 'email-verifier-production.up.railway.app';
async function verifyEmailWithRailway(email:string,domain:string):Promise<boolean> {
  try {
    const { data } = await axios.post(`${RAILWAY_BASE}/verify`, { email, domain });
    return data.ok === true;
  } catch {
    return false;
  }
}
async function testCatchallWithRailway(domain:string):Promise<boolean> {
  try {
    const { data } = await axios.post(`${RAILWAY_BASE}/test-catchall`, { domain });
    return data.ok === true;
  } catch {
    return false;
  }
}

function generateEmailCandidates(firstName:string, lastName:string, domain:string, goodPattern?:string):string[] {
  firstName = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  lastName  = lastName .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  if (goodPattern) {
    return [ goodPattern
      .replace('{firstName}', firstName)
      .replace('{lastName}',  lastName)
      .replace('{firstInitial}', firstName.charAt(0))
      .replace('{lastInitial}',  lastName.charAt(0))
      .replace('{domain}',      domain)
    ];
  }
  return EMAIL_PATTERNS.map(pattern =>
    pattern
      .replace('{firstName}',    firstName)
      .replace('{lastName}',     lastName)
      .replace('{firstInitial}', firstName.charAt(0))
      .replace('{lastInitial}',  lastName.charAt(0))
      .replace('{domain}',       domain)
  );
}

async function getAuthorsFromArXiv(univ:string, maxResults=5) {
  try {
    const q   = encodeURIComponent(`affiliation:${univ}`);
    const url = `http://export.arxiv.org/api/query?search_query=${q}&start=0&max_results=${maxResults}`;
    const res = await axios.get(url);
    const parser = new XMLParser({ ignoreAttributes:false, attributeNamePrefix:'', isArray:name=>name==='entry'||name==='author' });
    const feed = parser.parse(res.data).feed;
    const entries = Array.isArray(feed.entry)? feed.entry : [feed.entry];
    return entries.map((e:any) => {
      const auth = Array.isArray(e.author)? e.author[0] : e.author;
      return { name: auth?.name||'Unknown', affiliation: univ };
    });
  } catch (e) {
    await logMetric({ eventType:'arxiv_api_error', errorMessage:(e as Error).message });
    return [];
  }
}

// Stub: in real life hit Attio GraphQL
async function checkLeadExistsInAttio(email:string){ return false; }

// ---------- API handler ----------
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method!=='GET') return res.status(405).json({ error:'Method not allowed' });

  // pick universities
  let unis:any[];
  if (req.query.useCustom==='true' && req.query.universities) {
    try {
      unis = JSON.parse(req.query.universities as string);
    } catch {
      return res.status(400).json({ error:'Invalid universities param' });
    }
  } else {
    const { data, error } = await supabase
      .from('universities')
      .select('id,name,domain')
      .eq('is_default', true);
    if (error || !data) {
      return res.status(500).json({ error:'Failed loading defaults', details:error?.message });
    }
    unis = data;
  }

  const results:any[] = [];
  for (const uni of unis) {
    const domain = uni.domain;
    if (!domain) continue;

    // fetch or test cache
    let { data: domData } = await supabase
      .from('email_domains')
      .select('is_catchall,good_pattern')
      .eq('domain', domain)
      .maybeSingle();

    let isCatchall = domData?.is_catchall||false;
    let goodPattern= domData?.good_pattern||null;
    if (!domData) {
      isCatchall = await testCatchallWithRailway(domain);
      await supabase.from('email_domains').insert({ domain, is_catchall:isCatchall, good_pattern:null });
    }

    // arXiv authors
    const authors = await getAuthorsFromArXiv(uni.name);
    for (const a of authors) {
      if (!a.name || a.name==='Unknown') continue;
      const parts = a.name.split(' ');
      if (parts.length<2) continue;
      const [firstName, ...rest] = parts;
      const lastName = rest[rest.length-1];
      if (firstName.length<2||lastName.length<2) continue;

      // generate & verify
      const candidates = generateEmailCandidates(firstName, lastName, domain, goodPattern);
      let foundEmail:string|null = null;
      if (isCatchall) {
        foundEmail = candidates[0];
      } else {
        for (const c of candidates) {
          await delay(300);
          const ok = await verifyEmailWithRailway(c,domain);
          await logMetric({ eventType:'smtp_verification', domain, patternTried:c.split('@')[0], smtpSuccess:ok });
          if (ok) {
            foundEmail = c;
            if (!goodPattern) {
              goodPattern = c.slice(0,c.indexOf('@')).replace(firstName,'.').replace(lastName,'.'); // crude, but example
              await supabase.from('email_domains').update({ good_pattern:goodPattern }).eq('domain',domain);
            }
            break;
          }
        }
      }

      if (foundEmail && !(await checkLeadExistsInAttio(foundEmail))) {
        results.push({ name:a.name, institution: uni.name, email:foundEmail, verified: isCatchall?'Maybe':'Yes' });
        if (results.length>=10) break;
      }
    }
    if (results.length>=10) break;
  }

  res.status(200).json(results);
}
