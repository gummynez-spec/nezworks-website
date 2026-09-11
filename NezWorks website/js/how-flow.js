/* ============ HOW PAGE — 5-step timeline sequence ============ */
(() => {
  const how = document.getElementById('howTimeline');
  if (!how) return;

  const nodes = [...how.querySelectorAll('.how-node')];
  const fill = how.querySelector('.how-path-fill');
  const traveller = how.querySelector('.how-traveller');

  function activate() {
    how.classList.add('playing');
    traveller.classList.add('on');
    fill.style.strokeDashoffset = '0';

    const stepDur = NW.reduced ? 0 : 1200;

    nodes.forEach((n, i) => {
      setTimeout(() => {
        nodes.forEach((m) => m.classList.remove('active'));
        nodes.slice(0, i).forEach((m) => { m.classList.remove('active'); m.classList.add('done'); });
        n.classList.add('active');

        const nodeCenter = n.getBoundingClientRect().left + n.offsetWidth / 2;
        const howRect = how.getBoundingClientRect();
        traveller.style.transition = `transform ${stepDur}ms cubic-bezier(.22,.9,.3,1)`;
        traveller.style.transform = `translate(${nodeCenter - howRect.left}px,-50%)`;
      }, stepDur * i + 400);
    });

    setTimeout(() => {
      nodes.forEach((m) => { m.classList.remove('active'); m.classList.add('done'); });
      nodes[nodes.length - 1].classList.add('active');
      traveller.classList.remove('on');
    }, stepDur * nodes.length + 700);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { activate(); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(how);
})();
