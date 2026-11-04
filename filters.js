/* =====================================================================
 TradeLynin — section dropdowns, Filter panels, cleaner headers (loaded after dropdown.js)
   · Products / Categories / Units / Product History / Reorder List  → one dropdown
   · Customers / Suppliers                                           → one dropdown
   · Filter button on every transaction list, Products, Customers, Suppliers and every report
   · Add on Products picks up the category that is selected in the list
 ===================================================================== */
const FLI='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>';
const XFS={sales:'c',quotes:'c',salesret:'c',purchases:'s',purchret:'s',payin:'c',payout:'s',expenses:'x'};

/* ---- 1 + 2: section dropdown for Products and Parties ---- */
function selSec(v){if(cur=='parties')pgSet(v);else nav('products',()=>{_pr=v})}
const _ac1=addChips;
addChips=function(){const v=$('v');
 if(v&&(cur=='products'||cur=='parties')){if(v.querySelector('.nv-dd'))return;const hd=v.querySelector('.hd');if(!hd)return;
  const par=cur=='parties',o=par?UPF.map(z=>[z[0],z[1]+' ('+upCnt()[z[0]]+')']):[['p','Products'],FT('categories')&&['cat','Categories'],['un','Units'],FT('history')&&['hist','Product History'],FT('reorder')&&['reorder','Reorder List']].filter(Boolean),sel=par?_pg:_pr;
  const host=hd.parentElement&&hd.parentElement.classList.contains('row')?hd.parentElement:hd;host.insertAdjacentHTML('afterend',`<div class="nv-dd"><select aria-label="Section" onchange="selSec(this.value)">${o.map(x=>`<option value="${x[0]}" ${x[0]==sel?'selected':''}>${x[1]}</option>`).join('')}</select></div>`);return}
 _ac1()};

/* ---- 5: Add Product starts in the category chosen in the list ---- */
const _pf1=prodForm;
prodForm=function(id){if(!id&&cur=='products'&&_pr=='p'&&CF&&CF!='__'&&D.ct.some(c=>c.n==CF)){window._pre={cat:CF};try{_pf1(id)}finally{window._pre=null}}else _pf1(id)};

/* ---- 6: stock transfer keeps Select + Delete only ---- */
BKE.length=0;

/* ---- 7 + 8: Filter panels ---- */
function xfTg(){XFO=!XFO;go(1)}
function xfSet(k,v){if((k=='a'&&v&&XF.b&&v>XF.b)||(k=='b'&&v&&XF.a&&v<XF.a)){toast('"From" date is after "To" date');return go(1)}XF[k]=v;go(1)}
function atD(n,v){if((n==1&&v&&AT2&&v>AT2)||(n==2&&v&&AT1&&v<AT1)){toast('"From" date is after "To" date');return go(1)}if(n==1)AT1=v;else AT2=v;go(1)}
function xfClear(){Object.keys(XF).forEach(k=>XF[k]='');window.q='';go(1)}
const xfSel=(k,l,o)=>`<div><label>${l}</label><select onchange="xfSet('${k}',this.value)">${o.map(x=>`<option value="${esc(x[0])}" ${XF[k]==x[0]?'selected':''}>${esc(x[1])}</option>`).join('')}</select></div>`;
function xfPanel(){let h='';
 if(cur=='products'){const un=[...new Set(D.p.map(p=>p.u1).filter(Boolean))];
  h=`<div class="f2">${xfSel('st','Stock',[['','All'],['in','In stock'],['low','Low stock'],['out','Out of stock']])}${xfSel('u','Unit',[['','All units'],...un.map(u=>[u,u])])}</div>`}
 else if(cur=='parties'){h=`<div>${xfSel('bl','Balance',[['','All'],['rec','To receive'],['pay','To pay'],['od','Overdue'],['adv','Advance'],['clear','Settled']])}</div>`}
 else{const k=XFS[cur],par=k=='c'?D.c:k=='s'?D.s:null,ret=cur=='salesret'||cur=='purchret'||cur=='payin'||cur=='payout'||cur=='quotes'||k=='x';
  h=`<div class="f2"><div><label>From</label><input type="date" value="${XF.a}" onchange="xfSet('a',this.value)"></div><div><label>To</label><input type="date" value="${XF.b}" onchange="xfSet('b',this.value)"></div></div>`
   +(par?xfSel('p',k=='c'?'Customer':'Supplier',[['','All'],...par.map(x=>[String(x.id),x.n])]):'')
   +(k=='x'?xfSel('c','Category',[['','All'],...(D.xc||[]).map(x=>[x.n,x.n])]):'')
   +`<div class="f2">${xfSel('m','Account',[['','All'],...D.ac.map(a=>[a.n,a.n])])}${ret?'':xfSel('s','Status',[['','All'],['paid','Paid'],['due','Due']])}</div>`}
 return`<div class="card xfp">${h}<div class="row" style="margin-top:10px"><span class="k">${xfOn()?'Filter is on':''}</span><button type="button" class="g s" onclick="xfClear()">Clear</button></div></div>`}
