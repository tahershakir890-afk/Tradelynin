/* =====================================================================
 TradeLynin v81  adjustable column widths in Products bulk edit (loaded after prod5.js)
   • Every column can be resized: drag the grip on the right edge of its heading (mouse, touch or pen),
     use ← / → when a grip is focused, or double-tap it to reset that column.
   • The  −  /  +  buttons above the table make ALL columns narrower / wider together; "Reset" restores all.
   • Widths are remembered on this device (tl_colw; the Item Name width keeps its old key tl_nmw).
 ===================================================================== */
const NM_KEY='tl_nmw',NM_DEF=180,NM_MIN=110,CW_KEY='tl_colw',CW_MIN=70,CW_MAX=520,CW_STEP=.12;
let NMW=(()=>{try{const v=+localStorage.getItem(NM_KEY);return v>=NM_MIN?v:NM_DEF}catch(e){return NM_DEF}})();
let CW=(()=>{try{const o=JSON.parse(localStorage.getItem(CW_KEY));return o&&typeof o=='object'?o:{}}catch(e){return{}}})();
const nmMax=()=>Math.max(NM_MIN,Math.min(460,(window.innerWidth||400)-90));
const nmClamp=w=>Math.round(Math.max(NM_MIN,Math.min(nmMax(),w)));
const cwClamp=w=>Math.round(Math.max(CW_MIN,Math.min(CW_MAX,w)));
function cwSave(){try{localStorage.setItem(NM_KEY,String(NMW));localStorage.setItem(CW_KEY,JSON.stringify(CW))}catch(e){}}
const cwRtl=()=>getComputedStyle(document.documentElement).direction=='rtl';
// heading text without the sort arrow, used as the column's memory key
const cwKey=th=>{let s='';th.childNodes.forEach(n=>{if(n.nodeType==3)s+=n.textContent});return s.trim()};
const cwTable=()=>cur=='products'&&_pr=='p'&&BE.p?document.querySelector('#v table.pt-t'):null;

/* a column is resizable when it has a heading and is not the tick-box column */
function cwCols(t){return[...t.rows[0].cells].map((th,i)=>({th,i,k:cwKey(th),nm:th.classList.contains('pt-nm'),fx:th.classList.contains('bkc')||!cwKey(th)}))}
function cwGet(t,c){return c.fx?t._nat[c.i]:c.nm?NMW:cwClamp(CW[c.k]!=null?CW[c.k]:t._nat[c.i])}
function cwSet(t,c,w){if(c.fx)return;if(c.nm)NMW=nmClamp(w);else CW[c.k]=cwClamp(w)}

/* write the widths into <colgroup> + fixed table layout */
function cwApply(t){
 const cs=t._cols;if(!cs)return;let sum=0;
 const ws=cs.map(c=>{const w=cwGet(t,c);sum+=w;return w});
 let cg=t.querySelector('colgroup');if(!cg){cg=document.createElement('colgroup');t.insertBefore(cg,t.firstChild)}
 cg.innerHTML=ws.map(w=>`<col style="width:${w}px">`).join('');
 t.style.setProperty('--nmw',NMW+'px');t.style.tableLayout='fixed';t.style.width=sum+'px';t.style.minWidth='0';
 cs.forEach(c=>{const g=c.th.querySelector('.col-rz');if(g){g.setAttribute('aria-valuenow',cwGet(t,c));g.setAttribute('aria-valuemin',c.nm?NM_MIN:CW_MIN)}})}

function cwGrip(t,c){
 const h=document.createElement('span');h.className='col-rz';h.setAttribute('role','separator');h.setAttribute('aria-orientation','vertical');
 h.setAttribute('aria-label','Resize '+(c.k||'column')+' column');h.tabIndex=0;h.title='Drag to resize · double-tap to reset';h.innerHTML='<b></b>';
 let x0=0,w0=0,on=false;
 h.addEventListener('click',e=>{e.stopPropagation();e.preventDefault()});
 h.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();e.stopPropagation();on=true;x0=e.clientX;w0=cwGet(t,c);
  try{h.setPointerCapture(e.pointerId)}catch(_){}h.classList.add('on');document.body.classList.add('nm-drag')});
 h.addEventListener('pointermove',e=>{if(!on)return;cwSet(t,c,w0+(e.clientX-x0)*(cwRtl()?-1:1));cwApply(t)});
 const end=e=>{if(!on)return;on=false;h.classList.remove('on');document.body.classList.remove('nm-drag');try{h.releasePointerCapture(e.pointerId)}catch(_){}cwSave()};
 h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end);h.addEventListener('lostpointercapture',end);
 h.addEventListener('dblclick',e=>{e.stopPropagation();cwSet(t,c,c.nm?NM_DEF:t._nat[c.i]);cwApply(t);cwSave()});
 h.addEventListener('keydown',e=>{const d=e.key=='ArrowRight'?10:e.key=='ArrowLeft'?-10:0;if(!d&&e.key!='Home')return;e.preventDefault();e.stopPropagation();
  cwSet(t,c,e.key=='Home'?(c.nm?NM_DEF:t._nat[c.i]):cwGet(t,c)+d*(cwRtl()?-1:1));cwApply(t);cwSave()});
 c.th.appendChild(h)}

function nmInit(){
 const t=cwTable();if(!t)return;
 if(!t._cols){
  // natural widths first (auto layout), so a column that was never touched keeps the width its content needs
  t.classList.remove('rz-on');t.style.tableLayout='';t.style.width='';
  const cs=cwCols(t);t._nat=cs.map(c=>c.fx?Math.round(c.th.getBoundingClientRect().width):Math.round(Math.max(CW_MIN+30,Math.min(260,c.th.getBoundingClientRect().width))));
  t._cols=cs;t.classList.add('rz-on');
  cs.forEach(c=>{if(c.fx)return;c.th.title=c.k;cwGrip(t,c)})}
 cwApply(t);
 const w=t.closest('.pt-w');
 if(w&&!document.querySelector('#v .cw-bar')){const b=document.createElement('div');b.className='cw-bar';
  b.innerHTML='<span class="cw-l">Column width</span><button type="button" class="g s cw-b" onclick="cwStep(-1)" aria-label="Make all columns narrower">−</button><button type="button" class="g s cw-b" onclick="cwStep(1)" aria-label="Make all columns wider">+</button><button type="button" class="g s cw-r" onclick="cwReset()">Reset</button>';
  w.parentNode.insertBefore(b,w)}}

/* all columns together */
function cwStep(d){const t=cwTable();if(!t||!t._cols)return;
 t._cols.forEach(c=>{if(!c.fx)cwSet(t,c,cwGet(t,c)*(1+d*CW_STEP))});cwApply(t);cwSave()}
function cwReset(){const t=cwTable();if(!t||!t._cols)return;NMW=NM_DEF;CW={};cwApply(t);cwSave()}

const _bi45=bulkInit;
bulkInit=function(){_bi45();try{nmInit()}catch(e){}};
window.addEventListener('resize',()=>{const t=cwTable();if(t&&t._cols){NMW=nmClamp(NMW);cwApply(t)}});
try{if(cwTable())nmInit()}catch(e){}
