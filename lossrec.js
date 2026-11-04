/* =====================================================================
 TradeLynin — Losses, Customer Write-offs & Recurring Expenses   (loaded after notify.js)
   D.ls  losses  {id,date,n:type,amt,note,cust, wo,no,al}      -> always subtracted in Profit & Loss; never touches stock or cash/bank accounts
         plain loss (fire, theft, spoilage...)  : nothing else changes
         customer WRITE-OFF  (wo:1, no:'WO-0001', cust:customerId, al:[{id:billId|-customerId,a:amt}])
                                              : ALSO reduces what the customer owes — it is a non-cash credit on the customer account.
                                                Hooks: entries() (balance + statement), alloc() (bill due / overdue / ageing / reminders),
                                                partyBalMap(), txAll() ('wo' rows on the customer page), usedBy() (customer cannot be deleted).
                                                Deleting the write-off puts the amount back on the customer balance.
   D.rx  recurring expenses {id,n,cat,amt,m,note,f:d|m|y,s:first due,t:HH:MM,pre:days before,e:end,on,h:{date:1 paid|2 skipped}}
   "Paid" records a normal expense (D.ex) so reports, day book and account balances stay correct.
   Reminders: dashboard card + Losses & Recurring screen + phone notifications (see rxSync / rxTick / sw.js 'tl-rx').
 ===================================================================== */
D.ls=D.ls||[];D.rx=D.rx||[];AC.ls='Loss';AC.rx='Recurring Expense';_A=aSnap();
const LST=['Fire','Water damage','Theft','Spoilage / expiry','Damaged goods','Other'],WOT=['Bad debt','Write off'];/* Bad debt / Write off are done with the customer Write-off form (woForm) so the customer balance changes */
const lrRO=()=>ME&&ME.role=='viewer'&&(toast('View-only access'),1);
const rxAdd=(d,n)=>{const x=new Date(d+'T00:00:00');x.setDate(x.getDate()+n);return _ld(x)};
const rxDiff=(a,b)=>Math.round((new Date(a+'T00:00:00')-new Date(b+'T00:00:00'))/864e5);
const rxLast=(y,m)=>new Date(y,m+1,0).getDate();
const rxOrd=n=>n+([,'st','nd','rd'][n%100>>3^1&&n%10]||'th');
const rxMon=['January','February','March','April','May','June','July','August','September','October','November','December'];
const lsSum=(inr)=>D.ls.filter(l=>!inr||inr(l.date)).reduce((s,l)=>s+N(l.amt),0);window.lsSum=lsSum;/* app.js / screens.js test window.lsSum — a top-level const is NOT a window property, so without this line losses never reached Profit & Loss */

/* ---- schedule maths ---- */
function rxOcc(r,a,b){const out=[],s=r.s;if(!s||!b)return out;const lo=a>s?a:s,hi=r.e&&r.e<b?r.e:b;if(lo>hi)return out;
 if(r.f=='d'){for(let d=lo,k=0;d<=hi&&k<800;d=rxAdd(d,1),k++)out.push(d);return out}
 const dom=+s.slice(8,10),mon=+s.slice(5,7)-1;let y=+lo.slice(0,4),m=+lo.slice(5,7)-1;const ey=+hi.slice(0,4),em=+hi.slice(5,7)-1;
 while(y<ey||(y==ey&&m<=em)){if(r.f!='y'||m==mon){const d=y+'-'+_z(m+1)+'-'+_z(Math.min(dom,rxLast(y,m)));if(d>=lo&&d<=hi)out.push(d)}if(++m>11){m=0;y++}}
 return out}
