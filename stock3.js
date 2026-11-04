/* =====================================================================
 TradeLynin — v42 stock & history upgrade (loaded after history.js)
   · Products   : responsive product cards (opening · total · per-godown stock), ⋯ menu, tap = history
   · Allocation : "Stock by godown" editor for one product (total must equal the sum of godowns)
   · Bulk       : in Select mode, "Godowns" assigns / re-splits opening stock for all ticked products
   · Godowns    : rebuilt page — godown cards + Available / Zero stock / All filters; picking a godown
                  shows only what is in stock there by default
   · Transfers  : Edit (stock is reversed, re-checked and re-applied safely)
   · Parties    : transaction history now shows the running balance after every entry
 Everything is stored in the same D object (D.p[].ob = opening split, D.st = current stock per godown),
 so existing data is untouched. Styles: css/stock3.css
 ===================================================================== */
const rr=x=>Math.round(x*1e6)/1e6;

/* ---------- split a quantity equally between godowns (whole units stay whole; remainder goes to the first ones) ---------- */
function splitEq(T,gids){const n=gids.length,out={};if(!n)return out;const step=Number.isInteger(T)?1:0.001;
 const base=Math.floor(T/n/step+1e-9)*step;let rem=rr(T-base*n);
 gids.forEach(g=>{let v=base;if(rem>=step-1e-9){v+=step;rem=rr(rem-step)}out[g]=rr(v)});
 if(rem>1e-9)out[gids[0]]=rr(out[gids[0]]+rem);return out}

/* ---------- products: cards ---------- */
function pcm(id){const p=D.p.find(x=>x.id==id);if(!p)return;
 xsheet(p.n,esc([p.sku,p.cat].filter(Boolean).join(' · '))||'Product',[
  ['eye','Transaction history',`prodTx(${id})`],['edit','Edit product',`prodForm(${id})`],
  ['swap','Stock by godown',`allocForm(${id})`],['tag','Adjust stock',`adjForm(${id})`],['trash','Delete',`del('p',${id})`,'dg']])}
function pCard(p){const U=esc(p.u1||'Pcs'),s=stock(p.id),os=osOf(p.id),mn=N(p.min),st=s<=0?['Out of stock','out']:s<=mn?['Low','low']:null,
 chips=D.g.map(g=>{const q=stock(p.id,g.id);return`<span class="gch${q<=0?' z':''}"><i>${esc(g.n)}</i><b>${q}</b></span>`}).join('');
 return`<div class="pl-r pc" data-bkd="rec|p|${p.id}"><div class="pc-b"><div class="pc-h"><button type="button" class="pc-n" onclick="prodTx(${p.id})">${esc(p.n)}</button>${st?`<em class="pc-tg ${st[1]}">${st[0]}</em>`:''}</div>`
  +`<span class="k pc-s">${esc([p.sku,p.cat].filter(Boolean).join(' · '))||'No code'}</span>`
  +`<div class="pc-st"><div><span>Opening</span><b>${os} ${U}</b></div><div><span>In stock</span><b class="${s<=0?'low':s<=mn?'warn':''}">${s} ${U}</b></div><div><span>Price</span><b>${M(p.price)}</b></div></div>`
  +`<div class="pc-g">${chips}</div></div><button type="button" class="xr-k pl-p" aria-label="Options" onclick="pcm(${p.id})">${ic('more',20)}</button></div>`}
const PS={on:false};   // Select mode for the product cards (re-uses the app's bulk-select bar: tick products, then Godowns / Delete)
function psTog(){PS.on=!PS.on;BK.sel.clear();go(1)}
const _bi42=bulkInit;
bulkInit=function(){if(cur!='products'||_pr!='p'||BE.p)PS.on=false;_bi42();
 if(!PS.on)return;BK.on=true;
 document.querySelectorAll('#v .pl-r.pc').forEach(r=>{const o=bkParse(r);if(!o)return;const k=bkKey(o),c=document.createElement('span');c.className='bkc';
  c.innerHTML=`<input type="checkbox" data-bk="${k}" ${BK.sel.has(k)?'checked':''} onchange="bkChk(this)" onclick="event.stopPropagation()" aria-label="Select">`;
  r.prepend(c);r.classList.add('bk-on');r.onclick=()=>{const i=r.querySelector('input[data-bk]');i.checked=!i.checked;bkChk(i)}});bkBar()};
