/* ============ SUPABASE CLIENT ============
   Frontend config — uses the PUBLIC anon key only.
   The service_role key must NEVER be placed in frontend code.
   ========================================== */
(() => {
  const SUPABASE_URL = 'https://vnxwkrciqjewmwgmeuxs.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueHdrcmNpcWpld213Z21ldXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Nzg2NzcsImV4cCI6MjEwNTE1NDY3N30.4ayXoaIi6T4iOr80njIGP6vI9Ejwix-UzzJbAyoqggs';

  const lib = window.supabase;
  if (!lib || !lib.createClient) {
    console.warn('[NezWorks] supabase-js not loaded — running in offline/demo mode.');
    window.SB = null;
    return;
  }

  window.SB = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  window.SB_READY = true;
})();