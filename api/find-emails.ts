import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient }            from '@supabase/supabase-js';
import axios                       from 'axios';

// ─── Supabase setup ────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase          = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

// ─── Serper.dev Search API Key ─────────────────────────────────────────────────
const SERPER_API_KEY = process.env.SERPER_API_KEY!;

// ─── Helpers & constants ───────────────────────────────────────────────────────
const EMAIL_PATTERNS = [
  '{firstName}.{lastName}@{domain}',
  '{firstName}{lastName}@{domain}',
  '{firstInitial}{lastName}@{domain}',
  '{firstName}.{lastInitial}@{domain}',
  '{firstName}@{domain}',
];
const delay        = (ms: number) => new Promise(r => setTimeout(r, ms));
const RAILWAY_BASE = 'https://email-verifier-production.up.railway.app';

// ─── Logging metrics ────────────────────────────────────────────────────────────
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

// ─── Railway SMTP “tickle” + timestamping ──────────────────────────────────────
async function verifyEmailWithRailway(email: string, domain: string): Promise<boolean> {
  const t0 = Date.now();
  let ok = false;
  try {
    const { data } = await axios.post(`${RAILWAY_BASE}/verify`, { email, domain });
    ok = data.ok === true;
    console.log(`[verifyRailway] ${email} → ok=${ok} (${Date.now()-t0}ms)`);
  } catch (e: any) {
    console.warn('[verifyRailway] error, default false', e.message);
  }

  // stamp success/failure
  const col = ok ? 'last_verified_at' : 'last_failed_at';
  await supabase
    .from('email_domains')
    .update({ [col]: new Date().toISOString() })
    .eq('domain', domain);

  return ok;
}

async function testCatchallWithRailway(domain: string): Promise<boolean> {
  try {
    const t0 = Date.now();
    const { data } = await axios.post(`${RAILWAY_BASE}/test-catchall`, { domain });
    console.log(`[catchallRailway] ${domain} → ok=${data.ok} (${Date.now()-t0}ms)`);
    return data.ok === true;
  } catch (e: any) {
    console.warn('[catchallRailway] error, default false', e.message);
    return false;
  }
}

// ─── Candidate pattern generator ──────────────────────────────────────────────
function generateEmailCandidates(firstName: string, lastName: string, domain: string, goodPattern?: string): string[] {
  firstName = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  lastName  = lastName .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  const patterns = goodPattern
    ? [ goodPattern
        .replace('{firstName}',    firstName)
        .replace('{lastName}',     lastName)
        .replace('{firstInitial}', firstName.charAt(0))
        .replace('{lastInitial}',  lastName.charAt(0))
        .replace('{domain}',       domain)
      ]
    : EMAIL_PATTERNS.map(p =>
        p.replace('{firstName}',    firstName)
         .replace('{lastName}',     lastName)
         .replace('{firstInitial}', firstName.charAt(0))
         .replace('{lastInitial}',  lastName.charAt(0))
         .replace('{domain}',       domain)
      );
  console.log(`[candidates] for ${firstName} ${lastName}@${domain}:`, patterns);
  return patterns;
}

