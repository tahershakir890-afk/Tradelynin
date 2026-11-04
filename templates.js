/* =====================================================================
 TradeLynin v56 — one tidy toolbar for invoice / voucher previews (colour · paper · template)
   + custom HTML templates for invoices and vouchers ({{placeholders}}), stored on this device.
 ===================================================================== */
const TPL_HTML=new Set(['items_rows','items_table','summary_rows','applied_rows','applied_table','logo_img']);
const tplKey=k=>'tl_tpl_'+k;
const dcTplGet=k=>{try{return localStorage.getItem(tplKey(k))||''}catch(e){return''}};
const tplName=k=>{try{return localStorage.getItem(tplKey(k)+'_n')||''}catch(e){return''}};

/* scope a template's CSS to the document page so it cannot restyle the app */
function tplScope(css,pre){css=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@import[^;]*;/gi,'');
 const parse=s=>{let r='',p=0;while(p<s.length){const b=s.indexOf('{',p);if(b<0)break;const sel=s.slice(p,b).trim();let d=1,q=b+1;while(q<s.length&&d){if(s[q]=='{')d++;else if(s[q]=='}')d--;q++}
  const body=s.slice(b+1,q-1);
  if(/^@(media|supports)/i.test(sel))r+=sel+'{'+parse(body)+'}';
  else if(/^@keyframes/i.test(sel))r+=sel+'{'+body+'}';
  else if(!/^@/.test(sel))r+=sel.split(',').map(x=>{x=x.trim();if(/^(html|body|:root)$/i.test(x))return pre+' .tpl-doc';return pre+' '+x.replace(/^(html|body)\s+/i,'')}).join(',')+'{'+body.replace(/url\(\s*['"]?(?!data:)[^)]*\)/gi,'none')+'}';
  p=q}return r};
 return parse(css)}
/* remove anything active; keep layout, text, tables, data: images and {{placeholders}} */
function tplClean(html){
 const seg=html.split(/(<[^>]*>)/);for(let i=0;i<seg.length;i+=2)seg[i]=seg[i].replace(/\{\{([^{}]+)\}\}/g,'<!--{{$1}}-->');
 const doc=new DOMParser().parseFromString(seg.join(''),'text/html');
 doc.querySelectorAll('script,iframe,object,embed,link,meta,base,frame,frameset,applet,noscript,form,input,button,textarea,select,audio,video').forEach(e=>e.remove());
 let css='';doc.querySelectorAll('style').forEach(e=>{css+=e.textContent+'\n';e.remove()});
 doc.querySelectorAll('*').forEach(e=>{[...e.attributes].forEach(a=>{const n=a.name.toLowerCase(),v=a.value;
  if(n.startsWith('on')||n=='href'||n=='action'||n=='formaction'||n=='srcset'||n=='xlink:href'){e.removeAttribute(a.name);return}
  if(n=='src'&&!/^\s*data:image\//i.test(v)&&v.indexOf('{{')<0)e.removeAttribute(a.name);
  if(n=='style')e.setAttribute('style',v.replace(/url\(\s*['"]?(?!data:)[^)]*\)/gi,'none').replace(/expression\([^)]*\)/gi,''))})});
 const body=doc.body.innerHTML.replace(/<!--(\{\{[^{}]+\}\})-->/g,'$1');
 return(css.trim()?'<style>'+tplScope(css,'.dc-paper.tpl')+'</style>':'')+body}
function tplRender(t,m){t=t.replace(/\{\{#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,(a,k,b)=>m[k]?b:'');
 return t.replace(/\{\{\s*(\w+)\s*\}\}/g,(a,k)=>k in m?(TPL_HTML.has(k)?m[k]:esc(m[k])):'')}
const tplBrand=()=>{const pr=PR(),lg=pr.logo?(S.logo||LOGO):'';return{business_name:pr.name?S.name||'':'',business_address:pr.addr?S.addr||'':'',business_phone:pr.ph?S.ph||'':'',logo:lg,logo_img:lg?`<img src="${lg}" alt="" style="max-width:100%;max-height:100%">`:'',currency:S.cur}};
const tplSign=(a,b)=>PR().sign?{sign_label_1:a,sign_label_2:b,show_sign:'1'}:{sign_label_1:'',sign_label_2:'',show_sign:''};
const tdt=d=>dcDate(d).replace(/<[^>]*>/g,'');
function tplInv(tp,x){const t=x.t,P=x.P,m=Object.assign(tplBrand(),tplSign(L('Authorized signature','التوقيع المعتمد'),x.sale?L('Received by','استلمها'):L('Supplier signature','توقيع المورد')),{
 doc_title:x.kind,doc_no:t.no,date:tdt(t.date),due_date:PR().due&&x.dueDate?tdt(x.dueDate):'',payment_mode:x.paid>.004&&t.m?t.m:'',
 party_label:x.sale?L('Billed to','العميل'):L('Supplier','المورد'),party_name:P?P.n:L('Walk-In Customer','عميل نقدي'),party_phone:PR().pty&&P&&P.ph||'',party_address:PR().pty&&P&&P.ad||'',
 item_count:String(t.items.length),qty_total:String(t.items.reduce((a,i)=>a+N(i.uq||i.q),0)),
 subtotal:nf(x.T.sub),total:M(x.T.total),total_number:nf(x.T.total),paid:nf(x.paid),balance_due:nf(Math.max(0,x.due)),amount_words:S.lang=='ar'?'':numWords(x.T.total),footer_message:x.thx.replace(/<[^>]*>/g,''),note:FT('invnote')?x.t.note||'':'',
 summary_rows:x.sum.concat([[L('Total','الإجمالي'),M(x.T.total)]]).map(r=>`<tr><td class="l">${r[0]}</td><td class="r">${r[1]}</td></tr>`).join('')});
 m.items_rows=x.rows.map(r=>`<tr><td class="c">${r[0]}</td><td>${r[1]}</td><td class="r">${r[2]}</td><td class="r">${r[3]}</td><td class="r">${r[4]}</td></tr>`).join('');
 m.items_table=`<table class="tpl-items"><thead><tr><th class="c">#</th><th>${L('Item','الصنف')}</th><th class="r">${L('Qty','الكمية')}</th><th class="r">${L('Price','السعر')}</th><th class="r">${L('Amount','المبلغ')}</th></tr></thead><tbody>${m.items_rows}</tbody></table>`;
 return'<div class="iv tpl-doc">'+tplRender(tp,m)+'</div>'}
function tplVc(tp,x){const p=x.p,P=x.P,c=x.c,m=Object.assign(tplBrand(),tplSign(c?L('Received by','المستلم'):L('Paid by','الدافع'),c?L('Paid by','الدافع'):L('Received by','المستلم')),{
 doc_title:x.kind,doc_no:x.no,date:tdt(p.date),payment_mode:p.m||'',reference:x.ref,
 party_label:c?L('Received from','استلمنا من'):L('Paid to','مدفوع إلى'),party_name:P?P.n:'—',party_phone:PR().pty&&P&&P.ph||'',party_address:PR().pty&&P&&P.ad||'',
 amount:M(p.amt),amount_number:nf(p.amt),amount_label:c?L('Amount received','المبلغ المستلم'):L('Amount paid','المبلغ المدفوع'),amount_words:x.words,total_applied:nf(x.ap),on_account:x.rem>.004?nf(x.rem):'',footer_message:x.thx.replace(/<[^>]*>/g,''),note:FT('invnote')?x.p.note||'':''});
 m.applied_rows=x.rows.map(r=>`<tr><td>${r[0]}</td><td>${String(r[1]).replace(/<[^>]*>/g,'')}</td><td class="r">${r[2]}</td></tr>`).join('');
 m.applied_table=x.rows.length?`<table class="tpl-items"><thead><tr><th>${L('Bill','الفاتورة')}</th><th>${L('Date','التاريخ')}</th><th class="r">${L('Amount','المبلغ')}</th></tr></thead><tbody>${m.applied_rows}</tbody></table>`:'';
 return'<div class="iv tpl-doc">'+tplRender(tp,m)+'</div>'}

/* ---- upload / reset / sample ---- */
function tplUp(kind,inp){const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
 if(f.size>800*1024)return toast('Template is too large (max 800 KB)');
 const r=new FileReader();r.onload=()=>{try{const c=tplClean(String(r.result));if(!c.replace(/<style>[\s\S]*?<\/style>/,'').trim())return toast('That file has no content');
  localStorage.setItem(tplKey(kind),c);localStorage.setItem(tplKey(kind)+'_n',f.name);toast('Template applied');window._ppRedo&&window._ppRedo()}catch(e){toast('Could not save the template (file too large for this device?)')}};
 r.onerror=()=>toast('Could not read that file');r.readAsText(f)}
function tplReset(kind){try{localStorage.removeItem(tplKey(kind));localStorage.removeItem(tplKey(kind)+'_n')}catch(e){}toast('Default design restored');window._ppRedo&&window._ppRedo()}
function tplSampleDl(kind){const t=TPL_SAMPLE[kind],b=new Blob([t],{type:'text/html'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=kind=='i'?'invoice-template-sample.html':'voucher-template-sample.html';document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function tplHelp(kind){const keys=kind=='i'?'{{doc_title}} {{doc_no}} {{date}} {{due_date}} {{payment_mode}} {{note}} {{party_label}} {{party_name}} {{party_phone}} {{party_address}} {{items_table}} or {{items_rows}} {{summary_rows}} {{subtotal}} {{total}} {{paid}} {{balance_due}} {{amount_words}}':'{{doc_title}} {{doc_no}} {{date}} {{payment_mode}} {{reference}} {{party_label}} {{party_name}} {{party_phone}} {{party_address}} {{amount}} {{amount_words}} {{applied_table}} {{total_applied}} {{on_account}}';
 alert('Template = one HTML file (CSS inside <style> is fine; images must be embedded as data:). Placeholders:\n\n'+keys+'\n\nBusiness: {{business_name}} {{business_address}} {{business_phone}} {{logo}} (use in <img src>) or {{logo_img}}\nFooter / signatures: {{footer_message}} {{sign_label_1}} {{sign_label_2}}\nShow only if filled: {{#if due_date}} … {{/if}}\n\nTap Sample to download a working file to edit.')}

/* ---- options live in the bottom bar: Colour · Paper · Template open a small panel above it ---- */
function dcToolbar(kind,redo){window._ppRedo=redo;window._ppKind=kind;return''}
const dcOI={c:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M12 12l6.5-6.5"/></svg>',
 p:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6"/></svg>',
 t:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>'};
const dcChev='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
const dcPI='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7" rx="1"/></svg>',
 dcSI='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>';
const dcPrintBtn=kind=>`<button type="button" class="dc-b dc-o" data-o="print" onclick="dcPopT('${kind}','print')">${dcPI}<span>${L('Print','طباعة')}</span></button>`;
const dcShareBtn=(kind,photo,pdf)=>{if(photo&&typeof photo=='object'){pdf=photo.pdf;photo=photo.photo}window._shFn={photo,pdf};return`<button type="button" class="dc-b dc-p dc-o" data-o="share" onclick="dcPopT('${kind}','share')">${dcSI}<span>${L('Share','مشاركة')}</span>${dcChev}</button>`};
const dcOI2={pdf:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14h6M9 17h4"/></svg>',img:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/></svg>'};
function dcPopRun(w){dcPopX();const f=window._shFn&&window._shFn[w];f&&new Function(f)()}
function dcPopX(){const e=$('dcpop');if(e)e.remove();document.querySelectorAll('#mc .dc-o').forEach(b=>b.classList.remove('on'))}
function dcPopHtml(kind,k){const ps=dcPS(kind),nm=tplName(kind),on=!!dcTplGet(kind);
 if(k=='share')return`<div class="pp-h">${L('Share as','مشاركة كـ')}</div><button type="button" class="pp-li" onclick="dcPopRun('pdf')">${dcOI2.pdf}<span><b>PDF</b><small>${ps.name} · ${L('document file','ملف')}</small></span></button><button type="button" class="pp-li" onclick="dcPopRun('photo')">${dcOI2.img}<span><b>${L('Photo','صورة')}</b><small>${ps.name} · PNG</small></span></button>`;
 const m=window._dcMode||0,ico=(d)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`,
 dim=x=>{const a=DCPAP[x];if(x=='cus')return ps.k=='cus'?ps.w+(ps.h?' × '+ps.h:' × auto')+' mm':'Any size';if(!a[2])return a[1]+' mm roll';return kind=='v'?a[2]+' × '+a[1]+' mm':a[1]+' × '+a[2]+' mm'},
 mini=x=>{const a=DCPAP[x],w=x=='cus'?16:a[1],h=x=='cus'?20:(a[2]||a[1]*2.2);let W=kind=='v'&&a[2]?a[2]:w,H=kind=='v'&&a[2]?a[1]:h;const k=24/Math.max(W,H);return`<i class="pk${x=='cus'?' dash':''}" style="width:${Math.round(W*k)}px;height:${Math.round(H*k)}px"></i>`};
 return`<div class="pp-sec"><div class="pp-h">${L('Colour','اللون')}</div><div class="dc-clr dc-clr3" role="group"><button type="button" data-c="c" class="${m==0?'on':''}" onclick="dcClr(0)"><i></i>${L('Color','ملوّن')}</button><button type="button" data-c="g" class="${m==1?'on':''}" onclick="dcClr(1)"><i></i>${L('Greyscale','رمادي')}</button><button type="button" data-c="b" class="${m==2?'on':''}" onclick="dcClr(2)"><i></i>${L('Black & White','أبيض وأسود')}</button></div></div>`
 +`<div class="pp-sec"><div class="pp-h">${L('Paper size','حجم الورق')}${kind=='v'?' · Landscape':''}</div><div class="pp-grid">${DCKINDS[kind].map(x=>`<button type="button" class="pp-t${ps.k==x?' on':''}" onclick="ppSet('${kind}','${x}')">${mini(x)}<b>${DCPAP[x][0]}</b><small>${dim(x)}</small></button>`).join('')}</div>`
 +(ps.k=='cus'?`<div class="tb-cus"><label>${L('Width','العرض')}<input id="pp_w" type="number" inputmode="decimal" min="40" max="330" value="${ps.w}"><em>mm</em></label><label>${L('Height','الارتفاع')}<input id="pp_h" type="number" inputmode="decimal" min="0" max="500" value="${ps.h}"><em>mm</em></label><button type="button" class="pp-ap" onclick="ppCus()">Apply</button></div><div class="tb-n">Height 0 = automatic length (roll)</div>`:'')+`</div>`
 +`<div class="pp-sec"><div class="pp-h">${L('Template','القالب')}</div><div class="pp-tn${on?' on':''}">${ico('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>')}<span><b>${on?esc(nm||'Custom template'):'Default design'}</b><small>${on?'Your uploaded template':'Built-in layout'}</small></span>${on?`<button type="button" class="pp-rs" onclick="window._popKeep='print';tplReset('${kind}')">Reset</button>`:''}</div><div class="pp-acts"><label class="pp-a">${ico('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>')}<span>Upload</span><input type="file" accept=".html,.htm,text/html" hidden onchange="window._popKeep='print';tplUp('${kind}',this)"></label><button type="button" class="pp-a" onclick="tplSampleDl('${kind}')">${ico('<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>')}<span>Sample</span></button><button type="button" class="pp-a" onclick="tplHelp('${kind}')">${ico('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>')}<span>Help</span></button></div></div>`
 +`<button type="button" class="pp-go" onclick="dcPopX();window.print()">${dcPI}<span>${L('Print now','اطبع الآن')} · ${ps.name}</span></button>`}
function dcPopT(kind,k,keep){const m=$('mc');if(!m)return;let e=$('dcpop');const same=e&&e.dataset.k==k;if(e)e.remove();
 m.querySelectorAll('.dc-o').forEach(b=>b.classList.toggle('on',false));if(same&&!keep)return;
 e=document.createElement('div');e.id='dcpop';e.className='dc-pop np';e.dataset.k=k;e.innerHTML=dcPopHtml(kind,k);
 const f=m.querySelector('.dc-f');e.style.bottom=(f?f.offsetHeight+8:80)+'px';m.append(e);
 m.querySelectorAll('.dc-o').forEach(b=>b.classList.toggle('on',b.dataset.o==k))}
const _dpT=docPage;docPage=function(a,b,c){const r=_dpT(a,b,c);const k=window._popKeep;window._popKeep=null;if(k&&window._ppKind)setTimeout(()=>dcPopT(window._ppKind,k,1),0);return r};
/* a size change keeps the Paper panel open */
const _ppSet0=ppSet;ppSet=function(kind,k){window._popKeep='print';return _ppSet0(kind,k)};
const _ppCus0=ppCus;ppCus=function(){window._popKeep='print';return _ppCus0()};

/* ---- sample templates (also shipped in /templates) ---- */
const TPL_SAMPLE={i:`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice template</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:13px;padding:34px 38px}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0f766e;padding-bottom:14px}
.top h1{margin:0;font-size:30px;color:#0f766e;letter-spacing:1px}
.top .no{color:#6b7280;margin-top:4px}
.brand{display:flex;align-items:center;gap:12px;text-align:right}
.brand .logo{width:60px;height:60px}
.brand b{font-size:17px;display:block}
.info{display:flex;justify-content:space-between;margin:20px 0}
.lb{font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:.08em}
table.tpl-items{width:100%;border-collapse:collapse;margin-top:6px}
table.tpl-items th{background:#0f766e;color:#fff;padding:9px 8px;text-align:left}
table.tpl-items td{padding:9px 8px;border-bottom:1px solid #e5e7eb}
.r{text-align:right}.c{text-align:center}
.tot{width:46%;margin-left:auto;margin-top:14px;border-collapse:collapse}
.tot td{padding:6px 8px}
.tot tr:last-child td{border-top:2px solid #0f766e;font-weight:700;font-size:16px;color:#0f766e}
.words{margin-top:10px;color:#6b7280;font-size:12px}
.sign{display:flex;gap:40px;margin-top:70px}
.sign div{flex:1;border-top:1px solid #9ca3af;padding-top:6px;color:#6b7280;font-size:12px}
.thx{text-align:center;margin-top:26px;color:#6b7280}
</style></head><body>
<div class="top">
 <div><h1>{{doc_title}}</h1><div class="no">{{doc_no}}</div></div>
 <div class="brand"><div><b>{{business_name}}</b>{{business_address}}<br>{{business_phone}}</div><div class="logo">{{logo_img}}</div></div>
</div>
<div class="info">
 <div><div class="lb">{{party_label}}</div><b style="font-size:16px">{{party_name}}</b><br>{{party_phone}}<br>{{party_address}}</div>
 <div class="r"><div class="lb">Date</div>{{date}}{{#if due_date}}<div class="lb" style="margin-top:6px">Due date</div>{{due_date}}{{/if}}{{#if payment_mode}}<div class="lb" style="margin-top:6px">Payment</div>{{payment_mode}}{{/if}}</div>
</div>
{{items_table}}
<table class="tot">{{summary_rows}}</table>
<div class="words">{{amount_words}}</div>
{{#if note}}<div class="words"><b>Note:</b> {{note}}</div>{{/if}}
{{#if show_sign}}<div class="sign"><div>{{sign_label_1}}</div><div>{{sign_label_2}}</div></div>{{/if}}
<div class="thx">{{footer_message}}</div>
</body></html>`,
v:`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Voucher template</title>
<style>
body{font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:13px;padding:26px 32px}
.top{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #b45309;padding-bottom:12px}
.top h1{margin:0;font-size:26px;color:#b45309}
.top .no{color:#6b7280;margin-top:3px}
.brand{display:flex;align-items:center;gap:10px;text-align:right}
.brand .logo{width:54px;height:54px}
.brand b{font-size:16px;display:block}
.body{display:flex;gap:24px;margin-top:18px}
.l{flex:1.4}.rr{flex:1}
.lb{font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:.08em}
.amt{margin-top:14px;border:2px solid #b45309;border-radius:6px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center}
.amt b{font-size:26px;color:#b45309}
.words{color:#6b7280;font-size:12px;margin-top:4px}
.meta{border:1px solid #d1d5db;border-radius:6px}
.meta div{padding:8px 12px;border-bottom:1px solid #e5e7eb}.meta div:last-child{border:0}
.meta span{display:block;font-size:10.5px;color:#6b7280;text-transform:uppercase}
.sign{display:flex;gap:40px;margin-top:34px}
.sign div{flex:1;border-top:1px solid #9ca3af;padding-top:5px;color:#6b7280;font-size:12px}
table.tpl-items{width:100%;border-collapse:collapse;margin-top:12px}
table.tpl-items th,table.tpl-items td{border:1px solid #d1d5db;padding:6px 8px;text-align:left}
.r{text-align:right}
</style></head><body>
<div class="top">
 <div><h1>{{doc_title}}</h1><div class="no">{{doc_no}}</div></div>
 <div class="brand"><div><b>{{business_name}}</b>{{business_address}}<br>{{business_phone}}</div><div class="logo">{{logo_img}}</div></div>
</div>
<div class="body">
 <div class="l">
  <div class="lb">{{party_label}}</div><b style="font-size:18px">{{party_name}}</b><br>{{party_phone}}<br>{{party_address}}
  <div class="amt"><div><div class="lb">{{amount_label}}</div><div class="words">{{amount_words}}</div></div><b>{{amount}}</b></div>
 </div>
 <div class="rr"><div class="meta"><div><span>Date</span>{{date}}</div><div><span>Payment mode</span>{{payment_mode}}</div><div><span>Reference</span>{{reference}}</div></div></div>
</div>
{{applied_table}}
{{#if note}}<div class="words"><b>Note:</b> {{note}}</div>{{/if}}
{{#if show_sign}}<div class="sign"><div>{{sign_label_1}}</div><div>{{sign_label_2}}</div></div>{{/if}}
</body></html>`};
