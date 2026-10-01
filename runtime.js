/* Local preview adapter only. This file is never copied into the native widget. */
(function () {
  const expressions = new Map();
  function evaluate(code, data) {
    if (!expressions.has(code)) expressions.set(code, new Function('data', 'with(data){return (' + code + ')}'));
    return expressions.get(code)(data);
  }
  function interpolate(value, scope) {
    const exact = /^{{((?:(?!}})[\s\S])*)}}$/.exec(value);
    if (exact) return evaluate(exact[1], scope);
    return value.replace(/{{([\s\S]*?)}}/g, (_,expr) => { const result=evaluate(expr,scope); return result == null ? '' : String(result); });
  }
  let page, scrollPositions = {};
  window.xhs = {
    createInnerAudioContext(){
      const audio=new Audio();audio.preload='auto';let onError=()=>{},disposed=false;
      function report(error){if(!disposed&&(!error||error.name!=='AbortError'))onError(error);}
      audio.addEventListener('error',()=>report({message:audio.error&&audio.error.message||'播放器无法加载音频'}));
      return {
        set src(value){audio.src=value;},set volume(value){audio.volume=value;},set loop(value){audio.loop=value;},
        play(){const result=audio.play();if(result&&result.catch)result.catch(report);},
        stop(){audio.pause();try{audio.currentTime=0;}catch(_){}},
        destroy(){disposed=true;audio.pause();audio.removeAttribute('src');audio.load();},
        onError(listener){onError=listener;}
      };
    },
    getSystemInfoSync(){return {windowWidth:window.innerWidth||375,windowHeight:window.innerHeight||667,screenHeight:window.innerHeight||667};},
    getStorageSync(key) { const value=localStorage.getItem(key); return value ? JSON.parse(value) : ''; },
    setStorageSync(key,value) { localStorage.setItem(key,JSON.stringify(value)); },
    setStorage({key,data,success,complete}) { localStorage.setItem(key,JSON.stringify(data)); const result={errMsg:'setStorage:ok'}; if(success)success(result); if(complete)complete(result); return Promise.resolve(result); }
  };
  function renderNodes(nodes, parent, scope, route) {
    let chain = null;
    nodes.forEach((node,index)=>{
      const nodeRoute = route + '.' + index;
      if (node.text !== undefined) {
        if (!node.text.trim()) return;
        const text = interpolate(node.text,scope);
        parent.appendChild(document.createTextNode(text == null ? '' : String(text)));
        return;
      }
      const attrs = node.attrs;
      if ('xhs:if' in attrs) { chain=!!interpolate(attrs['xhs:if'],scope); if(!chain)return; }
      else if ('xhs:elif' in attrs) { if(chain)return;chain=!!interpolate(attrs['xhs:elif'],scope);if(!chain)return; }
      else if ('xhs:else' in attrs) { if(chain)return;chain=true; }
      else chain=null;
      if ('xhs:for' in attrs) {
        const list=interpolate(attrs['xhs:for'],scope)||[];
        list.forEach((item,itemIndex)=>{
          const child=Object.assign({},node,{attrs:Object.assign({},attrs)});delete child.attrs['xhs:for'];
          const childScope=Object.assign({},scope,{[attrs['xhs:for-item']||'item']:item,[attrs['xhs:for-index']||'index']:itemIndex});
          renderNodes([child],parent,childScope,nodeRoute+'.'+itemIndex);
        });
        return;
      }
      if(node.tag==='block'){renderNodes(node.children,parent,scope,nodeRoute);return;}
      const element=document.createElement(node.tag==='button'?'button':node.tag==='text'?'span':node.tag==='image'?'img':'div');
      if(node.tag==='image')element.alt='微光动态配图';
      if(node.tag==='scroll-view'){element.classList.add('native-scroll');element.dataset.scrollKey=nodeRoute;}
      for(const [name,raw] of Object.entries(attrs)){
        if(name.startsWith('xhs:')||['scroll-y','scroll-x'].includes(name))continue;
        if(name==='bindtap'||name==='catchtap'){
          element.addEventListener('click',event=>{
            if(name==='catchtap')event.stopPropagation();
            page[raw]({currentTarget:{dataset:Object.assign({},element.dataset)},target:{dataset:Object.assign({},event.target.dataset)},detail:{}});
          });continue;
        }
        const value=interpolate(raw,scope);
        if(name==='disabled'){element.disabled=!!value;continue;}
        if(name==='hidden'){element.hidden=!!value;continue;}
        if(name==='class'){element.className+=(element.className?' ':'')+value;continue;}
        if(name==='style'){element.setAttribute('style',String(value).replace(/(-?[\d.]+)rpx/g,(_,n)=>'calc('+n+' * 100vw / 750)'));continue;}
        if(value!==null&&value!==undefined){
          // Native images use app-root paths. Pages project sites live below
          // /<repository>/, so resolve assets from this document instead.
          const resolved=name==='src'&&node.tag==='image'&&String(value).startsWith('/assets/')
            ? String(value).slice(1) : String(value);
          element.setAttribute(name,resolved);
        }
      }
      renderNodes(node.children,element,scope,nodeRoute);
      parent.appendChild(element);
    });
  }
  let scheduled=false, previousScreen='';
  function render(){
    scheduled=false;
    const screen=page.data.mode + ':' + page.data.screen + ':' + (page.data.smsContact||'') + ':' + page.data.vm.day + ':' + page.data.vm.slot;
    if(screen===previousScreen){document.querySelectorAll('[data-scroll-key]').forEach(e=>{scrollPositions[e.dataset.scrollKey]=e.scrollTop;});}
    else scrollPositions={};
    previousScreen=screen;
    const fragment=document.createDocumentFragment();
    renderNodes(window.__template,fragment,page.data,'root');
    document.getElementById('app').replaceChildren(fragment);
    document.querySelectorAll('[data-scroll-key]').forEach(e=>{e.scrollTop=scrollPositions[e.dataset.scrollKey]||0;});
  }
  window.Page=function(definition){
    page=Object.assign({},definition,{data:JSON.parse(JSON.stringify(definition.data))});
    page.setData=function(patch,callback){Object.assign(page.data,JSON.parse(JSON.stringify(patch)));if(!scheduled){scheduled=true;queueMicrotask(render);}if(callback)queueMicrotask(callback);};
    page.onLoad();render();
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&page.onHide)page.onHide();else if(!document.hidden&&page.onShow)page.onShow();});
    window.addEventListener('pagehide',()=>{if(page.onUnload)page.onUnload();});
    window.addEventListener('resize',()=>{if(page.onResize)page.onResize({size:{windowWidth:window.innerWidth,windowHeight:window.innerHeight}});});
  };
})();