const _bp42=bulkProducts;
bulkProducts=function(){if(BE.p)return _bp42();const h=_bp42(),
 L=D.p.filter(p=>(!window.q||(p.n+(p.sku||'')).toLowerCase().includes(window.q.toLowerCase()))&&(!CF||(CF=='__'?!p.cat:p.cat==CF))&&pfOk(p)).sort((a,b)=>String(a.n).localeCompare(String(b.n)));
 const units=rr(L.reduce((s,p)=>s+stock(p.id),0));
 return h.replace(/<div class="tw card">[\s\S]*$/,()=>`<div class="pc-tb"><span class="k pc-cnt">${L.length} product${L.length==1?'':'s'} · ${units} units in stock · tap a name for its history</span><button type="button" class="g s np" onclick="psTog()">${PS.on?'Cancel':'Select'}</button></div><div class="pc-l">${L.map(pCard).join('')||'<div class="pl-e">No products match</div>'}</div>`)};

/* ---------- one product: stock by godown ---------- */
function allocForm(id){const p=D.p.find(x=>x.id==id);if(!p)return;const ob=obMap(p),U=esc(p.u1||'Pcs');
 modal(`<div class="al"><div class="row"><b style="font-size:18px">Stock by godown</b><button type="button" class="g s" aria-label="Close" onclick="closeM()">✕</button></div>
 <p class="k" style="margin:4px 0 10px"><b>${esc(p.n)}</b> — split the <b>opening stock</b> between godowns. The godown quantities must add up to the total. Sales, purchases and transfers keep changing each godown's current stock.</p>
 <label>Total opening stock (${U})</label><input id="al_t" type="number" step="any" min="0" value="${osOf(id)}" oninput="alUpd()">
 <div class="al-l">${D.g.map(g=>`<div class="al-r"><span class="al-n"><b>${esc(g.n)}</b><span class="k">Now ${stock(id,g.id)} · opening ${N(ob[g.id])}</span></span><input id="al_${g.id}" type="number" step="any" min="0" value="${N(ob[g.id])}" oninput="alUpd()" aria-label="${esc(g.n)} opening stock"><button type="button" class="g s" onclick="alRest(${g.id})">Rest</button></div>`).join('')}</div>
 <div id="al_s" class="al-s"></div><div class="row" style="justify-content:flex-start;margin-top:8px"><button type="button" class="g s" onclick="alSplit()">Split equally</button></div>
 <div class="row" style="margin-top:14px"><button class="g" onclick="closeM()">Cancel</button><button id="ok">Save</button></div></div>`);
 window._al=id;alUpd();$('ok').onclick=alSave}
function alVals(){const m={};D.g.forEach(g=>m[g.id]=N($('al_'+g.id).value));return m}
function alRem(){const T=N($('al_t').value),A=rr(Object.values(alVals()).reduce((a,b)=>a+b,0));return{T,A,rem:rr(T-A)}}
function alUpd(){const{T,A,rem}=alRem(),e=$('al_s');if(!e)return;e.className='al-s '+(Math.abs(rem)<1e-9?'ok':'bad');
 e.textContent=Math.abs(rem)<1e-9?`Allocated ${A} of ${T} ✓`:rem>0?`Allocated ${A} of ${T} — ${rem} still to place`:`Allocated ${A} of ${T} — ${-rem} too many`}
function alRest(g){const{rem}=alRem(),el=$('al_'+g);el.value=Math.max(0,rr(N(el.value)+rem));alUpd()}
function alSplit(){const T=N($('al_t').value),m=splitEq(T,D.g.map(g=>g.id));D.g.forEach(g=>$('al_'+g.id).value=m[g.id]);alUpd()}
function alSave(){const p=D.p.find(x=>x.id==window._al);if(!p)return closeM();const m=alVals(),{T,rem}=alRem();
 if(!(T>=0))return toast('Enter the total opening stock');if(D.g.some(g=>!(m[g.id]>=0)))return toast('Quantities cannot be negative');
 if(Math.abs(rem)>1e-9)return toast(rem>0?rem+' still not placed in a godown':'Godowns add up to '+(-rem)+' more than the total');
 const pl=osPlan(p,m);if(pl.err)return toast(pl.err.charAt(0).toUpperCase()+pl.err.slice(1));
 osApply(p,pl);save();closeM();go();toast('Godown stock saved')}

