/* ============ RELAX — scenes, brightness, synthesized nature sounds ============ */
(() => {
  const stage = document.getElementById('relaxStage');
  const scenes = [...stage.querySelectorAll('.scene')];
  const chips = [...document.querySelectorAll('.scene-chip')];
  const seasonBtns = [...document.querySelectorAll('.season-btn')];
  const title = document.getElementById('sceneTitle');
  const desc = document.getElementById('sceneDesc');
  const brightness = document.getElementById('brightness');
  const muteBtn = document.getElementById('muteBtn');

  const SCENE_INFO = {
    night:   { title: 'Night Sky',   desc: 'ดาวเต็มฟ้า ลมเบา ๆ — ปล่อยใจให้ลอยไปกับแสงดาว' },
    forest:  { title: 'Forest',      desc: 'แสงส่องผ่านต้นไม้ เขียวขจี เหมือนเดินเล่นในป่า' },
    rain:    { title: 'Rain',        desc: 'ฝนตกที่หน้าต่าง — ให้เสียงฝนช่วยล้างความเครียด' },
    flowers: { title: 'Flower Field',desc: 'กลีบดอกไม้ปลิวช้า ๆ ทุ่งกว้างสบายตา' },
    ocean:   { title: 'Ocean',      desc: 'คลื่นซัดฝั่งเป็นจังหวะ — หายใจตามคลื่นไปด้วยกัน' },
    aurora:  { title: 'Aurora',     desc: 'แสงเหนือเต้นระบำบนฟ้ากลางคืน' },
  };

  /* ---------- scene switching ---------- */
  function setScene(key) {
    scenes.forEach(s => s.classList.toggle('scene-active', s.dataset.scene === key));
    chips.forEach(c => c.classList.toggle('active', c.dataset.scene === key));
    seasonBtns.forEach(b => {
      const on = b.dataset.scene === key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });
    const info = SCENE_INFO[key];
    title.textContent = info.title;
    desc.textContent = info.desc;
  }
  chips.forEach(c => c.addEventListener('click', () => setScene(c.dataset.scene)));
  seasonBtns.forEach(b => b.addEventListener('click', () => setScene(b.dataset.scene)));

  /* ---------- brightness (0 night → 100 day) ---------- */
  function applyBrightness(v) {
    const dim = 1 - v / 100;            // slider 0 = dim .85, 100 = dim 0
    scenes.forEach(s => s.style.setProperty('--dim', (dim * 0.85).toFixed(3)));
  }
  brightness.addEventListener('input', () => applyBrightness(+brightness.value));
  applyBrightness(+brightness.value);

  /* ============================================================
     SYNTHESIZED NATURE SOUNDS — Web Audio, no files needed
     Each "sound" is a generator writing into a ScriptProcessor
     replacement: we use AudioWorklet-free approach with
     oscillators + noise buffers + LFOs for realism.
  ============================================================ */
  let ctx = null;
  const master = new Map();   // sound key -> { gain, nodes[], started }
  let muted = true;           // start muted; first interaction unmutes

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  }

  /* white-noise buffer */
  function noiseBuffer(seconds = 2) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* ---------- sound builders ---------- */

  function buildRain(gain) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(3);
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 6500;
    src.connect(hp).connect(lp).connect(gain);
    src.start();
    return [src];
  }

  function buildWind(gain) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(3);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 420;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.14;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(lp.frequency);
    src.connect(lp).connect(gain);
    src.start(); lfo.start();
    return [src, lfo];
  }

  function buildOcean(gain) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(4);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 900;
    /* wave swell */
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.09;
    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.6;
    const amp = ctx.createGain();
    amp.gain.value = 0.4;
    swell.connect(swellGain).connect(amp.gain);
    src.connect(lp).connect(amp).connect(gain);
    src.start(); swell.start();
    return [src, swell];
  }

  function buildBirds(gain) {
    const nodes = [];
    /* random chirps via scheduled oscillator sweeps */
    function chirp() {
      if (!ctx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = 'sine';
      const base = 2200 + Math.random() * 1600;
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * .5), t + 0.08);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.18);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(env).connect(gain);
      o.start(t); o.stop(t + 0.3);
      nodes.push(o);
    }
    (function loop() {
      if (ctx && master.get('birds')?.alive) {
        chirp();
        setTimeout(loop, 300 + Math.random() * 1800);
      }
    })();
    return nodes;
  }

  function buildFlowers(gain) {
    /* gentle insect-ish shimmer + soft high pad */
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(3);
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 5200; bp.Q.value = 8;
    const g2 = ctx.createGain(); g2.gain.value = 0.25;
    src.connect(bp).connect(g2).connect(gain);
    src.start();

    const pad = ctx.createOscillator();
    pad.type = 'triangle'; pad.frequency.value = 528;
    const padGain = ctx.createGain(); padGain.gain.value = 0.04;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.2;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.02;
    lfo.connect(lfoG).connect(padGain.gain);
    pad.connect(padGain).connect(gain);
    pad.start(); lfo.start();
    return [src, pad, lfo];
  }

  function buildNight(gain) {
    /* deep space pad: two detuned low sines + slow shimmer */
    const o1 = ctx.createOscillator();
    o1.type = 'sine'; o1.frequency.value = 110;
    const o2 = ctx.createOscillator();
    o2.type = 'sine'; o2.frequency.value = 110 * 1.5;
    const o2g = ctx.createGain(); o2g.gain.value = 0.3;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.05;
    lfo.connect(lfoG).connect(gain.gain);
    o1.connect(gain); o2.connect(o2g).connect(gain);
    o1.start(); o2.start(); lfo.start();
    return [o1, o2, lfo];
  }

  const BUILDERS = { rain: buildRain, wind: buildWind, ocean: buildOcean, birds: buildBirds, flowers: buildFlowers, night: buildNight };

  function stopSound(key) {
    const m = master.get(key);
    if (!m) return;
    m.alive = false;
    m.nodes.forEach(n => { try { n.stop?.(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
    try { m.gain.disconnect(); } catch (e) {}
    master.delete(key);
  }

  function startSound(key) {
    if (muted) return;
    ensureCtx();
    stopSound(key);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const m = { gain, nodes: [], alive: true };
    master.set(key, m);
    m.nodes = BUILDERS[key](gain) || [];
    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
  }

  /* ---------- mixer UI ---------- */
  document.querySelectorAll('.sound-row').forEach(row => {
    const key = row.dataset.sound;
    const vol = row.querySelector('[data-vol]');
    const state = row.querySelector('[data-state]');
    vol.addEventListener('input', () => {
      const v = +vol.value;
      if (v === 0) {
        row.classList.remove('on');
        state.textContent = 'ปิด';
        stopSound(key);
      } else {
        ensureCtx();
        if (muted) unmute();
        if (!master.get(key)) startSound(key);
        row.classList.add('on');
        state.textContent = v + '%';
        const m = master.get(key);
        if (m) m.gain.gain.linearRampToValueAtTime((v / 100) * 0.5, ctx.currentTime + 0.15);
      }
    });
  });

  /* ---------- mute ---------- */
  function unmute() {
    muted = false;
    muteBtn.querySelector('span').textContent = '🔊 เสียงเปิด';
  }
  function muteAll() {
    muted = true;
    [...master.keys()].forEach(stopSound);
    document.querySelectorAll('.sound-row').forEach(r => {
      r.classList.remove('on');
      r.querySelector('[data-state]').textContent = 'ปิด';
      r.querySelector('[data-vol]').value = 0;
    });
    muteBtn.querySelector('span').textContent = '🔇 เสียงปิดอยู่';
  }
  muteBtn.addEventListener('click', () => (muted ? unmute() : muteAll()));

  /* suggested pairing: switching scene nudges a matching sound gently on */
  [...chips, ...seasonBtns].forEach(btn => btn.addEventListener('click', () => {
    if (muted) return;
    const key = btn.dataset.scene;
    if (['rain', 'ocean', 'wind', 'night'].includes(key)) {
      const row = document.querySelector(`.sound-row[data-sound="${key}"]`);
      if (row && !master.get(key)) {
        row.querySelector('[data-vol]').value = 45;
        row.querySelector('[data-vol]').dispatchEvent(new Event('input'));
      }
    }
  }));
})();
