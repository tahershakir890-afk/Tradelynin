/* =====================================================================
 TradeLynin — transaction lists (loaded after screens.js)
 Replaces the wide tables in the Transactions section with clean, readable cards:
   V.sales  V.salesret  V.purchases  V.purchret  V.quotes  V.payin  V.payout  V.expenses  V.alltx
 Each card: icon · party · reference/account · amount · status.  Tap = open, ⋯ = options (view / edit / delete).
 Cards carry data-bkd="kind|a|id" so the "Select" button (bulk delete) works on them too.
 Styles: end of css/overrides.css  (.xr  .xl  .xg  .xs-sum  .xt  .xa)
 ===================================================================== */
Object.assign(IC,{
 note:'<path d="M5 4h14v12l-5 4H5z"/><path d="M14 20v-4h5"/><path d="M8 9h8M8 13h4"/>',
 sale:'<path d="M7 17L17 7"/><path d="M8 7h9v9"/>',
 buy:'<path d="M17 7L7 17"/><path d="M16 17H7V8"/>',
 undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 010 10h-3"/>',
 coin:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 1.9-2.5.9-2.5 1.9 1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/>',
 more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 conv:'<path d="M5 12h14M13 6l6 6-6 6"/>'
});
const xDay=d=>{const t=today(),y=new Date(Date.parse(t)-864e5).toISOString().slice(0,10);if(d==t)return'Today';if(d==y)return'Yesterday';const dt=new Date(d+'T00:00:00Z');return isNaN(dt)?String(d):dt.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})};
const xq=(...s)=>!window.q||s.join(' ').toLowerCase().includes(window.q.toLowerCase());
/* ---- transaction notes: shown under the payment method in lists, and in the details sheet. Never part of an invoice. ---- */
const noteOfMenu=m=>{const g=/^(txm|pym|exm|tfm|wom|trView)\((?:'(\w+)',)?(\d+)\)/.exec(String(m||''));if(!g)return'';const id=+g[3];let r=null;
 if(g[1]=='txm')r=g[2]=='qt'?QT().find(x=>x.id==id):(D[g[2]]||[]).find(x=>x.id==id);else if(g[1]=='pym')r=D.pay.find(x=>x.id==id);else if(g[1]=='exm')r=D.ex.find(x=>x.id==id);else if(g[1]=='tfm')r=(D.tf||[]).find(x=>x.id==id);else if(g[1]=='wom')r=(D.ls||[]).find(x=>x.id==id);else r=(D.th||[]).find(x=>x.id==id);
 return r&&r.note?String(r.note).trim():''};
