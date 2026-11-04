/* =====================================================================
 TradeLynin — Settings: Features on/off · Print settings · Decimal places   (loaded after filters.js)
   S.ft = {key:false}  a feature that is turned OFF (missing = on)
   S.pr = {...}        print options, see PRD in app.js
   S.dp = 0..4         decimal places for amounts (empty = automatic by currency)
 ===================================================================== */
const FEATC={
 c_sal:[['quotes','Quotations','Price offers you can turn into a sale'],['returns','Sales & purchase returns','Credit notes and debit notes'],['delivery','Delivery notes','The Delivery button on invoices'],['lastpur','Last price on bills','Last purchase price on purchases, last sale price to the customer on sales'],['invnote','Notes on invoices & vouchers','Print the note you type on a bill or payment on its invoice / voucher'],['drafts','Save as draft','The Save as draft button on forms'],['savebtn','Quick Save button','The extra Save button next to Next on Add forms'],['cashsw','Cash / Credit switch','The Cash or Credit button at the top of Sale and Purchase forms'],['paidsw','Paid / Unpaid switch','The Paid or Unpaid switch on bills in the transaction lists']],
 c_inv:[['godowns','Godowns & stock transfer','Keep stock in more than one place'],['stocktake','Stock take','Count your stock and fix differences'],['categories','Product categories','Group products into categories'],['units','Unit conversion','Sell by a bigger unit, e.g. 1 carton = 10 pcs'],['history','Product history','How fast each product sells'],['reorder','Reorder list','Low-stock list and purchase orders']],
 c_mon:[['expenses','Expenses','Rent, salaries and other costs'],['recurring','Recurring expenses','Rent, salary and other costs that repeat, with reminders (Expenses tab, Home card and notifications)'],['losses','Losses & write-offs','Fire, theft, bad debts and other permanent losses (Expenses tab)'],['accounts','Cash & bank accounts','Several accounts and moving money between them']],
 c_cus:[['pricelist','Customer price lists','Special prices for a customer'],['followups','Customer follow-ups','Regular and inactive customers, call and WhatsApp follow-up (screen, menu, Home notice and reminders)']],
 c_dash:[['d_fu','Follow-up notice','Home notice for customers who have not ordered for over 7 days'],['d_week','Last 7 days chart','Daily sales bars'],['d_tiles','Summary tiles','To receive, To pay, Stock value and Low stock'],['d_attn','Needs attention','Overdue payments, low stock and slow items'],['d_pend','Pending money','Who owes you and whom you owe'],['d_recent','Recent activity','Latest sales, purchases and payments'],['d_rx','Recurring expense reminders','Upcoming recurring expenses card']],
 c_rep:[['reports','Reports','Profit, stock, ageing and more'],['bin','Recycle bin','Restore deleted records'],['bulk','Bulk select & edit','Pick many rows to delete or edit'],['profit','Profit on the sale form','Show cost and profit while you sell'],['photos','Photos','Attach photos to bills, payments, expenses, products and opening-balance bills']]};
