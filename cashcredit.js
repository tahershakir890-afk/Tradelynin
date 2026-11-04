/* =====================================================================
 TradeLynin — Cash / Credit switch in the header of Sale and Purchase forms  (loaded after print2.js)
   Credit (default for every new bill): "Paid Now" stays as typed (0 = unpaid).
   Cash: the bill is paid in full — "Paid Now" follows the total automatically.
 ===================================================================== */
window._cc='cr';
function ccTotal(){try{return tot({items:lines(),disc:($('d_ds')||{}).value,tax:window._tx}).total}catch(e){return 0}}
function ccSync(){const d=$('d_pd');if(!d||window._cc!='cash')return;d.value=+ccTotal().toFixed(6)}
function ccSet(m){window._cc=m;const d=$('d_pd');
 document.querySelectorAll('#mc .sw2.cc').forEach(b=>{b.classList.toggle('on',m=='cash');b.setAttribute('aria-checked',m=='cash')});
 if(!d)return;if(m=='cash'){d.readOnly=true;d.classList.add('cc-ro');ccSync()}else{d.readOnly=false;d.classList.remove('cc-ro');d.value=0}}
const _cc0=calc;calc=function(nop){_cc0(nop);ccSync()};
const _ccdoc=doc;doc=function(kind,ret,id,src){_ccdoc.apply(this,arguments);window._cc='cr';if(kind=='qt'||!FT('cashsw'))return;
 const hd=document.querySelector('#mc .fp-h');if(!hd||hd.querySelector('.sw2'))return;
 hd.insertAdjacentHTML('beforeend','<button type="button" class="sw2 cc" role="switch" aria-checked="false" aria-label="Credit or Cash"><i></i><span>Credit</span><span>Cash</span></button>');
 hd.querySelector('.sw2.cc').onclick=()=>ccSet(window._cc=='cash'?'cr':'cash');
 const o=id?D[kind].find(x=>x.id==id):null;if(o&&N(o.paid)>0&&N(o.paid)>=tot(o).total-0.005)ccSet('cash')};
