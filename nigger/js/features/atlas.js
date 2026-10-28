/* atlas */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;

const svg=$('#bigmap');if(!svg)return;
const NS='http://www.w3.org/2000/svg',VW=976,VH=800,KX=57.4,KY=100;
const P=([lon,lat])=>[(lon-13.5)*KX,(59.3-lat)*KY];
const el=(tag,at={},par)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e};
const f1=v=>v.toFixed(1);
const poly=pts=>'M'+pts.map(p=>P(p).map(f1).join(',')).join('L')+'Z';
const line=pts=>'M'+pts.map(p=>P(p).map(f1).join(',')).join('L');
const smooth=pts=>{const q=pts.map(P);let d=`M${f1(q[0][0])},${f1(q[0][1])}`;for(let i=0;i<q.length-1;i++){const p0=q[i-1]||q[i],p1=q[i],p2=q[i+1],p3=q[i+2]||p2;d+=`C${f1(p1[0]+(p2[0]-p0[0])/6)},${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)},${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])},${f1(p2[1])}`}return d};
const km=pts=>{let s=0;const r=Math.PI/180;for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i],h=Math.sin((d-b)*r/2)**2+Math.cos(b*r)*Math.cos(d*r)*Math.sin((c-a)*r/2)**2;s+=2*6371*Math.asin(Math.sqrt(h))}return s};

