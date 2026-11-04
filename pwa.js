
if('serviceWorker' in navigator&&location.protocol!='file:')addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
let _ip;addEventListener('beforeinstallprompt',e=>{e.preventDefault();_ip=e;if(document.getElementById('inst'))return;const b=document.createElement('button');b.id='inst';b.className='g s';b.textContent='Install App';b.style.marginLeft='auto';b.onclick=async()=>{_ip.prompt();await _ip.userChoice;b.remove()};const h=document.getElementById('hb');h.style.marginLeft='0';h.parentNode.insertBefore(b,h)});
addEventListener('appinstalled',()=>{const b=document.getElementById('inst');b&&b.remove()});
