/* =====================================================================
 TradeLynin — daily business notifications   (loaded after party6.js)
   · ntBuild()   builds today's task list from the existing data (nothing is stored twice)
   · V.notif     "Today's tasks" screen (menu → Notifications, or the bell in the header)
   · SEC.nt      Settings → App → Notifications
   · ntTick()    sends 3 separate notifications a day (one topic each) at random, different daytime moments
 Settings live in S.nt (so they travel with backups); "last sent" is per device in localStorage / IndexedDB.
 Categories: overdue customer payments · overdue supplier payments · pending quotations · draft invoices
             · low stock · reorder alerts (grouped by supplier) · dead stock
 ===================================================================== */
Object.assign(IC,{
 bell:'<path d="M6 16V11a6 6 0 0112 0v5l1.6 2H4.4z"/><path d="M10 21a2 2 0 004 0"/>',
 check2:'<path d="M5 12.5l4.5 4.5L19 7.5"/>'
});

const NTD={on:false,time:'09:00',skip:false,qd:3,dd:90,c:{od:1,sod:1,sq:1,dr:1,low:1,ro:1,dead:1,fu:1},snz:{}};
const NTC=[ // key, title, colour, setting label, setting hint
 ['od','Overdue customer payments','#e11d48','Overdue customer payments','Bills a customer has not paid within their credit days'],
 ['sod','Overdue supplier payments','#ea580c','Overdue supplier payments','Bills you have not paid within the supplier\u2019s credit days'],
 ['sq','Pending quotations','#2563eb','Pending quotations','Open quotations that have not become a sale'],
 ['dr','Draft invoices','#7c3aed','Draft invoices','Unfinished sales and purchases saved as drafts'],
 ['low','Low stock','#f59e0b','Low stock','Items at or below their minimum, or out of stock but selling'],
 ['ro','Reorder alerts','#0d9488','Reorder alerts','Suggested purchase orders, grouped by supplier'],
 ['dead','Dead stock','#64748b','Dead stock','Items in stock that have stopped selling'],
 ['fu','Customer follow-ups','#0891b2','Customer follow-ups','Customers who have not ordered for over 7 days (not already followed up in the last 7 days)']];
const ntS=()=>{const x=S.nt||{};return Object.assign({},NTD,x,{c:Object.assign({},NTD.c,x.c||{}),snz:Object.assign({},x.snz||{})})};
function ntSet(k,v){if(ME&&ME.role=='viewer')return toast('View-only access');const o=ntS();if(k.startsWith('c.'))o.c[k.slice(2)]=v?1:0;else o[k]=v;
 const t=today();Object.keys(o.snz).forEach(z=>{if(o.snz[z]<t)delete o.snz[z]});S.nt=o;save();ntPing();go(1)}
const ntDay=(a,b)=>Math.floor((Date.parse(a)-Date.parse(b))/864e5);
const ntDue=(t,P)=>new Date(Date.parse(t.date)+cdays(P)*864e5).toISOString().slice(0,10);
const ntU=p=>esc((p&&p.u1)||'Pcs');

/* the same suggestion rules as the Reorder List screen, without its screen filters */
function ntReorderList(){const m=mv(),sup={};
 D.pu.forEach(t=>{if(t.ret||!t.pid)return;t.items.forEach(i=>{if(!sup[i.pid]||t.date>=sup[i.pid].d)sup[i.pid]={d:t.date,s:t.pid}})});
 return D.p.map(p=>{const r=m[p.id],st=stock(p.id);return{p,r,st,need:Math.ceil(Math.max(r.q90/3,N(p.min)*2)-st),s:(sup[p.id]||{}).s||0}})
  .filter(x=>x.st<=N(x.p.min)&&x.need>0&&(N(x.p.min)>0||x.r.q90>0)).sort((a,b)=>b.r.q90-a.r.q90)}
function ntPO(sid){window._rl=ntReorderList();poForm(sid)}
function ntProd(id){if(location.hash=='#products'){prodTx(id);return}nav('products');setTimeout(()=>prodTx(id),90)}
function ntParty(t,id){const h=t=='c'?'#parties':'#parties';if(location.hash==h){partyTx(t,id);return}nav('parties',()=>{_pg=t=='s'?'s':'c'});setTimeout(()=>partyTx(t,id),90)}

