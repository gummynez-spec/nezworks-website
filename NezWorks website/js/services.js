/* ============ SERVICES PAGE — sidebar category switching (glider radio) ============ */
(() => {
  const radios = [...document.querySelectorAll('input[name="svc-cat"]')];
  const descs = document.querySelectorAll('.svc-cat-desc');
  if (!radios.length) return;

  const byValue = Object.fromEntries(radios.map(r => [r.value, r]));

  /* read ?cat= from URL */
  const urlCat = new URLSearchParams(location.search).get('cat') || 'all';

  function switchCat(cat) {
    const radio = byValue[cat];
    if (radio && !radio.checked) radio.checked = true;
    descs.forEach(d => {
      d.style.display = d.dataset.cat === cat ? '' : 'none';
    });
    /* re-trigger animation */
    const content = document.getElementById('svcCatContent');
    if (content) {
      content.style.animation = 'none';
      content.offsetHeight;
      content.style.animation = '';
    }
  }

  /* initial state */
  switchCat(urlCat);

  /* change handlers (also handles keyboard) */
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      const cat = radio.value;
      switchCat(cat);
      const url = new URL(location);
      url.searchParams.set('cat', cat);
      history.pushState({}, '', url);
    });
  });

  /* browser back/forward */
  window.addEventListener('popstate', () => {
    const cat = new URLSearchParams(location.search).get('cat') || 'all';
    switchCat(cat);
  });

  /* show "Create new project" button for freelancers only */
  const createBtn = document.getElementById('svcCreateBtn');
  if (createBtn) {
    try {
      const f = JSON.parse(sessionStorage.getItem('nw-freelancer') || 'null');
      if (f && f.name) createBtn.style.display = '';
    } catch (e) {}
  }
})();