const rxOpen=(r,a,b)=>rxOcc(r,a,b).filter(d=>!(r.h||{})[d]);
const rxPend=r=>r.on?rxOpen(r,rxAdd(today(),-90),today()):[];
const rxUp=r=>r.on&&N(r.pre)>0?rxOpen(r,rxAdd(today(),1),rxAdd(today(),N(r.pre))):[];
const rxNext=r=>rxOpen(r,today(),rxAdd(today(),r.f=='y'?400:r.f=='m'?62:2))[0]||'';
function rxSched(r){const dom=+String(r.s).slice(8,10),t=r.t||'09:00';
 return(r.f=='d'?'Every day':r.f=='y'?'Every year · '+rxOrd(dom)+' '+rxMon[+String(r.s).slice(5,7)-1]:'Every month · '+rxOrd(dom))+' · '+t}
const rxWhen=d=>{const k=rxDiff(d,today());return k==0?'Due today':k<0?(-k)+' day'+(k==-1?'':'s')+' overdue':'Due in '+k+' day'+(k==1?'':'s')}
function rxItems(){const L=[];if(!FT('recurring'))return L;D.rx.forEach(r=>{rxPend(r).forEach(d=>L.push({r,d}));rxUp(r).forEach(d=>L.push({r,d}))});return L.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0)}

/* ---- actions ---- */
function rxPay(id,d){if(lrRO())return;const r=D.rx.find(x=>x.id==id);if(!r)return;
 form('Record · '+esc(r.n),[{k:'date',l:'Date',t:'date'},{k:'amt',l:'Amount',t:'number'},{k:'m',l:'Paid from Account',t:'sel',o:MET}],o=>{
  if(N(o.amt)<=0)return toast('Enter an Amount')&&false;
  D.ex.push({id:uid(),date:o.date||d,cat:r.cat||r.n,amt:N(o.amt),m:o.m,note:'Recurring: '+r.n+(r.note?' · '+r.note:''),rx:r.id});
  r.h=r.h||{};r.h[d]=1;rxSync()},{date:d,amt:r.amt,m:r.m})}
function rxSkip(id,d){if(lrRO())return;const r=D.rx.find(x=>x.id==id);if(!r)return;r.h=r.h||{};r.h[d]=2;save();rxSync();go(1)}
function rxPause(id){if(lrRO())return;const r=D.rx.find(x=>x.id==id);if(!r)return;r.on=r.on?0:1;save();rxSync();go(1)}
function rxDel(id){if(lrRO())return;ask('Delete this recurring expense? Expenses already recorded stay as they are.',()=>{D.rx=D.rx.filter(x=>x.id!=id);save();rxSync();go(1)})}
function rxForm(id,p){if(lrRO())return;const r=D.rx.find(x=>x.id==id)||{};const v=id?Object.assign({},r,{pre:String(N(r.pre))}):Object.assign({s:today(),t:'09:00',f:'m',pre:'1'},p||{});
 form(id?'Edit Recurring Expense':'New Recurring Expense',[{k:'n',l:'Name (e.g. Shop rent, Salary)'},{k:'cat',l:'Category (optional — defaults to the name)',t:'sel',sp:'xc',o:xcOpts()},{k:'amt',l:'Amount',t:'number'},{k:'m',l:'Paid from Account',t:'sel',o:MET},
  {k:'f',l:'Repeats',t:'sel',o:'<option value="d">Daily</option><option value="m">Monthly</option><option value="y">Yearly</option>'},{k:'s',l:'First due date (monthly/yearly repeat on this day)',t:'date'},{k:'t',l:'Reminder time',t:'time'},
  {k:'pre',l:'Also remind me before',t:'sel',o:'<option value="0">Only on the day</option><option value="1">1 day before</option><option value="3">3 days before</option><option value="7">7 days before</option><option value="14">14 days before</option>'},
  {k:'e',l:'Stop after (optional)',t:'date'},{k:'note',l:'Note (optional)'}],o=>{
  o.n=o.n.trim();if(!o.n)return toast('Enter a Name')&&false;if(N(o.amt)<=0)return toast('Enter an Amount')&&false;if(!o.s)return toast('Pick the first due date')&&false;if(o.e&&o.e<o.s)return toast('Stop date is before the first due date')&&false;
  o.amt=N(o.amt);o.pre=N(o.pre);o.t=o.t||'09:00';o.cat=o.cat||o.n;
  if(D.xc&&!D.xc.some(c=>String(c.n).toLowerCase()==o.cat.toLowerCase()))D.xc.push({id:uid(),n:o.cat});
  if(id)Object.assign(r,o);else D.rx.push({id:uid(),on:1,h:{},...o});rxSync()},v)}
