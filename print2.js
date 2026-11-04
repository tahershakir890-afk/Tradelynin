/* =====================================================================
 TradeLynin — invoice-style print layout for the Cash & Bank statements; A4 preview  (loaded after drafts.js)
   Uses the same design as invoices and customer statements (logo, business details, summary strip, table, footer)
   and follows Settings → Print settings (paper, orientation, text size, what to show).
 ===================================================================== */
const dcKpi=a=>`<div class="dc-kpi">${a.map((x,i)=>`<div${x[2]?' class="hl"':''}><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>`;
/* ---- Cash & Bank account statement ---- */
function acStmtHtml(id,f,t){const a=D.ac.find(x=>x.id==id),E=acEv().filter(x=>x.m==a.n).sort((p,q)=>p.d<q.d?-1:p.d>q.d?1:0);
 let r=N(a.open)+E.filter(x=>f&&x.d<f).reduce((s,x)=>s+N(x.i)-N(x.o),0);const op=r,V=E.filter(x=>(!f||x.d>=f)&&(!t||x.d<=t)),ti=V.reduce((s,x)=>s+N(x.i),0),to=V.reduce((s,x)=>s+N(x.o),0);
 const rows=[['',`<b>${f?L('Balance brought forward','رصيد مرحّل'):L('Opening Balance','رصيد افتتاحي')}</b>`,'','',nf(op)],...V.map(x=>[`<span class="dt">${x.d}</span>`,esc(x.t),x.i?nf(x.i):'',x.o?nf(x.o):'',nf(r+=N(x.i)-N(x.o))])];
 return dcDir(dcHead(L('ACCOUNT STATEMENT','كشف حساب'),`<span class="dc-sub">${f||(V[0]&&V[0].d)||today()} → ${t||today()}</span>`)
  +dcParty(L('Account','الحساب'),a.n)
  +dcKpi([[f?L('Brought forward','مرحّل'):L('Opening Balance','رصيد افتتاحي'),nf(op)],[L('In','وارد'),nf(ti)],[L('Out','صادر'),nf(to)],[L('Balance','الرصيد'),M(r),1]])
  +dcTable([L('Date','التاريخ'),L('Details','التفاصيل'),'#'+L('In','وارد'),'#'+L('Out','صادر'),'#'+L('Balance','الرصيد')],rows)
  +`<div class="dc-thx">${L('Generated on','أُنشئ في')} ${today()} · ${esc(S.name)}</div>`)}
function acStmtDoc(id,f,t){const a=D.ac.find(x=>x.id==id);if(!a)return;docPage(L('Statement','كشف حساب'),acStmtHtml(id,f,t),dcBtn('back','Back',`acStmt(${id},'${f}','${t}')`)+dcBtn('print','Print','window.print()')+dcBtn('pdf','Share PDF',`acStmtPdf(${id},'${f}','${t}')`,'dc-p'))}
function acStmtPdf(id,f,t){const a=D.ac.find(x=>x.id==id);return pdfDoc(acStmtHtml(id,f,t),'Statement-'+a.n.replace(/[^\w]+/g,'_')+'-'+today()+'.pdf','',S.name+' — '+a.n+': statement attached.')}
const _p2acs=acStmt;acStmt=function(id,f='',t=''){_p2acs(id,f,t);const b=[...$('mc').querySelectorAll('button')].find(x=>x.textContent.trim()=='Print');if(b)b.setAttribute('onclick',`acStmtDoc(${id},'${f}','${t}')`)};

/* ---- document preview shows the real A4 page (794px = 210mm), scaled to fit the screen; zoom with − / + / Fit or pinch. Printing is unchanged ---- */
function a4Fit(){const mc=$('mc');if(!mc)return;const p=mc.querySelector('.dc-paper.pp-a4,.dc-paper[data-pw]');if(!p||p.classList.contains('a4v'))return;const PW=+p.dataset.pw||794;
 const host=p.parentElement,w=document.createElement('div'),s=document.createElement('div'),bar=document.createElement('div');
 w.className='a4w';s.className='a4s';bar.className='a4z np';
 bar.innerHTML='<button type="button" class="g" aria-label="Zoom out" data-z="-1">−</button><span class="a4p">100%</span><button type="button" class="g" aria-label="Zoom in" data-z="1">+</button><button type="button" class="g" data-z="0">Fit</button>';
 p.before(bar);bar.after(w);w.append(s);s.append(p);p.classList.add('a4v');p.style.width=PW+'px';
 let k=0,fitK=1,fitted=true;const MIN=.3,MAX=3,clamp=v=>Math.min(MAX,Math.max(MIN,v));
 const pct=()=>{bar.querySelector('.a4p').textContent=Math.round(k/fitK*100)+'%'};
 const apply=(nk,cx)=>{const old=k||nk;cx=cx==null?w.clientWidth/2:cx;const docX=(w.scrollLeft+cx)/old;k=clamp(nk);p.style.transform='scale('+k+')';s.style.width=(PW*k)+'px';s.style.height=(p.offsetHeight*k)+'px';w.scrollLeft=docX*k-cx;pct()};
 const measure=()=>{if(!w.isConnected)return;const cs=getComputedStyle(host),av=host.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);fitK=Math.min(1,Math.max(.2,av/PW));if(fitted||!k)apply(fitK,0);else{apply(k);}pct()};
 bar.onclick=e=>{const b=e.target.closest('button');if(!b)return;const z=+b.dataset.z;if(z==0){fitted=true;apply(fitK,0);w.scrollLeft=0;return}fitted=false;apply(k*(z>0?1.25:.8))};
 let d0=0,k0=0;
 w.addEventListener('touchstart',e=>{if(e.touches.length==2){d0=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);k0=k}},{passive:true});
 w.addEventListener('touchmove',e=>{if(e.touches.length!=2||!d0)return;e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),r=w.getBoundingClientRect();fitted=false;apply(k0*d/d0,(e.touches[0].clientX+e.touches[1].clientX)/2-r.left)},{passive:false});
 w.addEventListener('touchend',e=>{if(e.touches.length<2)d0=0},{passive:true});
 measure();requestAnimationFrame(measure);setTimeout(measure,250);addEventListener('resize',measure)}
const _p2dp=docPage;docPage=function(a,b,c){const r=_p2dp(a,b,c);try{a4Fit()}catch(e){}return r};
