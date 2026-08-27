(() => {
  const mount = document.querySelector('[data-printflow-frame]');
  if (!mount) return;
  const cfg = window.ADVANCED_PRINTFLOW || {};
  let base = String(cfg.baseUrl || '').replace(/\/$/, '');
  const previewBase = new URLSearchParams(location.search).get('printflow');
  if (previewBase) base = previewBase.replace(/\/$/, '');

  if (!base) {
    mount.innerHTML = '<div class="printflow-loading printflow-needs-config"><strong>PrintFlow connection ready.</strong><span>Set <code>baseUrl</code> in <code>/assets/js/printflow-config.js</code> after the PrintFlow deployment URL is confirmed.</span><a class="btn btn-light" href="/order/quote/">Use Custom Quote Instead</a></div>';
    return;
  }

  const path = cfg.customPath || `/s/${encodeURIComponent(cfg.shopSlug || '')}`;
  const frame = document.createElement('iframe');
  frame.className = 'printflow-frame';
  frame.title = 'Advanced Embroidery custom apparel ordering tool';
  frame.src = base + path;
  frame.loading = 'eager';
  frame.setAttribute('allow', 'clipboard-write');
  mount.innerHTML = '';
  mount.appendChild(frame);

  window.addEventListener('message', (event) => {
    if (event.origin !== base || !event.data || event.data.type !== 'printflow:resize') return;
    frame.style.height = `${Math.max(900, Number(event.data.height) || 1250)}px`;
  });
})();
