/* =====================================================================
 TradeLynin — Paid / Unpaid switch on every sale and purchase in the transaction lists  (loaded after cashcredit.js)
   Shown on All Transactions, Sales and Purchase. Unpaid by default (it simply shows the bill's real state).
   Paid  -> opens the Payment IN (sale) / Payment OUT (purchase) window filled in for the amount still due; saving it pays the bill.
   Unpaid-> removes the payment this switch created and the amount paid on the bill itself; Payment IN/OUT entries you made are kept but detached from the bill (after a confirmation).
 ===================================================================== */
const billDue=t=>tot(t).total-(N(t.paid)+alloc(t.id));
function billSwSync(){document.querySelectorAll('#v .sw2[data-bill]').forEach(s=>{const q=s.dataset.bill.split('|'),t=D[q[0]].find(x=>x.id==+q[1]);if(!t)return;const on=billDue(t)<=0.004;s.classList.toggle('on',on);s.setAttribute('aria-checked',on)})}
// Paid: opens the Payment IN / OUT window (date, account, amount, note…) already filled for this bill; the bill is paid when that is saved.
function billPay(a,id){const t=D[a].find(x=>x.id==id);if(!t||t.ret)return;const due=+billDue(t).toFixed(6);if(due<=0.004){billSwSync();return toast('Already paid')}
 if(!t.pid){billPayWalk(a,t,due);return}   // no customer / supplier on the bill: same window, saved on the bill itself
 const ty=a=='sa'?'in':'out',cm=closeM;
 closeM=function(){closeM=cm;const r=cm.apply(this,arguments);setTimeout(billSwSync,0);return r};   // cancelled -> slide the switch back
 payForm(ty,t.pid);
 if(!$('p_pid')){closeM=cm;billSwSync();return}
 const L=document.querySelector('#p_bl .line[data-id="'+id+'"]');
 $('p_amt').value=+due.toFixed(6);if(L)L.children[2].value=+due.toFixed(6);else payAuto();
 if(D.ac.some(x=>x.n==t.m))$('p_m').value=t.m;
 $('p_note').value='Settled '+t.no;
 const ok=$('ok'),old=ok.onclick;
 ok.onclick=()=>{const n=D.pay.length;old();if(D.pay.length>n){D.pay[D.pay.length-1].auto=id;save();go(1);toast(t.no+' marked paid · '+(a=='sa'?'Payment IN':'Payment OUT')+' saved')}}}
// Walk-in sale / purchase without a party: the same payment window, but the money is recorded on the bill itself.
function billPayWalk(a,t,due){if(ME&&ME.role=='viewer'){billSwSync();return toast('View-only access')}
 const c=a=='sa',cm=closeM;closeM=function(){closeM=cm;const r=cm.apply(this,arguments);setTimeout(billSwSync,0);return r};
 modal(`<h3>${c?'Receive Payment':'Pay Supplier'}</h3><div class="card pinfo"><div class="row"><span class="k">${esc(t.no)} · ${c?'Walk-In Customer':'No supplier'}</span><b>Due ${M(due)}</b></div></div><div class="f2"><div><label>Date</label><input id="w_date" type="date" value="${today()}"></div><div><label>Amount</label><input id="w_amt" type="number" step="any" value="${+due.toFixed(6)}"></div></div><label>${c?'Received in Account':'Paid from Account'}</label><select id="w_m">${MET}</select><label>Note (optional)</label><input id="w_note" value="Settled ${esc(t.no)}"><div class="row" style="margin-top:14px"><button class="g" onclick="closeM()">Cancel</button><button id="ok">Save</button></div>`);
 if(D.ac.some(x=>x.n==t.m))$('w_m').value=t.m;
 $('ok').onclick=()=>{const amt=N($('w_amt').value);if(amt<=0)return toast('Enter an Amount');if(amt>due+0.005)return toast('Amount Exceeds Bill Due');
  if(!N(t.paid))t.m=$('w_m').value;t.paid=+(N(t.paid)+amt).toFixed(6);t.apaid=+(N(t.apaid)+amt).toFixed(6);t.pdate=$('w_date').value||today();t.pnote=$('w_note').value;
  save();closeM();go(1);toast(t.no+' marked paid · '+M(amt)+' '+(c?'received':'paid'))}}
