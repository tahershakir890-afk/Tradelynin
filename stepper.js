/* =====================================================================
 TradeLynin v72 — one-page Add forms with a transaction number and ONE bottom bar.
   Forms: Add Product / Customer / Supplier / Party / Expense, New Sale / Purchase / Quotation,
          Sales Return, Purchase Return, Receive Payment, Make Payment.
   - Transaction forms start with their own number (Invoice / Purchase / Return / Expense /
     Payment / Quotation No.), auto-generated, sequential per type, editable, unique.
   - That field is focused first. The single bottom bar is  [Cancel] [Save as draft] [Previous] [Next / Save]:
     Next moves to the next editable field (opening dropdowns for Party, Product, Godown ...)
     and becomes Save on the last field. The old Cancel / Save footer is hidden (Save is
     still triggered through it). Editing an existing record is unchanged.
 ===================================================================== */
(function(){
const OK=/^(Add (Product|Customer|Supplier|Party|Expense)|New (Sale|Purchase|Quotation)|Sales Return|Purchase Return|Receive Payment|Make Payment)$/;
const NOS=t=>({'New Sale':['Invoice No.',S.pre],'New Purchase':['Purchase No.','PUR-'],'New Quotation':['Quotation No.','QT-'],'Sales Return':['Return No.',S.pre+'R'],'Purchase Return':['Return No.','PUR-R'],'Add Expense':['Expense No.','EXP-'],'Receive Payment':['Payment No.','PI-'],'Make Payment':['Payment No.','PO-']})[t]||null;
const _fp=fullPage;
fullPage=function(){_fp.apply(this,arguments);try{fnInit()}catch(e){console.error(e)}};
if(!document.getElementById('fn-css')){const s=document.createElement('style');s.id='fn-css';
 s.textContent='.fn-bar{flex:0 0 auto;display:flex;gap:8px;background:var(--card);border-top:1px solid var(--bd);box-shadow:0 -6px 18px #0f172a0f;padding:10px max(14px,calc((100% - var(--fpw,760px))/2 + 14px));padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}'+
 '.fn-bar button{flex:1 1 0;min-width:0;min-height:48px;padding:0 6px;border-radius:12px;font-size:13px;line-height:1.15;font-weight:700;margin:0}.fn-bar .fn-nx{flex:1.3 1 0;font-size:16px}.fn-bar [hidden]{display:none}.fn-bar button:disabled{opacity:.4}'+
 '.fn-bar .fn-sv{flex:1.15 1 0;background:linear-gradient(135deg,#0d9488,#16a34a);color:#fff;border:0}@media(max-width:480px){.fn-bar{gap:6px;padding-left:10px;padding-right:10px}.fn-bar button{font-size:12px;padding:0 3px}.fn-bar .fn-nx{font-size:14px}}'+
 '.fn-no{padding-bottom:12px}.fn-no input{font-weight:700;letter-spacing:.3px}';
 document.head.appendChild(s)}
function fnInit(){
 const mc=document.getElementById('mc'),h3=mc.querySelector('.fp-h h3'),bd=mc.querySelector('.fp-body'),ft=mc.querySelector('.fp-f'),ok=document.getElementById('ok'),inn=mc.querySelector('.fp-in');
 const title=h3?h3.textContent.trim():'';
 if(!h3||!bd||!ft||!ok||!inn||!OK.test(title))return;
 /* 1. transaction number at the very top */
 const nd=NOS(title);let noF=null;
 if(nd){
  noF=document.createElement('input');noF.id='tx_no';noF.type='text';noF.value=noPeek(nd[1]);noF.dataset.pre=nd[1];
  noF.maxLength=30;noF.autocomplete='off';noF.spellcheck=false;noF.setAttribute('autocapitalize','characters');
  const lb=document.createElement('label');lb.textContent=nd[0];lb.htmlFor='tx_no';
  const cards=[...inn.children].filter(k=>k.classList.contains('fp-card'));
  if(cards.length>1){const c=document.createElement('div');c.className='fp-card fn-no';c.append(lb,noF);inn.insertBefore(c,inn.firstChild)}
  else (cards[0]||inn).prepend(lb,noF)}
 /* 2. one bottom bar: hide the old Cancel / Save footer (Save still runs through its button) */
 ft.style.setProperty('display','none','important');
 const bar=document.createElement('div');bar.className='fn-bar';
 const pv=document.createElement('button'),nx=document.createElement('button'),sv=document.createElement('button');
 pv.type=nx.type=sv.type='button';sv.className='fn-sv';sv.textContent='Save';pv.className='g';pv.textContent='Previous';nx.textContent='Next';nx.className='fn-nx';
 /* Save as draft + Cancel live in the old footer (added by drafts.js); the bar re-uses them */
 const df=document.createElement('button'),cn=document.createElement('button');
 df.type=cn.type='button';df.className=cn.className='g';df.textContent='Save as draft';cn.textContent='Cancel';df.hidden=true;
 df.onclick=()=>{const d=ft.querySelector('.dft');if(d)d.click()};
 cn.onclick=()=>{const c=[...ft.querySelectorAll('button')].find(b=>b.textContent.trim()=='Cancel');if(c)c.click();else closeM()};
 bar.append(cn,df,pv,nx,sv);mc.append(bar);
 setTimeout(()=>{df.hidden=!ft.querySelector('.dft')},0);
 bar.addEventListener('mousedown',e=>e.preventDefault()); /* keep the keyboard open while tapping */
 const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
 const fields=()=>[...bd.querySelectorAll('input,select,textarea')].filter(f=>!f.disabled&&!/^(hidden|file|checkbox|radio|button|submit)$/.test(f.type)&&f.getClientRects().length);
 let cur=null;
 function paint(){const L=fields(),i=L.indexOf(cur);pv.disabled=i<=0;nx.textContent=i>=0&&i==L.length-1?'Save':'Next';sv.hidden=nx.textContent=='Save'||!FT('savebtn')}
 function open(f){ /* dropdowns open straight away */
  if(f.tagName!='SELECT')return;
  try{if(f.classList.contains('sp'))srOpen(f);else if(typeof ddOk=='function'&&ddOk(f))ddOpen(f);else if(f.showPicker)f.showPicker()}catch(e){}}
 function focusF(f,dd){
  cur=f;const pick=dd&&f.tagName=='SELECT'; /* a dropdown that is about to open must not be closed by a scroll in progress */
  try{f.scrollIntoView({block:'center',behavior:reduce||pick?'auto':'smooth'})}catch(e){}
  try{f.focus({preventScroll:true})}catch(e){}
  if(f.select&&/^(text|number|search|tel|email)$/.test(f.type||''))try{f.select()}catch(e){}
  paint();if(pick)setTimeout(()=>open(f),90)}
 function mv(d){
  const L=fields(),a=L.includes(document.activeElement)?document.activeElement:cur,i=L.indexOf(a),j=i<0?(d>0?0:L.length-1):i+d;
  if(j<0||j>=L.length)return;focusF(L[j],d>0)}
 function save(){
  if(noF){const v=noF.value.trim(),lbl=nd[0];
   if(!v){toast('Enter '+lbl);focusF(noF);return}
   if(noTaken(v)){toast(lbl+' Already Used');focusF(noF);return}}
  ok.click()}
 pv.onclick=()=>mv(-1);sv.onclick=save;
 nx.onclick=()=>{const L=fields();if(cur&&L.length&&L[L.length-1]===cur)save();else mv(1)};
 bd.addEventListener('focusin',e=>{if(fields().includes(e.target)){cur=e.target;paint()}});
 bd.addEventListener('change',()=>setTimeout(paint,0));
 bd.addEventListener('keydown',e=>{
  if(e.key!='Enter'||e.defaultPrevented||e.target.tagName!='INPUT'||/^(button|checkbox|radio|file|submit)$/.test(e.target.type))return;
  const L=fields(),i=L.indexOf(e.target);if(i>-1&&i<L.length-1){e.preventDefault();mv(1)}});
 bd.querySelectorAll('input:not([type=date]):not([type=file]):not([type=checkbox])').forEach(i=>{if(!i.enterKeyHint)i.enterKeyHint='next'});
 paint();
 /* 3. start on the first field (the number for transactions) */
 setTimeout(()=>{const f=noF||fields()[0];if(f&&!bd.contains(document.activeElement))focusF(f)},120);
}
})();
