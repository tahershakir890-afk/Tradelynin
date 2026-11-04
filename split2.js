/* =====================================================================
 TradeLynin — bill discount: "Undo split"  (loaded after drafts.js)
   "Split automatically" moves the bill discount into the item prices and leaves the discount box at 0.
   Undo split puts every item back to its list price and returns the whole discount to the box,
   so you can change it, remove it, or split it again. Works on new bills and when editing saved bills.
 ===================================================================== */
const _dsPanel0=dsPanel;
dsPanel=function(){_dsPanel0();const t=$('dst');if(!t)return;let A=0;try{A=dsGiven().A}catch(e){}
 if(A>=0.004)t.innerHTML+=`<div class="ds-undo"><p class="k">${M(A)} of the discount is inside the item prices.</p><button type="button" class="s ds-un" onclick="dsUndo()">Undo split</button></div>`};
function dsUndo(){let A=0;
 document.querySelectorAll('#ln .line').forEach(r=>{const op=N(r.dataset.op),pr=N(r.children[2].value),q=N(r.children[1].value);
  if(op>pr+1e-9&&q>0){A+=(op-pr)*q;r.children[2].value=+op.toFixed(6)}delete r.dataset.op});
 const d=$('d_ds');if(!d)return;d.value=+(N(d.value)+A).toFixed(6);calc();
 toast(A>=0.004?'Split undone — '+M(A)+' is back in the discount box':'Nothing to undo')}
