/* =====================================================================
 TradeLynin — bulk edit additions (loaded after drafts.js)
   1. Products: "Opening stock" is editable in bulk edit (changes stock by the difference).
   2. "+ Add product / customer / supplier" inside bulk edit: new rows are typed in the table,
      then saved together with all other edits when you tap Save.
   New rows live in BQ[k]['n1'], 'n2'… with _new:1 until Save.
 ===================================================================== */
let _nrC=0;
// opening / adjusted stock = stock that is not explained by purchases and sales (same rule the costing uses)
const nrIds=k=>Object.keys(BQ[k]).filter(id=>BQ[k][id]&&BQ[k][id]._new);
const r6=x=>Math.round(x*1e6)/1e6;

function beAdd(k){const id='n'+(++_nrC);
 BQ[k][id]=k=='p'?{_new:1,n:'',sku:'',cat:'',u1:(D.un[0]||{}).n||'Pcs',cv:0,cost:0,price:0,min:5}:{_new:1,n:'',ph:'',ad:'',open:0,asof:today(),days:null,lim:0};
 go(1);setTimeout(()=>{const i=document.querySelector('#v tr.be-new textarea,#v tr.be-new input');if(i){i.scrollIntoView({block:'center'});i.focus()}},80)}
function beNx(k,id){delete BQ[k][id];go(1)}
// a cell of a NEW row was edited (nothing is validated until Save, except obvious bad numbers)
function beN(k,id,f,el){const q=BQ[k][id];if(!q)return;let v=el.value;
 if(f=='days'){if(v!==''&&N(v)<0){el.value='';return toast('Enter a valid number')}v=v===''?null:N(v)}
 else if(['cost','price','min','os','lim'].includes(f)||/^ob\d+$/.test(f)){if(v!==''&&N(v)<0){el.value=0;return toast('Enter a valid number')}v=v===''?0:N(v)}
 else if(f=='open')v=v===''?0:N(v);
 else if(f=='cv'||f=='g')v=N(v);
 else if(f=='asof'){}
 else v=v.trim();
 q[f]=v;
 if(f=='u1'&&q.cv){const cc=D.cv.find(x=>x.id==q.cv);if(cc&&cc.base!=v){q.cv=0;const s=el.closest('tr').querySelector('select[data-k="cv"]');if(s)s.value='';toast('Unit changed — conversion cleared')}}
 beUpd(k)}

// ---- photo cell (Product photo / customer-supplier opening balance bill photo)
const PHF={p:'photo',c:'obp',s:'obp'};
const bePh=(k,id,ref,chg)=>`<div class="ph-c${chg?' chg':''}"><label class="ph-bt" aria-label="Add or change photo">${PHI}<input type="file" accept="image/*" hidden onchange="bePhPick('${k}','${id}',this)"></label>${ref?`<img class="ph-mini" data-ph="${esc(ref)}" alt="" onclick="phShow(this.dataset.ph)"><button type="button" class="g s" aria-label="Remove photo" onclick="bePhClr('${k}','${id}',this)">✕</button>`:''}</div>`;
function bePhSet(k,id,ref,cell){const f=PHF[k],q=BQ[k][id];
 if(q&&q._new)q[f]=ref;else{const r=(k=='p'?D.p:D[k]).find(x=>String(x.id)==String(id));if(!r)return;beStage(k,id,f,ref,r[f]||'',null)}
 const now=BQ[k][id]&&f in BQ[k][id]&&!(q&&q._new);if(cell)cell.outerHTML=bePh(k,id,ref,now);beUpd(k)}
