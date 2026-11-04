/* =====================================================================
 TradeLynin — photos (loaded after drafts.js)
   Attach a photo to: sales / purchases / quotations (bill form), payments, expenses, products,
   and an "opening balance bill" photo on customers / suppliers.
   Photos are shrunk (max 1200px, JPEG) and kept in this device's own app storage (IndexedDB), NOT in your data or backups.
   A record only holds a short photo id (record.photo / customer.obp).
 ===================================================================== */
IC.photo='<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="12" cy="12" r="3.4"/><path d="M8.5 5.5l1-2h5l1 2"/>';
const PHI='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="12" cy="12" r="3.4"/><path d="M8.5 5.5l1-2h5l1 2"/></svg>';
/* ---- device storage ---- */
const PHDB=new Promise((res,rej)=>{try{const q=indexedDB.open('tradelynin_photos',1);q.onupgradeneeded=()=>q.result.createObjectStore('p');q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}catch(e){rej(e)}});
const phTx=(m,f)=>PHDB.then(db=>new Promise((res,rej)=>{const t=db.transaction('p',m),r=f(t.objectStore('p'));t.oncomplete=()=>res(r&&r.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)}));
const phPut=(k,b)=>phTx('readwrite',s=>s.put(b,k)),phGet=k=>phTx('readonly',s=>s.get(k)).catch(()=>null),phDel=k=>phTx('readwrite',s=>s.delete(k)),phKeys=()=>phTx('readonly',s=>s.getAllKeys()).catch(()=>[]);
const phNew=()=>'ph'+Date.now().toString(36).padStart(8,'0')+Math.random().toString(36).slice(2,6);
const phBlob=u=>{const m=/^data:([^;]+);base64,(.*)$/.exec(u);if(!m)return null;const a=atob(m[2]),n=new Uint8Array(a.length);for(let i=0;i<a.length;i++)n[i]=a.charCodeAt(i);return new Blob([n],{type:m[1]})};
// <img data-ph="id"> fills itself from device storage as soon as it is on the page
const phLoad=async img=>{const r=img.dataset.ph;if(!r||img.dataset.pl)return;img.dataset.pl=1;const b=await phGet(r);if(b)img.src=URL.createObjectURL(b);else{const s=document.createElement('span');s.className='k';s.textContent='Photo is not on this device';img.replaceWith(s)}};
new MutationObserver(()=>document.querySelectorAll('img[data-ph]:not([data-pl])').forEach(phLoad)).observe(document.body,{childList:true,subtree:true});

const phArr=v=>Array.isArray(v)?v.filter(Boolean):(v?[v]:[]);
const phOf=r=>r?phArr(r.photos&&r.photos.length?r.photos:r.photo):[];            // a record's photos (older single photo included)
const phPv=v=>v?`<img data-ph="${esc(v)}" alt="Attached photo" onclick="phShow(this.dataset.ph)">`:'<span class="k">No photo attached</span>';
const phGrid=a=>a.length?a.map((r,i)=>`<div class="ph-t"><img data-ph="${esc(r)}" alt="Photo ${i+1}" onclick="phShowW(this,${i})"><button type="button" class="ph-x" aria-label="Remove photo" onclick="phDelAt(this,${i})">✕</button></div>`).join(''):'<span class="k">No photos attached</span>';
// the widget: single photo (products, customers) or several (transactions). Photo ids live in a hidden input inside #<id>
function phW(id,val,multi){if(multi){const a=phArr(val);return`<div class="ph-w ph-m" id="${id}"><input type="hidden" class="ph-v" value="${esc(JSON.stringify(a))}"><div class="ph-g">${phGrid(a)}</div><div class="ph-b"><label class="ph-bt">${PHI}<span>Take photo</span><input type="file" accept="image/*" capture="environment" hidden onchange="phPick('${id}',this)"></label><label class="ph-bt">${PHI}<span>Add photos</span><input type="file" accept="image/*" multiple hidden onchange="phPick('${id}',this)"></label></div></div>`}
 val=val||'';return`<div class="ph-w" id="${id}"><input type="hidden" class="ph-v" value="${esc(val)}"><div class="ph-pv">${phPv(val)}</div><div class="ph-b"><label class="ph-bt">${PHI}<span>Take photo</span><input type="file" accept="image/*" capture="environment" hidden onchange="phPick('${id}',this)"></label><label class="ph-bt">${PHI}<span>Choose photo</span><input type="file" accept="image/*" hidden onchange="phPick('${id}',this)"></label><button type="button" class="g s ph-rm" onclick="phClr('${id}')"${val?'':' style="display:none"'}>Remove</button></div></div>`}
const phVal=id=>{const w=document.getElementById(id),i=w&&w.querySelector('.ph-v');return i?i.value:''};
const phVals=id=>{try{return phArr(JSON.parse(phVal(id)||'[]'))}catch(e){return[]}};
function phSet(id,v){const w=document.getElementById(id);if(!w)return;
 if(w.classList.contains('ph-m')){const a=phArr(v);w.querySelector('.ph-v').value=JSON.stringify(a);w.querySelector('.ph-g').innerHTML=phGrid(a);return}
 w.querySelector('.ph-v').value=v||'';w.querySelector('.ph-pv').innerHTML=phPv(v);w.querySelector('.ph-rm').style.display=v?'':'none'}
