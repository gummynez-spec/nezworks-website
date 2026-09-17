/* ============ PROFILE PAGE — show user account info + display name edit ============ */
(() => {
  const card = document.getElementById('profileCard');
  if (!card) return;

  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';

  function loadUser() {
    try {
      const f = JSON.parse(sessionStorage.getItem(FREE_KEY) || 'null');
      if (f && f.name) return { ...f, role: 'Freelancer', key: FREE_KEY };
      const c = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || 'null');
      if (c && c.name) return { ...c, role: 'Client', key: CLIENT_KEY };
    } catch (e) {}
    return null;
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function renderContact(contact) {
    if (!contact) return '—';
    /* support both old string format and new {platform, value} format */
    if (typeof contact === 'object' && contact.platform) {
      const urlMap = {
        email: `mailto:${contact.value}`,
        phone: `tel:${contact.value}`,
        line: `line://ti/p/${contact.value}`,
        facebook: `https://facebook.com/${contact.value}`,
        instagram: `https://instagram.com/${contact.value.replace('@','')}`,
        twitter: `https://twitter.com/${contact.value.replace('@','')}`,
        discord: `https://discord.com/users/${contact.value}`,
      };
      const href = urlMap[contact.platform] || '#';
      const platformLabel = contact.platform.charAt(0).toUpperCase() + contact.platform.slice(1);
      return `<a href="${esc(href)}" target="_blank" rel="noopener" class="contact-click-btn" data-cursor="hover">${esc(platformLabel)} — Click Here</a>`;
    }
    /* legacy: plain string */
    return esc(contact);
  }

  function saveSession(user) {
    sessionStorage.setItem(user.key, JSON.stringify(user));
  }

  async function updateDisplayNameInDB(user, newName) {
    try {
      const c = window.SB;
      if (!c) return;
      const table = user.role === 'Freelancer' ? 'freelancers' : 'clients';
      const id = user.role === 'Freelancer'
        ? sessionStorage.getItem('nw-freelancer-id')
        : sessionStorage.getItem('nw-client-id');
      if (!id) return;
      const { error } = await c.from(table).update({
        display_name: newName,
        display_name_changes_remaining: user.display_name_changes_remaining
      }).eq('id', id);
      if (error) console.warn('[NezWorks] display_name update failed:', error.message);
    } catch (err) { console.warn('[NezWorks] display_name update error:', err?.message || err); }
  }

  const user = loadUser();
  if (!user) {
    card.innerHTML = `
      <div class="profile-empty">
        <h2>No account found</h2>
        <p>You haven't registered yet. <a href="register-freelancer.html" style="color:var(--accent-2);text-decoration:underline">Join as Freelancer</a> or <a href="register-client.html" style="color:var(--accent-2);text-decoration:underline">Join as Client</a>.</p>
      </div>`;
    return;
  }

  /* compute displayName: stored value or fallback to first word of real name */
  const displayName = user.displayName || user.name.split(' ')[0];
  const changesLeft = user.display_name_changes_remaining ?? 1;
  const initial = (displayName[0] || 'U').toUpperCase();

  /* --- build edit-display-name block --- */
  const editBlock = `
    <div class="profile-section">
      <h3>Display name <span style="font-size:.65rem;letter-spacing:0;text-transform:none;color:var(--ink-3);font-weight:400">· what others see</span></h3>
      <div class="profile-field" style="flex-wrap:wrap;gap:8px">
        <span class="pf-value" id="displayNameValue">${esc(displayName)}</span>
        <button class="btn btn-ghost btn-sm" id="editDisplayNameBtn" data-cursor="hover" style="margin-left:auto">
          ${changesLeft > 0 ? `Edit (${changesLeft} free change${changesLeft !== 1 ? 's' : ''} left)` : 'Change name'}
        </button>
      </div>
      ${changesLeft === 0 ? '<p style="font-size:.72rem;color:var(--ink-3);margin-top:4px">Free changes used. Purchase 3 more changes for ฿99.</p>' : ''}
    </div>`;

  let fields = '';

  if (user.role === 'Freelancer') {
    const skills = Array.isArray(user.skills) ? user.skills : [];
    fields = `
      <div class="profile-section">
        <h3>Account</h3>
        <div class="profile-field"><span class="pf-label">Real name</span><span class="pf-value">${esc(user.name)}</span></div>
        <div class="profile-field"><span class="pf-label">Role</span><span class="pf-value">${user.role}</span></div>
        <div class="profile-field" style="flex-wrap:wrap;gap:8px"><span class="pf-label">Contact</span><span class="pf-value">${renderContact(user.contact)}</span></div>
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
      <div style="text-align:center;margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="freelancer.html" class="btn btn-primary btn-sm" data-cursor="hover">My workspace <span class="btn-arrow">→</span></a>
        <a href="bank-detail.html" class="btn btn-ghost btn-sm" data-cursor="hover">Bank detail <span class="btn-arrow">→</span></a>
      </div>`;
  } else {
    const needs = Array.isArray(user.needs) ? user.needs : [];
    fields = `
      <div class="profile-section">
        <h3>Account</h3>
        <div class="profile-field"><span class="pf-label">Real name</span><span class="pf-value">${esc(user.name)}</span></div>
        <div class="profile-field"><span class="pf-label">Role</span><span class="pf-value">${user.role}</span></div>
        <div class="profile-field" style="flex-wrap:wrap;gap:8px"><span class="pf-label">Contact</span><span class="pf-value">${renderContact(user.contact)}</span></div>
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
      <div style="text-align:center;margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a href="project.html" class="btn btn-primary btn-sm" data-cursor="hover">Start a project <span class="btn-arrow">→</span></a>
        <a href="bank-detail.html" class="btn btn-ghost btn-sm" data-cursor="hover">Bank detail <span class="btn-arrow">→</span></a>
      </div>`;
  }

  card.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">${esc(initial)}</div>
      <div class="profile-header-text">
        <h1>${esc(displayName)}</h1>
        <span class="profile-role">${user.role}</span>
      </div>
    </div>
    ${editBlock}
    ${fields}`;

  /* ---- edit display name logic ---- */
  const editBtn = document.getElementById('editDisplayNameBtn');
  const nameValue = document.getElementById('displayNameValue');
  if (!editBtn || !nameValue) return;

  editBtn.addEventListener('click', () => {
    /* if no free changes, show "buy" message */
    if (changesLeft <= 0) {
      nameValue.insertAdjacentHTML('afterend', `
        <div class="buy-display-name" style="width:100%;margin-top:8px;padding:14px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--stroke-soft)">
          <p style="font-size:.82rem;color:var(--ink);margin-bottom:8px">You've used your free change. Purchase 3 more display name changes for <strong>฿99</strong>.</p>
          <button class="btn btn-primary btn-sm" id="buyChangesBtn" data-cursor="hover">Buy 3 changes · ฿99 <span class="btn-arrow">→</span></button>
        </div>`);
      editBtn.disabled = true;
      document.getElementById('buyChangesBtn')?.addEventListener('click', () => {
        /* placeholder — integrate payment later */
        alert('Payment integration coming soon!');
      });
      return;
    }

    /* switch to edit mode */
    const currentName = nameValue.textContent;
    nameValue.outerHTML = `
      <input class="pf-input" id="displayNameInput" type="text" value="${esc(currentName)}" style="background:transparent;border:0;outline:none;font-family:inherit;font-size:.88rem;font-weight:600;color:var(--ink);max-width:260px;padding:0;border-bottom:1px solid var(--stroke)">`;
    editBtn.textContent = 'Save';
    editBtn.style.background = 'var(--accent-2)';
    editBtn.style.color = '#000';

    document.getElementById('displayNameInput')?.focus();

    editBtn.onclick = async () => {
      const input = document.getElementById('displayNameInput');
      const newName = input?.value.trim();
      if (!newName || newName === currentName) {
        location.reload();
        return;
      }
      user.displayName = newName;
      user.display_name_changes_remaining = changesLeft - 1;
      saveSession(user);
      await updateDisplayNameInDB(user, newName);
      location.reload();
    };
  });
})();
