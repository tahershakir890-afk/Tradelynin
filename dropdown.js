/* =====================================================================
 TradeLynin — one dropdown look everywhere (loaded after txlist.js)
 Every <select> in the app opens the same list as the product / customer pickers
 (the panel that opens right under the field), without the search bar and "+ New" button.
 The real <select> stays in the page, so every existing onchange / .value keeps working.
 Opt out for one select with  data-native  ·  searchable pickers (class "sp") are untouched.
 ===================================================================== */
let _dd=null;
function ddClose(){if(_dd){_dd.p.remove();_dd.b.remove();window.visualViewport&&visualViewport.removeEventListener('resize',_dd.pl);removeEventListener('scroll',_dd.sc,true);_dd=null}}
function ddOpen(s){ddClose();if(typeof srClose=='function')srClose();
 const b=document.createElement('div'),p=document.createElement('div');b.className='spb';p.className='spp spq';
 const L=[...s.options].map((o,i)=>({i,t:(o.textContent||'').trim()||'—',off:o.disabled||o.hidden})).filter(o=>!o.off);
 p.innerHTML=`<div class="spl" style="border-top:0">${L.map(o=>`<div class="sri${s.selectedIndex==o.i?' on':''}" data-i="${o.i}"><b>${esc(o.t)}</b></div>`).join('')||'<div class="sri k">No options</div>'}</div>`;
 document.body.append(b,p);
 const pl=()=>{const v=window.visualViewport,vh=v?v.height:innerHeight,R=s.getBoundingClientRect(),w=Math.min(Math.max(R.width,220),innerWidth-16),x=Math.min(Math.max(R.left,8),innerWidth-w-8),
  below=vh-R.bottom-10,above=R.top-10,up=below<220&&above>below,h=Math.max(140,Math.min(360,up?above:below));
  p.style.left=x+'px';p.style.width=w+'px';p.style.maxHeight=h+'px';if(up){p.style.top='auto';p.style.bottom=(innerHeight-R.top+4)+'px'}else{p.style.bottom='auto';p.style.top=(R.bottom+4)+'px'}};
 const sc=e=>{if(!(e.target&&e.target.closest&&e.target.closest('.spp')))ddClose()};
 p.addEventListener('click',e=>{const d=e.target.closest('.sri');if(!d||d.dataset.i==null)return;e.stopPropagation();s.selectedIndex=+d.dataset.i;ddClose();s.dispatchEvent(new Event('change',{bubbles:true}))});
 b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();ddClose()});
 _dd={p,b,pl,sc};window.visualViewport&&visualViewport.addEventListener('resize',pl);addEventListener('scroll',sc,true);pl();
 const on=p.querySelector('.on');if(on)on.scrollIntoView({block:'center'})}
const ddOk=s=>!s.classList.contains('sp')&&!s.multiple&&!s.disabled&&!s.hasAttribute('data-native');
function ddHit(x,y){const top=document.elementFromPoint(x,y);if(!top||top.closest('.spp,.spb'))return null;
 for(const s of document.querySelectorAll('select')){if(!ddOk(s))continue;const R=s.getBoundingClientRect();if(!R.width||!R.height||x<R.left||x>R.right||y<R.top||y>R.bottom)continue;const h=s.parentElement;if(h&&(h.contains(top)||top.contains(s)))return s}return null}
/* window + capture phase: runs before every other handler on the page */
addEventListener('click',e=>{if(_dd||(!e.clientX&&!e.clientY))return;const s=ddHit(e.clientX,e.clientY);if(s){e.preventDefault();e.stopPropagation();ddOpen(s)}},true);
addEventListener('keydown',e=>{if(_dd&&e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();ddClose();return}
 const s=document.activeElement;if(s&&s.tagName=='SELECT'&&ddOk(s)&&['Enter',' ','ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();ddOpen(s)}},true);
addEventListener('hashchange',ddClose);
