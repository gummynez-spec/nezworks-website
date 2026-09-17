/* ============ MESSAGES PAGE — chat + invoice between client & freelancer ============ */
(() => {
  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';

  function loadUser() {
    try {
      const f = JSON.parse(sessionStorage.getItem(FREE_KEY) || 'null');
      if (f && f.name) return { ...f, role: 'freelancer', displayName: f.displayName || f.name.split(' ')[0] };
      const c = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || 'null');
      if (c && c.name) return { ...c, role: 'client', displayName: c.displayName || c.name.split(' ')[0] };
    } catch (e) {}
    return null;
  }

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    return Math.floor(diff / 86400000) + 'd';
  }

  const user = loadUser();
  if (!user) {
    document.getElementById('msgEmpty').innerHTML = 'Please log in to access messages.<br><br><a href="register-client.html" style="color:var(--accent-2)">Register as Client</a> or <a href="register-freelancer.html" style="color:var(--accent-2)">Register as Freelancer</a>';
    return;
  }

  const list = document.getElementById('msgList');
  const empty = document.getElementById('msgEmpty');
  const chatHeader = document.getElementById('msgChatHeader');
  const msgMessages = document.getElementById('msgMessages');
  const msgInputWrap = document.getElementById('msgInputWrap');
  const msgInput = document.getElementById('msgInput');
  const sendBtn = document.getElementById('sendBtn');
  const plusBtn = document.getElementById('plusBtn');
  const overlay = document.getElementById('invoiceOverlay');
  const invoiceRows = document.getElementById('invoiceRows');
  const invoiceTotal = document.getElementById('invoiceTotal');
  const addRowBtn = document.getElementById('addRowBtn');
  const cancelInvoice = document.getElementById('cancelInvoice');
  const sendInvoice = document.getElementById('sendInvoice');

  let activeConvo = null;
  let conversations = [];
  let myRowId = null; /* row ID in clients/freelancers table */

  /* ---- Find my row ID in the table ---- */
  async function findMyRowId() {
    try {
      const c = window.SB;
      if (!c) return null;
      const table = user.role === 'freelancer' ? 'freelancers' : 'clients';
      /* try auth_user_id first */
      if (user.auth_user_id) {
        const { data } = await c.from(table).select('id').eq('auth_user_id', user.auth_user_id).single();
        if (data) return data.id;
      }
      /* fallback: try email */
      if (user.email) {
        const { data } = await c.from(table).select('id').eq('email', user.email).single();
        if (data) return data.id;
      }
      /* fallback: try sessionStorage ID */
      const fallbackId = sessionStorage.getItem(user.role === 'freelancer' ? 'nw-freelancer-id' : 'nw-client-id');
      if (fallbackId) {
        const { data } = await c.from(table).select('id').eq('id', fallbackId).single();
        if (data) return data.id;
      }
    } catch (e) { console.warn('[NezWorks] findMyRowId:', e?.message || e); }
    return null;
  }

  /* ---- Load conversations ---- */
  async function loadConversations() {
    try {
      const c = window.SB;
      if (!c) return;

      myRowId = await findMyRowId();
      if (!myRowId) {
        console.warn('[NezWorks] Could not find user row');
        return;
      }

      const { data: convos, error } = await c.from('conversations')
        .select('*')
        .or(`client_id.eq.${myRowId},freelancer_id.eq.${myRowId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      conversations = convos || [];
      renderConversationList();

      /* if no conversations, show create welcome chat button */
      if (conversations.length === 0) {
        empty.innerHTML = `
          <div style="text-align:center">
            <p style="margin-bottom:16px">No conversations yet</p>
            <button class="btn btn-primary btn-sm" id="createWelcomeBtn" data-cursor="hover">
              Start Welcome Chat <span class="btn-arrow">→</span>
            </button>
            <br><br>
            <button class="btn btn-ghost btn-sm" id="createTestBtn" data-cursor="hover" style="font-size:.72rem">
              Create Test Chat (temporary)
            </button>
          </div>`;
        document.getElementById('createWelcomeBtn')?.addEventListener('click', createWelcomeChat);
        document.getElementById('createTestBtn')?.addEventListener('click', createTestChat);
      }
    } catch (e) { console.warn('[NezWorks] loadConversations:', e?.message || e); }
  }

  /* ---- Create welcome chat ---- */
  async function createWelcomeChat() {
    try {
      const c = window.SB;
      if (!c) return;
      if (!myRowId) return;

      /* get welcome message */
      let welcomeText = 'สวัสดีค่ะ ขอบคุณที่มาใช้บริการ NezWorks 🎉\n\nเราพร้อมช่วยเหลือคุณทุกขั้นตอน หากมีคำถามอะไร สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks';
      const configKey = user.role === 'freelancer' ? 'welcome_freelancer' : 'welcome_client';
      try {
        const { data: cfg } = await c.from('system_config').select('value').eq('key', configKey).single();
        if (cfg?.value?.message) welcomeText = cfg.value.message;
      } catch (e) {}

      /* check if welcome chat already exists */
      const { data: existing } = await c.from('conversations')
        .select('id')
        .eq('freelancer_name', 'NezWorks')
        .or(`client_id.eq.${myRowId},freelancer_id.eq.${myRowId}`)
        .limit(1);

      if (existing && existing.length > 0) {
        /* just open existing */
        await loadConversations();
        return;
      }

      /* create conversation */
      const convoData = user.role === 'freelancer'
        ? { client_id: null, freelancer_id: myRowId, client_name: 'NezWorks', freelancer_name: user.displayName || user.name }
        : { client_id: myRowId, freelancer_id: null, client_name: user.displayName || user.name, freelancer_name: 'NezWorks' };

      const { data: convo, error } = await c.from('conversations').insert([{
        ...convoData,
        last_message: welcomeText.substring(0, 50) + '...',
      }]).select().single();

      if (error) throw error;

      /* send welcome message */
      if (convo?.id) {
        await c.from('messages').insert([{
          conversation_id: convo.id,
          sender_id: 'system',
          sender_role: 'system',
          type: 'text',
          content: welcomeText,
        }]);
      }

      await loadConversations();
      if (convo) openConversation(convo);
    } catch (e) { console.warn('[NezWorks] createWelcomeChat:', e?.message || e); }
  }

  /* ---- Create test chat (temporary) ---- */
  async function createTestChat() {
    const c = window.SB;
    if (!c || !myRowId) return;

    const isFreelancer = user.role === 'freelancer';
    const convoData = isFreelancer
      ? { client_id: null, freelancer_id: myRowId, client_name: 'Test Client', freelancer_name: user.displayName || user.name }
      : { client_id: myRowId, freelancer_id: null, client_name: user.displayName || user.name, freelancer_name: 'Test Freelancer' };

    const { data: convo, error } = await c.from('conversations').insert([{
      ...convoData,
      last_message: 'Thank you for your order!',
    }]).select().single();

    if (error) { alert('Error: ' + error.message); return; }
    if (!convo) return;

    const msgs = [
      { sender_id: 'system', sender_role: 'system', type: 'text', content: 'สวัสดีค่ะ ขอบคุณที่มาใช้บริการ NezWorks 🎉\n\nเราพร้อมช่วยเหลือคุณทุกขั้นตอน หากมีคำถามอะไร สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks' },
      { sender_id: 'test-freelancer', sender_role: 'freelancer', type: 'text', content: 'สวัสดีครับ! ผมจะเริ่มออกแบบโลโก้ให้ภายในวันนี้' },
      { sender_id: 'test-client', sender_role: 'client', type: 'text', content: 'ได้เลยครับ รอชม!' },
      { sender_id: 'test-freelancer', sender_role: 'freelancer', type: 'invoice', content: 'Invoice — ฿3,500', invoice_data: { items: [{ name: 'Logo Design', qty: 1, price: 3000 }, { name: 'Brand Guideline', qty: 1, price: 500 }], total: 3500, status: 'pending' } },
      { sender_id: 'test-client', sender_role: 'client', type: 'text', content: 'Thank you for your order!' },
    ];

    for (const m of msgs) {
      await c.from('messages').insert([{ conversation_id: convo.id, ...m }]);
    }

    await loadConversations();
    openConversation(convo);
  }

  function renderConversationList() {
    list.innerHTML = '';
    conversations.forEach(conv => {
      const isFreelancer = user.role === 'freelancer';
      const otherName = isFreelancer ? (conv.client_name || 'Client') : (conv.freelancer_name || 'Freelancer');
      const initial = (otherName[0] || '?').toUpperCase();
      const el = document.createElement('div');
      el.className = 'msg-contact' + (activeConvo?.id === conv.id ? ' active' : '');
      el.innerHTML = `
        <div class="msg-contact-avatar">${esc(initial)}</div>
        <div class="msg-contact-info">
          <div class="msg-contact-name">${esc(otherName)}</div>
          <div class="msg-contact-preview">${esc(conv.last_message || 'No messages yet')}</div>
        </div>
        <div class="msg-contact-time">${conv.updated_at ? timeAgo(conv.updated_at) : ''}</div>`;
      el.addEventListener('click', () => openConversation(conv));
      list.appendChild(el);
    });
  }

  /* ---- Open a conversation ---- */
  async function openConversation(conv) {
    activeConvo = conv;
    empty.style.display = 'none';
    chatHeader.style.display = 'flex';
    msgMessages.style.display = 'flex';
    msgInputWrap.style.display = 'flex';

    const isFreelancer = user.role === 'freelancer';
    const otherName = isFreelancer ? (conv.client_name || 'Client') : (conv.freelancer_name || 'Freelancer');
    document.getElementById('chatAvatar').textContent = (otherName[0] || '?').toUpperCase();
    document.getElementById('chatName').textContent = otherName;
    document.getElementById('chatRole').textContent = isFreelancer ? 'Client' : 'Freelancer';

    renderConversationList();
    await loadMessages(conv.id);
  }

  /* ---- Load messages ---- */
  async function loadMessages(convoId) {
    msgMessages.innerHTML = '';
    try {
      const c = window.SB;
      if (!c) return;
      const { data: msgs } = await c.from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (msgs) {
        msgs.forEach(renderMessage);
        msgMessages.scrollTop = msgMessages.scrollHeight;
      }
    } catch (e) { console.warn('[NezWorks] loadMessages:', e?.message || e); }
  }

  function renderMessage(msg) {
    const myAuthId = user.auth_user_id;
    const isMine = msg.sender_id === myAuthId || msg.sender_id === myRowId;
    const isSystem = msg.sender_role === 'system';
    if (msg.type === 'invoice') {
      const inv = msg.invoice_data || {};
      const items = Array.isArray(inv.items) ? inv.items : [];
      const el = document.createElement('div');
      el.className = 'msg-invoice-bubble ' + (isMine ? 'sent' : 'received');
      el.innerHTML = `
        <div class="msg-invoice-header">
          <div class="msg-invoice-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
          <div class="msg-invoice-title">Invoice</div>
        </div>
        <div class="msg-invoice-items">${items.map(i => `${esc(i.name || '')} × ${i.qty || 1} — ฿${(i.price || 0).toLocaleString()}`).join('<br>')}</div>
        <div class="msg-invoice-total">Total: ฿${(inv.total || 0).toLocaleString()}</div>
        <div class="msg-invoice-status pending">Pending</div>
        <div class="msg-bubble-time">${timeAgo(msg.created_at)}</div>`;
      msgMessages.appendChild(el);
    } else if (isSystem) {
      const el = document.createElement('div');
      el.className = 'msg-bubble received';
      el.style.background = 'linear-gradient(135deg, rgba(139,124,246,.12), rgba(92,139,255,.08))';
      el.style.border = '1px solid rgba(139,124,246,.2)';
      el.innerHTML = `${esc(msg.content || '').replace(/\n/g, '<br>')}<div class="msg-bubble-time">${timeAgo(msg.created_at)}</div>`;
      msgMessages.appendChild(el);
    } else {
      const el = document.createElement('div');
      el.className = 'msg-bubble ' + (isMine ? 'sent' : 'received');
      el.innerHTML = `${esc(msg.content || '')}<div class="msg-bubble-time">${timeAgo(msg.created_at)}</div>`;
      msgMessages.appendChild(el);
    }
  }

  /* ---- Send text message ---- */
  async function sendMessage(content) {
    if (!content.trim() || !activeConvo) return;
    const msg = {
      conversation_id: activeConvo.id,
      sender_id: user.auth_user_id || myRowId,
      sender_role: user.role,
      type: 'text',
      content: content.trim(),
    };
    renderMessage({ ...msg, created_at: new Date().toISOString() });
    msgMessages.scrollTop = msgMessages.scrollHeight;
    msgInput.value = '';
    sendBtn.disabled = true;

    try {
      const c = window.SB;
      if (!c) return;
      await c.from('messages').insert([msg]);
      await c.from('conversations').update({
        last_message: content.trim(),
        updated_at: new Date().toISOString(),
      }).eq('id', activeConvo.id);
    } catch (e) { console.warn('[NezWorks] sendMessage:', e?.message || e); }
  }

  sendBtn.addEventListener('click', () => sendMessage(msgInput.value));
  msgInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(msgInput.value); }
  });
  msgInput.addEventListener('input', () => { sendBtn.disabled = !msgInput.value.trim(); });

  /* ---- Invoice modal ---- */
  function addInvoiceRow(name = '', qty = 1, price = 0) {
    const row = document.createElement('div');
    row.className = 'invoice-row';
    row.innerHTML = `
      <input type="text" placeholder="Item name" class="inv-name" value="${esc(name)}">
      <input type="number" class="inv-qty invoice-qty" placeholder="Qty" value="${qty}" min="1">
      <input type="number" class="inv-price invoice-price" placeholder="Price" value="${price || ''}" min="0">
      <button class="msg-plus-btn" style="width:28px;height:28px;border:none;color:var(--ink-3)" data-cursor="hover" title="Remove">✕</button>`;
    row.querySelector('button').addEventListener('click', () => { row.remove(); updateInvoiceTotal(); });
    row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updateInvoiceTotal));
    invoiceRows.appendChild(row);
    updateInvoiceTotal();
  }

  function updateInvoiceTotal() {
    let total = 0;
    invoiceRows.querySelectorAll('.invoice-row').forEach(row => {
      const qty = parseInt(row.querySelector('.inv-qty')?.value || '0', 10);
      const price = parseFloat(row.querySelector('.inv-price')?.value || '0');
      total += qty * price;
    });
    invoiceTotal.textContent = '฿' + total.toLocaleString();
  }

  addRowBtn.addEventListener('click', () => addInvoiceRow());
  plusBtn.addEventListener('click', () => {
    invoiceRows.innerHTML = '';
    addInvoiceRow();
    overlay.classList.add('open');
  });
  cancelInvoice.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  sendInvoice.addEventListener('click', async () => {
    const items = [];
    let total = 0;
    invoiceRows.querySelectorAll('.invoice-row').forEach(row => {
      const name = row.querySelector('.inv-name')?.value.trim();
      const qty = parseInt(row.querySelector('.inv-qty')?.value || '0', 10);
      const price = parseFloat(row.querySelector('.inv-price')?.value || '0');
      if (name && qty > 0 && price > 0) {
        items.push({ name, qty, price });
        total += qty * price;
      }
    });
    if (!items.length || !activeConvo) return;

    const invoiceData = { items, total, status: 'pending' };
    const msg = {
      conversation_id: activeConvo.id,
      sender_id: user.auth_user_id || myRowId,
      sender_role: user.role,
      type: 'invoice',
      content: `Invoice — ฿${total.toLocaleString()}`,
      invoice_data: invoiceData,
    };

    renderMessage({ ...msg, created_at: new Date().toISOString() });
    msgMessages.scrollTop = msgMessages.scrollHeight;
    overlay.classList.remove('open');

    try {
      const c = window.SB;
      if (!c) return;
      await c.from('messages').insert([msg]);
      await c.from('conversations').update({
        last_message: `Invoice — ฿${total.toLocaleString()}`,
        updated_at: new Date().toISOString(),
      }).eq('id', activeConvo.id);
    } catch (e) { console.warn('[NezWorks] sendInvoice:', e?.message || e); }
  });

  /* ---- Real-time subscription ---- */
  function subscribeToMessages() {
    try {
      const c = window.SB;
      if (!c) return;
      c.channel('messages-room')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new;
          if (activeConvo && msg.conversation_id === activeConvo.id && msg.sender_id !== (user.auth_user_id || myRowId)) {
            renderMessage(msg);
            msgMessages.scrollTop = msgMessages.scrollHeight;
          }
        })
        .subscribe();
    } catch (e) {}
  }

  /* ---- Init ---- */
  loadConversations();
  subscribeToMessages();
})();