/* география */
const COAST=[[13.5,53.95],[14.2,53.9],[14.6,54.05],[15.5,54.15],[16.5,54.55],[17.5,54.8],[18.4,54.8],[18.6,54.4],[19.3,54.35],[19.9,54.6],[20.0,54.95],[20.5,54.95],[21.1,55.25],[21.1,55.7],[21.05,56.1],[21.0,56.5],[21.2,56.9],[21.6,57.4],[22.6,57.75],[23.1,57.4],[23.6,57.05],[24.1,57.0],[24.4,57.25],[24.3,57.9],[24.5,58.35],[23.6,58.5],[23.5,58.9],[23.4,59.3]];
const ISL=[[[21.85,58.35],[22.3,58.62],[23.0,58.6],[23.35,58.45],[22.7,58.05],[22.05,57.92]],[[22.1,58.95],[22.6,59.1],[23.0,58.85],[22.5,58.75]]];
const LAKE=[[27.4,58.95],[27.85,58.9],[27.95,58.45],[27.75,58.2],[27.9,58.0],[27.75,57.85],[27.45,57.9],[27.35,58.15],[27.25,58.5]];
const RIV=[
  {p:[[27.0,53.55],[26.3,53.72],[25.6,53.62],[24.9,53.52],[24.4,53.45],[23.83,53.68],[23.95,54.0],[24.05,54.4],[23.9,54.9],[22.9,55.08],[22.0,55.08],[21.3,55.3]],m:1,lab:'Неман',lp:[[21.3,55.3],[22.0,55.08],[22.9,55.08],[23.9,54.9]],o:'18%'},
  {p:[[27.2,54.9],[26.2,54.85],[25.28,54.69],[24.5,54.85],[23.9,54.9]],lab:'Вилия',lp:[[24.0,54.95],[24.5,54.9],[25.28,54.74]],o:'5%'},
  {p:[[30.6,55.25],[29.5,55.45],[28.8,55.5],[27.8,55.7],[26.5,55.87],[25.8,56.3],[25.0,56.6],[24.1,57.0]],m:1,lab:'Западная Двина',lp:[[24.1,57.0],[25.0,56.6],[25.8,56.3],[26.5,55.87],[27.8,55.7]],o:'12%'},
  {p:[[21.0,51.2],[21.0,52.2],[20.3,52.4],[19.7,52.55],[18.6,53.0],[18.75,53.5],[18.85,54.05],[18.95,54.35]],m:1,lab:'Висла',lp:[[18.6,53.0],[19.7,52.55],[20.3,52.4],[21.0,52.2]],o:'30%'},
  {p:[[15.2,51.2],[14.7,52.0],[14.55,52.35],[14.6,52.8],[14.4,53.4],[14.3,53.85]],m:1,lab:'Одер',lp:[[14.3,53.85],[14.4,53.4],[14.6,52.8]],o:'25%'},
  {p:[[28.6,56.6],[28.4,57.3],[28.33,57.82],[28.05,57.97]]},
  {p:[[26.0,58.45],[26.72,58.38],[27.35,58.35]]},
  {p:[[22.2,54.6],[21.2,54.65],[20.5,54.71],[20.1,54.7]]}
];
const TERR=[
  ['t-pol',[[16.0,53.2],[16.6,53.7],[17.0,54.1],[17.4,53.6],[18.1,53.2],[18.6,52.95],[19.5,53.2],[20.5,53.3],[21.5,53.4],[22.6,53.6],[22.6,53.0],[23.2,52.3],[23.6,51.2],[16.2,51.2],[15.9,52.2]]],
  ['t-ord',[[16.9,54.6],[17.5,54.8],[18.4,54.8],[18.6,54.4],[19.3,54.35],[19.9,54.6],[20.0,54.95],[20.5,54.95],[21.1,55.25],[21.1,55.7],[21.35,55.3],[22.0,55.08],[22.9,55.08],[22.9,54.3],[22.6,53.6],[21.5,53.4],[20.5,53.3],[19.5,53.2],[18.6,52.95],[18.1,53.2],[17.4,53.6],[17.0,54.1]]],
  ['t-liv',[[21.05,56.1],[21.0,56.5],[21.2,56.9],[21.6,57.4],[22.6,57.75],[23.1,57.4],[23.6,57.05],[24.1,57.0],[24.4,57.25],[24.3,57.9],[24.5,58.35],[23.6,58.5],[23.5,58.9],[23.4,59.4],[27.6,59.4],[27.4,58.95],[27.25,58.5],[27.35,58.15],[27.45,57.9],[27.6,57.5],[27.2,56.6],[26.6,56.0],[25.6,56.3],[24.2,56.35],[22.8,56.35]]],
  ['t-psk',[[27.85,58.9],[28.9,58.95],[29.9,58.4],[30.6,57.7],[30.6,56.9],[29.3,56.9],[28.2,56.8],[27.6,57.5],[27.75,57.85],[27.9,58.0],[27.75,58.2],[27.95,58.45]]],
  ['t-gdl',[[21.1,55.7],[21.05,56.1],[22.8,56.35],[24.2,56.35],[25.6,56.3],[26.6,56.0],[27.2,56.6],[28.2,56.8],[29.3,56.9],[30.6,56.9],[30.6,51.2],[23.6,51.2],[23.2,52.3],[22.6,53.0],[22.6,53.6],[22.9,54.3],[22.9,55.08],[22.0,55.08],[21.35,55.3]]]
];
const TLAB=[
  [27.7,54.25,['ВЕЛИКОЕ КНЯЖЕСТВО','ЛИТОВСКОЕ'],''],
  [21.4,54.1,['ТЕВТОНСКИЙ ОРДЕН'],''],
  [25.7,57.7,['ЛИВОНИЯ'],''],
  [29.3,57.55,['ПСКОВСКАЯ','ЗЕМЛЯ'],''],
  [18.3,52.0,['КОРОЛЕВСТВО','ПОЛЬСКОЕ'],''],
  [21.4,52.8,['Мазовия'],'it'],
  [22.3,55.6,['Жемайтия'],'it'],
  [13.75,53.05,['БРАНДЕНБУРГ'],'','start'],
  [17.2,56.5,['БАЛТИЙСКОЕ МОРЕ'],'sea'],
  [23.3,57.62,['Рижский залив'],'wl'],
  [26.6,58.85,['Чудское оз.'],'wl','end']
];
const KIND={home:'База Давида',cap:'Столица Великого княжества',lit:'Великое княжество Литовское',ord:'Тевтонский орден',liv:'Ливония',psk:'Псковская земля',pol:'Королевство Польское',bra:'Бранденбург'};
const CITY=[
  ['grodno','Гродно',[23.83,53.68],'home',[11,19,'start'],'Городень. Замок на высоком берегу Немана, база Давида и ключ к западной границе княжества.'],
  ['novogrudok','Новогрудок',[25.82,53.6],'lit',[9,5,'start'],'Один из центров Великого княжества. В 1314 году под ним Орден потерпел поражение.'],
  ['vilnius','Вильно',[25.28,54.69],'cap',[9,-7,'start'],'Столица Гедимина, откуда великий князь направлял своих воевод.'],
  ['kaunas','Ковно',[23.9,54.9],'lit',[-9,-7,'end'],'Литовский замок у слияния Немана и Вилии. Через него шли орденские походы вверх по Неману.'],
  ['polotsk','Полоцк',[28.8,55.48],'lit',[9,5,'start'],'Древний город на Западной Двине, в начале XIV века в сфере власти литовских князей.'],
  ['konigsberg','Кёнигсберг',[20.5,54.71],'ord',[-9,17,'end'],'Опорный пункт Тевтонского ордена в Пруссии, откуда шли походы на Литву.'],
  ['marienburg','Мариенбург',[19.03,54.04],'ord',[-9,16,'end'],'С 1309 года резиденция великого магистра Тевтонского ордена.'],
  ['riga','Рига',[24.1,56.95],'liv',[9,15,'start'],'Крупнейший город Ливонии в устье Западной Двины.'],
  ['dorpat','Дерпт',[26.72,58.38],'liv',[-9,-7,'end'],'Ныне Тарту. Земли Дерптского епископства стали целью похода 1322 года.'],
  ['pskov','Псков',[28.33,57.82],'psk',[9,5,'start'],'Вечевая республика, которую Давид защищал от Ливонского ордена.'],
  ['plock','Плоцк',[19.7,52.55],'pol',[9,16,'start'],'Столица Мазовии. По сообщениям хроник, убийца Давида был мазовецким рыцарем.'],
  ['frankfurt','Франкфурт',[14.55,52.35],'bra',[9,-8,'start'],'Франкфурт-на-Одере, самая западная точка, куда дошли отряды Давида в 1326 году.']
];
const CAMP=[
  {y:'1314',t:'Новогрудок',who:'Орден и Давид',cities:['konigsberg','kaunas','grodno','novogrudok'],
   parts:[{side:'ord',pts:[[20.5,54.71],[21.9,55.02],[22.9,55.05],[23.9,54.88],[24.15,54.4],[24.6,53.86],[25.2,53.7],[25.82,53.6]],a:0,b:.78},
          {side:'lit',pts:[[23.83,53.68],[24.2,53.8],[24.6,53.86]],a:.82,b:1}],
   mk:[{k:'camp',p:[24.6,53.86],at:.55,lab:'обоз'},{k:'battle',p:[25.82,53.6],at:.78,lab:'осада'}],
   st:[[0,'Выступление','Маршал Генрих фон Плоцке выводит орденское войско из Кёнигсберга на Литву.'],[.25,'Вверх по Неману','Войско идёт вдоль Немана мимо Ковно, вглубь литовских земель.'],[.55,'Обоз оставлен','Чтобы ускорить марш, рыцари оставляют припасы под охраной. Место на карте условное.'],[.78,'Осада Новогрудка','Главные силы Ордена подходят к Новогрудку и начинают осаду.'],[.82,'Удар Давида','Отряд из Гродно выходит к лагерю, перебивает охрану и сжигает припасы. Орден отступает без продовольствия.']]},
  {y:'1322',t:'Дерпт',who:'Поход Давида',cities:['pskov','dorpat'],
   parts:[{side:'lit',pts:[[28.33,57.82],[27.7,57.8],[27.15,58.05],[26.72,58.38],[26.2,58.7],[25.7,58.98]],a:0,b:1}],
   mk:[{k:'battle',p:[26.72,58.38],at:.55,lab:'разорение'}],
   st:[[0,'Выход из Пскова','Давид во главе литовского и псковского войска выступает на запад.'],[.3,'В обход озера','Войско огибает Псковское озеро с юга и входит в земли Дерптского епископства.'],[.55,'Под Дерптом','Окрестности Дерпта разорены.'],[.85,'Рейд в Эстонию','Отряды уходят дальше на север. Хронисты пишут о тысячах угнанных пленных.']]},
  {y:'1323',t:'Псков',who:'Поход Давида',cities:['grodno','vilnius','pskov'],
   parts:[{side:'lit',pts:[[23.83,53.68],[24.6,54.2],[25.28,54.69],[26.0,55.4],[26.7,56.2],[27.6,57.1],[28.33,57.82]],a:0,b:1}],
   mk:[{k:'battle',p:[28.33,57.82],at:.99,lab:'осада снята'}],
   st:[[0,'Сбор в Гродно','Псков просит помощи у Гедимина. Давид собирает войско.'],[.27,'Через Вильно','Путь лежит через столицу княжества.'],[.55,'Переход на север','Войско идёт к Пскову вдоль границы ливонских владений.'],[.99,'Осада снята','Ливонские рыцари отходят от стен Пскова.']]},
  {y:'1326',t:'Бранденбург',who:'Поход Давида',cities:['grodno','plock','frankfurt'],
   parts:[{side:'lit',pts:[[23.83,53.68],[22.6,53.25],[21.2,52.75],[19.7,52.55],[18.0,52.45],[16.3,52.4],[14.55,52.35]],a:0,b:1}],
   mk:[{k:'battle',p:[14.55,52.35],at:.99,lab:'Франкфурт'}],
   st:[[0,'Выступление','Литовские отряды идут на помощь польскому королю Владиславу Локетку.'],[.3,'Через Мазовию','Путь на запад лежит через мазовецкие земли.'],[.6,'Польские земли','Войско проходит Великую Польшу.'],[.99,'Франкфурт-на-Одере','Поход в Бранденбург. В том же году Давид погибает: по хроникам, его убил мазовецкий рыцарь.']]}
];

