/* ============ CONTACT FORM — validate + success state ============ */
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const okBox = document.getElementById('contactOk');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#cName').value.trim();
    const email = form.querySelector('#cEmail').value.trim();
    const topic = form.querySelector('#cTopic').value;
    const message = form.querySelector('#cMessage').value.trim();

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || !topic || !message || message.length < 10 || !emailOk) {
      form.querySelectorAll('[required]').forEach((el) => {
        const bad = !el.value.trim() || (el.type === 'email' && !emailOk);
        el.style.borderColor = bad ? 'rgba(255,120,120,.7)' : '';
      });
      return;
    }

    form.hidden = true;
    okBox.hidden = false;
    okBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.querySelectorAll('#contactForm input, #contactForm textarea').forEach((el) => {
    el.addEventListener('input', () => {
      el.style.borderColor = '';
      if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
        el.style.borderColor = 'rgba(255,120,120,.7)';
      }
    });
  });
})();