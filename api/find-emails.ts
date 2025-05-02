import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient }                       from '@supabase/supabase-js';
import axios                                   from 'axios';

// ─── Supabase setup ────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase          = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── External API Keys ─────────────────────────────────────────────────────────
const SERPER_API_KEY   = process.env.SERPER_API_KEY!;
const TRUELIST_API_KEY = process.env.TRUELIST_API_KEY!;

// ─── Helpers & constants ───────────────────────────────────────────────────────
const EMAIL_PATTERNS = [
  '{firstName}.{lastName}@{domain}',
  '{firstName}{lastName}@{domain}',
  '{firstInitial}{lastName}@{domain}',
  '{firstName}.{lastInitial}@{domain}',
  '{firstName}@{domain}',
];

// ─── Logging metrics ───────────────────────────────────────────────────────────
async function logMetric(params: {
  eventType:     string;
  domain?:       string;
  patternTried?: string;
  smtpSuccess?:  boolean;
  latencyMs?:    number;
  errorMessage?: string;
  reason?:       string;
}) {
  try {
    await supabase
      .from('metrics')
      .insert({
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

// ─── Truelist Email Verification ──────────────────────────────────────────────
async function verifyEmailWithTruelist(email: string) {
  const t0 = Date.now();
  try {
    const { data } = await axios.post(
      'https://api.truelist.io/api/v1/verify_inline',
      null,
      {
        headers: {
          Authorization: `Bearer ${TRUELIST_API_KEY}`,
          'Content-Type': 'application/json'
        },
        params: { email },
        timeout: 10000
      }
    );
    const result = data.emails[0];

    // cache catch-all flag for every domain tested
    await supabase
      .from('email_domains')
      .upsert(
        { domain: result.domain, is_catchall: result.email_sub_state === 'accept_all' },
        { onConflict: 'domain' }
      );

    return {
      ok:       result.email_state === 'ok',
      state:    result.email_state,
      reason:   result.email_sub_state,
      latencyMs: Date.now() - t0
    };
  } catch (e: any) {
    console.error('[verifyEmailWithTruelist] error:', e.message);
    return { ok: false, state: 'unknown', reason: 'network_error', latencyMs: Date.now() - t0 };
  }
}

// ─── Candidate pattern generator ──────────────────────────────────────────────
function generateEmailCandidates(
  firstName: string,
  lastName:  string,
  domain:    string,
  goodPattern?: string
): string[] {
  firstName = firstName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,'').trim();
  lastName  = lastName .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,'').trim();

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

// ─── Serper.dev lookup ─────────────────────────────────────────────────────────
async function lookupWithSerper(name: string, domain: string): Promise<string|null> {
  console.log(`[search] Serper query: "${name} ${domain} email"`);
  try {
    const { data } = await axios.post(
      'https://google.serper.dev/search',
      { q: `${name} ${domain} email` },
      { headers:{ 'X-API-KEY':SERPER_API_KEY } }
    );
    const txt = (data.organic||[]).map((o:any)=>`${o.title} ${o.snippet}`).join(' ');
    const found = txt.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/)?.[0] || null;
    console.log(`[Serper] found email: ${found}`);
    return found;
  } catch (e:any) {
    console.warn('[Serper] error:', e.message);
    return null;
  }
}

// ─── OpenAlex author fetch ─────────────────────────────────────────────────────
async function getAuthorsFromOpenAlex(
  rorId:   string,
  topicId?:string,
  perPage = 5
) {
  console.log(`[OpenAlex] start fetch for ROR=${rorId}${topicId?` topic=${topicId}`:''}`);
  try {
    const filters = [`last_known_institutions.ror:${rorId}`];
    if (topicId) filters.push(`topics.id:${topicId}`);
    filters.push(`works_count:<50`, `summary_stats.h_index:<15`, `summary_stats.2yr_mean_citedness:>1`);
    const url = `https://api.openalex.org/authors`
              + `?filter=${filters.join(',')}`
              + `&select=display_name,orcid,last_known_institutions,works_count,summary_stats`
              + `&per_page=${perPage}`;
    const t0  = Date.now();
    const res = await axios.get(url);
    console.log(`[OpenAlex] fetched ${res.data.results.length} authors in ${Date.now()-t0}ms`);
    return res.data.results.map((a:any)=>({
      name:        a.display_name,
      orcid:       a.orcid,
      works_count: a.works_count,
      h_index:     a.summary_stats.h_index
    }));
  } catch (e:any) {
    console.error('[OpenAlex] error:', e.message);
    await logMetric({ eventType:'openalex_error', errorMessage:e.message });
    return [];
  }
}

// ─── API handler ───────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.time('[total]');
  if (req.method !== 'GET') {
    console.log('[handler] wrong method:', req.method);
    return res.status(405).json({ error:'Method not allowed' });
  }

  console.log('[handler] loading universities…');
  const { data: unis, error: uniErr } = await supabase
    .from('universities')
    .select('id,name,domain,openalex_ror')
    .eq('is_default', true);
  if (uniErr || !unis) {
    console.error('[handler] supabase error:', uniErr);
    return res.status(500).json({ error:'Failed loading universities' });
  }
  console.log(`[handler] loaded ${unis.length} defaults`);

  const topicId = (req.query.topicId as string) || undefined;
  console.log('[handler] topic filter:', topicId);

  const results: any[] = [];

  uniLoop:
  for (const uni of unis) {
    console.log(`[handler] university: ${uni.name} (${uni.domain})`);

    const authors = await getAuthorsFromOpenAlex(uni.openalex_ror, topicId, 5);
    console.log(`[loop] authors for ${uni.name}:`, authors.map(a => a.name));

    for (const a of authors) {
      console.log(`[handler] processing author: ${a.name}`);
      if (!a.name.includes(' ')) continue;
      const [firstName, ...rest] = a.name.split(' ');
      const lastName = rest[rest.length - 1];
      if (firstName.length < 2 || lastName.length < 2) continue;

      // 1) Serper lookup
      const hit = await lookupWithSerper(a.name, uni.domain);
      if (hit) {
        console.log(`[verify] trying serper result: ${hit}`);
        const vr = await verifyEmailWithTruelist(hit);
        console.log('[verifyResult]', vr);
        await logMetric({
          eventType:    'smtp_verification',
          domain:       uni.domain,
          patternTried: hit.split('@')[0],
          smtpSuccess:  vr.ok,
          latencyMs:    vr.latencyMs,
          reason:       vr.reason
        });
        if (vr.ok || vr.state === 'risky') {
          results.push({
            name:            a.name,
            institution:     uni.name,
            email:           hit,
            verified:        vr.state,
            reason:          vr.reason,
            orcid:           a.orcid,
            last_verified_at: new Date().toISOString(),
            last_failed_at:   null
          });
          if (results.length >= 4) break uniLoop;
        }
        await new Promise(r => setTimeout(r, 10000));
        continue; // skip fallback if serper hit
      }

      // 2) fallback → guessing
      for (const candidate of generateEmailCandidates(firstName, lastName, uni.domain)) {
        console.log(`[verify] trying candidate: ${candidate}`);
        const vr = await verifyEmailWithTruelist(candidate);
        console.log('[verifyResult]', vr);
        await logMetric({
          eventType:    'smtp_verification',
          domain:       uni.domain,
          patternTried: candidate.split('@')[0],
          smtpSuccess:  vr.ok,
          latencyMs:    vr.latencyMs,
          reason:       vr.reason
        });
        if (vr.ok || vr.state === 'risky') {
          results.push({
            name:            a.name,
            institution:     uni.name,
            email:           candidate,
            verified:        vr.state,
            reason:          vr.reason,
            orcid:           a.orcid,
            last_verified_at: new Date().toISOString(),
            last_failed_at:   null
          });
          if (results.length >= 4) break uniLoop;
          break;
        }
        await new Promise(r => setTimeout(r, 10000));
      }
    }
  }

  console.log('[handler] final results:', results);
  console.timeEnd('[total]');
  return res.status(200).json(results);
}
