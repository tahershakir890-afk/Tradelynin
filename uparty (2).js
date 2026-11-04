/* =====================================================================
 TradeLynin v61 — Unified Parties (loaded after lossrec.js)
   One party can be a Customer, a Supplier, or Both.
   · Storage is unchanged: a customer account lives in D.c, a supplier account in D.s.
     A party that is "Both" has ONE record in each list with the SAME id (name / phone / address are kept in step).
   · Every invoice, return, payment and ledger therefore stays exactly as before — balances per role are never mixed up.
   · Pickers (Sale / Purchase / Payment / Quotation) list All Parties. Choosing someone who has no account of that kind
     yet adds it automatically when the transaction is saved.
   · Parties screen: All Parties · Customers · Suppliers · Both. A "Both" party shows To receive, To pay and the Net.
 ===================================================================== */
const pRec=(t,id)=>(t=='c'?D.c:D.s).find(x=>x.id==id);
const pLc=s=>String(s==null?'':s).trim().toLowerCase();
function allP(){const m=new Map();D.c.forEach(x=>m.set(x.id,x));D.s.forEach(x=>{if(!m.has(x.id))m.set(x.id,x)});return[...m.values()].sort((a,b)=>String(a.n).localeCompare(String(b.n)))}
const pKind=id=>{const c=!!pRec('c',id),s=!!pRec('s',id);return c&&s?'b':s?'s':'c'};
const pTag=k=>k=='b'?'Customer · Supplier':k=='s'?'Supplier':'Customer';
const pSub=x=>pTag(pKind(x.id))+(x.ph?' · '+x.ph:'');
const pBals=id=>({c:pRec('c',id)?bal('c',id):0,s:pRec('s',id)?bal('s',id):0});
// a new account of the other kind for an existing party (same id), created only when it is needed
function ensureRole(t,id){if(!id||pRec(t,id))return null;const o=pRec(t=='c'?'s':'c',id);if(!o)return null;
 const r={id:o.id,n:o.n,ph:o.ph||'',ad:o.ad||'',open:0,asof:'',days:null,lim:0};(t=='c'?D.c:D.s).push(r);return r}
function dropRole(t,r){if(r&&!usedBy(t,r.id)){const L=t=='c'?D.c:D.s,i=L.indexOf(r);if(i>=0)L.splice(i,1)}}
// import helper: a new customer / supplier whose name already exists as the other kind joins that party
function upNewRec(t,name){const o=(t=='c'?D.s:D.c).find(z=>pLc(z.n)==pLc(name)&&!pRec(t,z.id));
 return o?{id:o.id,n:o.n,ph:o.ph||'',ad:o.ad||'',open:0}:{id:uid(),n:name,ph:'',ad:'',open:0}}
function syncParty(id,from){const a=pRec(from,id),b=pRec(from=='c'?'s':'c',id);if(a&&b){b.n=a.n;b.ph=a.ph||'';b.ad=a.ad||''}}

/* ---- save a transaction for a party that has no account of that kind yet ---- */
const _sd61=saveDoc;
saveDoc=function(kind,ret,id){const sale=kind=='sa'||kind=='qt',s=$('d_p'),pid=s&&s.value?+s.value:0,t=sale?'c':'s',r=pid?ensureRole(t,pid):null;
 try{return _sd61.apply(this,arguments)}finally{dropRole(t,r)}};
const _pf61=payForm;
payForm=function(ty,pre,id){_pf61.apply(this,arguments);const ok=$('ok');if(!ok||!$('p_pid'))return;const f=ok.onclick;
 ok.onclick=function(){const t=ty=='in'?'c':'s',pid=+$('p_pid').value,r=pid?ensureRole(t,pid):null;try{return f.apply(this,arguments)}finally{dropRole(t,r)}}};
const _pi61=payInfo;
payInfo=function(){_pi61();const el=$('p_info');if(!el||typeof _py=='undefined'||!_py)return;const t=_py.ty=='in'?'c':'s',o=t=='c'?'s':'c',pid=+$('p_pid').value;if(!pid)return;
 if(!pRec(t,pid)&&pRec(o,pid))el.innerHTML=`<div class="pb-card clr"><span>New ${t=='c'?'customer':'supplier'} account — no previous balance</span><b>${M(0)}</b></div>`;
 const ob=pRec(o,pid)?bal(o,pid):0;if(Math.abs(ob)>0.004)el.insertAdjacentHTML('beforeend',`<div class="up-note">Also a ${o=='c'?'customer':'supplier'}: ${o=='c'?(ob>0?'owes you ':'advance received '):(ob>0?'you owe ':'advance paid ')}<b>${M(Math.abs(ob))}</b></div>`)};

