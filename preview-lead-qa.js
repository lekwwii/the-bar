'use strict';
(function(){
 const C=window.LeadContract;
 function body(n,form='quote_request',locale='cs'){
  return {schema_version:'v1',submission_key:'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),form_id:form,locale,event_type:form==='contact_message'?'unknown':'wedding',fields:form==='contact_message'?
   {type:'message',name:'SYNTHETIC PASS4',email:'synthetic@lead.invalid',message:'SYNTHETIC MESSAGE'}:
   {name:'SYNTHETIC PASS4',phone:'000000000',email:'synthetic@lead.invalid',date:'',eventType:'Svatba',guests:80,duration:4,addons:'',price:'TEST 0',note:'SYNTHETIC NOTE'}};
 }
 let sent=0,index=0,busy=false,first=null,lossReceipt=null;
 async function post(r){
  if(sent>=11)throw new Error('BUDGET');sent++;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),48000);
  try{
   const res=await fetch('/api/lead',{method:'POST',mode:'same-origin',credentials:'same-origin',redirect:'error',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(r),signal:controller.signal});
   if(!/^application\/json(?:\s*;|$)/i.test(res.headers.get('Content-Type')||''))throw new Error('MIME');
   const value=await res.json();if(value.accepted===true&&!res.ok)throw new Error('STATUS');return {res,value};
  }finally{clearTimeout(timer);}
 }
 function accepted(value,r){if(!C.validAck(value,r.submission_key,'test'))throw new Error('NOT_ACCEPTED');}
 const steps=[
  ['B01 quote cs',async()=>{const r=body(401);const x=await post(r);accepted(x.value,r);first=x.value;}],
  ['B02 same-key retry',async()=>{const r=body(401);const x=await post(r);accepted(x.value,r);if(JSON.stringify(x.value)!==JSON.stringify(first))throw new Error('RECEIPT');}],
  ['B03 contact en',async()=>{const r=body(402,'contact_message','en');accepted((await post(r)).value,r);}],
  ['B04 simultaneous same key - 2 POSTs',async()=>{const r=body(403);const pair=await Promise.all([post(r),post(r)]);pair.forEach(x=>accepted(x.value,r));if(JSON.stringify(pair[0].value)!==JSON.stringify(pair[1].value))throw new Error('RECEIPT');}],
  ['B05 conflicting same key',async()=>{const x=await post(body(401,'quote_request','en'));if(x.res.status!==409||x.value.accepted!==false||x.value.error_code!=='KEY_CONFLICT')throw new Error('CONFLICT');}],
  ['B06 wrong schema',async()=>{const r=body(404);r.schema_version=1;const x=await post(r);if(x.res.status!==400||x.value.accepted!==false)throw new Error('VALIDATION');}],
  ['B07 quote en',async()=>{const r=body(405,'quote_request','en');accepted((await post(r)).value,r);}],
  ['B08 contact cs',async()=>{const r=body(406,'contact_message','cs');accepted((await post(r)).value,r);}],
  ['B09 discard accepted response at consumer',async()=>{const r=body(407,'contact_message','en');const x=await post(r);accepted(x.value,r);lossReceipt=x.value;document.getElementById('status').textContent='Unconfirmed at simulated consumer; retry only with the same key.';}],
  ['B10 retry discarded response',async()=>{const r=body(407,'contact_message','en');const x=await post(r);accepted(x.value,r);if(JSON.stringify(x.value)!==JSON.stringify(lossReceipt))throw new Error('RECEIPT');}]
 ];
 const send=document.getElementById('send'),approved=document.getElementById('approved');
 const preview=location.hostname.endsWith('.the-bar-95g.pages.dev') || ['127.0.0.1','localhost'].includes(location.hostname);
 function next(){document.getElementById('next').textContent=index<steps.length?steps[index][0]:'Complete: verify 6 durable rows, 11 browser POSTs, 10 upstream POSTs, zero mail and zero production analytics.';send.disabled=!preview||!approved.checked||busy||index>=steps.length;}
 approved.onchange=next;
 send.onclick=async()=>{if(busy||!preview||!approved.checked||index>=steps.length)return;busy=true;next();
  const name=steps[index][0];try{await steps[index][1]();const li=document.createElement('li');li.textContent=name+': PASS';document.getElementById('results').appendChild(li);index++;
   document.getElementById('status').textContent='Completed POSTs: '+sent+' / 11. Verify row/readback evidence before the next step.';
  }catch{document.getElementById('status').textContent='STOP - unconfirmed or failed. POSTs: '+sent+'. Preserve evidence and disable/archive; no automatic retry.';index=steps.length;}
  finally{busy=false;next();}
 };next();
})();
