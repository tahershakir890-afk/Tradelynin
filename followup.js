/* =====================================================================
 TradeLynin v76 — Customer Follow-Ups (loaded after uparty.js)
   Screen #followups: which customers are regular, which are active, and which have not
   ordered for over 7 days — with one-tap Call and professional English / Arabic WhatsApp
   messages. Every follow-up is logged (D.fu) so you can see who was already contacted.
   Entry points: Parties dropdown (side menu), Quick Actions, and a banner on the Dashboard.
   Regular = 3 or more sales in the last 90 days.  Returns and quotations are not orders.
 ===================================================================== */
const FU_DAYS=7;let _fuT='in';
const fuD=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);
const fuNum=ph=>{let d=String(ph||'').replace(/\D/g,'').replace(/^00/,'');if(d.length==8)d='965'+d;return d};
function fuData(){const td=today(),by={};
 D.sa.forEach(t=>{if(t.ret||!t.pid)return;(by[t.pid]=by[t.pid]||[]).push(t)});
 return D.c.map(c=>{const L=(by[c.id]||[]).slice().sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0),last=L[L.length-1],r=L.filter(t=>fuD(t.date,td)<=90),days=last?fuD(last.date,td):null;
  return{c,n:L.length,last,days,tp:L.reduce((s,t)=>s+tot(t).total,0),reg:r.length>=3,gap:r.length>1?Math.max(1,Math.round(fuD(r[0].date,r[r.length-1].date)/(r.length-1))):null,fu:(D.fu||{})[c.id]||'',
   st:!last?'new':days>FU_DAYS?'in':'act'}})}
const fuAgo=n=>n<=0?'today':n==1?'yesterday':n+' days ago';
const fuFl=d=>d?'Followed up '+fuAgo(fuD(d,today())):'';
function fuMark(id){if(typeof ME!='undefined'&&ME&&ME.role=='viewer')return;D.fu=D.fu||{};D.fu[id]=today();save();const e=document.getElementById('fu_'+id);if(e)e.textContent=fuFl(today())}
function fuCall(id){const c=D.c.find(x=>x.id==id),n=c&&fuNum(c.ph);if(!n)return toast('No phone number');fuMark(id);location.href='tel:+'+n}
function fuMsg(x,l){const nm=x.c.n,b=S.name||'',k=!x.last?'new':x.reg?'reg':'std',ar=l=='ar',tel=S.ph?(ar?'\nهاتف: ':'\nTel: ')+S.ph:'';
 const T=ar?{
  hi:'السلام عليكم '+nm+'،',
  g:'تحية طيبة من '+b+'، نأمل أن تكونوا بخير.',
  std:'لاحظنا أنه مضى بعض الوقت على آخر طلب لكم، ويسعدنا خدمتكم مجدداً. نرجو إعلامنا بأي احتياجات لديكم، أو إذا رغبتم في الاطلاع على أحدث الأسعار والمتوفر لدينا.',
  reg:'لاحظنا غياب طلباتكم المعتادة مؤخراً، ونود الاطمئنان عليكم والتأكد من تلبية جميع احتياجاتكم. نرجو إعلامنا إذا كان بإمكاننا مساعدتكم بأي شكل، أو إذا رغبتم في الاطلاع على أحدث الأسعار والمتوفر لدينا.',
  new:'يسعدنا أن نخدمكم في أول طلب لكم. نرجو إعلامنا بما تحتاجونه، وسنوافيكم بأحدث الأسعار والمتوفر لدينا.',
  bye:'نشكر لكم ثقتكم الدائمة.\n\nمع خالص التحية،\n'+b+tel
 }:{
  hi:'Hello '+nm+',',
  g:'Greetings from '+b+'. We hope you are doing well.',
  std:'We noticed it has been a little while since your last order, and we would be glad to assist you again. Please let us know if you need anything, or if you would like our latest prices and availability.',
  reg:'We have missed your regular orders and wanted to check that everything is in order. Please let us know if there is anything we can help you with, or if you would like our latest prices and availability.',
  new:'We would be delighted to serve you with your first order. Please let us know what you need and we will share our latest prices and availability.',
  bye:'Thank you for your continued trust.\n\nBest regards,\n'+b+tel};
 return [T.hi,T.g,T[k],T.bye].join('\n\n')}
function fuWa(id,l){const x=fuData().find(y=>y.c.id==id);if(!x)return;if(!fuNum(x.c.ph))return toast('No phone number');waSend(x.c.ph,fuMsg(x,l));fuMark(id)}
if(!document.getElementById('fu-css')){const s=document.createElement('style');s.id='fu-css';
 s.textContent='.fu-s{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.fu-s .card{margin:0;padding:10px;text-align:center}.fu-s b{display:block;font-size:22px}'+
 '.fu-t{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px}.fu-t button{flex:0 0 auto;white-space:nowrap}'+
 '.fu-c .fu-b{font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e0e7ff;color:#3730a3;margin-left:6px;white-space:nowrap}'+
 '.fu-c .fu-b.w{background:#ffedd5;color:#9a3412}.fu-c .fu-b.r{background:#fee2e2;color:#991b1b}.fu-c .fu-b.o{background:#dcfce7;color:#166534}'+
 '.fu-c .fu-f{color:#166534;font-weight:600}.fu-a{display:flex;gap:8px;margin-top:10px}.fu-a button{flex:1 1 0;min-width:0;min-height:42px;padding:0 6px;font-size:13px;font-weight:700}.fu-d{cursor:pointer}';
 document.head.appendChild(s)}
