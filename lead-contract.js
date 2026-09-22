/* Shared request/receipt contract. Also copied byte-for-byte to Contract.gs. */
(function (root) {
  'use strict';
  const VERSION = 'v1';
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  const COMMON = ['schema_version', 'submission_key', 'form_id', 'locale', 'event_type', 'fields'];
  const FIELDS = {
    contact_message: ['type', 'name', 'email', 'message'],
    quote_request: ['name', 'phone', 'email', 'date', 'eventType', 'guests', 'duration', 'addons', 'price', 'note']
  };
  function exact(value, keys) {
    return !!value && typeof value === 'object' && !Array.isArray(value) &&
      Object.keys(value).length === keys.length && keys.every(k => Object.prototype.hasOwnProperty.call(value, k));
  }
  function text(value, min, max, multiline) {
    return typeof value === 'string' && value.length >= min && value.length <= max &&
      value.trim().length >= min && !(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value);
  }
  function validRequest(r) {
    if (!exact(r, COMMON) || r.schema_version !== VERSION || !UUID.test(r.submission_key) ||
        !['cs', 'en'].includes(r.locale) || !Object.prototype.hasOwnProperty.call(FIELDS,r.form_id) ||
        !['corporate', 'wedding', 'private', 'unknown'].includes(r.event_type) ||
        !exact(r.fields, FIELDS[r.form_id])) return false;
    const f = r.fields;
    if (!text(f.name, 1, 120) || !text(f.email, 3, 254) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(f.email)) return false;
    if (r.form_id === 'contact_message') return r.event_type === 'unknown' && f.type === 'message' && text(f.message, 1, 4000, true);
    return r.event_type !== 'unknown' && text(f.phone, 3, 40) && /^[+()\d .-]+$/.test(f.phone) &&
      text(f.date, 0, 40) && text(f.eventType, 1, 120) &&
      Number.isInteger(f.guests) && f.guests >= 1 && f.guests <= 10000 &&
      Number.isInteger(f.duration) && f.duration >= 1 && f.duration <= 24 &&
      text(f.addons, 0, 1000) && text(f.price, 1, 80) && text(f.note, 0, 4000, true);
  }
  function canonical(r) {
    const f = {}; FIELDS[r.form_id].forEach(k => { f[k] = r.fields[k]; });
    return JSON.stringify({schema_version:r.schema_version, submission_key:r.submission_key,
      form_id:r.form_id, locale:r.locale, event_type:r.event_type, fields:f});
  }
  function validAck(a, key, recordType) {
    if (!exact(a, ['accepted', 'lead_id', 'accepted_at', 'record_type', 'schema_version', 'submission_key'])) return false;
    return a.accepted === true && a.schema_version === VERSION && a.submission_key === key && UUID.test(a.submission_key) &&
      typeof a.lead_id === 'string' && a.lead_id.startsWith('lead_') && UUID.test(a.lead_id.slice(5)) &&
      ['test','real'].includes(a.record_type) && (!recordType || a.record_type === recordType) &&
      typeof a.accepted_at === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(a.accepted_at) &&
      Number.isFinite(Date.parse(a.accepted_at)) && new Date(a.accepted_at).toISOString() === a.accepted_at;
  }
  const ERRORS = ['VALIDATION','KEY_CONFLICT','TEMPORARY','UNAUTHORIZED'];
  function validError(a) {
    return exact(a, ['accepted','error_code','schema_version']) && a.accepted === false &&
      a.schema_version === VERSION && ERRORS.includes(a.error_code);
  }
  function error(code) { return {accepted:false, error_code:code, schema_version:VERSION}; }
  const api = {VERSION, UUID, FIELDS, exact, validRequest, canonical, validAck, validError, error};
  root.LeadContract = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
