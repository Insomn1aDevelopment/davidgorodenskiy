/* свеча памяти: общий счётчик в базе артефакта, без неё — свеча только на этом экране */
(()=>{
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
const box=$('#candleBox');if(!box)return;const btn=$('#candleBtn'),msg=$('#candleMsg'),cnt=$('#candleCount');
  let db=null,uid=null,count=null,mine=ls.get('dg-candle')==='1';
  const plural=n=>{const a=n%10,b=n%100;return a===1&&b!==11?'человек':(a>=2&&a<=4&&(b<10||b>=20))?'человека':'человек'};
  const paint=()=>{box.classList.toggle('lit',mine);btn.hidden=mine;
    msg.textContent=mine?'Ваша свеча горит. Спасибо, что помните.':'Зажгите свечу в память о Давиде Городенском.';
    if(count!=null){cnt.hidden=false;cnt.innerHTML=count>0?`<b>${count>=1000?'1000+':count}</b>${plural(count)} уже зажгли свечу`:'Станьте первым, кто зажжёт свечу.'}};
  paint();
  btn.addEventListener('click',async()=>{mine=true;ls.set('dg-candle','1');paint();
    if(db&&uid){try{await db.doc('candles/'+uid).set({at:Date.now()})}catch(e){msg.textContent='Свеча горит на вашем экране. В общий счёт её записать не удалось.'}}});
  (async()=>{try{if(!window.claude||!claude.use)return;const [d,u]=await Promise.all([claude.use('db'),claude.use('user')]);if(!d)return;db=d;
    try{uid=u?await u.id():null}catch(e){uid=null}
    db.collection('candles').limit(1000).onSnapshot(s=>{count=s.size;if(uid&&s.docs.some(x=>x.id===uid&&x.exists)){mine=true;ls.set('dg-candle','1')}paint()},()=>{})}catch(e){}})();
})();
