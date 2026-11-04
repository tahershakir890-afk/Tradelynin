/* TradeLynin service worker — offline app shell + cached export libraries */
const VER='tradelynin-v118',CDN='https://cdnjs.cloudflare.com';
const CORE=['./','./index.html','./manifest.webmanifest',
 './base.css','./larger-ui.css','./fonts.css','./brand.css','./overrides.css','./history.css','./responsive.css','./stock3.css','./prod5.css','./gd5.css','./party6.css','./invoice.css','./v47.css','./v50.css','./lossrec.css','./v55.css','./uparty.css','./pcard.css',
 './logo.js','./app.js','./docs.js','./templates.js','./screens.js','./txlist.js','./dropdown.js','./filters.js','./settings2.js','./bill2.js','./drafts.js','./photos.js','./bulk2.js','./split2.js','./print2.js','./cashcredit.js','./settle.js','./history.js','./stock3.js','./prod5.js','./nmw.js','./gd5.js','./party6.js','./notify.js','./lossrec.js','./uparty.js','./followup.js','./stepper.js','./features2.js','./pwa.js','./i18n-ar.js',
 './poppins-400.woff','./poppins-500.woff','./poppins-700.woff','./logo.png',
 './badge-96.png','./icon-192.png','./icon-512.png','./icon-512-maskable.png','./apple-touch-icon.png'];
// NOTE: bump VER whenever you change any file above, so installed copies pick up the update.
const LIBS=['/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'].map(p=>CDN+p);
// Fetch a library in CORS mode so the status is readable; only successful responses are ever cached
const getLib=async(c,url)=>{const r=await fetch(url,{mode:'cors',credentials:'omit'});if(!r.ok)throw new Error('bad status '+r.status);await c.put(url,r.clone());return r};
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(VER);
 await Promise.allSettled(CORE.map(u=>c.add(u)));
 await Promise.allSettled(LIBS.map(u=>getLib(c,u)));   // failures are fine: retried the next time a page asks for them
 self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==VER)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===CDN){e.respondWith((async()=>{const c=await caches.open(VER),m=await c.match(r.url);if(m)return m;
   if(LIBS.includes(r.url)){try{return await getLib(c,r.url)}catch(err){}}   // cache it for next time
   try{return await fetch(r)}catch(err){return Response.error()}})());return}
 if(u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith((async()=>{const c=await caches.open(VER);let n=null;
  try{n=await fetch(r);   // network first so updates arrive; only a REAL copy of this app is ever cached or trusted
   if(n.ok&&(n.headers.get('content-type')||'').includes('html')){const t=await n.clone().text();if(t.includes('id="dr"')){c.put('./',n.clone());return n}}}catch(err){}
  // offline, or the host answered with an error / "site paused" page -> open the saved copy of the app
  return (await c.match('./'))||(await c.match(r,{ignoreSearch:true}))||n||Response.error()})());return}
 e.respondWith((async()=>{const c=await caches.open(VER),m=await c.match(r,{ignoreSearch:true});   // network first so a new deploy always shows; cache is the offline fallback
  try{const n=await fetch(r);if(n.ok){if(!(n.headers.get('content-type')||'').includes('text/html'))c.put(r,n.clone());return n}return m||n}catch(err){return m||Response.error()}})())});

/* ---- daily summary: opening the app from a notification, and a best-effort background check ---- */
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./#notif',self.registration.scope).href;
 e.waitUntil((async()=>{const L=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of L){if(c.url.startsWith(self.registration.scope)){try{await c.focus();if('navigate' in c)await c.navigate(u);return}catch(err){}}}
  await clients.openWindow(u)})())});
const idb=fn=>new Promise(res=>{try{const q=indexedDB.open('tl_nt',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onerror=()=>res(null);q.onsuccess=()=>{const db=q.result;try{const r=fn(db.transaction('kv','readwrite').objectStore('kv'));r.onsuccess=()=>{res(r.result);db.close()};r.onerror=()=>{res(null);db.close()}}catch(err){res(null)}}}catch(err){res(null)}});
self.addEventListener('periodicsync',e=>{if(e.tag!=='tl-daily')return;
 e.waitUntil((async()=>{const p=await idb(s=>s.get('plan'));if(!p||!p.on||!p.slots)return;
  const d=new Date(),pad=n=>String(n).padStart(2,'0'),td=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()),nm=d.getHours()*60+d.getMinutes(),now=Date.now();
  if(p.day!==td||nm>1200||p.slots.some(x=>x.at&&now-x.at<36e5))return;
  const s=p.slots.find(x=>!x.sent&&x.m<=nm&&nm-x.m<=240);if(!s)return;
  s.sent=1;
  if(s.n&&s.tt){s.at=now;{const i=p.slots.indexOf(s),nx=p.slots[i+1];if(nx&&!nx.sent)nx.m=Math.max(nx.m,nm+(i==0?(p.g1||240):90))}await self.registration.showNotification(s.tt,{body:s.bd||'',badge:'badge-96.png',tag:'tl-nt-'+s.k+'-'+td,data:{url:'./#notif'}})}
  await idb(st=>st.put(p,'plan'))})())});

/* ---- recurring-expense reminders (js/lossrec.js keeps the event list in IndexedDB 'rx') ---- */
self.addEventListener('periodicsync',e=>{if(e.tag!=='tl-rx')return;
 e.waitUntil((async()=>{const p=await idb(s=>s.get('rx'));if(!p||!p.on||!p.ev)return;const now=Date.now();p.done=p.done||{};let ch=0;
  for(const v of p.ev){if(v.at<=now&&now-v.at<=1296e5&&!p.done[v.k]){p.done[v.k]=now;ch=1;await self.registration.showNotification(v.tt,{body:v.bd||'',badge:'badge-96.png',tag:'tl-rx-'+v.k,data:{url:'./#lossrec'}})}}
  if(ch)await idb(s=>s.put(p,'rx'))})())});