/* ---- build the task list ---- */
function ntBuild(){const o=ntS(),td=today(),G={};NTC.forEach(c=>G[c[0]]={k:c[0],t:c[1],c:c[2],items:[],hid:0,tot:0});
 const add=(k,it)=>{if(!o.c[k])return;if(o.snz[it.key]&&o.snz[it.key]>=td){G[k].hid++;return}G[k].items.push(it);G[k].tot+=N(it.amt)};
 // overdue payments, one line per bill (opening balances too, when an "as of" date is set)
 [['c','od',D.c,'sa'],['s','sod',D.s,'pu']].forEach(([t,k,A,kind])=>A.forEach(P=>{
  pend(t,P.id).forEach(y=>{const d=od(y.t,P);if(!(d>0))return;
   add(k,{key:k+':'+y.t.id,t:P.n+' · '+y.t.no,s:'Due '+ntDue(y.t,P)+' · '+d+' day'+(d==1?'':'s')+' overdue',amt:y.due,days:d,go:`invoice(${y.t.id})`})});
  const ob=obDue(t,P.id);if(ob){const d=od(ob.t,P);if(d>0)add(k,{key:k+':ob:'+P.id,t:P.n+' · Opening balance',s:'Due '+ntDue(ob.t,P)+' · '+d+' day'+(d==1?'':'s')+' overdue',amt:ob.due,days:d,go:`ntParty('${t}',${P.id})`})}}));
 G.od.items.sort((a,b)=>b.days-a.days);G.sod.items.sort((a,b)=>b.days-a.days);
 // quotations still open after a few days
 if(FT('quotes'))QT().filter(q=>q.st!='Converted').forEach(q=>{const a=ntDay(td,q.date);if(a<o.qd)return;
  add('sq',{key:'sq:'+q.id,t:q.no+' · '+(nm(D.c,q.pid)||'Walk-In'),s:'Quoted '+q.date+' · '+a+' day'+(a==1?'':'s')+' ago',amt:tot(q).total,days:a,go:`invoice(${q.id})`})});
 G.sq.items.sort((a,b)=>b.days-a.days);
 // drafts left from an earlier day (a draft you are still typing today is not a task)
 (D.dr||[]).filter(d=>d.type=='doc').forEach(d=>{const dd=_ld(new Date(d.at)),a=ntDay(td,dd);if(a<1)return;
  add('dr',{key:'dr:'+d.id,t:d.label+' draft'+(d.party?' · '+d.party:''),s:'Started '+dd+' · '+a+' day'+(a==1?'':'s')+' ago',amt:d.amt||0,days:a,go:`drOpen(${d.id})`})});
 G.dr.items.sort((a,b)=>b.days-a.days);
 // low stock (an item with no minimum and no sales is not worth an alert)
 const m=mv();
 D.p.forEach(p=>{const st=stock(p.id),mn=N(p.min),sold=m[p.id].q90>0,out=st<=0;
  if(!((mn>0&&st<=mn)||(out&&sold)))return;
  add('low',{key:'low:'+p.id,t:p.n,s:out?'Out of stock'+(mn>0?' · minimum '+mn:''):st+' '+ntU(p)+' left · minimum '+mn,amt:0,out,go:`ntProd(${p.id})`})});
 G.low.items.sort((a,b)=>(b.out-a.out)||a.t.localeCompare(b.t));
 // reorder alerts: one line per supplier, so the same item is never listed twice inside this group
 if(FT('reorder')){const by={};ntReorderList().forEach(x=>(by[x.s]=by[x.s]||[]).push(x));
  Object.keys(by).forEach(s=>{const L=by[s],sp=D.s.find(z=>z.id==s),names=L.slice(0,3).map(x=>x.p.n+' ×'+x.need).join(', ')+(L.length>3?' +'+(L.length-3)+' more':'');
   add('ro',{key:'ro:'+s,t:(sp?sp.n:'No supplier yet')+' · '+L.length+' item'+(L.length==1?'':'s'),s:names,amt:L.reduce((a,x)=>a+x.need*N(x.p.cost),0),est:1,n:L.length,go:sp?`ntPO(${s})`:`nav('products',()=>_pr='reorder')`})})}
 G.ro.items.sort((a,b)=>b.n-a.n);
 // dead stock: in stock, and no sale for N days (never-sold items count only when first bought more than N days ago)
 const first={};D.pu.forEach(t=>{if(t.ret)return;t.items.forEach(i=>{if(!first[i.pid]||t.date<first[i.pid])first[i.pid]=t.date})});
 D.p.forEach(p=>{const st=stock(p.id);if(st<=0)return;const r=m[p.id],idle=r.l?r.days:(first[p.id]?ntDay(td,first[p.id]):null);if(idle==null||idle<o.dd)return;
  add('dead',{key:'dead:'+p.id,t:p.n,s:st+' '+ntU(p)+' · '+(r.l?'last sold '+r.l:'never sold')+' · '+idle+' days idle',amt:val(p.id),days:idle,go:`ntProd(${p.id})`})});
 G.dead.items.sort((a,b)=>b.days-a.days);
 // customer follow-ups: customers with no order for over 7 days, skipping anyone already contacted in the last 7 days (js/followup.js)
 if(typeof fuData=='function'&&FT('followups')){let A=[];try{A=fuData()}catch(e){}
  A.filter(x=>x.st=='in'&&!(x.fu&&ntDay(td,x.fu)<FU_DAYS)).forEach(x=>add('fu',{key:'fu:'+x.c.id,t:x.c.n,s:(x.reg?'Regular customer · ':'')+'Last order '+x.days+' day'+(x.days==1?'':'s')+' ago'+(x.reg&&x.gap?' · usually every '+x.gap+' day'+(x.gap==1?'':'s'):''),amt:0,days:x.days,reg:x.reg?1:0,go:"nav('followups')"}));
  G.fu.items.sort((a,b)=>(b.reg-a.reg)||b.days-a.days)}
 const groups=NTC.map(c=>G[c[0]]).filter(g=>g.items.length);
 return{date:td,groups,n:groups.reduce((s,g)=>s+g.items.length,0),hid:Object.values(G).reduce((s,g)=>s+g.hid,0),
  sig:groups.map(g=>g.items.map(i=>i.key).sort().join(',')).join('|')}}

