/* ============ WORK — image reveals + gentle tilt ============ */
(() => {
  const cards = document.querySelectorAll('.work-card');

  /* scroll-in reveal */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });
  cards.forEach((c) => io.observe(c));

  if (NW.reduced || NW.isMobile) return;

  /* subtle 3D tilt (max ~4deg) */
  cards.forEach((card) => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const max = 3;
        card.style.transform = `translateY(-4px) rotateX(${py * max * -1}deg) rotateY(${px * max}deg)`;
        // set gradient highlight position
        card.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
      });
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();
