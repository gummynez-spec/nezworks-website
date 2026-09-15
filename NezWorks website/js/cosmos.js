/* ============ COSMOS — starfield + constellation flashes + cursor particles ============ */
(() => {
  if (NW.reduced) return;

  const canvas = document.getElementById('cosmos');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  let stars = [];
  let flashes = [];       // constellation line events
  let nodes = [];         // constellation anchor points
  const mouse = { x: -9999, y: -9999 };

  const STAR_COUNT = NW.isMobile ? 130 : 300;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildStars();
  }

  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() < 0.1 ? rand(1.3, 2.2) : rand(0.3, 1.0),      // fine grains, few bigger
        base: rand(0.15, 0.65),                                        // vary opacity
        tw: Math.random() < 0.4,                                      // some twinkle
        twSpeed: rand(0.003, 0.01),                                   // vary timing
        twPhase: Math.random() * Math.PI * 2,
        drift: rand(0.02, 0.08),                                       // slow drift
        wob: Math.random() * Math.PI * 2
      });
    }
    // constellation anchors — sparse, quiet
    nodes = [];
    const count = NW.isMobile ? 7 : 12;
    for (let i = 0; i < count; i++) {
      nodes.push({ x: rand(W * 0.05, W * 0.95), y: rand(H * 0.08, H * 0.92) });
    }
  }

  /* create a constellation flash: line between 2-3 nearby nodes */
  function spawnFlash() {
    if (!nodes.length || flashes.length > 1) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const near = nodes
      .filter(n => n !== a)
      .map(n => ({ n, d: Math.hypot(n.x - a.x, n.y - a.y) }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 3)
      .map(p => p.n);
    if (near.length < 2) return;
    const path = near.slice(0, Math.random() < 0.4 ? 3 : 2);
    flashes.push({
      pts: [a, ...path],
      t: 0,
      dur: rand(0.02, 0.035), // ~3-5s at 60fps
      done: false
    });
  }

  /* schedule constellation flashes randomly */
  let nextFlash = performance.now() + 4000;
  function maybeFlash(now) {
    if (now > nextFlash) {
      spawnFlash();
      nextFlash = now + rand(6000, 14000);
    }
  }

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();

  let last = 0;
  function frame(now) {
    const t = now / 1000;
    maybeFlash(now);
    ctx.clearRect(0, 0, W, H);

    /* stars */
    for (const s of stars) {
      s.x += s.drift;
      if (s.x > W + 4) s.x = -4;
      let a = s.base;
      if (s.tw) {
        a = s.base * (0.55 + 0.45 * Math.sin(t * s.twSpeed * 60 * 0.2 + s.twPhase));
      }
      /* subtle magnetic pull toward cursor (small radius) */
      let dx = 0, dy = 0;
      if (!NW.isMobile) {
        const ddx = mouse.x - s.x, ddy = mouse.y - s.y;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < 18000 && d2 > 1) { // ~134px radius
          const d = Math.sqrt(d2);
          const f = (1 - d / 134) * 6; // max 6px pull
          dx = (ddx / d) * f; dy = (ddy / d) * f;
        }
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = s.r > 1.1 ? '#cdd6ff' : '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x + dx, s.y + dy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* constellation nodes (faint) */
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#9aa6d8';
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    /* constellation flashes */
    for (const f of flashes) {
      if (f.done) continue;
      f.t += 1 / 60 / f.dur * 0.016;
      // progress: draw in, hold, fade out
      const p = Math.min((now % 1e7) / 1000, 1e7);
      const life = (now - (f.born || (f.born = now))) / (f.dur * 60000 / 60 * 60);
      const prog = Math.min(Math.max(life, 0), 1);
      const ease = prog < 0.3 ? prog / 0.3 : prog > 0.75 ? 1 - (prog - 0.75) / 0.25 : 1;
      const alpha = Math.max(0, ease) * 0.5;

      if (prog >= 1) { f.done = true; continue; }

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#8b7cf6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(f.pts[0].x, f.pts[0].y);
      for (let i = 1; i < f.pts.length; i++) ctx.lineTo(f.pts[i].x, f.pts[i].y);
      ctx.stroke();

      // illuminate endpoints softly
      for (const pnode of f.pts) {
        ctx.globalAlpha = alpha * 1.6;
        ctx.fillStyle = '#b9c4ff';
        ctx.beginPath();
        ctx.arc(pnode.x, pnode.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    flashes = flashes.filter(f => !f.done);
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
