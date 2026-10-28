(()=>{const r=document.documentElement;r.classList.add('js');let c=true;
try{if(sessionStorage.getItem('dg-open'))c=false}catch(e){}
if(matchMedia('(prefers-reduced-motion: reduce)').matches)c=false;
r.classList.add(c?'js-cover':'go');
setTimeout(()=>{r.classList.remove('js-cover');r.classList.add('go')},6000);})();
