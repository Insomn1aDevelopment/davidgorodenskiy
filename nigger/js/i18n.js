(()=>{
  const translations=window.siteTranslations?.be||{};
  const pairs=Object.entries(translations).sort((a,b)=>b[0].length-a[0].length);
  const textSources=new WeakMap();
  const attrSources=new WeakMap();
  const translatableAttributes=['alt','aria-label','aria-description','placeholder','title'];
  let language='ru';
  let initialized=false;
  let finishLanguageTransition=null;
  try{language=localStorage.getItem('dg-language')==='be'?'be':'ru'}catch{}

  const translate=value=>{
    if(language!=='be')return value;
    let result=value;
    for(const [source,target] of pairs)if(result.includes(source))result=result.split(source).join(target);
    return result;
  };
  const attrsFor=element=>{
    let attrs=attrSources.get(element);
    if(!attrs){attrs=new Map();attrSources.set(element,attrs)}
    return attrs;
  };
  const translateText=node=>{
    if(!textSources.has(node))textSources.set(node,node.nodeValue);
    const result=translate(textSources.get(node));
    if(node.nodeValue!==result)node.nodeValue=result;
  };
  const translateAttributes=element=>{
    const originals=attrsFor(element);
    for(const name of translatableAttributes){
      if(!element.hasAttribute(name))continue;
      const current=element.getAttribute(name);
      if(!originals.has(name))originals.set(name,current);
      const result=translate(originals.get(name));
      if(current!==result)element.setAttribute(name,result);
    }
  };
  const translateTree=node=>{
    if(node.nodeType===Node.TEXT_NODE){translateText(node);return}
    if(node.nodeType!==Node.ELEMENT_NODE&&node.nodeType!==Node.DOCUMENT_NODE)return;
    if(node.nodeType===Node.ELEMENT_NODE){if(node.tagName==='SCRIPT'||node.tagName==='STYLE')return;translateAttributes(node)}
    for(const child of node.childNodes)translateTree(child);
  };
  const applyLanguage=next=>{
    language=next==='be'?'be':'ru';
    try{localStorage.setItem('dg-language',language)}catch{}
    document.documentElement.lang=language;
    document.title=translate('Давид Городенский');
    translateTree(document.body);
    for(const button of document.querySelectorAll('.lang-switch [data-lang]'))button.setAttribute('aria-pressed',String(button.dataset.lang===language));
    const group=document.querySelector('.lang-switch');
    if(group)group.setAttribute('aria-label',language==='be'?'Мова старонкі':'Язык страницы');
  };
  const setLanguage=next=>{
    const target=next==='be'?'be':'ru';
    if(initialized&&target===language)return;
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(finishLanguageTransition)finishLanguageTransition();
    const group=document.querySelector('.lang-switch');
    const button=group?.querySelector(`[data-lang="${target}"]`);
    if(reduceMotion||typeof Element.prototype.animate!=='function'){
      applyLanguage(target);initialized=true;return;
    }
    const rect=button?.getBoundingClientRect();
    const width=window.innerWidth,height=window.innerHeight;
    const x=rect?rect.left+rect.width/2:width/2,y=rect?rect.top+rect.height/2:height/2;
    const from=[x/width*100,y/height*100],to=[from[0]>=50?0:100,from[1]>=50?0:100];
    const shape=(rx,ry,point)=>`ellipse(${rx}% ${ry}% at ${point[0]}% ${point[1]}%)`;
    const filterId=`language-ink-edge-${Math.random().toString(36).slice(2)}`;
    const filterSvg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    filterSvg.setAttribute('width','1');filterSvg.setAttribute('height','1');filterSvg.setAttribute('aria-hidden','true');
    filterSvg.style.cssText='position:fixed;width:1px;height:1px;overflow:hidden;pointer-events:none';
    filterSvg.innerHTML=`<defs><filter id="${filterId}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .018" numOctaves="2" seed="${Math.floor(Math.random()*1000)}" result="ink-grain"/><feDisplacementMap in="SourceGraphic" in2="ink-grain" scale="32" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`;
    const wash=document.createElement('div');
    wash.className='language-ink-wash';wash.setAttribute('aria-hidden','true');wash.style.filter=`url(#${filterId})`;
    document.body.append(filterSvg);
    document.body.append(wash);
    group?.classList.add('is-inking');button?.classList.add('is-target');
    let applied=false,finished=false;
    const apply=()=>{if(applied)return;applied=true;applyLanguage(target);initialized=true;
      document.querySelectorAll('.leaf :is(h1,h2,h3,h4,p,figcaption,li,blockquote)').forEach((node,index)=>{
        if(typeof node.animate==='function')node.animate([{opacity:.2,filter:'blur(2px)'},{opacity:1,filter:'blur(0)'}],{duration:420,delay:Math.min(index*9,270),easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
      });
    };
    const finish=()=>{if(finished)return;finished=true;apply();wash.remove();filterSvg.remove();group?.classList.remove('is-inking');button?.classList.remove('is-target');if(finishLanguageTransition===finish)finishLanguageTransition=null};
    finishLanguageTransition=finish;
    try{
      const animation=wash.animate([
        {clipPath:shape(0,0,from),offset:0},
        {clipPath:shape(175,175,from),offset:.48,easing:'cubic-bezier(.2,.8,.25,1)'},
        {clipPath:shape(175,175,to),offset:.62,easing:'cubic-bezier(.4,0,.2,1)'},
        {clipPath:shape(175,175,to),offset:.78},
        {clipPath:shape(0,0,to),offset:1,easing:'cubic-bezier(.55,0,.8,.2)'}
      ],{duration:1250,fill:'forwards'});
      window.setTimeout(apply,820);
      animation.finished.then(finish,finish);
      window.setTimeout(finish,1500);
    }catch{finish()}
  };
  window.siteLanguage=()=>language;
  window.siteText=translate;
  document.querySelectorAll('.lang-switch [data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang)));
  applyLanguage(language);
  initialized=true;

  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='childList')record.addedNodes.forEach(translateTree);
      else if(record.type==='characterData'){
        const node=record.target,current=node.nodeValue,original=textSources.get(node);
        if(original!==undefined&&current===translate(original))continue;
        textSources.set(node,current);translateText(node);
      }else if(record.type==='attributes'){
        const element=record.target,name=record.attributeName,current=element.getAttribute(name),originals=attrsFor(element),original=originals.get(name);
        if(original!==undefined&&current===translate(original))continue;
        originals.set(name,current);translateAttributes(element);
      }
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:translatableAttributes});
})();
