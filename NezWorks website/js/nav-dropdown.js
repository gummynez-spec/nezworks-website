/* ============ NAV DROPDOWN — Services flyout (mobile tap + active state) ============ */
(() => {
  const svcLi = document.querySelector('.nav-links > li');
  if (!svcLi) return;

  /* mobile tap toggle */
  const trigger = svcLi.querySelector('.nav-link-parent');
  trigger.addEventListener('click', (e) => {
    if (window.innerWidth > 820) return;
    e.preventDefault();
    svcLi.classList.toggle('svc-open');
  });

  /* close on outside tap */
  document.addEventListener('click', (e) => {
    if (!svcLi.contains(e.target)) svcLi.classList.remove('svc-open');
  });

  /* highlight active category on services page */
  if (location.pathname.includes('services.html')) {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || 'all';
    const links = svcLi.querySelectorAll('.svc-dropdown a');
    links.forEach((a) => {
      const aCat = new URL(a.href).searchParams.get('cat');
      if (aCat === cat) a.classList.add('svc-active');
    });
  }
})();
