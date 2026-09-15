/* ============ COSMOS — simple twinkling starfield background ============ */
(() => {
  if (!NW.reduced) {
    const canvas = document.getElementById('cosmos');
    if (canvas) init(canvas);
  }

  function init(canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, DPR;
    let stars = [];

    const STAR_COUNT = NW.isMobile ? 160 : 360;

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
        const r = Math.random() < 0.12 ? NW.rand(1.6, 2.8) : NW.rand(0.5, 1.5);
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r,
          base: NW.rand(0.3, 0.95),
          twSpeed: NW.rand(0.4, 1.4),
          twPhase: Math.random() * Math.PI * 2,
          tint: Math.random() < 0.2
        });
      }
    }

    window.addEventListener('resize', resize);
    resize();

    let last = 0;
    function frame(now) {
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);

      for (const s of stars) {
        const alpha = s.base * (0.55 + 0.45 * Math.sin(t * s.twSpeed * 2 + s.twPhase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.tint ? '#cdd6ff' : '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();