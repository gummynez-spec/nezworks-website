/* ============ SERVICES SIDE PANEL — open/close + category filter ============ */
(() => {
  const panel = document.getElementById('svcPanel');
  const overlay = document.getElementById('svcOverlay');
  const trigger = document.querySelector('.nav-link-parent');
  if (!panel || !trigger) return;

  const chevron = trigger.querySelector('.nav-chevron');
  const li = trigger.closest('li');

  function openPanel() {
    document.body.classList.add('svc-panel-open');
    li && li.classList.add('svc-open');
  }
  function closePanel() {
    document.body.classList.remove('svc-panel-open');
    li && li.classList.remove('svc-open');
  }
  function togglePanel() {
    document.body.classList.contains('svc-panel-open') ? closePanel() : openPanel();
  }

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    togglePanel();
  });
  overlay && overlay.addEventListener('click', closePanel);

  /* close on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });

  /* highlight active category on services page */
  if (location.pathname.includes('services.html')) {
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || 'all';
    panel.querySelectorAll('.svc-panel-link').forEach((a) => {
      const aCat = new URL(a.href).searchParams.get('cat');
      if (aCat === cat) a.classList.add('active');
      else a.classList.remove('active');
    });
  }
})();
