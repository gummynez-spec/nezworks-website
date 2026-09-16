/* ============ FREELANCER WORKSPACE — create & manage work listings ============ */
(() => {
  const STORAGE = 'nw-works';
  const grid = document.getElementById('fwGrid');
  const empty = document.getElementById('fwEmpty');
  const home = document.getElementById('fwHome');
  const form = document.getElementById('workForm');
  const success = document.getElementById('workSuccess');
  if (!grid) return;

  const CAT_EMOJI = {
    'Graphic Design': '🎨', 'Logo and Branding': '✒️', 'Social Media Design': '📱',
    'Video Editing': '🎬', 'Content Creation': '✍️', 'Translation': '🌐',
  };
  const fmt = (n) => '฿' + (+n).toLocaleString('th-TH');

  let works = JSON.parse(sessionStorage.getItem(STORAGE) || '[]');

  function save() { sessionStorage.setItem(STORAGE, JSON.stringify(works)); }

  function freelancerId() {
    return sessionStorage.getItem('nw-freelancer-id') || null;
  }

  const supabaseReady = () => window.SB && typeof window.SB.from === 'function';

  function toRow(entry, fid) {
    return {
      freelancer_id: fid || null,
      title: entry.title,
      description: entry.desc,
      price: entry.price,
      cat: entry.cat,
      deliver: entry.deliver,
      cover_img: entry.coverImg,
      published: entry.published,
      views: entry.views || 0,
      orders: entry.orders || 0,
    };
  }

  function fromRow(r) {
    return {
      id: r.id || r._supabase_id,
      title: r.title,
      desc: r.description || r.desc || '',
      price: Number(r.price) || 0,
      cat: r.cat || 'Graphic Design',
      deliver: r.deliver || '3 days',
      coverImg: r.cover_img || r.coverImg || null,
      cover: r.cover_img ? null : (r.cover || null),
      published: r.published !== false,
      views: r.views || 0,
      orders: r.orders || 0,
    };
  }

  async function loadFromSupabase() {
    if (!supabaseReady()) return false;
    const fid = freelancerId();
    try {
      let q = window.SB.from('works').select('*').order('created_at', { ascending: false });
      if (fid) q = q.eq('freelancer_id', fid);
      else q = q.limit(40);
      const { data, error } = await q;
      if (error) throw error;
      if (Array.isArray(data) && data.length) {
        works = data.map(fromRow);
        save();
        return true;
      }
      if (Array.isArray(data) && data.length === 0 && fid) {
        works = [];
        save();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[NezWorks] works load failed (tables missing?):', e?.message || e);
      return false;
    }
  }

  /* ---------- rendering ---------- */
  function renderStats() {
    document.getElementById('stWorks').textContent = works.length;
    document.getElementById('stViews').textContent = works.reduce((s, w) => s + (w.views || 0), 0) + works.length * 37;
    document.getElementById('stOrders').textContent = works.reduce((s, w) => s + (w.orders || 0), 0);
  }

  function render() {
    renderStats();
    grid.innerHTML = '';
    empty.style.display = works.length ? 'none' : 'flex';
    works.forEach((w, i) => {
      const card = document.createElement('article');
      card.className = 'fw-card sr in';
      card.innerHTML = `
        <div class="fw-cover" style="background:${w.cover || 'linear-gradient(135deg,#2a2f52,#141833)'}">
          ${w.coverImg
            ? `<img src="${w.coverImg}" alt="">`
            : `<span class="fw-cover-emoji">${CAT_EMOJI[w.cat] || '✨'}</span>`}
          <span class="fw-cat-tag">${w.cat}</span>
        </div>
        <div class="fw-body">
          <h3>${w.title}</h3>
          <p>${w.desc.slice(0, 90)}${w.desc.length > 90 ? '…' : ''}</p>
          <div class="fw-meta">
            <span class="fw-price">${fmt(w.price)}</span>
            <span class="fw-deliver">⏱ ${w.deliver}</span>
          </div>
          <div class="fw-actions">
            <span class="fw-status ${w.published ? 'live' : ''}">${w.published ? '● LIVE' : '○ DRAFT'}</span>
            <span class="fw-edit-group">
              <button class="fw-btn edit" data-i="${i}" data-cursor="hover">Edit</button>
              <button class="fw-btn pub" data-i="${i}" data-cursor="hover">${w.published ? 'Unpublish' : 'Publish'}</button>
              <button class="fw-btn del" data-i="${i}" data-cursor="hover">Delete</button>
            </span>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  /* ---------- cover upload preview ---------- */
  const coverBox = document.getElementById('workCoverUpload');
  const coverInput = coverBox?.querySelector('input[type="file"]');
  let coverImgData = null;
  if (coverInput) {
    coverInput.addEventListener('change', () => {
      const f = coverInput.files[0];
      if (!f) return;
      coverBox.classList.add('filled');
      coverBox.querySelector('small').textContent = `✓ ${f.name}`;
      const reader = new FileReader();
      reader.onload = (e) => { coverImgData = e.target.result; };
      reader.readAsDataURL(f);
    });
  }

  /* ---------- price presets ---------- */
  const priceInput = document.getElementById('wPrice');
  document.querySelectorAll('#pricePresets .price-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      priceInput.value = btn.dataset.price;
      priceInput.focus();
    });
  });

  /* ---------- navigation between views ---------- */
  function showHome() {
    home.hidden = false; form.hidden = true; success.hidden = true;
    render();
    window.scrollTo({ top: 0, behavior: NW.reduced ? 'auto' : 'smooth' });
  }
  function showForm(editIdx = null) {
    home.hidden = true; success.hidden = true; form.hidden = false;
    form.dataset.editing = editIdx ?? '';
    document.getElementById('workFormTitle').textContent = editIdx !== null ? 'Edit work' : 'Create new work';
    if (editIdx !== null) {
      const w = works[editIdx];
      document.getElementById('wTitle').value = w.title;
      document.getElementById('wPrice').value = w.price;
      document.getElementById('wDesc').value = w.desc;
      form.querySelector(`input[name="wcat"][value="${w.cat}"]`).checked = true;
      form.querySelector(`input[name="wdeliver"][value="${w.deliver}"]`).checked = true;
    } else {
      form.reset();
      coverImgData = null;
      if (coverBox) {
        coverBox.classList.remove('filled');
        coverBox.querySelector('small').textContent = 'The hero image for this piece — 1:1 or larger recommended';
      }
    }
    window.scrollTo({ top: 0, behavior: NW.reduced ? 'auto' : 'smooth' });
  }

  const openCreate = () => showForm(null);
  document.getElementById('newWorkBtn')?.addEventListener('click', openCreate);
  document.getElementById('emptyCreateBtn')?.addEventListener('click', openCreate);
  document.getElementById('backToFw')?.addEventListener('click', (e) => { e.preventDefault(); showHome(); });
  document.getElementById('backHomeBtn')?.addEventListener('click', showHome);

  /* ---------- submit ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('wTitle').value.trim();
    const desc = document.getElementById('wDesc').value.trim();
    const price = Math.max(0, +document.getElementById('wPrice').value || 0);
    if (!title || !desc) return;

    const entry = {
      title, desc, price,
      cat: form.querySelector('input[name="wcat"]:checked').value,
      deliver: form.querySelector('input[name="wdeliver"]:checked').value,
      coverImg: coverImgData,
      published: true,
      views: 0, orders: 0,
    };

    const editing = form.dataset.editing;
    if (editing !== '' && works[+editing]) {
      const cur = works[+editing];
      Object.assign(cur, entry);
      if (cur.id && supabaseReady()) {
        try {
          const fid = freelancerId();
          const { error } = await window.SB.from('works').update(toRow(cur, fid)).eq('id', cur.id);
          if (error) throw error;
        } catch (err) { console.warn('[NezWorks] works update failed:', err?.message || err); }
      }
      save();
    } else {
      works.unshift(entry);
      if (supabaseReady()) {
        try {
          const fid = freelancerId();
          const { data: row, error } = await window.SB.from('works').insert([toRow(entry, fid)]).select().single();
          if (error) throw error;
          if (row?.id) works[0].id = row.id;
          save();
        } catch (err) { console.warn('[NezWorks] works insert failed (tables missing?):', err?.message || err); save(); }
      } else save();
    }

    document.getElementById('workSuccessMsg').textContent =
      `"${title}" is live — we'll notify you when someone's interested`;
    form.hidden = true;
    success.hidden = false;
    success.classList.add('play');
  });

  /* ---------- card actions (edit / publish / delete) ---------- */
  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.fw-btn');
    if (!btn) return;
    const i = +btn.dataset.i;
    if (btn.classList.contains('edit')) showForm(i);
    else if (btn.classList.contains('pub')) {
      works[i].published = !works[i].published;
      if (works[i].id && supabaseReady()) {
        try { await window.SB.from('works').update({ published: works[i].published }).eq('id', works[i].id); } catch (err) { console.warn('[NezWorks] works publish toggle failed:', err?.message || err); }
      }
      save(); render();
    }
    else if (btn.classList.contains('del')) {
      const id = works[i].id;
      works.splice(i, 1); save(); render();
      if (id && supabaseReady()) {
        try { await window.SB.from('works').delete().eq('id', id); } catch (err) { console.warn('[NezWorks] works delete failed:', err?.message || err); }
      }
    }
  });

  render();
  if (window.SB) loadFromSupabase().then((ok) => { if (ok) render(); }).catch(() => {});
})();