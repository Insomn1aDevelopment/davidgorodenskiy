(()=>{

const root=document.documentElement;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer: fine)').matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const fadeIn=el=>{if(!el)return;el.classList.remove('fade');void el.offsetWidth;el.classList.add('fade')};
const NS='http://www.w3.org/2000/svg';
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const goFns=[];
const onGo=f=>{if(root.classList.contains('go'))f();else goFns.push(f)};
const startGo=()=>{root.classList.add('go');goFns.splice(0).forEach(f=>{try{f()}catch(e){}})};
const leaf=$('.leaf');

/* наблюдатель появления: всё, что ниже первого экрана, проявляется при прокрутке */
const io=(!reduce&&'IntersectionObserver' in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);const f=e.target._on;e.target._on=null;f&&f()}}),{rootMargin:'0px 0px -8% 0px'}):null;
const below=el=>el.getBoundingClientRect().top>innerHeight*.9;
const reveal=(el,cls,onShow)=>{if(!el)return;if(!io||!below(el)){onShow&&onShow(false);return}el.classList.add(cls);el._on=()=>{el.classList.remove(cls);onShow&&onShow(true)};io.observe(el)};

/* переплёт */
const cover=$('#cover');
if(cover&&root.classList.contains('js-cover')){
  let opened=false;
  const open=()=>{if(opened)return;opened=true;cover.classList.add('unclasp');
    setTimeout(()=>cover.classList.add('open'),320);
    setTimeout(startGo,950);
    setTimeout(()=>cover.classList.add('gone'),1800);
    setTimeout(()=>{root.classList.remove('js-cover');cover.remove()},2450);
    try{sessionStorage.setItem('dg-open','1')}catch(e){}};
  cover.addEventListener('mousedown',e=>{if(e.button===0)open()});
  addEventListener('wheel',open,{once:true,passive:true});
  addEventListener('touchmove',open,{once:true,passive:true});
  setTimeout(open,2000);
}else{if(cover)cover.remove();startGo()}

/* оглавление, полоса прогресса, ляссе */
const bar=$('#bar'),ribbon=$('#ribbon'),navWrap=$('.nav .wrap'),links=$$('.nav .wrap a'),secs=links.map(a=>$(a.getAttribute('href'))),mark=$('.nav-mark');
let curNav=-2;
const onScroll=()=>{const p=root.scrollTop/(root.scrollHeight-root.clientHeight)||0;bar.style.transform=`scaleX(${p.toFixed(4)})`;ribbon.style.setProperty('--p',p.toFixed(4));
  let cur=-1;secs.forEach((s,k)=>{if(s&&s.getBoundingClientRect().top<innerHeight*.35)cur=k});
  if(cur!==curNav){curNav=cur;links.forEach((a,k)=>a.classList.toggle('on',k===cur));
    if(cur>=0){const a=links[cur];mark.style.left=a.offsetLeft+'px';mark.style.width=a.offsetWidth+'px';mark.style.opacity=1;
      if(navWrap.scrollWidth>navWrap.clientWidth)navWrap.scrollTo({left:a.offsetLeft-navWrap.clientWidth/2+a.offsetWidth/2,behavior:reduce?'auto':'smooth'})}
    else mark.style.opacity=0}};
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',()=>{curNav=-2;onScroll()});onScroll();

/* проявление блоков и заставок */
$$('.rv').forEach((el,k)=>{const z=el.matches('.sec-head')?$('.zastavka',el):null;
  reveal(el,'pre',anim=>{if(z&&anim)z.classList.add('draw')});if(el.classList.contains('pre'))el.style.transitionDelay=(k%3*90)+'ms'});
$$('.fig img').forEach(img=>{if(img.closest('.hero'))return;reveal(img,'inkpre')});

/* перо пишет заглавие */
onGo(()=>{const q=$('#quill'),tp=$('.title-page'),lines=$$('.hero h1 .ln');if(!q||reduce||!q.animate||lines.length<2)return;
  const tr=tp.getBoundingClientRect(),qw=q.getBoundingClientRect().width||64,nx=qw*1/80,ny=qw*79/80;
  const seg=(ln,delay)=>{const rg=document.createRange();rg.selectNodeContents(ln);const r=rg.getBoundingClientRect();return{x0:r.left-tr.left,x1:r.right-tr.left,y:r.top-tr.top+r.height*.74,delay,dur:1250}};
  const a=seg(lines[0],200),b=seg(lines[1],1550),T=b.delay+b.dur+520,kf=[];
  const push=(t,x,y,o,rot=0)=>kf.push({offset:Math.min(1,Math.max(0,t/T)),transform:`translate(${(x-nx).toFixed(1)}px,${(y-ny).toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`,opacity:o});
  const write=s=>{const n=18;for(let i=1;i<=n;i++){const k=i/n,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,w=Math.sin(k*Math.PI*10);push(s.delay+s.dur*k,s.x0+(s.x1-s.x0)*e,s.y+w*5,1,w*5)}};
  push(0,a.x0-40,a.y-50,0);push(a.delay,a.x0,a.y,1);write(a);
  push(b.delay-80,(a.x1+b.x0)/2,(a.y+b.y)/2-34,1,-8);push(b.delay,b.x0,b.y,1);write(b);
  push(T,Math.min(b.x1+70,tr.width-qw),b.y-80,0,16);
  q.style.opacity=1;const an=q.animate(kf,{duration:T,easing:'linear',fill:'forwards'});an.onfinish=()=>{q.style.opacity=0;an.cancel()}});

