/* =====================================================================
 TradeLynin — bills: last purchase / last sale shown under each line   (loaded after settings2.js)
 ===================================================================== */
const lastSa=(pid,cid,ex)=>{let b=null;if(!cid)return b;D.sa.forEach(t=>{if(t.ret||t.id==ex||t.pid!=cid)return;t.items.forEach(i=>{if(i.pid==pid&&(!b||t.date>b.t.date||(t.date==b.t.date&&t.id>b.t.id)))b={t,i}})});return b};
const _li2=lnInfo;
lnInfo=function(){_li2();const sale=_k=='sa'||_k=='qt',cid=+(($('d_p')||{}).value)||0,ex=window._eid;
 document.querySelectorAll('#ln .line').forEach(r=>{const c=r.querySelector('.ci');if(!c)return;const pid=+r.children[0].value,p=D.p.find(z=>z.id==pid);if(!pid||!p)return;
  const us=r.querySelector('.us'),f=N(us&&us.value)||1,u=esc(f>1?p.u2:(p.u1||'Pcs'));let add='';
  if(sale&&FT('lastpur')){const S1=lastSa(pid,cid,ex);if(S1)add+=`<br>Last sold to this customer <b>${M(S1.i.p*f)}</b> / ${u} · ${S1.t.date}`}
  if(!sale&&!FT('lastpur'))c.innerHTML='';
  if(add)c.innerHTML=(c.innerHTML||'')+add})};

/* ---- discount visibility: how much was given, and how much of it went into the item prices ---- */
const _pick2=pick;pick=function(s){delete s.parentNode.dataset.op;_pick2(s)};
const _unitCh2=unitCh;unitCh=function(s){delete s.parentNode.dataset.op;_unitCh2(s)};
const _lines2=lines;
lines=function(){const L=_lines2(),R=vRows();L.forEach((l,i)=>{const r=R[i],op=N(r&&r.dataset.op);if(op>0){const lp=op/(l.f||1);if(lp>l.p+1e-9)l.lp=lp}});return L};
const dsGiven=()=>{const L=lines(),A=L.reduce((a,l)=>a+(l.lp!=null?l.q*(l.lp-l.p):0),0);return{A,gross:L.reduce((a,l)=>a+l.q*(l.lp!=null?l.lp:l.p),0),B:N(($('d_ds')||{}).value)}};
const _calc4=calc;
calc=function(nop){_calc4(nop);try{const tt=$('tt');if(!tt||!tt.children[0])return;const{A,gross,B}=dsGiven();if(A<0.004&&B<0.004)return;
 const r0=tt.children[0];if(A>=0.004){r0.querySelector('span').textContent='Subtotal (before discount)';r0.querySelector('b').textContent=M(gross)}
 r0.insertAdjacentHTML('afterend',`<div class="row"><span>Discount given</span><b class="ok">−${M(A+B)}</b></div>`+(A>=0.004?`<div class="k" style="text-align:right;margin:-4px 0 8px">${M(A)} applied to item prices${B>=0.004?' · '+M(B)+' as bill discount':''}</div>`:''))}catch(e){}};
const _li3=lnInfo;
lnInfo=function(){_li3();document.querySelectorAll('#ln .line').forEach(r=>{const c=r.querySelector('.ci'),op=N(r.dataset.op),pr=N(r.children[2].value),q=N(r.children[1].value);if(!c||!(op>pr+1e-9)||!(q>0))return;
 const p=D.p.find(z=>z.id==r.children[0].value)||{},us=r.querySelector('.us'),u=esc(N(us&&us.value)>1?p.u2:(p.u1||'Pcs'));
 c.innerHTML=(c.innerHTML||'')+`<br>Discount applied <b class="ok">−${M((op-pr)*q)}</b> · list price ${M(op)} → ${M(pr)} / ${u}`})};

/* ---- tidy layout for the summary under each line: one label/value row per fact ---- */
const LI_ROWS=['Purchase cost','Profit','Last purchased at','From this supplier:','Last purchase','Last sold to this customer','Discount applied','No earlier purchase'];
function liFmt(h){if(!h||!h.trim())return'';let rows='',chip='';
 const row=(l,v)=>rows+=`<div class="li-r"><span>${l.replace(/:$/,'')}</span><div>${v}</div></div>`;
 h.split('<br>').forEach(ln=>{ln=ln.trim();if(!ln)return;
  if(ln.startsWith('Purchase cost')){ln.split(' · ').forEach(t=>{const l=['Purchase cost','Profit'].find(x=>t.startsWith(x+' '));
    if(l)row(l,t.slice(l.length+1));
    else if(/^Qty /.test(t)){if(t.includes(' = '))row('Qty',t.slice(4))}   /* Qty is already in the field above — only the unit conversion is kept */
    else if(/^Margin /.test(t)){}                                          /* margin % is the same story as profit */
    else if(/Customer price/.test(t))chip='<span class="li-chip">Customer price</span>';
    else rows+=`<div class="li-n">${t}</div>`});return}
  const l=LI_ROWS.find(x=>ln.startsWith(x));
  if(!l){rows+=`<div class="li-n">${ln}</div>`;return}
  row(l,ln.slice(l.length).trim().replace(/^·\s*/,''))});
 return rows+chip}
const _li4=lnInfo;
lnInfo=function(){_li4();if(window._liOff)return;document.querySelectorAll('#ln .line .ci').forEach(c=>{c.classList.add('li');c.innerHTML=liFmt(c.innerHTML)})};