function bePhPick(k,id,inp){const f=inp.files&&inp.files[0],cell=inp.closest('.ph-c');inp.value='';if(!f)return;if(!/^image\//.test(f.type))return toast('Please choose an image');toast('Preparing photo…');
 phComp(f,async b=>{if(!b)return toast('Could not read that photo');const key=phNew();try{await phPut(key,b)}catch(e){return toast('Could not store the photo on this device')}bePhSet(k,id,key,cell);toast('Photo added — tap Save to keep it')})}
function bePhClr(k,id,btn){bePhSet(k,id,'',btn.closest('.ph-c'))}

// ---- products table
bulkProducts=function(){const h=noAdd(_V0.p()),tog=beTog('p');if(!BE.p)return h.replace('<div class="tw card">',tog+'<div class="tw card">');
 const L=D.p.filter(p=>(!window.q||(p.n+p.sku).toLowerCase().includes(window.q.toLowerCase()))&&(!CF||(CF=='__'?!p.cat:p.cat==CF))&&pfOk(p));
 const so=(id,k,o)=>`<select class="bi${bqC('p',id,k)}" data-k="${k}" onchange="beP(${id},'${k}',this)">${o}</select>`,V=(p,f)=>bqV('p',p.id,f,p[f]),
  inp=(p,f,num)=>`<input class="bi${num?' num':''}${bqC('p',p.id,f)}"${num?' type="number" step="any"':''} value="${esc(num?N(V(p,f)):V(p,f)==null?'':V(p,f))}" onchange="beP(${p.id},'${f}',this)">`;
 const obI=(p,g)=>`<input class="bi num${bqC('p',p.id,'ob'+g.id)}" type="number" step="any" min="0" value="${N(bqV('p',p.id,'ob'+g.id,N(obMap(p)[g.id])))}" onchange="beP(${p.id},'ob${g.id}',this)">`,
  obSum=p=>{const m=obMap(p);return obTotal(Object.fromEntries(D.g.map(g=>[g.id,bqV('p',p.id,'ob'+g.id,N(m[g.id]))])))},
  obT=p=>`<b data-obt="${p.id}">${obSum(p)}</b>`,
  stk=p=>{const s=r6(stock(p.id)+obSum(p)-osOf(p.id));return`<span data-stk="${p.id}" class="${s<=N(V(p,'min'))?'low':''}">${s}</span>`};
 // new rows first
 const nrow=id=>{const q=BQ.p[id],ni=(f,num,ph)=>`<input class="bi${num?' num':''}"${num?' type="number" step="any" min="0"':''} value="${esc(q[f]==null?'':num?N(q[f]):q[f])}"${ph?` placeholder="${ph}"`:''} onchange="beN('p','${id}','${f}',this)">`,
   ns=(f,o)=>`<select class="bi" data-k="${f}" onchange="beN('p','${id}','${f}',this)">${o}</select>`;
  return[ni('n',0,'New product name'),ni('sku',0,'SKU'),
   ns('cat','<option value="">— None —</option>'+D.ct.map(c=>`<option ${c.n==q.cat?'selected':''}>${esc(c.n)}</option>`).join('')),
   ns('u1',D.un.map(u=>`<option ${u.n==q.u1?'selected':''}>${esc(u.n)}</option>`).join('')),
   ns('cv','<option value="">— None —</option>'+D.cv.map(c=>`<option value="${c.id}" ${c.id==q.cv?'selected':''}>1 ${esc(c.big)} = ${c.f} ${esc(c.base)}</option>`).join('')),
   ni('cost',1),ni('price',1),ni('min',1),...D.g.map(g=>ni('ob'+g.id,1)),'<span class="k">—</span>',bePh('p',id,q.photo||''),
   `<button type="button" class="g s" onclick="beNx('p','${id}')" aria-label="Remove new row">✕</button>`]};
 const NR=nrIds('p').map(nrow);
 return h.replace(/<div class="tw card">[\s\S]*$/,()=>tog+tagRows(tbl(['Product','SKU','Category','Unit','Also sold by','#Purchase price','#Selling price','#Low-stock alert',...D.g.map(g=>'#Opening · '+g.n),'#Opening total','Photo','#Stock'],[...NR,...L.map(p=>[
  inp(p,'n'),inp(p,'sku'),
  so(p.id,'cat','<option value="">— None —</option>'+D.ct.map(c=>`<option ${c.n==V(p,'cat')?'selected':''}>${esc(c.n)}</option>`).join('')),
  so(p.id,'u1',D.un.map(u=>`<option ${u.n==V(p,'u1')?'selected':''}>${esc(u.n)}</option>`).join('')),
  so(p.id,'cv','<option value="">— None —</option>'+D.cv.map(c=>`<option value="${c.id}" ${c.id==V(p,'cv')?'selected':''}>1 ${esc(c.big)} = ${c.f} ${esc(c.base)}</option>`).join('')),
  inp(p,'cost',1),inp(p,'price',1),inp(p,'min',1),...D.g.map(g=>obI(p,g)),obT(p),bePh('p',p.id,V(p,'photo')||'',bqC('p',p.id,'photo')),stk(p)])]),[...NR.map(()=>'new'),...L.map(p=>'rec|p|'+p.id)]))};

// opening stock cell of an existing product
const _beP0=beP;
beP=function(id,k,el){if(/^ob\d+$/.test(k)){const p=D.p.find(x=>x.id==id);if(!p)return;const gid=+k.slice(2),old=N(obMap(p)[gid]),cur=N(bqV('p',id,k,old));
 if(el.value===''||N(el.value)<0){el.value=cur;return toast('Enter a valid number')}
 const v=N(el.value);if(stock(id,gid)+(v-old)<-1e-9){el.value=cur;return toast('Too low — more than that has already left '+nm(D.g,gid)+', stock there would go negative')}
 beStage('p',id,k,v,old,el);const t=document.querySelector('[data-obt="'+id+'"]');if(t)t.textContent=obSum(p);
 const ns=r6(stock(id)+obSum(p)-osOf(id)),c=document.querySelector('[data-stk="'+id+'"]');if(c){c.textContent=ns;c.className=ns<=N(bqV('p',id,'min',p.min))?'low':''}return}
 return _beP0(id,k,el)};

// ---- customers / suppliers table
bulkParty=function(t,R){const V=(x,f)=>bqV(t,x.id,f,x[f]),cl=(x,f)=>bqC(t,x.id,f),num=(x,f,d)=>`<input class="bi num${cl(x,f)}" type="number" step="any" value="${V(x,f)==null?d:N(V(x,f))}" onchange="beC('${t}',${x.id},'${f}',this)">`,txt=(x,f)=>`<input class="bi${cl(x,f)}" value="${esc(V(x,f)||'')}" onchange="beC('${t}',${x.id},'${f}',this)">`;
 const nrow=id=>{const q=BQ[t][id],nt=(f,ph)=>`<input class="bi" value="${esc(q[f]||'')}"${ph?` placeholder="${ph}"`:''} onchange="beN('${t}','${id}','${f}',this)">`,nn=f=>`<input class="bi num" type="number" step="any" value="${f=='days'&&q[f]==null?'':N(q[f])}" onchange="beN('${t}','${id}','${f}',this)">`;
  return[nt('n','New '+(t=='c'?'customer':'supplier')+' name'),nt('ph','Phone'),nt('ad','Address'),nn('open'),`<input class="bi" type="date" value="${esc(q.asof||'')}" onchange="beN('${t}','${id}','asof',this)">`,nn('days'),nn('lim'),...(FT('photos')?[bePh(t,id,q.obp||'')]:[]),
   `<button type="button" class="g s" onclick="beNx('${t}','${id}')" aria-label="Remove new row">✕</button>`]};
 const NR=nrIds(t).map(nrow);
 return tagRows(tbl(['Name','Phone','Address','#Opening balance','As of date','#Credit days','#Credit limit',...(FT('photos')?['Opening bill photo']:[]),'#Balance'],[...NR,...R.map(x=>[
  txt(x,'n'),txt(x,'ph'),txt(x,'ad'),num(x,'open',0),`<input class="bi${cl(x,'asof')}" type="date" value="${esc(V(x,'asof')||'')}" onchange="beC('${t}',${x.id},'asof',this)">`,num(x,'days',''),num(x,'lim',0),...(FT('photos')?[bePh(t,x.id,V(x,'obp')||'',cl(x,'obp'))]:[]),
  `<b data-bal="${x.id}" class="${bal(t,x.id)>0.0005?(t=='c'?'ok':'low'):''}">${M(bal(t,x.id))}</b>`])]),[...NR.map(()=>'new'),...R.map(x=>'rec|'+t+'|'+x.id)])};

// ---- Save: new rows + opening stock + the usual edits, all or nothing
function nrBlank(k,q){return!q.n&&!q.photo&&!q.obp&&(k=='p'?!q.sku&&!N(q.cost)&&!N(q.price)&&!D.g.some(g=>N(q['ob'+g.id])):!q.ph&&!q.ad&&!N(q.open))}
function nrCheck(k,NR){const ids=Object.keys(NR).filter(id=>!nrBlank(k,NR[id]));
 const names=new Set(),skus=new Set(),what=k=='p'?'product':k=='c'?'customer':'supplier';
 (k=='p'?D.p:D[k]).forEach(x=>{names.add(lc(bqV(k,x.id,'n',x.n)));if(k=='p'){const s=lc(bqV('p',x.id,'sku',x.sku)||'');if(s)skus.add(s)}});
 for(const id of ids){const q=NR[id];
  if(!q.n)return'Enter a name for every new '+what;
  if(names.has(lc(q.n)))return'A '+what+' named "'+q.n+'" already exists';names.add(lc(q.n));
  if(k=='p'){if(q.sku){if(skus.has(lc(q.sku)))return'SKU "'+q.sku+'" is already used';skus.add(lc(q.sku))}
   const cc=D.cv.find(x=>x.id==q.cv);if(cc&&cc.base!=q.u1)return'"'+q.n+'": that conversion is for '+cc.base+', not '+q.u1}}
 return''}
function shiftStock(pid,delta){if(!delta)return;if(delta>0){addSt(pid,D.g[0].id,delta);return}
 let left=-delta;[...D.g].sort((a,b)=>stock(pid,b.id)-stock(pid,a.id)).forEach(g=>{if(left<=1e-9)return;const t=Math.min(Math.max(stock(pid,g.id),0),left);if(t>0){addSt(pid,g.id,-t);left-=t}});
 if(left>1e-9)addSt(pid,D.g[0].id,-left)}
const _beSave0=beSave;
beSave=function(k){const n=bqN(k);if(!n)return toast('No changes to save');
 const NR={},OB={};
 for(const id in BQ[k]){const q=BQ[k][id];if(q&&q._new){NR[id]=q;delete BQ[k][id]}else if(k=='p'&&q){const ks=Object.keys(q).filter(f=>/^ob\d+$/.test(f));if(ks.length){OB[id]={};ks.forEach(f=>{OB[id][f]=q[f];delete q[f]});if(!Object.keys(q).length)delete BQ[k][id]}}}
 const back=()=>{Object.assign(BQ[k],NR);for(const id in OB){BQ.p[id]=Object.assign(BQ.p[id]||{},OB[id])}};
 const e1=nrCheck(k,NR);if(e1){back();return toast(e1)}
 const PL={};for(const id in OB){const p=D.p.find(x=>x.id==id);if(!p)continue;const m=obMap(p);for(const f in OB[id])m[f.slice(2)]=OB[id][f];const pl=osPlan(p,m);if(pl.err){back();return toast('"'+p.n+'": '+pl.err)}PL[id]=pl}
 if(bqN(k)>0){_beSave0(k);if(BE[k]){back();return}}   // an ordinary edit was refused — stay in bulk edit
 for(const id in PL){const p=D.p.find(x=>x.id==id);if(p)osApply(p,PL[id])}
 let added=0;const nb=Object.keys(NR).filter(id=>nrBlank(k,NR[id])).length;
 Object.keys(NR).forEach(id=>{const q=NR[id];if(nrBlank(k,q))return;added++;
  if(k=='p'){const cc=D.cv.find(x=>x.id==q.cv),r={id:uid(),n:q.n,sku:q.sku||'',cat:q.cat||'',cost:N(q.cost),price:N(q.price),min:N(q.min),u1:q.u1||'Pcs',cv:cc?cc.id:0};if(q.photo)r.photo=q.photo;
   const m={};D.g.forEach(g=>{m[g.id]=Math.max(0,N(q['ob'+g.id]))});D.p.push(r);osApply(r,osPlan({id:r.id,ob:{}},m))}
  else D[k].push({id:uid(),n:q.n,ph:q.ph||'',ad:q.ad||'',open:N(q.open),asof:q.asof||'',days:q.days==null||q.days===''?null:N(q.days),lim:N(q.lim),...(q.obp?{obp:q.obp}:{})})});
 if(k=='p')initUnits();
 BQ[k]={};BE[k]=0;save();const ch=n-added-nb;toast((added?added+' added'+(ch>0?' · ':''):'')+(ch>0?ch+' change'+(ch>1?'s':'')+' saved':'')||'Saved');go(1)};
