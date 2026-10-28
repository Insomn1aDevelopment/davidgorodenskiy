/* свиток событий */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const sc=$('#scroll'),strip=$('#strip'),inn=$('#stripIn');if(!sc)return;const range=$('#scRange'),badge=$('#scBadge');
  const gl=(k,t)=>`<span class="gl" tabindex="0" data-g="${k}">${t}</span>`;
  const MAIN=[
    [1284,'1284','Орден берёт Гродно','Тевтонские рыцари захватывают гродненский замок. Город остаётся целью набегов на десятилетия вперёд.'],
    [1300,'ок. 1300','Давид во главе Гродно','Точная дата неизвестна. В начале XIV века Давид уже упоминается как каштелян Гродно.'],
    [1314,'1314','Победа под Новогрудком',`Удар по обозу вынуждает армию маршала ${gl('plotzke','Генриха фон Плоцке')} отступить без боя.`],
    [1316,'1316','Гедимин — великий князь','Давид становится одним из главных военачальников нового правителя.'],
    [1322,'1322','Поход на Дерпт',`Вместе с псковичами Давид разоряет земли ${gl('dorpat','Дерптского епископства')}.`],
    [1323,'1323','Псков спасён','Литовское войско заставляет ливонских рыцарей снять осаду Пскова.'],
    [1325,'1325','Союз с Польшей','Дочь Гедимина Альдона выходит замуж за польского королевича Казимира.'],
    [1326,'1326','Последний поход','Поход на Бранденбург. В том же году Давид гибнет от руки мазовецкого рыцаря.']];
  const CTX=[[1295,'ок. 1295','Великим князем становится Витень'],[1307,'ок. 1307','Полоцк переходит под власть Литвы'],
    [1309,'1309','Столица Ордена переносится в Мариенбург'],[1311,'1311','Битва при Воплаукене: Орден разбивает войско Витеня'],[1320,'1320',`Маршал Генрих фон Плоцке гибнет в ${gl('zhem','Жемайтии')}`],
    [1323,'1323','Письма Гедимина: первое упоминание Вильно как столицы'],[1326,'ок. 1326',`${gl('dusburg','Пётр из Дусбурга')} заканчивает «Хронику земли Прусской»`]];
  const PAD=130,X=y=>y<=1310?PAD+(y-1280)*40:PAD+1200+(y-1310)*130,Yinv=x=>x<=PAD+1200?1280+(x-PAD)/40:1310+(x-PAD-1200)/130;
  const W=X(1330)+PAD;inn.style.width=W+'px';
  const mk=(tag,cls,css,html)=>{const e=document.createElement(tag);e.className=cls;if(css)Object.assign(e.style,css);if(html!=null)e.innerHTML=html;inn.appendChild(e);return e};
  const cards=MAIN.map(([y,lab,t,d],i)=>{const c=mk('article','sc-card',null,`<span class="y">${lab}</span><span class="am">в лето ${y+5508}</span><h3>${t}</h3><p>${d}</p>`);c._x=X(y);c._up=i%2===0;return c});
  const notes=CTX.map(([y,lab,t])=>{const n=mk('div','sc-note',null,`<span>${lab}</span> · ${t}`);n._x=X(y);return n});
  let built=[];
  const layout=()=>{built.forEach(e=>e.remove());built=[];const add=(cls,css,html)=>{const e=mk('i',cls,css,html);built.push(e);return e};
    const hA=Math.max(...cards.filter(c=>c._up).map(c=>c.offsetHeight)),hB=Math.max(...cards.filter(c=>!c._up).map(c=>c.offsetHeight));
    const nH=Math.max(...notes.map(n=>n.offsetHeight)),TOP=22,AX=TOP+hA+nH+40,BT=AX+66,H=BT+hB+30;inn.style.height=H+'px';
    add('sc-axis',{top:AX+'px'});
    for(let y=1280;y<=1330;y++){const x=X(y),big=y>=1310||y%5===0;add('sc-tick',{left:x+'px',top:(AX-(big?7:4))+'px',height:(big?14:8)+'px'});
      if(big){const e=add('sc-lab',{left:x+'px',top:(AX+11)+'px'});e.innerHTML=`<b>${y}</b><i>${y+5508}</i>`}}
    const sn=add('sc-scale',{left:X(1310)+'px',top:(AX+50)+'px'});sn.textContent='дальше — год за годом';
    cards.forEach(c=>{const h=c.offsetHeight,top=c._up?TOP+hA-h:BT;c.style.left=(c._x-125)+'px';c.style.top=top+'px';
      if(c._up)add('sc-lead',{left:c._x+'px',top:(top+h)+'px',height:(AX-top-h)+'px'});else add('sc-lead',{left:c._x+'px',top:(AX+46)+'px',height:(BT-AX-46)+'px'});
      add('sc-dot',{left:c._x+'px',top:AX+'px'})});
    let last=[-1e9,-1e9];notes.forEach(n=>{const row=n._x-last[0]>205?0:1;last[row]=n._x;const h=n.offsetHeight,bottom=AX-12-(row?nH+10:0);n.style.left=n._x+'px';n.style.top=(bottom-h)+'px';
      add('sc-nlead',{left:n._x+'px',top:bottom+'px',height:(AX-bottom)+'px'});add('sc-ndot',{left:n._x+'px',top:AX+'px'})});
    badge.style.top=AX+'px';sync()};
  const near=()=>{const c=strip.scrollLeft+strip.clientWidth/2,yr=Math.round(Math.min(1330,Math.max(1280,Yinv(c))));badge.textContent=`${yr} · в лето ${yr+5508}`;
    let best=null,bd=1e9;cards.forEach(el=>{const d=Math.abs(el._x-c);if(d<bd){bd=d;best=el}});cards.forEach(el=>el.classList.toggle('near',el===best&&bd<170))};
  const sync=()=>{const max=strip.scrollWidth-strip.clientWidth;range.value=max>0?Math.round(strip.scrollLeft/max*1000):0;sc.style.setProperty('--rot',(-strip.scrollLeft*.6).toFixed(1)+'px');near()};
  let sraf=0;strip.addEventListener('scroll',()=>{if(!sraf)sraf=requestAnimationFrame(()=>{sraf=0;sync()})},{passive:true});
  range.addEventListener('input',()=>{const max=strip.scrollWidth-strip.clientWidth;strip.scrollLeft=range.value/1000*max});
  const by=dx=>strip.scrollBy({left:dx,behavior:reduce?'auto':'smooth'});
  $('#scPrev').onclick=()=>by(-strip.clientWidth*.7);$('#scNext').onclick=()=>by(strip.clientWidth*.7);
  strip.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();by(180)}else if(e.key==='ArrowLeft'){e.preventDefault();by(-180)}else if(e.key==='Home'){e.preventDefault();by(-W)}else if(e.key==='End'){e.preventDefault();by(W)}});
  /* перетаскивание мышью с инерцией */
  let dr=null,vel=0,lx=0,lt=0,inert=0,noclick=false;
  strip.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;cancelAnimationFrame(inert);dr={x:e.clientX,sl:strip.scrollLeft,moved:false,id:e.pointerId};lx=e.clientX;lt=performance.now();vel=0});
  strip.addEventListener('pointermove',e=>{if(!dr)return;const dx=e.clientX-dr.x;if(!dr.moved&&Math.abs(dx)>4){dr.moved=true;strip.classList.add('drag');try{strip.setPointerCapture(dr.id)}catch(err){}}
    if(dr.moved){strip.scrollLeft=dr.sl-dx;const now=performance.now();vel=(e.clientX-lx)/Math.max(1,now-lt);lx=e.clientX;lt=now}});
  const end=()=>{if(!dr)return;const moved=dr.moved;dr=null;strip.classList.remove('drag');if(!moved)return;noclick=true;setTimeout(()=>noclick=false,0);
    if(reduce)return;let v=-vel*16;const step=()=>{if(Math.abs(v)<.4)return;strip.scrollLeft+=v;v*=.94;inert=requestAnimationFrame(step)};inert=requestAnimationFrame(step)};
  strip.addEventListener('pointerup',end);strip.addEventListener('pointercancel',end);
  cards.forEach(c=>c.addEventListener('click',e=>{if(noclick||e.target.closest('.gl'))return;strip.scrollTo({left:c._x-strip.clientWidth/2,behavior:reduce?'auto':'smooth'})}));
  const setSW=()=>sc.style.setProperty('--sw',sc.clientWidth+'px');setSW();
  let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{setSW();layout()},150)});
  layout();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
  if(!reduce){
    if(io&&below(sc)) reveal(sc,'rolled');
    else{
      sc.classList.add('rolled');
      requestAnimationFrame(()=>requestAnimationFrame(()=>sc.classList.remove('rolled')));
    }
  }
})();