function lsForm(id){if(lrRO())return;const l=D.ls.find(x=>x.id==id)||{};if(l.wo)return woForm(id);
 const ty=LST.concat(l.n&&!LST.includes(l.n)?[l.n]:[]);
 form(id?'Edit Loss':'Record a Loss',[{k:'date',l:'Date',t:'date',d:today()},{k:'n',l:'Type of loss',t:'sel',o:ty.map(x=>`<option>${esc(x)}</option>`).join('')},{k:'amt',l:'Loss amount',t:'number'},{k:'note',l:'Details (optional)'}],o=>{
  if(N(o.amt)<=0)return toast('Enter the loss amount')&&false;o.amt=N(o.amt);o.date=o.date||today();if(id)Object.assign(l,o);else D.ls.push({id:uid(),...o})},l)}
function lsDel(id){if(lrRO())return;const l=D.ls.find(x=>x.id==id);if(!l)return;
 ask(l.wo?'Delete this write-off? '+M(l.amt)+' will be added back to '+(nm(D.c,l.cust)||'the customer')+'’s balance.':'Delete this loss entry?',()=>{D.ls=D.ls.filter(x=>x.id!=id);save();go(1)})}

/* ---- customer write-off: reduces the customer balance (non-cash) and is booked as a loss in Profit & Loss ---- */
const woNo=()=>{let m=0;D.ls.forEach(l=>{const g=/^WO-(\d+)$/.exec(l.no||'');if(g)m=Math.max(m,+g[1])});return'WO-'+String(m+1).padStart(4,'0')};
const woBills=(pid,ex)=>[obDue('c',pid,ex)].filter(Boolean).concat(pend('c',pid,ex));/* oldest first: opening balance, then bills by date */
let _wo={};
function woForm(id,pre,leg){if(lrRO())return;const o=id?D.ls.find(x=>x.id==id&&x.wo):null,lg=leg?D.ls.find(x=>x.id==leg):null,v=o||lg||{};
 if(id&&!o)return;_wo={id:id||0,leg:leg||0,dirty:0};
 FP();modal(`<h3>${o?'Edit Write-off':'Write Off Customer Balance'}</h3>
 <p class="k" style="margin:0 0 6px">The amount is taken off what the customer owes you. No cash moves. It is booked as a loss in Profit &amp; Loss.</p>
 <label>Customer</label><select id="w_pid" class="sp" data-sp="c" onchange="woRef(1)">${opts(D.c,v.cust||pre||'','Search customer…')}</select><div id="w_info"></div>
 <div class="f2"><div><label>Date</label><input id="w_date" type="date" value="${esc(v.date||today())}"></div><div><label>Amount to write off</label><input id="w_amt" type="number" step="any" value="${v.amt?+N(v.amt).toFixed(6):''}" oninput="woAuto()"></div></div>
 <div class="row" style="margin:6px 0 0"><span></span><button type="button" class="g s" onclick="woFull()">Write off full balance</button></div>
 <label>Reason</label><select id="w_n">${WOT.map(x=>`<option${x==v.n?' selected':''}>${x}</option>`).join('')}</select>
 <label>Note (optional)</label><input id="w_note" value="${esc(v.note||'')}">
 <div class="row" style="margin-top:12px"><b>Bills it applies to</b><button type="button" class="g s" onclick="woAuto(1)">Auto-Apply Oldest First</button></div><div id="w_bl"></div>
 <div class="row" style="margin-top:14px"><button class="g" onclick="closeM()">Cancel</button><button id="ok">Save</button></div>`);
 woRef(0);$('ok').onclick=woSave}