// ─── Serper.dev lookup of “<name> <domain> email” ───────────────────────────────
async function lookupWithSerper(name: string, domain: string): Promise<string|null> {
  try {
    const body = JSON.stringify({ q: `${name} ${domain} email` });
    const { data } = await axios.post(
      'https://google.serper.dev/search',
      body,
      {
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    // collect title+snippet from organic results
    const txt = (data.organic||[])
      .map((o: any) => `${o.title} ${o.snippet}`)
      .join(' ');
    const re = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    const m = txt.match(re);
    return m ? m[0] : null;
  } catch (e: any) {
    console.warn('[Serper] error:', e.message);
    return null;
  }
}

// ─── OpenAlex author fetch ──────────────────────────────────────────────────────
async function getAuthorsFromOpenAlex(rorId: string, topicId?: string, perPage = 5) {
  try {
    const filters = [`last_known_institutions.ror:${rorId}`];
    if (topicId)    filters.push(`topics.id:${topicId}`);
    filters.push(`works_count:<50`);
    filters.push(`summary_stats.h_index:<15`);
    filters.push(`summary_stats.2yr_mean_citedness:>1`);
    const url = `https://api.openalex.org/authors`
      + `?filter=${filters.join(',')}`
      + `&select=display_name,orcid,last_known_institutions,works_count,summary_stats`
      + `&per_page=${perPage}`;
    const t0 = Date.now();
    const { data } = await axios.get(url);
    console.log(`[OpenAlex] fetched ${data.results.length} authors in ${Date.now()-t0}ms`);
    return data.results.map((a: any) => ({
      name:        a.display_name,
      orcid:       a.orcid,
      works_count: a.works_count,
      h_index:     a.summary_stats.h_index
    }));
  } catch (e: any) {
    console.error('[OpenAlex] error:', e.message);
    await logMetric({ eventType:'openalex_error', errorMessage:(e as Error).message });
    return [];
  }
}

// ─── API handler ───────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.time('[total]');
  if (req.method !== 'GET') {
    return res.status(405).json({ error:'Method not allowed' });
  }

  // 1) load defaults with ROR
  const { data: unis, error: uniErr } = await supabase
    .from('universities')
    .select('id,name,domain,openalex_ror')
    .eq('is_default', true);
  if (uniErr || !unis) {
    console.error('[handler] supabase error:', uniErr);
    return res.status(500).json({ error:'Failed loading universities' });
  }

  const topicId = req.query.topicId as string | undefined;
  console.log('[handler] topic filter:', topicId);

  const results: any[] = [];
  for (const uni of unis) {
    const { domain, openalex_ror: rorId } = uni;
    if (!domain || !rorId) continue;

    // 2) domain cache
    let { data: domData } = await supabase
      .from('email_domains')
      .select('is_catchall,good_pattern,last_verified_at,last_failed_at')
      .eq('domain', domain)
      .maybeSingle();
    if (!domData) {
      const isCatchall = await testCatchallWithRailway(domain);
      domData = { is_catchall:isCatchall, good_pattern:null, last_verified_at:null, last_failed_at:null };
      await supabase.from('email_domains').insert({
        domain,
        is_catchall:      isCatchall,
        good_pattern:     null,
        last_verified_at: isCatchall ? new Date().toISOString() : null,
        last_failed_at:   isCatchall ? null : new Date().toISOString(),
      });
    }
    const { is_catchall: isCatchall, good_pattern: goodPattern } = domData;

    // 3) pull authors
    const authors = await getAuthorsFromOpenAlex(rorId, topicId, 5);
    console.log(`[loop] authors for ${uni.name}:`, authors.map(a=>a.name));

    for (const a of authors) {
      if (!a.name.includes(' ')) continue;
      const [firstName, ...rest] = a.name.split(' ');
      const lastName = rest[rest.length-1];
      if (firstName.length<2||lastName.length<2) continue;

      let emailToUse: string | null = null;

      // 4) try Serper first
      const hit = await lookupWithSerper(a.name, domain);
      if (hit) {
        console.log('[Serper] found email:', hit);
        const [local, foundDomain] = hit.split('@');
        const ok = await verifyEmailWithRailway(local, foundDomain);

        if (ok) {
          emailToUse = hit;
        } else {
          console.warn('[verifyRailway] refused—but accepting Serper hit on trust:', hit);
          emailToUse = hit;
        }
      }

      // 5) fallback to guessing
      if (!emailToUse) {
        const candidates = generateEmailCandidates(firstName, lastName, domain, goodPattern);
        for (const c of candidates) {
          console.log('[verify] trying', c);
          if (await verifyEmailWithRailway(c.split('@')[0], domain)) {
            emailToUse = c;
            if (!goodPattern) {
              await supabase
                .from('email_domains')
                .update({ good_pattern:c.split('@')[0] })
                .eq('domain',domain);
            }
            break;
          }
          await logMetric({
            eventType:   'smtp_verification',
            domain, patternTried:c.split('@')[0],
            smtpSuccess: false
          });
        }
      }

      // 6) record success
      if (emailToUse) {
        results.push({
          name:             a.name,
          institution:      uni.name,
          email:            emailToUse,
          verified:         isCatchall ? 'Maybe' : 'Yes',
          orcid:            a.orcid,
          last_verified_at: domData.last_verified_at,
          last_failed_at:   domData.last_failed_at
        });
        if (results.length >= 10) break;
      }
    }
    if (results.length >= 10) break;
  }

  console.log('[handler] final results:', results);
  console.timeEnd('[total]');
  return res.status(200).json(results);
}