/* ---- the text of ONE notification = ONE category ---- */
function ntText(g){const pl=(n,w)=>n+' '+w+(n==1?'':'s'),un=a=>[...new Set(a)],f=x=>x.t.split(' \u00b7 ')[0],more=(L,n)=>L.slice(0,n).join(', ')+(L.length>n?' +'+(L.length-n)+' more':''),n=g.items.length;
 switch(g.k){
 case'od':{const L=un(g.items.map(f));return{title:'Collect payments \u00b7 '+M(g.tot),body:pl(L.length,'customer')+' overdue ('+pl(n,'bill')+')\n'+more(L,3)}}
 case'sod':{const L=un(g.items.map(f));return{title:'Supplier payments due \u00b7 '+M(g.tot),body:'You owe '+pl(L.length,'supplier')+' overdue ('+pl(n,'bill')+')\n'+more(L,3)}}
 case'sq':return{title:'Pending quotations',body:pl(n,'quotation')+' not converted yet\n'+more(g.items.map(x=>x.t),2)}
 case'dr':return{title:'Drafts to finish',body:pl(n,'unfinished draft')+'\n'+more(g.items.map(x=>x.t),2)}
 case'low':return{title:'Low stock',body:pl(n,'item')+' running low or out\n'+more(g.items.map(x=>x.t),4)}
 case'ro':return{title:'Time to reorder',body:'Suggested purchase from '+pl(n,'supplier')+'\n'+more(g.items.map(x=>x.t),2)}
 case'fu':{const r=g.items.filter(x=>x.reg).length;return{title:'Customer follow-ups',body:pl(n,'customer')+' not ordered for over '+FU_DAYS+' days'+(r?' ('+r+' regular)':'')+'\n'+more(g.items.map(x=>x.t),3)}}
 case'dead':return{title:'Dead stock \u00b7 '+M(g.tot)+' tied up',body:pl(n,'item')+' not selling\n'+more(g.items.map(x=>x.t),3)}}
 return{title:g.t,body:pl(n,'item')}}

/* ---- the day plan: 2 or 3 notifications, each a different topic, at different random moments in the daytime ----
   plan = {day, on, gen, slots:[{m:minute of day, k:category, sent, at, n, tt, bd}]}  kept in localStorage + IndexedDB (the service worker reads/updates the IndexedDB copy) */
