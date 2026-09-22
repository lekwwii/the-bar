/* One browser acceptance/analytics path; pending contact data stays in memory only. */
(function (root) {
  'use strict';
  const C = root.LeadContract;
  function createClient(options) {
    const attempts = new Map();
    const storage = options.storage;
    const prefix = 'thebar_lead_v1:';
    function read(form) {
      const raw = storage.getItem(prefix + form);
      if (!raw) return null;
      const m = JSON.parse(raw);
      if (!C.exact(m,['key','state']) || !C.UUID.test(m.key) || !['pending','complete'].includes(m.state)) throw new Error('RECOVERY');
      return m;
    }
    function save(form, key, state) { storage.setItem(prefix + form, JSON.stringify({key, state})); }
    function submit(input, onAccepted, onPending) {
      const form = input.form_id;
      let a = attempts.get(form);
      if (a && a.inFlight) return a.promise;
      if (a && a.complete) return Promise.resolve({state:'already_accepted'});
      if (!a) {
        try {
          const prior = read(form);
          if (prior && prior.state === 'complete') return Promise.resolve({state:'already_accepted'});
          const payload = JSON.parse(JSON.stringify({...input, schema_version:C.VERSION,
            submission_key:prior ? prior.key : options.uuid()}));
          if (!C.validRequest(payload)) return Promise.resolve({state:'invalid'});
          // Write the operational key before any dispatch. Storage failure fails closed.
          save(form,payload.submission_key,'pending');
          a = {payload, onAccepted, inFlight:false, complete:false, eligible:!prior && options.consent()};
          attempts.set(form,a);
        } catch { return Promise.resolve({state:'recovery_required'}); }
      }
      // Synchronous guard is set before fetch, awaits, UI callbacks or repeated handler calls.
      a.inFlight = true;
      a.promise = Promise.resolve().then(async function () {
        const controller = new AbortController(); let timer;
        const timeout = new Promise((_,reject) => { timer=setTimeout(() => {controller.abort();reject(new Error('TIMEOUT'));}, options.timeoutMs || 48000); });
        try {
          if (onPending) onPending();
          const ack = await Promise.race([(async function () {
            const res = await options.fetch('/api/lead', {method:'POST', mode:'same-origin', credentials:'same-origin',
              redirect:'error', cache:'no-store', headers:{'Content-Type':'application/json'},
              body:C.canonical(a.payload), signal:controller.signal});
            if (!/^application\/json(?:\s*;|$)/i.test(res.headers.get('Content-Type') || '')) throw new Error('UNCONFIRMED');
            // Same-origin adapter emits at most 2 KiB; bound unexpected response bodies too.
            const reader=res.body.getReader(); const chunks=[]; let size=0;
            const cancel=()=>{reader.cancel().catch(()=>{});};
            controller.signal.addEventListener('abort',cancel,{once:true});
            try {
              for (;;) { const v=await reader.read(); if(v.done)break; size+=v.value.length;
                if(size>2048) {reader.cancel().catch(()=>{});throw new Error('UNCONFIRMED');} chunks.push(v.value); }
            } finally { controller.signal.removeEventListener('abort',cancel); reader.releaseLock(); }
            const bytes=new Uint8Array(size); let off=0; chunks.forEach(v=>{bytes.set(v,off);off+=v.length;});
            const body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
            if (!res.ok || !C.validAck(body,a.payload.submission_key)) throw new Error(body && body.error_code === 'KEY_CONFLICT' ? 'KEY_CONFLICT' : 'UNCONFIRMED');
            return body;
          })(),timeout]);
          // Never replay analytics after a reload, rendering failure, denied consent or Test receipt.
          a.complete = true;
          let persisted = true;
          try { save(form,a.payload.submission_key,'complete'); } catch { persisted = false; }
          const eligibleAtAcceptance = a.eligible && options.consent();
          let rendered = false;
          try { a.onAccepted(ack,a.payload); rendered = true; } catch { /* Acceptance remains true; no re-POST. */ }
          if (rendered && persisted && eligibleAtAcceptance && options.consent() && ack.record_type === 'real' && options.production()) {
            try { options.emit('lead_submit',{form_id:form,locale:a.payload.locale,event_type:a.payload.event_type,schema_version:C.VERSION}); } catch { /* No replay. */ }
          }
          return {state:'accepted', acknowledgement:ack};
        } catch (e) { return {state:e.message === 'KEY_CONFLICT' ? 'conflict' : 'unconfirmed'}; }
        finally { clearTimeout(timer); controller.abort(); a.inFlight=false; }
      });
      return a.promise;
    }
    return {
      submit,
      revoke() { attempts.forEach(a => { a.eligible=false; }); },
      newRequest(form) {
        const a=attempts.get(form); const prior=read(form);
        if ((a && (!a.complete || a.inFlight)) || (prior && prior.state !== 'complete')) return false;
        attempts.delete(form); storage.removeItem(prefix+form); return true;
      }
    };
  }
  root.createLeadClient = createClient;
  if (typeof module !== 'undefined' && module.exports) module.exports = {createClient};
  if (!root.document) return;
  let allowed=false;
  try { allowed=root.localStorage.getItem('thebar_cookie_consent') === 'granted'; } catch {}
  // Preview/local hosts cannot send production events, even with saved consent.
  const client=createClient({storage:{getItem:k=>root.sessionStorage.getItem(k),setItem:(k,v)=>root.sessionStorage.setItem(k,v),removeItem:k=>root.sessionStorage.removeItem(k)},
    uuid:()=>root.crypto.randomUUID(), fetch:(...args)=>root.fetch(...args), consent:()=>allowed,
    production:()=>root.location.hostname === 'thebarcatering.cz',
    emit:(name,params)=>{if(typeof root.gtag==='function')root.gtag('event',name,params);}});
  const words={
    cs:{pending:'Odesíláme. Potvrzení může trvat až 45 sekund.',unconfirmed:'Přijetí zatím není potvrzené. Zkuste znovu stejný požadavek. Údaje zůstávají uzamčené.',conflict:'Požadavek se stejným klíčem již existuje s jinými údaji. Kontaktujte nás; nevytvářejte další kopii.',invalid:'Zkontrolujte povinné údaje a jejich délku.',recovery_required:'Nelze bezpečně uložit stav odeslání. Povolte úložiště pro tuto kartu nebo nás kontaktujte.',already_accepted:'Tento požadavek už byl přijat.',retry:'Zkusit znovu'},
    en:{pending:'Sending. Confirmation may take up to 45 seconds.',unconfirmed:'Receipt is not confirmed yet. Retry the same request. Your details remain locked.',conflict:'This request key already exists with different details. Contact us; do not create another copy.',invalid:'Check required details and their length.',recovery_required:'Cannot safely save submission state. Allow storage for this tab or contact us.',already_accepted:'This request was already accepted.',retry:'Retry'}
  };
  function locale(){return document.documentElement.lang === 'en' ? 'en' : 'cs';}
  function statusNode(button) {
    let el=document.getElementById(button.id+'-status');
    if(!el){el=document.createElement('p');el.id=button.id+'-status';el.setAttribute('role','status');el.setAttribute('aria-live','polite');button.insertAdjacentElement('afterend',el);}
    return el;
  }
  root.LeadForms={
    locale,
    setConsent(granted){allowed=granted===true;if(!allowed)client.revoke();},
    newRequest(form){if(client.newRequest(form))root.location.reload();},
    submit(form,eventType,fields,button,onAccepted){
      if(button.dataset.leadBusy==='true')return Promise.resolve({state:'busy'});
      button.dataset.leadBusy='true';button.disabled=true;
      const lang=locale(), status=statusNode(button);
      const container=form==='quote_request'?document.querySelector('.wiz-modal-left'):document.getElementById('contact-form-wrap');
      const controls=container?Array.from(container.querySelectorAll('input,textarea,select')):[];
      return client.submit({form_id:form,locale:lang,event_type:eventType,fields},onAccepted,()=>{
        controls.forEach(el=>{el.disabled=true;});status.textContent=words[lang].pending;button.setAttribute('aria-busy','true');
      }).then(result=>{
        button.dataset.leadBusy='false';button.removeAttribute('aria-busy');
        if(result.state!=='accepted') {
          status.textContent=words[lang][result.state]||words[lang].unconfirmed;
          button.disabled=['conflict','already_accepted'].includes(result.state);
          if(result.state==='unconfirmed')button.textContent=words[lang].retry;
          if(['invalid','recovery_required'].includes(result.state))controls.forEach(el=>{el.disabled=false;});
        } else {status.textContent='';}
        return result;
      });
    }
  };
})(globalThis);
