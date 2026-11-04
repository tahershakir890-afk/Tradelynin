/* TradeLynin — Home screen switches + route guard for switched-off features (loaded after followup.js).
   The switches themselves live in Settings → each category → Features (see FEATC in settings2.js). */
(function(){
const hideSec=(root,re)=>{[...root.querySelectorAll('.hx-sec')].forEach(s=>{if(re.test(s.textContent.trim())){const n=s.nextElementSibling;if(n)n.remove();s.remove()}})};
const _vd=V.dash;
V.dash=function(){
 const h=_vd.apply(this,arguments);
 if(!['d_fu','d_week','d_tiles','d_attn','d_pend','d_recent','d_rx','followups','recurring'].some(k=>!FT(k)))return h;
 const r=document.createElement('div');r.innerHTML=h;
 const rm=sel=>r.querySelectorAll(sel).forEach(e=>e.remove());
 if(!FT('d_fu')||!FT('followups'))rm('.fu-d');
 if(!FT('d_rx')||!FT('recurring'))rm('.lr-c');
 if(!FT('d_week')){[...r.querySelectorAll('.hx-card')].forEach(e=>{if(e.querySelector('.hx-bars'))e.remove()})}
 if(!FT('d_tiles'))rm('.hx-tiles');
 if(!FT('d_attn'))hideSec(r,/^Needs attention$/);
 if(!FT('d_pend'))hideSec(r,/^Pending money$/);
 if(!FT('d_recent')){hideSec(r,/^Recent activity$/);[...r.querySelectorAll('.row')].forEach(e=>{if(e.querySelector('button[onclick*="alltx"]')&&e.parentNode===r)e.remove()})}
 return r.innerHTML};
/* a switched-off screen cannot be opened from an old link or bookmark */
const _go=go;
go=function(keep){if(!FT('followups')&&location.hash=='#followups'){history.replaceState(null,'','#parties')}return _go.apply(this,arguments)};
})();
