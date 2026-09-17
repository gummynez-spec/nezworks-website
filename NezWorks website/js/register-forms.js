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

    /* custom budget toggle */
    const customToggle = document.getElementById('budgetCustomToggle');
    const customBox = document.getElementById('budgetCustomBox');
    const customInput = document.getElementById('budgetCustomInput');
    const customClose = document.getElementById('budgetCustomClose');
    if (customToggle && customBox && customInput) {
      customToggle.addEventListener('click', () => {
        slider.style.display = 'none';
        customToggle.style.display = 'none';
        customBox.style.display = 'flex';
        customInput.focus();
      });
      customClose?.addEventListener('click', () => {
        customBox.style.display = 'none';
        customInput.value = '';
        slider.style.display = '';
        customToggle.style.display = '';
      });
    }
  }

  /* ================= SOCIAL MEDIA PICKER (shared) ================= */
  function initSocialPicker(container) {
    const btn = container.querySelector('#socialSelectBtn');
    const dropdown = container.querySelector('#socialDropdown');
    const input = container.querySelector('#contactInput');
    const platformInput = container.querySelector('#contactPlatform');
    const iconEl = container.querySelector('#socialIcon');
    const labelEl = container.querySelector('#socialLabel');
    if (!btn || !dropdown || !input || !platformInput) return;

    const platformIcons = {
      email: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>',
      line: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 5.82 2 10.5c0 3.67 3.12 6.77 7.35 7.85-.1.85-.38 2.65-.43 3.06-.08.6.22.6.47.43.19-.13 2.7-1.84 3.8-2.59.26.02.53.03.81.03 5.52 0 10-3.82 10-8.5S17.52 2 12 2z"/></svg>',
      facebook: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>',
      instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>',
      phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/></svg>',
      twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
      discord: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>',
      other: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
    };
    const placeholders = {
      email: 'e.g. natnicha@nezworks.co',
      line: 'e.g. gummynez',
      facebook: 'e.g. Natnicha Nonn',
      instagram: 'e.g. @natnicha',
      phone: 'e.g. 081-234-5678',
      twitter: 'e.g. @natnicha',
      discord: 'e.g. natnicha#1234',
      other: 'Your contact info',
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      btn.classList.toggle('open', !isOpen);
    });

    container.querySelectorAll('.social-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const platform = opt.dataset.platform;
        platformInput.value = platform;
        input.style.display = 'block';
        input.placeholder = placeholders[platform] || 'Your contact info';
        input.focus();
        iconEl.innerHTML = platformIcons[platform] || '';
        labelEl.textContent = opt.querySelector('span').textContent;
        btn.classList.add('has-value');
        dropdown.classList.remove('open');
        btn.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      btn.classList.remove('open');
    });
  }

  /* init both pickers if present */
  document.querySelectorAll('.social-contact').forEach(initSocialPicker);

  /* ================= NEEDS PICKER (client form) ================= */
  function initNeedsPicker(container) {
    const btn = container.querySelector('#needsSelectBtn');
    const dropdown = container.querySelector('#needsDropdown');
    const otherInput = container.querySelector('#otherNeedInput');
    const hiddenInput = container.querySelector('#needsValue');
    const iconEl = container.querySelector('#needsIcon');
    const labelEl = container.querySelector('#needsLabel');
    if (!btn || !dropdown || !hiddenInput) return;

    const labels = {
      graphic: 'Graphic Design',
      logo: 'Logo and Branding',
      social: 'Social Media Design',
      video: 'Video Editing',
      content: 'Content Creation',
      translate: 'Translation',
      other: 'Others',
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      btn.classList.toggle('open', !isOpen);
    });

    container.querySelectorAll('.social-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const platform = opt.dataset.platform;
        hiddenInput.value = platform;
        labelEl.textContent = labels[platform] || platform;
        btn.classList.add('has-value');
        dropdown.classList.remove('open');
        btn.classList.remove('open');
        if (platform === 'other') {
          otherInput.style.display = 'block';
          otherInput.focus();
        } else {
          otherInput.style.display = 'none';
          otherInput.value = '';
        }
      });
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      btn.classList.remove('open');
    });
  }

  document.querySelectorAll('#needsPicker').forEach(initNeedsPicker);

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
      const needsValue = clientForm.querySelector('#needsValue')?.value;
      const otherInput = clientForm.querySelector('#otherNeedInput');
      const needs = needsValue === 'other' && otherInput?.value.trim()
        ? [otherInput.value.trim()]
        : needsValue ? [needsValue] : [];
      const name = clientForm.querySelector('[name="name"]');
      const displayName = clientForm.querySelector('[name="displayName"]');
      const contact = clientForm.querySelector('[name="contact"]');
      const contactPlatform = clientForm.querySelector('[name="contactPlatform"]');
      if (!name.value.trim() || !displayName.value.trim() || !contact.value.trim() || !contactPlatform.value || needs.length === 0) {
        if (!displayName.value.trim()) displayName.reportValidity();
        else if (!name.value.trim()) name.reportValidity();
        else if (!needs.length) {
          const pickerBtn = clientForm.querySelector('#needsSelectBtn');
          pickerBtn?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300, iterations: 2 });
        }
        else if (!contactPlatform.value || !contact.value.trim()) {
          const pickerBtn = clientForm.querySelector('#socialSelectBtn');
          pickerBtn?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 300, iterations: 2 });
        }
        return;
      }
      const contactObj = { platform: contactPlatform.value, value: contact.value.trim() };
      const data = {
        name: name.value.trim(),
        displayName: displayName.value.trim(),
        brand: clientForm.querySelector('[name="brand"]').value.trim(),
        needs,
        project: clientForm.querySelector('[name="project"]').value.trim(),
        contact: contactObj,
        budget: (() => {
          const customInput = document.getElementById('budgetCustomInput');
          const customVal = customInput?.value.trim();
          if (customVal) {
            const num = parseInt(customVal, 10);
            return num >= 100000 ? [`฿${num.toLocaleString()}`, `฿${num.toLocaleString()}`] : null;
          }
          return [document.getElementById('budgetLow')?.textContent, document.getElementById('budgetHigh')?.textContent];
        })(),
      };
      sessionStorage.setItem('nw-client', JSON.stringify(data));
      try {
        const c = window.SB;
        if (c) {
          const { data: row, error } = await c.from('clients').insert([{
            name: data.name, display_name: data.displayName, brand: data.brand, needs: data.needs, project: data.project, contact: data.contact, budget: data.budget,
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
      const displayName = flForm.querySelector('[name="displayName"]');
      const skills = flForm.querySelectorAll('input[name="skills"]:checked');
      const exp = flForm.querySelector('input[name="exp"]:checked');
      const contact = flForm.querySelector('[name="contact"]');
      const contactPlatform = flForm.querySelector('[name="contactPlatform"]');
      const upload = document.getElementById('workUpload')?.querySelector('input[type="file"]');
      const port = document.getElementById('portfolioUrl');
      const hasWork = (upload && upload.files.length > 0) || (port && port.value.trim().length > 3);
      return name.value.trim() && displayName.value.trim() && skills.length && exp && contactPlatform.value && contact.value.trim() && hasWork;
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
      const contactPlatform = flForm.querySelector('[name="contactPlatform"]').value;
      const contactValue = flForm.querySelector('[name="contact"]').value.trim();
      const contactObj = { platform: contactPlatform, value: contactValue };
      const data = {
        name: flForm.querySelector('[name="name"]').value.trim(),
        displayName: flForm.querySelector('[name="displayName"]').value.trim(),
        skills: [...flForm.querySelectorAll('input[name="skills"]:checked')].map(c => c.value),
        exp: flForm.querySelector('input[name="exp"]:checked')?.value || null,
        contact: contactObj,
        portfolio: document.getElementById('portfolioUrl').value.trim(),
      };
      const localPayload = { ...data };
      let freelancerId = sessionStorage.getItem('nw-freelancer-id') || null;
      try {
        const c = window.SB;
        if (c) {
          if (!freelancerId) {
            const { data: row, error } = await c.from('freelancers').insert([{
              name: data.name, display_name: data.displayName, skills: data.skills, exp: data.exp, contact: data.contact, portfolio: data.portfolio,
            }]).select().single();
            if (error) throw error;
            if (row?.id) { freelancerId = row.id; sessionStorage.setItem('nw-freelancer-id', row.id); }
          } else {
            const { error } = await c.from('freelancers').update({ name: data.name, display_name: data.displayName, skills: data.skills, exp: data.exp, contact: data.contact, portfolio: data.portfolio }).eq('id', freelancerId);
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
