/* ============ PROJECT MODAL — multi-step form, transitions, success orbit ============ */
(() => {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const form = document.getElementById('pmForm');
  const steps = [...form.querySelectorAll('.pm-step')];
  const bar = document.getElementById('pmBar');
  const backBtn = document.getElementById('pmBack');
  const nextBtn = document.getElementById('pmNext');
  const success = document.getElementById('pmSuccess');
  const openBtn = document.getElementById('openProjectModal');

  let current = 1;
  const total = steps.length;
  const answers = { service: null, scope: null };

  /* ---------- open / close ---------- */
  function open() {
    modal.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => modal.classList.add('open'));
    });
    document.body.classList.add('modal-open');
  }
  function close() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
    setTimeout(() => { modal.hidden = true; reset(); }, 320);
  }

  openBtn.addEventListener('click', open);
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  /* ---------- step navigation ---------- */
  function showStep(n, dir = 1) {
    const outgoing = steps[current - 1];
    const incoming = steps[n - 1];

    if (NW.reduced) {
      outgoing.classList.remove('active');
      incoming.classList.add('active');
    } else {
      outgoing.classList.add(dir > 0 ? 'exit-left' : 'exit-right');
      incoming.classList.add(dir > 0 ? 'enter-right' : 'enter-left');
      requestAnimationFrame(() => incoming.classList.add('active'));
      setTimeout(() => {
        outgoing.classList.remove('active', 'exit-left', 'exit-right');
        incoming.classList.remove('enter-right', 'enter-left');
        if (!incoming.classList.contains('active')) incoming.classList.add('active');
      }, 400);
    }

    current = n;
    bar.style.width = (n / total) * 100 + '%';
    backBtn.hidden = n === 1;
    nextBtn.disabled = !stepValid(n);

    if (n === total) {
      nextBtn.innerHTML = 'Launch Project <span class="btn-arrow">→</span>';
    } else {
      nextBtn.innerHTML = 'Continue <span class="btn-arrow">→</span>';
    }
  }

  function stepValid(n) {
    if (n === 1) return !!answers.service;
    if (n === 2) return !!answers.scope;
    if (n === 3) {
      const email = document.getElementById('pmEmail');
      return email.checkValidity();
    }
    return false;
  }

  function reset() {
    current = 1;
    answers.service = null;
    answers.scope = null;
    steps.forEach(s => s.classList.remove('active', 'exit-left', 'exit-right', 'enter-right', 'enter-left'));
    steps[0].classList.add('active');
    modal.querySelectorAll('.pm-opt').forEach(o => o.classList.remove('selected'));
    bar.style.width = (1 / total) * 100 + '%';
    backBtn.hidden = true;
    nextBtn.disabled = true;
    nextBtn.innerHTML = 'Continue <span class="btn-arrow">→</span>';
    form.hidden = false;
    success.hidden = true;
    success.classList.remove('play');
  }

  /* ---------- option selection ---------- */
  steps.forEach((step) => {
    step.querySelectorAll('.pm-opt').forEach((opt) => {
      opt.addEventListener('click', () => {
        step.querySelectorAll('.pm-opt').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        if (current === 1) answers.service = opt.dataset.value;
        if (current === 2) answers.scope = opt.dataset.value;
        nextBtn.disabled = false;
        if (current < total) setTimeout(() => showStep(current + 1, 1), 350);
      });
    });
  });

  /* contact inputs enable continue */
  ['pmName', 'pmEmail', 'pmBrief'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      if (current === 3) nextBtn.disabled = !stepValid(3);
    });
  });

  backBtn.addEventListener('click', () => showStep(current - 1, -1));
  nextBtn.addEventListener('click', () => {
    if (current < total) showStep(current + 1, 1);
    else submit();
  });

  /* ---------- submit → NezWorks success moment ---------- */
  async function submit() {
    const email = document.getElementById('pmEmail');
    if (!email.checkValidity()) { email.reportValidity(); return; }

    const payload = {
      service: answers.service || null,
      scope: answers.scope || null,
      name: document.getElementById('pmName')?.value?.trim() || null,
      email: email.value?.trim() || null,
      brief: document.getElementById('pmBrief')?.value?.trim() || null,
    };
    try {
      const c = window.SB;
      if (c) {
        const { error } = await c.from('project_requests').insert([payload]);
        if (error) throw error;
      }
    } catch (err) { console.warn('[NezWorks] project request insert failed (tables missing?):', err?.message || err); }

    form.hidden = true;
    success.hidden = false;
    success.classList.add('play');
  }

  /* initial state */
  bar.style.width = (1 / total) * 100 + '%';
})();