const NTP='tl_nt_plan',NT_A=540,NT_Z=1200,NT_GAP=60; // allowed 09:00 - 20:00, at least 60 min between two notifications
const ntIdb=fn=>new Promise(res=>{try{const q=indexedDB.open('tl_nt',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onerror=()=>res(null);q.onsuccess=()=>{const db=q.result;try{const r=fn(db.transaction('kv','readwrite').objectStore('kv'));if(r&&r.onsuccess){r.onsuccess=()=>{res(r.result);db.close()};r.onerror=()=>{res(null);db.close()}}else{res(null);db.close()}}catch(e){res(null)}}}catch(e){res(null)}});
const ntIdbGet=k=>ntIdb(s=>s.get(k)),ntIdbSet=(k,v)=>ntIdb(s=>s.put(v,k));
const _nm=()=>{const d=new Date();return d.getHours()*60+d.getMinutes()};
function ntGen(){const d=ntBuild(),nm=_nm(),hi=NT_Z-30,cats=d.groups.map(g=>g.k),R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 for(let i=cats.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cats[i],cats[j]]=[cats[j],cats[i]]}
 // always 3 a day: 1st in the morning (or soon after the app is first opened), 2nd exactly 4-5 hours after the 1st, 3rd later in the evening
 const g1=R(240,300),f=nm<=650?R(Math.max(NT_A,nm+10),660):nm+10,T=[f,f+g1];if(T[1]+90<=hi)T.push(R(T[1]+90,hi));
 return{day:today(),on:!!ntS().on,gen:Date.now(),g1,slots:T.filter(m=>m<=hi).map((m,i)=>({m,k:cats[i]||null,sent:0}))}}
async function ntPlanGet(){const td=today();let p=await ntIdbGet('plan');
 if(!p||p.day!=td){try{p=JSON.parse(localStorage.getItem(NTP))}catch(e){p=null}}
 if(!p||p.day!=td||(!p.slots.length&&Date.now()-p.gen>30*6e4))p=ntGen();
 return p}
async function ntPlanSave(p){try{localStorage.setItem(NTP,JSON.stringify(p))}catch(e){}await ntIdbSet('plan',p)}

/* ---- show / send ---- */
const ntCan=()=>'Notification' in window;
async function ntShow(title,body,tag){const opt={body,badge:'icons/badge-96.png',tag:tag||'tl-nt',data:{url:'./#notif'}};
 try{if('serviceWorker' in navigator&&location.protocol!='file:'){const r=await navigator.serviceWorker.ready;await r.showNotification(title,opt);return true}}catch(e){}
 try{const n=new Notification(title,opt);n.onclick=()=>{focus();location.hash='#notif';n.close()};return true}catch(e){return false}}
let ntBusy=0;
async function ntTick(force){const o=ntS();
 if(force){const d=ntBuild();if(!d.n){toast('Nothing to report right now — you are all caught up');return}const t=ntText(d.groups[0]);await ntShow(t.title,t.body,'tl-test');toast('Test notification sent');return}
 if(!o.on||!ntCan()||Notification.permission!='granted'||ntBusy)return;
 ntBusy=1;try{const p=await ntPlanGet(),nm=_nm(),now=Date.now();
  if(nm>NT_Z||p.slots.some(x=>x.at&&now-x.at<NT_GAP*6e4)){ntBusy=0;return}
  const i=p.slots.findIndex(x=>!x.sent&&x.m<=nm&&nm-x.m<=240),s=p.slots[i];
  if(s){s.sent=1;const d=ntBuild(),used=p.slots.filter(x=>x!==s&&(x.sent||x.k)).map(x=>x.k);
   const g=d.groups.find(x=>x.k==s.k)||d.groups.find(x=>!used.includes(x.k));   // built fresh: if the planned topic is already sorted out, another topic that needs attention is used
   if(g){s.k=g.k;const t=ntText(g);await ntShow(t.title,t.body,'tl-nt-'+s.k+'-'+p.day);s.at=now;
    const nx=p.slots[i+1];if(nx&&!nx.sent)nx.m=Math.max(nx.m,nm+(i==0?(p.g1||240):90))}}   // sent late: keep the 4-5 h gap to the next one
  p.on=true;await ntPlanSave(p)}catch(e){}
 ntBusy=0;ntBell()}
/* keep today's plan (with fresh texts) where the service worker can reach it (for browsers that wake it in the background) */
async function ntPing(){try{const o=ntS(),p=await ntPlanGet(),d=ntBuild();p.on=!!o.on;
  p.slots.forEach(s=>{if(s.sent)return;if(!s.k||!d.groups.some(x=>x.k==s.k)){const u=p.slots.map(x=>x.k),f=d.groups.find(x=>!u.includes(x.k));if(f)s.k=f.k}const g=d.groups.find(x=>x.k==s.k);s.n=g?g.items.length:0;if(g){const t=ntText(g);s.tt=t.title;s.bd=t.body}});
  await ntPlanSave(p)}catch(e){}ntBell()}
