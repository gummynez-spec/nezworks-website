/* ============ RELAX — control drawer, seasons, brightness, ambience ============ */
(() => {
  const stage = document.getElementById('relaxStage');
  if (!stage) return;

  /* ---------------- drawer toggle ---------------- */
  const drawer = document.getElementById('relaxDrawer');
  const closeBtn = document.getElementById('rdClose');
  const relaxNav = document.querySelector('a[href="relax.html"]');

  function openDrawer() {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  if (relaxNav) relaxNav.addEventListener('click', e => { e.preventDefault(); openDrawer(); });
  closeBtn?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
  document.addEventListener('click', e => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && e.target !== relaxNav) closeDrawer();
  });

  /* ---------------- background: season image + brightness ---------------- */
  const bg = document.getElementById('relaxBg');
  const dim = document.getElementById('relaxDim');
  const brightness = document.getElementById('brightness');
  const brightnessVal = document.getElementById('brightnessVal');
  const seasonBtns = [...document.querySelectorAll('.season-btn')];

  function applyBrightness(v) {
    const pct = Math.max(0, Math.min(100, v));
    const dark = 1 - pct / 100;          // 0 → no dim (bright), 1 → fully dark
    dim.style.opacity = (0.18 + dark * 0.82).toFixed(3);
    if (brightnessVal) brightnessVal.textContent = `ความสว่าง ${Math.round(pct)}%`;
  }
  brightness?.addEventListener('input', () => applyBrightness(+brightness.value));
  applyBrightness(+brightness.value ?? 35);

  seasonBtns.forEach(btn => btn.addEventListener('click', () => {
    seasonBtns.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-pressed', b === btn); });
    bg.style.backgroundImage = `url('assets/seasons/${btn.dataset.season}.jpg')`;
    bg.classList.add('on');
  }));

  /* ---------------- ambience: Web Audio mood pads ---------------- */
  const moodBtns = [...document.querySelectorAll('.mood-btn')];
  let ctx = null;
  let active = null;         // { stop():..., }
  let masterGain = null;

  const MOODS = {
    rnb:   { wave: 'sine',  root: 55,  spread: 1.06, cutoff: 700,  lfo: 0.06, bright: 0.5 },
    jazz:  { wave: 'sine',  root: 82,  spread: 1.08, cutoff: 850,  lfo: 0.05, bright: 0.6 },
    cozy:  { wave: 'triangle', root: 65,  spread: 1.05, cutoff: 520, lfo: 0.04, bright: 0.4 },
    warm:  { wave: 'sine',  root: 73,  spread: 1.07, cutoff: 620,  lfo: 0.05, bright: 0.55 },
    fun:   { wave: 'triangle', root: 98,  spread: 1.04, cutoff: 1300, lfo: 0.09, bright: 0.7 },
    space: { wave: 'sine',  root: 49,  spread: 1.12, cutoff: 560,  lfo: 0.03, bright: 0.45 },
    dream: { wave: 'sine',  root: 110, spread: 1.06, cutoff: 900,  lfo: 0.07, bright: 0.6 },
    focus: { wave: 'sine',  root: 61,  spread: 1.03, cutoff: 760,  lfo: 0.05, bright: 0.5 },
  };

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.13;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function stopMood() {
    if (active) { active.stop(); active = null; }
  }

  function playMood(key) {
    if (active && active.key === key) { stopMood(); return; }
    stopMood();
    ensureCtx();
    const cfg = MOODS[key];
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.8, t + 1.4);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cfg.cutoff;
    filter.Q.value = 0.7;
    masterGain.connect(filter);
    filter.connect(gain).connect(ctx.destination);

    const lfo = ctx.createOscillator();
    lfo.frequency.value = cfg.lfo;
    const lfoG = ctx.createGain();
    lfoG.gain.value = cfg.cutoff * 0.18;
    lfo.connect(lfoG).connect(filter.frequency);

    /* soft chord: root + fifth + octave, detuned */
    const notes = [1, cfg.spread, 2, cfg.spread * 2];
    const oscs = notes.map(mult => {
      const o = ctx.createOscillator();
      o.type = cfg.wave;
      o.frequency.value = cfg.root * mult;
      const og = ctx.createGain();
      og.gain.value = cfg.bright / notes.length;
      o.connect(og).connect(filter);
      o.start(t); o.stop(t + 999);
      return o;
    });
    lfo.start(t);

    active = {
      key,
      stop() {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1);
        setTimeout(() => {
          try { lfo.stop(); oscs.forEach(o => o.stop()); filter.disconnect(); gain.disconnect(); } catch (e) {}
        }, 1200);
      }
    };
  }

  moodBtns.forEach(btn => btn.addEventListener('click', () => {
    const on = btn.classList.contains('active');
    moodBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    if (on) { stopMood(); return; }
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    try { playMood(btn.dataset.mood); } catch (e) { console.warn('audio blocked', e); }
  }));
})();