/* ---- Add / Edit Party ---- */
partyForm=function(a,id){
 const rc=id?pRec('c',id):null,rs=id?pRec('s',id):null,B=rc||rs||window._pre||{};
 if(id&&!rc&&!rs)return toast('Party not found');
 const k0=id?(rc&&rs?'b':rs?'s':'c'):(a=='s'||a=='c'||a=='b'?a:(['c','s','b'].includes(_pg)?_pg:'c')),
  need=!id&&typeof _stk!='undefined'&&_stk?(a=='s'?'s':'c'):'',
  ro=[['c','Customer'],['s','Supplier'],['b','Both — Customer & Supplier']].filter(r=>!need||r[0]==need||r[0]=='b'),
  v={n:B.n||'',ph:B.ph||'',ad:B.ad||'',role:ro.some(r=>r[0]==k0)?k0:ro[0][0],
   open:rc?N(rc.open):0,asof:rc?(rc.asof||''):today(),days:rc&&rc.days!=null?rc.days:'',lim:rc?N(rc.lim):0,obp:rc&&rc.obp,
   sopen:rs?N(rs.open):0,sasof:rs?(rs.asof||''):today(),sdays:rs&&rs.days!=null?rs.days:'',slim:rs?N(rs.lim):0,sobp:rs&&rs.obp},
  fs=[{k:'n',l:'Name'},{k:'ph',l:'Phone'},{k:'ad',l:'Address'},
   {k:'role',l:'Party Type',t:'sel',o:ro.map(r=>`<option value="${r[0]}">${r[1]}</option>`).join('')},
   {k:'open',l:'Customer — Opening Balance (they owe you)',t:'number',g:'c'},{k:'asof',l:'Customer — As of Date',t:'date',g:'c'},
   {k:'days',l:'Customer — Credit Days (optional, leave empty if none)',t:'number',g:'c'},{k:'lim',l:'Customer — Credit Limit (0 = no limit)',t:'number',g:'c'},
   {k:'obp',l:'Customer — Opening Balance Bill Photo',t:'photo',g:'c'},
   {k:'sopen',l:'Supplier — Opening Balance (you owe them)',t:'number',g:'s'},{k:'sasof',l:'Supplier — As of Date',t:'date',g:'s'},
   {k:'sdays',l:'Supplier — Credit Days (optional, leave empty if none)',t:'number',g:'s'},{k:'slim',l:'Supplier — Credit Limit (0 = no limit)',t:'number',g:'s'},
   {k:'sobp',l:'Supplier — Opening Balance Bill Photo',t:'photo',g:'s'}];
 form((id?'Edit ':'Add ')+'Party',fs,o=>{
  const n=(o.n||'').trim();if(!n){toast('Name Required');return false}
  const want={c:o.role!='s',s:o.role!='c'};
  if(!id){const d=allP().find(x=>pLc(x.n)==pLc(n)&&((!pRec('c',x.id)&&want.c)||(!pRec('s',x.id)&&want.s)));
   if(d){toast('"'+d.n+'" already exists as a '+pTag(pKind(d.id)).toLowerCase()+'. Open it and set Party Type to Both.');return false}}
  for(const t of['c','s']){const r=id?pRec(t,id):null;if(r&&!want[t]){
   if(usedBy(t,id)){toast('Cannot remove the '+(t=='c'?'Customer':'Supplier')+' type — it has invoices or payments');return false}
   if(N(r.open)!=0){toast('Cannot remove the '+(t=='c'?'Customer':'Supplier')+' type — it has an opening balance. Set it to 0 first');return false}}}
  const dy=x=>String(x??'').trim()===''?null:Math.max(0,N(x)),
   val=t=>t=='c'?{open:N(o.open),asof:o.asof||'',days:dy(o.days),lim:N(o.lim),obp:o.obp}:{open:N(o.sopen),asof:o.sasof||'',days:dy(o.sdays),lim:N(o.slim),obp:o.sobp},
   pid=id||uid();
  ['c','s'].forEach(t=>{const r=pRec(t,pid);
   if(!want[t]){if(r)D[t]=D[t].filter(x=>x!==r);return}
   const x=val(t),base={n,ph:o.ph,ad:o.ad,open:x.open,asof:x.asof,days:x.days,lim:x.lim};
   if(r){Object.assign(r,base);if(x.obp)r.obp=x.obp;else delete r.obp}
   else{const nr={id:pid,...base};if(x.obp)nr.obp=x.obp;D[t].push(nr)}})},v);
 const lab=tx=>[...document.querySelectorAll('#mc label')].find(l=>l.textContent.trim()==tx),
  vis=()=>{const r=$('f_role').value;fs.forEach(f=>{if(!f.g)return;const l=lab(f.l);if(!l)return;const sh=f.g=='c'?r!='s':r!='c';l.style.display=sh?'':'none';if(l.nextElementSibling)l.nextElementSibling.style.display=sh?'':'none'})};
 $('f_role').onchange=vis;vis()};

