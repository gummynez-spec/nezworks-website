/* ============ REGISTER FORMS — client + freelancer + budget slider ============ */
(() => {
  const fmt = (n) => '฿' + n.toLocaleString('th-TH');

  /* ---------- OTHER checkboxes enable their text inputs ---------- */
  document.querySelectorAll('.reg-choice input[type="checkbox"][value="Other"]').forEach((cb) => {
    const input = cb.closest('.reg-choice').querySelector('.other-input');
    if (!input) return;
    cb.addEventListener('change', () => {
      input.disabled = !cb.checked;
      if (cb.checked) input.focus();
      else input.value = '';
    });
  });

  /* ---------- uploads: click box to pick files, show filled state ---------- */
  document.querySelectorAll('.reg-upload').forEach((box) => {
    const input = box.querySelector('input[type="file"]');
    if (!input) return;
    box.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT') input.click();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.closest('.reg-upload').querySelector('input[type="file"]').click(); }
    });
    input.addEventListener('change', () => {
      if (input.files.length) {
        box.classList.add('filled');
        const small = box.querySelector('small');
        if (!box.dataset.orig) box.dataset.orig = small.textContent;
        small.textContent = `✓ ${input.files.length} file${input.files.length === 1 ? '' : 's'} selected`;
      }
    });
  });

  /* ================= BUDGET DUAL-THUMB SLIDER ================= */
  const slider = document.getElementById('budgetSlider');
  if (slider) {
    const STEPS = [0, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000];
    const lowEl = document.getElementById('thumbLow');
    const highEl = document.getElementById('thumbHigh');
    const fill = document.getElementById('budgetFill');
    const lowLabel = document.getElementById('budgetLow');
    const highLabel = document.getElementById('budgetHigh');
    let lowIdx = 3, highIdx = 5; // 3,000 – 5,000 default

    const pct = (i) => (i / (STEPS.length - 1)) * 100;

    function render() {
      if (lowIdx > highIdx) [lowIdx, highIdx] = [highIdx, lowIdx];
      lowEl.style.left = pct(lowIdx) + '%';
      highEl.style.left = pct(highIdx) + '%';
      fill.style.left = pct(lowIdx) + '%';
      fill.style.width = (pct(highIdx) - pct(lowIdx)) + '%';
      lowLabel.textContent = fmt(STEPS[lowIdx]);
      highLabel.textContent = fmt(STEPS[highIdx]);
      lowEl.setAttribute('aria-valuenow', STEPS[lowIdx]);
      highEl.setAttribute('aria-valuenow', STEPS[highIdx]);
    }

    function moveThumb(thumb, e) {
      const track = slider.querySelector('.bs-track').getBoundingClientRect();
      const x = NW.clamp(e.clientX - track.left, 0, track.width);
      const idx = Math.round((x / track.width) * (STEPS.length - 1));
      if (thumb === lowEl) lowIdx = idx; else highIdx = idx;
      render();
    }

    function bindDrag(thumb) {
      const onMove = (e) => moveThumb(thumb, e.touches ? e.touches[0] : e);
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);
      };
      thumb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });
      thumb.addEventListener('touchstart', (e) => {
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
      }, { passive: false });
      /* keyboard */
      thumb.addEventListener('keydown', (e) => {
        const isLow = thumb === lowEl;
        const cur = isLow ? lowIdx : highIdx;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); isLow ? lowIdx = NW.clamp(cur + 1, 0, highIdx) : highIdx = NW.clamp(cur + 1, lowIdx, STEPS.length - 1); render(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); isLow ? lowIdx = NW.clamp(cur - 1, 0, highIdx) : highIdx = NW.clamp(cur - 1, lowIdx, STEPS.length - 1); render(); }
      });
    }
    bindDrag(lowEl);
    bindDrag(highEl);
    render();
  }

  /* ================= CLIENT FORM ================= */
  const clientForm = document.getElementById('clientForm');
  const clientSuccess = document.getElementById('clientSuccess');

  if (clientForm) {
    /* highlight selected choices */
    clientForm.querySelectorAll('.reg-choice input').forEach((cb) => {
      cb.addEventListener('change', () => {
        cb.closest('.reg-choice').classList.toggle('selected', cb.checked);
      });
    });

    clientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const needs = [...clientForm.querySelectorAll('input[name="needs"]:checked')].map(c => c.value);
      const name = clientForm.querySelector('[name="name"]');
      const contact = clientForm.querySelector('[name="contact"]');
      if (!name.value.trim() || !contact.value.trim() || needs.length === 0) {
        if (!name.value.trim()) name.reportValidity();
        else if (!contact.value.trim()) contact.reportValidity();
        else clientForm.querySelector('#needChoices').animate(
          [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
          { duration: 300, iterations: 2 }
        );
        return;
      }
      const data = {
        name: name.value.trim(),
        brand: clientForm.querySelector('[name="brand"]').value.trim(),
        needs,
        project: clientForm.querySelector('[name="project"]').value.trim(),
        contact: contact.value.trim(),
        budget: [document.getElementById('budgetLow')?.textContent, document.getElementById('budgetHigh')?.textContent],
      };
      sessionStorage.setItem('nw-client', JSON.stringify(data));
      try {
        const c = window.SB;
        if (c) {
          const { data: row, error } = await c.from('clients').insert([{
            name: data.name, brand: data.brand, needs: data.needs, project: data.project, contact: data.contact, budget: data.budget,
          }]).select().single();
          if (error) throw error;
          if (row?.id) sessionStorage.setItem('nw-client-id', row.id);
        }
      } catch (err) { console.warn('[NezWorks] clients insert failed (tables missing?):', err?.message || err); }
      clientForm.hidden = true;
      clientSuccess.hidden = false;
      clientSuccess.classList.add('play');
    });
  }

  /* ================= FREELANCER FORM → TERMS → SUBMIT ================= */
  const flForm = document.getElementById('flForm');
  const flTerms = document.getElementById('flTerms');
  const flSuccess = document.getElementById('flSuccess');
  const flNext = document.getElementById('flNext');

  if (flForm) {
    flForm.querySelectorAll('.reg-choice input').forEach((cb) => {
      cb.addEventListener('change', () => {
        const on = cb.type === 'checkbox' ? cb.checked : true;
        if (cb.type === 'radio') {
          /* clear siblings */
          flForm.querySelectorAll(`input[name="${cb.name}"]`).forEach(r => r.closest('.reg-choice').classList.remove('selected'));
        }
        cb.closest('.reg-choice').classList.toggle('selected', on && (cb.type === 'checkbox' ? cb.checked : cb.checked));
      });
    });

    function flValid() {
      const name = flForm.querySelector('[name="name"]');
      const skills = flForm.querySelectorAll('input[name="skills"]:checked');
      const exp = flForm.querySelector('input[name="exp"]:checked');
      const contact = flForm.querySelector('[name="contact"]');
      const upload = document.getElementById('workUpload')?.querySelector('input[type="file"]');
      const port = document.getElementById('portfolioUrl');
      const hasWork = (upload && upload.files.length > 0) || (port && port.value.trim().length > 3);
      return name.value.trim() && skills.length && exp && contact.value.trim() && hasWork;
    }

    flNext.addEventListener('click', () => {
      if (!flValid()) {
        flForm.querySelectorAll(':invalid').forEach(el => el.reportValidity?.());
        const upload = document.getElementById('workUpload');
        const port = document.getElementById('portfolioUrl');
        const ufiles = upload?.querySelector('input[type="file"]').files.length;
        if (!(ufiles || port.value.trim())) {
          upload.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.02)' }, { transform: 'scale(1)' }],
            { duration: 350 }
          );
        }
        return;
      }
      flForm.hidden = true;
      flTerms.hidden = false;
      window.scrollTo({ top: 0, behavior: NW.reduced ? 'auto' : 'smooth' });
    });

    /* back */
    const backToForm = document.getElementById('backToForm');
    backToForm.addEventListener('click', (e) => {
      e.preventDefault();
      flTerms.hidden = true;
      flForm.hidden = false;
    });

    /* consents enable confirm */
    const consents = ['consent1', 'consent2', 'consent3'].map(id => document.getElementById(id));
    const confirmBtn = document.getElementById('flConfirm');
    consents.forEach(c => c.addEventListener('change', () => {
      confirmBtn.disabled = !consents.every(x => x.checked);
    }));

    confirmBtn.addEventListener('click', async () => {
      const data = {
        name: flForm.querySelector('[name="name"]').value.trim(),
        skills: [...flForm.querySelectorAll('input[name="skills"]:checked')].map(c => c.value),
        exp: flForm.querySelector('input[name="exp"]:checked')?.value || null,
        contact: flForm.querySelector('[name="contact"]').value.trim(),
        portfolio: document.getElementById('portfolioUrl').value.trim(),
      };
      const localPayload = { ...data };
      let freelancerId = sessionStorage.getItem('nw-freelancer-id') || null;
      try {
        const c = window.SB;
        if (c) {
          if (!freelancerId) {
            const { data: row, error } = await c.from('freelancers').insert([{
              name: data.name, skills: data.skills, exp: data.exp, contact: data.contact, portfolio: data.portfolio,
            }]).select().single();
            if (error) throw error;
            if (row?.id) { freelancerId = row.id; sessionStorage.setItem('nw-freelancer-id', row.id); }
          } else {
            const { error } = await c.from('freelancers').update({ name: data.name, skills: data.skills, exp: data.exp, contact: data.contact, portfolio: data.portfolio }).eq('id', freelancerId);
            if (error) console.warn('[NezWorks] freelancers update failed:', error.message);
          }
        }
      } catch (err) { console.warn('[NezWorks] freelancers insert failed (tables missing?):', err?.message || err); }
      sessionStorage.setItem('nw-freelancer', JSON.stringify({ ...localPayload, freelancer_id: freelancerId }));
      sessionStorage.setItem('nw-freelancer-registered', '1');
      flTerms.hidden = true;
      flSuccess.hidden = false;
      flSuccess.classList.add('play');
      window.scrollTo({ top: 0, behavior: NW.reduced ? 'auto' : 'smooth' });
    });
  }
})();