/* отрисовка */
const gTerr=$('#gTerr'),gWater=$('#gWater'),gGrat=$('#gGrat'),gRiv=$('#gRiv'),gTLab=$('#gTLab'),gRoute=$('#gRoute'),gMk=$('#gMk'),gCity=$('#gCity'),gTok=$('#gTok');
TERR.forEach(([c,p])=>el('path',{d:poly(p),class:c},gTerr));
const sea=[...COAST,[13.5,59.4],[13.5,53.95]];
el('path',{d:poly(sea),class:'m-sea'},gWater);el('path',{d:poly(sea),class:'m-wave'},gWater);
el('path',{d:line(COAST),class:'m-coast'},gWater);
ISL.forEach(p=>el('path',{d:poly(p),class:'m-isl'},gWater));
el('path',{d:poly(LAKE),class:'m-lake'},gWater);el('path',{d:poly(LAKE),class:'m-wave'},gWater);
for(let lon=14;lon<=30;lon+=2){const x=(lon-13.5)*KX;el('line',{x1:x,y1:0,x2:x,y2:VH},gGrat);const t=el('text',{x:x+3,y:VH-6},gGrat);t.textContent=lon+'°'}
for(let lat=52;lat<=59;lat++){const y=(59.3-lat)*KY;el('line',{x1:0,y1:y,x2:VW,y2:y},gGrat);const t=el('text',{x:4,y:y-3},gGrat);t.textContent=lat+'°'}
RIV.forEach((r,i)=>{el('path',{d:smooth(r.p),class:r.m?'major':''},gRiv);if(r.lab){el('path',{d:smooth(r.lp),id:'rl'+i,style:'fill:none;stroke:none'},gRiv);const t=el('text',{class:'m-rl',dy:-5},gRiv);const tp=el('textPath',{href:'#rl'+i,startOffset:r.o},t);tp.textContent=r.lab}});
TLAB.forEach(([lon,lat,ls,c,anc])=>{const [x,y]=P([lon,lat]);const t=el('text',{x,y,class:'m-tl '+c,'text-anchor':anc||'middle'},gTLab);ls.forEach((s,i)=>{const sp=el('tspan',{x,dy:i?'1.35em':0},t);sp.textContent=s})});

