// File: pages/api/find-emails.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient }            from '@supabase/supabase-js';
import * as cheerio                from 'cheerio';
import { XMLParser }               from 'fast-xml-parser';
import axios                       from 'axios';

// ─── Supabase setup ────────────────────────────────────────────────────────────
const SUPABASE_URL       = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY  = process.env.VITE_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase           = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

// ─── Helpers & constants ───────────────────────────────────────────────────────
const EMAIL_PATTERNS = [
  '{firstName}.{lastName}@{domain}',
  '{firstName}{lastName}@{domain}',
  '{firstInitial}{lastName}@{domain}',
  '{firstName}.{lastInitial}@{domain}',
  '{firstName}@{domain}',
];
const delay         = (ms: number) => new Promise(r => setTimeout(r, ms));
const RAILWAY_BASE  = 'https://email-verifier-production.up.railway.app';

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
      event_type:    params.eventType,
      domain:        params.domain,
      is_catchall:   params.isCatchall,
      pattern_tried: params.patternTried,
      smtp_success:  params.smtpSuccess,
      latency_ms:    params.latencyMs,
      error_message: params.errorMessage,
    });
  } catch (e) {
    console.error('[logMetric] failed:', e);
  }
}

async function verifyEmailWithRailway(email:string,domain:string):Promise<boolean> {
  try {
    const t0 = Date.now();
    const { data } = await axios.post(`${RAILWAY_BASE}/verify`, { email, domain });
    console.log(`[verifyRailway] ${email}@${domain} → ok=${data.ok} (${Date.now()-t0}ms)`);
    return data.ok === true;
  } catch (e) {
    console.warn('[verifyRailway] error, default false', e.message);
    return false;
  }
}
async function testCatchallWithRailway(domain:string):Promise<boolean> {
  try {
    const t0 = Date.now();
    const { data } = await axios.post(`${RAILWAY_BASE}/test-catchall`, { domain });
    console.log(`[catchallRailway] ${domain} → ok=${data.ok} (${Date.now()-t0}ms)`);
    return data.ok === true;
  } catch (e) {
    console.warn('[catchallRailway] error, default false', e.message);
    return false;
  }
}

function generateEmailCandidates(firstName:string, lastName:string, domain:string, goodPattern?:string):string[] {
  firstName = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  lastName  = lastName .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  const patterns = goodPattern
    ? [ goodPattern.replace('{firstName}', firstName)
                    .replace('{lastName}', lastName)
                    .replace('{firstInitial}', firstName.charAt(0))
                    .replace('{lastInitial}', lastName.charAt(0))
                    .replace('{domain}', domain) ]
    : EMAIL_PATTERNS.map(p =>
        p.replace('{firstName}', firstName)
         .replace('{lastName}',  lastName)
         .replace('{firstInitial}', firstName.charAt(0))
         .replace('{lastInitial}',  lastName.charAt(0))
         .replace('{domain}',       domain)
      );
  console.log(`[candidates] for ${firstName} ${lastName}@${domain}:`, patterns);
  return patterns;
}

async function getAuthorsFromArXiv(univ:string, maxResults=3) {
  console.log(`[arXiv] start fetch for ${univ}`);
  try {
    const q    = encodeURIComponent(`affiliation:${univ}`);
    const url  = `http://export.arxiv.org/api/query?search_query=${q}&start=0&max_results=${maxResults}`;
    const t0   = Date.now();
    const res  = await axios.get(url, { timeout: 10_000 });
    console.log(`[arXiv] got data in ${Date.now()-t0}ms`);
    const parser = new XMLParser({ ignoreAttributes:false, attributeNamePrefix:'', isArray:name=>name==='entry'||name==='author' });
    const feed   = parser.parse(res.data).feed;
    const entries= Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    console.log(`[arXiv] parsed ${entries.length} entries for ${univ}`);
    return entries.map((e:any) => {
      const auth = Array.isArray(e.author) ? e.author[0] : e.author;
      return { name: auth?.name||'Unknown', affiliation: univ };
    });
  } catch (e) {
    console.error('[arXiv] error:', e.message);
    await logMetric({ eventType:'arxiv_api_error', errorMessage:(e as Error).message });
    return [];
  }
}