async function ntToggle(){const o=ntS();if(o.on){ntSet('on',false);return}
 if(!ntCan())return toast('This browser does not support notifications');
 let p=Notification.permission;if(p=='default'){try{p=await Notification.requestPermission()}catch(e){}}
 if(p!='granted')return toast('Notifications are blocked — allow them in your browser or phone settings');
 ntSet('on',true);try{const r=await navigator.serviceWorker.ready;if(r.periodicSync)await r.periodicSync.register('tl-daily',{minInterval:2*36e5})}catch(e){}setTimeout(ntTick,300)}
async function ntAllow(){if(!ntCan())return toast('This browser does not support notifications');let p=Notification.permission;if(p=='default'){try{p=await Notification.requestPermission()}catch(e){}}go(1);if(p!='granted')toast('Notifications are blocked — allow them in your browser or phone settings')}
function ntSnooze(key,days){if(ME&&ME.role=='viewer')return toast('View-only access');const o=ntS();o.snz[key]=new Date(Date.now()+days*864e5).toISOString().slice(0,10);S.nt=o;save();go(1);toast('Hidden for '+days+' days')}
function ntClearSnz(){const o=ntS();o.snz={};S.nt=o;save();go(1);toast('Hidden alerts are back')}

/* ---- the "Today's tasks" screen ---- */
const ntAmt=(g,i)=>g.k=='low'?'':(i.est?'~':'')+(N(i.amt)>0.004?M(i.amt):'');
V.notif=()=>{const o=ntS(),d=ntBuild(),perm=ntCan()?Notification.permission:'unsupported';
 const dn=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
 const st=!o.on?`<div class="nt-st"><span>${ic('bell',20)}</span><div><b>Notifications are off</b><small>Get 3 short alerts a day, each about one thing that needs your attention.</small></div><button type="button" class="s" onclick="ntToggle()">Turn on</button></div>`
  :perm=='granted'?`<div class="nt-st ok"><span>${ic('bell',20)}</span><div><b>Notifications are on</b><small>3 separate alerts a day at different times, each about one topic.</small></div></div>`
  :`<div class="nt-st warn"><span>${ic('bell',20)}</span><div><b>Notifications are not allowed</b><small>The list below still works. Allow notifications to get the daily alerts.</small></div>${perm=='default'?'<button type="button" class="s" onclick="ntAllow()">Allow</button>':''}</div>`;
 const body=d.groups.map(g=>`<div class="nt-g"><div class="nt-gh"><i style="background:${g.c}"></i><b>${g.t}</b><span>${g.items.length}${g.k=='low'||!g.tot?'':' · '+M(g.tot)}</span></div><div class="nt-l">${g.items.slice(0,40).map(i=>`<div class="nt-i"><button type="button" class="nt-m" onclick="${i.go}"><span class="nt-t"><b>${esc(i.t)}</b><small>${esc(i.s)}</small></span>${ntAmt(g,i)?`<strong class="${g.k=='od'||g.k=='sod'?'low':''}">${ntAmt(g,i)}</strong>`:''}</button><button type="button" class="nt-x" aria-label="Hide for 7 days" title="Hide for 7 days" onclick="ntSnooze('${i.key}',7)">${ic('x',16)}</button></div>`).join('')}${g.items.length>40?`<p class="k nt-more">+${g.items.length-40} more — see ${g.k=='od'||g.k=='sod'?'Reports → Aging':'the related list'}</p>`:''}</div></div>`).join('');
 return`<div class="row"><h3>Today\u2019s tasks</h3><button type="button" class="g s" onclick="nav('settings',()=>{_svp='c_app';_sv='nt'})">${ic('edit',16)} Settings</button></div><p class="k nt-d">${dn}</p>${st}`
  +(d.n?`<div class="nt-sum">${d.groups.map(g=>`<span style="--c:${g.c}"><i></i>${g.t.split(' ').slice(-2).join(' ')} <b>${g.items.length}</b></span>`).join('')}</div>${body}`:`<div class="nt-ok">${ic('check2',34)}<b>You are all caught up</b><span class="k">Nothing needs your attention today.</span></div>`)
  +(d.hid?`<button type="button" class="g bk-s nt-un" onclick="ntClearSnz()">Show ${d.hid} hidden alert${d.hid==1?'':'s'} again</button>`:'')};

