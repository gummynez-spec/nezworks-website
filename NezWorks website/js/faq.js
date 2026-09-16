/* ============ FAQ — search + category filter ============ */
(() => {
  const grid = document.getElementById('faqGrid');
  if (!grid) return;

  const input = document.getElementById('faqSearch');
  const catBtns = [...document.querySelectorAll('.faq-cat')];
  const emptyBox = document.getElementById('faqEmpty');

  let curCat = 'all';
  let query = '';

  function apply() {
    const q = query.trim().toLowerCase();
    let visible = 0;

    grid.querySelectorAll('.faq-item').forEach(item => {
      const catOk = curCat === 'all' || item.dataset.cat === curCat;
      const tags = (item.dataset.tags || item.textContent).toLowerCase();
      const qOk = !q || tags.indexOf(q) !== -1;
      const show = catOk && qOk;
      item.classList.toggle('hidden', !show);
      if (show) visible++;
      if (!qOk) item.removeAttribute('open');
    });

    grid.classList.toggle('hidden-all', !!q || curCat !== 'all');
    grid.querySelectorAll('.faq-group-head').forEach(h => h.classList.toggle('hidden', !!q));

    if (emptyBox) emptyBox.hidden = visible !== 0;
    if (grid) grid.style.display = visible === 0 && emptyBox ? 'none' : '';
  }

  input?.addEventListener('input', () => { query = input.value; apply(); });

  catBtns.forEach(btn => btn.addEventListener('click', () => {
    curCat = btn.dataset.cat;
    catBtns.forEach(b => b.classList.toggle('active', b === btn));
    apply();
  }));

  apply();
})();