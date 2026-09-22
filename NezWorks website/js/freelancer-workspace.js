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
    'Video Editing': '🎬', 'Content Creation': '✍️', 'Translation': '🌐', 'Ads Buyer': '📢',
  };
  const fmt = (n) => '฿' + (+n).toLocaleString('th-TH');

  let works = JSON.parse(sessionStorage.getItem(STORAGE) || '[]');
  let galleryImages = []; /* base64 data URLs for new uploads */

  function save() { sessionStorage.setItem(STORAGE, JSON.stringify(works)); }

  function freelancerId() {
    return sessionStorage.getItem('nw-freelancer-id') || null;
  }

  function freelancerName() {
    try {
      const f = JSON.parse(sessionStorage.getItem('nw-freelancer') || 'null');
      return f?.displayName || f?.name || '';
    } catch (e) { return ''; }
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
      revisions: entry.revisions || 2,
      tags: entry.tags || [],
      gallery: entry.gallery || [],
      freelancer_name: entry.freelancerName || freelancerName(),
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
      revisions: r.revisions ?? 2,
      tags: Array.isArray(r.tags) ? r.tags : [],
      gallery: Array.isArray(r.gallery) ? r.gallery : [],
      freelancerName: r.freelancer_name || '',
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
    document.getElementById('stViews').textContent = works.reduce((s, w) => s + (w.views || 0), 0);
    document.getElementById('stOrders').textContent = works.reduce((s, w) => s + (w.orders || 0), 0);
  }

  function render() {
    renderStats();
    grid.innerHTML = '';
    empty.style.display = works.length ? 'none' : 'flex';
    works.forEach((w, i) => {
      const card = document.createElement('article');
      card.className = 'fw-card sr in';
      card.dataset.i = i;
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
            <span class="fw-rev">✏️ ${w.revisions} rev</span>
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

  /* ---------- gallery upload ---------- */
  const galleryBox = document.getElementById('workGalleryUpload');
  const galleryInput = galleryBox?.querySelector('input[type="file"]');
  const galleryPreview = document.getElementById('galleryPreview');

  function renderGalleryPreview() {
    if (!galleryPreview) return;
    galleryPreview.innerHTML = '';
    galleryImages.forEach((img, idx) => {
      const div = document.createElement('div');
      div.className = 'gp-thumb';
      div.innerHTML = `<img src="${img}" alt="Gallery ${idx + 1}"><button class="gp-remove" data-idx="${idx}">✕</button>`;
      div.querySelector('.gp-remove').addEventListener('click', () => {
        galleryImages.splice(idx, 1);
        renderGalleryPreview();
      });
      galleryPreview.appendChild(div);
    });
  }

  if (galleryInput) {
    galleryInput.addEventListener('change', () => {
      const files = Array.from(galleryInput.files);
      const remaining = 5 - galleryImages.length;
      const toAdd = files.slice(0, remaining);
      toAdd.forEach(f => {
        const reader = new FileReader();
        reader.onload = (e) => {
          galleryImages.push(e.target.result);
          renderGalleryPreview();
        };
        reader.readAsDataURL(f);
      });
      galleryInput.value = '';
      galleryBox.classList.add('filled');
      galleryBox.querySelector('small').textContent = `✓ ${galleryImages.length} image${galleryImages.length !== 1 ? 's' : ''} (max 5)`;
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
    document.getElementById('workFormTitle').textContent = editIdx !== null ? 'Edit project' : 'Create new project';
    if (editIdx !== null) {
      const w = works[editIdx];
      document.getElementById('wTitle').value = w.title;
      document.getElementById('wPrice').value = w.price;
      document.getElementById('wDesc').value = w.desc;
      form.querySelector(`input[name="wcat"][value="${w.cat}"]`).checked = true;
      form.querySelector(`input[name="wdeliver"][value="${w.deliver}"]`).checked = true;

      /* revisions */
      const revInput = form.querySelector(`input[name="wrev"][value="${w.revisions}"]`);
      if (revInput) revInput.checked = true;
      else {
        const defaultRev = form.querySelector('input[name="wrev"][value="2"]');
        if (defaultRev) defaultRev.checked = true;
      }

      /* tags */
      form.querySelectorAll('input[name="wtags"]').forEach(cb => {
        cb.checked = (w.tags || []).includes(cb.value);
        cb.closest('.reg-choice')?.classList.toggle('selected', cb.checked);
      });

      /* gallery */
      galleryImages = [...(w.gallery || [])];
      renderGalleryPreview();
      if (galleryBox) {
        if (galleryImages.length) {
          galleryBox.classList.add('filled');
          galleryBox.querySelector('small').textContent = `✓ ${galleryImages.length} image${galleryImages.length !== 1 ? 's' : ''} (max 5)`;
        } else {
          galleryBox.classList.remove('filled');
          galleryBox.querySelector('small').textContent = 'Show different angles or variations — up to 5 images';
        }
      }
    } else {
      form.reset();
      coverImgData = null;
      galleryImages = [];
      renderGalleryPreview();
      if (coverBox) {
        coverBox.classList.remove('filled');
        coverBox.querySelector('small').textContent = 'The hero image for this piece — 1:1 or larger recommended';
      }
      if (galleryBox) {
        galleryBox.classList.remove('filled');
        galleryBox.querySelector('small').textContent = 'Show different angles or variations — up to 5 images';
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

    const tags = [...form.querySelectorAll('input[name="wtags"]:checked')].map(cb => cb.value);
    const revisions = form.querySelector('input[name="wrev"]:checked')?.value || '2';

    const entry = {
      title, desc, price,
      cat: form.querySelector('input[name="wcat"]:checked').value,
      deliver: form.querySelector('input[name="wdeliver"]:checked').value,
      coverImg: coverImgData,
      published: true,
      views: 0, orders: 0,
      revisions,
      tags,
      gallery: [...galleryImages],
      freelancerName: freelancerName(),
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

  /* ---------- card actions (click to detail, edit / publish / delete) ---------- */
  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.fw-btn');
    /* if clicked a button, handle button action */
    if (btn) {
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
      return;
    }
    /* otherwise click on card → navigate to detail page */
    const card = e.target.closest('.fw-card');
    if (!card) return;
    const i = +card.dataset.i;
    const w = works[i];
    if (!w) return;
    if (w.id) {
      window.location.href = `work-detail.html?id=${w.id}`;
    } else {
      alert('Save this work first before viewing details.');
    }
  });

  /* ---------- tag checkbox highlight ---------- */
  form?.querySelectorAll('input[name="wtags"]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.reg-choice')?.classList.toggle('selected', cb.checked);
    });
  });

  render();
  if (window.SB) loadFromSupabase().then((ok) => { if (ok) render(); }).catch(() => {});
})();
