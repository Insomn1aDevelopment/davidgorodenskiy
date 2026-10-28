/* книга свидетельств */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const host=$('#bookHost');if(!host)return;const tabs=$('#bkTabs'),prev=$('#bkPrev'),next=$('#bkNext'),info=$('#bkInfo');
  const gl=(k,t)=>`<span class="gl" tabindex="0" data-g="${k}">${t}</span>`;
  const mini=(o)=>`<div class="mini"><span class="initial">${INI(o.ini)}</span><span class="cap">${o.kind}</span><h3>${o.name}</h3>${o.lead?`<p class="lead">${o.lead}</p>`:''}${o.attrs?`<dl>${o.attrs.map(([a,b])=>`<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>`:''}</div>`;
  const page=(o)=>`<div class="tp"><span class="cap">${o.kind}</span><h3>${o.work}</h3>${o.text.map(p=>`<p>${p}</p>`).join('')}<p class="view"><span class="cap">Каким видит Давида</span>${o.view}</p></div>`;
  const SRC=[
    {tab:'Дусбург',c:'#2A1E15',ini:'П',kind:'Тевтонский орден · Пруссия',name:'Пётр из Дусбурга',work:'«Хроника земли Прусской»',attrs:[['Сторона','враг'],['Время','около 1326 года'],['Язык','латынь'],['Автор','священник Ордена']],
     text:[`${gl('dusburg','Пётр из Дусбурга')} записал историю завоевания Пруссии и войн Ордена с Литвой. Для эпохи Давида это главный источник.`,'Хронист называет Давида кастеляном Гродно и подробно описывает его набеги на орденские земли. Враг для него опасен, но хронист не скрывает уважения к его военному искусству.'],view:'Опасный и умелый противник'},
    {tab:'Ливония',c:'#4E3A2A',ini:'Л',kind:'Ливония',name:'Ливонские хроники',work:'Хроники XIV века',attrs:[['Сторона','враг'],['Время','XIV век'],['Язык','латынь и немецкий'],['О чём','походы 1322–1323 годов']],
     text:[`Летописцы ${gl('livorder','Ливонского ордена')} пишут о походах на земли ${gl('dorpat','Дерптского епископства')} и Эстонии.`,'В их рассказе Давид — грозный разоритель: сожжённые округа и тысячи угнанных пленных.'],view:'Разоритель земель'},
    {tab:'Псков',c:'#A3271B',ini:'П',kind:'Русь · Псков',name:'Псковские летописи',work:'Летописные своды',attrs:[['Сторона','союзник'],['Сохранились','в сводах XV–XVI веков'],['Язык','древнерусский'],['О чём','защита Пскова в 1323 году']],
     text:[`Летописцы ${gl('veche','вечевого')} Пскова помнят князя Давыда, пришедшего на помощь городу.`,'Здесь он защитник: его войско заставило ливонских рыцарей снять осаду Пскова.'],view:'Защитник города'},
    {tab:'Историки',c:'#3F5F6B',ini:'И',kind:'Историография',name:'Современные исследования',work:'Взгляд историков',attrs:[['Школы','белорусская, литовская, польская, российская'],['Время','XIX–XXI века'],['Спорят о','происхождении и родстве с Гедимином']],
     text:['Историки спорят о происхождении Давида и о его родстве с Гедимином. Каждая национальная школа видит в нём своего героя.','Сходятся в главном: Давид был одним из самых успешных полководцев Великого княжества Литовского своего времени.'],view:'Один из сильнейших полководцев княжества'}];
  const SP=SRC.map(o=>({tab:o.tab,c:o.c,L:mini(o),R:page(o)}));
  SP.push({tab:'Итог',c:'#A8832E',L:mini({ini:'П',kind:'Итог',name:'Почему враг уважал Давида',lead:'Вопрос V секции: причины комплиментарности немецких хронистов к «бескомпромиссному врагу».'}),
    R:`<div class="tp"><span class="cap">Три причины</span><ol>
      <li><b>I</b><div><h4>Рыцарский этос</h4><p>Хронист-рыцарь ценил доблесть и у противника. Признать силу врага было частью кодекса.</p></div></li>
      <li><b>II</b><div><h4>Цена победы</h4><p>Чем опаснее противник, тем весомее подвиг братьев Ордена и тем понятнее их потери.</p></div></li>
      <li><b>III</b><div><h4>Урон, о котором нельзя молчать</h4><p>Набеги Давида наносили Ордену реальный ущерб. Хроника не могла его не заметить.</p></div></li></ol></div>`});
  const N=SP.length;let cur=0,mode='',leaves=[],car=null;
  const tabEls=SP.map((sp,i)=>{const b=document.createElement('button');b.className='bk-tab';b.style.setProperty('--c',sp.c);b.textContent=sp.tab;b.onclick=()=>go(i);tabs.appendChild(b);return b});
  const ui=()=>{tabEls.forEach((b,i)=>b.setAttribute('aria-current',i===cur));info.textContent=`Разворот ${cur+1} из ${N}`;prev.disabled=cur===0;next.disabled=cur===N-1};
  const zs=()=>leaves.forEach((lf,i)=>{if(!lf.classList.contains('turning'))lf.style.zIndex=i<cur?10+i:10+(N-i)});
  const flip=(i,fwd)=>{const lf=leaves[i];lf.style.zIndex=100+(fwd?i:N-i);lf.classList.add('turning');lf.classList.toggle('flipped',fwd);clearTimeout(lf._t);lf._t=setTimeout(()=>{lf.classList.remove('turning');zs()},reduce?20:1180)};
  function go(k){k=Math.max(0,Math.min(N-1,k));if(k===cur)return;
    if(mode==='m'){cur=k;car.scrollTo({left:k*car.clientWidth,behavior:reduce?'auto':'smooth'});ui();return}
    const from=cur;cur=k;const idx=[];if(k>from)for(let i=from;i<k;i++)idx.push(i);else for(let i=from-1;i>=k;i--)idx.push(i);
    idx.forEach((i,j)=>setTimeout(()=>flip(i,k>from),reduce?0:j*150));ui()}
  const build=()=>{const m=matchMedia('(max-width: 760px)').matches?'m':'d';if(m===mode)return;mode=m;host.innerHTML='';leaves=[];
    if(m==='m'){car=document.createElement('div');car.className='bk-m';car.tabIndex=0;car.setAttribute('aria-label','Книга свидетельств, листайте вбок');
      car.innerHTML=SP.map(sp=>`<div class="bk-sp"><div class="pg pg-l">${sp.L}</div><div class="pg pg-r">${sp.R}</div></div>`).join('');host.appendChild(car);
      let t=0;car.addEventListener('scroll',()=>{clearTimeout(t);t=setTimeout(()=>{const i=Math.round(car.scrollLeft/car.clientWidth);if(i!==cur){cur=i;ui()}},80)},{passive:true});
      requestAnimationFrame(()=>car.scrollTo({left:cur*car.clientWidth}))}
    else{const bk=document.createElement('div');bk.className='book';bk.tabIndex=0;bk.setAttribute('aria-label','Книга свидетельств. Стрелки влево и вправо перелистывают страницы');
      bk.innerHTML=`<div class="bk-page bk-base l"><div class="pg pg-l">${SP[0].L}<span class="pg-no">л. 1</span></div></div><div class="bk-page bk-base r"><div class="pg pg-r">${SP[N-1].R}<span class="pg-no">л. ${2*N}</span></div></div>`+
        SP.slice(0,N-1).map((sp,i)=>`<div class="bk-leaf"><div class="face front"><div class="pg pg-r">${sp.R}<span class="pg-no">л. ${2*i+2}</span><i class="curl"></i></div></div><div class="face back"><div class="pg pg-l">${SP[i+1].L}<span class="pg-no">л. ${2*i+3}</span></div></div></div>`).join('')+'<i class="bk-spine"></i>';
      host.appendChild(bk);leaves=$$('.bk-leaf',bk);
      leaves.forEach((lf,i)=>{$('.front',lf).addEventListener('click',e=>{if(!e.target.closest('.gl'))go(i+1)});$('.back',lf).addEventListener('click',e=>{if(!e.target.closest('.gl'))go(i)})});
      $('.bk-base.l',bk).addEventListener('click',e=>{if(!e.target.closest('.gl'))go(cur-1)});
      bk.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(cur+1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1)}});
      leaves.forEach((lf,i)=>lf.classList.toggle('flipped',i<cur));zs()}
    ui()};
  prev.onclick=()=>go(cur-1);next.onclick=()=>go(cur+1);
  build();matchMedia('(max-width: 760px)').addEventListener('change',build);
})();