const xfBtn=(on,open,fn)=>{const b=document.createElement('button');b.type='button';b.className='g s tfl np xfb'+(on||open?' on':'');b.setAttribute('aria-label','Filter');b.onclick=fn||xfTg;b.innerHTML=FLI+'<span>Filter</span>';return b};
function xfApply(){const v=$('v');if(!v)return;
 const key=cur=='products'?(_pr=='p'?'products':''):cur=='parties'?'parties':(cur in XFS?(cur=='expenses'&&_xp=='c'?'':cur):'');
 const hd=v.querySelector('.hd');
 if(cur=='products'&&_pr!='p'&&hd){hd.querySelectorAll('.bk-b').forEach(b=>b.remove());if(_pr=='hist'||_pr=='reorder')hd.querySelectorAll('.ab').forEach(b=>b.remove());BK.on=false;bkBar()}
 if(cur=='transfers'){const b=v.querySelector('.bk-b');if(b&&!BK.on){b.setAttribute('aria-label','Select records');b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 12.5l3 3 5-6"/></svg><span>Select</span>'}}
 if(cur=='products'&&hd&&!hd.querySelector('.xfb')&&(_pr=='hist'||_pr=='reorder')){const h=_pr=='hist',b=xfBtn(h?!!(PHS||PHT||PHM):roOn(),!!FO[h?'h':'ro'],()=>flTg(h?'h':'ro'));hd.append(b)}
 if(key&&hd&&!hd.querySelector('.xfb')){const ab=hd.querySelector('.ab'),b=xfBtn(xfOn(),XFO);ab?hd.insertBefore(b,ab):hd.append(b);
  if(XFO){const a=v.querySelector('.nv-dd')||hd;a.insertAdjacentHTML('afterend',xfPanel())}}}

/* ---- 7: every report gets a Filter panel (period, search, extras) ---- */
function rpFilter(){const v=$('v');if(!v||cur!='reports'||!_rv||!REPF[_rv]||v.querySelector('.rp-fp'))return;
 const all=[...v.querySelectorAll(':scope>.rp-ch,:scope>.rp-cu,:scope>.rp-rng,:scope>.rp-s')],sIn=all.find(e=>e.classList.contains('rp-s')&&e.tagName=='INPUT'),hasS=!!sIn,ctl=all.filter(e=>e!==sIn),
  p=document.createElement('div');p.className='card rp-fp xfp';
 /* search stays OUTSIDE the filter panel (always visible, above it) */
 const sBox=sIn||(()=>{const i=document.createElement('input');i.className='rp-s';i.placeholder='Search in this report…';i.value=RS;i.oninput=function(){srch('r',this.value)};return i})();
 sBox.style.margin='2px 0 8px';
 ctl.forEach(e=>p.append(e));
 const pgh=v.querySelector('.pg-h'),on=!!(RS||R1||R2||DSB||FMP);
 if(!XFRO&&!on){}
 const b=xfBtn(on,XFRO);b.onclick=()=>{XFRO=!XFRO;go(1)};
 if(pgh){const pr=pgh.querySelector('.pg-ib');pr?pgh.insertBefore(b,pr):pgh.append(b);pgh.after(sBox);sBox.after(p)}else{v.prepend(p);v.prepend(sBox)}
 p.style.display=XFRO?'':'none';
 if(!hasS&&RS){const t=RS.toLowerCase();v.querySelectorAll('.rp-b tr').forEach(r=>{if(r.querySelector('td')&&!r.textContent.toLowerCase().includes(t))r.style.display='none'})}}
let XFRO=true;
addEventListener('hashchange',()=>{XFRO=true});

/* ---- wrap go: reset filters when the screen changes, add the buttons afterwards ---- */
const _go1=go;
go=function(keep){const h=location.hash.slice(1),t=(!keep&&V[h])?h:cur;if(t!=XFK){XFK=t;Object.keys(XF).forEach(k=>XF[k]='');XFO=false;RO.q=RO.c=RO.s=RO.o='';FO.ro=false}
 _go1(keep);try{xfApply();rpFilter()}catch(e){console.error(e)}};
go(1);
