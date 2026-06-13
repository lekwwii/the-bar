history.scrollRestoration = 'manual';
if (window.location.hash) history.replaceState(null, '', location.pathname + location.search);
window.scrollTo(0, 0);
window.addEventListener('load', function(){ window.scrollTo(0, 0); });

// iOS Safari: body overflow:hidden doesn't prevent scroll — use position:fixed technique instead
var _lockScrollY = 0;
function _lockScroll() {
  _lockScrollY = window.scrollY;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + _lockScrollY + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
}
function _unlockScroll() {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  window.scrollTo(0, _lockScrollY);
}

function scrollToKontakt(){
  var section=document.querySelector('#contact');
  if(!section)return;
  var navH=document.querySelector('nav')?document.querySelector('nav').offsetHeight:80;
  var top=section.getBoundingClientRect().top+window.pageYOffset-navH+5;
  window.scrollTo({top:top,behavior:'smooth'});
}
function scrollToWizard(){
  var section=document.querySelector('.wiz-section')||document.querySelector('#services');
  if(!section)return;
  var navH=document.querySelector('nav')?document.querySelector('nav').offsetHeight:80;
  var head=section.querySelector('.wiz-head')||section;
  var top=head.getBoundingClientRect().top+window.pageYOffset-navH-16;
  window.scrollTo({top:top,behavior:'smooth'});
}
function scrollToAbout(){
  var section=document.querySelector('#about');
  if(!section)return;
  var top=section.getBoundingClientRect().top+window.pageYOffset;
  window.scrollTo({top:top,behavior:'smooth'});
}
function submitContactForm(){
  var name=document.getElementById('cf-name').value.trim();
  var email=document.getElementById('cf-email').value.trim();
  var message=document.getElementById('cf-message').value.trim();
  if(!name||!email||!message){
    var fw=document.getElementById('contact-form-wrap');
    fw.style.borderColor='rgba(200,169,106,0.5)';
    setTimeout(function(){fw.style.borderColor='rgba(255,255,255,0.08)';},2000);
    return;
  }
  fetch('https://script.google.com/macros/s/AKfycbyfsOyNA4LC2kmg7OhByz8E1yK7OVQAxChEcCjvyPEd0ftjXmtyePrLvNGbp9-klwYq/exec',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'message',name:name,email:email,message:message})});
  var fw=document.getElementById('contact-form-wrap');
  var btn=document.getElementById('cf-submit');
  fw.style.transition='opacity 0.3s'; fw.style.opacity='0';
  btn.style.transition='opacity 0.3s'; btn.style.opacity='0';
  setTimeout(function(){
    fw.style.border='none'; fw.style.opacity='1';
    fw.innerHTML='<div style="padding:32px 0;"><div style="font-family:\'Cormorant Garamond\',serif;font-weight:200;font-size:34px;color:#f5f0e8;margin-bottom:10px;">'+(window.t?window.t('contact.formSuccess.title'):'Zpráva odeslána.')+'</div><div style="font-size:11px;font-family:\'Inter\',sans-serif;font-weight:300;color:rgba(245,240,232,0.3);letter-spacing:0.05em;">'+(window.t?window.t('contact.formSuccess.sub'):'Ozveme se co nejdříve na váš email.')+'</div></div>';
    btn.style.display='none';
  },350);
}

/* ─── */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "emberCount": 150,
  "emberDrift": 0.9,
  "gold": "#C8A96A",
  "bg": "#0D1117",
  "heroStyle": "solid"
}/*EDITMODE-END*/;

// NAV scrolled
const nav = document.getElementById('nav');
if (nav) {
  var _navTicking = false;
  window.addEventListener('scroll', function() {
    if (_navTicking) return;
    _navTicking = true;
    requestAnimationFrame(function() {
      nav.classList.toggle('scrolled', window.scrollY > 40);
      _navTicking = false;
    });
  }, { passive: true });
}

// ---------- COCKTAILS DATA ----------
const cocktails = [
  {n:'LANA\u2019S KISS', base:'VODKA', ing:'vodka · cranberry · rose · lemon', sw:3, so:3, st:2},
  {n:'M\u00DAZA', base:'VODKA', ing:'vodka · pineapple · vanilla · lemon', sw:1, so:3, st:3},
  {n:'GALAXY', base:'VODKA', ing:'vodka · peach · passion fruit · lychee', sw:2, so:2, st:2},
  {n:'BLAZE', base:'WHISKEY', ing:'whiskey · cinnamon · apple · ginger beer', sw:3, so:2, st:2},
  {n:'EMBER', base:'BOURBON', ing:'bourbon · vermouth · nut syrup · angostura', sw:1, so:4, st:4},
  {n:'CLOUD', base:'GIN', ing:'gin · passion fruit · egg white · cinnamon', sw:3, so:2, st:3},
  {n:'COCO EDEN', base:'GIN', ing:'gin · limoncello · elderflower · coconut', sw:2, so:2, st:3},
  {n:'LA PRIMA NOTTE', base:'TEQUILA', ing:'tequila · agave · lychee · lemon', sw:2, so:3, st:2},
  {n:'FUEGO', base:'MEZCAL', ing:'tequila · mezcal · passion fruit · simple syrup', sw:2, so:4, st:3},
  {n:'DRIZZLE', base:'RUM', ing:'rum · cucumber · lychee · cranberry', sw:2, so:2, st:2},
  {n:'TWISTED CANDY', base:'RUM', ing:'rum · cherry · raspberry · pineapple', sw:4, so:2, st:2},
  {n:'BUBBLE TROUBLE', base:'PROSECCO', ing:'basil · peach · lemon · prosecco', sw:2, so:3, st:2}
];