/* ---------- bulk: assign godowns to the ticked products ---------- */
function bulkGd(){const ids=bkSelVis().map(k=>+k.split('|')[2]).filter(id=>D.p.some(p=>p.id==id));if(!ids.length)return toast('Tick at least one product');
 window._bg=ids;
 modal(`<div class="al"><div class="row"><b style="font-size:18px">Assign godowns</b><button type="button" class="g s" aria-label="Close" onclick="closeM()">✕</button></div>
 <p class="k" style="margin:4px 0 10px">${ids.length} product${ids.length>1?'s':''} selected. This re-places each product's <b>opening stock</b>; the total of every product stays the same.</p>
 <label>What to do</label><select id="bg_m" onchange="bgPrev()"><option value="move">Put all opening stock in one godown</option><option value="split">Split opening stock equally between godowns</option></select>
 <div id="bg_1"><label>Godown</label><select id="bg_t" onchange="bgPrev()">${opts(D.g)}</select></div>
 <div id="bg_2" style="display:none"><label>Godowns to share between</label><div class="bg-g">${D.g.map(g=>`<label class="bg-c"><input type="checkbox" class="bg-k" value="${g.id}" onchange="bgPrev()" ${D.g.length<3||g.id==D.g[0].id?'checked':''}><span>${esc(g.n)}</span></label>`).join('')}</div></div>
 <div id="bg_p" class="bg-p"></div><div class="row" style="margin-top:14px"><button class="g" onclick="closeM()">Cancel</button><button id="ok">Apply</button></div></div>`);
 $('ok').onclick=bgApply;bgPrev()}
function bgPlan(){const mode=$('bg_m').value,tg=+$('bg_t').value,sp=[...document.querySelectorAll('.bg-k:checked')].map(i=>+i.value),out=[];
 window._bg.forEach(id=>{const p=D.p.find(x=>x.id==id);if(!p)return;const T=osOf(id);let m,err='';
  if(mode=='move')m={[tg]:T};else if(!sp.length){m={};err='pick at least one godown'}else m=splitEq(T,sp);
  const full={};D.g.forEach(g=>full[g.id]=N(m[g.id]));const pl=err?{err}:osPlan(p,full);out.push({p,T,m:full,pl})});return out}
function bgPrev(){const mode=$('bg_m').value;$('bg_1').style.display=mode=='move'?'':'none';$('bg_2').style.display=mode=='split'?'':'none';
 const fmt=m=>D.g.filter(g=>N(m[g.id])).map(g=>esc(g.n)+' '+N(m[g.id])).join(' · ')||'—',P=bgPlan();
 $('bg_p').innerHTML=P.map(x=>`<div class="bg-r${x.pl.err?' bad':''}"><b>${esc(x.p.n)}</b><span class="k">Now: ${fmt(obMap(x.p))}</span><span>${x.pl.err?'⚠ '+esc(x.pl.err):'New: '+fmt(x.m)}</span></div>`).join('')}
function bgApply(){const P=bgPlan(),bad=P.find(x=>x.pl.err);if(bad)return toast(bad.p.n+': '+bad.pl.err);
 P.forEach(x=>osApply(x.p,x.pl));save();BK.sel.clear();BK.on=false;closeM();go();toast('Godowns updated for '+P.length+' product'+(P.length>1?'s':''))}
const _bkBar42=bkBar;
bkBar=function(){_bkBar42();const b=$('bkbar');if(!b||b.style.display=='none'||cur!='products'||_pr!='p'||BE.p)return;
 const n=bkSelVis().length,d=b.querySelector('button.r'),x=document.createElement('button');x.type='button';x.className='g s';x.textContent='Godowns';x.disabled=!n;x.onclick=bulkGd;b.insertBefore(x,d)};

