/* =====================================================================
 TradeLynin — product & party transaction pages (loaded after settle.js)
   · Products / Godowns : tap a product  → every transaction of that product
   · Parties            : tap a party    → every transaction of that customer / supplier
 State (PTX / CTX) and small helpers live at the end of app.js so they exist before any early redraw.
 Rows reuse the transaction cards from txlist.js; tapping a row opens the View / Edit / Delete popup.
 ===================================================================== */
const _vP=V.products,_vG=V.godowns,_vC=V.parties;
V.products=()=>PTX?prodTxPage():_vP();
V.godowns=()=>PTX?prodTxPage():_vG();
V.parties=()=>CTX?partyTxPage():_vC();
addEventListener('hashchange',()=>{PTX=0;CTX=null});
// tapping the menu link of the page you are already on (e.g. Products) closes the open history page
document.addEventListener('click',e=>{if(!(PTX||CTX))return;const a=e.target.closest&&e.target.closest('#nav a,#bb a');if(!a)return;
 if((a.getAttribute('href')||'')==='#'+location.hash.slice(1)){PTX=0;CTX=null;go(1)}},true);

const qtyOf=(L,u)=>L.map(i=>i.uq?N(i.uq)+' '+esc(i.u||u):N(i.q)+' '+u).join(' + ');
const sgn=(n,u)=>(n<0?'−':'+')+Math.abs(Math.round(n*1e6)/1e6)+' '+u;

function prodTxPage(){
 const p=D.p.find(x=>x.id==PTX);if(!p){PTX=0;return V[cur]()}
 const U=esc(p.u1||'Pcs'),R=[];let pq=0,sq=0;trNo();
 [['sa',D.sa,D.c],['pu',D.pu,D.s]].forEach(([a,A,P])=>A.forEach(t=>{const L=t.items.filter(i=>i.pid==p.id);if(!L.length)return;
  const q=L.reduce((s,i)=>s+N(i.q),0),v=L.reduce((s,i)=>s+N(i.q)*N(i.p),0),r=!!t.ret,sale=a=='sa',out=sale!=r,eff=out?-q:q;
  if(sale&&!r)sq+=q;if(sale&&r)sq-=q;if(!sale&&!r)pq+=q;if(!sale&&r)pq-=q;
  R.push({d:t.date,id:t.id,ty:sale?(r?'sr':'sa'):(r?'pr':'pu'),ic:r?'undo':sale?'sale':'buy',t:nm(P,t.pid)||(sale?'Walk-In':'—'),
   s:(sale?(r?'Sales Return':'Sale'):(r?'Purchase Return':'Purchase'))+(t.no?' · '+esc(t.no):'')+' · '+qtyOf(L,U)+(t.g?' · '+esc(nm(D.g,t.g)):''),
   a:sgn(eff,U),ac:out?'low':'ok',tag:[M(v),'op'],tap:`txm('${a}',${t.id})`,menu:`txm('${a}',${t.id})`})}));
 QT().forEach(t=>{const L=t.items.filter(i=>i.pid==p.id);if(!L.length)return;
  R.push({d:t.date,id:t.id,ty:'qt',ic:'stmt',t:nm(D.c,t.pid)||'—',s:'Quotation'+(t.no?' · '+esc(t.no):'')+' · '+qtyOf(L,U),a:L.reduce((s,i)=>s+N(i.q),0)+' '+U,
   tag:[t.st||'Open',t.st=='Converted'?'pd':'op'],tap:`txm('qt',${t.id})`,menu:`txm('qt',${t.id})`})});
 (D.th||[]).forEach(h=>{const L=h.items.filter(i=>i.pid==p.id);if(!L.length)return;
  R.push({d:h.date,id:h.id,ty:'tf',ic:'swap',t:(nm(D.g,h.from)||'?')+' → '+(nm(D.g,h.to)||'?'),s:'Stock Transfer'+(h.no?' · '+esc(h.no):''),a:L.reduce((s,i)=>s+N(i.q),0)+' '+U,tap:`trView(${h.id})`,menu:`trView(${h.id})`})});
 R.sort(xSort);
 const s=stock(p.id),os=osOf(p.id),ob=obMap(p),
  gd=D.g.map(g=>`<div class="row"><span class="k">${esc(g.n)}</span><b>${stock(p.id,g.id)} ${U}${N(ob[g.id])?` <span class="k">· opening ${N(ob[g.id])}</span>`:''}</b></div>`).join('');
 return pgHead(esc(p.n),`<button type="button" class="g s" onclick="prodForm(${p.id})">Edit</button>`,esc([p.sku,p.cat].filter(Boolean).join(' · '))||'Product')
  +xSum([['In stock',s+' '+U,s<=N(p.min)?'low':''],['Purchased',Math.round(pq*1e6)/1e6+' '+U],['Sold',Math.round(sq*1e6)/1e6+' '+U]])
  +`<div class="card"><div class="row"><span class="k">Opening stock (total)</span><b>${os} ${U}</b></div><div class="k" style="margin:8px 0 2px">Stock by godown</div>${gd}</div>`
  +`<p class="k">${R.length} transaction${R.length==1?'':'s'} · tap one to view, edit or delete</p>`
  +xList(R,'No transactions for this product yet')}