const glassIcon = `<svg width="62" height="62" viewBox="0 0 62 62" fill="none" stroke="#C8A96A" stroke-width=".6" opacity=".6">
  <path d="M14 14 L48 14 L31 38 Z"/>
  <path d="M31 38 L31 52"/>
  <path d="M20 52 L42 52"/>
  <circle cx="31" cy="10" r="1.5" fill="#C8A96A"/>
</svg>`;

function pips(val){
  let s = '';
  for (let i=0;i<5;i++) s += `<div class="pip${i<val?' on':''}"></div>`;
  return s;
}






// Mobile menu
const hamburgerBtn = document.querySelector('.hamburger');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileClose');
function openMobileMenu(){
  mobileOverlay.classList.add('open');
  _lockScroll();
  const spans = hamburgerBtn.querySelectorAll('span');
  spans[0].style.transform='translateY(6px) rotate(45deg)';
  spans[1].style.opacity='0';
  spans[2].style.transform='translateY(-6px) rotate(-45deg)';
}
function closeMobileMenu(){
  mobileOverlay.classList.remove('open');
  _unlockScroll();
  hamburgerBtn.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='';});
}
hamburgerBtn.addEventListener('click',()=>{
  mobileOverlay.classList.contains('open')?closeMobileMenu():openMobileMenu();
});
mobileClose.addEventListener('click',closeMobileMenu);
mobileOverlay.querySelectorAll('.mobile-overlay__link').forEach(l=>l.addEventListener('click',closeMobileMenu));



// ---------- TWEAKS ----------
const tweaksEl = document.getElementById('tweaks');
function applyTweaks(){
  document.documentElement.style.setProperty('--gold', TWEAK_DEFAULTS.gold);
  document.documentElement.style.setProperty('--bg', TWEAK_DEFAULTS.bg);
  emberCount = +TWEAK_DEFAULTS.emberCount;
  emberDrift = +TWEAK_DEFAULTS.emberDrift;

}
function bindTweaks(){
  const bind = (id,key,coerce)=>{
    const el = document.getElementById(id);
    if(!el)return;
    el.value = TWEAK_DEFAULTS[key];
    el.addEventListener('input',()=>{
      TWEAK_DEFAULTS[key] = coerce ? coerce(el.value) : el.value;
      applyTweaks();
      window.parent.postMessage({type:'__edit_mode_set_keys',edits:{[key]:TWEAK_DEFAULTS[key]}},'*');
    });
  };
  bind('tw-gold','gold');
  bind('tw-bg','bg');
}
window.addEventListener('message',(e)=>{
  const d = e.data||{};
  if (d.type==='__activate_edit_mode') tweaksEl.classList.add('on');
  if (d.type==='__deactivate_edit_mode') tweaksEl.classList.remove('on');
});
bindTweaks();
applyTweaks();
window.parent.postMessage({type:'__edit_mode_available'},'*');

/* ─── */

(function(){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var children = entry.target.querySelectorAll(':scope > .apple-reveal');
        children.forEach(function(el){ el.classList.add('in-view'); });
        obs.unobserve(entry.target);
      });
    },{threshold:0.08,rootMargin:'0px 0px -60px 0px'});

    document.querySelectorAll('section').forEach(function(section){
      var kids = Array.from(section.children);
      var delay = 0;
      kids.forEach(function(child){
        if(child.tagName==='CANVAS'||child.tagName==='SCRIPT') return;
        child.classList.add('apple-reveal');
        child.style.transitionDelay = delay.toFixed(2)+'s';
        delay += 0.12;
      });
      obs.observe(section);
    });
  })();

/* ─── */

