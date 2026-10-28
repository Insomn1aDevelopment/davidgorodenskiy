/* панорама «Городень над Неманом» */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const svg=$('#pano'),wrap=$('#panoWrap');if(!svg)return;
  const G=id=>$('#'+id,svg),sky=G('pSky'),far=G('pFar'),bank=G('pBank'),hill=G('pHill'),pos=G('pPosad'),riv=G('pRiver'),fore=G('pFore'),birds=G('pBirds');
  let sd=29;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
  const add=(g,html)=>g.insertAdjacentHTML('beforeend',html);
  const f1=v=>v.toFixed(1);
  /* небо: гравюрная штриховка, солнце, облака */
  let d='';for(let y=14;y<178;y+=7){const p=1-(y-14)/190;let x=-70+rnd()*60;while(x<1270){const len=30+rnd()*210*p;if(rnd()<p*.92)d+=`M${f1(x)} ${y}h${f1(len)}`;x+=len+18+rnd()*90}}
  add(sky,`<defs><linearGradient id="panoSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B7C9CE"/><stop offset="1" stop-color="#E5DCC5"/></linearGradient><linearGradient id="panoRiver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8BEC1"/><stop offset="1" stop-color="#C4D0C9"/></linearGradient></defs><rect class="sky-bg" x="-70" y="0" width="1340" height="300" fill="url(#panoSky)"/><path class="hs-sky hd" style="--d2:.2s" d="${d}"/>`);
  let rd='';for(let i=0;i<32;i++){const a=i/32*Math.PI*2,r1=50,r2=i%2?68:78;rd+=`M${f1(980+Math.cos(a)*r1)} ${f1(92+Math.sin(a)*r1)}L${f1(980+Math.cos(a)*r2)} ${f1(92+Math.sin(a)*r2)}`}
  add(sky,`<circle class="f" cx="980" cy="92" r="43"/><g class="sun-rays"><path class="o thin hd" style="--d2:.9s" d="${rd}"/></g>`);
  const cloud=(x,y,w,t)=>{let c=`M${x} ${y}`;const n=Math.max(4,Math.round(w/28));for(let i=0;i<n;i++){const bw=w/n,bh=7+rnd()*13;c+=` q${f1(bw/2)} ${f1(-bh*2)} ${f1(bw)} 0`}c+=` q${f1(-w/2)} 16 ${f1(-w)} 0Z`;
    add(sky,`<g class="cloud" style="--t:${t}s"><path class="o thin f fd dl" style="--d:.5s;--d2:1s" pathLength="1" d="${c}"/></g>`)};
  cloud(130,104,190,46);cloud(600,74,240,58);cloud(1070,160,150,40);
  /* дальний лес */
  let fd='M-70 300 L-70 264';for(let x=-70;x<1270;){const w=14+rnd()*12,h=5+rnd()*13;fd+=` Q${f1(x+w/2)} ${f1(264-h*2)} ${f1(x+w)} 264`;x+=w}fd+=' L1270 264 L1270 300 Z';
  add(far,`<path class="o thin fs fd dl" style="--d:.15s;--d2:.9s" pathLength="1" d="${fd}"/>`);
  d='';for(let i=0;i<260;i++){const x=-60+rnd()*1320,y=270+rnd()*26;d+=`M${f1(x)} ${f1(y)}v${f1(3+rnd()*4)}`}add(far,`<path class="h hd" style="--d2:1.6s" d="${d}"/>`);
  /* правый высокий берег и Коложская церковь */
  add(bank,`<path class="o f fd dl" style="--d:.45s" pathLength="1" d="M760 336 C 850 318 900 248 990 230 C 1060 218 1140 220 1270 216 L1270 336 Z"/>`);
  const bankEl=bank.lastElementChild;
  add(bank,`<path class="o f fd dl" style="--d:.9s" pathLength="1" d="M966 236 V182 H1046 V223 Z"/>
    <path class="o f fd dl" style="--d:1s" pathLength="1" d="M960 184 L1006 160 L1052 184 Z"/>
    <path class="o f fd dl" style="--d:1.1s" pathLength="1" d="M995 162 V140 H1017 V162 Z"/>
    <path class="o f fd dl" style="--d:1.2s" pathLength="1" d="M993 142 C 993 120 1019 120 1019 142 Z"/>
    <path class="o dl" style="--d:1.3s" pathLength="1" d="M1006 106 V124 M1000 112 H1012"/>
    <path class="o f fd dl" style="--d:1.15s" pathLength="1" d="M1046 190 C 1062 190 1062 223 1046 223"/>
    <path class="o thin hd" d="M1046 216 C 1053 216 1053 223 1046 223"/>
    <path class="fi hd" d="M982 216 V204 A4 4 0 0 1 990 204 V216 Z M1002 216 V204 A4 4 0 0 1 1010 204 V216 Z M1022 216 V204 A4 4 0 0 1 1030 204 V216 Z M1003 156 V148 A3 3 0 0 1 1009 148 V156 Z"/>`);
  let td='';[[1090,221],[1112,220],[1150,219],[1180,218],[1210,218],[930,251],[905,265]].forEach(([x,y])=>{const h=16+rnd()*12;td+=`M${x-6} ${y}L${x} ${f1(y-h)}L${x+6} ${y}Z`});
  add(bank,`<path class="o thin f hd" d="${td}"/>`);
  /* замковая гора */
  const hillD='M110 336 C 190 326 250 270 318 198 C 344 172 380 162 420 160 L 704 158 C 744 160 774 174 794 206 C 826 256 862 308 920 336 Z';
  add(hill,`<path class="o f fd dl" style="--d:.3s;stroke-width:1.5" pathLength="1" d="${hillD}"/>`);
  const hillEl=hill.lastElementChild;
  add(hill,`<path class="road hd" d="M214 336 C 254 324 296 306 326 292 C 352 280 314 256 354 242 C 400 226 418 198 432 172"/>`);
  let pd='';for(let x=410;x<=702;x+=6){pd+=`M${x} 160v-12l2-4l2 4v12`}
  add(hill,`<path class="o thin f hd" style="--d2:2s" d="${pd}"/><path class="o thin hd" style="--d2:2s" d="M406 152 H706"/>`);
  add(hill,`<path class="o f fd dl" style="--d:.9s" pathLength="1" d="M448 160 V136 H506 V160 Z"/><path class="o f fd dl" style="--d:1s" pathLength="1" d="M442 138 L477 116 L512 138 Z"/>
    <path class="o f fd dl" style="--d:.8s" pathLength="1" d="M408 160 V106 H436 V160 Z"/><path class="o f fd dl" style="--d:.95s" pathLength="1" d="M402 108 L422 72 L442 108 Z"/>
    <path class="o f fd dl" style="--d:.7s;stroke-width:1.5" pathLength="1" d="M516 160 V68 H566 V160 Z"/>
    <path class="o f fd dl" style="--d:.85s" pathLength="1" d="M512 68 H570 V56 H562 V62 H554 V56 H546 V62 H538 V56 H530 V62 H522 V56 H512 Z"/>
    <path class="o dl" style="--d:1.2s" pathLength="1" d="M541 56 V22"/>
    <path class="o f fd dl" style="--d:.9s" pathLength="1" d="M624 160 V100 H652 V160 Z"/><path class="o f fd dl" style="--d:1.05s" pathLength="1" d="M618 102 L638 70 L658 102 Z"/>
    <path class="o f fd dl" style="--d:1s" pathLength="1" d="M680 160 V116 H714 V160 Z"/><path class="o f fd dl" style="--d:1.1s" pathLength="1" d="M674 118 L697 98 L720 118 Z"/>
    <path class="fi hd" d="M533 160 V146 A8 8 0 0 1 549 146 V160 Z M538 100 V90 A3 3 0 0 1 544 90 V100 Z M528 124 V116 A3 3 0 0 1 534 116 V124 Z M548 124 V116 A3 3 0 0 1 554 116 V124 Z M419 128 V120 A3 3 0 0 1 425 120 V128 Z M635 128 V120 A3 3 0 0 1 641 120 V128 Z M690 162 V146 A7 7 0 0 1 704 146 V162 Z"/>`);
  d='';for(let y=76;y<158;y+=8){for(let x=518;x<564;){const w=6+rnd()*10;if(rnd()<.6)d+=`M${f1(x)} ${y}h${f1(w)}`;x+=w+3}}add(hill,`<path class="h hd" d="${d}"/>`);
  add(hill,`<path class="flag hd" style="--d2:2.2s" d="M541 24 C 551 20 559 28 571 24 L571 40 C 559 44 551 36 541 40 Z">${reduce?'':'<animate attributeName="d" dur="2.4s" repeatCount="indefinite" values="M541 24 C 551 20 559 28 571 24 L571 40 C 559 44 551 36 541 40 Z;M541 24 C 551 28 559 20 571 26 L571 42 C 559 36 551 44 541 40 Z;M541 24 C 551 20 559 28 571 24 L571 40 C 559 44 551 36 541 40 Z"/>'}</path>`);
  add(hill,`<g class="smoke">${[0,1.8,3.6].map(t=>`<circle cx="492" cy="118" r="4" style="--d:${t}s"/>`).join('')}</g>`);
  /* посад */
  add(pos,`<path class="o f fd dl" style="--d:.7s" pathLength="1" d="M146 336 V318 H176 V336 Z"/><path class="o f fd dl" style="--d:.8s" pathLength="1" d="M142 320 L161 304 L180 320 Z"/>
    <path class="o f fd dl" style="--d:.75s" pathLength="1" d="M194 336 V322 H222 V336 Z"/><path class="o f fd dl" style="--d:.85s" pathLength="1" d="M190 324 L208 310 L226 324 Z"/>
    <path class="o f fd dl" style="--d:.8s" pathLength="1" d="M236 336 V320 H262 V336 Z"/><path class="o f fd dl" style="--d:.9s" pathLength="1" d="M232 322 L249 307 L266 322 Z"/>
    <path class="o thin hd" d="M120 336 V328 M128 336 V327 M136 336 V328 M270 336 V328 M278 336 V327 M286 336 V328 M118 331 H140 M268 331 H290"/>
    <path class="fi hd" d="M157 336 V328 H163 V336 Z M205 336 V329 H211 V336 Z M246 336 V328 H252 V336 Z"/>
    <g class="smoke">${[0,1.4,2.8,4.2].map(t=>`<circle cx="168" cy="302" r="3.4" style="--d:${t}s"/>`).join('')}</g>`);
  /* Неман */
  add(riv,`<path class="water" d="M-70 336 H1270 V440 H-70 Z"/><path class="o dl" style="--d:.25s" pathLength="1" d="M-70 336 C 200 340 400 332 600 338 S 1000 334 1270 338"/>`);
  for(let y=346,i=0;y<430;y+=7,i++){const a=8+rnd()*30,b=10+rnd()*40,c=4+rnd()*16,e=14+rnd()*60;
    add(riv,`<path class="wave hd" style="--d2:1.4s;stroke-dasharray:${f1(a)} ${f1(b)} ${f1(c)} ${f1(e)};--dl:${f1(-(a+b+c+e)*(i%2?1:-1))};--t:${f1(6+rnd()*8)}s" d="M-70 ${y} H1270"/>`)}
  d='';for(let i=0;i<120;i++){const x=320+rnd()*460,y=344+rnd()*44;d+=`M${f1(x)} ${f1(y)}h${f1(6+rnd()*18)}`}add(riv,`<path class="refl hd" d="${d}"/>`);
  add(riv,`<g transform="translate(0 340)"><g class="boat"><g class="bob"><path class="o f" d="M0 0 L46 0 L39 9 L7 9 Z"/><path class="o thin" d="M23 0 V-34"/><path class="o thin f" d="M24 -32 C 36 -26 38 -12 24 -6 Z"/><path class="o thin" d="M10 5 L-6 14 M36 5 L52 14"/></g></g></g>`);
  /* передний план */
  d='';for(let i=0;i<26;i++){const x=rnd()*130,h=26+rnd()*40,bend=(rnd()-.5)*18;d+=`M${f1(x)} 430 Q${f1(x+bend/2)} ${f1(430-h/2)} ${f1(x+bend)} ${f1(430-h)}`}
  for(let i=0;i<22;i++){const x=1080+rnd()*130,h=22+rnd()*36,bend=(rnd()-.5)*18;d+=`M${f1(x)} 430 Q${f1(x+bend/2)} ${f1(430-h/2)} ${f1(x+bend)} ${f1(430-h)}`}
  add(fore,`<path class="o thin hd" style="--d2:1.9s" d="${d}"/>
    <path class="o f fd dl" style="--d:.6s" pathLength="1" d="M8 336 L42 286 L76 336 Z"/><path class="o f fd dl" style="--d:.7s" pathLength="1" d="M2 372 L42 314 L82 372 Z"/><path class="o f fd dl" style="--d:.8s" pathLength="1" d="M-4 408 L42 342 L88 408 Z"/><path class="o dl" style="--d:.9s" pathLength="1" d="M42 408 V432"/>`);
  /* птицы */
  [[34,40,60,-6],[28,80,70,-14],[40,56,48,-22],[31,92,96,-3],[36,64,52,-17]].forEach(([t,y0,y1,dl],i)=>add(birds,`<g class="bird" style="--t:${t}s;--d:${dl}s;--y0:${y0}px;--ym:${(y0+y1)/2-14}px;--y1:${y1}px"><path class="wing" d="M0 0 q5 -6 10 0 q5 -6 10 0" transform="scale(${(.7+i*.08).toFixed(2)})"/></g>`));
  /* штриховка склонов по форме холма */
  const strokes=(el,n,box,pref)=>{let s='';const pt=svg.createSVGPoint();for(let i=0;i<n;i++){const x=box[0]+rnd()*(box[2]-box[0]),y=box[1]+rnd()*(box[3]-box[1]);pt.x=x;pt.y=y;let ok=false;try{ok=el.isPointInFill(pt)}catch(e){ok=false}
    if(ok&&rnd()<pref(x,y)){const l=5+rnd()*7;s+=`M${f1(x)} ${f1(y)}l${f1(l*.6)} ${f1(-l*.8)}`}}return s};
  add(hill,`<path class="h hd" style="--d2:1.7s" d="${strokes(hillEl,1700,[110,160,920,336],(x,y)=>(x>640?.75:.22)+(y>280?.25:0))}"/>`);
  add(bank,`<path class="h hd" style="--d2:1.7s" d="${strokes(bankEl,900,[760,216,1270,336],(x,y)=>x<980?.7:.25)}"/>`);
  /* знаки «+» */
  const HS=[[hill,541,128,'Замок','Детинец на Замковой горе — сердце Городня. Отсюда каштелян управлял городом и округой, здесь стоял гарнизон.'],
    [bank,1006,196,'Коложская церковь','Борисоглебский храм XII века на высоком берегу Немана. В 1853 году часть стен обрушилась в реку, но церковь стоит до сих пор.'],
    [riv,640,398,'Неман','Главная дорога края. По Неману ходили торговые суда, а орденские войска поднимались по нему вглубь Литвы.'],
    [pos,206,292,'Посад','У подножия замка жили ремесленники и купцы. При опасности они укрывались за стенами.']];
  const note=$('#panoNote');let open=null;
  HS.forEach(([g,x,y,t,txt])=>{add(g,`<g class="hs" tabindex="0" role="button" aria-label="${t}: подробнее" transform="translate(${x} ${y})"><circle class="p" r="11"/><circle class="c0" r="10"/><path d="M-4.5 0H4.5M0 -4.5V4.5"/></g>`);
    const h=g.lastElementChild;const show=()=>{if(open===h){hide();return}hide();open=h;h.classList.add('on');const r=h.getBoundingClientRect(),wr=wrap.getBoundingClientRect();
      note.innerHTML=`<b>${t}</b>${txt}`;note.hidden=false;const cx=Math.max(160,Math.min(wr.width-160,r.left-wr.left+r.width/2));note.style.left=cx+'px';const cy=r.top-wr.top;note.classList.toggle('below',cy<170);note.style.top=(cy<170?r.bottom-wr.top:cy)+'px'};
    h.addEventListener('click',e=>{e.stopPropagation();show()});h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}})});
  const hide=()=>{if(open)open.classList.remove('on');open=null;note.hidden=true};
  document.addEventListener('click',e=>{if(open&&!note.contains(e.target))hide()});addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
  /* параллакс слоёв */
  if(!reduce){const L=[[sky,4],[far,9],[bank,16],[hill,16],[pos,16],[riv,16],[fore,16],[birds,9]];let tx=0,ty=0,cx=0,cy=0,raf=0;
    const step=()=>{cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;L.forEach(([g,f])=>{g.style.transform=`translate(${(cx*f).toFixed(2)}px,${(cy*f*.35).toFixed(2)}px)`});raf=(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)?requestAnimationFrame(step):0};
    const kick=()=>{if(!raf)raf=requestAnimationFrame(step)};
    if(fine){
      wrap.addEventListener('pointermove',e=>{const r=wrap.getBoundingClientRect();tx=-((e.clientX-r.left)/r.width-.5);ty=-((e.clientY-r.top)/r.height-.5);kick()});
      wrap.addEventListener('pointerleave',()=>{tx=0;ty=0;kick()});
    }
    addEventListener('scroll',()=>{const r=wrap.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;ty=(r.top+r.height/2-innerHeight/2)/innerHeight*.8;kick()},{passive:true})}
  onGo(()=>wrap.classList.add('pano-ready'));
})();
