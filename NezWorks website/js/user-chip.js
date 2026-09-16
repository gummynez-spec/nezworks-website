/* ============ USER CHIP — show logged-in client/freelancer in the header ============ */
(() => {
  const cta = document.querySelector('.nav-cta');
  if (!cta) return;

  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';

  function sessionUser() {
    try {
      const f = JSON.parse(sessionStorage.getItem(FREE_KEY) || 'null');
      if (f && f.name) return { ...f, role: 'Freelancer', key: FREE_KEY };
      const c = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || 'null');
      if (c && c.name) return { ...c, role: 'Client', key: CLIENT_KEY };
    } catch (e) {}
    return null;
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  const user = sessionUser();
  if (!user) return;

  const chip = document.createElement('div');
  chip.className = 'user-chip';
  chip.innerHTML = `
    <button class="user-chip-btn" data-cursor="hover" aria-haspopup="true" aria-expanded="false">
      <span class="user-avatar">${escapeHtml((user.name[0] || 'U').toUpperCase())}</span>
      <span class="user-chip-text">
        <span class="user-name">${escapeHtml(user.name)}</span>
        <span class="user-role">${user.role}</span>
      </span>
    </button>
    <div class="user-menu" hidden>
      ${user.role === 'Freelancer'
        ? '<a href="freelancer.html" data-cursor="link">My workspace</a>'
        : '<a href="project.html" data-cursor="link">Start a project</a>'}
      <button class="user-logout" data-user-logout data-cursor="hover">Log out</button>
    </div>`;

  const keepBtn = cta.querySelector('#newWorkBtn');
  if (keepBtn) cta.prepend(chip);
  else { cta.innerHTML = ''; cta.appendChild(chip); }

  const btn = chip.querySelector('.user-chip-btn');
  const menu = chip.querySelector('.user-menu');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!chip.contains(e.target)) {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  chip.querySelector('[data-user-logout]')?.addEventListener('click', () => {
    sessionStorage.removeItem(FREE_KEY);
    sessionStorage.removeItem(CLIENT_KEY);
    sessionStorage.removeItem('nw-freelancer-registered');
    sessionStorage.removeItem('nw-works');
    sessionStorage.removeItem('nw-client-id');
    sessionStorage.removeItem('nw-freelancer-id');
    location.reload();
  });
})();