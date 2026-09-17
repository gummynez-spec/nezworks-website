/* ============ PROFILE PAGE — show user account info ============ */
(() => {
  const card = document.getElementById('profileCard');
  if (!card) return;

  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';

  function loadUser() {
    try {
      const f = JSON.parse(sessionStorage.getItem(FREE_KEY) || 'null');
      if (f && f.name) return { ...f, role: 'Freelancer' };
      const c = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || 'null');
      if (c && c.name) return { ...c, role: 'Client' };
    } catch (e) {}
    return null;
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  const user = loadUser();
  if (!user) {
    card.innerHTML = `
      <div class="profile-empty">
        <h2>No account found</h2>
        <p>You haven't registered yet. <a href="register-freelancer.html" style="color:var(--accent-2);text-decoration:underline">Join as Freelancer</a> or <a href="register-client.html" style="color:var(--accent-2);text-decoration:underline">Join as Client</a>.</p>
      </div>`;
    return;
  }

  const initial = (user.name[0] || 'U').toUpperCase();
  let fields = '';

  if (user.role === 'Freelancer') {
    const skills = Array.isArray(user.skills) ? user.skills : [];
    fields = `
      <div class="profile-section">
        <h3>Account</h3>
        <div class="profile-field"><span class="pf-label">Name</span><span class="pf-value">${esc(user.name)}</span></div>
        <div class="profile-field"><span class="pf-label">Role</span><span class="pf-value">${user.role}</span></div>
        <div class="profile-field"><span class="pf-label">Contact</span><span class="pf-value">${esc(user.contact || '—')}</span></div>
      </div>
      <div class="profile-section">
        <h3>Details</h3>
        <div class="profile-field"><span class="pf-label">Experience</span><span class="pf-value">${esc(user.exp || '—')}</span></div>
        ${user.portfolio ? `<div class="profile-field"><span class="pf-label">Portfolio</span><span class="pf-value" style="word-break:break-all;max-width:260px;text-align:right"><a href="${esc(user.portfolio)}" target="_blank" rel="noopener" style="color:var(--accent-2);text-decoration:underline">${esc(user.portfolio)}</a></span></div>` : ''}
      </div>
      ${skills.length ? `
      <div class="profile-section">
        <h3>Skills</h3>
        <div class="profile-tags">${skills.map(s => `<span class="profile-tag">${esc(s)}</span>`).join('')}</div>
      </div>` : ''}
      <div style="text-align:center;margin-top:28px">
        <a href="freelancer.html" class="btn btn-primary btn-sm" data-cursor="hover">My workspace <span class="btn-arrow">→</span></a>
      </div>`;
  } else {
    const needs = Array.isArray(user.needs) ? user.needs : [];
    fields = `
      <div class="profile-section">
        <h3>Account</h3>
        <div class="profile-field"><span class="pf-label">Name</span><span class="pf-value">${esc(user.name)}</span></div>
        <div class="profile-field"><span class="pf-label">Role</span><span class="pf-value">${user.role}</span></div>
        <div class="profile-field"><span class="pf-label">Contact</span><span class="pf-value">${esc(user.contact || '—')}</span></div>
      </div>
      <div class="profile-section">
        <h3>Project info</h3>
        ${user.brand ? `<div class="profile-field"><span class="pf-label">Brand</span><span class="pf-value">${esc(user.brand)}</span></div>` : ''}
        ${user.project ? `<div class="profile-field"><span class="pf-label">Project</span><span class="pf-value">${esc(user.project)}</span></div>` : ''}
        ${user.budget && user.budget[0] ? `<div class="profile-field"><span class="pf-label">Budget</span><span class="pf-value">${esc(user.budget[0])} – ${esc(user.budget[1] || '')}</span></div>` : ''}
      </div>
      ${needs.length ? `
      <div class="profile-section">
        <h3>Needs</h3>
        <div class="profile-tags">${needs.map(n => `<span class="profile-tag">${esc(n)}</span>`).join('')}</div>
      </div>` : ''}
      <div style="text-align:center;margin-top:28px">
        <a href="project.html" class="btn btn-primary btn-sm" data-cursor="hover">Start a project <span class="btn-arrow">→</span></a>
      </div>`;
  }

  card.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${esc(initial)}</div>
      <div class="profile-header-text">
        <h1>${esc(user.name)}</h1>
        <span class="profile-role">${user.role}</span>
      </div>
    </div>
    ${fields}`;
})();
