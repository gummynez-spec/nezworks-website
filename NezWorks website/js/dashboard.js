/* ============ DASHBOARD — progress ring, status transition, notifications ============ */
(() => {
  const dash = document.getElementById('dashPreview');
  if (!dash) return;

  const ring = document.getElementById('dashRing');
  const status = document.getElementById('dashStatus');
  const CIRC = 2 * Math.PI * 52; // r=52

  function animateRing(progress) {
    ring.style.strokeDashoffset = CIRC; // start empty
    requestAnimationFrame(() => {
      ring.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,.9,.3,1)';
      ring.style.strokeDashoffset = CIRC * (1 - progress / 100);
    });
  }

  function runSequence() {
    if (NW.reduced) {
      ring.style.strokeDashoffset = CIRC * (1 - 72 / 100);
    } else {
      animateRing(72);
    }

    /* status change: IN PROGRESS → REVIEW after a delay */
    setTimeout(() => {
      status.textContent = 'REVIEW';
      status.classList.add('review');
    }, NW.reduced ? 0 : 3200);
  }

  NW.onceVisible(dash, runSequence, 0.35);
})();
