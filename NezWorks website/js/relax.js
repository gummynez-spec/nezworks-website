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

  /* ---------------- ambience: Web Audio mood pads ---------------- */
  const moodBtns = [...document.querySelectorAll('.mood-btn')];
  let ctx = null;
  let active = null;         // { stop():..., }

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  function noiseBuffer(seconds = 2) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* one-shot band-passed noise (brush, hat, crackle…) */
  function noiseHit({ band, q = 1, dur = 0.2, vol = 0.3, at = 0 }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(1);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = band; bp.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(bp).connect(g).connect(ctx.destination);
    src.start(at); src.stop(at + dur + 0.05);
    return src;
  }

  /* one-shot tone (kick, bass, pluck, chime…) */
  function tone({ freq, fEnd = 0, type = 'sine', dur = 0.3, vol = 0.3, at = 0, detune = 0 }) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, at);
    if (fEnd) o.frequency.exponentialRampToValueAtTime(fEnd, at + dur);
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(ctx.destination);
    o.start(at); o.stop(at + dur + 0.05);
    return o;
  }

  /* ============ mood builders — each shaped to its name ============ */

  function buildRnb() {
    // warm Am9 pad + swung soft groove (kick + hat)
    const nodes = [];
    const t = ctx.currentTime + 0.03;
    [55, 82.4, 110, 164.8, 246.9].forEach((f, i) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 1.2);
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 8;
      o.connect(g).connect(ctx.destination); o.start(t);
      nodes.push(o);
    });
    const bpm = 62;                       // slow & mellow
    let step = 0;
    const tick = setInterval(() => {
      const at = ctx.currentTime + 0.02;
      if (step % 2 === 0) tone({ freq: 55, fEnd: 41, type: 'sine', dur: 0.28, vol: 0.5, at });      // kick
      if (step % 4 === 2) noiseHit({ band: 6800, q: 2, dur: 0.06, vol: 0.12, at });                 // soft hat
      if (step % 4 === 3) noiseHit({ band: 6800, q: 2, dur: 0.12, vol: 0.08, at });                 // swung back
      step++;
    }, 60000 / bpm / 2);
    return { nodes, stop: () => { clearInterval(tick); nodes.forEach(o => { try { o.stop(); } catch (e) {} }); } };
  }

  function buildJazz() {
    // Dm7 warm chord + soft brush swish (swing) + walking bass ghost
    const nodes = [];
    const t = ctx.currentTime + 0.03;
    [146.8, 174.6, 220, 261.6].forEach((f, i) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045 + i * 0.006, t + 2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 8);
      const o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = f;
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 8.5);
      nodes.push(o);
    });
    let s = 0;
    const tick = setInterval(() => {
      const at = ctx.currentTime + 0.02;
      if (s % 2 === 0) noiseHit({ band: 1400, q: 1.4, dur: 0.22, vol: 0.14, at });                  // brush swish
      noiseHit({ band: 900, q: 1.1, dur: 0.08, vol: 0.05, at });                                     // soft brush stroke
      if (s % 4 === 0) tone({ freq: [73.4, 98, 110, 87.3][Math.floor(Math.random()*4)], type: 'sine', dur: 0.24, vol: 0.18, at }); // walking bass
      s++; if (s > 30) { clearInterval(tick); nodes.forEach(o => { try { o.stop(); } catch (e) {} }); }
    }, 60000 / 96 / 2);
    return { nodes, stop: () => { clearInterval(tick); nodes.forEach(o => { try { o.stop(); } catch (e) {} }); } };
  }

  function buildCozy() {
    // fireplace: warm low drone + random crackles
    const nodes = [];
    const t = ctx.currentTime + 0.03;
    [55, 82.4, 110].forEach((f, i) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 2);
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g).connect(ctx.destination); o.start(t);
      nodes.push(o);
    });
    function crackle() {
      const at = ctx.currentTime + 0.02;
      noiseHit({ band: 1500 + Math.random() * 2200, q: 3, dur: 0.015 + Math.random() * 0.04, vol: 0.03 + Math.random() * 0.05, at });
      if (active && active.key === 'cozy') setTimeout(crackle, 120 + Math.random() * 420);
    }
    crackle();
    return { nodes, stop: () => { nodes.forEach(o => { try { o.stop(); } catch (e) {} }); } };
  }

  function buildWarm() {
    // mellow additive pad, slow filter breath — golden-hour lamp glow
    const nodes = []; const sustain = [];
    const t = ctx.currentTime + 0.03;
    [98, 123.5, 146.8, 196, 246.9].forEach((f, i) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035 + i * 0.005, t + 2.5);
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 5;
      o.connect(g).connect(ctx.destination); o.start(t);
      nodes.push(o); sustain.push({ g, o });
    });
    const w = ctx.createOscillator(); w.frequency.value = 0.07;                    // slow breath
    const wg = ctx.createGain(); wg.gain.value = 0.012;
    w.connect(wg);
    const master = ctx.createGain(); master.gain.value = 1;
    sustain.forEach(s => { s.g.disconnect(); s.g.connect(master); });
    master.connect(ctx.destination);
    wg.connect(master.gain); w.start(t);
    return { nodes: [...nodes, w], stop: () => [...nodes, w, master].forEach(o => { try { o.stop?.() || o.disconnect(); } catch (e) {} }) };
  }

  function buildFun() {
    // playful bright arpeggio loop + light bounce
    const seq = [523.3, 659.3, 784, 880, 1046.5, 880, 784, 659.3];
    let i = 0;
    const nodes = [];
    function arp() {
      const at = ctx.currentTime + 0.02;
      const f = seq[i % seq.length];
      nodes.push(tone({ freq: f, type: 'triangle', dur: 0.16, vol: 0.14, at }));
      if (i % 8 === 0) nodes.push(tone({ freq: 130.8, type: 'sine', dur: 0.2, vol: 0.2, at }));   // bass bounce
      i++;
      if (active && active.key === 'fun') setTimeout(arp, 150);
    }
    arp();
    return { nodes, stop: () => nodes.forEach(o => { try { o.stop(); } catch (e) {} }) };
  }

  function buildDream() {
    // airy, detuned echo pad that slowly swells — no rhythm, floats
    const nodes = [];
    const t = ctx.currentTime + 0.05;
    [164.8, 246.9, 329.6, 392, 493.9].forEach((f, i) => {
      [-6, 6].forEach(det => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.022, t + (4 + i * 0.6));          // very slow swell
        g.gain.linearRampToValueAtTime(0.0001, t + 26 + i);
        const o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f; o.detune.value = det;
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 28);
        nodes.push(o);
      });
    });
    return { nodes, stop: () => nodes.forEach(o => { try { o.stop(); } catch (e) {} }) };
  }

  function buildFocus() {
    // steady calm heartbeat pulse + low drone — for concentrating
    const nodes = [];
    const t = ctx.currentTime + 0.03;
    [110, 220].forEach(f => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.04, t + 1.5);
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f;
      o.connect(g).connect(ctx.destination); o.start(t);
      nodes.push(o);
    });
    let beat = 0;
    const tick = setInterval(() => {
      const at = ctx.currentTime + 0.02;
      tone({ freq: 110, fEnd: 82, type: 'sine', dur: 0.18, vol: 0.24, at });   // soft lub-dub
      if (beat % 2 === 0) tone({ freq: 98, fEnd: 73, type: 'sine', dur: 0.14, vol: 0.16, at: at + 0.22 });
      beat++;
    }, 60000 / 66 / 2);
    return { nodes, stop: () => { clearInterval(tick); nodes.forEach(o => { try { o.stop(); } catch (e) {} }); } };
  }

  const BUILDERS = {
    rnb: buildRnb,
    jazz: buildJazz,
    cozy: buildCozy,
    warm: buildWarm,
    fun: buildFun,
    dream: buildDream,
    focus: buildFocus,
  };

  function stopMood() {
    if (active) { active.stop(); active = null; }
  }

  function playMood(key) {
    if (active && active.key === key) { stopMood(); return; }
    stopMood();
    ensureCtx();
    active = { key, ...BUILDERS[key]() };
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