const FEATK=Object.values(FEATC).flat().map(x=>x[0]);
const RF={lossrec:['recurring'],followups:['followups'],categories:['categories'],quotes:['quotes'],salesret:['returns'],purchret:['returns'],expenses:['expenses'],accounts:['accounts'],godowns:['godowns'],transfers:['godowns'],stocktake:['stocktake'],reports:['reports'],bin:['bin']};
const QF={'Customer Follow-Ups':['followups'],'New Quotation':['quotes'],'Sales Return':['returns'],'Purchase Return':['returns'],'Add Expense':['expenses'],'Move Money':['accounts'],'Cash Book':['accounts','reports'],'Stock Transfer':['godowns'],'Stock Take':['stocktake'],'Reorder List':['reorder'],'Day Book':['reports'],'Profit & Loss':['reports']};
const AF={qt:['quotes'],ret:['returns'],ex:['expenses'],tf:['accounts']};
const RPF={ex:['expenses'],cb:['accounts']};
const offAny=a=>(a||[]).some(f=>!FT(f));
const NAV0=JSON.parse(JSON.stringify(NAV)),TXI0=TXI.map(x=>x.slice()),QA0=QA.slice(),ATT0=ATT.slice(),REPS0=JSON.parse(JSON.stringify(REPS));
function applyFeatures(){
 NAV.length=0;NAV0.forEach(n=>{if(!n[2]){if(!offAny(RF[n[0]]))NAV.push(n.slice())}else{const s=n[2].filter(k=>!offAny(RF[k]));if(s.length)NAV.push([n[0],n[1],s])}});
 TXI.length=0;TXI0.forEach(t=>{if(!offAny(RF[t[1]]))TXI.push(t)});
 QA.length=0;QA0.forEach(q=>{if(!offAny(QF[q[0]]))QA.push(q)});
 ATT.length=0;ATT0.forEach(a=>{if(!offAny(AF[a[0]]))ATT.push(a)});
 REPS.length=0;REPS0.forEach(g=>{const it=g[2].filter(r=>!offAny(RPF[r[0]])&&!(r[0]=='cb'&&!FT('accounts')));if(it.length&&!(g[0]=='Financial'&&!FT('reports')))REPS.push([g[0],g[1],it])});
 const fm=$('fm');if(fm)fm.innerHTML=QA.map(x=>`<button onclick="fab();${x[1]}">${x[0]}</button>`).join('');
 document.body.classList.toggle('no-bulk',!FT('bulk'));document.body.classList.toggle('no-photos',!FT('photos'))}
applyFeatures();
function ftSet(k){S.ft=S.ft||{};S.ft[k]=!FT(k);if(S.ft[k]!==false)delete S.ft[k];save();applyFeatures();go(1)}
function ftAll(){S.ft={};save();applyFeatures();go(1)}
const ftgl=(on,t,d,fn)=>`<button type="button" class="tgl${on?' on':''}" role="switch" aria-checked="${on?'true':'false'}" onclick="${fn}"><span class="tgl-t"><b>${t}</b><span class="k">${d}</span></span><i class="tgl-s"></i></button>`;
const ftOffN=()=>FEATK.filter(k=>!FT(k)).length;

/* ---- screens that are switched off go back to the dashboard ---- */
const _go2=go;
go=function(keep){const h=location.hash.slice(1);
 if(!FT('recurring')&&_xp=='r')_xp='l';if(!FT('losses')&&_xp=='s')_xp='l';if(!FT('history')&&_pr=='hist')_pr='p';if(!FT('reorder')&&_pr=='reorder')_pr='p';
 if(offAny(RF[h])){history.replaceState(null,'','#dash');location.hash='#dash';return}
 if(!FT('profit')&&0){}
 _go2(keep)};

