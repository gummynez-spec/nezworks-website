/* ============ BANK DETAIL PAGE — show user bank/payment info ============ */
(() => {
  const card = document.getElementById('bankCard');
  if (!card) return;

  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';

  function loadUser() {
    try {
      const f = JSON.parse(sessionStorage.getItem(FREE_KEY) || 'null');
      if (f && f.name) return { ...f, role: 'Freelancer', displayName: f.displayName || f.name.split(' ')[0] };
      const c = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || 'null');
      if (c && c.name) return { ...c, role: 'Client', displayName: c.displayName || c.name.split(' ')[0] };
    } catch (e) {}
    return null;
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  async function loadBankFromSupabase(user) {
    try {
      const c = window.SB;
      if (!c) return null;
      const table = user.role === 'Freelancer' ? 'freelancers' : 'clients';
      const id = user.role === 'Freelancer'
        ? sessionStorage.getItem('nw-freelancer-id')
        : sessionStorage.getItem('nw-client-id');
      if (!id) return null;
      const { data, error } = await c.from(table).select('bank_name, bank_account_name, bank_account_number').eq('id', id).single();
      if (error || !data) return null;
      if (data.bank_name) return { bank: data.bank_name, accountName: data.bank_account_name, accountNo: data.bank_account_number };
    } catch (e) { console.warn('[NezWorks] loadBankFromSupabase error:', e?.message || e); }
    return null;
  }

  async function saveBankToSupabase(user, bankData) {
    try {
      const c = window.SB;
      if (!c) return;
      const table = user.role === 'Freelancer' ? 'freelancers' : 'clients';
      const id = user.role === 'Freelancer'
        ? sessionStorage.getItem('nw-freelancer-id')
        : sessionStorage.getItem('nw-client-id');
      if (!id) return;
      const { error } = await c.from(table).update({
        bank_name: bankData.bank,
        bank_account_name: bankData.accountName,
        bank_account_number: bankData.accountNo,
      }).eq('id', id);
      if (error) console.warn('[NezWorks] saveBankToSupabase error:', error.message);
    } catch (e) { console.warn('[NezWorks] saveBankToSupabase error:', e?.message || e); }
  }

  const user = loadUser();
  if (!user) {
    card.innerHTML = `
      <div class="bank-empty">
        <h2>No account found</h2>
        <p>You haven't registered yet. <a href="register-freelancer.html">Join as Freelancer</a> or <a href="register-client.html">Join as Client</a>.</p>
      </div>`;
    return;
  }

  /* try loading from Supabase first, fallback to sessionStorage */
  (async () => {
    let bankData = await loadBankFromSupabase(user);
    if (!bankData) bankData = JSON.parse(sessionStorage.getItem('nw-bank') || 'null');

    if (!bankData) {
      card.innerHTML = `
        <div class="bank-header">
          <h1>Bank Detail</h1>
          <p>Add your bank account for receiving payments.</p>
        </div>
        <form id="bankForm" novalidate>
          <div class="bank-section">
            <h3>Account Info</h3>
            <div class="bank-field">
              <span class="bf-label">Bank name</span>
              <select class="bf-input" name="bank" required>
                <option value="">Select bank</option>
                <option value="SCB">SCB (ไทยพาณิชย์)</option>
                <option value="KBank">KBank (กสิกรไทย)</option>
                <option value="BBL">BBL (กรุงเทพ)</option>
                <option value="BAY">BAY (กรุงศรีอยุธยา)</option>
                <option value="KTB">KTB (กรุงไทย)</option>
                <option value="TTB">TTB (ทหารไทยธนชาต)</option>
                <option value="GSB">GSB (ออมสิน)</option>
                <option value="LH_BANK">LH Bank (โฮมโปร)</option>
                <option value="CIMB">CIMB (ซีไอเอ็มบี)</option>
                <option value="UOB">UOB (ยูโอบี)</option>
                <option value="HSBC">HSBC</option>
                <option value="STD_CHARTERED">Standard Chartered</option>
                <option value="ICBC">ICBC</option>
                <option value="PAYPAL">PayPal</option>
                <option value="PROMPTPAY">PromptPay</option>
                <option value="TRUEMONEY">TrueMoney Wallet</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div class="bank-field"><span class="bf-label">Account name</span><input class="bf-input" type="text" name="accountName" required placeholder="Full name on account"></div>
            <div class="bank-field"><span class="bf-label">Account number</span><input class="bf-input" type="text" name="accountNo" required placeholder="123-4-56789-0"></div>
          </div>
          <div style="text-align:center;margin-top:12px">
            <button type="submit" class="btn btn-primary btn-sm" data-cursor="hover">Save <span class="btn-arrow">→</span></button>
          </div>
        </form>
        <div style="text-align:center;margin-top:20px"><a href="profile.html" style="font-size:.8rem;color:var(--ink-3);text-decoration:underline">← Back to profile</a></div>`;

      const form = card.querySelector('#bankForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bank = form.querySelector('[name="bank"]').value.trim();
        const accountName = form.querySelector('[name="accountName"]').value.trim();
        const accountNo = form.querySelector('[name="accountNo"]').value.trim();
        if (!bank || !accountName || !accountNo) return;
        const data = { bank, accountName, accountNo };
        sessionStorage.setItem('nw-bank', JSON.stringify(data));
        await saveBankToSupabase(user, data);
        location.reload();
      });
      return;
    }

    card.innerHTML = `
      <div class="bank-header">
        <h1>Bank Detail</h1>
        <p>Your payment account on file.</p>
      </div>
      <div class="bank-section">
        <h3>Account Info</h3>
        <div class="bank-field"><span class="bf-label">Bank</span><span class="bf-value">${esc(bankData.bank)}</span></div>
        <div class="bank-field"><span class="bf-label">Account name</span><span class="bf-value">${esc(bankData.accountName)}</span></div>
        <div class="bank-field"><span class="bf-label">Account number</span><span class="bf-value">${esc(bankData.accountNo)}</span></div>
      </div>
      <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center">
        <button class="btn btn-ghost btn-sm" id="editBank" data-cursor="hover">Edit</button>
        <a href="profile.html" class="btn btn-primary btn-sm" data-cursor="hover">Profile <span class="btn-arrow">→</span></a>
      </div>`;

    card.querySelector('#editBank')?.addEventListener('click', () => {
      sessionStorage.removeItem('nw-bank');
      location.reload();
    });
  })();
})();
