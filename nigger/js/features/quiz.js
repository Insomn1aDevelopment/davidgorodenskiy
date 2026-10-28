/* испытание */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const box=$('#quizBox');if(!box)return;
  const Q=[
    ['Какой крепостью управлял Давид?',['Новогрудок','Гродно','Вильно','Псков'],1,'Давид был каштеляном Гродно.'],
    ['При каком великом князе он служил?',['Миндовге','Ольгерде','Гедимине','Витовте'],2,'Давид был военачальником Гедимина.'],
    ['Под каким городом в 1314 году было разбито орденское войско?',['Новогрудком','Ковно','Кёнигсбергом','Дерптом'],0,'Удар по обозу под Новогрудком заставил Орден отступить.'],
    ['Какой город Давид защитил от Ливонского ордена в 1323 году?',['Новгород','Ригу','Полоцк','Псков'],3,'Давид снял ливонскую осаду Пскова.'],
    ['Кто автор «Хроники земли Прусской»?',['Нестор','Пётр из Дусбурга','Ян Длугош','Генрих Латвийский'],1,'Пётр из Дусбурга, хронист Тевтонского ордена.'],
    ['Куда был направлен последний поход Давида в 1326 году?',['В Бранденбург','В Швецию','В Москву','В Венгрию'],0,'Отряды дошли до Франкфурта-на-Одере.']];
  const LET='абвг';let qi=0,score=0,res=[],name=ls.get('dg-name')||'';
  const dots=()=>Q.map((_,k)=>`<i class="${res[k]===true?'ok':res[k]===false?'no':k===qi?'cur':''}"></i>`).join('');
  const blot=()=>{const n=11,pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=13+Math.random()*7;pts.push([26+Math.cos(a)*r,26+Math.sin(a)*r])}
    let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;for(let i=0;i<n;i++){const p=pts[i],q=pts[(i+1)%n];d+=` Q${(p[0]+(Math.random()-.5)*10).toFixed(1)},${(p[1]+(Math.random()-.5)*10).toFixed(1)} ${((p[0]+q[0])/2).toFixed(1)},${((p[1]+q[1])/2).toFixed(1)}`}
    const drops=[0,1,2,3].map(()=>{const a=Math.random()*Math.PI*2,r=22+Math.random()*8;return `<circle cx="${(26+Math.cos(a)*r).toFixed(1)}" cy="${(26+Math.sin(a)*r).toFixed(1)}" r="${(1.2+Math.random()*2).toFixed(1)}"/>`}).join('');
    return `<svg class="blot" viewBox="0 0 52 52" aria-hidden="true"><path d="${d}Z"/>${drops}</svg>`};
  const render=()=>{if(qi>=Q.length){result();return}const [q,o]=Q[qi];
    box.innerHTML=`<div class="qhead"><span class="cap num">Вопрос ${qi+1} из ${Q.length}</span><span class="qdots">${dots()}</span></div><h3>${q}</h3><div class="opts">${o.map((x,k)=>`<button class="opt" data-k="${k}"><span class="ol">${LET[k]}</span><span class="ot">${x}</span><span class="om" aria-hidden="true"><svg viewBox="0 0 28 28"><path pathLength="1" d="M4 15 C 8 17 10 20 12 23 C 15 15 19 9 25 4"/></svg></span></button>`).join('')}</div><p class="qnote" aria-live="polite"></p>`;
    $$('.opt',box).forEach(b=>b.onclick=()=>{if(b.getAttribute('aria-disabled')!=='true')answer(+b.dataset.k)});fadeIn(box)};
  const answer=k=>{const [, ,c,why]=Q[qi],ok=k===c;if(ok)score++;res[qi]=ok;
    $$('.opt',box).forEach((b,i)=>{b.setAttribute('aria-disabled','true');if(i===c)b.classList.add('ok');else if(i===k){b.classList.add('no');$('.ol',b).insertAdjacentHTML('beforeend',blot())}});
    $('.qnote',box).textContent=(ok?'Верно. ':'Неверно. ')+why;$('.qdots',box).innerHTML=dots();
    const n=document.createElement('div');n.innerHTML=`<button class="link-btn">${qi===Q.length-1?'Получить грамоту →':'Следующий вопрос →'}</button>`;n.firstChild.onclick=()=>{qi++;render()};box.appendChild(n);n.firstChild.focus({preventScroll:true})};
  const result=()=>{const grade=score===6?'отменно':score>=4?'добро':score>=2?'посредственно':'надобно перечесть летопись';
    box.innerHTML=`<div class="qhead"><span class="cap">Итог испытания</span><span class="qdots">${dots()}</span></div>
      <div class="gramota"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
        <span class="cap">Городень · к 700-летию памяти Давида</span><h3>Грамота</h3><div class="zastavka draw" aria-hidden="true"></div>
        <p class="g-text">Дана сия грамота <b class="g-name" id="gOut">${esc(name)||'читателю летописи'}</b> в том, что испытание о Давиде Городенском выдержано. Верных ответов: <b>${score} из ${Q.length}</b>. Оценка: <b>${grade}</b>.</p>
        <div class="g-foot"><span class="g-date">Писано в лето 7534</span><span class="g-seal">${seal('Д','g')}</span><svg class="g-sign" viewBox="0 0 240 60" aria-hidden="true"><path pathLength="1" d="M6 40 C 30 8 44 56 66 30 S 96 14 104 34 S 130 52 150 28 C 160 16 176 20 170 32 S 140 46 196 40 C 214 38 226 30 234 22"/></svg></div>
      </div>
      <div class="g-name-in"><label class="cap" for="gName">Впишите своё имя в грамоту</label><input id="gName" maxlength="40" autocomplete="name" placeholder="Имя и фамилия" value="${esc(name)}"></div>
      <button class="link-btn q-again" id="again">Пройти испытание заново</button>`;
    $('#gName').addEventListener('input',e=>{name=e.target.value.trim();$('#gOut').textContent=name||'читателю летописи';ls.set('dg-name',name)});
    $('#again').onclick=()=>{qi=0;score=0;res=[];render()}};
  render();
})();