/* ---- hide pieces inside other screens ---- */
const _inv2=invoice;invoice=function(id){_inv2(id);if(!FT('delivery'))document.querySelectorAll('#mc .dc-f button').forEach(b=>/dnote\(/.test(b.getAttribute('onclick')||'')&&b.remove())};
const _pm2=pMenu;pMenu=function(t,id){_pm2(t,id);if(!FT('pricelist'))document.querySelectorAll('#mc button').forEach(b=>/plList\(/.test(b.getAttribute('onclick')||'')&&b.remove())};
const _calc2=calc;calc=function(nop){_calc2(nop);if(!FT('profit')){const t=$('tt');t&&[...t.querySelectorAll('.row')].forEach(r=>/Cost of goods|Exact profit/.test(r.textContent)&&r.remove())}};

/* ---- print: paper size is applied only while a document is open ---- */
const PAPERS={a4:['A4','210 × 297 mm'],a5:['A5','148 × 210 mm'],t80:['Receipt 80 mm','Thermal roll'],t58:['Receipt 58 mm','Small thermal roll']};
function prApply(){let e=$('prs');if(!e){e=document.createElement('style');e.id='prs';e.media='print';document.head.append(e)}
 const p=PR(),th=p.paper=='t80'||p.paper=='t58',sz=p.paper=='a5'?'A5':p.paper=='t80'?'80mm auto':p.paper=='t58'?'58mm auto':'A4';
 e.textContent=`@page{size:${sz}${!th&&p.o=='l'?' landscape':''};margin:${th?'3mm':'12mm'}}`}
const prClear=()=>{const e=$('prs');if(e)e.textContent=''};
const _dp2=docPage;docPage=function(a,b,c){prApply();return _dp2(a,b,c)};
const _cm2=closeM;closeM=function(){prClear();return _cm2.apply(this,arguments)};
addEventListener('hashchange',prClear);
function prSet(k,v){S.pr=Object.assign({},S.pr||{});S.pr[k]=v;save();go(1)}
function prSetQ(k,v){S.pr=Object.assign({},S.pr||{});S.pr[k]=v;save()}
function prTest(){const t=D.sa[D.sa.length-1];if(!t)return toast('Create a sale first');invoice(t.id)}
function setDp(v){S.dp=v===''?null:+v;save();go(1)}

/* ---- Settings pages ---- */
const _tax0=SEC.tax;
SEC.tax=()=>_tax0().replace(/<button type="button" class="sv-b"[^>]*>Save<\/button>$/,m=>`<div class="sc-t">Decimal places</div><div class="qa" style="margin:6px 0">${[['','Auto'],0,1,2,3,4].map(x=>{const v=Array.isArray(x)?x[0]:x,l=Array.isArray(x)?x[1]:x,on=(S.dp==null||S.dp==='')?v==='':String(S.dp)===String(v);return`<button type="button" class="${on?'':'g'} s" onclick="setDp('${v}')">${l}</button>`}).join('')}</div><p class="k sc-n">Auto uses 3 decimals for KWD, BHD and OMR and 2 for everything else. Now showing: <b>${M(1234.5678)}</b>. This changes how amounts are shown and rounded on new entries; saved records are not changed.</p>`+m);
SEC.pr=()=>{const p=PR(),ch=(k,v,t,d)=>choice(String(p[k])==String(v),t,d,`prSet('${k}','${v}')`),
  tg=(k,t,d)=>ftgl(!!p[k],t,d,`prSet('${k}',${p[k]?0:1})`);
 return`<div class="sc-t">Paper size</div><div class="ch-l">${Object.keys(PAPERS).map(k=>ch('paper',k,PAPERS[k][0],PAPERS[k][1])).join('')}</div>`
 +((p.paper=='a4'||p.paper=='a5')?`<div class="sc-t">Orientation</div><div class="qa" style="margin:6px 0"><button type="button" class="${p.o=='p'?'':'g'} s" onclick="prSet('o','p')">Portrait</button><button type="button" class="${p.o=='l'?'':'g'} s" onclick="prSet('o','l')">Landscape</button></div>`:'')
 +`<div class="sc-t">Text size</div><div class="qa" style="margin:6px 0">${[['s','Small'],['n','Normal'],['l','Large']].map(x=>`<button type="button" class="${p.fs==x[0]?'':'g'} s" onclick="prSet('fs','${x[0]}')">${x[1]}</button>`).join('')}</div>`
 +`<div class="sc-t">Show on documents</div><div class="tg-l">${tg('logo','Logo','Your logo at the top')}${tg('name','Business name','Your business name at the top')}${tg('addr','Business address','Under your business name')}${tg('ph','Business phone number','Under your business name')}${tg('due','Due date','Shown on unpaid sales invoices')}${tg('pty','Customer / supplier phone & address','Under the party name')}${tg('sign','Signature lines','Authorized signature and received by')}${tg('thx','Footer message','The line at the bottom')}</div>`
 +(p.thx?`<div class="sc"><div class="sf"><label for="pr_t">Footer message (leave empty for the default)</label><input id="pr_t" value="${esc(p.thxt||'')}" placeholder="Thank you for your business." onchange="prSetQ('thxt',this.value.trim())"></div></div>`:'')
 +`<button type="button" class="sv-b" style="margin-top:14px" onclick="prTest()">Preview latest invoice</button><p class="k sc-n">Invoice and voucher paper sizes are chosen in the preview itself (A4, A5, A6, 80 mm, 58 mm, custom) and are used for Print, Share Photo and Share PDF.</p>`};
/* ---- Settings: one page per category (settings + the features that belong to it) ---- */
const SROWS={};SETS.forEach(g=>g[2].forEach(r=>SROWS[r[0]]=r));
SROWS.pr=['pr','print','Print settings',()=>PAPERS[PR().paper][0]+' · '+({s:'Small',n:'Normal',l:'Large'})[PR().fs]+' text'];
const SCAT=[
 ['c_biz','building','Business','#2563eb','Name, logo, phone and address',['biz']],
 ['c_sal','receipt','Sales & purchases','#16a34a','Currency, tax, numbering and printing',['tax','pr']],
 ['c_inv','box','Inventory','#d97706','Stock costing, godowns, units and categories',['cost']],
 ['c_mon','wallet','Money','#0d9488','Expenses, recurring costs, losses and cash & bank accounts',[]],
 ['c_cus','users','Customers & suppliers','#db2777','Price lists and customer follow-ups',[]],
 ['c_dash','stmt','Home screen','#0ea5e9','Choose what the Home screen shows',[]],
 ['c_rep','stmt','Reports & tools','#4f46e5','Reports, recycle bin, photos and shortcuts',[]],
 ['c_app','globe','App','#7c3aed','Language',['lang']],
 ['c_dat','cloud','Data','#ea580c','Backup, restore, import and export',['bk','io']],
 ['c_sec','shield','Security','#475569','PIN lock, users and roles',['us']]];
/* the Settings home lists the categories in groups */
const SGRP=[['Your business',['c_biz','c_sal']],['Stock, money & people',['c_inv','c_mon','c_cus']],['Screens & tools',['c_dash','c_rep']],['App & data',['c_app','c_dat','c_sec']]];
let _svp='';
const catSub=c=>{const f=FEATC[c[0]]||[],on=f.filter(x=>FT(x[0])).length;return c[4]+(f.length?' · '+on+'/'+f.length+' features on':'')};
const stRow=(c,k)=>{const r=SROWS[k];return`<button type="button" class="rw" onclick="_svp='${c[0]}';_sv='${k}';go(1);scrollTo(0,0)"><span class="rw-i" style="--c:${c[3]}">${ic(r[1],20)}</span><span class="rw-t"><b>${r[2]}</b><span class="k">${r[3]()}</span></span>${chev()}</button>`};
SCAT.forEach(c=>{SEC[c[0]]=()=>{const f=FEATC[c[0]]||[];
 return(c[5].length?`<div class="sc-t">Settings</div><div class="rw-l">${c[5].map(k=>stRow(c,k)).join('')}</div>`:'')
  +(f.length?`<div class="sc-t">Features</div><p class="k sc-n" style="margin-top:0">Turn off what you don't use. It disappears from the menus, Quick Actions and lists. Your data stays safe, and turning a feature back on brings it all back.</p><div class="tg-l">${f.map(x=>ftgl(FT(x[0]),x[1],x[2],`ftSet('${x[0]}')`)).join('')}</div>`:'')}});
SETS.length=0;SETS.push(['Settings','#2563eb',SCAT.map(c=>[c[0],c[1],c[2],()=>catSub(c)])]);
Object.keys(SETF).forEach(k=>delete SETF[k]);
SCAT.forEach(c=>{SETF[c[0]]={k:c[0],i:c[1],t:c[2],c:c[3]};c[5].forEach(k=>{const r=SROWS[k];SETF[k]={k,i:r[1],t:r[2],s:r[3],c:c[3]}})});
const _ul=upLevel;upLevel=function(){if(cur=='settings'&&_sv&&_svp&&_sv!=_svp)return()=>{_sv=_svp;_svp='';go(1)};if(cur=='settings'&&_sv)_svp='';return _ul()};
const _ss=saveSet;saveSet=function(){const p=_svp;_ss();if(p){_sv=p;_svp='';go(1)}};
function stFind(v){v=(v||'').trim().toLowerCase();let n=0;
 document.querySelectorAll('#v .st-list .rw').forEach(b=>{const m=!v||b.dataset.k.includes(v);b.style.display=m?'':'none';if(m)n++});
 document.querySelectorAll('#v .st-list .rp-g').forEach(g=>{g.style.display=[...g.querySelectorAll('.rw')].some(b=>b.style.display!='none')?'':'none'});
 const e=document.querySelector('#v .st-none');if(e)e.style.display=n?'none':''}
const _vs=V.settings;
V.settings=()=>{if(_sv&&SETF[_sv]&&SEC[_sv])return _vs();_svp='';
 const s=stale(),warn=s.bad?`<button type="button" class="st-warn" onclick="_sv='bk';go(1);scrollTo(0,0)">${ic('clock',20)}<span><b>${s.d<0?'You have never backed up':'Last backup was '+s.d+' days ago'}</b><small>Back up your data now</small></span>${chev()}</button>`:'',
  prof=`<button type="button" class="st-pf" onclick="_sv='biz';go(1);scrollTo(0,0)"><div class="logo"><img src="${S.logo||LOGO}" alt=""></div><span><b>${esc(S.name||'My Business')}</b><small>${esc([S.ph,S.addr].filter(Boolean).join(' · ')||'Add phone and address')}</small></span>${chev()}</button>`,
  key=c=>[c[2],c[4],...c[5].map(k=>SROWS[k][2]),...(FEATC[c[0]]||[]).map(x=>x[1]+' '+x[2])].join(' ').toLowerCase().replace(/"/g,'');
 return`<div class="row"><h3>Settings</h3></div>${prof}${warn}<input class="st-q" type="search" placeholder="Search settings and features…" oninput="stFind(this.value)" aria-label="Search settings">`
  +`<div class="st-list">${SGRP.map(g=>`<div class="rp-g"><div class="rp-gt">${g[0]}</div><div class="rw-l">${g[1].map(id=>SCAT.find(c=>c[0]==id)).filter(Boolean).map(c=>`<button type="button" class="rw" data-k="${esc(key(c))}" onclick="_sv='${c[0]}';go(1);scrollTo(0,0)"><span class="rw-i" style="--c:${c[3]}">${ic(c[1],20)}</span><span class="rw-t"><b>${c[2]}</b><span class="k">${catSub(c)}</span></span>${chev()}</button>`).join('')}</div></div>`).join('')}</div>`
  +`<p class="k st-none" style="display:none;text-align:center">Nothing matches your search</p>`
  +`<p class="k" style="text-align:center;margin:12px 0 0">${FEATK.length-ftOffN()} of ${FEATK.length} features are on</p>`+(ftOffN()?`<button type="button" class="g bk-s" style="margin-top:14px" onclick="ftAll()">Turn all ${ftOffN()} turned-off features back on</button>`:'')
  +`<p class="k" style="text-align:center;margin:18px 0 4px">TradeLynin · your data stays on this device</p>`};

/* ---- Product categories + Unit conversion switches ---- */
const _form2=form;
form=function(t,f,cb,v){if(/ Product$/.test(t)){f=f.filter(x=>!(x.k=='cat'&&!FT('categories'))&&!(x.k=='cv'&&!FT('units')));const c0=cb;cb=o=>{if(v){if(!FT('categories')&&!('cat' in o))o.cat=v.cat;if(!FT('units')&&!('cv' in o))o.cv=v.cv}return c0(o)}}return _form2(t,f,cb,v)};
const _usFill=usFill;usFill=function(r,u){_usFill(r,u);if(!FT('units')){const x=r.querySelector('.us');if(x){x.value='1';x.style.display='none'}}};
const _vu=V.units;V.units=()=>{const h=_vu();if(FT('units'))return h;const i=h.indexOf('<div class="row" style="margin-top:20px"><h3>Conversions</h3>');return i<0?h:h.slice(0,i)};
function hideCol(name){document.querySelectorAll('#v table').forEach(t=>{const th=[...t.querySelectorAll('thead th, tr:first-child th')],i=th.findIndex(x=>x.textContent.trim().toLowerCase()==name);if(i<0)return;t.querySelectorAll('tr').forEach(r=>{const c=r.children[i];if(c)c.style.display='none'})})}
const _go3=go;go=function(keep){if(!FT('categories')&&_pr=='cat')_pr='p';if(!FT('categories')&&CF){CF=''}_go3(keep);if(!FT('categories')&&cur=='products'){document.querySelectorAll('#v select[onchange^="catSel"]').forEach(x=>{const w=x.closest('.dd-w,.cs-w')||x;w.style.display='none'});hideCol('category')}};
go(1);
