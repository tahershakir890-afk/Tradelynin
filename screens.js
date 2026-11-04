/* =====================================================================
 TradeLynin — navigation, Reports and Settings screens (loaded after docs.js)
   Back button     every page except Home gets a back button; pages with an inner level
                   (a report, a settings section, Categories, filtered lists…) go up one level first
   V.reports       Reports hub (grouped list) + report page (period chips, key figures, table)
   V.settings      Settings hub (grouped list) + one page per section
   saveSet()       saves whichever settings fields are on the open section
 ===================================================================== */

Object.assign(IC,{
 trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 scale:'<path d="M12 3v18M6 21h12M5 7h14"/><path d="M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/>',
 wallet:'<path d="M3 7a2 2 0 012-2h13v4"/><path d="M3 7v11a2 2 0 002 2h16V9H5a2 2 0 01-2-2z"/><circle cx="16.5" cy="14.5" r="1"/>',
 book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/><path d="M9 7h6"/>',
 percent:'<path d="M5 19L19 5"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/>',
 bag:'<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
 box:'<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
 users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.2 2.7-5.8 6-5.8s6 2.6 6 5.8"/><path d="M16 5a3 3 0 010 6M18 15c2 .7 3 2.5 3 5"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 archive:'<path d="M3 4h18v4H3z"/><path d="M5 8v12h14V8M10 12h4"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 data:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
 building:'<path d="M4 21V5l8-2v18M12 9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 cloud:'<path d="M7 18a4 4 0 01-.5-8A6 6 0 0118 9.5 4.3 4.3 0 0117.5 18z"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
 download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 chev:'<path d="M9 5l7 7-7 7"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 cam:'<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13" r="3.5"/>',
 logout:'<path d="M9 4H5v16h4"/><path d="M16 8l4 4-4 4M20 12H9"/>'
});
const chev=()=>`<span class="rw-ch">${ic('chev',16)}</span>`;

/* ================= back navigation ================= */
let _rv='',_sv='',_rc=0,_cfFrom=0;                      // open report · open settings section · custom dates shown · products filtered from Categories
const HS=[location.hash||'#dash'];
/* HS = pages visited in this session. Every history entry we create is stamped with its position, so going back
   (our button or the phone's back) truncates the list, while visiting a page again pushes a new entry. */
function trackHash(){const h=location.hash||'#dash',st=history.state;
 if(st&&typeof st.i=='number'&&st.i<HS.length){HS.length=st.i+1;HS[st.i]=h}
 else if(HS[HS.length-1]!=h)HS.push(h);
 if(h!='#reports'){_rv='';_rc=0}if(h!='#settings')_sv='';if(h!='#expenses'){_xp='l';_xf=''}}
const stamp=()=>{try{history.replaceState({i:HS.length-1},'',location.href)}catch(e){}};
addEventListener('hashchange',trackHash);
const _vc0=viewCat;viewCat=function(id){_vc0(id);_cfFrom=1};
const _cs0=catSel;catSel=function(v){_cfFrom=0;_cs0(v)};
/* one level up inside the current page, or null when the page is already at its top */
function upLevel(){
 if((cur=='products'||cur=='godowns')&&PTX)return()=>{PTX=0;go(1)};
 if(cur=='parties'&&CTX)return()=>{CTX=null;go(1)};
 if(cur=='reports'&&_rv)return()=>{_rv='';go(1)};
 if(cur=='settings'&&_sv)return()=>{_sv='';go(1)};
 if(cur=='products'&&_pr=='p'&&CF&&_cfFrom)return()=>{CF='';_cfFrom=0;_pr='cat';go(1)};
 if(cur=='products'&&_pr!='p')return()=>{_pr='p';CF='';go(1)};
 if(cur=='products'&&CF)return()=>{CF='';go(1)};
 if(cur=='expenses'&&_xf)return()=>{_xf='';_xp='c';go(1)};
 if(cur=='expenses'&&_xp=='c')return()=>{_xp='l';go(1)};
 return null}
function pgBack(){const u=upLevel();if(u)return u();
 if(HS.length>1){const was=location.hash;history.back();setTimeout(()=>{if(location.hash==was){HS.pop();location.hash=HS[HS.length-1]&&HS[HS.length-1]!=was?HS[HS.length-1]:'#dash'}},300)}
 else location.hash='#dash'}
