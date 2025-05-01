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
const RAILWAY_BASE   = process.env.RAILWAY_BASE!;

// ─── Cool-off after grey-list ───────────────────────────────────────────────────
const COOL_OFF_MS = 5 * 60 * 1000; // 5 minutes

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
  let mxFound: boolean;
  try {
    mxFound = await testCatchallWithRailway(domain);
  } catch {
    mxFound = false;
  }
  try {
    await supabase.from('metrics').insert({ event_type:'mx_lookup', domain, mx_found:mxFound });
  } catch (e) {
    console.error('[logMetric mx_lookup] failed:', e);
  }

  try {
    const { data } = await axios.post(
      `${RAILWAY_BASE}/verify`,
      { email:`${local}@${domain}`, domain },
      { timeout: 10000 }
    );
    return { ...data, latencyMs: Date.now() - t0 };
  } catch (e: any) {
    return { ok:false, rejected:false, reason:'network_error', error:e.message, latencyMs: Date.now() - t0 };
  }
}

async function testCatchallWithRailway(domain: string) {
  try {
    const { data } = await axios.post(
      `${RAILWAY_BASE}/test-catchall`,
      { domain },
      { timeout: 10000 }
    );
    return data.ok === true;
  } catch {
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

// ─── Serper.dev lookup ──────────────────────────────────────────────────────────
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

// ─── OpenAlex author fetch ──────────────────────────────────────────────────────
async function getAuthorsFromOpenAlex(rorId: string, topicId?: string, perPage = 5) {
  console.log(`[OpenAlex] start fetch for ROR=${rorId}${topicId?` topic=${topicId}`:''}`);
  try {
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
    return res.data.results.map((a:any)=>({
      name: a.display_name,
      orcid: a.orcid,
      works_count: a.works_count,
      h_index: a.summary_stats.h_index
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

  // load defaults
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
    const { name: uniName, domain, openalex_ror: rorId } = uni;
    console.log(`[handler] university: ${uniName} (${domain})`);

    // fetch domain cache + cool-off timestamp
    let { data: domData } = await supabase
      .from('email_domains')
      .select('is_catchall,good_pattern,last_verified_at,last_failed_at,next_probe_at')
      .eq('domain', domain)
      .maybeSingle();

    if (!domData) {
      const isCatchall = await testCatchallWithRailway(domain);
      domData = {
        is_catchall:    isCatchall,
        good_pattern:   null,
        last_verified_at: isCatchall ? new Date().toISOString() : null,
        last_failed_at: !isCatchall ? new Date().toISOString() : null,
        next_probe_at:  null
      };
      await supabase.from('email_domains').insert({
        domain,
        is_catchall:    domData.is_catchall,
        good_pattern:   domData.good_pattern,
        last_verified_at: domData.last_verified_at,
        last_failed_at: domData.last_failed_at,
        next_probe_at:  domData.next_probe_at
      });
      console.log(`[handler] initialized cache for ${domain}`);
    }

    // skip if still in cool-off
    if (domData.next_probe_at && new Date(domData.next_probe_at) > new Date()) {
      console.log(`[handler] skipping ${domain}, cool-off until ${domData.next_probe_at}`);
      continue;
    }

    // pull authors
    const authors = await getAuthorsFromOpenAlex(rorId, topicId, 5);
    console.log(`[loop] authors for ${uniName}:`, authors.map(a=>a.name));

    // per-author
    for (const a of authors) {
      console.log(`[handler] processing author: ${a.name}`);
      if (!a.name.includes(' ')) continue;
      const [firstName, ...rest] = a.name.split(' ');
      const lastName = rest[rest.length-1];
      if (firstName.length < 2 || lastName.length < 2) continue;

      let emailToUse: string|null = null;
      let verifiedFlag: 'Yes'|'Maybe' = 'Yes';

      // 1) Serper lookup
      const hit = await lookupWithSerper(a.name, domain);
      if (hit) {
        const [local, foundDom] = hit.split('@');
        console.log(`[verify] calling verifyEmailWithRailway(local="${local}", domain="${foundDom}")`);
        const vr = await verifyEmailWithRailway(local, foundDom);
        console.log('[verifyResult]', vr);

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
          // GREY-LIST: set cool-off and skip rest of this domain
          console.warn(`[verify] grey-list on ${domain}—cooling off`);
          await supabase
            .from('email_domains')
            .update({ next_probe_at: new Date(Date.now()+COOL_OFF_MS).toISOString() })
            .eq('domain', domain);
          break uniLoop;
        }
        // else hard-reject → just continue guessing
      }

      // 2) fallback to guessing
      if (!emailToUse) {
        const candidates = generateEmailCandidates(firstName, lastName, domain, domData.good_pattern);
        for (const c of candidates) {
          const [local] = c.split('@');
          console.log(`[verify] trying candidate: ${c}`);
          const vr2 = await verifyEmailWithRailway(local, domain);
          console.log('[verifyResult]', vr2);

          await logMetric({
            eventType:    'smtp_verification',
            domain,
            patternTried: local,
            smtpSuccess:  vr2.ok,
            latencyMs:    vr2.latencyMs,
            errorMessage: vr2.error,
            reason:       vr2.reason
          });

          if (vr2.ok) {
            emailToUse   = c;
            verifiedFlag = 'Yes';
            if (!domData.good_pattern) {
              await supabase
                .from('email_domains')
                .update({ good_pattern: local })
                .eq('domain', domain);
              console.log(`[cache] cached new good_pattern for ${domain}: ${local}`);
            }
            break;
          } else if (!vr2.rejected) {
            // GREY-LIST on guess → cool-off + skip domain
            console.warn(`[verify] grey-list on ${domain}—cooling off`);
            await supabase
              .from('email_domains')
              .update({ next_probe_at: new Date(Date.now()+COOL_OFF_MS).toISOString() })
              .eq('domain', domain);
            break uniLoop;
          }
          // else hard reject → try next pattern
        }
      }

      // 3) record result
      if (emailToUse) {
        console.log('[result] adding lead:', { name:a.name, institution:uniName, email:emailToUse, verified:isCatchall?'Maybe':verifiedFlag });
        results.push({
          name:            a.name,
          institution:     uniName,
          email:           emailToUse,
          verified:        domData.is_catchall ? 'Maybe' : verifiedFlag,
          orcid:           a.orcid,
          last_verified_at:domData.last_verified_at,
          last_failed_at:  domData.last_failed_at
        });
        if (results.length >= 10) {
          console.log('[loop] reached 10 results, breaking');
          break uniLoop;
        }
      }
    }
  }

  console.log('[handler] final results:', results);
  console.timeEnd('[total]');
  return res.status(200).json(results);
}