const scaled=[];
const cityEl={};
CITY.forEach(([id,n,ll,k,[dx,dy,anc],d])=>{const [x,y]=P(ll);const g=el('g',{class:'city',tabindex:0,role:'button','aria-label':n},gCity);
  if(k==='home'){el('circle',{r:7,class:'pulse'},g);el('circle',{r:10.5,class:'ring'},g);el('circle',{r:6.5,class:'sym home'},g)}
  else if(k==='ord'||k==='liv'){el('rect',{x:-5,y:-5,width:10,height:10,class:'sym ord'},g);el('path',{d:'M0 -3.2V3.2M-3.2 0H3.2',class:'crs'},g)}
  else if(k==='cap'){el('circle',{r:6,class:'sym'},g);el('circle',{r:2.2,style:'fill:var(--ink)'},g)}
  else el('circle',{r:4.6,class:'sym'},g);
  const t=el('text',{x:dx,y:dy,'text-anchor':anc},g);t.textContent=n;
  const o={g,x,y,id,n,k,d};scaled.push(o);cityEl[id]=o;
  g.addEventListener('pointerenter',()=>tip(o,true));g.addEventListener('pointerleave',()=>tip(o,false));
  g.addEventListener('focus',()=>tip(o,true));g.addEventListener('blur',()=>tip(o,false));
  const pick=()=>{$('#mCity').innerHTML=`<span class="cap">${KIND[k]}</span><h4>${n}</h4><p>${d}</p>`;fadeIn($('#mCity'))};
  g.addEventListener('click',e=>{if(!moved)pick()});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
});

