import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient }                       from '@supabase/supabase-js';
import axios                                   from 'axios';

// ─── Supabase setup ────────────────────────────────────────────────────────────
const SUPABASE_URL       = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY  = process.env.VITE_SUPABASE_ANON_KEY!;
const SERVICE_ROLE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase           = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

// ─── Serper.dev API Key & Railway microservice URL ────────────────────────────
const SERPER_API_KEY = process.env.SERPER_API_KEY!;
const RAILWAY_BASE   = process.env.RAILWAY_BASE!;  // e.g. "https://email-verifier-production.up.railway.app" or something else

// ─── Helpers & constants ───────────────────────────────────────────────────────
const EMAIL_PATTERNS = [
  '{firstName}.{lastName}@{domain}',
  '{firstName}{lastName}@{domain}',
  '{firstInitial}{lastName}@{domain}',
  '{firstName}.{lastInitial}@{domain}',
  '{firstName}@{domain}',
];

// ─── Logging metrics ────────────────────────────────────────────────────────────
async function logMetric(params: {
  eventType: string;
  domain?: string;
  patternTried?: string;
  smtpSuccess?: boolean;
  latencyMs?: number;
  errorMessage?: string;
  reason?: string;
}) {
  try {
    await supabase.from('metrics').insert({
      event_type:    params.eventType,
      domain:        params.domain,
      pattern_tried: params.patternTried,
      smtp_success:  params.smtpSuccess,
      latency_ms:    params.latencyMs,
      error_message: params.errorMessage,
      error_reason:  params.reason,
    });
  } catch (e) {
    console.error('[logMetric] failed:', e);
  }
}

// ─── Railway HTTP wrappers ─────────────────────────────────────────────────────
async function verifyEmailWithRailway(local: string, domain: string) {
  const t0 = Date.now();
  // 1) call the DNS-based catch-all tester instead of raw MX lookup
  let mxFound: boolean;
  try {
    // First, probe catch-all (which internally does the DNS MX lookup)
    // we only care about the boolean result here for logging
    mxFound = await testCatchallWithRailway(domain);
  } catch {
    mxFound = false;
  }
  // log that MX lookup result immediately
  // right after you compute `mxFound` in verifyEmailWithRailway…
  try {
    await supabase
      .from('metrics')
      .insert({
        event_type: 'mx_lookup',
        domain,
        mx_found: mxFound
      });
  } catch (e) {
    console.error('[logMetric mx_lookup] failed:', e);
  }

  // 2) now run the real verify call
  try {
    const { data } = await axios.post(
      `${RAILWAY_BASE}/verify`,
      { email: `${local}@${domain}`, domain },
      { timeout: 10000 }
    );
    return { ...data, latencyMs: Date.now() - t0 };
  } catch (e: any) {
    return { ok: false, rejected: false, reason: 'network_error', error: e.message, latencyMs: Date.now() - t0 };
  }
}

// ─── Candidate pattern generator ──────────────────────────────────────────────
function generateEmailCandidates(firstName: string, lastName: string, domain: string, goodPattern?: string): string[] {
  firstName = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  lastName  = lastName .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,'').trim();
  if (goodPattern) {
    const one = goodPattern
      .replace('{firstName}',    firstName)
      .replace('{lastName}',     lastName)
      .replace('{firstInitial}', firstName.charAt(0))
      .replace('{lastInitial}',  lastName.charAt(0))
      .replace('{domain}',       domain);
    return [one];
  }
  return EMAIL_PATTERNS.map(p =>
    p.replace('{firstName}',    firstName)
     .replace('{lastName}',     lastName)
     .replace('{firstInitial}', firstName.charAt(0))
     .replace('{lastInitial}',  lastName.charAt(0))
     .replace('{domain}',       domain)
  );
}

// ─── Serper.dev lookup ──────────────────────────────────────────────────────────
async function lookupWithSerper(name: string, domain: string): Promise<string|null> {
  try {
    const body = { q: `${name} ${domain} email` };
    const { data } = await axios.post(
      'https://google.serper.dev/search',
      body,
      { headers: { 'X-API-KEY': SERPER_API_KEY } }
    );
    const txt = (data.organic || [])
      .map((o: any) => `${o.title} ${o.snippet}`)
      .join(' ');
    const m = txt.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    return m?.[0] || null;
  } catch (e: any) {
    console.warn('[Serper] error:', e.message);
    return null;
  }
}

