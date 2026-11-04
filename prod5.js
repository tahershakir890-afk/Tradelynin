/* =====================================================================
 TradeLynin v43 — Products page as a structured inventory table (loaded after stock3.js)
   Item Name · SKU · Category · Purchase Price · Selling Price · Base Unit · Conversion ·
   Opening Stock per godown (one column per godown, generated from D.g) · Total Stock
   Presentation only: same data (D.p, D.g, D.cv, D.st), same helpers (stock, obMap, osOf), same handlers
   (search q, category CF, filters pfOk, Select mode PS, Bulk edit BE.p / beP / BQ, prodTx, pcm).
 ===================================================================== */
const PT={k:'n',d:1};
function ptSort(k){if(PT.k==k)PT.d=-PT.d;else{PT.k=k;PT.d=1}go(1)}
const ptCv=p=>D.cv.find(c=>c.id==p.cv);
const ptConvTxt=p=>{const c=ptCv(p);return c?`${esc(c.big)} <span class="k">· 1 ${esc(c.big)} = ${c.f} ${esc(c.base)}</span>`:(p.u2?esc(p.u2):'<span class="k">—</span>')};
const ptQty=(q,u,cls)=>`<span class="${cls||''}">${q} ${esc(u||'Pcs')}</span>`;
function ptVal(p,k){switch(k){
 case'n':return String(p.n||'').toLowerCase();case'sku':return String(p.sku||'').toLowerCase();case'cat':return String(p.cat||'').toLowerCase();
 case'cost':return N(p.cost);case'price':return N(p.price);case'u1':return String(p.u1||'').toLowerCase();
 case'cv':{const c=ptCv(p);return c?N(c.f):0}case'tot':return stock(p.id);
 default:if(/^ob\d+$/.test(k))return N(obMap(p)[+k.slice(2)]);return 0}}
function ptList(){const q=(window.q||'').toLowerCase();
 const L=D.p.filter(p=>(!q||(p.n+(p.sku||'')).toLowerCase().includes(q))&&(!CF||(CF=='__'?!p.cat:p.cat==CF))&&pfOk(p));
 return L.sort((a,b)=>{const x=ptVal(a,PT.k),y=ptVal(b,PT.k),r=typeof x=='string'?x.localeCompare(y):x-y;return(r||String(a.n).localeCompare(String(b.n)))*PT.d})}
/* cols: [{t:title, k:sortKey, n:numeric}]  rows: [[cell html]]  keys: per-row bulk key / 'new' */
function ptTable(cols,rows,keys){
 const th=cols.map((c,i)=>`<th class="${c.n?'n ':''}${i==0?'pt-nm ':''}${c.k?'pt-sr':''}"${c.k?` onclick="ptSort('${c.k}')"`:''}>${c.t}${c.k&&PT.k==c.k?`<i class="pt-ar">${PT.d>0?'▲':'▼'}</i>`:''}</th>`).join('');
 const tr=rows.map((r,j)=>`<tr${keys[j]=='new'?' class="be-new"':keys[j]?` data-bkd="${keys[j]}"`:''}>${r.map((c,i)=>`<td class="${cols[i].n?'n ':''}${i==0?'pt-nm':''}">${c}</td>`).join('')}</tr>`).join('')
  ||`<tr><td colspan="${cols.length}" style="color:var(--mu)">No products match</td></tr>`;
 return`<div class="tw card pt-w"><table class="pt-t"><tr>${th}</tr>${tr}</table></div>`}
const ptCols=()=>[{t:'Item Name',k:'n'},{t:'SKU / Item Code',k:'sku'},{t:'Category',k:'cat'},{t:'Purchase Price',k:'cost',n:1},{t:'Selling Price',k:'price',n:1},{t:'Base Unit',k:'u1'},{t:'Conversion Unit',k:'cv'},
 ...D.g.map(g=>({t:'Opening Stock – '+esc(g.n),k:'ob'+g.id,n:1})),{t:'Total Stock',k:'tot',n:1}];