/* наклон миниатюр */
if(fine&&!reduce)$$('.fig .frame:not(.par)').forEach(fr=>{let raf=0;
  fr.addEventListener('pointermove',e=>{const r=fr.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{fr.style.transform=`perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg)`;fr.style.setProperty('--gx',((x+.5)*100).toFixed(1)+'%');fr.style.setProperty('--gy',((y+.5)*100).toFixed(1)+'%')})});
  fr.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);fr.style.transform=''})});

/* буквицы */
const INI=l=>`<svg viewBox="0 0 96 96" aria-hidden="true"><rect class="i-f1" x="3" y="3" width="90" height="90" pathLength="1"/><rect class="i-f2" x="9" y="9" width="78" height="78" pathLength="1"/><path class="i-v" pathLength="1" d="M15 84 C 11 68 22 61 16 49 C 10 37 19 25 30 20 C 42 14 55 19 66 13 C 74 9 81 11 85 16"/>`+
  [[15,70,-50],[19,52,40],[15,38,-40],[36,17,20],[52,17,-20],[70,12,30]].map(([x,y,r],k)=>`<g transform="rotate(${r} ${x} ${y})"><ellipse class="i-lf" style="--k:${k}" cx="${x}" cy="${y}" rx="5.2" ry="2.3"/></g>`).join('')+
  [[24,28],[60,20],[82,22],[13,60]].map(([x,y],k)=>`<circle class="i-b" style="--k:${k+3}" cx="${x}" cy="${y}" r="2.3"/>`).join('')+
  `<text class="i-l" x="53" y="71" text-anchor="middle">${l}</text></svg>`;
$$('.initial[data-l]').forEach(s=>{s.innerHTML=INI(s.dataset.l);reveal(s,'pre')});

/* глоссы на полях */
const GL={
  order:['Тевтонский орден','Духовно-рыцарский орден, основанный в конце XII века в Святой земле. С 1230-х годов завоёвывал Пруссию, с 1309 года его столица — Мариенбург.'],
  yatv:['Ятвяги','Балтское племя между Неманом и Наревом. В XIII веке их земли разорили и поделили соседи, в том числе Орден.'],
  kalozha:['Коложская церковь','Борисоглебский храм XII века на берегу Немана в Гродно, один из древнейших памятников белорусского зодчества.'],
  kast:['Каштелян','Управляющий замком и округой, командир гарнизона. От латинского castellanus — «смотритель замка».'],
  gedimin:['Гедимин','Великий князь литовский в 1316–1341 годах, основатель династии Гедиминовичей. При нём столицей стало Вильно.'],
  plotzke:['Генрих фон Плоцке','Маршал Тевтонского ордена, водил походы на Литву. Погиб в 1320 году в бою с жемайтами.'],
  dusburg:['Пётр из Дусбурга','Священник Тевтонского ордена, автор «Хроники земли Прусской», законченной около 1326 года. Главный источник о войнах Ордена с Литвой.'],
  sulica:['Сулица','Короткое метательное копьё. Им бились лёгкие всадники Руси и Литвы.'],
  dorpat:['Дерптское епископство','Церковное княжество в Ливонии с центром в Дерпте — нынешнем Тарту.'],
  zhem:['Жемайтия','Западная часть Литвы. Жемайты дольше всех в Европе оставались язычниками и упорно сопротивлялись Ордену.'],
  veche:['Вече','Собрание горожан. В Пскове вече решало главные дела республики, в том числе приглашало князей на службу.'],
  livorder:['Ливонский орден','Ветвь Тевтонского ордена в Ливонии, с 1237 года.'],
  glossa:['Глосса','Пояснение к трудному слову, которое средневековые переписчики писали на полях или между строк рукописи.']
};
const gbox=document.createElement('div');gbox.className='gloss';gbox.id='glossBox';gbox.setAttribute('role','tooltip');gbox.hidden=true;leaf.appendChild(gbox);
const gline=document.createElement('div');gline.className='gloss-line';gline.hidden=true;leaf.appendChild(gline);
let gCur=null;
const showGl=t=>{const g=GL[t.dataset.g];if(!g)return;if(gCur)gCur.classList.remove('on');gCur=t;t.classList.add('on');t.setAttribute('aria-describedby','glossBox');
  gbox.innerHTML=`<b>${g[0]}</b>${g[1]}`;gbox.hidden=false;gbox.classList.remove('m');gline.hidden=true;
  const lr=leaf.getBoundingClientRect(),tr=t.getClientRects()[0]||t.getBoundingClientRect(),body=t.closest('.body');
  if(body&&innerWidth>=1180){const br=body.getBoundingClientRect(),w=220,x=Math.max(10,br.left-lr.left-w-40);gbox.classList.add('m');gbox.style.left=x+'px';gbox.style.top=(tr.top-lr.top-8)+'px';
    gline.hidden=false;gline.style.left=(x+w)+'px';gline.style.top=(tr.top-lr.top+tr.height/2)+'px';gline.style.width=Math.max(0,tr.left-lr.left-x-w-4)+'px'}
  else{const w=Math.min(280,lr.width-32);let x=tr.left-lr.left+tr.width/2-w/2;x=Math.max(16,Math.min(lr.width-w-16,x));gbox.style.left=x+'px';gbox.style.top=(tr.bottom-lr.top+10)+'px'}
  gbox.style.animation='none';void gbox.offsetWidth;gbox.style.animation=''};
