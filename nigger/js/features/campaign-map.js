/* поход 1314 года */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const svg=$('#bmap');if(!svg)return;
const NS='http://www.w3.org/2000/svg',P=([lo,la])=>[(lo-23.3)*300,(54.3-la)*510],f1=v=>v.toFixed(1);
const el=(tag,at={},par)=>{const e=document.createElementNS(NS,tag);for(const k in at)e.setAttribute(k,at[k]);if(par)par.appendChild(e);return e};
const poly=pts=>{const q=pts.map(P);let d='';const n=q.length;for(let i=0;i<n;i++){const p0=q[(i-1+n)%n],p1=q[i],p2=q[(i+1)%n],p3=q[(i+2)%n];if(!i)d=`M${f1(p1[0])},${f1(p1[1])}`;d+=`C${f1(p1[0]+(p2[0]-p0[0])/6)},${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)},${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])},${f1(p2[1])}`}return d+'Z'};
const smooth=pts=>{const q=pts.map(P);let d=`M${f1(q[0][0])},${f1(q[0][1])}`;for(let i=0;i<q.length-1;i++){const p0=q[i-1]||q[i],p1=q[i],p2=q[i+1],p3=q[i+2]||p2;d+=`C${f1(p1[0]+(p2[0]-p0[0])/6)},${f1(p1[1]+(p2[1]-p0[1])/6)} ${f1(p2[0]-(p3[0]-p1[0])/6)},${f1(p2[1]-(p3[1]-p1[1])/6)} ${f1(p2[0])},${f1(p2[1])}`}return d};
let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;

const FOREST=[[[25.1,54.32],[26.35,54.32],[26.35,53.86],[25.95,53.8],[25.55,53.97],[25.2,54.02],[24.95,54.16]],
  [[23.98,54.2],[24.55,54.26],[24.62,54.06],[24.45,53.86],[24.18,53.8],[24.03,53.95]],
  [[23.25,53.5],[23.7,53.43],[24.3,53.33],[25.0,53.37],[25.6,53.41],[26.35,53.44],[26.35,53.25],[23.25,53.25]],
  [[23.25,54.32],[23.72,54.32],[23.68,54.02],[23.5,53.9],[23.25,53.95]]];
const BOG=[[[24.95,53.75],[25.3,53.71],[25.42,53.81],[25.16,53.88],[24.97,53.85]],[[24.55,53.62],[24.82,53.6],[24.86,53.7],[24.6,53.72]],[[23.4,53.78],[23.6,53.76],[23.62,53.84],[23.42,53.85]]];
const NEMAN=[[26.4,53.66],[25.95,53.52],[25.6,53.55],[25.2,53.5],[24.9,53.48],[24.4,53.43],[24.0,53.55],[23.83,53.68],[23.9,53.85],[23.95,54.0],[24.0,54.15],[24.05,54.35]];
const gF=$('#bForest'),gB=$('#bBog'),gR=$('#bRiv'),gL=$('#bLab'),gRo=$('#bRoute'),gM=$('#bMk'),gC=$('#bCity'),gT=$('#bTok');
FOREST.forEach(f=>{const a=el('path',{d:poly(f),class:'b-forest'},gF);const b=a.getBBox();let d='';
  for(let y=b.y+8;y<b.y+b.height;y+=11)for(let x=b.x+6;x<b.x+b.width;x+=12){const px=x+rnd()*8-4,py=y+rnd()*6-3;let ok=false;try{ok=a.isPointInFill(new DOMPoint(px,py))}catch(e){}
    if(ok){const h=5.5+rnd()*3.5,w=3+rnd()*.8;d+=`M${f1(px-w)} ${f1(py+2.5)}L${f1(px)} ${f1(py-h)}L${f1(px+w)} ${f1(py+2.5)}Z`}}
  el('path',{d,class:'b-trees'},gF)});