const woAvail=pid=>{const o=_wo.id?D.ls.find(x=>x.id==_wo.id):null;return bal('c',pid)+(o&&o.cust==pid?N(o.amt):0)};
function woRef(fresh){const pid=+$('w_pid').value,o=_wo.id?D.ls.find(x=>x.id==_wo.id):null,lg=_wo.leg?D.ls.find(x=>x.id==_wo.leg):null;
 if(!pid){$('w_info').innerHTML='';$('w_bl').innerHTML='<p class="k">Select a customer to see what they owe</p>';return}
 const b=woAvail(pid),ex=o?o.id:0,L=woBills(pid,ex),al=o&&o.cust==pid?(o.al||[]):[];
 $('w_info').innerHTML=`<div class="pb-card ${b>0.004?'ok':'clr'}"><span>${b>0.004?'Customer owes you':b<-0.004?'Customer has an advance':'No pending balance'}</span><b>${M(Math.abs(b))}</b></div>`;
 $('w_bl').innerHTML=L.length?L.map(x=>`<div class="line" style="grid-template-columns:2fr 1.3fr 1.2fr" data-id="${x.t.id}" data-due="${x.due}"><span>${x.t.ob?'Previous balance':esc(x.t.no)}<br><span class="k">${x.t.ob?'Brought forward':x.t.date}</span></span><span class="k">Due<br><b style="color:var(--tx)">${M(x.due)}</b></span><input type="number" step="any" placeholder="Apply" value="${(al.find(e=>e.id==x.t.id)||{}).a||''}" oninput="_wo.dirty=1"></div>`).join(''):'<p class="k">No pending bills — nothing to write off</p>';
 if(fresh){_wo.dirty=0;if(N($('w_amt').value)>0)woAuto(1)}
 else if(lg&&!o&&!al.length&&N($('w_amt').value)>0)woAuto(1)}
function woAuto(force){if(!force&&_wo.dirty)return;let r=N($('w_amt').value);const pid=+$('w_pid').value;
 if(pid&&r>woAvail(pid)+0.005){r=Math.max(0,woAvail(pid))}
 document.querySelectorAll('#w_bl .line').forEach(x=>{const u=Math.min(r,N(x.dataset.due));x.children[2].value=u>0?+u.toFixed(3):'';r-=u>0?u:0});if(force)_wo.dirty=0}
function woFull(){const pid=+$('w_pid').value;if(!pid)return toast('Select a customer first');const b=woAvail(pid);if(b<=0.004)return toast('This customer has no balance to write off');
 $('w_amt').value=+b.toFixed(6);woAuto(1)}
function woSave(){const pid=+$('w_pid').value;if(!pid)return toast('Select a customer');
 const o=_wo.id?D.ls.find(x=>x.id==_wo.id):null,lg=_wo.leg?D.ls.find(x=>x.id==_wo.leg):null,avail=woAvail(pid),rows=[...document.querySelectorAll('#w_bl .line')];
 let amt=N($('w_amt').value),al=[],sum=0,bad=0;
 rows.forEach(r=>{const v=N(r.children[2].value);if(v>0){if(v>N(r.dataset.due)+0.005)bad=1;al.push({id:+r.dataset.id,a:+v.toFixed(6)});sum+=v}});
 if(bad)return toast('Applied amount is more than the bill due');
 if(!amt)amt=sum;if(amt<=0)return toast('Enter the amount to write off');
 if(avail<=0.004)return toast('This customer has no balance to write off');
 if(amt>avail+0.005)return toast('More than the customer owes ('+M(avail)+')');
 if(sum>amt+0.005)return toast('Applied total is more than the write-off amount');
 if(sum<0.005){let r=amt;rows.forEach(x=>{const u=Math.min(r,N(x.dataset.due));if(u>0){al.push({id:+x.dataset.id,a:+u.toFixed(6)});r-=u}})}/* nothing typed against bills -> oldest first */
 const rec={date:$('w_date').value||today(),n:$('w_n').value,amt:+amt.toFixed(6),cust:pid,note:$('w_note').value.replace(/[<>]/g,''),wo:1,al};
 if(o)Object.assign(o,rec);else if(lg)Object.assign(lg,rec,{no:woNo()});else D.ls.push({id:uid(),no:woNo(),...rec});
 save();closeM();toast('Written off '+M(rec.amt)+' · '+nm(D.c,pid));go(1)}
