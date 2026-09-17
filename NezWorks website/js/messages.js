/* ============ MESSAGES PAGE — chat + invoice ============ */
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
  const empty = document.getElementById('msgEmpty');
  const list = document.getElementById('msgList');
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
  let myRowId = null;

  if (!user) {
    empty.innerHTML = 'Please log in.<br><br><a href="register-client.html" style="color:var(--accent-2)">Register as Client</a> or <a href="register-freelancer.html" style="color:var(--accent-2)">Register as Freelancer</a>';
    return;
  }

  console.log('[Chat] User loaded:', user.role, user.displayName);

  /* ---- Find my row ID ---- */
  async function findMyRowId() {
    const c = window.SB;
    if (!c) { console.log('[Chat] No Supabase'); return null; }
    const table = user.role === 'freelancer' ? 'freelancers' : 'clients';
    const email = user.email;
    const authId = user.auth_user_id;
    const sessionRowId = sessionStorage.getItem(user.role === 'freelancer' ? 'nw-freelancer-id' : 'nw-client-id');

    console.log('[Chat] Finding row:', { email, authId, sessionRowId });

    /* try 1: by auth_user_id */
    if (authId) {
      const { data, error } = await c.from(table).select('id').eq('auth_user_id', authId).single();
      console.log('[Chat] Try auth_user_id:', data, error);
      if (data) return data.id;
    }
    /* try 2: by email */
    if (email) {
      const { data, error } = await c.from(table).select('id').eq('email', email).single();
      console.log('[Chat] Try email:', data, error);
      if (data) return data.id;
    }
    /* try 3: by sessionStorage row ID */
    if (sessionRowId) {
      const { data, error } = await c.from(table).select('id').eq('id', sessionRowId).single();
      console.log('[Chat] Try sessionRowId:', data, error);
      if (data) return data.id;
    }
    /* try 4: just get the latest row for this user */
    const { data: latest } = await c.from(table).select('id').order('created_at', { ascending: false }).limit(1).single();
    console.log('[Chat] Try latest:', latest);
    if (latest) return latest.id;

    return null;
  }

  /* ---- Load conversations ---- */
  async function loadConversations() {
    const c = window.SB;
    if (!c) { empty.textContent = 'Supabase not connected'; return; }

    myRowId = await findMyRowId();
    console.log('[Chat] myRowId:', myRowId);

    if (!myRowId) {
      empty.innerHTML = 'Could not find your account.<br><br><button class="btn btn-primary btn-sm" onclick="location.reload()">Retry</button>';
      return;
    }

    const { data: convos, error } = await c.from('conversations')
      .select('*')
      .or(`client_id.eq.${myRowId},freelancer_id.eq.${myRowId}`)
      .order('updated_at', { ascending: false });

    console.log('[Chat] Conversations:', convos, error);

    if (error) {
      empty.innerHTML = `Error: ${error.message}<br><br><small>Make sure you ran the SQL migration</small>`;
      return;
    }

    conversations = convos || [];
    renderConversationList();

    if (conversations.length === 0) {
      empty.innerHTML = `
        <div style="text-align:center">
          <p style="margin-bottom:16px;color:var(--ink-3)">No conversations yet</p>
          <button class="btn btn-primary btn-sm" id="createWelcomeBtn" data-cursor="hover">
            Start Welcome Chat <span class="btn-arrow">→</span>
          </button>
        </div>`;
      document.getElementById('createWelcomeBtn')?.addEventListener('click', createWelcomeChat);
    }
  }

  /* ---- Create welcome chat ---- */
  async function createWelcomeChat() {
    const c = window.SB;
    if (!c || !myRowId) return;

    console.log('[Chat] Creating welcome chat for:', myRowId);

    /* get welcome message */
    let welcomeText = 'สวัสดีค่ะ ขอบคุณที่มาใช้บริการ NezWorks 🎉\n\nเราพร้อมช่วยเหลือคุณทุกขั้นตอน หากมีคำถามอะไร สามารถพิมพ์ถามในแชทนี้ได้เลยนะคะ\n\n- ทีม NezWorks';
    const configKey = user.role === 'freelancer' ? 'welcome_freelancer' : 'welcome_client';
    try {
      const { data: cfg } = await c.from('system_config').select('value').eq('key', configKey).single();
      if (cfg?.value?.message) welcomeText = cfg.value.message;
    } catch (e) { console.log('[Chat] No system_config, using default'); }

    /* create conversation */
    const convoData = user.role === 'freelancer'
      ? { client_id: null, freelancer_id: myRowId, client_name: 'NezWorks', freelancer_name: user.displayName || user.name }
      : { client_id: myRowId, freelancer_id: null, client_name: user.displayName || user.name, freelancer_name: 'NezWorks' };

    const { data: convo, error } = await c.from('conversations').insert([{
      ...convoData,
      last_message: welcomeText.substring(0, 50) + '...',
    }]).select().single();

    console.log('[Chat] Conversation created:', convo, error);
    if (error) { alert('Error: ' + error.message); return; }

    /* send welcome message */
    if (convo?.id) {
      const { error: msgErr } = await c.from('messages').insert([{
        conversation_id: convo.id,
        sender_id: 'system',
        sender_role: 'system',
        type: 'text',
        content: welcomeText,
      }]);
      console.log('[Chat] Welcome message sent:', msgErr);
    }

    await loadConversations();
    if (convo) openConversation(convo);
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

  async function loadMessages(convoId) {
    msgMessages.innerHTML = '';
    const c = window.SB;
    if (!c) return;
    const { data: msgs } = await c.from('messages')
      .select('*')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true });
    if (msgs) { msgs.forEach(renderMessage); msgMessages.scrollTop = msgMessages.scrollHeight; }
  }

  function renderMessage(msg) {
    const myId = user.auth_user_id || myRowId;
    const isMine = msg.sender_id === myId;
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
        <div class="msg-invoice-items">${items.map(i => `${esc(i.name||'')} × ${i.qty||1} — ฿${(i.price||0).toLocaleString()}`).join('<br>')}</div>
        <div class="msg-invoice-total">Total: ฿${(inv.total||0).toLocaleString()}</div>
        <div class="msg-invoice-status pending">Pending</div>
        <div class="msg-bubble-time">${timeAgo(msg.created_at)}</div>`;
      msgMessages.appendChild(el);
    } else if (isSystem) {
      const el = document.createElement('div');
      el.className = 'msg-bubble received';
      el.style.background = 'linear-gradient(135deg, rgba(139,124,246,.12), rgba(92,139,255,.08))';
      el.style.border = '1px solid rgba(139,124,246,.2)';
      el.innerHTML = `${esc(msg.content||'').replace(/\n/g,'<br>')}<div class="msg-bubble-time">${timeAgo(msg.created_at)}</div>`;
      msgMessages.appendChild(el);
    } else {
      const el = document.createElement('div');
      el.className = 'msg-bubble ' + (isMine ? 'sent' : 'received');
      el.innerHTML = `${esc(msg.content||'')}<div class="msg-bubble-time">${timeAgo(msg.created_at)}</div>`;
      msgMessages.appendChild(el);
    }
  }

  async function sendMessage(content) {
    if (!content.trim() || !activeConvo) return;
    const msg = { conversation_id: activeConvo.id, sender_id: user.auth_user_id || myRowId, sender_role: user.role, type: 'text', content: content.trim() };
    renderMessage({ ...msg, created_at: new Date().toISOString() });
    msgMessages.scrollTop = msgMessages.scrollHeight;
    msgInput.value = '';
    sendBtn.disabled = true;
    const c = window.SB;
    if (!c) return;
    await c.from('messages').insert([msg]);
    await c.from('conversations').update({ last_message: content.trim(), updated_at: new Date().toISOString() }).eq('id', activeConvo.id);
  }

  sendBtn.addEventListener('click', () => sendMessage(msgInput.value));
  msgInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(msgInput.value); } });
  msgInput.addEventListener('input', () => { sendBtn.disabled = !msgInput.value.trim(); });

  function addInvoiceRow(name='', qty=1, price=0) {
    const row = document.createElement('div');
    row.className = 'invoice-row';
    row.innerHTML = `<input type="text" placeholder="Item name" class="inv-name" value="${esc(name)}"><input type="number" class="inv-qty invoice-qty" placeholder="Qty" value="${qty}" min="1"><input type="number" class="inv-price invoice-price" placeholder="Price" value="${price||''}" min="0"><button class="msg-plus-btn" style="width:28px;height:28px;border:none;color:var(--ink-3)" title="Remove">✕</button>`;
    row.querySelector('button').addEventListener('click', () => { row.remove(); updateInvoiceTotal(); });
    row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updateInvoiceTotal));
    invoiceRows.appendChild(row);
    updateInvoiceTotal();
  }

  function updateInvoiceTotal() {
    let total = 0;
    invoiceRows.querySelectorAll('.invoice-row').forEach(row => {
      total += parseInt(row.querySelector('.inv-qty')?.value||'0',10) * parseFloat(row.querySelector('.inv-price')?.value||'0');
    });
    invoiceTotal.textContent = '฿' + total.toLocaleString();
  }

  addRowBtn.addEventListener('click', () => addInvoiceRow());
  plusBtn.addEventListener('click', () => { invoiceRows.innerHTML = ''; addInvoiceRow(); overlay.classList.add('open'); });
  cancelInvoice.addEventListener('click', () => overlay.classList.remove('open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });

  sendInvoice.addEventListener('click', async () => {
    const items = []; let total = 0;
    invoiceRows.querySelectorAll('.invoice-row').forEach(row => {
      const name = row.querySelector('.inv-name')?.value.trim();
      const qty = parseInt(row.querySelector('.inv-qty')?.value||'0',10);
      const price = parseFloat(row.querySelector('.inv-price')?.value||'0');
      if (name && qty > 0 && price > 0) { items.push({name,qty,price}); total += qty*price; }
    });
    if (!items.length || !activeConvo) return;
    const msg = { conversation_id: activeConvo.id, sender_id: user.auth_user_id||myRowId, sender_role: user.role, type: 'invoice', content: `Invoice — ฿${total.toLocaleString()}`, invoice_data: {items,total,status:'pending'} };
    renderMessage({...msg, created_at: new Date().toISOString()});
    msgMessages.scrollTop = msgMessages.scrollHeight;
    overlay.classList.remove('open');
    const c = window.SB;
    if (!c) return;
    await c.from('messages').insert([msg]);
    await c.from('conversations').update({ last_message: `Invoice — ฿${total.toLocaleString()}`, updated_at: new Date().toISOString() }).eq('id', activeConvo.id);
  });

  /* ---- Real-time ---- */
  try {
    const c = window.SB;
    if (c) {
      c.channel('messages-room')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new;
          if (activeConvo && msg.conversation_id === activeConvo.id && msg.sender_id !== (user.auth_user_id||myRowId)) {
            renderMessage(msg);
            msgMessages.scrollTop = msgMessages.scrollHeight;
          }
        })
        .subscribe();
    }
  } catch(e) {}

  loadConversations();
})();