CAMP.forEach((c,ci)=>{
  c.parts.forEach(p=>{p.ghost=el('path',{d:smooth(p.pts),class:'m-ghost '+p.side},gRoute)});
});
CAMP.forEach(c=>{
  c.km=Math.round(c.parts.reduce((s,p)=>s+km(p.pts),0)/10)*10;
  c.parts.forEach(p=>{p.path=el('path',{d:smooth(p.pts),class:'m-route '+p.side,style:'opacity:0'},gRoute);p.len=p.path.getTotalLength();p.path.style.strokeDasharray=p.len;p.path.style.strokeDashoffset=p.len;
    const g=el('g',{class:'tok '+p.side,style:'opacity:0'},gTok);el('path',{d:'M-8 -10 H8 V-1 C8 5 3.5 8.5 0 11 C-3.5 8.5 -8 5 -8 -1 Z',class:'sh'},g);
    el('path',{d:p.side==='ord'?'M0 -6V5M-4.5 -1.5H4.5':'M0 -6V6M-3.5 -3H3.5M-3.5 1H3.5',class:'cr'},g);p.tok={g,x:0,y:0};scaled.push(p.tok)});
  c.mk.forEach(m=>{const [x,y]=P(m.p);const g=el('g',{class:'mk '+m.k,style:'opacity:0'},gMk);
    if(m.k==='camp'){el('rect',{x:-9,y:-4,width:7,height:5},g);el('rect',{x:1,y:-4,width:7,height:5},g);el('rect',{x:-4,y:2,width:7,height:5},g);el('path',{d:'M-6 -5 q2 -8 4 0 q-2 -2 -4 0z M4 -5 q2 -8 4 0 q-2 -2 -4 0z M-1 1 q2 -8 4 0 q-2 -2 -4 0z',class:'fl'},g)}
    else{el('circle',{r:11},g);el('path',{d:'M-6 -6 L6 6 M6 -6 L-6 6 M-7 -2 L-2 -7 M7 -2 L2 -7'},g)}
    const t=el('text',{x:0,y:m.k==='camp'?20:26,'text-anchor':'middle'},g);t.textContent=m.lab;
    m.g=g;const o={g,x,y};scaled.push(o)});
});

