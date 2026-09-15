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

  /*
    The Advanced page has old fallback CSS with a 1200px iframe min-height.
    Inline values intentionally neutralize that legacy rule so Customize can
    become a browser-sized viewport instead of a full-document-height iframe.
  */
  mount.style.minHeight = '0';
  frame.style.display = 'block';
  frame.style.width = '100%';
  frame.style.height = '1250px';
  frame.style.minHeight = '0';
  frame.style.border = '0';
  frame.style.overflow = 'hidden';

  mount.innerHTML = '';
  mount.appendChild(frame);

  let view = 'products';
  let lastContentHeight = 1250;
  let lastAppliedHeight = 1250;
  let pendingHeight = 0;
  let resizeFrame = 0;

  const desktop = window.matchMedia('(min-width: 1041px)');

  const viewportHeight = () => {
    const visualHeight =
      window.visualViewport && window.visualViewport.height;

    const available =
      Number(visualHeight || window.innerHeight || 900);

    /*
      Leave room for the Advanced sticky navigation while still giving
      PrintFlow enough room to show the full garment workspace.
    */
    return Math.max(
      640,
      Math.min(900, Math.floor(available - 120))
    );
  };

  const fixedCustomizer = () =>
    view === 'customize' && desktop.matches;

  const setFrameHeight = (value) => {
    let next = Math.ceil(Number(value) || 0);
    if (!Number.isFinite(next) || next <= 0) return;

    next = Math.max(620, Math.min(next, 16000));

    if (Math.abs(next - lastAppliedHeight) < 3) return;

    lastAppliedHeight = next;
    frame.style.height = `${next}px`;
  };

  const applyViewMode = () => {
    /*
      Product catalog:
      - iframe follows its content, as before.

      Desktop Customize:
      - iframe becomes a real viewport.
      - PrintFlow keeps the garment column stationary.
      - PrintFlow scrolls only the right configuration column.
      - child content-height messages are ignored until Products is reopened.

      Tablet/mobile:
      - returns to normal content-height behavior and the one-column layout.
    */
    if (fixedCustomizer()) {
      frame.setAttribute('scrolling', 'no');
      frame.style.overflow = 'hidden';
      setFrameHeight(viewportHeight());
      return;
    }

    frame.setAttribute('scrolling', 'no');
    frame.style.overflow = 'hidden';
    setFrameHeight(lastContentHeight || 1250);
  };

  const commitHeight = () => {
    resizeFrame = 0;

    if (fixedCustomizer()) return;

    let next = Math.ceil(Number(pendingHeight) || 0);
    if (!Number.isFinite(next) || next <= 0) return;

    lastContentHeight = Math.max(
      620,
      Math.min(next, 16000)
    );

    applyViewMode();
  };

  window.addEventListener('message', (event) => {
    if (
      event.origin !== expectedOrigin ||
      event.source !== frame.contentWindow ||
      !event.data
    ) {
      return;
    }

    if (event.data.type === 'printflow:view') {
      if (
        event.data.view === 'products' ||
        event.data.view === 'customize'
      ) {
        view = event.data.view;
      }

      const reported = Math.ceil(
        Number(event.data.height) || 0
      );

      if (reported > 0 && !fixedCustomizer()) {
        lastContentHeight = Math.max(
          620,
          Math.min(reported, 16000)
        );
      }

      applyViewMode();
      return;
    }

    if (event.data.type !== 'printflow:resize') {
      return;
    }

    pendingHeight = event.data.height;

    /*
      This is the important part of the fix:
      never grow the iframe to the entire Customize document. Doing that would
      destroy the iframe viewport that sticky/fixed-column behavior requires.
    */
    if (fixedCustomizer()) return;
    if (resizeFrame) return;

    resizeFrame = requestAnimationFrame(commitHeight);
  });

  window.addEventListener('resize', applyViewMode);

  if (desktop.addEventListener) {
    desktop.addEventListener('change', applyViewMode);
  } else if (desktop.addListener) {
    desktop.addListener(applyViewMode);
  }
})();
