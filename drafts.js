/* =====================================================================
 TradeLynin — Save as draft + "Cancel?" popup on every transaction form   (loaded after bill2.js)
   Sale · Purchase · Quotation · Sales/Purchase Return · Payment IN/OUT · Expense · Move Money · Stock Transfer
   Drafts live in D.dr (saved with your data) and never touch stock, balances or invoice numbers until you save them for real.
 ===================================================================== */
const drList=()=>(D.dr=D.dr||[]);
let TXC=null;
const txCount=()=>['sa','pu','qt','pay','ex','th','tf'].reduce((a,k)=>a+(D[k]||[]).length,0);
const TXL={sa:'Sale',pu:'Purchase',qt:'Quotation'};

/* ---- read what is on the form ---- */
function txCapture(){const mc=$('mc'),f={};
 mc.querySelectorAll('input[id],select[id],textarea[id]').forEach(e=>{if(e.id!='ok')f[e.id]=e.value});
 const ln=[...mc.querySelectorAll('#ln .line')].map(r=>({pid:r.children[0].value,q:r.children[1].value,p:r.children[2].value,us:(r.querySelector('.us')||{}).value||'',bs:(r.querySelector('.bs')||{}).value||'',op:r.dataset.op||''}));
 const tl=[...mc.querySelectorAll('#tl .line')].map(r=>({s:r.querySelector('select').value,q:r.querySelector('input').value}));
 const pb=[...mc.querySelectorAll('#p_bl .line')].map(r=>({id:r.dataset.id,v:r.children[2]?r.children[2].value:''}));
 return{f,ln,tl,pb}}
function txHasData(){const t=TXC;if(!t)return false;const x=txCapture();
 if(t.type=='doc')return !!(x.f.d_p||x.ln.some(l=>l.pid));
 if(t.type=='pay')return !!(x.f.p_pid||N(x.f.p_amt)||x.f.p_note);
 if(t.type=='tr')return x.tl.some(l=>l.s||N(l.q));
 return !!(N(x.f.f_amt)||x.f.f_note||x.f.f_cat)}
function txSummary(){const t=TXC;let party='',amt=0;
 if(t.type=='doc'){const s=$('d_p');party=s&&s.value&&s.selectedOptions[0]?s.selectedOptions[0].textContent.trim():'';try{amt=tot({items:lines(),disc:($('d_ds')||{}).value,tax:window._tx}).total}catch(e){}}
 else if(t.type=='pay'){const s=$('p_pid');party=s&&s.value&&s.selectedOptions[0]?s.selectedOptions[0].textContent.trim():'';amt=N(($('p_amt')||{}).value)}
 else if(t.type=='form'){amt=N(($('f_amt')||{}).value);const c=$('f_cat');party=c&&c.value?c.value:''}
 return{party,amt}}

/* ---- put a draft back on the form ---- */
function drFill(d){const x=d.data,set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v};
 if(d.type=='doc'){['d_p','d_d','d_g','d_m','d_pd','d_ds','d_note'].forEach(k=>set(k,x.f[k]));
  const L=$('ln');L.innerHTML='';(x.ln.length?x.ln:[{}]).forEach(l=>{addLn();const r=L.lastChild;if(l.pid==null)return;r.children[0].value=l.pid;usFill(r,l.us);bsFill(r,l.bs);r.children[1].value=l.q;r.children[2].value=l.p;if(l.op)r.dataset.op=l.op});calc()}
 else if(d.type=='pay'){set('p_pid',x.f.p_pid);set('p_date',x.f.p_date);set('p_amt',x.f.p_amt);set('p_m',x.f.p_m);set('p_note',x.f.p_note);payRef();
  document.querySelectorAll('#p_bl .line').forEach(r=>{const m=x.pb.find(b=>b.id==r.dataset.id);if(m&&r.children[2])r.children[2].value=m.v})}
 else if(d.type=='tr'){set('t_a',x.f.t_a);refTl();set('t_b',x.f.t_b);set('t_d',x.f.t_d);set('t_n',x.f.t_n);const L=$('tl');L.innerHTML='';(x.tl.length?x.tl:[{}]).forEach(l=>{addTl();const r=L.lastChild;if(l.s!=null){r.querySelector('select').value=l.s;r.querySelector('input').value=l.q}})}
 else Object.entries(x.f).forEach(([k,v])=>set(k,v))}

/* ---- Save as draft ---- */
function txDraft(){const t=TXC;if(!t)return false;if(!txHasData()){toast('Fill something in first, then save it as a draft');return false}
 const s=txSummary(),rec={id:t.draftId||uid(),fn:t.fn,type:t.type,label:t.label,party:s.party,amt:s.amt,at:Date.now(),data:txCapture()},L=drList(),i=L.findIndex(d=>d.id==rec.id);
 if(i>=0)L[i]=rec;else L.unshift(rec);t.draftId=rec.id;save();return true}
function drOpen(id){const d=drList().find(x=>x.id==id);if(!d)return;try{Function(d.fn)()}catch(e){return toast('Cannot open this draft')}
 if(!TXC)return;TXC.draftId=id;try{drFill(d)}catch(e){console.error(e)}}
