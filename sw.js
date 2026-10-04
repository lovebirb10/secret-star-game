/* Generated offline cache; scoped to this repository, never to other sites. */
const PREFIX='secret-star-pages-';
const CACHE=PREFIX+'74952937f9c24df0';
const FILES=["./","./README.md","./app.css","./assets/audio/failure.wav","./assets/audio/invite.wav","./assets/audio/message.wav","./assets/audio/mole.wav","./assets/audio/page.wav","./assets/audio/send.wav","./assets/audio/sms.wav","./assets/audio/success.wav","./assets/audio/tile.wav","./assets/captcha-pet-0.jpg","./assets/captcha-pet-1.jpg","./assets/captcha-pet-10.jpg","./assets/captcha-pet-11.jpg","./assets/captcha-pet-12.jpg","./assets/captcha-pet-13.jpg","./assets/captcha-pet-14.jpg","./assets/captcha-pet-15.jpg","./assets/captcha-pet-2.jpg","./assets/captcha-pet-3.jpg","./assets/captcha-pet-4.jpg","./assets/captcha-pet-5.jpg","./assets/captcha-pet-6.jpg","./assets/captcha-pet-7.jpg","./assets/captcha-pet-8.jpg","./assets/captcha-pet-9.jpg","./assets/car.jpg","./assets/dog.jpg","./assets/fiction.jpg","./assets/home-bunny.jpg","./assets/home-stilllife.jpg","./assets/idol-cafe.jpg","./assets/idol-music.jpg","./assets/idol-studio.jpg","./assets/idol-window.jpg","./assets/landscape.jpg","./assets/necklace.jpg","./assets/ring.jpg","./assets/shirt.jpg","./assets/sleep.jpg","./assets/song.jpg","./assets/transfer.jpg","./game-content.js","./game-core.js","./game-loader.js","./game-page.js","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./index.html","./manifest.webmanifest","./phone.html","./pwa.js","./runtime.js","./template.js"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll(FILES);}catch(error){await caches.delete(CACHE);throw error;}
 // Wait for existing game windows to close before activating a new version.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 event.respondWith((async()=>{
  try{const response=await fetch(event.request);if(response.ok)return response;
   const cached=await (await caches.open(CACHE)).match(event.request,{ignoreSearch:true});return cached||response;
  }catch(error){const cached=await (await caches.open(CACHE)).match(event.request,{ignoreSearch:true});
   return cached||new Response('请联网打开一次游戏，完成离线缓存。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
 })());
});