function partyTxPage(){
 const {t,id}=CTX,c=t=='c',x=(c?D.c:D.s).find(y=>y.id==id);if(!x){CTX=null;return V.parties()}
 const b=bal(t,id),ok=c?['sa','sr','qt','pi']:['pu','pr','po'],
  L=txAll().filter(z=>String(z.pid)==String(id)&&ok.includes(z.ty)).sort(xSort),
  billed=L.reduce((s,z)=>s+(z.ty=='sa'||z.ty=='sr'?z.a:z.ty=='pu'||z.ty=='pr'?-z.a:0),0),
  paid=L.reduce((s,z)=>s+(c?z.i-z.o:z.o-z.i),0),
  ICn={sa:'sale',sr:'undo',pu:'buy',pr:'undo',pi:'coin',po:'coin',qt:'stmt'},
  mn=z=>z.ty=='sa'||z.ty=='sr'?`txm('sa',${z.id})`:z.ty=='pu'||z.ty=='pr'?`txm('pu',${z.id})`:z.ty=='qt'?`txm('qt',${z.id})`:`pym(${z.id})`,
  rows=L.map(z=>({d:z.d,id:z.id,ty:z.ty,ic:ICn[z.ty],t:z.k+(z.no?' · '+z.no:''),s:z.m?esc(z.m):'—',
   a:z.n?M(Math.abs(z.a)):M(z.a),ac:z.n?'':z.a<0?'low':'ok',
   tag:(z.ty=='sa'||z.ty=='pu')?(()=>{const T=D[z.ty].find(w=>w.id==z.id);if(!T)return null;const d=billDue(T);return d<=0.004?['Paid','pd']:['Due '+M(d),N(T.paid)+alloc(T.id)>0.004?'du':'ud']})():null,
   tap:mn(z),menu:mn(z)}));
 return pgHead(esc(x.n),'',(c?'Customer':'Supplier')+(x.ph?' · '+esc(x.ph):''))
  +xSum([[c?'To receive':'To pay',M(b),b>0.0005?(c?'ok':'low'):''],[c?'Billed':'Purchased',M(billed)],[c?'Received':'Paid',M(paid)]])
  +`<div class="ptx-act"><button type="button" class="${c?'in':'out'}" onclick="payForm('${c?'in':'out'}',${id})">${c?'Payment IN':'Payment OUT'}</button><button type="button" class="g" onclick="stmt('${t}',${id})">Statement</button><button type="button" class="g" onclick="pMenu('${t}',${id})">Details</button></div>`
  +(N(x.open)?`<div class="card">${partyNote(t,x)}</div>`:'')
  +`<p class="k">${L.length} transaction${L.length==1?'':'s'} · tap one to view, edit or delete</p>`
  +xList(rows,'No transactions with this '+(c?'customer':'supplier')+' yet')}

go(1);