(function(){
    var phrases = ['cin-p1','cin-p2','cin-p3'].map(function(id){ return document.getElementById(id); });
    var reveal = document.getElementById('cin-reveal');
    var intro = document.getElementById('cin-intro');
    var current = -1;

    function activate(index) {
      if (current === index) return;
      phrases.forEach(function(p){ p.classList.remove('active'); });
      if (reveal) reveal.classList.remove('active');
      current = index;
      if (index >= 0 && index < 3 && phrases[index]) {
        phrases[index].classList.add('active');
        } else if (index === 99) {
        if (reveal) reveal.classList.add('active');
      } else {
      }
    }

    function setIntro(op) {
      if (!intro) return;
      intro.style.opacity = String(op);
      intro.style.pointerEvents = op > 0.05 ? 'auto' : 'none';
    }

    var section = document.querySelector('.cinematic-section');
    if (!section) return;

    var _cinTicking = false;
    window.addEventListener('scroll', function(){
      if (_cinTicking) return;
      _cinTicking = true;
      requestAnimationFrame(function() {
        var rect = section.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.5) {
          setIntro(0); activate(-1); _cinTicking = false; return;
        }
        section.style.opacity = '1';
        var scrolled = -rect.top;
        var total = section.offsetHeight - window.innerHeight;
        if (scrolled <= 0) {
          setIntro(1); activate(-1); _cinTicking = false; return;
        }
        var p = scrolled / total;
        // intro fades over first 13% of scroll, fully gone by 13%
        setIntro(p < 0.13 ? Math.max(0, 1 - p / 0.13) : 0);
        // phrases only start at 16% — clean gap after intro fully faded
        if (p < 0.16) { activate(-1); _cinTicking = false; return; }
        if (p >= 1)   { activate(99); _cinTicking = false; return; }
        // distribute phrases evenly across the remaining 84% of scroll
        var pn = (p - 0.16) / 0.84;
        if      (pn < 0.25) activate(0);
        else if (pn < 0.50) activate(1);
        else if (pn < 0.75) activate(2);
        else                activate(99);
        _cinTicking = false;
      });
    }, { passive: true });
  })();

/* ─── */

(function(){
  var hero = document.querySelector('.hero');
  if (hero) setTimeout(function(){ hero.classList.add('hero-loaded'); }, 150);

  var heroVideo = document.getElementById('heroVideo');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.play().catch(function(){});
    document.addEventListener('touchstart', function onTouch() {
      heroVideo.play().catch(function(){});
      document.removeEventListener('touchstart', onTouch);
    }, { once: true });
  }
})();

/* ─── */

(function(){
  var canvas = document.getElementById('cinSparks');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H;

  function resize(){
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var count = window.innerWidth <= 768 ? 25 : 60;
  var sparks = [];

  function Spark(init){
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 4;
    this.size = Math.random() * 2.5 + 0.5;
    this.vy = -(Math.random() * 0.13 + 0.04);
    this.vx = (Math.random() - 0.5) * 0.09;
    this.base = Math.random() * 0.4 + 0.25;
    this.twinkle = Math.random() * Math.PI * 2;
    this.twinkleSpeed = Math.random() * 0.018 + 0.004;
    this.life = init ? Math.floor(Math.random() * 380) : 0;
    this.max = Math.random() * 460 + 280;
  }

  for (var i = 0; i < count; i++) sparks.push(new Spark(true));

  var _sparksVisible = false;
  var _sparksRunning = false;

  function draw(){
    ctx.clearRect(0, 0, W, H);
    for (var j = 0; j < sparks.length; j++){
      var s = sparks[j];
      s.x += s.vx;
      s.y += s.vy;
      s.life++;
      s.twinkle += s.twinkleSpeed;
      var lr = s.life / s.max;
      var fade = lr < 0.1 ? lr / 0.1 : lr > 0.8 ? (1 - lr) / 0.2 : 1;
      var twk = 0.7 + 0.3 * Math.sin(s.twinkle);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,169,106,' + (s.base * fade * twk) + ')';
      ctx.fill();
      if (s.life >= s.max || s.y < -4) sparks[j] = new Spark(false);
    }
    if (_sparksVisible) requestAnimationFrame(draw);
    else _sparksRunning = false;
  }

  function _startSparks() {
    if (_sparksRunning) return;
    _sparksRunning = true;
    draw();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries) {
      _sparksVisible = entries[0].isIntersecting;
      if (_sparksVisible) _startSparks();
    }, { threshold: 0 }).observe(canvas);
  } else {
    _sparksVisible = true;
    _startSparks();
  }
})();

/* ─── */