/* ---- delete a party: removes both accounts, only when neither has invoices or payments ---- */
const _del61=del;
del=function(a,id){if(a!='c'&&a!='s')return _del61(a,id);
 const ro=['c','s'].filter(t=>pRec(t,id)),u=ro.filter(t=>usedBy(t,id));
 if(u.length)return toast('Cannot delete — this party has invoices or payments'+(ro.length>1?' (as '+(u[0]=='c'?'customer':'supplier')+')':'')+'. Delete or edit those first');
 ask('Delete This Party?',()=>{ro.forEach(t=>{binPush(t,pRec(t,id));D[t]=D[t].filter(x=>x.id!=id)});CTX=null;save();go()})};
const _beS61=beSave;
beSave=function(k){const ch=(k=='c'||k=='s')?Object.keys(BQ[k]||{}).filter(i=>{const q=BQ[k][i];return'n' in q||'ph' in q||'ad' in q}).map(Number):[];
 const r=_beS61.apply(this,arguments);ch.forEach(i=>syncParty(i,k));if(ch.length)save();return r};

/* ---- link customers and suppliers that already exist separately under the same name ---- */
function upDups(){const seen=new Set(),out=[];D.c.forEach(c=>{if(pRec('s',c.id)||!pLc(c.n))return;const s=D.s.find(z=>!pRec('c',z.id)&&!seen.has(z.id)&&pLc(z.n)==pLc(c.n));if(s){seen.add(s.id);out.push({c,s})}});return out}
function upLinkAsk(){const P=upDups();if(!P.length)return;
 modal(`<h3>Link duplicate parties?</h3><p class="k">These names exist as both a customer and a supplier. Linking makes each one a single party with both accounts. Invoices, payments and balances stay exactly as they are.</p><div class="card">${P.slice(0,12).map(p=>`<div class="row"><b>${esc(p.c.n)}</b><span class="k">${M(bal('c',p.c.id))} to receive · ${M(bal('s',p.s.id))} to pay</span></div>`).join('')}${P.length>12?`<p class="k">+ ${P.length-12} more</p>`:''}</div><div class="row"><button class="g" onclick="closeM()">Cancel</button><button onclick="upLinkAll()">Link ${P.length}</button></div>`)}
function upLinkAll(){const P=upDups();P.forEach(({c,s})=>{const o=s.id,n=c.id;D.pu.forEach(t=>{if(t.pid==o)t.pid=n});D.pay.forEach(p=>{if(p.ty=='out'&&p.pid==o)p.pid=n});
 if(!c.ph&&s.ph)c.ph=s.ph;if(!c.ad&&s.ad)c.ad=s.ad;s.id=n;s.n=c.n;s.ph=c.ph||'';s.ad=c.ad||''});
 save();closeM();toast(P.length+' part'+(P.length==1?'y':'ies')+' linked');go(1)}

/* ---- Parties screen ---- */
const UPF=[['a','All Parties'],['c','Customers'],['s','Suppliers'],['b','Both']];
function pgSet(v){if(bqN('c')||bqN('s'))return toast('Save or discard your bulk edits first');BE.c=0;BE.s=0;_pg=v;go(1)}
function upCnt(){const c={a:0,c:0,s:0,b:0};allP().forEach(x=>{const k=pKind(x.id);c.a++;if(k!='s')c.c++;if(k!='c')c.s++;if(k=='b')c.b++});return c}
function pAct(id){const a=partyAct('c',id),b=partyAct('s',id);return a.d>b.d||(a.d==b.d&&a.n>=b.n)?a:b}
function upBl(x){const f=XF.bl;if(!f)return true;const id=x.id,rs=['c','s'].filter(t=>pRec(t,id)),b=pBals(id);
 if(f=='rec')return b.c>0.0005;if(f=='pay')return b.s>0.0005;
 if(f=='clear')return rs.every(t=>Math.abs(b[t])<=0.0005);if(f=='adv')return rs.some(t=>b[t]<-0.0005);
 if(f=='od')return rs.some(t=>b[t]>0.004&&pend(t,id).some(y=>od(y.t,pRec(t,id))>0));return true}
