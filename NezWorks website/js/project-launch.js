/* ============ PROJECT PAGE — category select + price pills + launch ============ */
(() => {
  const catGrid = document.getElementById('catGrid');
  const launchCatName = document.getElementById('launchCatName');
  const launchCatSub = document.getElementById('launchCatSub');
  const pills = document.querySelectorAll('.price-pill');

  const CATS = {
    logo:    { name: 'Logo Design', sub: 'Marks, wordmarks, full identity — from $150' },
    banner:  { name: 'Banner', sub: 'Web, ads, social headers — from $30' },
    poster:  { name: 'Poster', sub: 'Events, promos, prints — from $45' },
    content: { name: 'Content', sub: 'Captions, copy, blog systems — from $25' },
    video:   { name: 'Video Editing', sub: 'Cutdowns, reels, YouTube — from $60' },
    graphic: { name: 'Graphic Design', sub: 'Social kits, decks, merch — from $35' },
    menu:    { name: 'Menu', sub: 'Restaurant, café, digital boards — from $80' },
    more:    { name: 'Something else', sub: 'Web, UI/UX, campaigns — tell us the goal' },
  };

  const state = { cat: null, price: null };

  /* category selection */
  catGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.cat-card');
    if (!card) return;
    catGrid.querySelectorAll('.cat-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    state.cat = card.dataset.cat;
    const c = CATS[state.cat];
    launchCatName.textContent = c.name;
    launchCatSub.textContent = c.sub;
  });

  /* price pills */
  pills.forEach(p => {
    p.addEventListener('click', () => {
      pills.forEach(o => o.classList.remove('selected'));
      p.classList.add('selected');
      state.price = p.dataset.price;
    });
  });

  /* launch — store selection, open home modal prefilled (graceful fallback: go to home #start) */
  const launchBtn = document.getElementById('launchBtn');
  launchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.cat || state.price) {
      sessionStorage.setItem('nw-launch', JSON.stringify(state));
    }
    window.location.href = 'index.html#start';
  });
})();
