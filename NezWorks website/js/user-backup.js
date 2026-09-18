/* ============ USER BACKUP — save all user info to localStorage ============ */
(() => {
  const BACKUP_KEY = 'nw-user-backups';

  /* Get all backups */
  function getBackups() {
    try {
      return JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
    } catch (e) { return []; }
  }

  /* Save a single user record to backups */
  function backupUser(userData) {
    if (!userData || !userData.email) return;
    const backups = getBackups();
    const idx = backups.findIndex(b => b.email === userData.email);
    const record = {
      email: userData.email,
      name: userData.name || '',
      displayName: userData.displayName || '',
      role: userData.role || '',
      profileId: userData.profileId || null,
      auth_user_id: userData.auth_user_id || null,
      brand: userData.brand || '',
      needs: userData.needs || [],
      project: userData.project || '',
      contact: userData.contact || {},
      budget: userData.budget || [],
      skills: userData.skills || [],
      exp: userData.exp || '',
      portfolio: userData.portfolio || '',
      backedUpAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      backups[idx] = { ...backups[idx], ...record };
    } else {
      backups.push(record);
    }
    localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    console.log('[NezWorks] User backed up:', record.email);
  }

  /* Export all backups as downloadable JSON */
  function exportBackups() {
    const backups = getBackups();
    if (!backups.length) {
      alert('No user data to export');
      return;
    }
    const blob = new Blob([JSON.stringify(backups, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nezworks-users-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('[NezWorks] Exported', backups.length, 'user records');
  }

  /* Export single user */
  function exportUser(email) {
    const backups = getBackups();
    const user = backups.find(b => b.email === email);
    if (!user) { alert('User not found'); return; }
    const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nezworks-user-${email.replace('@', '_at_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* Get backup count */
  function backupCount() {
    return getBackups().length;
  }

  /* Expose globally */
  window.NW_backupUser = backupUser;
  window.NW_exportBackups = exportBackups;
  window.NW_exportUser = exportUser;
  window.NW_backupCount = backupCount;
})();