/* ---------- Godowns page ---------- */
function gdSel(id){GDG=id||'';GDK=id?'in':'';go(1)}
function gdm(id){const g=D.g.find(x=>x.id==id);if(!g)return;xsheet(g.n,D.p.filter(p=>stock(p.id,id)>0).length+' products in stock',[['edit','Rename',`gForm(${id})`],['trash','Delete',`delG(${id})`,'dg']])}
function stockGodowns(){if(GDG&&!D.g.some(g=>g.id==GDG))GDG='';const sel=D.g.find(g=>g.id==GDG),q=(GDS||'').toLowerCase(),cols=sel?[sel]:D.g,
 tt=p=>rr(cols.reduce((s,g)=>s+stock(p.id,g.id),0)),
 rows=D.p.filter(p=>(!q||(p.n+' '+(p.sku||'')+' '+(p.cat||'')).toLowerCase().includes(q))&&(GDK=='in'?tt(p)>0:GDK=='out'?tt(p)<=0:true)).sort((a,b)=>String(a.n).localeCompare(String(b.n)));
 const card=(id,name,items,units,extra)=>`<div class="gd-c${String(GDG)==String(id)?' on':''}"><button type="button" class="gd-cm" onclick="gdSel(${id||0})"><b>${esc(name)}</b><span class="gd-u">${units}<small> units</small></span><span class="k">${items} product${items==1?'':'s'} in stock</span></button>${extra||''}</div>`,
 cards=card(0,'All godowns',D.p.filter(p=>stock(p.id)>0).length,rr(D.p.reduce((s,p)=>s+Math.max(0,stock(p.id)),0)))
  +D.g.map(g=>card(g.id,g.n,D.p.filter(p=>stock(p.id,g.id)>0).length,rr(D.p.reduce((s,p)=>s+Math.max(0,stock(p.id,g.id)),0)),`<button type="button" class="xr-k gd-k" aria-label="Godown options" onclick="gdm(${g.id})">${ic('more',18)}</button>`)).join(''),
 kb=(v,l)=>`<button type="button" class="${GDK==v?'':'g '}s" onclick="GDK='${v}';go(1)">${l}</button>`,
 where=sel?esc(sel.n):'all godowns',what=GDK=='in'?'in stock':GDK=='out'?'with zero stock':'(all items)';
 const list=rows.map(p=>{const U=esc(p.u1||'Pcs'),v=tt(p),right=sel?`<span class="gd-q${v<=0?' z':''}">${v}<small> ${U}</small></span>`
   :`<span class="gd-ch">${D.g.map(g=>({g,q:stock(p.id,g.id)})).filter(x=>x.q!=0).map(x=>`<span class="gch"><i>${esc(x.g.n)}</i><b>${x.q}</b></span>`).join('')||'<span class="k">No stock</span>'}</span><span class="gd-q${v<=0?' z':''}">${v}<small> ${U}</small></span>`;
  return`<button type="button" class="gd-r" onclick="prodTx(${p.id})"><span class="gd-n"><b>${esc(p.n)}</b><span class="k">${p.sku?esc(p.sku):'No code'}${p.cat?' · '+esc(p.cat):''}</span></span>${right}</button>`}).join('');
 return wh('<button class="gn" onclick="gForm()">+ Godown</button>','<h3>Godowns</h3>')
  +`<div class="gd-act"><button type="button" onclick="trForm()">Transfer stock</button><button type="button" class="g" onclick="nav('transfers')">Transfer history</button></div><div class="gd-cs">${cards}</div><div class="gd-f"><input class="xsr" placeholder="Search product name or code…" value="${esc(GDS)}" oninput="GDS=this.value;window.q=this.value;go(1)"><div class="qa gdq">${kb('in','Available stock')}${kb('out','Zero stock')}${kb('','All items')}</div></div>`
  +`<p class="k gd-cnt">${rows.length} product${rows.length==1?'':'s'} ${what} · ${where}</p><div class="gd-l">${list||`<div class="pl-e">${GDK=='in'?'Nothing in stock here':GDK=='out'?'No zero-stock products':'No products match'}</div>`}</div>`}
V.godowns=()=>PTX?prodTxPage():stockGodowns();

