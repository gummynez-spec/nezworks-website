/* ============ SERVICES — related-service discovery + orbital line + filter tabs ============ */
(() => {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  const cards = [...grid.querySelectorAll('.service-card')];

  /* ---------- filter tabs ---------- */
  const tabs = document.querySelectorAll('.svc-tab');
  if (tabs.length) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        cards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('hide-card');
          } else {
            card.classList.add('hide-card');
          }
        });
      });
    });
  }

  cards.forEach((card) => {
    const rel = card.querySelector('.service-related');
    if (!rel) return;
    const items = (rel.dataset.related || '').split(',').map(s => s.trim()).filter(Boolean);
    items.forEach((label) => {
      const chip = document.createElement('span');
      chip.textContent = label;
      rel.appendChild(chip);
    });
  });

  /* hover discovery: dim others, illuminate related */
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      if (NW.reduced) return;
      grid.classList.add('dim-others');
      const myService = card.dataset.service;
      // related cards glow — find cards whose related list includes myService
      cards.forEach((other) => {
        if (other === card) return;
        const otherRel = other.querySelector('.service-related');
        const related = otherRel ? (otherRel.dataset.related || '') : '';
        const isRelated = related.split(',').map(s => s.trim()).includes(myService);
        other.classList.toggle('related-lit', isRelated);
      });
    });
    card.addEventListener('mouseleave', () => {
      grid.classList.remove('dim-others');
      cards.forEach((c) => c.classList.remove('related-lit'));
    });
  });
})();
