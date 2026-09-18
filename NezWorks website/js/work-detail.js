/* ============ WORK DETAIL — view work + chat with creator ============ */
(() => {
  const loading = document.getElementById('wdLoading');
  const notFound = document.getElementById('wdNotFound');
  const content = document.getElementById('wdContent');
  if (!loading) return;

  const CLIENT_KEY = 'nw-client';
  const FREE_KEY = 'nw-freelancer';
  const fmt = (n) => '฿' + (+n).toLocaleString('th-TH');

  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
    return Math.floor(diff / 86400000) + 'd';
  }

  function loadUser() {
    try {
      const f = JSON.parse(sessionStorage.getItem(FREE_KEY) || 'null');
      if (f && f.name) return { ...f, role: 'freelancer' };
      const c = JSON.parse(sessionStorage.getItem(CLIENT_KEY) || 'null');
      if (c && c.name) return { ...c, role: 'client' };
    } catch (e) {}
    return null;
  }

  /* Get URL param */
  const params = new URLSearchParams(window.location.search);
  const workId = params.get('id');
  if (!workId) { loading.style.display = 'none'; notFound.style.display = ''; return; }

  let work = null;
  let freelancer = null;
  const user = loadUser();
  let myRowId = null;
  let activeConvo = null;

  async function init() {
    const c = window.SB;
    if (!c) { loading.style.display = 'none'; notFound.style.display = ''; return; }

    try {
      /* Fetch work */
      const { data: w, error: wErr } = await c.from('works').select('*').eq('id', workId).single();
      if (wErr || !w) { loading.style.display = 'none'; notFound.style.display = ''; return; }
      work = w;

      /* Fetch freelancer profile */
      if (w.freelancer_id) {
        const { data: fl } = await c.from('freelancers').select('*').eq('id', w.freelancer_id).single();
        freelancer = fl;
      }

      /* Increment view count */
      try {
        await c.from('works').update({ views: (work.views || 0) + 1 }).eq('id', workId);
        work.views = (work.views || 0) + 1;
      } catch (e) {}

      render();
      loading.style.display = 'none';
      content.style.display = '';

      /* Setup chat */
      setupChat();
    } catch (e) {
      console.warn('[NezWorks] work-detail init:', e?.message || e);
      loading.style.display = 'none';
      notFound.style.display = '';
    }
  }

  function render() {
    if (!work) return;

    /* Breadcrumb */
    const catName = work.cat || 'Work';
    document.getElementById('wdBreadcrumb').innerHTML =
      `<a href="index.html">HOME</a><span class="sep">·</span><a href="services.html">SERVICES</a><span class="sep">·</span><span>${esc(catName)}</span>`;

    /* Gallery */
    const mainImg = document.getElementById('wdMainImg');
    const thumbs = document.getElementById('wdThumbs');
    const coverImg = work.cover_img || work.coverImg || '';
    const gallery = Array.isArray(work.gallery) ? work.gallery : [];
    const allImages = coverImg ? [coverImg, ...gallery] : [...gallery];

    if (allImages.length) {
      mainImg.src = allImages[0];
      mainImg.alt = work.title;
      thumbs.innerHTML = '';
      allImages.forEach((img, i) => {
        const t = document.createElement('img');
        t.className = 'wd-thumb' + (i === 0 ? ' active' : '');
        t.src = img;
        t.alt = `View ${i + 1}`;
        t.addEventListener('click', () => {
          mainImg.src = img;
          thumbs.querySelectorAll('.wd-thumb').forEach(x => x.classList.remove('active'));
          t.classList.add('active');
        });
        thumbs.appendChild(t);
      });
    } else {
      const catEmoji = { 'Graphic Design': '🎨', 'Logo and Branding': '✒️', 'Social Media Design': '📱', 'Video Editing': '🎬', 'Content Creation': '✍️', 'Translation': '🌐' };
      mainImg.src = '';
      mainImg.alt = work.title;
      mainImg.style.display = 'none';
      document.getElementById('wdGallery').innerHTML = `
        <div style="aspect-ratio:16/10;display:grid;place-items:center;font-size:5rem;background:linear-gradient(135deg,#2a2f52,#141833)">
          ${catEmoji[work.cat] || '✨'}
        </div>`;
    }

    /* Category */
    document.getElementById('wdCat').textContent = work.cat || 'Work';

    /* Title */
    document.getElementById('wdTitle').textContent = work.title;

    /* Creator */
    const creatorName = freelancer?.display_name || freelancer?.name || work.freelancer_name || 'Creator';
    document.getElementById('wdAvatar').textContent = (creatorName[0] || 'C').toUpperCase();
    document.getElementById('wdCreatorName').textContent = creatorName;

    /* Meta badges */
    const metaEl = document.getElementById('wdMeta');
    metaEl.innerHTML = `
      <span class="wd-badge wd-badge-price">${fmt(work.price)}</span>
      <span class="wd-badge">⏱ ${esc(work.deliver || '3 days')}</span>
      <span class="wd-badge wd-badge-rev">✏️ ${work.revisions ?? 2} revision${(work.revisions ?? 2) === '1' ? '' : 's'}</span>
      <span class="wd-badge">👁 ${work.views || 0} views</span>`;

    /* Tags */
    const tags = Array.isArray(work.tags) ? work.tags : [];
    const tagsEl = document.getElementById('wdTags');
    if (tags.length) {
      tagsEl.innerHTML = tags.map(t => `<span class="wd-tag-pill">${esc(t)}</span>`).join('');
    } else {
      tagsEl.innerHTML = '';
    }

    /* Description */
    document.getElementById('wdDesc').textContent = work.description || work.desc || '';

    /* Chat header */
    document.getElementById('wdChatHeader').textContent = `Chat with ${creatorName}`;
  }

  /* ---------- CHAT ---------- */
  function setupChat() {
    const chatBtn = document.getElementById('wdChatBtn');
    const chatEl = document.getElementById('wdChat');
    const chatLogin = document.getElementById('wdChatLogin');
    const chatInputRow = document.getElementById('wdChatInputRow');
    const chatInput = document.getElementById('wdChatInput');
    const chatSend = document.getElementById('wdChatSend');
    const chatMessages = document.getElementById('wdChatMessages');

    if (!user) {
      /* Not logged in — show login prompt */
      chatBtn.addEventListener('click', () => { chatEl.style.display = 'block'; });
      chatLogin.style.display = '';
      chatInputRow.style.display = 'none';
      return;
    }

    chatBtn.addEventListener('click', async () => {
      chatEl.style.display = 'block';
      chatLogin.style.display = 'none';
      chatInputRow.style.display = 'flex';
      if (!activeConvo) await findOrCreateConversation();
    });

    chatSend.addEventListener('click', () => sendChatMessage(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(chatInput.value); }
    });
    chatInput.addEventListener('input', () => { chatSend.disabled = !chatInput.value.trim(); });
  }

  async function findMyRowId() {
    try {
      const c = window.SB;
      if (!c) return null;
      const table = user.role === 'freelancer' ? 'freelancers' : 'clients';
      if (user.auth_user_id) {
        const { data } = await c.from(table).select('id').eq('auth_user_id', user.auth_user_id).single();
        if (data) return data.id;
      }
      if (user.email) {
        const { data } = await c.from(table).select('id').eq('email', user.email).single();
        if (data) return data.id;
      }
      const fallbackId = sessionStorage.getItem(user.role === 'freelancer' ? 'nw-freelancer-id' : 'nw-client-id');
      if (fallbackId) {
        const { data } = await c.from(table).select('id').eq('id', fallbackId).single();
        if (data) return data.id;
      }
    } catch (e) {}
    return null;
  }

  async function findOrCreateConversation() {
    const c = window.SB;
    if (!c || !work?.freelancer_id) return;
    myRowId = await findMyRowId();
    if (!myRowId) return;

    const freelancerId = work.freelancer_id;

    /* Check for existing conversation */
    const { data: existing } = await c.from('conversations')
      .select('*')
      .eq('client_id', user.role === 'client' ? myRowId : null)
      .eq('freelancer_id', user.role === 'freelancer' ? myRowId : freelancerId)
      .limit(1);

    if (existing && existing.length) {
      activeConvo = existing[0];
      await loadChatMessages();
      subscribeToChat();
      return;
    }

    /* Create new conversation */
    const clientName = user.role === 'client' ? (user.displayName || user.name) : (freelancer?.display_name || freelancer?.name || 'Freelancer');
    const flName = user.role === 'freelancer' ? (user.displayName || user.name) : (freelancer?.display_name || freelancer?.name || 'Freelancer');

    const convoData = user.role === 'client'
      ? { client_id: myRowId, freelancer_id: freelancerId, client_name: user.displayName || user.name, freelancer_name: flName }
      : { client_id: null, freelancer_id: myRowId, client_name: clientName, freelancer_name: user.displayName || user.name };

    const { data: convo, error } = await c.from('conversations').insert([{
      ...convoData,
      last_message: 'Chat started',
    }]).select().single();

    if (error) { console.warn('[NezWorks] create convo:', error.message); return; }
    activeConvo = convo;

    /* Send greeting */
    const greeting = `Hi! I'm interested in "${work.title}". Can we discuss the details?`;
    await c.from('messages').insert([{
      conversation_id: convo.id,
      sender_id: user.auth_user_id || myRowId,
      sender_role: user.role,
      type: 'text',
      content: greeting,
    }]);
    await c.from('conversations').update({ last_message: greeting, updated_at: new Date().toISOString() }).eq('id', convo.id);

    await loadChatMessages();
    subscribeToChat();
  }

  async function loadChatMessages() {
    if (!activeConvo) return;
    const c = window.SB;
    if (!c) return;
    const chatMessages = document.getElementById('wdChatMessages');
    chatMessages.innerHTML = '';
    const { data: msgs } = await c.from('messages')
      .select('*')
      .eq('conversation_id', activeConvo.id)
      .order('created_at', { ascending: true });
    if (msgs) msgs.forEach(renderChatBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderChatBubble(msg) {
    const chatMessages = document.getElementById('wdChatMessages');
    const isMine = msg.sender_id === (user?.auth_user_id || myRowId);
    const isSystem = msg.sender_role === 'system';
    const el = document.createElement('div');
    el.className = 'wd-chat-bubble ' + (isSystem ? 'system' : isMine ? 'sent' : 'received');
    el.innerHTML = `${esc(msg.content || '').replace(/\n/g, '<br>')}<div class="wd-chat-time">${timeAgo(msg.created_at)}</div>`;
    chatMessages.appendChild(el);
  }

  async function sendChatMessage(content) {
    if (!content.trim() || !activeConvo) return;
    const c = window.SB;
    if (!c) return;
    const chatInput = document.getElementById('wdChatInput');
    const chatSend = document.getElementById('wdChatSend');

    const msg = {
      conversation_id: activeConvo.id,
      sender_id: user.auth_user_id || myRowId,
      sender_role: user.role,
      type: 'text',
      content: content.trim(),
    };

    renderChatBubble({ ...msg, created_at: new Date().toISOString() });
    const chatMessages = document.getElementById('wdChatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.value = '';
    chatSend.disabled = true;

    try {
      await c.from('messages').insert([msg]);
      await c.from('conversations').update({
        last_message: content.trim().substring(0, 50),
        updated_at: new Date().toISOString(),
      }).eq('id', activeConvo.id);
    } catch (e) { console.warn('[NezWorks] sendChatMessage:', e?.message || e); }
  }

  function subscribeToChat() {
    try {
      const c = window.SB;
      if (!c) return;
      c.channel('wd-chat')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new;
          if (activeConvo && msg.conversation_id === activeConvo.id && msg.sender_id !== (user?.auth_user_id || myRowId)) {
            renderChatBubble(msg);
            const chatMessages = document.getElementById('wdChatMessages');
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        })
        .subscribe();
    } catch (e) {}
  }

  init();
})();