function upOv(t,id){const r=pRec(t,id);return!!r&&bal(t,id)>0.004&&pend(t,id).some(y=>od(y.t,r)>0)}
const upPlus='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const pcdDay=d=>{const t=new Date(d+'T00:00:00Z');if(isNaN(t))return String(d);const y=t.getUTCFullYear()==new Date().getFullYear();return t.toLocaleDateString('en-GB',y?{day:'numeric',month:'short',timeZone:'UTC'}:{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})};
function upList(){
 if(!['a','c','s','b'].includes(_pg))_pg='a';
 const q=(window.q||'').toLowerCase(),A=allP(),cnt={a:A.length,c:0,s:0,b:0};
 A.forEach(x=>{const k=pKind(x.id);if(k!='s')cnt.c++;if(k!='c')cnt.s++;if(k=='b')cnt.b++});
 const inF=x=>{const k=pKind(x.id);return _pg=='a'||(_pg=='c'&&k!='s')||(_pg=='s'&&k!='c')||(_pg=='b'&&k=='b')},
  act={};A.forEach(x=>act[x.id]=pAct(x.id));
 const L0=A.filter(inF).sort((a,b)=>{const x=act[a.id],y=act[b.id];if(x.d!=y.d)return x.d<y.d?1:-1;if(x.n!=y.n)return y.n-x.n;return String(a.n).localeCompare(String(b.n))}),
  F=L0.filter(x=>upBl(x)&&(!q||(x.n+' '+(x.ph||'')+' '+(x.ad||'')).toLowerCase().includes(q))),
  srch=`<input placeholder="Search name, phone or address…" value="${esc(window.q||'')}" oninput="window.q=this.value;go(1)" style="margin:2px 0 8px">`,
  hint=_pg=='c'||_pg=='s'?`<p class="up-hint">Includes parties that are both customer and supplier.</p>`:'',
  dups=upDups().length,dup=dups&&!window._upDis?`<div class="card up-dup"><span class="k">${dups} part${dups==1?'y exists':'ies exist'} as both a customer and a supplier under the same name.</span><span><button class="g s" onclick="window._upDis=1;go(1)">Later</button> <button class="s" onclick="upLinkAsk()">Link</button></span></div>`:'',
  sum=(()=>{let r=0,p=0;F.forEach(x=>{const b=pBals(x.id);if(b.c>0.0005)r+=b.c;if(b.s>0.0005)p+=b.s});return`<div class="pcd-sum"><div class="pcd-sm in"><span>To receive</span><b>${M(r)}</b></div><div class="pcd-sm out"><span>To pay</span><b>${M(p)}</b></div></div>`})(),
  bulk=_pg=='c'||_pg=='s',t=_pg;
 const body=bulk&&BE[t]?bulkParty(t,F.map(x=>pRec(t,x.id)).filter(Boolean)):`<div class="pl">${F.map(x=>{
  const id=x.id,k=pKind(id),b=pBals(id),net=b.c-b.s,view=_pg=='c'?'c':_pg=='s'?'s':k=='b'?'n':k;
  let main,cls,lbl,extra='',out=false,r0='c',tag='';
  if(view=='c'){main=M(b.c);cls=b.c>0.0005?'ok':'';lbl='To receive';tag=upOv('c',id)?'<em class="tag od">Overdue</em>':b.c<-0.0005?'<em class="tag adv">Advance</em>':''}
  else if(view=='s'){main=M(b.s);cls=b.s>0.0005?'low':'';lbl='To pay';out=true;r0='s';tag=upOv('s',id)?'<em class="tag od">Overdue</em>':b.s<-0.0005?'<em class="tag adv">Advance</em>':''}
  else{main=M(Math.abs(net));cls=net>0.004?'ok':net<-0.004?'low':'';lbl=net>0.004?'Net to receive':net<-0.004?'Net to pay':'Settled';out=net<-0.004;tag=upOv('c',id)||upOv('s',id)?'<em class="tag od">Overdue</em>':''}
  const kind=k=='b'?'Both':k=='s'?'Supplier':'Customer',a=act[id],sd=a&&a.d?pcdDay(a.d):'',
   tone=cls=='ok'?'pcd-ok':cls=='low'?'pcd-low':'pcd-nil';
  if(!tag&&Math.abs(view=='c'?b.c:view=='s'?b.s:net)<=0.0005)tag='<em class="tag st">Settled</em>';
  return`<div class="pl-r pcd ${tone}" data-bkd="rec|${k=='s'?'s':'c'}|${id}"><div class="pcd-w"><button type="button" class="pl-m pcd-m" onclick="partyTx('${r0}',${id})">${avatar(x.n)}<span class="pcd-i"><b class="pcd-n">${esc(x.n)}</b><span class="pcd-meta"><em class="up-b up-k${k}">${kind}</em>${x.ph?`<span class="pcd-ph">${ic('phone',13)}<span>${esc(x.ph)}</span></span>`:''}</span></span><span class="pcd-r"><span class="up-l">${lbl}</span><b class="pcd-v ${cls}">${main}</b></span></button><div class="pcd-f"><div class="pcd-s">${tag}<span class="pcd-la">${sd?'Last activity · '+sd:'No activity yet'}</span></div><button type="button" class="pl-p ${out?'out':'in'}" aria-label="${out?'Payment Out':'Payment In'}" onclick="payForm('${out?'out':'in'}',${id})">${out?'Pay':'Receive'}</button></div></div></div>`}).join('')||(xfOn()||q?'<div class="pl-e">No results match your search or filter</div>':!D.c.length&&!D.s.length&&!D.sa.length&&!D.pu.length?'<div class="pl-e">Nothing Here Yet</div>':'<div class="pl-e">Nothing Here Yet</div>')}</div>`;
 return wh((bulk?beBtn(t):'')+dd(UPF.map(z=>({l:z[1],on:_pg==z[0],act:"pgSet('"+z[0]+"')",add:"partyForm('"+(z[0]=='a'?'':z[0])+"')"}))),
  `<h3>${UPF.find(z=>z[0]==_pg)[1]} <span class="k">(${L0.length})</span></h3>`+(bulk?beTog(t):'')+hint+dup+sum+srch+body)}
