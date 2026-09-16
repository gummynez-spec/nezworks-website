/* ============ RELAX — control drawer, seasons, brightness, ambience ============ */
(() => {
  const stage = document.getElementById('relaxStage');
  if (!stage) return;

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  let currentSeason = 'none';
  let fxEnabled = true;   // Effects on/off switch

  function applyBrightness(v) {
    const pct = Math.max(0, Math.min(100, v));
    const dark = 1 - pct / 100;          // 0 → no dim (bright), 1 → fully dark
    dim.style.opacity = (0.18 + dark * 0.82).toFixed(3);
    if (brightnessVal) brightnessVal.textContent = `Brightness ${Math.round(pct)}%`;
  }
  function onSeason(key) {
    currentSeason = key;
    seasonBtns.forEach(b => {
      const on = b.dataset.season === key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });
    bg.style.backgroundImage = `url('assets/seasons/${key}.jpg')`;
    bg.classList.add('on');
    if (fxEnabled && !prefersReduced) setFx(key);
  }
  seasonBtns.forEach(btn => btn.addEventListener('click', () => onSeason(btn.dataset.season)));
  brightness?.addEventListener('input', () => applyBrightness(+brightness.value));
  applyBrightness(+brightness.value ?? 35);

  /* ============================================================
     LIVING STAGE — 3D parallax + wind sway + seasonal particles
  ============================================================ */
  const fx = document.getElementById('relaxFx');
  const ctx2d = fx?.getContext('2d');

  let W = 0, H = 0, DPR = 1, raf = null;
  const RECT = { x0: 0, y0: 0, x1: 1, y1: 1 };   // normalised rain window (glass)

  function sizeCanvas() {
    if (!fx) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = stage.clientWidth; H = stage.clientHeight;
    fx.width = W * DPR; fx.height = H * DPR;
    fx.style.width = W + 'px'; fx.style.height = H + 'px';
    ctx2d.setTransform(DPR, 0, 0, DPR, 0, 0);
    /* glass area inside the window frame */
    RECT.x0 = W * 0.085; RECT.x1 = W * 0.915;
    RECT.y0 = H * 0.085; RECT.y1 = H * 0.915;
  }
  window.addEventListener('resize', sizeCanvas);

  /* ---------- particle factories ---------- */
  const particles = [];
  let fxMode = 'none';

  function spawn(key) {
    particles.length = 0;
    fxMode = key;
    const n = {
      winter: Math.round(W / 7),
      rainy:  Math.round(W / 5),
      autumn: 34,
      spring: 30,
      summer: 26,
    }[key] || 0;

    for (let i = 0; i < n; i++) {
      const p = {};
      if (key === 'winter') {
        p.kind = 'snow';
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.r = 1 + Math.random() * 2.6;
        p.v = 0.4 + Math.random() * 1.1;
        p.drift = 0.3 + Math.random() * 0.8;
        p.phase = Math.random() * Math.PI * 2;
        p.o = 0.5 + Math.random() * 0.5;
      } else if (key === 'rainy') {
        p.kind = 'rain';
        p.x = RECT.x0 + Math.random() * (RECT.x1 - RECT.x0);
        p.y = RECT.y0 + Math.random() * (RECT.y1 - RECT.y0);
        p.len = 12 + Math.random() * 16;
        p.v = 9 + Math.random() * 7;
        p.o = 0.12 + Math.random() * 0.18;   /* half of previous opacity */
      } else if (key === 'autumn' || key === 'spring') {
        p.kind = 'leaf';
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.s = key === 'autumn' ? (4 + Math.random() * 4) : (3 + Math.random() * 3);
        p.rot = Math.random() * Math.PI; p.vr = (Math.random() - 0.5) * 0.08;
        p.v = 0.7 + Math.random() * 1.0;
        p.drift = 0.6 + Math.random() * 1.4;
        p.phase = Math.random() * Math.PI * 2;
        p.color = key === 'autumn'
          ? ['#e07a34', '#c9551f', '#e8b13a', '#a63d1f'][i % 4]
          : ['#f6c6d8', '#f8ddb8', '#e8f0c9', '#f2b7c8'][i % 4];
      } else if (key === 'summer') {
        p.kind = 'shimmer';
        p.x = Math.random() * W; p.y = Math.random() * H;
        p.r = 0.8 + Math.random() * 1.8;
        p.phase = Math.random() * Math.PI * 2;
        p.speed = 0.4 + Math.random() * 0.8;
      }
      particles.push(p);
    }
  }
  function setFx(key) {
    spawn(key);
    if (fxEnabled && !prefersReduced) ensureLoop();
  }
  function ensureLoop() {
    if (!FXRUNNING && !prefersReduced) loop();
  }

  /* Effects on/off switch */
  const fxRadios = [...document.querySelectorAll('input[name="fx-toggle"]')];
  fxRadios.forEach(r => r.addEventListener('change', () => {
    fxEnabled = r.checked && r.value === 'on';
    r.setAttribute('checked', r.checked && r.value === 'on');
    if (fxEnabled) {
      ensureLoop();
      if (currentSeason !== 'none') setFx(currentSeason);
    } else {
      particles.length = 0;
      fxMode = 'none';
      ctx2d?.clearRect(0, 0, W, H);
    }
  }));

  /* ---------- per-frame render ---------- */
  let FXRUNNING = false;

  function render() {
    ctx2d.clearRect(0, 0, W, H);
    if (!fxEnabled) return;
    for (const p of particles) {
      if (p.kind === 'snow') {
        p.y += p.v; p.phase += 0.02;
        p.x += Math.sin(p.phase) * p.drift * 0.5;
        if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }
        ctx2d.globalAlpha = p.o;
        ctx2d.fillStyle = '#fff';
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx2d.fill();
      } else if (p.kind === 'rain') {
        p.y += p.v; p.x -= p.v * 0.18;   /* slight slant */
        if (p.y > RECT.y1 + p.len) { p.y = RECT.y0 - p.len; p.x = RECT.x0 + Math.random() * (RECT.x1 - RECT.x0); }
        ctx2d.globalAlpha = p.o;
        ctx2d.strokeStyle = '#d9e2f6';
        ctx2d.lineWidth = 1.2;
        ctx2d.beginPath();
        ctx2d.moveTo(p.x, p.y);
        ctx2d.lineTo(p.x - p.len * 0.2, p.y + p.len);
        ctx2d.stroke();
      } else if (p.kind === 'leaf') {
        p.y += p.v; p.rot += p.vr; p.phase += 0.02;
        p.x += Math.sin(p.phase) * p.drift;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        ctx2d.save();
        ctx2d.translate(p.x, p.y); ctx2d.rotate(p.rot);
        ctx2d.globalAlpha = 0.85;
        ctx2d.fillStyle = p.color;
        ctx2d.beginPath();
        ctx2d.ellipse(0, 0, p.s, p.s * 0.45, 0, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      } else if (p.kind === 'shimmer') {
        p.phase += 0.03 * p.speed;
        ctx2d.globalAlpha = 0.25 + Math.sin(p.phase) * 0.2;
        ctx2d.fillStyle = '#fff7d6';
        ctx2d.beginPath(); ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx2d.fill();
      }
    }
    ctx2d.globalAlpha = 1;
  }

  function loop() {
    FXRUNNING = true;
    render();
    raf = requestAnimationFrame(loop);
  }

  if (fx && ctx2d && !prefersReduced) {
    sizeCanvas();
    loop();
  }

  /* ---------------- ambience: mood audio tracks ---------------- */
  const moodBtns = [...document.querySelectorAll('.mood-btn')];
  const TRACKS = {
    rnb:   'assets/sounds/lofi-cocktail-bar.mp3',
    jazz:  'assets/sounds/jazz-sunny-cafe.mp3',
    cozy:  'assets/sounds/lofi-coffee-shop.mp3',
    warm:  'assets/sounds/lofi-sunny-cafe.mp3',
    fun:   'assets/sounds/lofi-restaurant.mp3',
    focus: 'assets/sounds/trumpet-study.mp3',
  };

  let audio = null;     // single <audio>, reused across moods
  let activeKey = null;

  function stopMood() {
    if (audio) { audio.pause(); audio.currentTime = 0; }
    activeKey = null;
  }

  function playMood(key) {
    if (activeKey === key) { stopMood(); return; }
    stopMood();
    if (!audio) {
      audio = new Audio();
      audio.loop = true;
      audio.volume = 0.55;
    }
    audio.src = TRACKS[key];
    audio.play().catch(() => {});
    activeKey = key;
  }

  moodBtns.forEach(btn => btn.addEventListener('click', () => {
    const on = btn.classList.contains('active');
    moodBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    if (on) { stopMood(); return; }
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    playMood(btn.dataset.mood);
  }));
})();

