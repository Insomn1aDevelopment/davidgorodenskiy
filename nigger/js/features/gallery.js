(function(){
const {root,reduce,fine,$,$$,fadeIn,ls,esc,onGo,startGo,leaf,io,below,reveal,INI,seal}=window.DG;
/* подпись переписчика */
reveal($('.scribe'),'pre');

/* параллакс иллюстраций */
(()=>{const ps=$$('.par img');if(reduce||!ps.length)return;const upd=()=>ps.forEach(img=>{const r=img.parentElement.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const p=(r.top+r.height/2-innerHeight/2)/innerHeight;img.style.transform=`translateY(${(p*-6).toFixed(2)}%) scale(1.14)`});addEventListener('scroll',upd,{passive:true});upd()})();

/* просмотр иллюстраций */
const lb=$('#lb'),frames=$$('.fig .frame');let li=0;
const show=i=>{li=(i+frames.length)%frames.length;const fr=frames[li],img=$('img',fr);$('#lbImg').src=img.src;$('#lbImg').alt=img.alt;$('#lbCap').textContent=`${li+1} / ${frames.length} · ${$('figcaption b',fr.parentElement).textContent}`};
frames.forEach((fr,i)=>{const open=()=>{show(i);if(lb.showModal&&!lb.open)lb.showModal();else lb.setAttribute('open','')};fr.addEventListener('click',open);fr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
$('#lbPrev').onclick=()=>show(li-1);$('#lbNext').onclick=()=>show(li+1);
$('#lbClose').addEventListener('click',()=>lb.close?lb.close():lb.removeAttribute('open'));
lb.addEventListener('click',e=>{if(e.target===lb)lb.close()});
lb.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(li-1);if(e.key==='ArrowRight')show(li+1)});
})();
