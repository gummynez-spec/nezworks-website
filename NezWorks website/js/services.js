/* ============ SERVICES PAGE — category tabs + helper interaction ============ */
(() => {
  /* ---------- category tabs ---------- */
  const tabs = document.querySelectorAll('.svc-tab');
  const emptyTitle = document.querySelector('.svc-empty-title');
  const emptyText = document.querySelector('.svc-empty-text');

  if (tabs.length) {
    /* read ?cat= from URL on load */
    const urlCat = new URLSearchParams(location.search).get('cat') || 'all';
    const matchTab = [...tabs].find(t => t.dataset.filter === urlCat);
    if (matchTab) {
      tabs.forEach(t => t.classList.remove('active'));
      matchTab.classList.add('active');
      updateEmptyState(urlCat);
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateEmptyState(tab.dataset.filter);

        /* update URL without reload */
        const url = new URL(location);
        url.searchParams.set('cat', tab.dataset.filter);
        history.pushState({}, '', url);
      });
    });

    function updateEmptyState(cat) {
      if (!emptyTitle || !emptyText) return;
      if (cat === 'all') {
        emptyTitle.textContent = 'COMING SOON';
        emptyText.textContent = "We're building something worth seeing.";
      } else {
        const names = { logo:'Logo', banner:'Banner', poster:'Poster', video:'Video', graphic:'Graphic Design', content:'Content' };
        emptyTitle.textContent = (names[cat] || cat) + ' — COMING SOON';
        emptyText.textContent = "We're curating the best " + (names[cat] || cat).toLowerCase() + " work for you.";
      }
    }

    /* browser back/forward */
    window.addEventListener('popstate', () => {
      const cat = new URLSearchParams(location.search).get('cat') || 'all';
      const match = [...tabs].find(t => t.dataset.filter === cat);
      if (match) {
        tabs.forEach(t => t.classList.remove('active'));
        match.classList.add('active');
        updateEmptyState(cat);
      }
    });
  }

  /* ---------- "Not sure where to start?" helper ---------- */
  const helperTrigger = document.getElementById('helperTrigger');
  const helperPanel = document.getElementById('helperPanel');
  if (helperTrigger && helperPanel) {
    helperTrigger.addEventListener('click', () => {
      helperPanel.classList.toggle('open');
      helperTrigger.textContent = helperPanel.classList.contains('open') ? 'CLOSE' : 'FIND MY SERVICE →';
    });
  }
})();