/* ---------- Transfers: Edit ---------- */
const _vT42=V.transfers;
V.transfers=()=>_vT42().replace(/(<button class="g s" onclick="trView\((\d+)\)">View<\/button>) (<button class="g s" onclick="trDel\(\2\)">Delete<\/button>)/g,'$1 <button class="g s" onclick="trEdit($2)">Edit</button> $3');
function trEdit(id){trNo();const h=(D.th||[]).find(x=>x.id==id);if(!h)return;trForm();if(!$('t_a'))return;
 $('t_a').value=h.from;$('t_b').value=h.to;$('t_d').value=h.date||today();$('t_n').value=h.note||'';$('tl').innerHTML='';
 h.items.forEach(i=>{addTl();const r=$('tl').lastChild;if(!D.p.some(p=>p.id==i.pid)){const o=new Option('(deleted product)',i.pid);r.children[0].add(o)}r.children[0].value=i.pid;r.children[1].value=i.q});
 const t=document.querySelector('#mc h3');if(t)t.textContent='Edit Transfer '+h.no;$('ok').textContent='Save changes';
 $('ok').onclick=()=>{const a=+$('t_a').value,b=+$('t_b').value;if(a==b)return toast('Pick Different Godowns');const m={};
  document.querySelectorAll('#tl .tr').forEach(r=>{const p=+r.children[0].value,q=N(r.children[1].value);if(p&&q>0)m[p]=rr((m[p]||0)+q)});
  const ids=Object.keys(m);if(!ids.length)return toast('Add at Least One Product');
  const sSt=JSON.stringify(D.st),sTh=JSON.stringify(D.th),back=()=>{D.st=JSON.parse(sSt);D.th=JSON.parse(sTh)};
  const r=trUndo(id);if(r){back();return toast('Cannot edit — '+r)}
  for(const p of ids)if(stock(p,a)<m[p]-1e-9){back();return toast('Not Enough Stock in '+nm(D.g,a)+': '+nm(D.p,+p))}
  const cs={};ids.forEach(p=>cs[p]=lnCost(+p,m[p]));ids.forEach(p=>{addSt(p,a,-m[p]);addSt(p,b,m[p])});
  D.th.push({...h,date:$('t_d').value||today(),note:($('t_n').value||'').replace(/[<>]/g,''),from:a,to:b,items:ids.map(p=>({pid:+p,q:m[p],c:cs[p]}))});
  save();closeM();toast('Transfer updated');go()}}

/* ---------- Parties: history with a running balance ---------- */
function partyBalMap(t,id){const c=t=='c',P=(c?D.c:D.s).find(x=>x.id==id),ev=[],m={};if(!P)return m;
 (c?D.sa:D.pu).filter(x=>x.pid==id).forEach(x=>ev.push({k:(c?'sa':'pu')+'|'+x.id,d:x.date||'',o:0,id:x.id,dl:(x.ret?-1:1)*(tot(x).total-N(x.paid))}));
 D.pay.filter(x=>x.pid==id&&x.ty==(c?'in':'out')).forEach(x=>ev.push({k:'pay|'+x.id,d:x.date||'',o:1,id:x.id,dl:-N(x.amt)}));
 if(c)(D.ls||[]).filter(l=>l.wo&&l.cust==id).forEach(l=>ev.push({k:'wo|'+l.id,d:l.date||'',o:1,id:l.id,dl:-N(l.amt)}));
 ev.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:a.o-b.o||a.id-b.id);let b=N(P.open);ev.forEach(e=>{b+=e.dl;m[e.k]=b});return m}

/* ---------- party page: details now live here (was the "Details" popup) ---------- */
function partyInfoCard(t,x){const c=t=='c',id=x.id,b=bal(t,id),lp=lastPay(t,id);
 const ov=b>0.004?pend(t,id).reduce((s,y)=>s+(od(y.t,x)>0?y.due:0),0):0;
 const row=(i,l,v)=>`<div class="pm-r"><span class="pm-i">${ic(i,18)}</span><span class="pm-l">${l}</span><b>${v}</b></div>`;
 const info=[x.ph?row('phone','Phone',esc(x.ph)):'',x.ad?row('pin','Address',esc(x.ad)):'',
  N(x.open)?row('tag','Opening Balance',M(x.open)+(x.asof?` <small>${x.asof}</small>`:'')):'',
  x.obp?row('photo','Opening Bill Photo',`<button type="button" class="g s" onclick="phShowRec('${t}',${id})">View</button>`):'',
  ov>0.004?row('clock','Overdue',`<span style="color:#dc2626">${M(ov)}</span>`):'',
  row('clock','Last Payment',lp?`${lp.d} <small>${M(lp.a)}</small>`:'<small>No payment yet</small>'),
  c&&cdays(x)>0?row('clock','Credit Days',cdays(x)+' days'):'',N(x.lim)>0?row('tag','Credit Limit',M(x.lim)):''].join('');
 return `<div class="pi-card"><div class="pi-h">Details</div><div class="pm-list">${info}</div>
 <div class="pm-sec">${c&&FT('pricelist')?`<button type="button" onclick="plList(${id})">${ic('tag',18)}<span>Price List</span></button>`:''}<button type="button" onclick="partyForm('${t}',${id})">${ic('edit',18)}<span>Edit</span></button><button type="button" class="dg" onclick="del('${t}',${id})">${ic('trash',18)}<span>Delete</span></button></div></div>`}
