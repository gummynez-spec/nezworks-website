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
      <ul class="user-menu-list">
        <li><a class="user-menu-item" href="profile.html" data-cursor="link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="label">Profile</span>
        </a></li>
        <li><a class="user-menu-item" href="${user.role === 'Freelancer' ? 'freelancer.html' : 'project.html'}" data-cursor="link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          <span class="label">${user.role === 'Freelancer' ? 'Workspace' : 'Start a project'}</span>
        </a></li>
      </ul>
      <div class="user-menu-separator"></div>
      <ul class="user-menu-list user-menu-list--danger">
        <li><button class="user-menu-item user-menu-item--danger" data-user-logout data-cursor="hover">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span class="label">Log out</span>
        </button></li>
      </ul>
    </div>`;

  const keepBtn = cta.querySelector('#newWorkBtn');
  if (keepBtn) cta.prepend(chip);
  else { cta.innerHTML = ''; cta.appendChild(chip); }

  const btn = chip.querySelector('.user-chip-btn');
  const menu = chip.querySelector('.user-menu');

  function toggleMenu() {
    const open = menu.hidden;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  function closeMenu() {
    if (!menu.hidden) {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  btn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });
  document.addEventListener('click', (e) => { if (!chip.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

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