const xNote=r=>{const n=r.note!=null?r.note:noteOfMenu(r.menu);return n?`<span class="xr-n">${ic('note',13)}<span>${esc(n)}</span></span>`:''};
const xRow=r=>`<div class="xr"${r.bk?` data-bkd="${r.bk}"`:''}><button type="button" class="xr-m" onclick="${r.tap}"><span class="xr-i ${r.ty}">${ic(r.ic,18)}</span><span class="xr-t"><b>${esc(r.t)}</b><span class="k">${r.s}</span>${xNote(r)}</span><span class="xr-a"><b class="${r.ac||''}">${r.a}</b>${r.tag?`<em class="xtg ${r.tag[1]}">${r.tag[0]}</em>`:''}</span></button><button type="button" class="xr-k" aria-label="Options" onclick="${r.menu}">${ic('more',20)}</button></div>`;
const xList=(L,empty)=>{if(!L.length)return`<div class="pl-e">${empty||(xfOn()||window.q||AT||AT1||AT2||ATS?'No results match your search or filter':'Nothing Here Yet')}</div>`;let o='',cd=null;L.slice(0,500).forEach(r=>{if(r.d!==cd){if(cd!==null)o+='</div>';cd=r.d;o+=`<div class="xg">${xDay(r.d)}</div><div class="xl">`}o+=xRow(r)});return o+'</div>'+(L.length>500?'<p class="k">Showing the latest 500 — use search or filter to narrow down.</p>':'')};
const xSum=a=>`<div class="xs-sum">${a.map(x=>`<div><span>${x[0]}</span><b class="${x[2]||''}">${x[1]}</b></div>`).join('')}</div>`;
const xSearch=()=>`<input class="xsr" placeholder="Search name, number or account…" value="${esc(window.q||'')}" oninput="window.q=this.value;go(1)">`;
const xSort=(a,b)=>a.d<b.d?1:a.d>b.d?-1:b.id-a.id;
/* options sheet */
const nl2=t=>t&&String(t).trim()?esc(String(t).trim()).replace(/\n/g,'<br>'):'';
const xDet=rows=>{rows=rows.filter(r=>r&&r[1]);return rows.length?`<div class="xd">${rows.map(r=>`<div class="xd-r${r[2]?' '+r[2]:''}"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`:''};
function xsheet(title,sub,items,det){modal(`<div class="pm"><div class="pm-h"><div class="pm-n"><h3>${esc(title)}</h3><span class="k">${sub}</span></div><button type="button" class="g pm-x" aria-label="Close" onclick="closeM()">${ic('x',20)}</button></div>${det||''}<div class="xa">${items.map(i=>`<button type="button" class="${i[3]||''}" onclick="closeM();${i[2]}">${ic(i[0],18)}<span>${i[1]}</span></button>`).join('')}</div></div>`)}
function txm(a,id){const t=a=='qt'?QT().find(x=>x.id==id):D[a].find(x=>x.id==id);if(!t)return;const P=a=='pu'?D.s:D.c,who=nm(P,t.pid)||(a=='pu'?'—':'Walk-In'),it=[['eye','View',`invoice(${id})`],['edit','Edit',`doc('${a}',0,${id})`]];
 if(a=='qt'&&t.st!='Converted')it.push(['conv','Convert to Sale',`doc('sa',0,0,QT().find(x=>x.id==${id}))`]);
 it.push(['trash','Delete',a=='qt'?`delQt(${id})`:`delTx('${a}',${id})`,'dg']);xsheet(t.no,esc(who)+' · '+M(tot(t).total),it,xDet([a=='qt'?null:['Payment method',esc(t.m||'')],['Note',nl2(t.note),'xd-n']]))}
function pym(id){const p=D.pay.find(x=>x.id==id);if(!p)return;xsheet(p.ty=='in'?'Payment IN':'Payment OUT',esc(nm(p.ty=='in'?D.c:D.s,p.pid)||'—')+' · '+M(p.amt),[['stmt',p.ty=='in'?'Receipt Voucher':'Payment Voucher',`voucher(${id})`],['edit','Edit',`payForm('${p.ty}','',${id})`],['trash','Delete',`del('pay',${id})`,'dg']],xDet([['Payment method',esc(p.m||'')],['Note',nl2(p.note),'xd-n']]))}
function exm(id){const e=D.ex.find(x=>x.id==id);if(!e)return;xsheet(e.cat||'Expense',e.date+' · '+M(e.amt),[['edit','Edit',`expForm(${id})`],['trash','Delete',`del('ex',${id})`,'dg']],xDet([['Payment method',esc(e.m||'')],['Note',nl2(e.note),'xd-n']]))}
function tfm(id){const x=(D.tf||[]).find(z=>z.id==id);if(!x)return;xsheet('Transfer',x.date+' · '+M(x.amt),[['trash','Delete',`tfDel(${id})`,'dg']],xDet([['Note',nl2(x.note),'xd-n']]))}
/* sales / purchases / returns */
function xDocList(a,ret){const sale=a=='sa',P=sale?D.c:D.s,L=D[a].filter(t=>!!t.ret==ret).map(t=>{const T=tot(t).total,pd=N(t.paid),due=T-pd-alloc(t.id),who=nm(P,t.pid)||(sale?'Walk-In':'—');return{t,T,pd,due,who}}).filter(x=>tfOk(x)&&xq(x.who,x.t.no,x.t.m,x.t.note)).map(x=>({...x,d:x.t.date,id:x.t.id})).sort(xSort);
 const sum=L.reduce((s,x)=>s+x.T,0),out=ret?0:L.reduce((s,x)=>s+Math.max(0,x.due),0),w=sale?'Sales':'Purchases',
 rows=L.map(x=>({d:x.d,ty:ret?(sale?'sr':'pr'):a,ic:ret?'undo':sale?'sale':'buy',t:x.who,s:esc(x.t.no)+(x.t.m?' · '+esc(x.t.m):''),a:M(x.T),
  tag:ret?['Return','rt']:x.due<=0.004?['Paid','pd']:['Due '+M(x.due),x.pd>0.004?'du':'ud'],tap:`txm('${a}',${x.id})`,menu:`txm('${a}',${x.id})`,bk:`tx|${a}|${x.id}`}));
 return xSearch()+xSum(ret?[['Total',M(sum)],['Entries',L.length]]:[['Total '+w.toLowerCase(),M(sum)],[sale?'To receive':'To pay',M(out),out>0.004?(sale?'ok':'low'):''],['Invoices',L.length]])+xList(rows)}
const _xv={sales:['Sales','sa',0],salesret:['Sales Return','sa',1],purchases:['Purchases','pu',0],purchret:['Purchase Return','pu',1]};
Object.keys(_xv).forEach(k=>{const[ti,a,r]=_xv[k];V[k]=()=>wh(ddTx(k),`<h3>${ti}</h3>`+xDocList(a,!!r))});
/* quotations */
V.quotes=()=>{const L=QT().map(t=>({t,who:nm(D.c,t.pid)||'—',d:t.date,id:t.id})).filter(x=>tfOk(x)&&xq(x.who,x.t.no,x.t.st||'Open',x.t.note)).sort(xSort),op=L.filter(x=>x.t.st!='Converted');
 return wh(ddTx('quotes'),`<h3>Quotations</h3>`+xSearch()+xSum([['Open value',M(op.reduce((s,x)=>s+tot(x.t).total,0))],['Open',op.length],['Converted',L.length-op.length]])+xList(L.map(x=>({d:x.d,ty:'qt',ic:'stmt',t:x.who,s:esc(x.t.no),a:M(tot(x.t).total),tag:[x.t.st||'Open',x.t.st=='Converted'?'pd':'op'],tap:`txm('qt',${x.id})`,menu:`txm('qt',${x.id})`,bk:`qt||${x.id}`}))))};
/* payments */
['in','out'].forEach(ty=>{const c=ty=='in',k=c?'payin':'payout',bn=e=>e.id<0?'Opening Balance':(D.sa.concat(D.pu).find(x=>x.id==e.id)||{}).no;
 V[k]=()=>{const L=D.pay.filter(p=>p.ty==ty).map(p=>({p,who:nm(c?D.c:D.s,p.pid)||'—',d:p.date,id:p.id})).filter(x=>tfOk(x)&&xq(x.who,x.p.m,x.p.note)).sort(xSort);
  return wh(ddTx(k),`<h3>Payment ${c?'IN':'OUT'}</h3>`+xSearch()+xSum([[c?'Total received':'Total paid',M(L.reduce((s,x)=>s+N(x.p.amt),0)),c?'ok':'low'],['Payments',L.length]])+xList(L.map(x=>{const al=(x.p.al||[]).map(e=>esc(bn(e)||'')).filter(Boolean).join(', ');return{d:x.d,ty:c?'pi':'po',ic:'coin',t:x.who,s:esc(x.p.m)+(al?' · '+al:''),a:M(x.p.amt),ac:c?'ok':'low',tap:`pym(${x.id})`,menu:`pym(${x.id})`,bk:`rec|pay|${x.id}`}})))}});
/* expenses: one section, two tabs (Expenses · Categories) — both can be bulk-deleted */
const xTabs2=()=>`<div class="xt"><button type="button" class="${_xp=='l'?'on':''}" onclick="_xp='l';_xf='';go(1)">Expenses</button>${FT('recurring')?`<button type="button" class="${_xp=='r'?'on':''}" onclick="_xp='r';_xf='';go(1)">Recurring</button>`:''}${FT('losses')?`<button type="button" class="${_xp=='s'?'on':''}" onclick="_xp='s';_xf='';go(1)">Losses</button>`:''}<button type="button" class="${_xp=='c'?'on':''}" onclick="_xp='c';_xf='';go(1)">Categories</button></div>`;
V.expenses=()=>{
 if(_xp=='c'){const srt=[...D.xc].sort((a,b)=>String(a.n).localeCompare(String(b.n))),un=D.ex.filter(e=>!e.cat),mo=D.ex.filter(e=>String(e.date).slice(0,7)==ymNow).reduce((s,e)=>s+N(e.amt),0);
  const rows=srt.map(c=>{const xs=D.ex.filter(e=>e.cat==c.n),t=xs.reduce((s,e)=>s+N(e.amt),0);return ctRow(c.n,'receipt',`${xs.length} expense${xs.length==1?'':'s'} · ${M(t)}`,'',`viewXc(${c.id})`,`xcForm(${c.id})`,`delXc(${c.id})`).replace('<div class="ct-r">',`<div class="ct-r" data-bkd="xc||${c.id}">`)}).join('');
  return wh(ddEx(),`<h3>Expenses / Losses</h3>`+xTabs2()+`<div class="ct-sum">${ctStat('Categories',D.xc.length)}${ctStat('Expenses',D.ex.length)}${ctStat('This month',M(mo))}</div><div class="ct-l">${rows||'<div class="pl-e">No categories yet. Create the first one below.</div>'}${un.length?`<button type="button" class="ct-un" onclick="_xf='__';_xp='l';nav('expenses')">${un.length} expense${un.length==1?'':'s'} without a category ${ic('back',14)}</button>`:''}${ctNew('xcForm()')}</div>`)}
 const chip=_xf?`<div class="xf"><span>Showing <b>${esc(_xf=='__'?'Uncategorized':_xf)}</b></span><button type="button" onclick="_xf='';go(1)">${ic('x',14)} Clear</button></div>`:'',
 L=D.ex.filter(e=>(!_xf||(_xf=='__'?!e.cat:e.cat==_xf))).map(e=>({e,d:e.date,id:e.id})).filter(x=>tfOk(x)&&xq(x.e.cat,x.e.note,x.e.m)).sort(xSort),mo=L.filter(x=>String(x.d).slice(0,7)==ymNow).reduce((s,x)=>s+N(x.e.amt),0);
 return wh(ddEx(),`<h3>Expenses / Losses</h3>`+xTabs2()+chip+xSearch()+xSum([['Total',M(L.reduce((s,x)=>s+N(x.e.amt),0)),'low'],['This month',M(mo)],['Entries',L.length]])+xList(L.map(x=>({d:x.d,ty:'ex',ic:'receipt',t:x.e.cat||'Uncategorized',s:esc(x.e.m),a:M(x.e.amt),tap:`exm(${x.id})`,menu:`exm(${x.id})`,bk:`rec|ex|${x.id}`}))))};
/* all transactions: type, dates and search all live in the Filter panel */
V.alltx=()=>{const q=ATS.toLowerCase(),L=txAll().filter(x=>(!AT||x.ty==AT||(AT=='ret'&&(x.ty=='sr'||x.ty=='pr'))||(AT=='pay'&&(x.ty=='pi'||x.ty=='po')))&&(!AT1||x.d>=AT1)&&(!AT2||x.d<=AT2)&&(!XF.m||x.m==XF.m)&&(!XF.p||String(x.pid)==XF.p)&&(!q||(x.k+' '+x.no+' '+x.who+' '+x.m+' '+(x.note||'')).toLowerCase().includes(q))).sort(xSort),
 mi=L.reduce((s,x)=>s+x.i,0),mo=L.reduce((s,x)=>s+x.o,0),on=!!(AT||AT1||AT2||xfOn()),tl=(ATT.find(z=>z[0]==AT)||[])[1],
 flt=`<button class="g s tfl${on||FO.a?' on':''}" onclick="flTg('a')" aria-label="Filter"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg><span>Filter</span></button>`,
 ICn={sa:'sale',sr:'undo',pu:'buy',pr:'undo',pi:'coin',po:'coin',ex:'receipt',qt:'stmt',tf:'swap'},
 mn=x=>x.ty=='sa'||x.ty=='sr'?`txm('sa',${x.id})`:x.ty=='pu'||x.ty=='pr'?`txm('pu',${x.id})`:x.ty=='qt'?`txm('qt',${x.id})`:x.ty=='pi'||x.ty=='po'?`pym(${x.id})`:x.ty=='ex'?`exm(${x.id})`:`tfm(${x.id})`,
 bk=x=>x.ty=='sa'||x.ty=='sr'?`tx|sa|${x.id}`:x.ty=='pu'||x.ty=='pr'?`tx|pu|${x.id}`:x.ty=='qt'?`qt||${x.id}`:x.ty=='pi'||x.ty=='po'?`rec|pay|${x.id}`:x.ty=='ex'?`rec|ex|${x.id}`:'',
 bar=on?`<div class="xf"><span>Showing <b>${AT?tl:'All types'}</b>${AT1||AT2?' · '+(AT1||'…')+' → '+(AT2||'…'):''}</span><button type="button" onclick="AT='';AT1='';AT2='';xfClear()">${ic('x',14)} Clear</button></div>`:'',
 panel=FO.a?`<div class="card"><label>Type</label><select onchange="AT=this.value;go(1)">${ATT.map(z=>`<option value="${z[0]}" ${AT==z[0]?'selected':''}>${z[0]?z[1]:'All transactions'}</option>`).join('')}</select><div class="f2"><div><label>From</label><input type="date" value="${AT1}" onchange="atD(1,this.value)"></div><div><label>To</label><input type="date" value="${AT2}" onchange="atD(2,this.value)"></div></div><div class="f2"><div><label>Customer / Supplier</label><select onchange="xfSet('p',this.value)"><option value="">All</option>${D.c.map(x=>`<option value="${x.id}" ${XF.p==x.id?'selected':''}>${esc(x.n)}</option>`).join('')}${D.s.map(x=>`<option value="${x.id}" ${XF.p==x.id?'selected':''}>${esc(x.n)} (supplier)</option>`).join('')}</select></div><div><label>Account</label><select onchange="xfSet('m',this.value)"><option value="">All</option>${D.ac.map(a=>`<option ${XF.m==a.n?'selected':''}>${esc(a.n)}</option>`).join('')}</select></div></div></div>`:'';
 return wh(flt+ddTx('alltx'),`<h3>Transactions</h3>`+`<input class="xsr" placeholder="Search name, number or account…" value="${esc(ATS)}" oninput="atS(this.value)">`+panel+bar+xSum([['Money in',M(mi),mi?'ok':''],['Money out',M(mo),mo?'low':''],['Entries',L.length]])+
  xList(L.map(x=>({d:x.d,ty:x.ty,ic:ICn[x.ty],t:x.who||'—',s:x.k+(x.no?' · '+esc(x.no):'')+(x.m?' · '+esc(x.m):''),a:x.n?M(Math.abs(x.a)):M(x.a),ac:x.n?'':x.a<0?'low':'ok',tag:(x.ty=='sa'||x.ty=='pu')?(()=>{const t=D[x.ty].find(z=>z.id==x.id);if(!t)return null;const d=billDue(t);return d<=0.004?['Paid','pd']:['Due '+M(d),N(t.paid)+alloc(t.id)>0.004?'du':'ud']})():null,tap:mn(x),menu:mn(x),bk:bk(x)}))))};
/* one dropdown (instead of the chip row) to jump between the transaction screens */
function txDd(v){if(v=='expenses')nav('expenses',()=>{_xp='l';_xf=''});else nav(v)}
const _ac0=addChips;
addChips=function(){const v=$('v');if(v&&TXI.some(t=>t[1]==cur)){if(v.querySelector('.nv-dd'))return;const hd=v.querySelector('.hd');if(!hd)return;
 const o=TXI.map(t=>[t[1],t[0]]),sel=cur;
 hd.insertAdjacentHTML('afterend',`<div class="nv-dd"><select aria-label="Transactions" onchange="txDd(this.value)">${o.map(x=>`<option value="${x[0]}" ${x[0]==sel?'selected':''}>${x[1]}</option>`).join('')}</select></div>`);return}
 _ac0()};
go(1);
