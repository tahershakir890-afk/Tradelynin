/* =====================================================================
 TradeLynin v43 — Godowns page redesign (loaded after prod5.js)
   Same data and handlers as before: gdSel / gdm / GDG / GDK / GDS, trForm, prodTx, gForm, delG.
   New: summary cards with stock value, share-of-stock bar and low-stock count; segmented filter; cleaner product rows.
 ===================================================================== */
IC.gdw='<path d="M3 21V9.5L12 4l9 5.5V21"/><path d="M7 21v-8h10v8"/><path d="M7 17h10"/>';
IC.srch2='<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>';
const gdVal=(gid)=>D.p.reduce((s,p)=>s+Math.max(0,stock(p.id,gid))*N(p.cost),0);
const gdCol=s=>{const K=['#2563eb','#16a34a','#ea580c','#9333ea','#0891b2','#db2777','#ca8a04','#475569'];let h=0;for(const c of String(s||'-'))h=(h*31+c.charCodeAt(0))%997;return K[h%K.length]};
stockGodowns=function(){
 if(GDG&&!D.g.some(g=>g.id==GDG))GDG='';
 const sel=D.g.find(g=>g.id==GDG),q=(GDS||'').toLowerCase(),cols=sel?[sel]:D.g,
  tt=p=>rr(cols.reduce((s,g)=>s+stock(p.id,g.id),0)),
  rows=D.p.filter(p=>(!q||(p.n+' '+(p.sku||'')+' '+(p.cat||'')).toLowerCase().includes(q))&&(GDK=='in'?tt(p)>0:GDK=='low'?(tt(p)>0&&tt(p)<=N(p.min)):GDK=='out'?tt(p)<=0:true)).sort((a,b)=>String(a.n).localeCompare(String(b.n)));
 const units=gid=>rr(D.p.reduce((s,p)=>s+Math.max(0,gid?stock(p.id,gid):stock(p.id)),0)),
  inStock=gid=>D.p.filter(p=>(gid?stock(p.id,gid):stock(p.id))>0).length,
  lowN=gid=>D.p.filter(p=>{const s=gid?stock(p.id,gid):stock(p.id);return s>0&&s<=N(p.min)}).length,
  allU=units(0),allV=D.p.reduce((s,p)=>s+Math.max(0,stock(p.id))*N(p.cost),0);
 const card=(id,name,u,items,val,low,extra)=>{const share=allU>0?Math.round(u/allU*100):0,on=String(GDG)==String(id)||(!id&&!GDG);
  return`<div class="g5-c${id?'':' all'}${on?' on':''}"><button type="button" class="g5-cm" onclick="gdSel(${id||0})"><span class="g5-top"><span class="g5-ic">${ic('gdw',20)}</span><b class="g5-nm">${esc(name)}</b></span>`
   +`<span class="g5-u">${u}<small> units</small></span><span class="g5-meta">${items} product${items==1?'':'s'}<br>Value ${M(val)}</span>`
   +`<span class="g5-bar"><i style="width:${id?share:100}%"></i></span><span class="g5-ft"><span>${id?share+'% of all stock':'Across all godowns'}</span>${low?`<em class="g5-lw">${low} low</em>`:''}</span></button>${extra||''}</div>`};
 const cards=card(0,'All godowns',allU,inStock(0),allV,lowN(0))
  +D.g.map(g=>card(g.id,g.n,units(g.id),inStock(g.id),gdVal(g.id),lowN(g.id),`<button type="button" class="xr-k g5-k" aria-label="Godown options" onclick="gdm(${g.id})">${ic('more',18)}</button>`)).join('');
 const seg=(v,l)=>`<button type="button" class="${GDK==v?'on':''}" onclick="GDK='${v}';go(1)">${l}</button>`,
  where=sel?esc(sel.n):'all godowns',what=GDK=='in'?'in stock':GDK=='low'?'low on stock':GDK=='out'?'with zero stock':'(all items)';
 const list=rows.map(p=>{const U=esc(p.u1||'Pcs'),v=tt(p),mn=N(p.min),k=v<=0?'out':v<=mn?'low':'ok',col=gdCol(p.cat||p.n);
  const chips=D.g.map(g=>({g,q:stock(p.id,g.id)})).filter(x=>x.q!=0).map(x=>`<span class="gch"><i>${esc(x.g.n)}</i><b>${x.q}</b></span>`).join('')||'<span class="k">No stock</span>';
  return`<button type="button" class="g5-r" onclick="prodTx(${p.id})"><span class="g5-av" style="background:${col}1f;color:${col}">${esc((p.n||'?').trim().charAt(0).toUpperCase())}</span>`
   +`<span class="g5-n"><b>${esc(p.n)}</b><span class="k">${p.sku?esc(p.sku):'No code'}${p.cat?' · '+esc(p.cat):''}</span>${sel?'':`<span class="g5-ch">${chips}</span>`}</span>`
   +`<span class="g5-q ${k}"><b>${v}</b><small>${U}${sel?'':' total'}</small>${k!='ok'?`<em>${k=='out'?'Out':'Low'}</em>`:''}</span></button>`}).join('');
 return wh('<button class="gn" onclick="gForm()">+ Godown</button>','<h3>Godowns</h3>')
  +`<div class="gd-act g5-act"><button type="button" onclick="trForm()">${ic('swap',18)} Transfer stock</button><button type="button" class="g" onclick="nav('transfers')">Transfer history</button></div>`
  +`<div class="g5-cs">${cards}</div>`
  +`<div class="g5-f"><div class="g5-s">${ic('srch2',18)}<input placeholder="Search product name or code…" value="${esc(GDS)}" oninput="GDS=this.value;window.q=this.value;go(1)"></div><select class="g5-gs" aria-label="Filter by godown" onchange="GDG=this.value;go(1)"><option value=""${GDG?'':' selected'}>All godowns</option>${D.g.map(g=>`<option value="${g.id}"${String(GDG)==String(g.id)?' selected':''}>${esc(g.n)}</option>`).join('')}</select></div>`
  +`<div class="g5-seg" role="group" aria-label="Stock filter">${seg('in','Available')}${seg('low','Low stock')}${seg('out','Zero stock')}${seg('','All items')}</div>`
  +`<p class="k gd-cnt">${rows.length} product${rows.length==1?'':'s'} ${what} · ${where}</p><div class="g5-l">${list||`<div class="pl-e">${GDK=='in'?'Nothing in stock here':GDK=='low'?'No low-stock products':GDK=='out'?'No zero-stock products':'No products match'}</div>`}</div>`};

/* if the page was opened directly on #godowns, the first render happened before this file loaded: render again with this layout */
try{if(typeof cur!='undefined'&&cur=='godowns'&&!locked())go(1)}catch(e){}
