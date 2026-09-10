/* ============ HERO — parallax + nebula cursor-follow + loader ============ */
(() => {
  /* loader */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 600);
  });
  setTimeout(() => loader.classList.add('done'), 3500); // failsafe

  if (NW.reduced || NW.isMobile) return;

  const parallax = document.getElementById('heroParallax');
  const nebulaPurple = document.querySelector('.nebula-purple');
  const nebulaBlue = document.querySelector('.nebula-blue');
  const floaters = document.getElementById('heroFloaters');
  const core = document.querySelector('.nw-core');

  let tx = 0, ty = 0, cx = 0, cy = 0;
  let nx = 0, ny = 0, ncx = 0, ncy = 0;
  let fx = 0, fy = 0, fcx = 0, fcy = 0;

  window.addEventListener('mousemove', (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5);   // -0.5..0.5
    const dy = (e.clientY / window.innerHeight - 0.5);
    tx = dx * 14; ty = dy * 10;              // orbital system shift
    nx = dx * 60; ny = dy * 40;              // nebula follows
    fx = dx * 9; fy = dy * 7;                 // glass chips
    if (core) {
      core.style.setProperty('--px', dx * 10 + 'px');
      core.style.setProperty('--py', dy * 8 + 'px');
    }
  }, { passive: true });

  function tick() {
    cx = NW.lerp(cx, tx, 0.045);
    cy = NW.lerp(cy, ty, 0.045);
    ncx = NW.lerp(ncx, nx, 0.02);
    ncy = NW.lerp(ncy, ny, 0.02);
    fcx = NW.lerp(fcx, fx, 0.03);
    fcy = NW.lerp(fcy, fy, 0.03);

    if (parallax) parallax.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    if (nebulaPurple) nebulaPurple.style.transform = `translate3d(${ncx * 0.4}px,${ncy * 0.4}px,0)`;
    if (nebulaBlue) nebulaBlue.style.transform = `translate3d(${ncx * 0.25}px,${ncy * 0.25}px,0)`;
    if (floaters) floaters.style.transform = `translate3d(${fcx * -0.5}px,${fcy * -0.5}px,0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