function drDel(id){ask('Delete This Draft?',()=>{D.dr=drList().filter(x=>x.id!=id);save();go(1);toast('Draft deleted')})}
const drRemove=id=>{D.dr=drList().filter(x=>x.id!=id);save()};

/* ---- the Cancel popup ---- */
function dlgClose(){const d=document.getElementById('dlg3');if(d)d.remove()}
function txCancel(){if(document.getElementById('dlg3'))return;const t=TXC,ed=!!(t&&t.edit),has=!ed&&txHasData(),nm=t?t.label.toLowerCase():'transaction';
 const d=document.createElement('div');d.id='dlg3';d.className='dlg3';
 d.innerHTML=`<div class="dlg3-c" role="alertdialog" aria-modal="true"><h4>${ed?'Discard changes to this':'Cancel this'} ${esc(nm)}?</h4><p class="k">${ed?'Your changes are not saved yet.':has?(t&&t.draftId?'Your changes are not saved yet. Save them to the draft, or discard the changes.':'Nothing is saved yet. Save it as a draft to finish later, or discard it.'):'Nothing has been entered yet.'}</p><div class="dlg3-b">${has?'<button type="button" onclick="dlgDraft()">Save as draft</button>':''}<button type="button" class="r" onclick="dlgDiscard()">Discard</button><button type="button" class="g" onclick="dlgClose()">Keep editing</button></div></div>`;
 d.onclick=e=>{if(e.target==d)dlgClose()};document.body.append(d)}
function dlgDraft(){if(txDraft()){dlgClose();closeM();go(1);toast('Saved as draft — find it in Transactions → Drafts')}}
function dlgDiscard(){dlgClose();closeM()}
function txSaveBtn(){if(txDraft()){closeM();go(1);toast('Saved as draft — find it in Transactions → Drafts')}}

/* ---- decorate a freshly opened transaction form ---- */
function txOpen(ctx){const ok=$('ok'),m=$('m');if(!ok||!m||m.style.display!='flex')return;TXC=ctx;ctx.root=$('mc').firstElementChild;const row=ok.parentNode;
 [...row.querySelectorAll('button')].forEach(b=>{if(b.textContent.trim()=='Cancel')b.onclick=txCancel});
 if(!ctx.edit&&FT('drafts')&&!row.querySelector('.dft')){const b=document.createElement('button');b.type='button';b.className='g dft';b.textContent='Save as draft';b.onclick=txSaveBtn;ok.before(b)}
 const bk=document.querySelector('#mc .fp-bk');if(bk)bk.onclick=txCancel;
 const n0=txCount();ok.addEventListener('click',()=>setTimeout(()=>{if(ctx.draftId&&txCount()>n0)drRemove(ctx.draftId)},150))}
const _doc5=doc;doc=function(kind,ret,id,src){_doc5.apply(this,arguments);txOpen({edit:!!id,type:'doc',fn:`doc('${kind}'${ret?',1':''})`,label:ret?(kind=='sa'?'Sales Return':'Purchase Return'):TXL[kind]||'Bill'})};
const _pay5=payForm;payForm=function(ty,pre,id){_pay5.apply(this,arguments);txOpen({edit:!!id,type:'pay',fn:`payForm('${ty}')`,label:ty=='in'?'Payment IN':'Payment OUT'})};
const _exp5=expForm;expForm=function(id){_exp5.apply(this,arguments);txOpen({edit:!!id,type:'form',fn:'expForm()',label:'Expense'})};
const _acTr5=acTr;acTr=function(){_acTr5.apply(this,arguments);txOpen({type:'form',fn:'acTr()',label:'Money transfer'})};
const _trF5=trForm;trForm=function(){_trF5.apply(this,arguments);txOpen({type:'tr',fn:'trForm()',label:'Stock transfer'})};
const _cm5=closeM;closeM=function(){dlgClose();const r=_cm5.apply(this,arguments);if($('m').style.display=='none')TXC=null;return r};
addEventListener('keydown',e=>{if(e.key!='Escape')return;const m=$('m');if(!m||m.style.display!='flex'||!TXC||!TXC.root||!$('mc').contains(TXC.root))return;if(typeof _sp!='undefined'&&_sp)return;e.preventDefault();e.stopImmediatePropagation();document.getElementById('dlg3')?dlgClose():txCancel()},true);

/* ---- Drafts screen ---- */
V.drafts=()=>{const L=drList();
 return wh('','<h3>Drafts</h3>')+`<p class="k">Unfinished transactions. They don't change your stock or balances until you finish and save them.</p>`
 +(L.length?L.map(d=>`<div class="card dr-i"><div class="row"><b>${esc(d.label)}</b><span class="k">${new Date(d.at).toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div><div class="k">${esc(d.party||'No party yet')} · ${d.amt?M(d.amt):'No amount yet'}</div><div class="row" style="margin-top:10px"><button type="button" class="g s" onclick="drDel(${d.id})">Delete</button><button type="button" class="s" onclick="drOpen(${d.id})">Continue</button></div></div>`).join(''):'<div class="pl-e">No drafts yet. Tap “Save as draft” on any transaction to keep it for later.</div>')};
NAV0[1][2].splice(1,0,'drafts');TXI0.splice(1,0,['Drafts','drafts','']);QA0.push(['Drafts',"nav('drafts')",'all','','Sell','drafts saved unfinished continue later']);
applyFeatures();
