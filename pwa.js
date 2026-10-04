/* File previews still work; only secure web hosting registers the offline worker. */
(function(){
  if(window.navigator.standalone)document.documentElement.classList.add('standalone');
  if('serviceWorker' in navigator && ['https:','http:'].includes(location.protocol)){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'})
        .catch(error=>console.warn('离线缓存暂不可用，联网时仍可正常游戏。',error.message));
    });
  }
})();
