/* ============ ORBITAL CONNECTION — Business → NezWorks → Talent ============ */
(() => {
  const svg = document.getElementById('connectionVisual');
  if (!svg) return;
  const linksG = svg.querySelector('.conn-links');
  const nodesG = svg.querySelector('.conn-nodes');
  const SVGNS = 'http://www.w3.org/2000/svg';
  const C = 260, R = 170;

  const talent = [
    { label: 'DESIGNER' },
    { label: 'EDITOR' },
    { label: 'DEVELOPER' },
    { label: 'COPYWRITER' },
    { label: 'STRATEGIST' },
  ];

  const els = talent.map((t, i) => {
    const angle = (i / talent.length) * Math.PI * 2 - Math.PI / 2 + NW.rand(-0.2, 0.2);
    const x = C + Math.cos(angle) * R;
    const y = C + Math.sin(angle) * R;
    return { ...t, x, y, angle, el: null, line: null, litAt: 0 };
  });

  els.forEach((n) => {
    /* line center → node */
    const line = document.createElementNS(SVGNS, 'line');
    line.setAttribute('x1', C); line.setAttribute('y1', C);
    line.setAttribute('x2', n.x); line.setAttribute('y2', n.y);
    line.setAttribute('class', 'conn-line');
    linksG.appendChild(line);
    n.line = line;

    /* node circle */
    const c = document.createElementNS(SVGNS, 'circle');
    c.setAttribute('cx', n.x); c.setAttribute('cy', n.y);
    c.setAttribute('r', 5);
    c.setAttribute('class', 'conn-node');
    nodesG.appendChild(c);
    n.el = c;
  });

  if (NW.reduced) return;

  /* tracer: a glowing point travels the orbit; when it passes a node, the node + its line illuminate briefly */
  const tracer = svg.querySelector('.conn-tracer');
  let tracerEl = tracer;
  if (!tracerEl) {
    tracerEl = document.createElementNS(SVGNS, 'circle');
    tracerEl.setAttribute('class', 'conn-tracer');
    svg.appendChild(tracerEl);
  }

  let angle = -Math.PI / 2;
  let lastLit = -1;

  function frame(now) {
    angle += 0.003; // very slow orbit (~35s per revolution)
    const tx = C + Math.cos(angle) * R;
    const ty = C + Math.sin(angle) * R;
    tracerEl.setAttribute('cx', tx);
    tracerEl.setAttribute('cy', ty);

    els.forEach((n, i) => {
      const d = Math.hypot(n.x - tx, n.y - ty);
      if (d < 26) {
        if (lastLit !== i) {
          lastLit = i;
          n.el.classList.add('conn-flash');
          n.line.classList.add('lit');
          setTimeout(() => {
            n.el.classList.remove('conn-flash');
            n.line.classList.remove('lit');
          }, 900);
        }
      }
    });

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