function fuCard(x){const c=x.c,ph=fuNum(c.ph),late=x.st=='in',bd=late?`<span class="fu-b ${x.days>30?'r':'w'}">${x.days} days</span>`:x.st=='act'?'<span class="fu-b o">Active</span>':'<span class="fu-b">No orders</span>';
 return`<div class="card fu-c"><div class="row"><b>${esc(c.n)}${x.reg?'<span class="fu-b">Regular</span>':''}</b>${bd}</div>
 <div class="k">${ph?esc(c.ph):'No phone number'}</div>
 <div class="k">${x.last?'Last order '+fuAgo(x.days)+' · '+esc(x.last.no||'')+' · '+M(tot(x.last).total):'No orders yet'}</div>
 ${x.last?`<div class="k">${x.n} order${x.n==1?'':'s'} · ${M(x.tp)}${x.reg&&x.gap?' · usually every '+x.gap+' day'+(x.gap==1?'':'s'):''}</div>`:''}
 <div class="k fu-f" id="fu_${c.id}">${fuFl(x.fu)}</div>
 ${ph?`<div class="fu-a"><button class="g" onclick="fuCall(${c.id})">Call</button><button onclick="fuWa(${c.id},'en')">WhatsApp EN</button><button onclick="fuWa(${c.id},'ar')">واتساب عربي</button></div>`:`<div class="fu-a"><button class="g" onclick="partyForm('c',${c.id})">Add phone number</button></div>`}</div>`}
V.followups=()=>{const A=fuData(),I=A.filter(x=>x.st=='in'),R=A.filter(x=>x.reg),C=A.filter(x=>x.st=='act'),N=A.filter(x=>x.st=='new'),td=today(),
  sort={in:(a,b)=>(a.fu==td)-(b.fu==td)||b.reg-a.reg||b.days-a.days,reg:(a,b)=>b.days-a.days,act:(a,b)=>a.days-b.days,new:(a,b)=>String(a.c.n).localeCompare(b.c.n)},
  M_={in:I,reg:R,act:C,new:N},T=[['in','Inactive '+FU_DAYS+'+ days',I.length],['reg','Regular',R.length],['act','Active',C.length],['new','No orders',N.length]],
  L=[...M_[_fuT]].sort(sort[_fuT]),
  empty={in:'No customers need a follow-up right now. Everyone has ordered within the last '+FU_DAYS+' days.',reg:'No regular customers yet — a regular customer has 3 or more orders in the last 90 days.',act:'No customers have ordered in the last '+FU_DAYS+' days.',new:'Every customer has placed at least one order.'}[_fuT];
 return`<h3>Customer Follow-Ups</h3><p class="k">Customers who have not ordered for over ${FU_DAYS} days. Call them or send a ready-made English or Arabic WhatsApp message.</p>
 <div class="fu-s"><div class="card"><b>${I.length}</b><span class="k">Inactive</span></div><div class="card"><b>${R.length}</b><span class="k">Regular</span></div><div class="card"><b>${C.length}</b><span class="k">Active</span></div></div>
 <div class="fu-t seg">${T.map(t=>`<button class="s ${_fuT==t[0]?'':'g'}" onclick="_fuT='${t[0]}';go(1)">${t[1]} (${t[2]})</button>`).join('')}</div>
 ${L.length?L.map(fuCard).join(''):`<div class="card k">${empty}</div>`}`};
SUB.followups='Customer Follow-Ups';
function fuBanner(){let A;try{A=fuData()}catch(e){return''}const I=A.filter(x=>x.st=='in');if(!I.length)return'';const R=I.filter(x=>x.reg).length;
 return`<div class="card fu-d" onclick="nav('followups')"><div class="row"><div><b>${I.length} customer${I.length==1?'':'s'} need${I.length==1?'s':''} a follow-up</b><div class="k">No order in over ${FU_DAYS} days${R?' · '+R+' regular':''}</div></div><button class="s" type="button">Open</button></div></div>`}
/* v76: no follow-up banner on the Parties screen — Customer Follow-Ups is reached from the Parties dropdown in the menu */
const _vdFu=V.dash;V.dash=()=>{const h=_vdFu();try{const b=fuBanner();if(!b)return h;const mk='<div class="hx-card">';return h.includes(mk)?h.replace(mk,()=>b+mk):b+h}catch(e){return h}};
