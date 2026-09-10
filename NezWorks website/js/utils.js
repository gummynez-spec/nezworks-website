/* ============ NEZWORKS UTILS ============ */
window.NW = (() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(hover: none), (max-width: 760px)').matches;

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const rand = (min, max) => min + Math.random() * (max - min);
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* once-only intersection observer helper */
  function onceVisible(el, cb, threshold = 0.25) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { cb(e.target); io.disconnect(); }
      });
    }, { threshold });
    io.observe(el);
  }

  return { reduced, isMobile, lerp, clamp, rand, $, $$, onceVisible };
})();