(function(){
  var TYPE_KEY_MAP={wedding:'wizard.eventLabel.wedding',corporate:'wizard.eventLabel.corporate',party:'wizard.eventLabel.party'};
  var wst={typeKey:'wedding',guests:80,hours:4};
  var wizCompleted=false;
  var wizGuestsSet=false;

  function wizSetVal(id,val){
    var el=document.getElementById(id);
    if(!el)return;
    if(el.textContent===val)return;
    el.style.transition='none';
    el.textContent=val;
  }

  window.wizGoTo=function(i){
    document.querySelectorAll('.wiz-panel').forEach(function(p){p.classList.remove('active');});
    document.getElementById('wizPanel'+i).classList.add('active');
    document.querySelectorAll('.wiz-step-dot').forEach(function(d,idx){
      d.classList.remove('active','done');
      if(idx===i)d.classList.add('active');
      else if(idx<i)d.classList.add('done');
    });
    document.querySelectorAll('.wiz-conn').forEach(function(c,idx){
      c.classList.toggle('done',idx<i);
    });
  };

  window.wizSetType=function(btn,typeKey){
    document.querySelectorAll('.wiz-type-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    wst.typeKey=typeKey;
    wizSetVal('wizSType',window.t?window.t(TYPE_KEY_MAP[typeKey]):typeKey);
    wizCalc();
  };

  window.wizUpdG=function(v){
    wizGuestsSet=true;
    wst.guests=parseInt(v);
    document.getElementById('wizGNum').textContent=v;
    wizSetVal('wizSGuests',v+' '+(window.t?window.t('wizard.unit.hostu'):'hostů'));
    var pct=((v-10)/(350-10)*100).toFixed(1);
    document.getElementById('wizGFill').style.width=pct+'%';
    var g=parseInt(v);
    var team=g<=150?(window.t?window.t('wizard.team.1'):'1 barman + servis'):g<=200?(window.t?window.t('wizard.team.2'):'2 barmani + servis'):(window.t?window.t('wizard.team.3'):'3 barmani + servis');
    wizSetVal('wizSTeam',team);
    wizCalc();
  };

  window.wizUpdH=function(v){
    wst.hours=parseInt(v);
    document.getElementById('wizHNum').textContent=v;
    var u=parseInt(v)===1?(window.t?window.t('wizard.unit.hodina'):'hodina'):parseInt(v)<5?(window.t?window.t('wizard.unit.hodiny'):'hodiny'):(window.t?window.t('wizard.unit.hodin'):'hodin');
    document.getElementById('wizHUnit').textContent=u;
    wizSetVal('wizSHours',v+' '+u);
    var pct=((v-1)/(12-1)*100).toFixed(1);
    document.getElementById('wizHFill').style.width=pct+'%';
    wizCalc();
  };

  window.wizTogA=function(el){
    el.classList.toggle('active');
    wizRenderAddons();
    wizCalc();
  };

  function wizRenderAddons(){
    var c=document.getElementById('wizSAddons');
    var active=document.querySelectorAll('.wiz-addon.active');
    if(!active.length){c.innerHTML='<span class="wiz-sum-empty">'+(window.t?window.t('wizard.summary.noAddons'):'Žádné doplňky')+'<\/span>';return;}
    c.innerHTML='';
    active.forEach(function(a){
      var d=document.createElement('div');
      d.className='wiz-sum-addon-item';
      d.textContent=(a.dataset.key&&window.t)?window.t(a.dataset.key):a.dataset.name;
      c.appendChild(d);
    });
  }

  function wizRefreshSummary(){
    if(wst.typeKey){wizSetVal('wizSType',window.t?window.t(TYPE_KEY_MAP[wst.typeKey]):wst.typeKey);}
    if(wizGuestsSet){
      var g=wst.guests;
      wizSetVal('wizSGuests',g+' '+(window.t?window.t('wizard.unit.hostu'):'hostů'));
      var team=g<=150?(window.t?window.t('wizard.team.1'):'1 barman + servis'):g<=200?(window.t?window.t('wizard.team.2'):'2 barmani + servis'):(window.t?window.t('wizard.team.3'):'3 barmani + servis');
      wizSetVal('wizSTeam',team);
    }
    var h=wst.hours;
    var u=h===1?(window.t?window.t('wizard.unit.hodina'):'hodina'):h<5?(window.t?window.t('wizard.unit.hodiny'):'hodiny'):(window.t?window.t('wizard.unit.hodin'):'hodin');
    var hUnitEl=document.getElementById('wizHUnit');
    if(hUnitEl)hUnitEl.textContent=u;
    wizSetVal('wizSHours',h+' '+u);
    wizRenderAddons();
    wizCalc();
  }
  window._wizRefreshSummary=wizRefreshSummary;

  function wizCalc(){
    var g=wst.guests,h=wst.hours;
    var extra=g<=150?0:g<=200?h*250:h*500;
    var cocktails=Math.round(g*2.5);
    var addT=0;
    document.querySelectorAll('.wiz-addon.active').forEach(function(a){addT+=parseInt(a.dataset.price);});
    var total=Math.round((cocktails*140+extra+addT)/100)*100;
    if(wizGuestsSet){
      wizSetVal('wizSCockt','~'+cocktails+' '+(window.t?window.t('wizard.unit.ks'):'ks')+'*');
    }else{
      wizSetVal('wizSCockt','—');
    }
    if(wizCompleted){
      var priceStr=total.toLocaleString('cs-CZ')+' '+(window.t?window.t('currency.czk'):'Kč');
      wizSetVal('wizSTotal',priceStr);
      var mte=document.getElementById('wizModalTotalVal');
      if(mte)mte.textContent=priceStr;
    }
  }

  window.wizOpenModal=function(){
    wizCompleted=true;
    wizCalc();
    var overlay=document.getElementById('wizModalOverlay');
    var g=wst.guests,h=wst.hours;
    var extra=g<=150?0:g<=200?h*250:h*500;
    var cocktails=Math.round(g*2.5);
    var addT=0;
    var addNames=[];
    var addNamesDisplay=[];
    document.querySelectorAll('.wiz-addon.active').forEach(function(a){
      addT+=parseInt(a.dataset.price);
      addNames.push(a.dataset.name);
      addNamesDisplay.push((a.dataset.key&&window.t)?window.t(a.dataset.key):a.dataset.name);
    });
    var total=Math.round((cocktails*140+extra+addT)/100)*100;
    var team=g<=150?(window.t?window.t('wizard.team.1'):'1 barman + servis'):g<=200?(window.t?window.t('wizard.team.2'):'2 barmani + servis'):(window.t?window.t('wizard.team.3'):'3 barmani + servis');
    var u=h===1?(window.t?window.t('wizard.unit.hodina'):'hodina'):h<5?(window.t?window.t('wizard.unit.hodiny'):'hodiny'):(window.t?window.t('wizard.unit.hodin'):'hodin');
    var _t=window.t||function(k){return k;};
    var rows=[
      [_t('wizard.modal.rowType'),_t(TYPE_KEY_MAP[wst.typeKey]||'wizard.eventLabel.wedding')],
      [_t('wizard.modal.rowGuests'),g+' '+_t('wizard.unit.hostu')],
      [_t('wizard.modal.rowDuration'),h+' '+u],
      [_t('wizard.modal.rowTeam'),team],
      [_t('wizard.modal.rowCocktails'),'~'+cocktails+' '+_t('wizard.unit.ks')]
    ];
    if(addNames.length){
      var addonsHtml=addNamesDisplay.map(function(n){return '<div class="wiz-modal-addon-item">'+n+'</div>';}).join('');
      rows.push([_t('wizard.modal.rowAddons'),'<div class="wiz-modal-addons-list">'+addonsHtml+'</div>']);
    }
    var html=rows.map(function(r){return '<div class="wiz-modal-sum-row"><span class="wiz-modal-sum-k">'+r[0]+'<\/span><span class="wiz-modal-sum-v">'+r[1]+'<\/span><\/div>';}).join('');
    html+='<div class="wiz-modal-sum-total"><div class="wiz-modal-sum-total-lbl">'+_t('wizard.modal.totalLabel')+'<\/div><div id="wizModalTotalVal" class="wiz-modal-sum-total-val">'+total.toLocaleString('cs-CZ')+' '+_t('currency.czk')+'<\/div><\/div>';
    document.getElementById('wizModalSum').innerHTML=html;
    document.getElementById('wizModalForm').style.display='block';
    document.getElementById('wizSuccess').style.display='none';
    var cb=document.getElementById('gdpr-consent');if(cb){cb.checked=false;}
    var sb=document.getElementById('wiz-send-btn');if(sb){sb.disabled=true;sb.style.opacity='0.4';sb.style.cursor='not-allowed';}
    overlay.classList.add('open');
    _lockScroll();
  };

  window.wizCloseModal=function(e){
    if(!e||e.target===document.getElementById('wizModalOverlay')){
      document.getElementById('wizModalOverlay').classList.remove('open');
      _unlockScroll();
      var lp=document.querySelector('.wiz-modal-left');
      if(lp){lp.style.opacity='1';lp.style.pointerEvents='auto';}
    }
  };

  window.wizSend=function(){
    var name=document.getElementById('wizName').value.trim();
    var phone=document.getElementById('wizPhone').value.trim();
    var email=document.getElementById('wizEmail').value.trim();
    if(!name||!phone||!email){alert(window.t?window.t('wizard.validationAlert'):'Vyplňte prosím jméno, telefon a e-mail.');return;}
    var date=document.getElementById('wizDate')?document.getElementById('wizDate').value:'';
    var addons=Array.from(document.querySelectorAll('.wiz-addon.active')).map(function(a){return a.dataset.name;});
    var addonsDisplay=Array.from(document.querySelectorAll('.wiz-addon.active')).map(function(a){return (a.dataset.key&&window.t)?window.t(a.dataset.key):a.dataset.name;});
    var price=document.getElementById('wizSTotal').textContent;
    var note=document.getElementById('wizNote').value.trim();
    var team=wst.guests<=150?(window.t?window.t('wizard.team.1'):'1 barman + servis'):wst.guests<=200?(window.t?window.t('wizard.team.2'):'2 barmani + servis'):(window.t?window.t('wizard.team.3'):'3 barmani + servis');
    var u=wst.hours===1?(window.t?window.t('wizard.unit.hodina'):'hodina'):wst.hours<5?(window.t?window.t('wizard.unit.hodiny'):'hodiny'):(window.t?window.t('wizard.unit.hodin'):'hodin');
    var now=new Date();
    var timeStr=now.getDate()+'. '+(now.getMonth()+1)+'. '+now.getFullYear()+' · '+now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
    fetch('https://script.google.com/macros/s/AKfycbyfsOyNA4LC2kmg7OhByz8E1yK7OVQAxChEcCjvyPEd0ftjXmtyePrLvNGbp9-klwYq/exec',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,phone:phone,email:email,date:date,eventType:(window.translations&&window.translations.cs[TYPE_KEY_MAP[wst.typeKey]])||wst.typeKey,guests:wst.guests,duration:wst.hours,addons:addons.join(', '),price:price,note:note})});
    var overlay=document.getElementById('wizModalOverlay');
    overlay.classList.remove('open');
    _lockScroll();
    var pod=document.createElement('div');
    pod.id='podekovani-overlay';
    pod.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(8,11,16,0.97);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:24px;opacity:0;transition:opacity 0.4s ease;';
    var _tw=window.t||function(k){return k;};
    pod.innerHTML='<div style="width:56px;height:56px;border-radius:50%;border:1px solid #C8A96A;display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><polyline points="4,11 9,16 18,6" stroke="#C8A96A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div id="podekovani-name" style="font-family:\'Cormorant Garamond\',serif;font-weight:200;font-size:52px;color:#f5f0e8;letter-spacing:0.02em;text-align:center;"></div><div style="font-family:\'Inter\',sans-serif;font-size:12px;font-weight:300;color:rgba(245,240,232,0.35);letter-spacing:0.1em;text-transform:uppercase;text-align:center;">'+_tw('wizard.thankYou.sent')+'</div>';
    document.body.appendChild(pod);
    document.getElementById('podekovani-name').textContent=_tw('wizard.thankYou.greeting').replace('{name}',name);
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        pod.style.opacity='1';
      });
    });
    setTimeout(function(){
      pod.style.transition='opacity 0.5s ease';
      pod.style.opacity='0';
      setTimeout(function(){
        if(pod.parentNode)pod.parentNode.removeChild(pod);
        _unlockScroll();
        var section=document.querySelector('.wiz-section');
        if(!section)return;
        var _tc=window.t||function(k){return k;};
        section.innerHTML='<div id="wiz-confirmation" style="max-width:960px;margin:0 auto;padding:100px 48px;font-family:\'Inter\',sans-serif;opacity:0;transition:opacity 0.8s ease;"><div style="font-family:\'Cormorant Garamond\',serif;font-weight:200;font-size:48px;color:#f5f0e8;line-height:1.1;margin-bottom:14px;">'+_tc('wizard.confirmation.titleHtml')+'</div><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div style="width:18px;height:18px;border-radius:50%;border:1px solid #C8A96A;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"><polyline points="1,4 3,6 7,2" stroke="#C8A96A" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span style="font-size:11px;font-weight:300;letter-spacing:0.2em;color:rgba(200,169,106,0.7);text-transform:uppercase;">'+_tc('wizard.confirmation.sentLabel')+'</span><span id="wiz-confirm-time" style="font-size:11px;font-weight:300;color:rgba(245,240,232,0.2);"></span></div><div style="font-size:12px;font-weight:300;color:rgba(245,240,232,0.3);margin-bottom:48px;letter-spacing:0.05em;">'+_tc('wizard.confirmation.followUp')+'</div><div style="height:0.5px;background:rgba(255,255,255,0.07);margin-bottom:40px;"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0;"><div style="padding:24px 40px 24px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);border-right:0.5px solid rgba(255,255,255,0.06);"><div style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;margin-bottom:8px;">'+_tc('wizard.confirmation.labelContact')+'</div><div id="wc-name" style="font-family:\'Cormorant Garamond\',serif;font-weight:300;font-size:24px;color:#f5f0e8;"></div></div><div style="padding:24px 0 24px 40px;border-bottom:0.5px solid rgba(255,255,255,0.06);"><div style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;margin-bottom:8px;">'+_tc('wizard.confirmation.labelDate')+'</div><div id="wc-date" style="font-family:\'Cormorant Garamond\',serif;font-weight:300;font-size:24px;color:#C8A96A;font-style:italic;"></div></div><div style="padding:24px 40px 24px 0;border-bottom:0.5px solid rgba(255,255,255,0.06);border-right:0.5px solid rgba(255,255,255,0.06);"><div style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;margin-bottom:8px;">'+_tc('wizard.confirmation.labelType')+'</div><div id="wc-type" style="font-family:\'Cormorant Garamond\',serif;font-weight:300;font-size:24px;color:#f5f0e8;"></div></div><div style="padding:24px 0 24px 40px;border-bottom:0.5px solid rgba(255,255,255,0.06);"><div style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;margin-bottom:8px;">'+_tc('wizard.confirmation.labelGuestsDuration')+'</div><div id="wc-guests" style="font-family:\'Cormorant Garamond\',serif;font-weight:300;font-size:24px;color:#f5f0e8;"></div></div><div style="padding:24px 40px 24px 0;border-right:0.5px solid rgba(255,255,255,0.06);"><div style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;margin-bottom:8px;">'+_tc('wizard.confirmation.labelTeam')+'</div><div id="wc-team" style="font-size:15px;font-weight:300;color:rgba(245,240,232,0.65);line-height:1.6;"></div></div><div style="padding:24px 0 24px 40px;"><div style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;margin-bottom:10px;">'+_tc('wizard.confirmation.labelAddons')+'</div><div id="wc-addons" style="display:flex;flex-wrap:wrap;gap:6px;"></div></div><div style="grid-column:1/-1;padding-top:32px;margin-top:8px;border-top:0.5px solid rgba(255,255,255,0.07);display:flex;align-items:baseline;gap:20px;flex-wrap:wrap;"><span style="font-size:10px;font-weight:300;letter-spacing:0.18em;color:rgba(245,240,232,0.3);text-transform:uppercase;">'+_tc('wizard.confirmation.priceLabel')+'</span><span id="wc-price" style="font-family:\'Cormorant Garamond\',serif;font-weight:200;font-size:52px;color:#f5f0e8;letter-spacing:0.02em;"></span><span style="font-size:12px;font-weight:300;color:rgba(245,240,232,0.2);">'+_tc('wizard.confirmation.finalNote')+'</span></div></div><div style="margin-top:40px;padding-top:32px;border-top:0.5px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;"><div id="wc-note" style="font-size:11px;font-weight:300;color:rgba(245,240,232,0.28);max-width:400px;line-height:1.8;"></div><button onclick="location.reload()" style="font-family:\'Inter\',sans-serif;font-size:10px;font-weight:300;letter-spacing:0.15em;color:rgba(245,240,232,0.3);text-transform:uppercase;cursor:pointer;border:none;background:none;padding:10px 0;transition:color 0.3s;">'+_tc('wizard.confirmation.newRequest')+'</button></div></div>';
        document.getElementById('wiz-confirm-time').textContent=timeStr;
        document.getElementById('wc-name').textContent=name;
        document.getElementById('wc-date').textContent=date;
        document.getElementById('wc-type').textContent=_tc(TYPE_KEY_MAP[wst.typeKey]||'wizard.eventLabel.wedding');
        document.getElementById('wc-guests').textContent=wst.guests+' '+_tc('wizard.unit.hostu')+_tc('wizard.confirmation.guestsSep')+wst.hours+' '+u;
        document.getElementById('wc-team').textContent=team;
        var addonsEl=document.getElementById('wc-addons');
        if(addonsDisplay.length){addonsDisplay.forEach(function(a){var sp=document.createElement('span');sp.style.cssText='font-size:10px;font-weight:300;color:rgba(200,169,106,0.7);border:0.5px solid rgba(200,169,106,0.25);padding:4px 12px;letter-spacing:0.08em;';sp.textContent=a;addonsEl.appendChild(sp);});}else{addonsEl.innerHTML='<span style="color:rgba(245,240,232,0.25);">\u2014</span>';}
        document.getElementById('wc-price').textContent=price;
        document.getElementById('wc-note').innerHTML=_tc('wizard.confirmation.notePrefix')+' <span style="color:rgba(200,169,106,0.6);">'+email+'<\/span>'+_tc('wizard.confirmation.noteSuffix');
        scrollToWizard();
        setTimeout(function(){
          var conf=document.getElementById('wiz-confirmation');
          if(conf)conf.style.opacity='1';
        },400);
      },500);
    },2500);
  };
})();

