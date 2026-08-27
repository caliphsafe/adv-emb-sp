(() => {
  const form = document.querySelector('#uniformForm.js-printflow-uniform');
  if (!form) return;
  const cfg = window.ADVANCED_PRINTFLOW || {};
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');
  const totalEl = document.querySelector('#uniformTotal');
  const deadline = form.querySelector('[data-rush-date]');
  const priceInputs = [...form.querySelectorAll('[data-price]')];
  const productMap = {
    Y500: 'espirito-youth-red-short-polo',
    K500: 'espirito-adult-red-short-polo',
    Y500LS: 'espirito-youth-red-long-polo',
    K500LS: 'espirito-adult-red-long-polo',
    '29B': 'espirito-youth-navy-tee',
    '29M': 'espirito-adult-navy-tee'
  };

  const money = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(value);
  const rushFee = () => {
    if (!deadline?.value) return 0;
    const now = new Date(); now.setHours(0,0,0,0);
    const selected = new Date(`${deadline.value}T00:00:00`);
    const days = Math.ceil((selected - now) / 86400000);
    if (days < 0) return 0;
    if (days < 10) return 100;
    if (days <= 15) return 50;
    return 0;
  };
  const merchandise = () => priceInputs.reduce((sum, input) => sum + Math.max(0, Number(input.value)||0) * Number(input.dataset.price||0), 0);
  const updateDisplayedTotal = () => { if (totalEl) totalEl.textContent = money(merchandise() + rushFee()); };
  priceInputs.forEach(input => input.addEventListener('input', () => setTimeout(updateDisplayedTotal)));
  deadline?.addEventListener('input', () => setTimeout(updateDisplayedTotal));
  deadline?.addEventListener('change', () => setTimeout(updateDisplayedTotal));
  setTimeout(updateDisplayedTotal);

  const selectedItems = () => {
    const grouped = new Map();
    for (const input of priceInputs) {
      const quantity = Math.max(0, Math.floor(Number(input.value)||0));
      if (!quantity) continue;
      const code = input.name.split('_')[0];
      const productSlug = productMap[code];
      if (!productSlug) continue;
      if (!grouped.has(productSlug)) grouped.set(productSlug, []);
      grouped.get(productSlug).push({ size: input.dataset.size, quantity });
    }
    return [...grouped].map(([productSlug, quantities]) => ({ productSlug, quantities }));
  };
  const show = (message, type='error') => {
    if (!status) return;
    status.className = `form-status show ${type}`;
    status.textContent = message;
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const items = selectedItems();
    if (!items.length) { show('Choose at least one uniform size and quantity before checkout.'); return; }
    const base = String(cfg.baseUrl || '').replace(/\/$/, '');
    if (!base) { show('The secure Square checkout connection is ready, but the PrintFlow production URL still needs to be set in /assets/js/printflow-config.js.'); return; }
    const data = new FormData(form);
    const body = {
      shopSlug: cfg.shopSlug,
      storefrontSlug: cfg.uniformStorefrontSlug,
      requestedDueDate: String(data.get('deadline') || ''),
      customer: {
        name: `${String(data.get('firstName')||'').trim()} ${String(data.get('lastName')||'').trim()}`.trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim()
      },
      metadata: {
        studentName: String(data.get('studentName') || '').trim(),
        grade: String(data.get('grade') || '').trim(),
        notes: String(data.get('notes') || '').trim(),
        rushWindow: String(data.get('rushWindow') || ''),
        rushCharge: String(data.get('rushCharge') || '')
      },
      items
    };
    if (submit) { submit.disabled = true; submit.textContent = 'Preparing Secure Checkout…'; }
    show('Preparing your secure Square checkout…', '');
    try {
      const response = await fetch(`${base}/api/public/storefront-orders/start`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || 'Unable to start secure checkout.');
      location.href = result.checkoutUrl;
    } catch (error) {
      show(error instanceof Error ? error.message : 'Unable to start secure checkout.');
      if (submit) { submit.disabled = false; submit.textContent = 'Continue to Secure Square Checkout'; }
    }
  });
})();