function phClr(id){phSet(id,'')}
function phDelAt(btn,i){const w=btn.closest('.ph-w'),a=phVals(w.id);a.splice(i,1);phSet(w.id,a)}
function phShowW(img,i){phShow(phVals(img.closest('.ph-w').id),i)}
function phComp(file,cb){const url=URL.createObjectURL(file),im=new Image();im.onerror=()=>{URL.revokeObjectURL(url);cb(null)};im.onload=()=>{URL.revokeObjectURL(url);const k=Math.min(1,1200/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);c.toBlob(b=>cb(b),'image/jpeg',.78)};im.src=url}
const phOne=f=>new Promise(res=>phComp(f,async b=>{if(!b)return res(null);const k=phNew();try{await phPut(k,b);res(k)}catch(e){res(null)}}));
async function phPick(id,inp){const fs=[...(inp.files||[])];inp.value='';if(!fs.length)return;if(fs.some(f=>!/^image\//.test(f.type)))return toast('Please choose images only');toast('Preparing photo'+(fs.length>1?'s':'')+'…');
 const w=document.getElementById(id),multi=w&&w.classList.contains('ph-m');let ok=0,bad=0;
 for(const f of fs){const k=await phOne(f);if(!k){bad++;continue}ok++;if(multi)phSet(id,[...phVals(id),k]);else phSet(id,k)}
 toast(bad?(ok?ok+' added, '+bad+' could not be read':'Could not store the photo on this device'):(ok>1?ok+' photos added':'Photo added'))}
// full-screen viewer (its own layer, so an open form is never lost); several photos: swipe or use the arrows
let _pg9={a:[],i:0};
function phShow(src,i){const a=phArr(src);if(!a.length)return;phClose();_pg9={a,i:Math.min(Math.max(i||0,0),a.length-1)};const o=document.createElement('div');o.id='phov';o.className='phov';
 o.innerHTML=`<button type="button" class="phov-x" aria-label="Close" onclick="phClose()">✕</button>${a.length>1?`<button type="button" class="phov-n prev" aria-label="Previous" onclick="phNav(-1)">‹</button><button type="button" class="phov-n next" aria-label="Next" onclick="phNav(1)">›</button><div class="phov-c"></div>`:''}`;
 o.onclick=e=>{if(e.target==o)phClose()};let x0=null;o.ontouchstart=e=>{x0=e.touches[0].clientX};o.ontouchend=e=>{if(x0==null||a.length<2)return;const d=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(d)>50)phNav(d<0?1:-1)};
 document.body.append(o);phFill()}
function phFill(){const o=document.getElementById('phov');if(!o)return;const {a,i}=_pg9;o.querySelectorAll('img,span.k').forEach(e=>e.remove());const im=document.createElement('img');im.alt='Photo';im.dataset.ph=a[i];o.append(im);const c=o.querySelector('.phov-c');if(c)c.textContent=(i+1)+' / '+a.length}
function phNav(d){const n=_pg9.a.length;if(n<2)return;_pg9.i=(_pg9.i+d+n)%n;phFill()}
function phClose(){const o=document.getElementById('phov');if(o)o.remove()}
addEventListener('keydown',e=>{if(!document.getElementById('phov'))return;if(e.key=='Escape'){e.stopImmediatePropagation();phClose()}else if(e.key=='ArrowLeft')phNav(-1);else if(e.key=='ArrowRight')phNav(1)},true);
function phShowRec(k,id){let r=null;if(k=='p')r=D.p.find(x=>x.id==id);else if(k=='c'||k=='s'){r=(k=='c'?D.c:D.s).find(x=>x.id==id);if(r&&r.obp)return phShow(r.obp);return toast('No photo attached')}else if(k=='tx')r=D.sa.find(x=>x.id==id)||D.pu.find(x=>x.id==id)||QT().find(x=>x.id==id);else if(k=='pay')r=D.pay.find(x=>x.id==id);else if(k=='ex')r=D.ex.find(x=>x.id==id);
 const a=phOf(r);if(a.length)phShow(a,0);else toast('No photo attached')}
const phBtn=(k,id)=>`<button type="button" class="ph-th" aria-label="View photo" onclick="event.stopPropagation();phShowRec('${k}',${id})">${PHI}</button>`;

/* ---- startup: ask the browser not to evict photos · move any older inline photos (v23) into device storage · delete photos no record points to ---- */
async function phInit(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
 const m=document.getElementById('m');if(m&&m.style.display=='flex')return setTimeout(phInit,20000);
 const recs=[...D.sa,...D.pu,...(D.qt||[]),...D.pay,...D.ex,...D.p,...D.c,...D.s];let ch=0;
 for(const r of recs)for(const f of['photo','obp'])if(typeof r[f]=='string'&&r[f].startsWith('data:')){const b=phBlob(r[f]);if(!b){delete r[f];ch=1;continue}const k=phNew();try{await phPut(k,b);r[f]=k;ch=1}catch(e){}}
 if(ch)save();
 const all=JSON.stringify(D),old=Date.now()-36e5;
 for(const k of await phKeys())if(!all.includes(k)&&(parseInt(String(k).slice(2,10),36)||0)<old)await phDel(k)}
setTimeout(phInit,3000);
