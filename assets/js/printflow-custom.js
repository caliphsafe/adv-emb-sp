(() => {
  const mount = document.querySelector('[data-printflow-frame]');
  if (!mount) return;

  const cfg = window.ADVANCED_PRINTFLOW || {};
  let base = String(cfg.baseUrl || '').replace(/\/$/, '');
  const previewBase = new URLSearchParams(location.search).get('printflow');

  if (previewBase) {
    base = previewBase.replace(/\/$/, '');
  }

  if (!base) {
    mount.innerHTML =
      '<div class="printflow-loading printflow-needs-config">' +
      '<strong>PrintFlow connection ready.</strong>' +
      '<span>Set <code>baseUrl</code> in <code>/assets/js/printflow-config.js</code> after the PrintFlow deployment URL is confirmed.</span>' +
      '<a class="btn btn-light" href="/order/quote/">Use Custom Quote Instead</a>' +
      '</div>';
    return;
  }

  let expectedOrigin;

  try {
    expectedOrigin = new URL(base).origin;
  } catch {
    mount.innerHTML =
      '<div class="printflow-loading printflow-needs-config">' +
      '<strong>PrintFlow URL is invalid.</strong>' +
      '<a class="btn btn-light" href="/order/quote/">Use Custom Quote Instead</a>' +
      '</div>';
    return;
  }

  const path =
    cfg.customPath || `/s/${encodeURIComponent(cfg.shopSlug || '')}`;

  const frameUrl = new URL(base + path);
  frameUrl.searchParams.set('embed', '1');

  const frame = document.createElement('iframe');
  frame.className = 'printflow-frame';
  frame.title = 'Advanced Embroidery custom apparel ordering tool';
  frame.src = frameUrl.toString();
  frame.loading = 'eager';
  frame.setAttribute('allow', 'clipboard-write');
  frame.setAttribute('scrolling', 'no');
  frame.style.height = '1250px';
  frame.style.overflow = 'hidden';

  mount.innerHTML = '';
  mount.appendChild(frame);

  let lastHeight = 1250;
  let pendingHeight = 0;
  let resizeFrame = 0;

  const commitHeight = () => {
    resizeFrame = 0;

    let next = Math.ceil(Number(pendingHeight) || 0);
    if (!Number.isFinite(next) || next <= 0) return;

    /*
      A real custom-order flow can be several thousand pixels tall. The upper
      safety bound prevents a bad child measurement from recreating an
      unbounded iframe while remaining far above the legitimate storefront
      height.
    */
    next = Math.max(900, Math.min(next, 16000));

    if (Math.abs(next - lastHeight) < 3) return;

    lastHeight = next;
    frame.style.height = `${next}px`;
  };

  window.addEventListener('message', (event) => {
    if (
      event.origin !== expectedOrigin ||
      event.source !== frame.contentWindow ||
      !event.data ||
      event.data.type !== 'printflow:resize'
    ) {
      return;
    }

    pendingHeight = event.data.height;

    if (resizeFrame) return;
    resizeFrame = requestAnimationFrame(commitHeight);
  });
})();