/* вид и масштаб */
let vb={x:0,y:0,w:VW,h:VH},zAnim=0;
const apply=()=>{svg.setAttribute('viewBox',`${f1(vb.x)} ${f1(vb.y)} ${f1(vb.w)} ${f1(vb.h)}`);const z=vb.w/VW;svg.style.setProperty('--z',z.toFixed(4));
  scaled.forEach(o=>o.g.setAttribute('transform',`translate(${f1(o.x)} ${f1(o.y)}) scale(${z.toFixed(4)})`));
  const w=svg.clientWidth||VW;$('#mScaleBar').style.width=(100/111*KY*w/vb.w).toFixed(0)+'px'};
const clampV=v=>{v.w=Math.min(VW,Math.max(220,v.w));v.h=v.w*VH/VW;v.x=Math.max(0,Math.min(VW-v.w,v.x));v.y=Math.max(0,Math.min(VH-v.h,v.y));return v};
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function zoomTo(t,dur=1000){t=clampV({...t});cancelAnimationFrame(zAnim);if(reduce){vb=t;apply();return}const from={...vb},t0=performance.now();
  const step=now=>{const k=ease(Math.min(1,(now-t0)/dur));vb={x:from.x+(t.x-from.x)*k,y:from.y+(t.y-from.y)*k,w:from.w+(t.w-from.w)*k,h:from.h+(t.h-from.h)*k};apply();if(k<1)zAnim=requestAnimationFrame(step)};zAnim=requestAnimationFrame(step)}
function fit(pts,pad=90){const q=pts.map(P),xs=q.map(p=>p[0]),ys=q.map(p=>p[1]);let x0=Math.min(...xs)-pad,x1=Math.max(...xs)+pad,y0=Math.min(...ys)-pad,y1=Math.max(...ys)+pad;let w=x1-x0,h=y1-y0;if(w/h>VW/VH)h=w*VH/VW;else w=h*VW/VH;w=Math.max(w,420);h=w*VH/VW;return{x:(x0+x1)/2-w/2,y:(y0+y1)/2-h/2,w,h}}
const zoomBy=s=>{const cx=vb.x+vb.w/2,cy=vb.y+vb.h/2,w=vb.w*s;zoomTo({x:cx-w/2,y:cy-w*VH/VW/2,w,h:w*VH/VW},500)};
$('#mAll').onclick=()=>zoomTo({x:0,y:0,w:VW,h:VH});$('#mIn').onclick=()=>zoomBy(.7);$('#mOut').onclick=()=>zoomBy(1.43);
addEventListener('resize',apply);

/* перетаскивание мышью */
let drag=null,moved=false;
svg.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY,vb:{...vb}};moved=false});
addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!moved&&Math.hypot(dx,dy)<4)return;moved=true;svg.classList.add('drag');cancelAnimationFrame(zAnim);const s=vb.w/svg.clientWidth;vb=clampV({...drag.vb,x:drag.vb.x-dx*s,y:drag.vb.y-dy*s});apply();$('#mTip').hidden=true});
addEventListener('pointerup',()=>{if(drag){drag=null;svg.classList.remove('drag');setTimeout(()=>moved=false,0)}});

/* подсказка */
const tipEl=$('#mTip'),mapBox=$('#atlasMap');
function tip(o,on){if(!on||drag&&moved){tipEl.hidden=true;return}const pt=svg.createSVGPoint();pt.x=o.x;pt.y=o.y;const s=pt.matrixTransform(svg.getScreenCTM()),r=mapBox.getBoundingClientRect();
  tipEl.innerHTML=`<b>${o.n}</b>${KIND[o.k]}`;tipEl.style.left=(s.x-r.left)+'px';tipEl.style.top=(s.y-r.top)+'px';tipEl.hidden=false}

/* слои */
const ly=(id,gs)=>$(id).addEventListener('change',e=>gs.forEach(g=>g.style.display=e.target.checked?'':'none'));
ly('#lyTerr',[gTerr,gTLab]);ly('#lyRiv',[gRiv]);ly('#lyGrat',[gGrat]);