/* ─── */

(function(){
  var calOpen=false;
  var calDate=new Date();
  var calSelected=null;
  var calView='days';
  var today=new Date();
  today.setHours(0,0,0,0);
  var months=(window.t&&window.translations)?window.t('cal.months'):['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

  function wizRenderCal(){
    var monthEl=document.getElementById('cal-month-label');
    var yearEl=document.getElementById('cal-year-label');
    var grid=document.getElementById('wizCalGrid');
    var daysHdr=document.querySelector('.wiz-cal-days-header');
    if(!grid)return;
    if(monthEl)monthEl.textContent=months[calDate.getMonth()];
    if(yearEl)yearEl.textContent=calDate.getFullYear();
    calView='days';
    var picker=document.getElementById('wizCalPicker');
    if(picker){picker.style.opacity='0';picker.style.display='none';picker.innerHTML='';}
    if(daysHdr)daysHdr.style.display='';
    grid.style.display='';
    grid.innerHTML='';
    var first=new Date(calDate.getFullYear(),calDate.getMonth(),1);
    var last=new Date(calDate.getFullYear(),calDate.getMonth()+1,0);
    var startDay=(first.getDay()+6)%7;
    for(var i=0;i<startDay;i++){
      var empty=document.createElement('div');
      empty.className='wiz-cal-day wiz-cal-empty';
      grid.appendChild(empty);
    }
    for(var d=1;d<=last.getDate();d++){
      var day=document.createElement('div');
      day.className='wiz-cal-day';
      day.textContent=d;
      var thisDate=new Date(calDate.getFullYear(),calDate.getMonth(),d);
      thisDate.setHours(0,0,0,0);
      if(thisDate<today){
        day.classList.add('wiz-cal-disabled');
      }else{
        if(thisDate.getTime()===today.getTime())day.classList.add('wiz-cal-today');
        if(calSelected&&thisDate.getTime()===calSelected.getTime())day.classList.add('wiz-cal-selected');
        (function(date){
          day.onclick=function(){
            calSelected=date;
            var dd=String(date.getDate()).padStart(2,'0');
            var mm=String(date.getMonth()+1).padStart(2,'0');
            var yyyy=date.getFullYear();
            document.getElementById('wizDate').value=dd+'.'+mm+'.'+yyyy;
            setTimeout(function(){wizCloseCal();},80);
          };
        })(thisDate);
      }
      grid.appendChild(day);
    }
  }

  function wizShowPicker(type){
    var picker=document.getElementById('wizCalPicker');
    var grid=document.getElementById('wizCalGrid');
    var daysHdr=document.querySelector('.wiz-cal-days-header');
    if(!picker||!grid)return;
    calView=type;
    if(daysHdr)daysHdr.style.display='none';
    grid.style.display='none';
    picker.style.opacity='0';
    picker.style.display='grid';
    picker.style.gridTemplateColumns='repeat(3,1fr)';
    picker.style.gap='2px';
    picker.style.marginTop='4px';
    picker.innerHTML='';
    var items=[];
    var nowYear=new Date().getFullYear();
    if(type==='months'){for(var i=0;i<12;i++)items.push({label:months[i],val:i});}
    else{for(var y=nowYear;y<=nowYear+8;y++)items.push({label:y,val:y});}
    items.forEach(function(item){
      var cell=document.createElement('div');
      cell.textContent=item.label;
      var isSel=(type==='months'?calDate.getMonth()===item.val:calDate.getFullYear()===item.val);
      cell.style.cssText='padding:10px;text-align:center;font-family:\'Inter\',sans-serif;font-weight:300;font-size:13px;cursor:pointer;transition:color 0.15s;color:'+(isSel?'#C8A96A':'rgba(245,240,232,0.6)')+';border-bottom:'+(isSel?'1px solid rgba(200,169,106,0.3)':'none')+';';
      cell.onmouseover=function(){this.style.color='#f5f0e8';};
      cell.onmouseout=function(){var s=(type==='months'?calDate.getMonth()===item.val:calDate.getFullYear()===item.val);this.style.color=s?'#C8A96A':'rgba(245,240,232,0.6)';};
      cell.onclick=function(){
        if(type==='months'){calDate=new Date(calDate.getFullYear(),item.val,1);}
        else{calDate=new Date(item.val,calDate.getMonth(),1);}
        wizRenderCal();
      };
      picker.appendChild(cell);
    });
    requestAnimationFrame(function(){requestAnimationFrame(function(){picker.style.opacity='1';});});
  }

  window.wizShowMonthPicker=function(){wizShowPicker('months');};
  window.wizShowYearPicker=function(){wizShowPicker('years');};

  function wizCloseCal(){
    var dd=document.getElementById('wizCalDropdown');
    if(!dd||!calOpen)return;
    dd.classList.add('closing');
    setTimeout(function(){
      dd.classList.remove('open');
      dd.classList.remove('closing');
      dd.style.display='none';
    },250);
    calOpen=false;
  }

  window.wizToggleCal=function(){
    var dd=document.getElementById('wizCalDropdown');
    if(!dd)return;
    if(calOpen){wizCloseCal();}else{
      dd.style.display='block';
      setTimeout(function(){dd.classList.add('open');},10);
      calOpen=true;
      wizRenderCal();
    }
  };

  window.wizCalPrev=function(){
    if(calView==='years')return;
    if(calView==='months'){calDate=new Date(calDate.getFullYear()-1,calDate.getMonth(),1);wizShowPicker('months');return;}
    calDate=new Date(calDate.getFullYear(),calDate.getMonth()-1,1);
    wizRenderCal();
  };

  window.wizCalNext=function(){
    if(calView==='years')return;
    if(calView==='months'){calDate=new Date(calDate.getFullYear()+1,calDate.getMonth(),1);wizShowPicker('months');return;}
    calDate=new Date(calDate.getFullYear(),calDate.getMonth()+1,1);
    wizRenderCal();
  };

  document.addEventListener('click',function(e){
    var wrap=document.getElementById('wizCalWrap');
    if(wrap&&!wrap.contains(e.target))wizCloseCal();
  });
})();

/* ─── */

(function(){
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      var m=document.getElementById('privacy-modal');
      if(m&&m.classList.contains('open')){m.classList.remove('open');_unlockScroll();}
    }
  });
})();