async function checkLeadExistsInAttio(email:string){ return false; }

// ─── API handler ───────────────────────────────────────────────────────────────
export default async function handler(req:VercelRequest, res:VercelResponse) {
  console.time('[total]');
  if (req.method !== 'GET') {
    console.log('[handler] wrong method:', req.method);
    return res.status(405).json({ error:'Method not allowed' });
  }

  console.log('[handler] loading universities…');
  let unis:any[];
  if (req.query.useCustom==='true' && req.query.universities) {
    try {
      unis = JSON.parse(req.query.universities as string);
    } catch {
      console.warn('[handler] invalid custom universities');
      return res.status(400).json({ error:'Invalid universities param' });
    }
  } else {
    const t0 = Date.now();
    const { data, error } = await supabase
      .from('universities')
      .select('id,name,domain')
      .eq('is_default', true);
    console.log(`[handler] loaded defaults in ${Date.now()-t0}ms:`, data);
    if (error || !data) {
      console.error('[handler] supabase error:', error?.message);
      return res.status(500).json({ error:'Failed loading defaults', details:error?.message });
    }
    unis = data;
  }

  console.log('[handler] starting main loop over', unis.length, 'unis');
  const results:any[] = [];
  for (const uni of unis) {
    console.log(`[loop] university:`, uni);
    const domain = uni.domain;
    if (!domain) continue;

    const tCache = Date.now();
    let { data: domData } = await supabase
      .from('email_domains')
      .select('is_catchall,good_pattern')
      .eq('domain', domain)
      .maybeSingle();
    console.log(`[cache] domData for ${domain} after ${Date.now()-tCache}ms:`, domData);

    let isCatchall  = domData?.is_catchall||false;
    let goodPattern = domData?.good_pattern||null;
    if (!domData) {
      console.log(`[cache] no entry for ${domain}, testing catch-all…`);
      isCatchall = await testCatchallWithRailway(domain);
      console.log(`[cache] catch-all result:`, isCatchall);
      await supabase.from('email_domains').insert({ domain, is_catchall:isCatchall, good_pattern:null });
    }

    const authors = await getAuthorsFromArXiv(uni.name, 3);
    console.log(`[loop] authors for ${uni.name}:`, authors);

    for (const a of authors) {
      const name = a.name;
      if (!name||name==='Unknown') continue;
      const parts = name.split(' ');
      if (parts.length<2) continue;
      const [firstName, ...rest] = parts;
      const lastName = rest[rest.length-1];
      if (firstName.length<2||lastName.length<2) continue;

      const candidates = generateEmailCandidates(firstName, lastName, domain, goodPattern);
      let foundEmail:string|null = null;

      if (isCatchall) {
        foundEmail = candidates[0];
        console.log('[catchall] picking first candidate:', foundEmail);
      } else {
        for (const c of candidates) {
          console.log(`[verify] trying candidate: ${c}`);
          const ok = await verifyEmailWithRailway(c,domain);
          console.log(`[verify] result for ${c}:`, ok);
          await logMetric({
            eventType:   'smtp_verification',
            domain, patternTried:c.split('@')[0],
            smtpSuccess: ok,
            latencyMs:   undefined
          });
          if (ok) {
            foundEmail = c;
            console.log('[verify] confirmed email:', foundEmail);
            if (!goodPattern) {
              goodPattern = foundEmail.split('@')[0];
              console.log('[cache] caching new goodPattern:', goodPattern);
              await supabase
                .from('email_domains')
                .update({ good_pattern:goodPattern })
                .eq('domain', domain);
            }
            break;
          }
        }
      }

      if (foundEmail && !(await checkLeadExistsInAttio(foundEmail))) {
        console.log('[result] adding lead:', { name, domain, foundEmail, verified: isCatchall?'Maybe':'Yes' });
        results.push({ name, institution:uni.name, email:foundEmail, verified:isCatchall?'Maybe':'Yes' });
        if (results.length >= 10) {
          console.log('[loop] reached 10 results, breaking');
          break;
        }
      }
    }
    if (results.length >= 10) break;
  }

  console.log('[handler] final results:', results);
  console.timeEnd('[total]');
  return res.status(200).json(results);
}
