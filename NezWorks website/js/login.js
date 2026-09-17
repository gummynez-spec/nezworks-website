/* ============ LOGIN PAGE — email-based login ============ */
(() => {
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');
  if (!form) return;

  /* password toggle */
  form.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.querySelector('.pw-eye-open').style.display = isPassword ? 'none' : '';
      btn.querySelector('.pw-eye-closed').style.display = isPassword ? '' : 'none';
    });
  });

  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    if (!email || !password) {
      errorEl.textContent = 'Please fill in all fields';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
      const c = window.SB;
      if (!c) throw new Error('Supabase not connected');

      console.log('[NezWorks] Searching for email:', email);

      /* try freelancer table first */
      let profile = null;
      let role = 'client';
      let table = 'clients';

      const flResult = await c.from('freelancers').select('*').eq('email', email).maybeSingle();
      if (flResult.data) {
        profile = flResult.data;
        role = 'freelancer';
        table = 'freelancers';
        console.log('[NezWorks] Found in freelancers');
      } else {
        const clResult = await c.from('clients').select('*').eq('email', email).maybeSingle();
        if (clResult.data) {
          profile = clResult.data;
          role = 'client';
          table = 'clients';
          console.log('[NezWorks] Found in clients');
        }
      }

      if (!profile) {
        throw new Error('Email not found. Please register first.');
      }

      /* build session data */
      const sessionData = {
        name: profile.name || email.split('@')[0],
        displayName: profile.display_name || profile.name || email.split('@')[0],
        email: profile.email || email,
        role: role === 'freelancer' ? 'Freelancer' : 'Client',
      };

      if (role === 'freelancer') {
        sessionData.skills = profile.skills || [];
        sessionData.exp = profile.exp || '';
        sessionData.contact = profile.contact || {};
        sessionData.portfolio = profile.portfolio || '';
        sessionStorage.setItem('nw-freelancer-id', profile.id || '');
        sessionStorage.setItem('nw-freelancer-registered', '1');
      } else {
        sessionData.brand = profile.brand || '';
        sessionData.needs = profile.needs || [];
        sessionData.project = profile.project || '';
        sessionData.contact = profile.contact || {};
        sessionData.budget = profile.budget || [];
        sessionStorage.setItem('nw-client-id', profile.id || '');
      }

      const sessionKey = role === 'freelancer' ? FREE_KEY : CLIENT_KEY;
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));

      console.log('[NezWorks] Login OK →', role);
      window.location.href = role === 'freelancer' ? 'freelancer.html' : 'index.html';

    } catch (err) {
      console.warn('[NezWorks] Login failed:', err?.message || err);
      errorEl.textContent = err?.message || 'Login failed. Please try again.';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log in';
    }
  });

  /* if already logged in, redirect */
  try {
    const fl = sessionStorage.getItem('nw-freelancer-id');
    const cl = sessionStorage.getItem('nw-client');
    const fl2 = sessionStorage.getItem('nw-freelancer');
    if (fl || fl2) window.location.href = 'freelancer.html';
    else if (cl) window.location.href = 'index.html';
  } catch (e) {}
})();
