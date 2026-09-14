/* ============ SERVICES PAGE — sidebar category switching ============ */
(() => {
  const btns = document.querySelectorAll('.svc-side-btn');
  const descs = document.querySelectorAll('.svc-cat-desc');
  if (!btns.length) return;

  /* read ?cat= from URL */
  const urlCat = new URLSearchParams(location.search).get('cat') || 'all';

  function switchCat(cat) {
    btns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
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

  /* click handlers */
  btns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
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
})();