function wom(id){const l=D.ls.find(x=>x.id==id&&x.wo);if(!l)return;
 const bn=e=>e.id<0?'Opening Balance':((D.sa.find(x=>x.id==e.id)||{}).no||'—'),ap=(l.al||[]).map(e=>esc(bn(e))+' ('+M(e.a)+')').join(', ');
 xsheet('Write-off '+esc(l.no||''),esc(nm(D.c,l.cust)||'—')+' · '+M(l.amt),[['stmt','Customer statement',`stmt('c',${l.cust})`],['edit','Edit',`woForm(${id})`],['trash','Delete',`lsDel(${id})`,'dg']],
  xDet([['Date',esc(l.date)],['Reason',esc(l.n||'')],['Applied to',ap],['Note',nl2(l.note),'xd-n']]))}

/* ---- screens ---- */
const rxRow=(x,full)=>{const r=x.r,k=rxDiff(x.d,today());return`<div class="lr-i${k<0?' od':''}"><div class="lr-m"><b>${esc(r.n)}</b><small>${rxWhen(x.d)} · ${x.d}</small></div><strong>${M(r.amt)}</strong><div class="lr-a"><button type="button" class="s" onclick="rxPay(${r.id},'${x.d}')">Paid</button><button type="button" class="g s" onclick="rxSkip(${r.id},'${x.d}')">Skip</button></div></div>`};
function rxPerm(){const p='Notification' in window?Notification.permission:'unsupported',on=!!S.rxn&&p=='granted';
 return`<div class="nt-st ${on?'ok':'warn'}"><span>${ic('bell',20)}</span><div><b>Phone reminders ${on?'are on':'are off'}</b><small>${p=='unsupported'?'This browser cannot show notifications — dashboard reminders still work.':p=='denied'?'Notifications are blocked — allow them in your browser or phone settings.':on?'You get a notification at each reminder time (and before, if set).':'Turn on to get a notification at each reminder time.'}</small></div>${p=='unsupported'||p=='denied'?'':`<button type="button" class="s" onclick="rxNotifToggle()">${on?'Turn off':'Turn on'}</button>`}${on?'<button type="button" class="g s" onclick="rxTest()">Test</button>':''}</div>`}
