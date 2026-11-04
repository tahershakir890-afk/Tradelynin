/* =====================================================================
 TradeLynin v44 — Party page: clearer account summary (loaded after gd5.js)
   Re-uses: bal / pend / od / partyBalMap / txAll / billDue / xRow / xList / xsheet / pgHead / del / partyForm / plList / payForm / stmt.
   Calculations are the same as v43:  Balance = opening + billed - received  ·  Overdue = unpaid bills older than the credit days.
   Only change to a figure: Overdue can never be larger than the Balance due (it was, when a payment was not matched to a bill).
 ===================================================================== */
IC.info2='<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.2"/>';
let pxQ='',pxT='',pxS='new',pxK='';
const pHelp=(txt,l)=>`<button type="button" class="pt-i" aria-label="${esc(l||'Help')}" title="${esc(txt)}" onclick="toast(this.title)">${ic('info2',15)}</button>`;
function pRef(id){go(1);const e=id&&$(id);if(e){e.focus();try{const n=e.value.length;e.setSelectionRange(n,n)}catch(_){}}}
function pMore(t,id){const x=(t=='c'?D.c:D.s).find(y=>y.id==id);if(!x)return;
 xsheet(x.n,'More actions',[...(t=='c'?[['undo','Write off balance',`woForm(0,${id})`]]:[]),...(t=='c'&&FT('pricelist')?[['tag','Price list',`plList(${id})`]]:[]),['edit','Edit '+(t=='c'?'customer':'supplier'),`partyForm('${t}',${id})`]])}
function pDelMenu(t,id){const x=(t=='c'?D.c:D.s).find(y=>y.id==id);if(!x)return;
 xsheet('Delete '+(t=='c'?'customer':'supplier'),esc(x.n)+' · only possible when there are no invoices or payments',[['trash','Delete '+(t=='c'?'customer':'supplier')+'…',`del('${t}',${id})`,'dg']])}
partyInfoCard=function(t,x){const c=t=='c',id=x.id,R=[],row=(i,l,v)=>`<div class="pm-r"><span class="pm-i">${ic(i,18)}</span><span class="pm-l">${l}</span><b>${v}</b></div>`;
 if(c&&cdays(x)>0)R.push(row('clock','Credit days',N(x.days)+' days'));
 if(N(x.lim)>0)R.push(row('tag','Credit limit',M(x.lim)));
 if(N(x.open))R.push(row('tag','Opening balance',M(x.open)+(x.asof?` <small>${x.asof}</small>`:'')));
 if(x.ad)R.push(row('pin','Address',esc(x.ad)));
 if(x.obp)R.push(row('photo','Opening bill photo',`<button type="button" class="g s" onclick="phShowRec('${t}',${id})">View</button>`));
 return R.length?`<div class="pi-card pt-info"><div class="pi-h">${c?'Customer':'Supplier'} info</div><div class="pm-list">${R.join('')}</div></div>`:''};
