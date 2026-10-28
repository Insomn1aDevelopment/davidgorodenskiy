/* запечатанные загадки */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const box=$('#letters');if(!box)return;const ROM=['I','II','III','IV'];
  const RID=[
    ['Чей он сын?',[['Сын Довмонта','Псковский князь Довмонт, литовец по рождению, мог быть его отцом. Это объяснило бы связь Давида с Псковом.'],['Местная знать','Давид мог происходить из русинского боярства Понеманья. Прямых свидетельств нет ни у одной версии.']]],
    ['Родство с Гедимином',[['Зять великого князя','Часть историков считает, что Давид был женат на дочери Гедимина.'],['Доверенный воевода','Другие видят в нём служилого военачальника без родства с династией. Источники называют только его должность.']]],
    ['Почему его убили?',[['Личная месть','В 1326 году Давида убил мазовецкий рыцарь, в хрониках он назван Анджеем Гостом. Мотивом могла быть месть за прежние набеги.'],['Политический расчёт','Убийство могло быть выгодно противникам литовско-польского союза.']]],
    ['Где его могила?',[['Не установлено','Место погребения неизвестно. Неизвестен и год рождения: обычно говорят о последней четверти XIII века.']]]];
  RID.forEach(([q,vs],i)=>{const a=document.createElement('article');a.className='letter';const id='lv'+i;
    a.innerHTML=`<button class="lt-btn" aria-expanded="false" aria-controls="${id}"><span class="lt-flap" aria-hidden="true"><svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M0 0 L50 40 L100 0 Z"/></svg></span><span class="lt-seal">${seal('Д','s'+i)}</span><span class="cap">Загадка ${ROM[i]}</span><h3>${q}</h3><span class="lt-hint">Сломайте печать, чтобы прочитать версии</span></button><div class="more" id="${id}" role="region" aria-label="${q}: версии"><div><div class="vers">${vs.map(([h,p],k)=>`<div style="--k:${k}"><span class="cap">Версия ${k+1}</span><h4>${h}</h4><p>${p}</p></div>`).join('')}</div></div></div>`;
    const b=$('.lt-btn',a),hint=$('.lt-hint',a);b.addEventListener('click',()=>{const o=a.classList.toggle('open');b.setAttribute('aria-expanded',o);hint.textContent=o?'Нажмите, чтобы запечатать снова':'Сломайте печать, чтобы прочитать версии'});box.appendChild(a)});
})();