/* Expenses / Losses is one section: tabs Expenses · Recurring · Losses · Categories (see txlist.js). These two render the Recurring and Losses tabs. */
const lsPage=()=>{const ym=today().slice(0,7),yr=today().slice(0,4),L=[...D.ls].sort((a,b)=>a.date<b.date?1:a.date>b.date?-1:b.id-a.id),wo=D.ls.filter(l=>l.wo).reduce((s,l)=>s+N(l.amt),0),
 bn=e=>e.id<0?'Opening Balance':((D.sa.find(x=>x.id==e.id)||{}).no||'');
 return wh(ddEx(),`<h3>Expenses / Losses</h3>`+xTabs2()+`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 10px"><button type="button" onclick="lsForm()">+ Add Loss</button><button type="button" class="g" onclick="woForm()">Write Off Customer</button></div><div class="ct-sum">${ctStat('This month',M(lsSum(d=>d.slice(0,7)==ym)))}${ctStat('This year',M(lsSum(d=>d.slice(0,4)==yr)))}${ctStat('All time',M(lsSum()))}</div><p class="k">Losses (fire, theft, spoilage…) are permanent: they are deducted in Profit &amp; Loss and do not change stock, parties or account balances. <b>Write Off Customer</b> (bad debt) also takes the amount off what that customer owes you — no cash moves.${wo>0?' Written off from customers so far: <b>'+M(wo)+'</b>.':''}</p>`
 +(L.length?L.map(l=>{const legacy=!l.wo&&(l.cust||WOT.includes(l.n)),ap=l.wo?(l.al||[]).map(bn).filter(Boolean).join(', '):'';
  return`<div class="lr-i"><div class="lr-m"><b>${l.wo?'Write-off '+esc(l.no||'')+' · '+esc(l.n):esc(l.n)}</b><small>${l.date}${l.cust?' · '+esc(nm(D.c,l.cust)):''}${ap?' · '+esc(ap):''}${l.note?' · '+esc(l.note):''}</small>${l.wo?'<small>Taken off the customer balance</small>':legacy?'<small style="color:#d97706">Not applied to the customer balance</small>':''}</div><strong class="low">${M(l.amt)}</strong><div class="lr-a">${legacy?`<button type="button" class="s" onclick="woForm(0,${l.cust||0},${l.id})">Apply to customer</button>`:''}${l.wo?`<button type="button" class="g s" onclick="wom(${l.id})">Open</button>`:`<button type="button" class="g s" onclick="lsForm(${l.id})">Edit</button>`}<button type="button" class="g s" onclick="lsDel(${l.id})">Delete</button></div></div>`}).join(''):'<div class="pl-e">No losses recorded.</div>'))};
const rxPage=()=>{const due=rxItems(),mo=D.rx.filter(r=>r.on).reduce((s,r)=>s+N(r.amt)*(r.f=='d'?30.4:r.f=='y'?1/12:1),0);
 return wh(ddEx(),`<h3>Expenses / Losses</h3>`+xTabs2()+`<button type="button" style="width:100%;margin:0 0 10px" onclick="rxForm()">+ Add Recurring Expense</button>${rxPerm()}`
  +(due.length?`<div class="sc-t">Due &amp; coming up</div>${due.map(x=>rxRow(x)).join('')}`:'')
  +`<div class="sc-t">All recurring expenses${D.rx.length?' · about '+M(mo)+' / month':''}</div>`
  +(D.rx.length?D.rx.map(r=>{const n=rxNext(r);return`<div class="lr-i${r.on?'':' off'}"><div class="lr-m"><b>${esc(r.n)}</b><small>${rxSched(r)}${r.on?(n?' · next '+n:' · finished'):' · paused'}</small></div><strong>${M(r.amt)}</strong><div class="lr-a"><button type="button" class="g s" onclick="rxForm(${r.id})">Edit</button><button type="button" class="g s" onclick="rxPause(${r.id})">${r.on?'Pause':'Resume'}</button><button type="button" class="g s" onclick="rxDel(${r.id})">Delete</button></div></div>`}).join(''):'<div class="pl-e">Nothing scheduled yet.</div>'))};
const _ex0=V.expenses;V.expenses=()=>_xp=='r'?rxPage():_xp=='s'?lsPage():_ex0();

/* dashboard reminder card */
const _dashLr=V.dash;
V.dash=()=>{const h=_dashLr();let L;try{L=rxItems()}catch(e){return h}if(!L.length)return h;
 const card=`<div class="lr-c"><div class="lr-h"><b>${ic('bell',18)} Recurring expenses</b><button type="button" class="g s" onclick="nav('lossrec')">View all</button></div>${L.slice(0,4).map(x=>rxRow(x)).join('')}${L.length>4?`<button type="button" class="g s lr-mo" onclick="nav('lossrec')">+${L.length-4} more</button>`:''}</div>`;
 return h.replace('<div class="hx-card">',card+'<div class="hx-card">')};

/* ---- phone notifications ----
   Events for the next 2 weeks are kept in IndexedDB ('rx' in the same DB the service worker reads). The open app fires them every 30 s;
   the service worker fires them on 'periodicsync' (tag tl-rx) when the browser allows it; browsers that support notification
   triggers are given the exact time so the OS can show it with the app closed. */