const hideGl=()=>{if(gCur){gCur.classList.remove('on');gCur.removeAttribute('aria-describedby')}gCur=null;gbox.hidden=true;gline.hidden=true};
document.addEventListener('pointerover',e=>{const t=e.target.closest&&e.target.closest('.gl');if(t&&e.pointerType==='mouse')showGl(t)});
document.addEventListener('pointerout',e=>{const t=e.target.closest&&e.target.closest('.gl');if(t&&e.pointerType==='mouse'&&!(e.relatedTarget&&t.contains(e.relatedTarget)))hideGl()});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.gl');if(t){if(gCur===t&&!gbox.hidden&&e.pointerType!=='mouse')hideGl();else showGl(t)}else hideGl()});
document.addEventListener('focusin',e=>{if(e.target.classList&&e.target.classList.contains('gl'))showGl(e.target)});
document.addEventListener('focusout',e=>{if(e.target.classList&&e.target.classList.contains('gl'))hideGl()});
addEventListener('keydown',e=>{if(e.key==='Escape')hideGl()});
addEventListener('resize',hideGl);

/* восковая печать */
const seal=(ch,id)=>{let s=11;for(const c of id)s=(s*31+c.charCodeAt(0))%2147483647;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  const n=28,pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr=40+(r()-.5)*5+(i%9===0?3.5:0);pts.push([50+Math.cos(a)*rr,50+Math.sin(a)*rr])}
  const f=v=>v.toFixed(1);let d='';for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];if(!i)d=`M${f(p1[0])},${f(p1[1])}`;d+=`C${f(p1[0]+(p2[0]-p0[0])/6)},${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)},${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])},${f(p2[1])}`}d+='Z';
  const cut='L46 24 L54 40 L47 58 L53 76 L49 110';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="w${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#D9533C"/><stop offset=".5" stop-color="#A3271B"/><stop offset="1" stop-color="#5E0F09"/></radialGradient>
  <clipPath id="cl${id}"><path d="M-10 -10 H50 ${cut} H-10 Z"/></clipPath><clipPath id="cr${id}"><path d="M110 -10 H50 ${cut} H110 Z"/></clipPath>
  <g id="k${id}"><path d="${d}" fill="url(#w${id})"/><circle cx="50" cy="50" r="28" fill="none" stroke="#6E140D" stroke-width="2.4" opacity=".7"/><circle cx="50" cy="50" r="32.5" fill="none" stroke="#E0705A" stroke-width=".9" opacity=".55" stroke-dasharray="1.5 3"/>
  <text x="51.2" y="62.2" text-anchor="middle" font-family="Ruslan Display, serif" font-size="34" fill="#E46B55" opacity=".55">${ch}</text><text x="50" y="61" text-anchor="middle" font-family="Ruslan Display, serif" font-size="34" fill="#5E0F09">${ch}</text></g></defs>
  <g class="half hl"><use href="#k${id}" clip-path="url(#cl${id})"/></g><g class="half hr"><use href="#k${id}" clip-path="url(#cr${id})"/></g><path class="crack" pathLength="1" d="M50 6 L46 24 L54 40 L47 58 L53 76 L49 94"/></svg>`};

window.DG = {root,reduce,fine,$,$$,fadeIn,NS,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal};
})();
