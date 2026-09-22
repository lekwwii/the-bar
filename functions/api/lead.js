import '../../lead-contract.js';
const C = globalThis.LeadContract;
const MAX_BODY = 16384;
const MAX_ACK = 2048;
const UPSTREAM_MS = 40000;
const HEADERS = {
  'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer',
  'Cross-Origin-Resource-Policy':'same-origin', 'X-Robots-Tag':'noindex, nofollow'
};
function response(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {status, headers:{...HEADERS, ...extra}});
}
function fail(code, status) { return response(C.error(code), status); }
async function boundedText(stream, max, signal) {
  if (!stream) throw new Error('BODY');
  const reader = stream.getReader();
  let size = 0; const parts = [];
  const cancel = () => { reader.cancel().catch(() => {}); };
  signal.addEventListener('abort', cancel, {once:true});
  try {
    for (;;) {
      if (signal.aborted) throw new Error('TIMEOUT');
      const {done, value} = await reader.read();
      if (signal.aborted) throw new Error('TIMEOUT');
      if (done) break;
      size += value.byteLength;
      if (size > max) { cancel(); throw new Error('SIZE'); }
      parts.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    parts.forEach(p => { bytes.set(p, offset); offset += p.length; });
    return new TextDecoder('utf-8', {fatal:true}).decode(bytes);
  } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
}
function config(env, production) {
  const expectedPin = production ? env.APPS_SCRIPT_PRODUCTION_ENDPOINT_SHA256 : env.APPS_SCRIPT_TEST_ENDPOINT_SHA256;
  if (production ?
      (env.LEAD_PRODUCTION_ENABLED !== 'true' || env.LEAD_PREVIEW_BRANCH || !['test','real'].includes(env.LEAD_RECORD_TYPE)) :
      (env.LEAD_PREVIEW_BRANCH !== 'codex/measurement-mvp' || env.LEAD_RECORD_TYPE !== 'test' || env.LEAD_PRODUCTION_ENABLED === 'true')) return null;
  if (typeof env.LEAD_ADAPTER_SECRET !== 'string' || env.LEAD_ADAPTER_SECRET.length < 32 ||
      env.LEAD_ADAPTER_SECRET.length > 256 || !/^[a-f0-9]{64}$/.test(expectedPin || '')) return null;
  try {
    const u = new URL(env.APPS_SCRIPT_ENDPOINT);
    if (u.protocol !== 'https:' || u.hostname !== 'script.google.com' || u.port || u.username || u.password ||
        u.search || u.hash || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname)) return null;
    return {url:u.href, pin:expectedPin};
  } catch { return null; }
}
async function upstream(endpoint, body, signal, fetcher) {
  let url = endpoint;
  let options = {method:'POST', headers:{'Content-Type':'application/json'}, body,
    redirect:'manual', credentials:'omit', signal};
  for (let hop = 0; hop <= 3; hop++) {
    const res = await fetcher(url, options);
    if (res.status >= 300 && res.status < 400) {
      // Never replay the authenticated POST body on 307/308 or another host.
      if (hop === 3 || ![301,302,303].includes(res.status)) throw new Error('REDIRECT');
      const location = res.headers.get('Location');
      if (!location) throw new Error('REDIRECT');
      const next = new URL(location, url);
      if (next.protocol !== 'https:' || next.hostname !== 'script.googleusercontent.com' || next.port ||
          next.username || next.password || next.hash || next.pathname !== '/macros/echo') throw new Error('REDIRECT');
      if (res.body) res.body.cancel().catch(() => {});
      url = next.href;
      options = {method:'GET', redirect:'manual', credentials:'omit', signal};
      continue;
    }
    if (!res.ok || !/^application\/json(?:\s*;|$)/i.test(res.headers.get('Content-Type') || '')) throw new Error('UPSTREAM');
    return JSON.parse(await boundedText(res.body, MAX_ACK, signal));
  }
  throw new Error('REDIRECT');
}
// Dependencies are injectable only in the local harness; onRequest uses native fetch and fixed deadlines.
export async function handleLead({request, env}, fetcher = fetch, upstreamMs = UPSTREAM_MS, bodyMs = 5000) {
  if (request.method !== 'POST') return response(C.error('METHOD'), 405, {Allow:'POST'});
  const u = new URL(request.url);
  const production = u.protocol === 'https:' && u.hostname === 'thebarcatering.cz';
  const preview = /^[a-z0-9-]+\.the-bar-95g\.pages\.dev$/.test(u.hostname) || ['127.0.0.1','localhost'].includes(u.hostname);
  if (env.LEAD_ALLOWED_ORIGIN !== u.origin || (!production && !preview)) return fail('UNAVAILABLE', 503);
  if (u.pathname !== '/api/lead' || u.search) return fail('VALIDATION', 400);
  const origin = request.headers.get('Origin');
  if (origin !== u.origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') return fail('ORIGIN', 403);
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('Content-Type') || '') ||
      request.headers.has('Content-Encoding')) return fail('CONTENT_TYPE', 415);
  const length = request.headers.get('Content-Length');
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY)) return fail('BODY_SIZE', 413);
  const bodyController = new AbortController();
  const bodyTimer = setTimeout(() => bodyController.abort(), bodyMs);
  let payload;
  try {
    payload = JSON.parse(await boundedText(request.body, MAX_BODY, bodyController.signal));
    if (!C.validRequest(payload)) return fail('VALIDATION', 400);
  } catch (e) { return fail(e.message === 'SIZE' ? 'BODY_SIZE' : 'VALIDATION', e.message === 'SIZE' ? 413 : 400); }
  finally { clearTimeout(bodyTimer); }
  const endpoint = config(env, production);
  if (!endpoint) return fail('UNAVAILABLE', 503);
  const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint.url))))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  if (fingerprint !== endpoint.pin) return fail('UNAVAILABLE', 503);
  if (env.LEAD_RECORD_TYPE === 'test' &&
      (payload.fields.name !== 'SYNTHETIC PASS4' || payload.fields.email !== 'synthetic@lead.invalid')) return fail('VALIDATION', 400);
  const controller = new AbortController(); let timer;
  const deadline = new Promise((_, reject) => { timer = setTimeout(() => {
    controller.abort(); reject(new Error('TIMEOUT'));
  }, upstreamMs); });
  try {
    const result = await Promise.race([upstream(endpoint.url,
      JSON.stringify({adapter_secret:env.LEAD_ADAPTER_SECRET, request:payload}), controller.signal, fetcher), deadline]);
    if (C.validAck(result, payload.submission_key, env.LEAD_RECORD_TYPE)) return response(result);
    if (C.validError(result)) {
      if (result.error_code === 'KEY_CONFLICT') return fail('KEY_CONFLICT', 409);
      if (result.error_code === 'VALIDATION') return fail('VALIDATION', 422);
      return fail('UNCONFIRMED', 503);
    }
    return fail('UNCONFIRMED', 502);
  } catch { return fail('UNCONFIRMED', controller.signal.aborted ? 504 : 502); }
  finally { clearTimeout(timer); controller.abort(); }
}
export function onRequest(context) { return handleLead(context); }
