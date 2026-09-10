/* ============ CUSTOM CURSOR — dot → hover → VIEW / EXPLORE states ============ */
(() => {
  if (NW.reduced || NW.isMobile) return;

  const cursor = document.getElementById('cursor');
  const label = cursor.querySelector('.cursor-label');
  if (!cursor) return;

  let x = -100, y = -100;
  let shown = false;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!shown) { shown = true; cursor.classList.remove('hidden'); }
    cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
  document.addEventListener('mouseenter', () => shown && cursor.classList.remove('hidden'));

  /* state from data-cursor attributes */
  function bindState(sel, cls, text) {
    document.querySelectorAll(sel).forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add(cls);
        if (text) label.textContent = text;
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove(cls);
        label.textContent = '';
      });
    });
  }

  bindState('[data-cursor="hover"]', 'hover');
  bindState('a:not([data-cursor]), [data-cursor="link"]', 'hover');
  bindState('[data-cursor="view"]', 'view', 'VIEW');
  bindState('[data-cursor="explore"]', 'explore', 'EXPLORE');

  /* form inputs: shrink to precise dot */
  document.querySelectorAll('input, textarea, select').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
})();