// ─── OpenAlex author fetch ──────────────────────────────────────────────────────
async function getAuthorsFromOpenAlex(rorId: string, topicId?: string, perPage = 5) {
  const filters = [`last_known_institutions.ror:${rorId}`];
  if (topicId) filters.push(`topics.id:${topicId}`);
  filters.push(`works_count:<50`, `summary_stats.h_index:<15`, `summary_stats.2yr_mean_citedness:>1`);
  const url = `https://api.openalex.org/authors`
    + `?filter=${filters.join(',')}`
    + `&select=display_name,orcid,last_known_institutions,works_count,summary_stats`
    + `&per_page=${perPage}`;
  const t0 = Date.now();
  const res = await axios.get(url);
  console.log(`[OpenAlex] fetched ${res.data.results.length} authors in ${Date.now()-t0}ms`);
  return res.data.results.map((a: any) => ({
    name:        a.display_name,
    orcid:       a.orcid,
    works_count: a.works_count,
    h_index:     a.summary_stats.h_index
  }));
}

// ─── API handler ───────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error:'Method not allowed' });
  console.time('[total]');

  // 1) load defaults
  const { data: unis, error: uniErr } = await supabase
    .from('universities')
    .select('id,name,domain,openalex_ror')
    .eq('is_default', true);
  if (uniErr || !unis) return res.status(500).json({ error:'Failed loading universities' });

  const topicId = (req.query.topicId as string) || undefined;
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
        domain, is_catchall:isCatchall,
        good_pattern:null,
        last_verified_at:isCatchall? new Date().toISOString(): null,
        last_failed_at:null
      });
    }
    const { is_catchall: isCatchall, good_pattern: goodPattern } = domData;

    // 3) authors
    const authors = await getAuthorsFromOpenAlex(rorId, topicId, 5);

    for (const a of authors) {
      if (!a.name.includes(' ')) continue;
      const [firstName, ...rest] = a.name.split(' ');
      const lastName = rest[rest.length-1];
      if (firstName.length<2||lastName.length<2) continue;

      let emailToUse: string|null = null;
      let verifiedFlag: 'Yes'|'Maybe' = 'Yes';

      // a) Serper first
      const hit = await lookupWithSerper(a.name, domain);
      if (hit) {
        const [local, foundDom] = hit.split('@');
        const vr = await verifyEmailWithRailway(local, foundDom);
        await logMetric({
          eventType:    'smtp_verification',
          domain:       foundDom,
          patternTried: local,
          smtpSuccess:  vr.ok,
          latencyMs:    vr.latencyMs,
          errorMessage: vr.error,
          reason:       vr.reason
        });
        if (vr.ok) {
          emailToUse   = hit;
          verifiedFlag = 'Yes';
        } else if (!vr.rejected) {
          // grey-list → trust anyway
          emailToUse   = hit;
          verifiedFlag = 'Maybe';
        }
      }

      // b) fallback to guesser
      if (!emailToUse) {
        for (const c of generateEmailCandidates(firstName, lastName, domain, goodPattern)) {
          const [local] = c.split('@');
          const vr2 = await verifyEmailWithRailway(local, domain);
          await logMetric({
            eventType:    'smtp_verification',
            domain, patternTried:local,
            smtpSuccess:  vr2.ok,
            latencyMs:    vr2.latencyMs,
            errorMessage: vr2.error,
            reason:       vr2.reason
          });
          if (vr2.ok) {
            emailToUse   = c;
            verifiedFlag = 'Yes';
            if (!goodPattern) {
              await supabase
                .from('email_domains')
                .update({ good_pattern:local })
                .eq('domain',domain);
            }
            break;
          }
          if (vr2.rejected) break;
        }
      }

      if (emailToUse) {
        results.push({
          name:            a.name,
          institution:     uni.name,
          email:           emailToUse,
          verified:        isCatchall? 'Maybe': verifiedFlag,
          orcid:           a.orcid,
          last_verified_at:domData.last_verified_at,
          last_failed_at:  domData.last_failed_at,
        });
        if (results.length>=10) break;
      }
    }
    if (results.length>=10) break;
  }

  console.timeEnd('[total]');
  return res.status(200).json(results);
}
