/* ============ SERVICES PAGE — sidebar filter + category nav ============ */
(() => {
  const page = document.querySelector('.svc-page');
  if (!page) return;

  const links = document.querySelectorAll('.svc-side-link');
  const empty = document.getElementById('svcEmpty');
  const portfolio = document.getElementById('svcPortfolio');

  /* read ?cat= from URL */
  const params = new URLSearchParams(location.search);
  const cat = params.get('cat') || 'all';

  /* highlight active sidebar link */
  links.forEach((link) => {
    const linkCat = new URL(link.href).searchParams.get('cat');
    if (linkCat === cat) link.classList.add('active');
    else link.classList.remove('active');
  });

  /* category switch: update URL without reload */
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const newCat = new URL(link.href).searchParams.get('cat');
      const url = new URL(location);
      url.searchParams.set('cat', newCat);
      history.pushState({}, '', url);

      /* update active state */
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      /* show/hide empty state (placeholder for future portfolio) */
      if (newCat === 'all') {
        empty.querySelector('.svc-empty-text').textContent = 'Creative work is coming soon.';
        empty.querySelector('.svc-empty-sub').textContent = 'Select a category from the sidebar to explore services.';
      } else {
        const label = link.textContent.trim();
        empty.querySelector('.svc-empty-text').textContent = label + ' projects coming soon.';
        empty.querySelector('.svc-empty-sub').textContent = 'We\'re curating the best ' + label.toLowerCase() + ' work for you.';
      }
    });
  });

  /* browser back/forward */
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(location.search);
    const c = p.get('cat') || 'all';
    links.forEach((link) => {
      const linkCat = new URL(link.href).searchParams.get('cat');
      if (linkCat === c) link.classList.add('active');
      else link.classList.remove('active');
    });
  });
})();