function billUnpay(a,id,yes){const t=D[a].find(x=>x.id==id);if(!t||t.ret)return;
 const hand=D.pay.filter(p=>p.auto!=id&&(p.al||[]).some(e=>e.id==id)),billPd=Math.max(0,N(t.paid)-N(t.apaid)),own=D.pay.some(p=>p.auto==id)||N(t.apaid)>0;
 if(!own&&!hand.length&&billPd<=0.004){billSwSync();return toast('Nothing to undo — this bill has no payment')}
 if((hand.length||billPd>0.004)&&!yes){   // money that was entered by hand: ask first
  const c=a=='sa',cm=closeM;closeM=function(){closeM=cm;const r=cm.apply(this,arguments);setTimeout(billSwSync,0);return r};
  modal(`<h3>Mark ${esc(t.no)} as unpaid?</h3><p class="k" style="margin:6px 0 0">${billPd>0.004?`The ${M(billPd)} paid on this ${c?'sale':'purchase'} will be removed. `:''}${hand.length?`${hand.length} ${c?'Payment IN':'Payment OUT'} entr${hand.length==1?'y':'ies'} will be kept but no longer applied to this bill (the money stays on the account of the ${c?'customer':'supplier'}). `:''}</p><div class="row" style="margin-top:14px"><button class="g" onclick="closeM()">Cancel</button><button id="yes">Mark Unpaid</button></div>`);
  $('yes').onclick=()=>{closeM=cm;closeM();billUnpay(a,id,1)};return}
 D.pay=D.pay.filter(p=>{if(p.auto!=id)return true;const al=p.al||[];if(al.every(e=>e.id==id))return false;p.al=al.filter(e=>e.id!=id);delete p.auto;return true});
 D.pay.concat((D.ls||[]).filter(l=>l.wo)).forEach(p=>{if((p.al||[]).some(e=>e.id==id))p.al=p.al.filter(e=>e.id!=id)});
 t.paid=0;delete t.apaid;
 save();go(1);toast(t.no+' marked unpaid')}
function billSw(el,a,id){el.classList.toggle('on');el.setAttribute('aria-checked',el.classList.contains('on'));   // slide first, then act
 const t=D[a].find(x=>x.id==id);if(!t)return;const paid=billDue(t)<=0.004;setTimeout(()=>paid?billUnpay(a,id):billPay(a,id),230)}
function billTg(a,id){if(!FT('paidsw'))return'';const t=D[a].find(x=>x.id==id);if(!t||t.ret)return'';const on=billDue(t)<=0.004;
 return`<div class="pt-tg np" onclick="event.stopPropagation()"><button type="button" class="sw2${on?' on':''}" role="switch" aria-checked="${on}" aria-label="Unpaid or Paid" data-bill="${a}|${id}" onclick="event.stopPropagation();billSw(this,'${a}',${id})"><i></i><span>Unpaid</span><span>Paid</span></button></div>`}
function billTgs(){if(!['alltx','sales','purchases'].includes(cur))return;
 document.querySelectorAll('#v .xr[data-bkd^="tx|"]').forEach(r=>{if(r.querySelector('.pt-tg'))return;const p=r.dataset.bkd.split('|'),a=p[1],id=+p[2];if(a!='sa'&&a!='pu')return;r.insertAdjacentHTML('beforeend',billTg(a,id))})}
const _stgo=go;go=function(){const r=_stgo.apply(this,arguments);try{billTgs()}catch(e){}return r};

/* =====================================================================
 Close (X) button in the header of every document preview (invoice, delivery note, statement)
 ===================================================================== */
const _dpX=docPage;docPage=function(a,b,c){const r=_dpX(a,b,c);try{const h=document.querySelector('#mc .fp-h');if(h&&!h.querySelector('.dc-x'))h.insertAdjacentHTML('beforeend',`<button type="button" class="g dc-x" aria-label="Close" onclick="closeM()">${ic('x',20)}</button>`)}catch(e){}return r};

// the first screen is drawn before this file loads, so add the switches to it now (otherwise they only appear after the next tap)
try{billTgs()}catch(e){}
