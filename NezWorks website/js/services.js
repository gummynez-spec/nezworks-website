/* ============ SERVICES PAGE — category switch + work listings from Supabase ============ */
(() => {
  const radios = [...document.querySelectorAll('input[name="svc-cat"]')];
  const descs = document.querySelectorAll('.svc-cat-desc');
  const catContent = document.getElementById('svcCatContent');
  if (!radios.length || !catContent) return;

  const byValue = Object.fromEntries(radios.map(r => [r.value, r]));
  const urlCat = new URLSearchParams(location.search).get('cat') || 'all';

  const fmt = (n) => '฿' + (+n).toLocaleString('th-TH');
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* Map sidebar values → Supabase work categories */
  const CAT_MAP = {
    logo:       ['Logo and Branding'],
    banner:     ['Social Media Design'],
    poster:     ['Graphic Design'],
    video:      ['Video Editing'],
    graphic:    ['Graphic Design', 'Social Media Design'],
    content:    ['Content Creation'],
    translator: ['Translation'],
  };

  let allWorks = [];
  let currentCat = urlCat;

  /* ---------- Load works from Supabase ---------- */
  async function loadWorks() {
    const c = window.SB;
    if (!c) return;
    try {
      const { data, error } = await c.from('works')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      allWorks = data || [];
    } catch (e) {
      console.warn('[NezWorks] services load works:', e?.message || e);
    }
  }

  /* ---------- Filter works for a category ---------- */
  function worksForCat(cat) {
    if (cat === 'all') return allWorks;
    const matchCats = CAT_MAP[cat] || [];
    return allWorks.filter(w => matchCats.includes(w.cat));
  }

  /* ---------- Render work cards ---------- */
  function renderWorkCard(w) {
    const tags = Array.isArray(w.tags) ? w.tags : [];
    const tagHtml = tags.slice(0, 3).map(t => `<span class="svc-work-tag">${esc(t)}</span>`).join('');
    return `
      <a href="work-detail.html?id=${w.id}" class="svc-work-card" data-cursor="explore">
        <div class="svc-work-img">
          ${w.cover_img
            ? `<img src="${w.cover_img}" alt="${esc(w.title)}" loading="lazy">`
            : `<div class="svc-work-placeholder">${catEmoji(w.cat)}</div>`}
          <span class="svc-work-price">${fmt(w.price)}</span>
        </div>
        <div class="svc-work-body">
          <h3 class="svc-work-title">${esc(w.title)}</h3>
          <p class="svc-work-desc">${esc((w.description || '').slice(0, 80))}${(w.description || '').length > 80 ? '…' : ''}</p>
          <div class="svc-work-meta">
            <span class="svc-work-creator">${esc(w.freelancer_name || 'Creator')}</span>
            <span class="svc-work-deliver">⏱ ${esc(w.deliver || '3 days')}</span>
            <span class="svc-work-rev">✏️ ${w.revisions ?? 2} rev</span>
          </div>
          ${tagHtml ? `<div class="svc-work-tags">${tagHtml}</div>` : ''}
        </div>
      </a>`;
  }

  function catEmoji(cat) {
    const m = { 'Graphic Design': '🎨', 'Logo and Branding': '✒️', 'Social Media Design': '📱', 'Video Editing': '🎬', 'Content Creation': '✍️', 'Translation': '🌐' };
    return m[cat] || '✨';
  }

  /* ---------- Render all work sections ---------- */
  function renderWorks() {
    /* Remove old work grids */
    catContent.querySelectorAll('.svc-work-section').forEach(el => el.remove());

    const cat = currentCat;
    const works = worksForCat(cat);

    if (cat === 'all') {
      /* Show all categories with works */
      const cats = ['logo', 'banner', 'poster', 'video', 'graphic', 'content', 'translator'];
      cats.forEach(c => {
        const catWorks = worksForCat(c);
        if (catWorks.length === 0) return;
        const section = document.createElement('div');
        section.className = 'svc-work-section';
        section.innerHTML = `
          <div class="svc-work-section-head">
            <h3>${c.charAt(0).toUpperCase() + c.slice(1)}</h3>
            <span class="svc-work-count">${catWorks.length} work${catWorks.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="svc-work-grid">${catWorks.map(renderWorkCard).join('')}</div>`;
        catContent.appendChild(section);
      });

      /* Uncategorized works */
      const uncategorized = allWorks.filter(w => {
        return !Object.values(CAT_MAP).some(cats => cats.includes(w.cat));
      });
      if (uncategorized.length > 0) {
        const section = document.createElement('div');
        section.className = 'svc-work-section';
        section.innerHTML = `
          <div class="svc-work-section-head">
            <h3>Other</h3>
            <span class="svc-work-count">${uncategorized.length} work${uncategorized.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="svc-work-grid">${uncategorized.map(renderWorkCard).join('')}</div>`;
        catContent.appendChild(section);
      }
    } else {
      /* Single category */
      if (works.length === 0) {
        const section = document.createElement('div');
        section.className = 'svc-work-section';
        section.innerHTML = `
          <div class="svc-work-empty">
            <p>No works in this category yet.</p>
            <p class="svc-work-empty-hint">Freelancers can publish their work from the <a href="freelancer.html">workspace</a>.</p>
          </div>`;
        catContent.appendChild(section);
      } else {
        const section = document.createElement('div');
        section.className = 'svc-work-section';
        section.innerHTML = `<div class="svc-work-grid">${works.map(renderWorkCard).join('')}</div>`;
        catContent.appendChild(section);
      }
    }
  }

  /* ---------- Category switching ---------- */
  function switchCat(cat) {
    currentCat = cat;
    const radio = byValue[cat];
    if (radio && !radio.checked) radio.checked = true;
    descs.forEach(d => { d.style.display = d.dataset.cat === cat ? '' : 'none'; });
    renderWorks();
    /* re-trigger animation */
    catContent.style.animation = 'none';
    catContent.offsetHeight;
    catContent.style.animation = '';
  }

  /* initial state */
  switchCat(urlCat);

  /* change handlers */
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      switchCat(radio.value);
      const url = new URL(location);
      url.searchParams.set('cat', radio.value);
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

  /* load works then render */
  if (window.SB) {
    loadWorks().then(() => renderWorks());
  }
})();
