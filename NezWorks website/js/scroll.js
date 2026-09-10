/* ============ SCROLL — progress, reveals, counters, how-it-works sequence ============ */
(() => {
  /* ---------- scroll progress ---------- */
  const bar = document.querySelector('.scroll-progress span');
  const nav = document.getElementById('nav');

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.width = (p * 100) + '%';
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal-el, .sr');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach((el) => io.observe(el));

  /* ---------- number counters (once per load) ---------- */
  const counted = new WeakSet();
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || counted.has(entry.target)) return;
      const el = entry.target;
      counted.add(el);
      counterIO.unobserve(el);

      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const dur = 1400;
      let start = null;

      function step(ts) {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      if (NW.reduced) {
        el.textContent = target.toFixed(decimals) + suffix;
      } else {
        requestAnimationFrame(step);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => counterIO.observe(el));

  /* ---------- how it works sequence ---------- */
  const how = document.getElementById('howTimeline');
  if (how) {
    const nodes = [...how.querySelectorAll('.how-node')];
    const fill = how.querySelector('.how-path-fill');
    const traveller = how.querySelector('.how-traveller');

    function activate() {
      how.classList.add('playing');
      traveller.classList.add('on');

      /* orbital path draws itself in */
      fill.style.strokeDashoffset = '0';

      const stepDur = NW.reduced ? 0 : 1200;

      nodes.forEach((n, i) => {
        setTimeout(() => {
          nodes.forEach((m) => m.classList.remove('active'));
          nodes.slice(0, i).forEach((m) => { m.classList.remove('active'); m.classList.add('done'); });
          n.classList.add('active');

          // traveller moves to node position — the signature light arriving
          const nodeCenter = n.getBoundingClientRect().left + n.offsetWidth / 2;
          const howRect = how.getBoundingClientRect();
          const x = nodeCenter - howRect.left;
          traveller.style.transition = `transform ${stepDur}ms cubic-bezier(.22,.9,.3,1)`;
          traveller.style.transform = `translate(${x}px,-50%)`;
        }, stepDur * i + 400);
      });

      // finish: all nodes settled, last remains active
      setTimeout(() => {
        nodes.forEach((m) => { m.classList.remove('active'); m.classList.add('done'); });
        nodes[nodes.length - 1].classList.add('active');
        traveller.classList.remove('on');
      }, stepDur * nodes.length + 700);
    }

    const howIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { activate(); howIO.disconnect(); }
      });
    }, { threshold: 0.35 });
    howIO.observe(how);
  }
})();