BOG.forEach(b=>{el('path',{d:poly(b),class:'b-bog'},gB);el('path',{d:poly(b),class:'b-bog-edge'},gB)});
el('path',{d:smooth(NEMAN),class:'b-riv'},gR);el('path',{d:smooth(NEMAN),class:'b-riv2'},gR);
el('path',{id:'bNl',d:smooth([[24.4,53.41],[24.9,53.46],[25.2,53.48]]),style:'fill:none;stroke:none'},gR);
{const t=el('text',{class:'b-rl',dy:-9},gR);const tp=el('textPath',{href:'#bNl',startOffset:'10%'},t);tp.textContent='Неман'}
[[25.75,54.15,'пуща'],[24.3,54.08,'лес'],[25.18,53.66,'болота'],[24.9,53.32,'лес']].forEach(([lo,la,tx])=>{const [x,y]=P([lo,la]);const t=el('text',{x,y,class:'b-lab','text-anchor':'middle'},gL);t.textContent=tx});
[['Гродно',[23.83,53.68],1,[-14,22,'end']],['Новогрудок',[25.82,53.6],0,[16,6,'start']]].forEach(([n,ll,h,[dx,dy,an]])=>{const [x,y]=P(ll);const g=el('g',{class:'b-city'+(h?' h':''),transform:`translate(${f1(x)} ${f1(y)})`},gC);
  if(h){el('circle',{r:8,class:'sym home'},g)}else{el('path',{d:'M-11 9 L-9 -4 L-5 -4 L-5 -10 L-1 -10 L-1 -4 L1 -4 L1 -10 L5 -10 L5 -4 L9 -4 L11 9 Z',class:'sym'},g)}
  const t=el('text',{x:dx,y:dy,'text-anchor':an},g);t.textContent=n});

const R={
  in:{side:'ord',pts:[[24.32,54.33],[24.55,54.15],[24.75,53.98]]},
  siege:{side:'ord',pts:[[24.75,53.98],[25.1,53.92],[25.45,53.73],[25.72,53.64]]},
  strike:{side:'lit',pts:[[23.86,53.7],[24.1,53.77],[24.4,53.87],[24.66,53.94]]},
  ret:{side:'ord',pts:[[25.78,53.64],[25.35,53.86],[24.95,54.04],[24.55,54.2],[24.25,54.34]],cls:' ret'}
};
for(const k in R){const r=R[k];r.p=el('path',{d:smooth(r.pts),class:'b-route '+r.side+(r.cls||'')},gRo);r.len=r.p.getTotalLength();r.p.style.strokeDasharray=r.len;r.p.style.strokeDashoffset=r.len}
const mk=(k,ll,lab,dy)=>{const [x,y]=P(ll);const g=el('g',{class:'mk',transform:`translate(${f1(x)} ${f1(y)})`,style:'opacity:0'},gM);
  if(k==='camp'){el('rect',{x:-11,y:-5,width:9,height:6},g);el('rect',{x:2,y:-5,width:9,height:6},g);el('rect',{x:-4.5,y:3,width:9,height:6},g);el('path',{d:'M-8 -6 q2.5 -10 5 0 q-2.5 -2.5 -5 0z M5 -6 q2.5 -10 5 0 q-2.5 -2.5 -5 0z M-1.5 2 q2.5 -10 5 0 q-2.5 -2.5 -5 0z',class:'fl'},g);const sm=el('g',{class:'smk'},g);[0,1,2].forEach(k=>el('circle',{cx:k*5-5,cy:-14,r:3,style:'--d:'+(k*.85)+'s'},sm))}
  else{el('circle',{r:13},g);el('path',{d:'M-7 -7 L7 7 M7 -7 L-7 7 M-8.5 -2.5 L-2.5 -8.5 M8.5 -2.5 L2.5 -8.5',class:'x'},g)}
  const t=el('text',{x:dy[0],y:dy[1],'text-anchor':dy[2]},g);t.textContent=lab;return g};