partyTxPage=function(){const{t,id}=CTX,c=t=='c',x=(c?D.c:D.s).find(y=>y.id==id);if(!x){CTX=null;return V.parties()}
 if(pxK!=t+id){pxK=t+id;pxQ='';pxT='';pxS='new'}
 const b=bal(t,id),ok=c?['sa','sr','qt','pi','wo']:['pu','pr','po'],bm=partyBalMap(t,id),
  A=txAll().filter(z=>String(z.pid)==String(id)&&ok.includes(z.ty)),
  billed=A.reduce((s,z)=>s+(z.ty=='sa'||z.ty=='sr'?z.a:z.ty=='pu'||z.ty=='pr'?-z.a:0),0),
  paid=A.reduce((s,z)=>s+(c?z.i-z.o:z.o-z.i),0),
  ov=b>0.004?Math.min(b,pend(t,id).reduce((s,y)=>s+(od(y.t,x)>0?y.due:0),0)):0,
  ICn={sa:'sale',sr:'undo',pu:'buy',pr:'undo',pi:'coin',po:'coin',qt:'stmt',wo:'undo'},
  mn=z=>z.ty=='wo'?`wom(${z.id})`:z.ty=='sa'||z.ty=='sr'?`txm('sa',${z.id})`:z.ty=='pu'||z.ty=='pr'?`txm('pu',${z.id})`:z.ty=='qt'?`txm('qt',${z.id})`:`pym(${z.id})`,
  bk=z=>z.ty=='sa'||z.ty=='sr'?bm['sa|'+z.id]:z.ty=='pu'||z.ty=='pr'?bm['pu|'+z.id]:z.ty=='pi'||z.ty=='po'?bm['pay|'+z.id]:z.ty=='wo'?bm['wo|'+z.id]:undefined,
  grp={sa:'inv',pu:'inv',sr:'ret',pr:'ret',pi:'pay',po:'pay',qt:'qt',wo:'pay'},
  types=[['','All'],['inv',c?'Invoices':'Purchases'],['ret','Returns'],['pay','Payments'],...(c&&A.some(z=>z.ty=='qt')?[['qt','Quotations']]:[])];
 if(pxT&&!types.some(y=>y[0]==pxT))pxT='';
 const q=pxQ.trim().toLowerCase(),
  L=A.filter(z=>(!pxT||grp[z.ty]==pxT)&&(!q||(z.k+' '+(z.no||'')+' '+(z.m||'')+' '+z.d).toLowerCase().includes(q))).sort(pxS=='old'?(a,b)=>xSort(b,a):pxS=='hi'?(a,b)=>Math.abs(b.a)-Math.abs(a.a)||xSort(a,b):pxS=='lo'?(a,b)=>Math.abs(a.a)-Math.abs(b.a)||xSort(a,b):xSort),
  byDate=pxS=='new'||pxS=='old',
  rows=L.map(z=>{const bv=bk(z),paidAmt=z.ty=='pi'||z.ty=='po'||N(z.i)+N(z.o)>0.004,
   s=[byDate?'':xDay(z.d),paidAmt&&z.m?esc(z.m):'',bv!==undefined?'Balance '+M(bv):''].filter(Boolean).join(' · ')||'—';
   return{d:z.d,id:z.id,ty:z.ty,ic:ICn[z.ty],t:z.k+(z.no?' · '+z.no:''),s,
   a:z.n?M(Math.abs(z.a)):M(z.a),ac:z.n?'':z.a<0?'low':'ok',
   tag:(z.ty=='sa'||z.ty=='pu')?(()=>{const T=D[z.ty].find(w=>w.id==z.id);if(!T)return null;const d=billDue(T);return d<=0.004?['Paid','pd']:['Due '+M(d),N(T.paid)+alloc(T.id)>0.004?'du':'ud']})():(z.ty=='wo'?['Written off','rt']:null),
   tap:mn(z),menu:mn(z)}}),
  filt=!!(pxT||q),
  list=byDate?xList(rows,filt?'No transactions match your search or filter':'No transactions with this '+(c?'customer':'supplier')+' yet'):(rows.length?`<div class="xl">${rows.map(xRow).join('')}</div>`:`<div class="pl-e">${filt?'No transactions match your search or filter':'No transactions yet'}</div>`),
  sub=(c?'Customer':'Supplier')+(x.ph?' · '+esc(x.ph):''),
  hdr=`<div class="pt-hb"><button type="button" class="g pg-ib" aria-label="More actions" onclick="pMore('${t}',${id})">${ic('more',20)}</button><button type="button" class="g pg-ib dg" aria-label="Delete ${c?'customer':'supplier'}" onclick="pDelMenu('${t}',${id})">${ic('trash',18)}</button></div>`,
  sel=(f,v,cur,o)=>`<select aria-label="${f}" onchange="${v}=this.value;pRef()">${o.map(z=>`<option value="${z[0]}"${z[0]==cur?' selected':''}>${z[1]}</option>`).join('')}</select>`;
 return pgHead(esc(x.n),hdr,sub)
  +`<div class="pt-bal"><span>${c?'Balance due':'Balance payable'}${pHelp('Opening balance + '+(c?'billed':'purchased')+' − '+(c?'received':'paid')+'. What '+(c?'this customer owes you':'you owe this supplier')+' now.','About balance')}</span><b class="${b>0.0005?(c?'ok':'low'):''}">${M(b)}</b></div>`
  +`<div class="xs-sum">${[[c?'Billed':'Purchased',M(billed)],[c?'Received':'Paid',M(paid)]].map(y=>`<div><span>${y[0]}</span><b>${y[1]}</b></div>`).join('')}<div><span>Overdue${pHelp('Unpaid bills older than the credit period'+(cdays(x)>0?' ('+cdays(x)+' days)':' (due on the bill date — no credit days set)')+'. Part of the balance due, not an addition to it.','About overdue')}</span><b class="${ov>0.004?'low':''}">${M(ov)}</b></div></div>`
  +`<div class="ptx-act two"><button type="button" class="${c?'in':'out'}" onclick="payForm('${c?'in':'out'}',${id})">${c?'Payment IN':'Payment OUT'}</button><button type="button" class="g" onclick="stmt('${t}',${id})">Statement</button></div>`
  +partyInfoCard(t,x)
  +`<div class="pt-th"><b>${filt?L.length+' of '+A.length:A.length} transaction${A.length==1?'':'s'}</b>${pHelp('"Balance" is what '+(c?'the customer owes you':'you owe the supplier')+' after that entry. Tap an entry to view, edit or delete it.','About transactions')}</div>`
  +(A.length>4||filt?`<div class="pt-f"><input id="pq" class="xsr" placeholder="Search number, type, method or date…" value="${esc(pxQ)}" oninput="pxQ=this.value;pRef('pq')"><div class="pt-s">${sel('Type','pxT',pxT,types)}${sel('Sort by','pxS',pxS,[['new','Newest first'],['old','Oldest first'],['hi','Amount: high to low'],['lo','Amount: low to high']])}</div></div>`:'')
  +list};