bulkProducts=function(){
 const h=noAdd(_V0.p()),tog=beTog('p'),L=ptList();
 if(!BE.p){
  const rows=L.map(p=>{const m=obMap(p),s=stock(p.id),U=p.u1||'Pcs';
   return[`<span class="pt-nmw"><a class="plk" onclick="prodTx(${p.id})">${esc(p.n)}</a>${p.photo?phBtn('p',p.id):''}<button type="button" class="xr-k pt-mo" aria-label="Options" onclick="pcm(${p.id})">${ic('more',18)}</button></span>`,
    esc(p.sku)||'<span class="k">—</span>',esc(p.cat)||'<span class="k">—</span>',M(p.cost),M(p.price),esc(U),ptConvTxt(p),
    ...D.g.map(g=>{const q=N(m[g.id]);return ptQty(q,U,q?'':'k')}),
    `<b>${ptQty(s,U,s<=N(p.min)?'low':'')}</b>`]});
  const units=rr(L.reduce((s,p)=>s+stock(p.id),0));
  return h.replace(/<div class="tw card">[\s\S]*$/,()=>tog+`<div class="pc-tb"><span class="k pc-cnt">${L.length} product${L.length==1?'':'s'} · ${units} units in stock · tap a name for its history · tap a heading to sort</span></div>`
   +ptTable(ptCols(),rows,L.map(p=>'rec|p|'+p.id)))}
 /* ---- bulk edit: same editable cells and handlers as before, columns re-ordered ---- */
 const so=(id,k,o)=>`<select class="bi${bqC('p',id,k)}" data-k="${k}" onchange="beP(${id},'${k}',this)">${o}</select>`,V=(p,f)=>bqV('p',p.id,f,p[f]),
  nmT=(p,f)=>`<textarea rows="2" class="bi nm-ta${bqC('p',p.id,f)}" spellcheck="false" oninput="this.value=this.value.replace(/[\\r\\n]+/g,' ')" onkeydown="if(event.key=='Enter'){event.preventDefault();this.blur()}" onchange="beP(${p.id},'${f}',this)">${esc(V(p,f)==null?'':V(p,f))}</textarea>`,
  inp=(p,f,num)=>`<input class="bi${num?' num':''}${bqC('p',p.id,f)}"${num?' type="number" step="any"':''} value="${esc(num?N(V(p,f)):V(p,f)==null?'':V(p,f))}" onchange="beP(${p.id},'${f}',this)">`,
  obI=(p,g)=>`<input class="bi num${bqC('p',p.id,'ob'+g.id)}" type="number" step="any" min="0" value="${N(bqV('p',p.id,'ob'+g.id,N(obMap(p)[g.id])))}" onchange="beP(${p.id},'ob${g.id}',this)">`,
  obSum=p=>{const m=obMap(p);return obTotal(Object.fromEntries(D.g.map(g=>[g.id,bqV('p',p.id,'ob'+g.id,N(m[g.id]))])))},
  obT=p=>`<b data-obt="${p.id}">${obSum(p)}</b>`,
  stk=p=>{const s=r6(stock(p.id)+obSum(p)-osOf(p.id));return`<span data-stk="${p.id}" class="${s<=N(V(p,'min'))?'low':''}">${s}</span>`};
 const nrow=id=>{const q=BQ.p[id],ni=(f,num,ph)=>`<input class="bi${num?' num':''}"${num?' type="number" step="any" min="0"':''} value="${esc(q[f]==null?'':num?N(q[f]):q[f])}"${ph?` placeholder="${ph}"`:''} onchange="beN('p','${id}','${f}',this)">`,
   ns=(f,o)=>`<select class="bi" data-k="${f}" onchange="beN('p','${id}','${f}',this)">${o}</select>`;
  return[`<textarea rows="2" class="bi nm-ta" spellcheck="false" placeholder="New product name" oninput="this.value=this.value.replace(/[\r\n]+/g,' ')" onkeydown="if(event.key=='Enter'){event.preventDefault();this.blur()}" onchange="beN('p','${id}','n',this)">${esc(q.n||'')}</textarea>`,ni('sku',0,'SKU'),
   ns('cat','<option value="">— None —</option>'+D.ct.map(c=>`<option ${c.n==q.cat?'selected':''}>${esc(c.n)}</option>`).join('')),
   ni('cost',1),ni('price',1),
   ns('u1',D.un.map(u=>`<option ${u.n==q.u1?'selected':''}>${esc(u.n)}</option>`).join('')),
   ns('cv','<option value="">— None —</option>'+D.cv.map(c=>`<option value="${c.id}" ${c.id==q.cv?'selected':''}>1 ${esc(c.big)} = ${c.f} ${esc(c.base)}</option>`).join('')),
   ...D.g.map(g=>ni('ob'+g.id,1)),'<span class="k">—</span>','<span class="k">—</span>',ni('min',1),...(FT('photos')?[bePh('p',id,q.photo||'')]:[]),
   `<button type="button" class="g s" onclick="beNx('p','${id}')" aria-label="Remove new row">✕</button>`]};
 const NR=nrIds('p').map(nrow);
 const cols=[...ptCols(),{t:'Opening total',n:1},{t:'Low-stock alert',n:1},...(FT('photos')?[{t:'Photo'}]:[]),{t:''}];
 const rows=[...NR,...L.map(p=>[nmT(p,'n'),inp(p,'sku'),
  so(p.id,'cat','<option value="">— None —</option>'+D.ct.map(c=>`<option ${c.n==V(p,'cat')?'selected':''}>${esc(c.n)}</option>`).join('')),
  inp(p,'cost',1),inp(p,'price',1),
  so(p.id,'u1',D.un.map(u=>`<option ${u.n==V(p,'u1')?'selected':''}>${esc(u.n)}</option>`).join('')),
  so(p.id,'cv','<option value="">— None —</option>'+D.cv.map(c=>`<option value="${c.id}" ${c.id==V(p,'cv')?'selected':''}>1 ${esc(c.big)} = ${c.f} ${esc(c.base)}</option>`).join('')),
  ...D.g.map(g=>obI(p,g)),stk(p),obT(p),inp(p,'min',1),...(FT('photos')?[bePh('p',p.id,V(p,'photo')||'',bqC('p',p.id,'photo'))]:[]),''])];
 return h.replace(/<div class="tw card">[\s\S]*$/,()=>tog+ptTable(cols,rows,[...NR.map(()=>'new'),...L.map(p=>'rec|p|'+p.id)]))};

/* Select mode on the table: tick boxes (same keys / bar as the card version) */
const _bi5=bulkInit;
bulkInit=function(){_bi5();
 if(cur!='products'||_pr!='p'||BE.p||!PS.on)return;
 const t=document.querySelector('#v table.pt-t');if(!t||t.querySelector('th.bkc'))return;
 [...t.rows].forEach((r,i)=>{const c=r.insertCell(0);
  if(i==0){c.outerHTML='<th class="bkc"><input type="checkbox" onchange="bkAllT(this)" aria-label="Select all"></th>';return}
  c.className='bkc';const o=bkParse(r);if(!o)return;const k=bkKey(o);
  c.innerHTML=`<input type="checkbox" data-bk="${k}" ${BK.sel.has(k)?'checked':''} onchange="bkChk(this)" onclick="event.stopPropagation()" aria-label="Select">`});
 bkBar()};