const mCamp=mk('camp',[24.75,53.98],'обоз',[16,4,'start']),mSiege=mk('x',[25.98,53.73],'осада',[0,-20,'middle']);
const tok=(side,lab)=>{const g=el('g',{class:'tok '+side,style:'opacity:0'},gT);el('path',{d:'M-10 -12 H10 V-1 C10 6 4.5 10.5 0 13 C-4.5 10.5 -10 6 -10 -1 Z',class:'sh'},g);
  el('path',{d:side==='ord'?'M0 -7.5V6M-5.5 -2H5.5':'M0 -7.5V7.5M-4.5 -3.5H4.5M-4.5 1.5H4.5',class:'cr'},g);const t=el('text',{x:0,y:28,'text-anchor':'middle'},g);t.textContent=lab;return g};
const tO=tok('ord','ОРДЕН'),tL=tok('lit','ДАВИД');
const at=(g,x,y,o)=>{g.setAttribute('transform',`translate(${f1(x)} ${f1(y)})`);g.style.opacity=o};
const pt=(r,k)=>r.p.getPointAtLength(r.len*k);
const S=[
  {in:1,siege:0,strike:0,ret:0,o:['in',1],l:['strike',0],camp:0,burn:0,sg:0,anim:'in',cap:'Вторжение'},
  {in:1,siege:1,strike:0,ret:0,o:['siege',1],l:['strike',0],camp:1,burn:0,sg:1,anim:'siege',cap:'Обоз оставлен'},
  {in:1,siege:1,strike:1,ret:0,o:['siege',1],l:['strike',1],camp:1,burn:1,sg:1,anim:'strike',cap:'Удар по обозу'},
  {in:1,siege:1,strike:1,ret:1,o:['ret',1],l:['strike',1],camp:1,burn:1,sg:0,anim:'ret',cap:'Отступление',fadeO:1}
];
const ROMAN=['I','II','III','IV'];let curS=-1,raf=0;
function apply(i,k){const st=S[i];
  for(const key in R){const v=key===st.anim?k*st[key]:st[key];R[key].p.style.strokeDashoffset=R[key].len*(1-v);R[key].p.setAttribute('marker-end',v>=.999?(R[key].side==='ord'?'url(#bArrO)':'url(#bArrL)'):'')}
  const ok=st.o[0]===st.anim?k:st.o[1],po=pt(R[st.o[0]],ok);at(tO,po.x,po.y,st.fadeO&&k>=.999?.45:1);
  const lk=st.l[0]===st.anim?k:st.l[1],pl=pt(R[st.l[0]],lk);at(tL,pl.x,pl.y,1);
  mCamp.style.opacity=st.camp?1:0;mCamp.classList.toggle('burn',!!st.burn&&(st.anim!=='strike'||k>.9));mSiege.style.opacity=st.sg?1:0}
function go(i){if(i===curS)return;cancelAnimationFrame(raf);const back=i<curS;curS=i;$('#bCap').textContent=`Этап ${ROMAN[i]} из IV · ${S[i].cap}`;
  $$('#bSteps .chap').forEach((c,j)=>c.classList.toggle('on',j===i));
  if(reduce||back){apply(i,1);return}const t0=performance.now(),dur=1600;
  const step=now=>{const k=Math.min(1,(now-t0)/dur),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;apply(i,e);if(k<1)raf=requestAnimationFrame(step)};raf=requestAnimationFrame(step)}
apply(0,1);curS=0;
const scl=()=>{$('#bScale').style.width=(20/111*510*svg.clientWidth/900).toFixed(0)+'px'};scl();addEventListener('resize',scl);
const chaps=$$('#bSteps .chap');
if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)go(+e.target.dataset.step)}),{rootMargin:'-45% 0px -45% 0px'});chaps.forEach(c=>io.observe(c))}
chaps.forEach(c=>c.addEventListener('click',()=>go(+c.dataset.step)));
})();