V.parties=()=>CTX?partyTxPage():upList();

/* ---- party page: a "Both" party can be viewed as customer or as supplier, with the net position on top ---- */
const _ptp61=partyTxPage;
partyTxPage=function(){const h=_ptp61();if(!CTX)return h;const id=CTX.id,t=CTX.t;if(!(pRec('c',id)&&pRec('s',id)))return h;
 const b=pBals(id),net=b.c-b.s,
  card=`<div class="up-both"><div class="up-tabs">${[['c','As Customer'],['s','As Supplier']].map(z=>`<button type="button" class="${t==z[0]?'':'g'} s" onclick="partyTx('${z[0]}',${id})">${z[1]}</button>`).join('')}</div><div class="up-net"><div><span>To receive</span><b class="${b.c>0.0005?'ok':''}">${M(b.c)}</b></div><div><span>To pay</span><b class="${b.s>0.0005?'low':''}">${M(b.s)}</b></div><div><span>${net>0.004?'Net: they owe you':net<-0.004?'Net: you owe them':'Net settled'}</span><b class="${net>0.004?'ok':net<-0.004?'low':''}">${M(Math.abs(net))}</b></div></div></div>`,
  i=h.indexOf('<div class="pt-bal">');return i<0?card+h:h.slice(0,i)+card+h.slice(i)};
try{go(1)}catch(e){}

/* ---- Settings > Backup: clear all data (backup downloads first; a copy is also kept in storage as _preclear) ---- */
function clearAll(){
 if(ME&&ME.role!='admin')return toast('Only the admin can clear all data');
 if(!confirm('Clear ALL data?\n\nThis deletes every product, customer, supplier, sale, purchase, payment, expense, stock record and photo on this device.\nBusiness settings, logo and users are kept.\n\nA backup file will download first.'))return;
 const t=prompt('Type DELETE to confirm clearing all data');
 if(t==null)return;
 if(String(t).trim().toUpperCase()!=='DELETE')return toast('Not cleared — you did not type DELETE');
 try{exp()}catch(e){}
 setTimeout(()=>{
  try{localStorage.setItem(KEY+'_preclear',JSON.stringify(D))}catch(e){}
  const keep=['set','us','un','ct','xc'];
  Object.keys(D).forEach(k=>{if(keep.includes(k)||k=='id')return;const v=D[k];if(Array.isArray(v))D[k]=[];else if(v&&typeof v=='object')D[k]={}});
  D.g=[{id:1,n:'Main Godown'}];D.st={};D.seq=1;D.log=[];
  _A={};save();
  try{phTx('readwrite',s=>s.clear()).catch(()=>{})}catch(e){}
  toast('All data cleared');setTimeout(()=>location.reload(),900)
 },900)}
