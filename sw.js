const CACHE='nizam-v14';
const SHELL=['./','./index.html','./manifest.json','./icon-v2-192.png','./icon-v2-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const wait=ms=>new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  const isDoc=r.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/');
  if(isDoc){
    e.respondWith(Promise.race([fetch(r),wait(4000)]).then(res=>{
      const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res;
    }).catch(()=>caches.match(r).then(h=>h||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>hit);
    return hit||net;
  }));
});