const hasBack=()=>cur!='dash';
const bkBtn=()=>`<button type="button" class="g pg-bk" aria-label="Back" onclick="pgBack()">${ic('back',22)}</button>`;
function addBack(){const v=$('v');if(!v||v.querySelector('.pg-bk')||!hasBack())return;const h=v.querySelector('h3');if(!h)return;
 const w=document.createElement('div');w.className='pg-t';h.before(w);w.insertAdjacentHTML('beforeend',bkBtn());w.append(h)}
/* ---- header "Add" button (no dropdown) + a chip row for switching between the page's sections ---- */
let _ddItems=null;
let _ddAct=false;
dd=function(items){const only=!items.some(i=>i.on||'add' in i);_ddAct=only;
 if(only){_ddItems=items.slice(1).map(i=>({...i,on:false}));return`<button type="button" class="ab" onclick="${items[0].act}" aria-label="Add">${ic('plus',17)}<span>Add</span></button>`}
 _ddItems=items;const on=items.find(i=>i.on)||items[0],act=(on&&on.add)||'fab()';
 return`<button type="button" class="ab" onclick="${act}" aria-label="Add">${ic('plus',17)}<span>Add</span></button>`};
function addChips(){const v=$('v'),it=_ddItems;if(!v||!it||it.length<(_ddAct?1:2)||v.querySelector('.nv-ch'))return;const hd=v.querySelector('.hd');if(!hd)return;
 hd.insertAdjacentHTML('afterend',`<div class="nv-ch" role="tablist">${it.map(i=>`<button type="button" role="tab" class="${i.on?'on':''}" onclick="${i.act}">${i.l}</button>`).join('')}</div>`);
 const a=v.querySelector('.nv-ch .on');if(a&&a.scrollIntoView)try{a.scrollIntoView({inline:'center',block:'nearest'})}catch(e){}}
function normAdd(){document.querySelectorAll('#v .hd>button,#v .hd>.gn').forEach(b=>{if(b.classList.contains('ab')||b.classList.contains('tfl')||b.classList.contains('pg-bk'))return;const t=b.textContent.trim();if(b.classList.contains('gn')||/^\+\s/.test(t)){b.className='ab';b.innerHTML=ic('plus',17)+'<span>Add</span>'}})}
const _go0=go;go=function(keep){trackHash();_ddItems=null;_ddAct=false;_go0(keep);normAdd();addChips();addBack();stamp()};
go(1);                                                     // re-draw the first screen with the new header
/* page header with its own back button (Reports, Settings pages) */
const pgHead=(t,right,sub)=>`<div class="pg-h">${bkBtn()}<div class="pg-ti"><h3>${t}</h3>${sub?`<span class="k">${sub}</span>`:''}</div>${right||''}</div>`;