/* ---- Settings → App → Notifications ---- */
SROWS.nt=['nt','bell','Notifications',()=>ntS().on?'3 alerts a day':'Off'];
SEC.nt=()=>{const o=ntS(),perm=ntCan()?Notification.permission:'unsupported',tg=(k,t,dd)=>ftgl(!!o.c[k],t,dd,`ntSet('c.${k}',${o.c[k]?0:1})`);
 const nm1=(id,l,v,mn,mx,k)=>`<div class="sf"><label for="${id}">${l}</label><input id="${id}" type="number" inputmode="numeric" min="${mn}" max="${mx}" value="${v}" onchange="ntSet('${k}',Math.max(${mn},Math.min(${mx},Math.round(+this.value||${v}))))"></div>`;
 return`<div class="tg-l">${ftgl(o.on,'Notifications','3 separate alerts a day at different daytime moments, each about one topic','ntToggle()')}</div>`
  +(perm=='denied'?`<p class="k sc-n nt-w">Notifications are blocked for this app. Allow them in your browser or phone settings, then turn this on.</p>`:perm=='unsupported'?`<p class="k sc-n nt-w">This browser cannot show notifications. The Today\u2019s tasks screen still works.</p>`:'')
  +`<div class="sc-t">What to include</div><div class="tg-l">${NTC.filter(c=>!(c[0]=='sq'&&!FT('quotes'))&&!(c[0]=='ro'&&!FT('reorder'))).map(c=>tg(c[0],c[3],c[4])).join('')}</div>`
  +`<div class="sc-t">Keep it relevant</div><div class="sc">${nm1('nt_qd','Pending quotation after (days)',o.qd,0,60,'qd')}${nm1('nt_dd','Dead stock after no sale for (days)',o.dd,30,730,'dd')}</div>`
  +`<div class="bk-a"><button type="button" class="g bk-s" onclick="ntTick(1)">${ic('bell',20)} Send a test notification</button><button type="button" class="g bk-s" onclick="nav('notif')">${ic('stmt',20)} Open today\u2019s tasks</button></div>`
  +`<p class="k sc-n">Each day the app sends 3 alerts, one topic each, from the topics above that need attention — the first in the morning, the second 4–5 hours later and the third in the evening, always before 8 pm and never together. Drafts you started today and quotations newer than the limit are left out, and any item can be hidden for 7 days from the tasks screen. Alerts are sent when the app opens after their time; browsers that allow background checks can also send them while the app is closed. iPhone needs the app added to the Home Screen.</p>`};
SETF.nt={k:'nt',i:'bell',t:'Notifications',s:SROWS.nt[3],c:'#7c3aed'};
{const app=SCAT.find(c=>c[0]=='c_app');if(app){if(!app[5].includes('nt'))app[5].push('nt');app[4]='Language and notifications'}}

/* ---- menu entry, header bell, dashboard strip ---- */
if(!NAV0.some(n=>n[0]=='notif'))NAV0.splice(NAV0.length-1,0,['notif','Notifications']);
applyFeatures();
function ntBell(){const h=$('hb');if(!h)return;let b=$('hbell');
 if(!b){b=document.createElement('button');b.id='hbell';b.type='button';b.setAttribute('aria-label','Today\u2019s tasks');b.onclick=()=>nav('notif');h.parentNode.insertBefore(b,h)}
 let n=0;try{n=ntBuild().n}catch(e){}
 b.innerHTML=ic('bell',22)+(n?`<i>${n>99?'99+':n}</i>`:'');b.title=n?n+' task'+(n==1?'':'s')+' need attention':'Today\u2019s tasks'}
const _dashNt=V.dash;
V.dash=()=>{const h=_dashNt();let d;try{d=ntBuild()}catch(e){return h}if(!d.n||!ntS().on)return h;
 const strip=`<button type="button" class="nt-dash" onclick="nav('notif')"><span>${ic('bell',20)}</span><span class="nt-dt"><b>${d.n} task${d.n==1?'':'s'} for today</b><small>${d.groups.map(g=>g.items.length+' '+g.t.toLowerCase()).slice(0,3).join(' · ')}</small></span><em>\u203a</em></button>`;
 return h.replace('<div class="hx-card">',strip+'<div class="hx-card">')};
ntBell();
addEventListener('hashchange',()=>setTimeout(ntBell,50));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible')ntTick()});
setInterval(ntTick,5*60*1000);
setTimeout(()=>{ntPing();ntTick()},1500);