const rxTs=(d,t)=>{const[h,m]=String(t||'09:00').split(':');const x=new Date(d+'T00:00:00');x.setHours(+h||0,+m||0,0,0);return x.getTime()};
async function rxSync(){try{const on=!!S.rxn&&FT('recurring'),td=today(),ev=[];
  D.rx.forEach(r=>{if(!r.on)return;const pre=N(r.pre);Object.keys(r.h||{}).forEach(k=>{if(k<rxAdd(td,-120))delete r.h[k]});
   rxOpen(r,rxAdd(td,-1),rxAdd(td,14+pre)).forEach(d=>{const k=rxDiff(d,td),t=r.t||'09:00',amt=M(r.amt);
    if(pre>0&&k>0)ev.push({k:r.id+':'+d+':p',at:rxTs(rxAdd(d,-pre),t),tt:r.n+' due in '+pre+' day'+(pre==1?'':'s')+' · '+amt,bd:'Due '+d+'. Open TradeLynin to record it.'});
    ev.push({k:r.id+':'+d+':d',at:rxTs(d,t),tt:r.n+' due today · '+amt,bd:'Tap to record the payment or skip it.'})})});
  const old=(await ntIdbGet('rx'))||{},done=old.done||{};Object.keys(done).forEach(k=>{if(Date.now()-done[k]>5*864e5)delete done[k]});
  await ntIdbSet('rx',{on,ev,done});
  if(on&&Notification.permission=='granted'&&'showTrigger' in Notification.prototype&&window.TimestampTrigger){const reg=await navigator.serviceWorker.ready;
   ev.filter(e=>e.at>Date.now()&&!done[e.k]).forEach(e=>reg.showNotification(e.tt,{body:e.bd,tag:'tl-rx-'+e.k,badge:'icons/badge-96.png',showTrigger:new TimestampTrigger(e.at),data:{url:'./#lossrec'}}).catch(()=>{}))}
 }catch(e){}}
async function rxShow(tt,bd,tag){const o={body:bd,badge:'icons/badge-96.png',tag,data:{url:'./#lossrec'}};
 try{if('serviceWorker' in navigator&&location.protocol!='file:'){const r=await navigator.serviceWorker.ready;await r.showNotification(tt,o);return true}}catch(e){}
 try{new Notification(tt,o);return true}catch(e){return false}}
let rxBusy=0;
async function rxTick(){if(rxBusy||!S.rxn||!('Notification' in window)||Notification.permission!='granted')return;rxBusy=1;
 try{await rxSync();const p=await ntIdbGet('rx');if(p&&p.on){const now=Date.now();let ch=0;p.done=p.done||{};
  for(const e of p.ev){if(e.at<=now&&now-e.at<=36*36e5&&!p.done[e.k]){p.done[e.k]=now;ch=1;await rxShow(e.tt,e.bd,'tl-rx-'+e.k)}}
  if(ch)await ntIdbSet('rx',p)}}catch(e){}rxBusy=0}
async function rxNotifToggle(){if(lrRO())return;if(S.rxn){S.rxn=0;save();rxSync();go(1);return}
 if(!('Notification' in window))return toast('This browser does not support notifications');
 let p=Notification.permission;if(p=='default'){try{p=await Notification.requestPermission()}catch(e){}}
 if(p!='granted')return toast('Notifications are blocked — allow them in your browser or phone settings');
 S.rxn=1;save();try{const r=await navigator.serviceWorker.ready;if(r.periodicSync)await r.periodicSync.register('tl-rx',{minInterval:36e5})}catch(e){}
 await rxSync();go(1);toast('Reminders are on')}
async function rxTest(){await rxShow('TradeLynin reminder','Phone reminders are working.','tl-rx-test');toast('Test notification sent')}

applyFeatures();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible')rxTick()});
setInterval(rxTick,30*1000);
setTimeout(()=>{rxSync();rxTick()},2000);