/* походы */
let cur=null,tt=1,playing=false,pr=0,last=0;
const campsEl=$('#mCamps'),range=$('#mRange'),playBtn=$('#mPlay');
CAMP.forEach((c,i)=>{const b=document.createElement('button');b.setAttribute('aria-pressed','false');b.innerHTML=`<span class="y num">${c.y}</span><span class="t">${c.t}</span>`;b.onclick=()=>select(c,true);c.btn=b;campsEl.appendChild(b)});
function render(){const c=cur;
  CAMP.forEach(o=>{const on=o===c;o.parts.forEach(p=>{p.ghost.classList.toggle('on',on);
    if(!on){p.path.style.opacity=0;p.tok.g.style.opacity=0;return}
    const k=Math.max(0,Math.min(1,(tt-p.a)/(p.b-p.a)));p.path.style.opacity=k>0?1:0;p.path.style.strokeDashoffset=p.len*(1-k);
    p.path.setAttribute('marker-end',k>=.999?(p.side==='ord'?'url(#mArrO)':'url(#mArrL)'):'');
    const show=tt>=p.a-.0001&&(k<1||p===o.parts[o.parts.length-1]||o.parts.length===1);const pt=p.path.getPointAtLength(p.len*k);p.tok.x=pt.x;p.tok.y=pt.y;
    p.tok.g.style.opacity=(k>0||p.a===0)&&show?1:0;
    p.tok.g.setAttribute('transform',`translate(${f1(pt.x)} ${f1(pt.y)}) scale(${(vb.w/VW).toFixed(4)})`)});
    o.mk.forEach(m=>{m.g.style.opacity=on&&tt>=m.at?1:0;if(m.k==='camp')m.g.classList.toggle('burn',on&&tt>=.97)})});
  scaled.filter(o=>o.id).forEach(o=>o.g.classList.toggle('dim',!!c&&!c.cities.includes(o.id)));
  let si=0;c.st.forEach((s,i)=>{if(tt>=s[0]-.0001)si=i});
  $$('#mSteps li').forEach((li,i)=>{li.classList.toggle('done',i<si);li.classList.toggle('cur',i===si)});
  if(c._si!==si){c._si=si;$('#mDesc').textContent=c.st[si][2];fadeIn($('#mDesc'))}
  range.value=Math.round(tt*1000);
}
function select(c,auto){cur=c;CAMP.forEach(o=>o.btn.setAttribute('aria-pressed',o===c));c._si=-1;
  $('#mWho').textContent=c.who;$('#mKm').textContent=`≈ ${c.km} км`;$('#mTitle').textContent=`${c.y} · ${c.t}`;fadeIn($('#mTitle'));
  const ol=$('#mSteps');ol.innerHTML='';c.st.forEach(s=>{const li=document.createElement('li');const b=document.createElement('button');b.textContent=s[1];b.onclick=()=>{pause();tt=s[0]<.99?Math.min(1,s[0]+.06):1;render()};li.appendChild(b);ol.appendChild(li)});
  zoomTo(fit(c.parts.flatMap(p=>p.pts)));
  if(auto&&!reduce){tt=0;render();setTimeout(play,650)}else{pause();tt=1;render()}
}
function frame(now){if(!playing)return;const dt=now-last;last=now;tt=Math.min(1,tt+dt/7000);render();if(tt>=1){pause();return}pr=requestAnimationFrame(frame)}
function play(){if(tt>=1)tt=0;playing=true;playBtn.classList.add('on');playBtn.setAttribute('aria-label','Пауза');last=performance.now();pr=requestAnimationFrame(frame)}
function pause(){playing=false;cancelAnimationFrame(pr);playBtn.classList.remove('on');playBtn.setAttribute('aria-label','Воспроизвести поход')}
playBtn.onclick=()=>playing?pause():play();
range.addEventListener('input',()=>{pause();tt=range.value/1000;render()});

apply();select(CAMP[0],false);vb={x:0,y:0,w:VW,h:VH};cancelAnimationFrame(zAnim);apply();render();
if(!reduce&&'IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();select(CAMP[0],true)}},{threshold:.45});io.observe(svg)}
})();
