/* ============ CREATIVE NETWORK — canvas constellation with hover discovery ============ */
(() => {
  const wrap = document.querySelector('.net-canvas-wrap');
  if (!wrap) return;
  const canvas = document.getElementById('networkCanvas');
  const ctx = canvas.getContext('2d');
  const info = document.getElementById('netInfo');
  const infoTitle = document.getElementById('netInfoTitle');
  const infoSub = document.getElementById('netInfoSub');

  const TALENT = [
    { label: 'DESIGNER',     sub: '12,400 designers — identity, product, motion' },
    { label: 'VIDEO EDITOR', sub: '6,800 editors — cut, grade, sound, delivery' },
    { label: 'CREATOR',      sub: '48,000 creators — always-on content engines' },
    { label: 'PHOTOGRAPHER', sub: '5,200 photographers — studio & on-location' },
    { label: 'DEVELOPER',    sub: '7,900 developers — web, mobile, WebGL' },
    { label: 'COPYWRITER',   sub: '4,300 writers — brand voice & conversion' },
    { label: 'UI/UX',        sub: '6,100 designers — research to design systems' },
  ];

  // which categories light up together (hover discovery)
  const CLUSTERS = {
    'DESIGNER':     ['DESIGNER', 'UI/UX', 'PHOTOGRAPHER'],
    'VIDEO EDITOR': ['VIDEO EDITOR', 'CREATOR', 'COPYWRITER'],
    'CREATOR':      ['CREATOR', 'VIDEO EDITOR', 'PHOTOGRAPHER'],
    'PHOTOGRAPHER': ['PHOTOGRAPHER', 'CREATOR', 'DESIGNER'],
    'DEVELOPER':    ['DEVELOPER', 'UI/UX', 'DESIGNER'],
    'COPYWRITER':   ['COPYWRITER', 'CREATOR', 'UI/UX'],
    'UI/UX':        ['UI/UX', 'DESIGNER', 'DEVELOPER'],
  };

  let W, H, DPR, cx, cy, R;
  let nodes = [];
  let hovered = null;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = wrap.clientWidth; H = wrap.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = W / 2; cy = H / 2;
    R = Math.min(W, H) * 0.34;

    nodes = TALENT.map((t, i) => {
      const baseAngle = (i / TALENT.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...t,
        baseAngle,
        angle: baseAngle,
        r: R * NW.rand(0.92, 1.08),
        speed: NW.rand(0.00016, 0.0004) * (i % 2 ? 1 : -1),
        x: 0, y: 0,
        brightness: 0,          // eased for hover
        phase: Math.random() * Math.PI * 2,
      };
    });
  }

  window.addEventListener('resize', resize);
  resize();

  /* hover detection */
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  wrap.addEventListener('mouseleave', () => {
    mouse.x = -9999; mouse.y = -9999;
    hovered = null;
    info.classList.remove('on');
  });

  function setHovered(node) {
    if (hovered === node) return;
    hovered = node;
    if (node) {
      infoTitle.textContent = node.label;
      infoSub.textContent = node.sub;
      info.classList.add('on');
    } else {
      info.classList.remove('on');
    }
  }

  function frame(now) {
    const t = now / 1000;
    ctx.clearRect(0, 0, W, H);

    const litSet = hovered ? new Set(CLUSTERS[hovered.label] || [hovered.label]) : null;

    /* update positions */
    for (const n of nodes) {
      if (!NW.reduced) n.angle += n.speed;
      n.x = cx + Math.cos(n.angle) * n.r;
      n.y = cy + Math.sin(n.angle) * n.r * 0.92;

      const d = Math.hypot(mouse.x - n.x, mouse.y - n.y);
      // compute target brightness
      let tb;
      if (d < 36) tb = 1;                                  // direct hover
      else if (hovered) tb = litSet.has(n.label) ? 0.55 : 0.12; // related lit, others dim
      else tb = 0.35;                                       // idle
      n.brightness = NW.lerp(n.brightness, tb, 0.08);
    }

    /* lines: center → each node */
    for (const n of nodes) {
      const lit = hovered && litSet.has(n.label);
      ctx.strokeStyle = lit
        ? `rgba(139,124,246,${0.28 + n.brightness * 0.5})`
        : `rgba(139,124,246,${0.10 + n.brightness * 0.16})`;
      ctx.lineWidth = lit ? 1.2 : 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    }

    /* cross links between cluster members when hovered */
    if (hovered && litSet) {
      const litNodes = nodes.filter(n => litSet.has(n.label));
      ctx.strokeStyle = 'rgba(92,139,255,0.22)';
      ctx.lineWidth = 1;
      for (let i = 0; i < litNodes.length; i++) {
        for (let j = i + 1; j < litNodes.length; j++) {
          ctx.beginPath();
          ctx.moveTo(litNodes[i].x, litNodes[i].y);
          ctx.lineTo(litNodes[j].x, litNodes[j].y);
          ctx.stroke();
        }
      }
    }

    /* orbit path */
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.92, 0, 0, Math.PI * 2);
    ctx.stroke();

    /* nodes: glass chips */
    for (const n of nodes) {
      const b = n.brightness;
      const pulse = NW.reduced ? 0.5 : 0.5 + 0.14 * Math.sin(t * 1.4 + n.phase);

      /* chip body */
      ctx.beginPath();
      const rw = Math.max(44, ctx.measureText(n.label).width * 0.62 + 34);
      const rh = 24;
      roundRect(ctx, n.x - rw / 2, n.y - rh / 2, rw, rh, 12);
      ctx.fillStyle = `rgba(12,15,30,${0.55 + b * 0.35})`;
      ctx.fill();
      ctx.strokeStyle = hovered && litSet && litSet.has(n.label)
        ? `rgba(139,124,246,${0.35 + b * 0.6})`
        : `rgba(255,255,255,${0.10 + b * 0.22})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      /* label */
      ctx.fillStyle = `rgba(238,241,250,${0.45 + b * 0.55 * pulse})`;
      ctx.font = '600 8.5px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.label, n.x, n.y + 0.5);

      /* glow dot when hovered directly */
      if (b > 0.9) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, rh / 2 + 3 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(92,139,255,0.5)';
        ctx.stroke();
      }
    }

    /* detect hover each frame */
    if (!NW.reduced) {
      let found = null;
      for (const n of nodes) {
        if (Math.hypot(mouse.x - n.x, mouse.y - n.y) < 36) { found = n; break; }
      }
      setHovered(found);
    }

    requestAnimationFrame(frame);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  requestAnimationFrame(frame);
})();