/* the sheets opened from a customer / supplier sheet return to it */
const _pm0=pMenu;pMenu=function(t,id){_pm0(t,id);const bs=document.querySelectorAll('.pm-sec button,.pm-act button');bs.forEach(b=>{const o=b.getAttribute('onclick')||'';if(/stmt\(|plList\(/.test(o))b.setAttribute('onclick',`window._rb=()=>pMenu('${t}',${id});`+o)})};
const _dp0=docPage;docPage=function(title,paper,foot){_dp0(title,paper,foot);const b=$('mc').querySelector('.fp-bk');if(b)b.onclick=()=>{closeM();const r=window._rb;window._rb=null;r&&r()}};
const _pl0=plList;plList=function(id){const r=window._rb;_pl0(id);window._rb=null;window._sb=r||null;const m=$('mc');m.querySelectorAll('button').forEach(b=>{if(/closeM\(\)/.test(b.getAttribute('onclick')||'')&&/^Close$/.test(b.textContent.trim())&&r){b.textContent='Back';b.onclick=()=>{closeM();r()}}})};
/* information sheets (price list, account statement, product info…) get the same back button as pages;
   confirm dialogs and forms with Save / Import buttons keep their own Cancel */
const _modal0=modal;
modal=function(h){window._sb=null;_modal0(h);const m=$('m'),mc=$('mc');if(m.classList.contains('full')||mc.querySelector('.pm,#ok,#yes'))return;
 const t=mc.querySelector(':scope>h3');if(!t||/^(Login|Restore|Discard|Bulk|Delete)/i.test(t.textContent.trim())||/\?$/.test(t.textContent.trim()))return;
 const w=document.createElement('div');w.className='sh-t';t.before(w);w.insertAdjacentHTML('beforeend','<button type="button" class="g pg-bk" aria-label="Back" onclick="closeM();const r=window._sb;window._sb=null;r&&r()">'+ic('back',22)+'</button>');w.append(t)};

/* ================= Reports ================= */
const REPS=[
 ['Financial','#2563eb',[['pl','trend','Profit & Loss','Sales, cost of goods, expenses and net profit'],['bs','scale','Balance Sheet','Assets, liabilities and equity as of today'],['cb','wallet','Cash Book','Money in and out of every account'],['db','book','Day Book','Everything that happened on a day'],['pf','percent','Profit Analysis','Profit by product, customer or invoice']]],
 ['Sales & purchases','#16a34a',[['sa','bag','Sales','Every sales invoice'],['pu','box','Purchases','Every purchase bill'],['ex','receipt','Expenses','Spending by date and category']]],
 ['Customers & suppliers','#ea580c',[['co','users','Customer Outstanding','Who owes you money'],['so','users','Supplier Outstanding','Who you owe money to'],['ag','clock','Aging / Overdue','Unpaid bills by how late they are'],['cl','book','Customer Ledger','Full account of one customer'],['sl','book','Supplier Ledger','Full account of one supplier']]],
 ['Stock','#7c3aed',[['st','box','Stock','Quantity and value on hand'],['fm','bolt','Fast Moving','Products that sell most often'],['ds','archive','Dead Stock','Products that stopped selling']]],
 ['Control','#475569',[['au','shield','Audit Log','Who changed what, and when']]]
];
const REPF=Object.fromEntries(REPS.flatMap(g=>g[2].map(r=>[r[0],{k:r[0],i:r[1],t:r[2],d:r[3],c:g[1]}])));
const DATED=['pl','db','sa','pu','ex','cb','au','pf','cl','sl'];
const _vRep0=V.reports;
const dIso=d=>d.toISOString().slice(0,10),addD=(s,n)=>{const d=new Date(s+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+n);return dIso(d)};
const PERIODS=()=>{const t=today(),y=t.slice(0,4),m=t.slice(0,7),pm=(()=>{const d=new Date(m+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()-1);return dIso(d)})();
 return[['Today',t,t],['Last 7 days',addD(t,-6),t],['This month',m+'-01',t],['Last month',pm.slice(0,8)+'01',addD(m+'-01',-1)],['This year',y+'-01-01',t],['All','','']]};
function setPer(a,b){R1=a;R2=b;_rc=0;go(1)}
const plNums=(a,b)=>{const inr=d=>(!a||d>=a)&&(!b||d<=b),sg=D.sa.filter(t=>inr(t.date)),rev=sg.reduce((s,t)=>s+(t.ret?-1:1)*tot(t).net,0),cogs=sg.reduce((s,t)=>s+(t.ret?-1:1)*t.items.reduce((x,i,k)=>x+i.q*unitCost(t,k,i),0),0),ex=D.ex.filter(e=>inr(e.date)).reduce((s,e)=>s+N(e.amt),0),ls=window.lsSum?lsSum(inr):0;return{rev,cogs,gp:rev-cogs,ex,ls,np:rev-cogs-ex-ls}};
const rk=(l,v,tone,sub)=>`<div class="rk ${tone||''}"><span>${l}</span><b>${v}</b>${sub?`<small>${sub}</small>`:''}</div>`;
function repKpis(k){
 const inr=d=>(!R1||d>=R1)&&(!R2||d<=R2);
 if(k=='pl'){const p=plNums(R1,R2);return[rk('Net sales',M(p.rev)),rk('Gross profit',M(p.gp),'',p.rev?(p.gp/p.rev*100).toFixed(1)+'% margin':''),rk('Expenses',M(p.ex)),...(p.ls?[rk('Losses &amp; write-offs',M(p.ls),'bad')]:[]),rk('Net profit',M(p.np),p.np<0?'bad':'good')]}
 if(k=='sa'||k=='pu'){const L=D[k].filter(t=>inr(t.date)),sg=t=>t.ret?-1:1,T=L.reduce((s,t)=>s+sg(t)*tot(t).total,0),P=L.reduce((s,t)=>s+sg(t)*(N(t.paid)+alloc(t.id)),0);return[rk(k=='sa'?'Invoices':'Bills',L.filter(t=>!t.ret).length),rk('Total',M(T)),rk('Unpaid',M(T-P),T-P>0.004?'bad':'good')]}
 if(k=='ex'){const L=D.ex.filter(e=>inr(e.date)),m={};L.forEach(e=>m[e.cat||'Uncategorized']=(m[e.cat||'Uncategorized']||0)+N(e.amt));const top=Object.entries(m).sort((a,b)=>b[1]-a[1])[0];return[rk('Total spent',M(L.reduce((s,e)=>s+N(e.amt),0))),rk('Entries',L.length),rk('Top category',top?esc(top[0]):'—','',top?M(top[1]):'')]}
 if(k=='st'){const q=D.p.reduce((s,p)=>s+val(p.id),0),r=D.p.reduce((s,p)=>s+stock(p.id)*N(p.price),0);return[rk('Products',D.p.length),rk('Cost value',M(q)),rk('Retail value',M(r))]}
 if(k=='co'||k=='so'){const a=k=='co'?'c':'s',B=D[a].map(x=>bal(a,x.id)).filter(v=>v>0.004);return[rk(k=='co'?'To receive':'To pay',M(B.reduce((s,v)=>s+v,0)),k=='co'?'good':'bad'),rk(k=='co'?'Customers owing':'Suppliers owed',B.length),rk('Largest',B.length?M(Math.max(...B)):'—')]}
 return[]}
function repBody(k){
 rp=k;const fo=FO.r;FO.r=false;let h;try{h=_vRep0()}finally{FO.r=fo}
 h=h.replace(/<table>([\s\S]*?)<\/tr>/g,(m,r)=>(r.match(/<th/g)||[]).length<=4?'<table class="few">'+r+'</tr>':m);
 if(k=='sa'||k=='pu')h=h.replace(/ <button class="g s" onclick="doc\('[a-z]+',0,\d+\)">Edit<\/button> <button class="g s" onclick="delTx\('[a-z]+',\d+\)">Delete<\/button>/g,'');
 return h.replace(/^<div class="row rh">[\s\S]*?<\/div>/,'').replace(/<div class="k" style="margin:2px 0 8px">Date:[^<]*<\/div>/,'').replace('Use Filter to pick another date or a range.','Pick another period above.')}
V.reports=()=>{
 if(!REPF[_rv]){
  const p=plNums(today().slice(0,7)+'-01',today());
  const hero=`<div class="rp-hero"><span>This month so far</span><div><div><small>Net sales</small><b>${M(p.rev)}</b></div><div><small>Expenses</small><b>${M(p.ex)}</b></div>${p.ls?`<div><small>Losses</small><b class="neg">${M(p.ls)}</b></div>`:''}<div><small>Net profit</small><b class="${p.np<0?'neg':''}">${M(p.np)}</b></div></div></div>`;
  return`<div class="row"><h3>Reports</h3></div>${hero}`+REPS.map(g=>`<div class="rp-g"><div class="rp-gt">${g[0]}</div><div class="rw-l">${g[2].map(r=>`<button type="button" class="rw" onclick="_rv='${r[0]}';rp='${r[0]}';RS='';window.q='';go(1);scrollTo(0,0)"><span class="rw-i" style="--c:${g[1]}">${ic(r[1],20)}</span><span class="rw-t"><b>${r[2]}</b><span class="k">${r[3]}</span></span>${chev()}</button>`).join('')}</div></div>`).join('')}
 const f=REPF[_rv],dated=DATED.includes(_rv),per=PERIODS().filter(x=>!(_rv=='db'&&x[0]=='All'));
 const act=per.findIndex(x=>x[1]==R1&&x[2]==R2),custom=dated&&act<0&&(R1||R2);
 const chips=dated?`<div class="rp-ch">${per.map((x,i)=>`<button type="button" class="${i==act&&!_rc?'on':''}" onclick="setPer('${x[1]}','${x[2]}')">${x[0]}</button>`).join('')}<button type="button" class="${(custom||_rc)?'on':''}" onclick="_rc=!_rc;go(1)">${ic('cal',15)} Custom</button></div>${(_rc||custom)&&_rc?`<div class="rp-cu"><div><label>From</label><input type="date" value="${R1}" onchange="R1=this.value;go(1)"></div><div><label>To</label><input type="date" value="${R2}" onchange="R2=this.value;go(1)"></div></div>`:''}${(R1||R2)&&!_rc?`<div class="k rp-rng">${R1||'…'} → ${R2||'…'}</div>`:''}`:'';
 const kp=repKpis(_rv),srch=['sa','pu','ex','st','co','so','cb','au','pf','ds','fm','db'].includes(_rv)?`<input class="rp-s" placeholder="Search in this report…" value="${esc(RS)}" oninput="srch('r',this.value)">`:'';
 const extra=_rv=='ds'?`<select class="rp-s" onchange="DSB=this.value;go(1)">${['','Never sold','1–3 months','3–6 months','6–12 months','Over 1 year'].map(o=>`<option value="${o}" ${DSB==o?'selected':''}>${o?'Idle: '+o:'All idle periods'}</option>`).join('')}</select>`:_rv=='fm'?`<select class="rp-s" onchange="FMP=this.value;go(1)">${['','Daily','Every 2–3 days','Weekly','Occasional'].map(o=>`<option value="${o}" ${FMP==o?'selected':''}>${o?'Pattern: '+o:'All patterns'}</option>`).join('')}</select>`:'';
 const head=pgHead(f.t,'<button type="button" class="g pg-ib np" aria-label="Print" onclick="window.print()">'+ic('print',20)+'</button>',f.d);
 return head+chips+(kp.length?`<div class="rk-g n${kp.length}">${kp.join('')}</div>`:'')+srch+extra+`<div class="rp-b">${repBody(_rv)}</div>`};

/* ================= Settings ================= */
const _vSet0=V.settings;
const lblCm={fifo:'FIFO',lifo:'LIFO',batch:'Batch tracking'};
const stale=()=>{let t=0;try{t=+localStorage.getItem(BKK)||0}catch(e){}const d=t?Math.floor((Date.now()-t)/864e5):-1;return{d,bad:d<0||d>7}};
const fld=(l,id,v,t,extra)=>`<div class="sf"><label for="${id}">${l}</label><input id="${id}" type="${t||'text'}" ${t=='number'?'step="any" inputmode="decimal"':''} value="${esc(v)}" ${extra||''}></div>`;
const choice=(on,t,d,fn)=>`<button type="button" class="ch ${on?'on':''}" onclick="${fn}"><span class="ch-r"></span><span class="ch-t"><b>${t}</b><span class="k">${d}</span></span></button>`;
const SETS=[
 ['Business','#2563eb',[['biz','building','Business profile',()=>esc(S.name||'—')],['tax','percent','Currency, tax & numbering',()=>`${esc(S.cur)} · VAT ${N(S.tax)}% · ${esc(S.pre)}`],['cost','layers','Stock costing',()=>lblCm[S.cm||'fifo']+' · discount step '+dsStep().toFixed(dec())]]],
 ['Preferences','#16a34a',[['lang','globe','Language',()=>`App ${S.ui=='ar'?'العربية':'English'} · Invoices ${({ar:'العربية',both:'English + العربية'})[S.lang]||'English'}`]]],
 ['Data','#ea580c',[['bk','cloud','Backup & restore',()=>{const s=stale();return s.d<0?'Never backed up':s.d==0?'Backed up today':s.d+' day'+(s.d>1?'s':'')+' since last backup'}],['io','data','Import & export',()=>'CSV, Excel']]],
 ['Security','#475569',[['us','shield','Users & roles',()=>{const n=(D.us||[]).length;return n?n+' user'+(n>1?'s':''):'No PIN lock'}]]]
];
const SETF={};SETS.forEach(g=>g[2].forEach(r=>SETF[r[0]]={k:r[0],i:r[1],t:r[2],s:r[3],c:g[1]}));
function saveSet(){const v=id=>$(id)?$(id).value:null;
 ['name','ph','cur','pre','addr'].forEach(k=>{const x=v('s_'+k);if(x!=null)S[k]=k=='cur'?(x.trim()||S.cur):x});
 if(v('s_tax')!=null)S.tax=N(v('s_tax'));if(v('s_ds')!=null)S.ds=v('s_ds')===''?0.05:Math.max(0,N(v('s_ds')));
 save();brand();toast('Settings saved');_sv='';go(1)}
const setCm=v=>{S.cm=v;save();toast('Costing method: '+lblCm[v]);go(1)};
const setLang=v=>{S.lang=v;save();go(1)};
const secSave=`<button type="button" class="sv-b" onclick="saveSet()">Save</button>`;
const SEC={
 biz:()=>`<div class="sc"><div class="sc-logo"><div class="logo">${S.logo?`<img src="${S.logo}" alt="">`:`<img src="${LOGO}" alt="">`}</div><label class="btn g sc-up">${ic('cam',18)} Change logo<input type="file" accept="image/*" hidden onchange="logo(this)"></label></div>${fld('Business name','s_name',S.name)}${fld('Phone','s_ph',S.ph,'tel')}${fld('Address','s_addr',S.addr)}</div><p class="k sc-n">These details appear at the top of every invoice and statement.</p>${secSave}`,
 tax:()=>`<div class="sc">${fld('Currency code','s_cur',S.cur,'text','maxlength="5" autocapitalize="characters"')}${fld('Tax / VAT %','s_tax',S.tax,'number')}${fld('Invoice prefix','s_pre',S.pre)}</div><p class="k sc-n">Currency KWD, BHD and OMR show three decimals. VAT is added to new sales. The prefix starts every invoice number, for example ${esc(S.pre)}0001.</p>${secSave}`,
 cost:()=>`<div class="sc-t">Costing method</div><div class="ch-l">${choice((S.cm||'fifo')=='fifo','FIFO','Oldest stock is sold first. The usual choice.',"setCm('fifo')")}${choice(S.cm=='lifo','LIFO','Newest stock is sold first.',"setCm('lifo')")}${choice(S.cm=='batch','Batch tracking','Pick the purchase batch on every sale line. Auto uses FIFO.',"setCm('batch')")}</div><p class="k sc-n">Decides which purchase cost a sale uses for profit and stock value.</p><div class="sc">${fld('Discount split step (0 = proportional)','s_ds',dsStep(),'number','min="0"')}</div><p class="k sc-n">A bill discount is divided between the items so each unit price drops in clean steps of this size, for example ${(0.05).toFixed(dec())}. Use 0 to divide it in proportion to value.</p>${secSave}`,
 lang:()=>`<div class="sc-t">App language</div><div class="ch-l">${choice(S.ui!='ar','English','Menus and screens in English.',"setUi('en')")}${choice(S.ui=='ar','العربية','القوائم والشاشات بالعربية.',"setUi('ar')")}</div><div class="sc-t">Invoice language</div><div class="ch-l">${choice(!S.lang||S.lang=='en','English','Invoices and statements in English.',"setLang('en')")}${choice(S.lang=='ar','العربية','الفواتير وكشوف الحساب بالعربية.',"setLang('ar')")}${choice(S.lang=='both','English + العربية','Both languages on every line.',"setLang('both')")}</div>`,
 bk:()=>{const s=stale();return`<div class="bk-st ${s.bad?'bad':'ok'}"><span>${ic(s.bad?'clock':'check',22)}</span><div>${bkInfo()}<span class="k">Your data is stored only in this browser. If the browser data is cleared or the phone is lost, it cannot be recovered.</span></div></div><div class="bk-a"><button type="button" class="sv-b" onclick="bkShare()">${ic('share',20)} Save to cloud / share</button><button type="button" class="g bk-s" onclick="exp()">${ic('download',20)} Download backup file</button><label class="btn g bk-s">${ic('upload',20)} Restore from backup<input type="file" hidden onchange="imp(this)"></label></div><p class="k sc-n">Save to cloud / share opens your phone's share menu: pick Google Drive, iCloud Drive, OneDrive, Dropbox, email or WhatsApp. On a computer it downloads the file, so put it in your cloud folder.</p>${window.cloudCard?cloudCard():''}`},
 io:()=>`<div class="sc"><div class="sc-t" style="margin:0">Import from CSV or Excel</div><div class="sf"><label for="imp_t">What are you importing?</label><select id="imp_t" onchange="IT=this.value;go(1)">${Object.keys(IMP).map(k=>`<option value="${k}" ${k==IT?'selected':''}>${IMP[k].l}</option>`).join('')}</select></div><p class="k">Columns: <b>${IMP[IT].h.join(', ')}</b><br>${IMP[IT].n}</p><div class="k sc-ex">Example: ${esc(IMP[IT].e)}</div><div class="bk-a row2"><button type="button" class="g bk-s" onclick="impTpl()">Template (CSV)</button><button type="button" class="g bk-s" onclick="impTplX()">Template (Excel)</button></div><label class="btn sv-b sc-file">${ic('upload',20)} Choose CSV / Excel file<input type="file" accept=".csv,.xlsx,.xls,text/csv" hidden onchange="impFile(this)"></label></div><div class="sc"><div class="sc-t" style="margin:0">Export</div><p class="k">Everything in one Excel file: products, parties, sales, purchases, expenses and payments.</p><button type="button" class="g bk-s" onclick="xlsExport()">${ic('download',20)} Export all to Excel</button></div>`,
 us:()=>`<div class="sc">${(D.us||[]).map(u=>`<div class="us-r"><span class="av" style="--h:${hue(u.n)}">${esc(initials(u.n))}</span><span class="ct-t"><b>${esc(u.n)}</b><span class="k">${u.role}</span></span><button type="button" class="ct-i" aria-label="Edit" onclick="usForm(${u.id})">${ic('edit',18)}</button><button type="button" class="ct-i dg" aria-label="Delete" onclick="delUs(${u.id})">${ic('trash',18)}</button></div>`).join('')||'<p class="k" style="margin:0">No users yet, so the app opens without a PIN.</p>'}</div><button type="button" class="ct-new" onclick="usForm()">${ic('plus',18)}<span>Add user</span></button><p class="k sc-n">Admin: everything. Staff: no Settings and no deleting. Viewer: read-only. The PIN lock keeps casual users out on this device. It does not encrypt your data, so also use your phone or computer lock.</p>${ME?`<button type="button" class="g bk-s lo" onclick="logout()">${ic('logout',20)} Log out</button>`:''}`
};
V.settings=()=>{
 const f=SETF[_sv];
 if(!f||!SEC[_sv]){
  const s=stale(),warn=s.bad?`<button type="button" class="st-warn" onclick="_sv='bk';go(1);scrollTo(0,0)">${ic('clock',20)}<span><b>${s.d<0?'You have never backed up':'Last backup was '+s.d+' days ago'}</b><small>Back up your data now</small></span>${chev()}</button>`:'';
  const prof=`<button type="button" class="st-pf" onclick="_sv='biz';go(1);scrollTo(0,0)"><div class="logo">${S.logo?`<img src="${S.logo}" alt="">`:`<img src="${LOGO}" alt="">`}</div><span><b>${esc(S.name||'My Business')}</b><small>${esc([S.ph,S.addr].filter(Boolean).join(' · ')||'Add phone and address')}</small></span>${chev()}</button>`;
  return`<div class="row"><h3>Settings</h3></div>${prof}${warn}`+SETS.map(g=>`<div class="rp-g"><div class="rp-gt">${g[0]}</div><div class="rw-l">${g[2].map(r=>`<button type="button" class="rw" onclick="_sv='${r[0]}';go(1);scrollTo(0,0)"><span class="rw-i" style="--c:${g[1]}">${ic(r[1],20)}</span><span class="rw-t"><b>${r[2]}</b><span class="k">${r[3]()}</span></span>${chev()}</button>`).join('')}</div></div>`).join('')}
 return pgHead(f.t)+`<div class="sec">${SEC[_sv]()}</div>`};
