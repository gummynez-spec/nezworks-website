/* ============ LOGIN PAGE — Supabase Auth sign in ============ */
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

      /* sign in */
      const { data: authData, error: authError } = await c.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const authUser = authData?.user;
      if (!authUser) throw new Error('No user returned');

      const meta = authUser.user_metadata || {};
      const role = meta.role || 'client';
      const table = role === 'freelancer' ? 'freelancers' : 'clients';

      /* fetch profile from DB */
      const { data: profile, error: profileError } = await c.from(table)
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single();

      if (profileError || !profile) {
        console.warn('[NezWorks] Profile not found, using metadata');
      }

      /* build session data */
      const sessionData = {
        name: profile?.name || meta.name || email.split('@')[0],
        displayName: profile?.display_name || meta.display_name || profile?.name || email.split('@')[0],
        email: profile?.email || email,
        role: role === 'freelancer' ? 'Freelancer' : 'Client',
        auth_user_id: authUser.id,
      };

      if (role === 'freelancer') {
        sessionData.skills = profile?.skills || [];
        sessionData.exp = profile?.exp || '';
        sessionData.contact = profile?.contact || {};
        sessionData.portfolio = profile?.portfolio || '';
        sessionStorage.setItem('nw-freelancer-id', profile?.id || '');
      } else {
        sessionData.brand = profile?.brand || '';
        sessionData.needs = profile?.needs || [];
        sessionData.project = profile?.project || '';
        sessionData.contact = profile?.contact || {};
        sessionData.budget = profile?.budget || [];
        sessionStorage.setItem('nw-client-id', profile?.id || '');
      }

      const sessionKey = role === 'freelancer' ? FREE_KEY : CLIENT_KEY;
      sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
      if (role === 'freelancer') sessionStorage.setItem('nw-freelancer-registered', '1');

      /* redirect */
      window.location.href = role === 'freelancer' ? 'freelancer.html' : 'index.html';

    } catch (err) {
      console.warn('[NezWorks] Login failed:', err?.message || err);
      errorEl.textContent = err?.message || 'Login failed. Please try again.';
      loginBtn.disabled = false;
      loginBtn.textContent = 'Log in';
    }
  });

  /* if already logged in, redirect */
  (async () => {
    try {
      const c = window.SB;
      if (!c) return;
      const { data: { session } } = await c.auth.getSession();
      if (session?.user) {
        const role = session.user.user_metadata?.role || 'client';
        window.location.href = role === 'freelancer' ? 'freelancer.html' : 'index.html';
      }
    } catch (e) {}
  })();
})();