partyTxPage=function(){const{t,id}=CTX,c=t=='c',x=(c?D.c:D.s).find(y=>y.id==id);if(!x){CTX=null;return V.parties()}
 const b=bal(t,id),ok=c?['sa','sr','qt','pi']:['pu','pr','po'],bm=partyBalMap(t,id),
  L=txAll().filter(z=>String(z.pid)==String(id)&&ok.includes(z.ty)).sort(xSort),
  billed=L.reduce((s,z)=>s+(z.ty=='sa'||z.ty=='sr'?z.a:z.ty=='pu'||z.ty=='pr'?-z.a:0),0),
  paid=L.reduce((s,z)=>s+(c?z.i-z.o:z.o-z.i),0),
  ICn={sa:'sale',sr:'undo',pu:'buy',pr:'undo',pi:'coin',po:'coin',qt:'stmt'},
  mn=z=>z.ty=='sa'||z.ty=='sr'?`txm('sa',${z.id})`:z.ty=='pu'||z.ty=='pr'?`txm('pu',${z.id})`:z.ty=='qt'?`txm('qt',${z.id})`:`pym(${z.id})`,
  bk=z=>z.ty=='sa'||z.ty=='sr'?bm['sa|'+z.id]:z.ty=='pu'||z.ty=='pr'?bm['pu|'+z.id]:z.ty=='pi'||z.ty=='po'?bm['pay|'+z.id]:undefined,
  rows=L.map(z=>{const bv=bk(z);return{d:z.d,id:z.id,ty:z.ty,ic:ICn[z.ty],t:z.k+(z.no?' · '+z.no:''),s:(z.m?esc(z.m):'—')+(bv!==undefined?' · Balance '+M(bv):''),
   a:z.n?M(Math.abs(z.a)):M(z.a),ac:z.n?'':z.a<0?'low':'ok',
   tag:(z.ty=='sa'||z.ty=='pu')?(()=>{const T=D[z.ty].find(w=>w.id==z.id);if(!T)return null;const d=billDue(T);return d<=0.004?['Paid','pd']:['Due '+M(d),N(T.paid)+alloc(T.id)>0.004?'du':'ud']})():null,
   tap:mn(z),menu:mn(z)}});
 return pgHead(esc(x.n),'',(c?'Customer':'Supplier')+(x.ph?' · '+esc(x.ph):''))
  +xSum([[c?'To receive':'To pay',M(b),b>0.0005?(c?'ok':'low'):''],[c?'Billed':'Purchased',M(billed)],[c?'Received':'Paid',M(paid)]])
  +`<div class="ptx-act two"><button type="button" class="${c?'in':'out'}" onclick="payForm('${c?'in':'out'}',${id})">${c?'Payment IN':'Payment OUT'}</button><button type="button" class="g" onclick="stmt('${t}',${id})">Statement</button></div>`
  +partyInfoCard(t,x)
  +`<p class="k">${L.length} transaction${L.length==1?'':'s'} · newest first · "Balance" is what ${c?'the customer owes you':'you owe the supplier'} after that entry · tap one to view, edit or delete</p>`
  +xList(rows,'No transactions with this '+(c?'customer':'supplier')+' yet')};

/* v41 bug: the hashchange handler rendered BEFORE the history state (PTX / CTX) was cleared, so tapping Products / Parties
   while a history page was open re-showed that history. Clear first, then render. */
window.onhashchange=()=>{PTX=0;CTX=null;go()};
go(1);
