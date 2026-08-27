(function(){
 const mount=document.querySelector('[data-printflow-frame]'); if(!mount)return;
 const cfg=window.ADVANCED_CONFIG||{}; let base=String(cfg.printflowBaseUrl||'').replace(/\/$/,'');
 const qp=new URLSearchParams(location.search).get('printflow'); if(qp) base=qp.replace(/\/$/,'');
 if(!base){mount.innerHTML='<div class="engine-loading"><span class="pill">PrintFlow ready</span><h2>Connect the production URL.</h2><p>The Advanced storefront is built and ready to use PrintFlow. Set <code>printflowBaseUrl</code> in <code>assets/js/config.js</code> after the PrintFlow deployment URL is confirmed.</p><p><a class="btn btn-secondary" href="../contact.html">Contact Advanced</a></p></div>';return}
 const path=cfg.customPath||('/s/'+encodeURIComponent(cfg.printflowShopSlug));
 const frame=document.createElement('iframe'); frame.className='engine-frame';frame.title='Advanced Embroidery custom apparel designer';frame.src=base+path;frame.setAttribute('loading','eager');mount.innerHTML='';mount.appendChild(frame);
 window.addEventListener('message',e=>{if(e.origin!==base||!e.data||e.data.type!=='printflow:resize')return; frame.style.height=Math.max(900,Number(e.data.height)||1250)+'px'})
})();