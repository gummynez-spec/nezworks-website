/* ============ HERO CANVAS — orbital particles + constellation nodes ============ */
(() => {
  if (NW.reduced) return;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');

  let W, H, DPR, cx, cy;
  let particles = [];   // particles on orbital paths
  let nodes = [];       // pulsing constellation nodes

  const PARTICLES = NW.isMobile ? 5 : 12;
  const NODES = NW.isMobile ? 5 : 9;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
  }

  function build() {
    particles = [];
    for (let i = 0; i < PARTICLES; i++) {
      particles.push({
        r: NW.rand(0.28, 0.46) * Math.min(W, H),  // orbit radius
        angle: Math.random() * Math.PI * 2,
        speed: NW.rand(0.0004, 0.0012),           // very slow
        size: NW.rand(0.8, 2),
        hue: Math.random() < 0.3 ? '255,179,138' : '139,124,246',
        phase: Math.random() * Math.PI * 2
      });
    }
    nodes = [];
    for (let i = 0; i < NODES; i++) {
      const ang = (i / NODES) * Math.PI * 2 + NW.rand(-0.3, 0.3);
      const rad = NW.rand(0.24, 0.44) * Math.min(W, H);
      nodes.push({
        x: cx + Math.cos(ang) * rad,
        y: cy + Math.sin(ang) * rad,
        phase: Math.random() * Math.PI * 2,
        speed: NW.rand(0.0015, 0.004)
      });
    }
  }

  window.addEventListener('resize', () => { resize(); build(); });
  resize(); build();

  function frame(now) {
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);

    /* faint orbital guide paths */
    ctx.lineWidth = 1;
    for (const p of particles.slice(0, 4)) {
      ctx.strokeStyle = 'rgba(139,124,246,.06)';
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    /* orbital particles with soft comet tails */
    for (const p of particles) {
      p.angle += p.speed;
      const x = cx + Math.cos(p.angle) * p.r;
      const y = cy + Math.sin(p.angle) * p.r;
      const glow = 0.35 + 0.3 * Math.sin(t * 0.8 + p.phase);

      // tail
      ctx.strokeStyle = `rgba(${p.hue},${glow * 0.35})`;
      ctx.lineWidth = p.size * 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, p.r, p.angle - 0.25, p.angle - 0.02);
      ctx.stroke();

      // head
      ctx.fillStyle = `rgba(${p.hue},${glow})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    /* pulsing constellation nodes */
    for (const n of nodes) {
      const pulse = 0.3 + 0.25 * Math.sin(t * n.speed * 60 + n.phase);
      ctx.fillStyle = `rgba(154,166,216,${pulse})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
