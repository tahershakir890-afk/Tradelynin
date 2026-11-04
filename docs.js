/* =====================================================================
 TradeLynin — documents & parties (loaded after app.js)
 Replaces these functions from app.js with the new designs:
   invoice(id)   full-page invoice / quotation / return / purchase preview
   dnote(id)     delivery note
   stmtHtml/stmt statement of account (preview + PDF body)
   stmtPdf       share / save statement as PDF
   invPdf(id)    share / save invoice as PDF
   pMenu(t,id)   customer / supplier details sheet
   V.parties     party list (clean cards, no extra text rows)
 Styles live at the end of css/overrides.css  (.dc-*  .pm-*  .pl-*)
 ===================================================================== */

const IC={
 back:'<path d="M15 5l-7 7 7 7"/>',
 share:'<path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M12 15V3"/><path d="M7.5 7.5L12 3l4.5 4.5"/>',
 print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 truck:'<path d="M2 6h11v10H2z"/><path d="M13 9h4l4 4v3h-8z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
 pdf:'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/><path d="M9 14h6M9 18h4"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
 trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
 tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
 phone:'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
 pin:'<path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 stmt:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>'
};
const ic=(n,s=20)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;
const nf=v=>M(v).slice(S.cur.length+1);                       // amount without the currency (table cells)
const initials=n=>{const w=String(n||'?').trim().split(/\s+/).filter(Boolean);return((w[0]||'?')[0]+(w.length>1?w[1][0]:'')).toUpperCase()};
const hue=n=>{let h=0;for(const c of String(n))h=(h*31+c.charCodeAt(0))%360;return h};
const avatar=(n,big)=>`<span class="av${big?' lg':''}" style="--h:${hue(n)}">${esc(initials(n))}</span>`;

/* ---------- full-page document viewer ---------- */
function docPage(title,paper,foot){
 const m=$('m'),mc=$('mc');srClose();m.classList.add('full');
 mc.innerHTML=`<div class="fp-h"><button type="button" class="g fp-bk" aria-label="Back" onclick="closeM()">${ic('back',22)}</button><h3>${esc(title)}</h3></div><div class="fp-body"><div class="fp-in dc-in">${paper}</div></div><div class="fp-f dc-f">${foot}</div>`;
 m.style.display='flex';mc.querySelector('.fp-body').scrollTop=0}
const dcBtn=(i,t,fn,cls)=>`<button type="button" class="dc-b ${cls||''}" onclick="${fn}">${ic(i,20)}<span>${t}</span></button>`;

function dcHead(kind,sub){const pr=PR(),brand=(pr.logo?`<div class="dc-logo"><img src="${S.logo||LOGO}" alt=""></div>`:'')+((pr.name||(pr.addr&&S.addr)||(pr.ph&&S.ph))?`<div class="dc-co">${pr.name?`<b>${esc(S.name)}</b>`:''}${pr.addr&&S.addr?`<span>${L('Address','العنوان')}: ${esc(S.addr)}</span>`:''}${pr.ph&&S.ph?`<span>${L('Contact No.','رقم الاتصال')} ${esc(S.ph)}</span>`:''}</div>`:'');
 return`<div class="dc-top"><div class="dc-ty"><div class="dc-kind">${kind}</div>${sub||''}</div>${brand?`<div class="dc-brand">${brand}</div>`:''}</div>`}
const dcMeta=a=>`<div class="dc-meta">${a.filter(x=>x&&x[1]).map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>`;
const dcParty=(lbl,name,P)=>`<div class="dc-party"><span class="dc-lb">${lbl}</span><b>${esc(name)}</b>${PR().pty&&P&&P.ph?`<span>${esc(P.ph)}</span>`:''}${PR().pty&&P&&P.ad?`<span>${esc(P.ad)}</span>`:''}</div>`;
const dcTable=(cols,rows,ix)=>`<div class="dc-tw"><table class="dc-t${ix?' ix':''}"><thead><tr>${cols.map(c=>`<th class="${c[0]=='#'?'n':''}">${c.replace('#','')}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${cols[i][0]=='#'?'n':''}">${c}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${cols.length}" class="dc-em">—</td></tr>`}</tbody></table></div>`;
const dcSign=(a,b)=>!PR().sign?'':`<div class="dc-sign"><div><i></i><span>${a}</span></div><div><i></i><span>${b}</span></div></div>`;
const dcDir=(h,gs)=>`<div class="dc-paper pp-${PR().paper} po-${PR().o||'p'} pf-${PR().fs}${h.includes('class="iv"')?' dc-inv':''}${gs&&window._dcGs?(window._dcBw?' dc-bw':' dc-gs'):''}" ${S.lang=='ar'?'dir="rtl"':''}>${h}</div>`;

/* ---------- invoice / quotation / return / purchase ---------- */
const getTx=id=>D.sa.find(x=>x.id==id)||D.pu.find(x=>x.id==id)||QT().find(x=>x.id==id);
const fillTbl=h=>h.replace('</tbody>','<tr class="dc-fill">'+'<td></td>'.repeat((h.match(/<th[ >]/g)||[]).length)+'</tr></tbody>');
/* ---- v50: premium invoice / voucher layout (.iv-*) — styles in css/v50.css ---- */
const dcDate=d=>{const x=new Date(String(d||'')+'T00:00:00Z');return isNaN(x)?String(d||''):'<bdi dir="ltr">'+x.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'})+'</bdi>'};
const dcShort=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(d||''));return m?m[3]+'/'+m[2]:''};
/* share title + photo caption:  DD/MM - INV-111/Raj Traders */
const dcShareTitle=(date,no,party)=>dcShort(date)+' - '+no+'/'+party;
const dcFile=s=>String(s).replace(/\//g,'-').replace(/[\\:*?"<>|]+/g,'').replace(/\s+/g,' ').trim();
function ivHead(kind,no){const pr=PR(),lg=pr.logo?`<div class="iv-logo"><img src="${S.logo||LOGO}" alt=""></div>`:'',
 co=(pr.name||(pr.addr&&S.addr)||(pr.ph&&S.ph))?`<div class="iv-co">${pr.name?`<b>${esc(S.name)}</b>`:''}${pr.addr&&S.addr?`<span>${esc(S.addr)}</span>`:''}${pr.ph&&S.ph?`<span>${L('Contact No.','رقم الاتصال')} ${esc(S.ph)}</span>`:''}</div>`:'';
 return`<div class="iv-top"><div class="iv-ty"><div class="iv-kind">${kind}</div>${no?`<div class="iv-no">${no}</div>`:''}</div><div class="iv-brand">${co}${lg}</div></div>`}
const ivParty=(lbl,name,P)=>`<div class="iv-bill"><span class="iv-lb">${lbl}</span><b>${esc(name)}</b>${PR().pty&&P&&P.ph?`<span>${esc(P.ph)}</span>`:''}${PR().pty&&P&&P.ad?`<span>${esc(P.ad)}</span>`:''}</div>`;
const ivMeta=a=>`<div class="iv-meta">${a.filter(x=>x&&x[1]).map(x=>`<span>${x[0]}</span><b>${x[1]}</b>`).join('')}</div>`;
const ivTable=(cols,rows,cls,foot)=>`<table class="iv-t${cls?' '+cls:''}"><thead><tr>${cols.map((c,i)=>`<th class="${i&&c[0]=='#'?'n':''}${i==0?' c0':''}">${i?c.replace('#',''):c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i&&cols[i][0]=='#'?'n':''}${i==0?' c0':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>${foot||''}</table>`;
const ivNote=n=>n&&FT('invnote')?`<div class="iv-note"><span class="iv-lb">${L('Note','ملاحظة')}</span><p>${esc(n)}</p></div>`:'';
const ivFoot=(a,b,thx)=>`<div class="iv-foot">${PR().sign?`<div class="iv-sign"><div><i></i><span>${a}</span></div><div><i></i><span>${b}</span></div></div>`:''}${thx?`<div class="iv-thx">${thx}</div>`:''}</div>`;
/* ---- v55: paper sizes for invoices (A4 · A5 · A6 · 80 mm · 58 mm · custom) and vouchers (A5 · A6 · A7) ---- */
const DCPAP={a4:['A4',210,297],a5:['A5',148,210],a6:['A6',105,148],a7:['A7',74,105],t80:['80 mm',80,0],t58:['58 mm',58,0],cus:['Custom',0,0]},DCKINDS={i:['a4','a5','a6','t80','t58','cus'],v:['a5','a6','a7']};
const dcPPget=()=>{try{return JSON.parse(localStorage.getItem('tl_pp'))||{}}catch(e){return{}}};
const dcPPput=o=>{try{localStorage.setItem('tl_pp',JSON.stringify(o))}catch(e){}window._ppm=o};
function dcPS(kind){const pr=PR(),q=Object.assign({},dcPPget(),window._ppm||{}),keys=DCKINDS[kind];let k=kind=='i'?q.ip:q.vp;
 if(!k||keys.indexOf(k)<0)k=kind=='i'?(keys.indexOf(pr.paper)>=0?pr.paper:'a4'):'a5';
 let w,h;if(k=='cus'){w=Math.min(330,Math.max(40,+q.cw||100));h=+q.ch||0;if(h)h=Math.min(500,Math.max(60,h))}else{w=DCPAP[k][1];h=DCPAP[k][2]}
 if(kind=='v'){const t0=w;w=h;h=t0}
 const px=m=>m*96/25.4,fz={s:.9,n:1,l:1.1}[pr.fs]||1;
 let s=k=='t80'?.92:k=='t58'?.8:Math.min(1,Math.max(.5,Math.sqrt((kind=='v'?Math.min(w,h*1.414):w)/210)));if(kind=='v')s*={a7:.82,a6:.93}[k]||1;s=Math.round(s*fz*100)/100;
 const th=!h,pd=dcTplGet(kind)?'0':th?'8px 8px 10px':`${Math.round(34*Math.max(.55,s))}px ${Math.round(38*Math.max(.55,s))}px ${Math.round(30*Math.max(.55,s))}px`;
 return{k,kind,w,h,wpx:Math.round(px(w)),hpx:h?Math.round(px(h)):0,wpt:w*72/25.4,hpt:h?h*72/25.4:0,nar:w<=95,th,s,pd,tpl:!!dcTplGet(kind),name:k=='cus'?w+(h?'×'+h:'')+' mm':DCPAP[k][0]}}
const kind_cls=ps=>ps.kind=='v'?' ivv':'';
const dcDirP=(h,ps,gs)=>`<div class="dc-paper dc-inv ivp ivk-${ps.k}${ps.nar?' nar':''}${ps.tpl?' tpl':''}${kind_cls(ps)}${ps.hpx?' fx':' au'}${gs&&window._dcGs?(window._dcBw?' dc-bw':' dc-gs'):''}" data-pw="${ps.wpx}" data-ph="${ps.hpx}" style="width:${ps.wpx}px;${ps.hpx?'min-height:'+(ps.hpx-3)+'px;':''}padding:${ps.pd};--s:${ps.s};--wmm:${ps.w};--hmm:${ps.h}" ${S.lang=='ar'?'dir="rtl"':''}>${h}</div>`;
function ppBar(kind,redo){const ps=dcPS(kind);window._ppRedo=redo;
 return`<div class="dc-pp np" role="group" aria-label="Paper size">${DCKINDS[kind].map(k=>`<button type="button" class="${ps.k==k?'on':''}" onclick="ppSet('${kind}','${k}')">${DCPAP[k][0]}</button>`).join('')}</div>`
 +(ps.k=='cus'?`<div class="dc-ppc np"><label>Width<input id="pp_w" type="number" inputmode="decimal" min="40" max="330" value="${ps.w}"></label><label>Height<input id="pp_h" type="number" inputmode="decimal" min="0" max="500" value="${ps.h}"></label><button type="button" onclick="ppCus()">Apply</button><small>mm · height 0 = auto length (roll)</small></div>`:'')}
function ppSet(kind,k){const o=Object.assign({},dcPPget(),window._ppm||{});o[kind=='i'?'ip':'vp']=k;dcPPput(o);window._ppRedo&&window._ppRedo()}
function ppCus(){const o=Object.assign({},dcPPget(),window._ppm||{}),w=+$('pp_w').value,h=+$('pp_h').value;if(!(w>=40&&w<=330))return toast('Width must be 40–330 mm');if(h&&!(h>=60&&h<=500))return toast('Height must be 0 (auto) or 60–500 mm');o.cw=w;o.ch=h||0;dcPPput(o);window._ppRedo&&window._ppRedo()}
/* @page for the open document so Print uses the same size as the preview */
function ppPrint(ps){const e=$('prs');if(!e)return;e.textContent=`@page{size:${ps.w}mm ${ps.h?ps.h+'mm':'auto'};margin:0}`}
/* amount in words (English) */
function numWords(v){const o=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],t=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'],B=[[1e9,'Billion'],[1e6,'Million'],[1e3,'Thousand']];
 const sp=n=>{let r='';B.forEach(b=>{if(n>=b[0]){r+=sp(Math.floor(n/b[0]))+' '+b[1]+' ';n%=b[0]}});if(n>=100){r+=o[Math.floor(n/100)]+' Hundred ';n%=100}if(n>=20){r+=t[Math.floor(n/10)]+(n%10?'-'+o[n%10]:'')+' '}else if(n>0)r+=o[n]+' ';return r.trim()};
 v=Math.abs(+v||0);const d=dec(),f=Math.pow(10,d),r=Math.round(v*f),i=Math.floor(r/f),fr=r-i*f;if(i>=1e12)return'';
 return S.cur+' '+(i?sp(i):'Zero')+(fr?' and '+String(fr).padStart(d,'0')+'/'+f:'')+' Only'}
/* boxed grid: header + rows, a filler that carries the column lines down, then a totals block pinned at the bottom (label left, amount right) */
function ivGrid(cols,rows,wd,sumRows,o){o=o||{};const keep=wd.map((x,i)=>i>0||!o.nar),W=wd.filter((x,i)=>keep[i]),cg=wd.map((x,i)=>`<col class="${i==0?'c0':''}" style="width:${x}%">`).join(''),A=wd[wd.length-1];
 const it=`<table class="iv-t iv-it"><colgroup>${cg}</colgroup><thead><tr>${cols.map((c,i)=>`<th class="${i&&c[0]=='#'?'n':''}${i==0?' c0':''}">${i?c.replace('#',''):c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i&&cols[i][0]=='#'?'n':''}${i==0?' c0':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
 fill=o.fill===false?'':`<div class="iv-fill" style="grid-template-columns:${W.map(x=>x+'%').join(' ')}">${W.map(()=>'<i></i>').join('')}</div>`,
 ft=sumRows&&sumRows.length?`<table class="iv-t iv-ft"><colgroup><col style="width:${100-A}%"><col style="width:${A}%"></colgroup><tbody>${sumRows.map(r=>`<tr class="${r[2]?'ivst':''}"><td class="sl">${r[0]}</td><td class="n">${r[1]}</td></tr>`).join('')}</tbody></table>`:'';
 return`<div class="iv-box">${it}${fill}${ft}</div>`}
function invHtml(t,ps){ps=ps||dcPS('i');
 const qq=QT().includes(t),sale=D.sa.includes(t)||qq,T=tot(t),P=(sale?D.c:D.s).find(x=>x.id==t.pid);
 const paid=N(t.paid)+alloc(t.id),due=T.total-paid;
 const kind=qq?L('Quotation','عرض سعر'):t.ret?(sale?L('Sales return','مرتجع مبيعات'):L('Purchase return','مرتجع مشتريات')):sale?L('Invoice','فاتورة'):L('Purchase invoice','فاتورة مشتريات');
 /* due date only when the customer has credit days; no default credit period */
 let dueDate='';if(sale&&!qq&&!t.ret&&P&&due>0.004&&cdays(P)>0){dueDate=new Date(Date.parse(t.date)+cdays(P)*864e5).toISOString().slice(0,10)}
 const unit=i=>i.uq?esc(i.u||''):esc((D.p.find(p=>p.id==i.pid)||{}).u1||'');
 const rows=t.items.map((i,k)=>[String(k+1),`<b>${esc(i.n)}</b>`,`${i.uq||i.q} <small>${unit(i)}</small>`,i.uq?nf(i.up):nf(i.p),nf(i.q*i.p)]);
 const gl=t.items.reduce((a,i)=>a+i.q*(i.lp!=null&&i.lp>i.p?i.lp:i.p),0),ap=gl-T.sub,sum=ap>0.004?[[L('Subtotal (before discount)','المجموع قبل الخصم'),nf(gl)],[L('Discount given','الخصم الممنوح'),'−'+nf(ap+N(t.disc))]]:[[L('Subtotal','المجموع'),nf(T.sub)]];
 if(ap<=0.004&&t.disc)sum.push([L('Discount','الخصم'),'−'+nf(t.disc)]);
 if(t.tax)sum.push([`${L('VAT','ضريبة')} ${t.tax}%`,nf(T.tax)]);
 const thx=PR().thx?(qq?L('This quotation is subject to stock availability.','هذا العرض يخضع لتوفر البضاعة.'):PR().thxt?esc(PR().thxt):L('Thank you for your business.','شكراً لتعاملكم معنا.')):'';
 if(dcTplGet('i'))return tplInv(dcTplGet('i'),{t,kind,sale,qq,T,P,paid,due,dueDate,rows,sum,thx});
 return'<div class="iv">'+ivHead(kind,esc(t.no))
  +'<div class="iv-info">'+ivParty(sale?L('Billed to','العميل'):L('Supplier','المورد'),P?P.n:L('Walk-In Customer','عميل نقدي'),P)
  +ivMeta([[L('Date','التاريخ'),dcDate(t.date)],[L('Due date','تاريخ الاستحقاق'),PR().due&&dueDate?dcDate(dueDate):''],[L('Payment','الدفع'),paid>0.004&&t.m?esc(t.m):'']])+'</div>'
  +'<div class="iv-main">'+ivGrid(['#',L('Item','الصنف'),'#'+L('Qty','الكمية'),'#'+L('Price','السعر'),'#'+L('Amount','المبلغ')],rows.length?rows:[['','—','','','']],ps.nar?[0,36,14,20,30]:ps.w<130?[7,35,13,19,26]:[7,41,14,17,21],sum.concat([[L('Total','الإجمالي'),M(T.total),1]]),{nar:ps.nar,fill:!ps.th})+'</div>'+ivNote(t.note)
  +ivFoot(L('Authorized signature','التوقيع المعتمد'),sale?L('Received by','استلمها'):L('Supplier signature','توقيع المورد'),thx)+'</div>'}

/* ---- Color / Greyscale choice (used before sharing a PDF or photo) ---- */
window._dcMode=(()=>{try{const v=localStorage.getItem('tl_dcgs');return v=='2'?2:v=='1'?1:0}catch(e){return 0}})();window._dcGs=window._dcMode>0;window._dcBw=window._dcMode==2;
const dcClrBar=()=>`<div class="dc-clr np" role="group" aria-label="${L('Colour','اللون')}"><button type="button" data-c="c" class="${window._dcGs?'':'on'}" onclick="dcClr(0)"><i></i>${L('Color','ملوّن')}</button><button type="button" data-c="g" class="${window._dcGs?'on':''}" onclick="dcClr(1)"><i></i>${L('Greyscale','رمادي')}</button></div>`;
function dcClr(g){g=+g||0;window._dcMode=g;window._dcGs=g>0;window._dcBw=g==2;try{localStorage.setItem('tl_dcgs',g?String(g):'')}catch(e){}
 document.querySelectorAll('#mc .dc-clr button').forEach(b=>b.classList.toggle('on',(b.dataset.c=='c'?0:b.dataset.c=='g'?1:2)==g));
 document.querySelectorAll('#mc .dc-paper.dc-inv').forEach(p=>{p.classList.toggle('dc-gs',g==1);p.classList.toggle('dc-bw',g==2)})}
/* html2canvas cannot apply CSS filters, so greyscale is applied to the rendered page image itself */
function dcGrey(cv){const x=cv.getContext('2d'),W=cv.width,H=cv.height,B=256;
 for(let y=0;y<H;y+=B){const h=Math.min(B,H-y),im=x.getImageData(0,y,W,h),d=im.data;for(let i=0;i<d.length;i+=4){let g=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)|0;if(window._dcBw)g=g<212?0:255;d[i]=d[i+1]=d[i+2]=g}x.putImageData(im,0,y)}
 return cv}
function invoice(id){
 const t=getTx(id);if(!t)return;const qq=QT().includes(t),sale=D.sa.includes(t)||qq,ps=dcPS('i');
 docPage(qq?L('Quotation','عرض سعر'):t.no,dcToolbar('i',()=>invoice(id))+dcDirP(invHtml(t,ps),ps,1),
  (sale&&!qq&&!t.ret?dcBtn('truck','Delivery',`dnote(${id})`):'')+(phOf(t).length?dcBtn('photo','Photos',`phShowRec('tx',${id})`):'')+dcPrintBtn('i')+dcShareBtn('i',{photo:`invPhoto(${id})`,pdf:`invPdf(${id})`}));ppPrint(ps)}
function dnote(id){
 const t=D.sa.find(x=>x.id==id);if(!t)return;const P=D.c.find(x=>x.id==t.pid);
 const unit=i=>i.uq?esc(i.u||''):esc((D.p.find(p=>p.id==i.pid)||{}).u1||'');
 const h=dcHead(L('DELIVERY NOTE','سند تسليم'))+dcMeta([[L('No.','الرقم'),esc(t.no)],[L('Date','التاريخ'),t.date]])+dcParty(L('Deliver to','المستلم'),P?P.n:L('Walk-In Customer','عميل نقدي'),P)
  +dcTable([L('No.','#'),L('Item','الصنف'),'#'+L('Qty','الكمية')],t.items.map((i,k)=>[String(k+1),`<b>${esc(i.n)}</b>`,`${i.uq||i.q} <small>${unit(i)}</small>`]),1)
  +dcSign(L('Delivered by','سلّمها'),L('Received by','استلمها'));
 docPage(L('Delivery Note','سند تسليم'),dcDir(h),dcBtn('back','Back',`invoice(${id})`)+dcBtn('print','Print','window.print()','dc-p'))}

/* ---------- statement of account ---------- */
function stmtHtml(t,id){
 const e=entries(t,id),P=(t=='c'?D.c:D.s).find(x=>x.id==id),c=t=='c';
 const dr=e.L.reduce((s,x)=>s+N(x.inc),0),cr=e.L.reduce((s,x)=>s+N(x.dec),0),from=e.asof||(e.L[0]&&e.L[0].d)||today();
 const dt=d=>d?`<span class="dt">${d}</span>`:'';const rows=[[dt(e.asof),'<b>'+L('Opening Balance','رصيد افتتاحي')+'</b>','','',nf(e.open)],...e.L.map(x=>[dt(x.d),esc(x.t),x.inc?nf(x.inc):'',x.dec?nf(x.dec):'',nf(x.b)])];
 return dcDir(dcHead(L('STATEMENT OF ACCOUNT','كشف حساب'),`<span class="dc-sub">${from} → ${today()}</span>`)
  +dcParty(c?L('Customer','العميل'):L('Supplier','المورد'),P.n,P)
  +`<div class="dc-kpi"><div><span>${L('Opening Balance','رصيد افتتاحي')}</span><b>${nf(e.open)}</b></div><div><span>${L('Debit','مدين')}</span><b>${nf(dr)}</b></div><div><span>${L('Credit','دائن')}</span><b>${nf(cr)}</b></div><div class="hl"><span>${L('Outstanding','المستحق')}</span><b>${M(e.bal)}</b></div></div>`
  +dcTable([L('Date','التاريخ'),L('Details','التفاصيل'),'#'+L('Debit','مدين'),'#'+L('Credit','دائن'),'#'+L('Balance','الرصيد')],rows)
  +`<div class="dc-thx">${L('Generated on','أُنشئ في')} ${today()} · ${esc(S.name)}</div>`)}
function stmt(t,id){
 docPage(L('Statement','كشف حساب'),stmtHtml(t,id),
  (t=='c'?dcBtn('clock','Reminder',`remind('c',${id})`):'')+dcBtn('print','Print','window.print()')+dcBtn('pdf','Share PDF',`stmtPdf('${t}',${id})`,'dc-p'))}

/* ---------- PDF (shared by statement + invoice) ---------- */
/* page plan for PDF: never cut through a table row, the totals card or the signature block; mg = page margin in pt (invoices) */
function pdfPlan(box,cvw,cvh,Wpt,Hpt,mg){
 mg=mg||0;const k=cvw/Wpt,sc=cvw/box.offsetWidth,t0=box.getBoundingClientRect().top,m=mg*k,Hk=Hpt*k,pages=[];
 const R=[...box.querySelectorAll('tr:not(.dc-fill),.dc-pre,.dc-sum2,.dc-foot,.dc-meta,.dc-party,.dc-top,.iv-top,.iv-info,.iv-sum,.iv-foot,.iv-amt,.iv-sec')].map(e=>{const r=e.getBoundingClientRect();return[(r.top-t0)*sc,(r.bottom-t0)*sc]});
 let y=0;while(y<cvh-1){const cap=Hk-2*m;let e=y+cap;
  if(e>=cvh-1){pages.push([Math.round(y),cvh]);break}
  for(let g=0;g<40;g++){const r=R.find(r=>r[0]<e-.5&&r[1]>e+.5);if(!r)break;e=r[0]}
  if(e<=y+cap*.3)e=y+cap;
  pages.push([Math.round(y),Math.round(e)]);y=e}
 return pages}
/* Private notes (and anything marked private) must never reach a shared invoice, photo or PDF */
const dcClean=box=>{box.querySelectorAll('.xr-n,.xd,.nt-h,[data-private]').forEach(e=>e.remove());return box};
const dcBox=(html,cls,wpx)=>{const box=document.createElement('div');box.className='dc-pdfbox '+(cls||'');box.style.cssText='position:fixed;left:-9999px;top:0;width:'+(wpx||760)+'px;padding:0;background:#fff;color:#111';box.innerHTML=html;document.body.appendChild(box);return dcClean(box)};
const dcFonts=()=>document.fonts&&document.fonts.ready?document.fonts.ready.catch(()=>{}):Promise.resolve();
/* Share Photo: a document as A4 page image(s) (same page layout as the PDF, 3x sharp; a long one gives one image per A4 page).
   o = {base:file name, msg:caption, ph:phone for WhatsApp fallback, gs:greyscale} */
async function dcPhoto(html,o){
 if(!window.html2canvas){toast('Image library not loaded (needs internet) — use Print');return}
 toast('Preparing photo…');const ps=o.ps,base=o.base,msg=o.msg,box=dcBox(html,'',ps&&ps.wpx);
 try{await dcFonts();const W=ps?ps.wpt:595.28,mg=ps?0:24,w=box.offsetWidth,h=box.offsetHeight,H=ps?(ps.hpt||W*h/w):841.89,sc=Math.max(1,Math.min(3,Math.sqrt(16e6/Math.max(1,w*h)))),
   cv=await html2canvas(box,{scale:sc,backgroundColor:'#fff',useCORS:true}),k=cv.width/W,pw=cv.width,ph=Math.round(pw*H/W),pl=ps&&!ps.hpt?[[0,cv.height]]:pdfPlan(box,cv.width,cv.height,W,H,mg),blobs=[];
  if(o.gs)dcGrey(cv);
  for(const g of pl){const sh=g[1]-g[0],pc=document.createElement('canvas');pc.width=pw;pc.height=ps&&!ps.hpt?sh+Math.round(mg*k)*2:ph;const x=pc.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,pw,ph);x.drawImage(cv,0,g[0],cv.width,sh,0,Math.round(mg*k),cv.width,sh);
   const bl=await new Promise(r=>pc.toBlob(r,'image/png'));if(!bl)throw 0;blobs.push(bl)}
  const files=blobs.map((b,i)=>new File([b],base+(blobs.length>1?' ('+(i+1)+')':'')+'.png',{type:'image/png'})),
   save=()=>{files.forEach((f,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)},i*400));toast('Photo saved — attach it in WhatsApp');if(o.ph)waSend(o.ph,msg)};
  if(navigator.canShare&&navigator.canShare({files})){try{await navigator.share({files,title:msg,text:msg})}catch(e){if(e.name!='AbortError')save()}}else save()
 }catch(e){toast('Could not create photo')}box.remove()}
async function invPhoto(id){const t=getTx(id);if(!t)return;const ps=dcPS('i');
 const sale=D.sa.includes(t)||QT().includes(t),P=(sale?D.c:D.s).find(x=>x.id==t.pid),title=dcShareTitle(t.date,t.no,P?P.n:(sale?L('Walk-In Customer','عميل نقدي'):'—'));
 return dcPhoto(dcDirP(invHtml(t,ps),ps),{base:dcFile(title),msg:title,ph:P&&P.ph,gs:window._dcGs,ps})}
async function pdfDoc(html,name,ph,msg,opt){
 if(!window.html2canvas||!window.jspdf){toast('PDF library not loaded (needs internet) — use Print');return}
 toast('Preparing PDF…');const ps=opt&&opt.ps,box=dcBox(html,'',ps&&ps.wpx);
 try{await dcFonts();const cv=await html2canvas(box,{scale:2,backgroundColor:'#fff',useCORS:true}),pdf=new jspdf.jsPDF(ps?{unit:'pt',format:[ps.wpt,ps.hpt||Math.max(ps.wpt*1.3,cv.height*ps.wpt/cv.width)],orientation:'p'}:{unit:'pt',format:'a4',orientation:'p'}),W=pdf.internal.pageSize.getWidth(),H=pdf.internal.pageSize.getHeight(),ih=cv.height*W/cv.width,k=cv.width/W,mg=ps?0:(opt&&opt.pg?24:0);
  if(opt&&opt.gs)dcGrey(cv);if(opt&&opt.title)try{pdf.setProperties({title:opt.title})}catch(e){}
  pdfPlan(box,cv.width,cv.height,W,H,mg).forEach((g,i)=>{const sh=g[1]-g[0],pc=document.createElement('canvas');pc.width=cv.width;pc.height=sh;pc.getContext('2d').drawImage(cv,0,g[0],cv.width,sh,0,0,cv.width,sh);if(i)pdf.addPage();pdf.addImage(pc.toDataURL('image/jpeg',.92),'JPEG',0,mg,W,sh/k)});
  const file=new File([pdf.output('blob')],name,{type:'application/pdf'}),fb=()=>{pdf.save(name);toast('PDF saved — attach it in WhatsApp');if(ph)waSend(ph,msg)};
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:(opt&&opt.title)||name,text:msg})}catch(e){if(e.name!='AbortError')fb()}}else fb()
 }catch(e){toast('Could not create PDF')}box.remove()}
function stmtPdf(t,id){const P=(t=='c'?D.c:D.s).find(x=>x.id==id);return pdfDoc(stmtHtml(t,id),'Statement-'+P.n.replace(/[^\w]+/g,'_')+'-'+today()+'.pdf',P.ph,S.name+' — '+P.n+': statement attached.')}
function invPdf(id){const t=getTx(id);if(!t)return;const sale=D.sa.includes(t)||QT().includes(t),P=(sale?D.c:D.s).find(x=>x.id==t.pid),ps=dcPS('i');
 if(!window.html2canvas||!window.jspdf)return window.print();
 const title=dcShareTitle(t.date,t.no,P?P.n:(sale?L('Walk-In Customer','عميل نقدي'):'—'));
 return pdfDoc(dcDirP(invHtml(t,ps),ps),dcFile(title)+'.pdf',P&&P.ph,title,{gs:window._dcGs,title,ps})}

/* ---------- Receipt Voucher (Payment IN) / Payment Voucher (Payment OUT) ---------- */
/* each payment gets a stable voucher number the first time one is opened: RV-001 / PV-001 … in date order */
function vcNo(p){if(p.vno)return p.vno;const pre=p.ty=='in'?'RV-':'PV-',need=D.pay.filter(x=>x.ty==p.ty&&!x.vno).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.id-b.id);
 let n=D.pay.reduce((m,x)=>x.ty==p.ty&&x.vno?Math.max(m,+String(x.vno).replace(/\D/g,'')||0):m,0);
 need.forEach(x=>{x.vno=pre+String(++n).padStart(3,'0')});
 try{if(!(ME&&ME.role=='viewer'))save()}catch(e){}
 return p.vno}
function vcHtml(p,ps){ps=ps||dcPS('v');
 const c=p.ty=='in',P=(c?D.c:D.s).find(x=>x.id==p.pid),no=vcNo(p),
  kind=c?L('Receipt Voucher','سند قبض'):L('Payment Voucher','سند صرف'),
  rows=(p.al||[]).map(e=>{const b=e.id<0?null:D.sa.concat(D.pu).find(x=>x.id==e.id);return[e.id<0?L('Opening balance','رصيد افتتاحي'):esc(b?b.no:'—'),b?dcDate(b.date):(e.id<0&&P&&P.asof?dcDate(P.asof):''),nf(e.a)]}),
  ap=(p.al||[]).reduce((a,e)=>a+N(e.a),0),rem=N(p.amt)-ap,words=S.lang=='ar'?'':numWords(p.amt),
  thx=PR().thx?(PR().thxt?esc(PR().thxt):c?L('Thank you for your payment.','شكراً لسدادكم.'):L('Payment made with thanks.','تم السداد مع الشكر.')):'',
  ref=rows.length?L('Against bills','مقابل فواتير')+' ('+rows.length+')':L('On account','على الحساب');
 if(dcTplGet('v'))return tplVc(dcTplGet('v'),{p,P,c,no,kind,rows,ap,rem,words,thx,ref});
 return'<div class="iv vcv vcl">'+ivHead(kind,esc(no))
  +`<div class="vcl-body"><div class="vcl-l"><div class="vc-pty"><span class="iv-lb">${c?L('Received from','استلمنا من'):L('Paid to','مدفوع إلى')}</span><b>${esc(P?P.n:'—')}</b>${PR().pty&&P&&P.ph?`<span>${esc(P.ph)}</span>`:''}${PR().pty&&P&&P.ad?`<span>${esc(P.ad)}</span>`:''}</div>`
  +`<div class="vc-amt"><div class="vc-al"><span>${c?L('Amount received','المبلغ المستلم'):L('Amount paid','المبلغ المدفوع')}</span>${words?`<em>${words}</em>`:''}</div><b>${M(p.amt)}</b></div></div>`
  +`<div class="vc-strip"><div><span>${L('Date','التاريخ')}</span><b>${dcDate(p.date)}</b></div><div><span>${c?L('Received in','استلمت في'):L('Paid from','دفعت من')}</span><b>${esc(p.m||'—')}</b></div><div><span>${L('Reference','المرجع')}</span><b>${ref}</b></div></div></div>`
  +'<div class="iv-main">'
  +(rows.length?`<div class="iv-sec">${L('Applied to','مسدد عن')}</div>`+ivGrid([L('Bill','الفاتورة'),L('Date','التاريخ'),'#'+L('Amount','المبلغ')],rows,[40,30,30],[[L('Total applied','إجمالي المسدد'),nf(ap),rem<=0.004?1:0]].concat(rem>0.004?[[L('On account (unapplied)','على الحساب (غير مسدد)'),nf(rem),1]]:[]),{fill:false,nar:false}):'')
  +'</div>'+ivNote(p.note)+ivFoot(c?L('Received by','المستلم'):L('Paid by','الدافع'),c?L('Paid by','الدافع'):L('Received by','المستلم'),thx)+'</div>'}
function vcTitle(p){const c=p.ty=='in',P=(c?D.c:D.s).find(x=>x.id==p.pid);return dcShareTitle(p.date,vcNo(p),P?P.n:'—')}
function voucher(id){const p=D.pay.find(x=>x.id==id);if(!p)return;const c=p.ty=='in',ps=dcPS('v');
 docPage(c?L('Receipt Voucher','سند قبض'):L('Payment Voucher','سند صرف'),dcToolbar('v',()=>voucher(id))+dcDirP(vcHtml(p,ps),ps,1),
  dcPrintBtn('v')+dcShareBtn('v',{photo:`vcPhoto(${id})`,pdf:`vcPdf(${id})`}));ppPrint(ps)}
function vcPhoto(id){const p=D.pay.find(x=>x.id==id);if(!p)return;const P=(p.ty=='in'?D.c:D.s).find(x=>x.id==p.pid),title=vcTitle(p),ps=dcPS('v');
 return dcPhoto(dcDirP(vcHtml(p,ps),ps),{base:dcFile(title),msg:title,ph:P&&P.ph,gs:window._dcGs,ps})}
function vcPdf(id){const p=D.pay.find(x=>x.id==id);if(!p)return;const P=(p.ty=='in'?D.c:D.s).find(x=>x.id==p.pid),ps=dcPS('v');
 if(!window.html2canvas||!window.jspdf)return window.print();
 const title=vcTitle(p);return pdfDoc(dcDirP(vcHtml(p,ps),ps),dcFile(title)+'.pdf',P&&P.ph,title,{gs:window._dcGs,title,ps})}

/* ---------- customer / supplier details sheet ---------- */
function pMenu(t,id){
 const x=(t=='c'?D.c:D.s).find(y=>y.id==id);if(!x)return;const c=t=='c',b=bal(t,id);
 const ov=b>0.004?pend(t,id).reduce((s,y)=>s+(od(y.t,x)>0?y.due:0),0):0,lp=lastPay(t,id);
 const row=(i,l,v)=>`<div class="pm-r"><span class="pm-i">${ic(i,18)}</span><span class="pm-l">${l}</span><b>${v}</b></div>`;
 const info=[x.ph?row('phone','Phone',esc(x.ph)):'',x.ad?row('pin','Address',esc(x.ad)):'',
  N(x.open)?row('tag','Opening Balance',M(x.open)+(x.asof?` <small>${x.asof}</small>`:'')):'',
  x.obp?row('photo','Opening Bill Photo',`<button type="button" class="g s" onclick="phShowRec('${t}',${id})">View</button>`):'',
  row('clock','Last Payment Date',lp?`${lp.d} <small>${M(lp.a)}</small>`:'<small>No payment yet</small>'),
  c&&cdays(x)>0?row('clock','Credit Days',cdays(x)+' days'):'',N(x.lim)>0?row('tag','Credit Limit',M(x.lim)):''].join('');
 modal(`<div class="pm"><div class="pm-h">${avatar(x.n,1)}<div class="pm-n"><h3>${esc(x.n)}</h3><span class="k">${c?'Customer':'Supplier'}</span></div><button type="button" class="g pm-x" aria-label="Close" onclick="closeM()">${ic('x',20)}</button></div>
 <div class="pm-bal ${c?'in':'out'}"><div><span>${c?'To receive':'To pay'}</span><b>${M(b)}</b></div>${ov>0.004?`<em class="tag od">Overdue ${M(ov)}</em>`:b<-0.0005?'<em class="tag adv">Advance</em>':''}</div>
 <div class="pm-act"><button type="button" class="pm-main ${c?'in':'out'}" onclick="closeM();payForm('${c?'in':'out'}',${id})">${c?'Payment IN':'Payment OUT'}</button><button type="button" class="pm-main alt" onclick="closeM();stmt('${t}',${id})">${ic('stmt',18)} Statement</button></div>
 <div class="pm-list">${info}</div>
 <div class="pm-sec">${c?`<button type="button" onclick="closeM();plList(${id})">${ic('tag',18)}<span>Price List</span></button>`:''}<button type="button" onclick="closeM();partyForm('${t}',${id})">${ic('edit',18)}<span>Edit</span></button><button type="button" class="dg" onclick="closeM();del('${t}',${id})">${ic('trash',18)}<span>Delete</span></button></div></div>`)}

/* ---------- party list ---------- */
V.parties=()=>{if(_pg!='s')_pg='c';const sup=_pg=='s',t=sup?'s':'c',L0=[...(sup?D.s:D.c)].sort(partyRecent(t));
 const q=(window.q||'').toLowerCase(),F=L0.filter(x=>cfOk(t,x)&&(!q||(x.n+' '+(x.ph||'')+' '+(x.ad||'')).toLowerCase().includes(q))),srch=`<input placeholder="Search name, phone or address…" value="${esc(window.q||'')}" oninput="window.q=this.value;go(1)" style="margin:2px 0 8px">`;
 const body=BE[t]?bulkParty(t,F):`<div class="pl">${F.map(x=>{const b=bal(t,x.id),ov=b>0.004?pend(t,x.id).reduce((s,y)=>s+(od(y.t,x)>0?y.due:0),0):0,tag=ov>0.004?'<em class="tag od">Overdue</em>':b<-0.0005?'<em class="tag adv">Advance</em>':'';
  return`<div class="pl-r"><button type="button" class="pl-m" onclick="partyTx('${t}',${x.id})">${avatar(x.n)}<span class="pl-t"><b>${esc(x.n)}</b><span class="k">${esc(x.ph||x.ad||'—')}${partyLast(t,x.id)}</span></span><span class="pl-b"><b class="${b>0.0005?(sup?'low':'ok'):''}">${M(b)}</b>${tag}</span></button><button type="button" class="pl-p ${sup?'out':'in'}" aria-label="${sup?'Payment Out':'Payment In'}" onclick="payForm('${sup?'out':'in'}',${x.id})">${sup?'Pay':'Receive'}</button></div>`}).join('')||(xfOn()||q?'<div class="pl-e">No results match your search or filter</div>':'<div class="pl-e">Nothing Here Yet</div>')}</div>`;
 return wh(beBtn(t)+dd([{l:'Customers',on:!sup,act:"nav('parties',()=>_pg='c')",add:"partyForm('c')"},{l:'Suppliers',on:sup,act:"nav('parties',()=>_pg='s')",add:"partyForm('s')"}]),`<h3>${sup?'Suppliers':'Customers'} <span class="k">(${L0.length})</span></h3>`+beTog(t)+srch+body)};

/* =====================================================================
 Categories — product categories (redesigned) and expense categories (new)
   D.xc = [{id,n}]  expense categories; an expense stores the name in e.cat
 ===================================================================== */
IC.folder='<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>';
IC.receipt='<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>';
IC.plus='<path d="M12 5v14M5 12h14"/>';
const _iu=initUnits;
initUnits=function(){_iu();
 if(!Array.isArray(D.xc)){D.xc=[];['Rent','Salaries','Electricity & Water','Transport','Maintenance','Marketing','Miscellaneous'].forEach(n=>D.xc.push({id:uid(),n}))}
 D.ex.forEach(e=>{const n=String(e.cat||'').trim();if(n&&!D.xc.some(c=>lc(c.n)==lc(n)))D.xc.push({id:uid(),n})})};
const xcOpts=()=>'<option value="">Select category…</option>'+(D.xc||[]).map(c=>`<option>${esc(c.n)}</option>`).join('');
function xcForm(id){const c=D.xc.find(x=>x.id==id)||{};form(id?'Edit Expense Category':'New Expense Category',[{k:'n',l:'Category Name'}],o=>{o.n=o.n.trim();if(!o.n)return toast('Name Required')&&false;if(D.xc.some(x=>x.id!=id&&lc(x.n)==lc(o.n)))return toast('Category Already Exists')&&false;if(id){D.ex.forEach(e=>{if(e.cat==c.n)e.cat=o.n});if(_xf==c.n)_xf=o.n;c.n=o.n}else D.xc.push({id:uid(),n:o.n})},c)}
function delXc(id){const c=D.xc.find(x=>x.id==id),n=D.ex.filter(e=>e.cat==c.n).length;ask(n?`Delete "${c.n}"? Its ${n} expense(s) become Uncategorized`:'Delete This Category?',()=>{D.ex.forEach(e=>{if(e.cat==c.n)e.cat=''});if(_xf==c.n)_xf='';D.xc=D.xc.filter(x=>x.id!=id);save();go()})}
function viewXc(id){_xf=D.xc.find(x=>x.id==id).n;_xp='l';nav('expenses')}
function viewUncat(){CF='__';_pr='p';nav('products')}

const ctIcon=(n,i)=>`<span class="av ct-ic" style="--h:${hue(n)}">${ic(i,20)}</span>`;
const ctStat=(l,v,fn)=>`<${fn?'button type="button"':'div'} class="ct-s${fn?' go':''}"${fn?` onclick="${fn}"`:''}><span>${l}</span><b>${v}</b></${fn?'button':'div'}>`;
const ctRow=(n,icon,sub,tag,view,edit,del)=>`<div class="ct-r"><button type="button" class="ct-m" onclick="${view}">${ctIcon(n,icon)}<span class="ct-t"><b>${esc(n)}</b><span class="k">${sub}</span></span>${tag||''}<span class="ct-ch">${ic('back',16)}</span></button><button type="button" class="ct-i" aria-label="Edit" onclick="${edit}">${ic('edit',18)}</button><button type="button" class="ct-i dg" aria-label="Delete" onclick="${del}">${ic('trash',18)}</button></div>`;
const ctNew=fn=>`<button type="button" class="ct-new" onclick="${fn}">${ic('plus',18)}<span>New category</span></button>`;

/* product categories (opened from Products ▸ Categories) */
V.categories=()=>{
 const uc=D.p.filter(p=>!p.cat).length,srt=[...D.ct].sort((a,b)=>String(a.n).localeCompare(String(b.n)));
 const rows=srt.map(c=>{const ps=D.p.filter(p=>p.cat==c.n),low=ps.filter(p=>stock(p.id)<=N(p.min)).length,sv=ps.reduce((s,p)=>s+val(p.id),0);
  return ctRow(c.n,'folder',`${ps.length} product${ps.length==1?'':'s'} · ${M(sv)}`,low?`<em class="tag od">${low} low</em>`:'',`viewCat(${c.id})`,`catForm(${c.id})`,`delCat(${c.id})`)}).join('');
 return`<div class="row"><h3>Categories</h3></div><div class="ct-sum">${ctStat('Categories',D.ct.length)}${ctStat('Products',D.p.length)}${ctStat('Uncategorized',uc,uc?'viewUncat()':'')}</div><div class="ct-l">${rows||'<div class="pl-e">No categories yet. Create the first one below.</div>'}${ctNew('catForm()')}</div>`};

/* expense categories + expenses page with two tabs */
let _xp='l',_xf='';
addEventListener('hashchange',()=>{if(location.hash!='#expenses'&&location.hash!='#lossrec'){_xp='l';_xf=''}});
const ymNow=today().slice(0,7);
const xTabs=()=>'';
const ddEx=()=>dd([...TXI.filter(t=>t[1]!='expenses').map(t=>({l:t[0],on:false,act:"nav('"+t[1]+"')",add:t[2]})),{l:'Expenses',on:_xp=='l',act:"nav('expenses',()=>{_xp='l';_xf=''})",add:'expForm()'},...(FT('recurring')?[{l:'Recurring Expenses',on:_xp=='r',act:"nav('expenses',()=>{_xp='r';_xf=''})",add:'rxForm()'}]:[]),...(FT('losses')?[{l:'Losses',on:_xp=='s',act:"nav('expenses',()=>{_xp='s';_xf=''})",add:'lsForm()'}]:[]),{l:'Expense Categories',on:_xp=='c',act:"nav('expenses',()=>{_xp='c';_xf=''})",add:'xcForm()'}]);
const expTable=()=>tbl(['Date','Category','Account','Notes','#Amount',''],[...D.ex].filter(e=>!_xf||(_xf=='__'?!e.cat:e.cat==_xf)).reverse().map(e=>[e.date,esc(e.cat||'Uncategorized'),e.m,esc(e.note),M(e.amt),`<button class="g s" onclick="expForm(${e.id})">Edit</button> <button class="g s" onclick="del('ex',${e.id})">Delete</button>`]));
V.expenses=()=>{
 if(_xp=='c'){
  const srt=[...D.xc].sort((a,b)=>String(a.n).localeCompare(String(b.n))),un=D.ex.filter(e=>!e.cat),mo=D.ex.filter(e=>String(e.date).slice(0,7)==ymNow).reduce((s,e)=>s+N(e.amt),0);
  const rows=srt.map(c=>{const xs=D.ex.filter(e=>e.cat==c.n),t=xs.reduce((s,e)=>s+N(e.amt),0);return ctRow(c.n,'receipt',`${xs.length} expense${xs.length==1?'':'s'} · ${M(t)}`,'',`viewXc(${c.id})`,`xcForm(${c.id})`,`delXc(${c.id})`)}).join('');
  return wh(ddEx(),`<h3>Expense categories</h3><div class="ct-sum">${ctStat('Categories',D.xc.length)}${ctStat('Expenses',D.ex.length)}${ctStat('This month',M(mo))}</div><div class="ct-l">${rows||'<div class="pl-e">No categories yet. Create the first one below.</div>'}${un.length?`<button type="button" class="ct-un" onclick="_xf='__';_xp='l';nav('expenses')">${un.length} expense${un.length==1?'':'s'} without a category ${ic('back',14)}</button>`:''}${ctNew('xcForm()')}</div>`)}
 const chip=_xf?`<div class="xf"><span>Showing <b>${esc(_xf=='__'?'Uncategorized':_xf)}</b></span><button type="button" onclick="_xf='';go(1)">${ic('x',14)} Clear</button></div>`:'';
 return wh(ddEx(),`<h3>Expenses</h3>`+chip+expTable())};
