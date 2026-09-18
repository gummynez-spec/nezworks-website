/* ============ i18N — Language dropdown (TH / EN) ============ */
(() => {
  const LS_KEY = 'nw-lang';

  const T = {
    /* ===== NAV ===== */
    'nav-home':       { en: 'Home',              th: 'หน้าแรก' },
    'nav-services':   { en: 'Services',          th: 'บริการ' },
    'nav-how':        { en: 'Process',           th: 'ขั้นตอน' },
    'nav-relax':      { en: 'Relax',             th: 'พักผ่อน' },
    'nav-contact':    { en: 'Contact',           th: 'ติดต่อ' },
    'nav-faq':        { en: 'FAQ',               th: 'คำถาม' },
    'nav-login':      { en: 'Log in',            th: 'เข้าสู่ระบบ' },
    'nav-project':    { en: 'Create',             th: 'สร้าง' },
    'nav-messages':   { en: 'Messages',          th: 'ข้อความ' },

    /* ===== HOME — HERO ===== */
    'hero-eyebrow':   { en: 'THE CREATIVE ORBITAL SYSTEM', th: 'ระบบออร์บิทัลสร้างสรรค์' },
    'hero-title-1':   { en: 'TURN YOUR IDEAS',   th: 'เปลี่ยนไอเดีย' },
    'hero-title-2':   { en: 'INTO DIGITAL',      th: 'ให้เป็นดิจิทัล' },
    'hero-title-3':   { en: 'REALITY.',          th: 'ได้จริง' },
    'hero-sub':       { en: 'NezWorks brings businesses and creative talent together to turn ideas into work that matters.', th: 'NezWorks เชื่อมธุรกิจและนักสร้างสรรค์เข้าด้วยกัน เพื่อเปลี่ยนไอเดียให้กลายเป็นผลงานที่มีคุณค่า' },
    'hero-im-a':      { en: "I'M A...",           th: 'ฉันเป็น...' },
    'hero-client':    { en: 'Client',            th: 'ลูกค้า' },
    'hero-freelancer':{ en: 'Freelancer',        th: 'ฟรีแลนซ์' },

    /* ===== HOME — STATS ===== */
    'stat-1':         { en: 'Creative talents in orbit', th: 'นักสร้างสรรค์ในระบบ' },
    'stat-2':         { en: 'Projects delivered', th: 'งานที่ส่งมอบแล้ว' },
    'stat-3':         { en: 'Countries served',  th: 'ประเทศที่ให้บริการ' },
    'stat-4':         { en: 'Client retention',  th: 'ลูกค้ากลับมาใช้ซ้ำ' },

    /* ===== HOME — WHAT IS ===== */
    'about-kicker':   { en: 'WHAT IS NEZWORKS',  th: 'NezWorks คืออะไร' },
    'about-title':    { en: 'ONE SYSTEM.<br>MANY CREATIVES.', th: 'ระบบเดียว<br>นักสร้างสรรค์มากมาย' },
    'about-lead':     { en: 'A single orbital platform that connects businesses with elite creative talent across branding, video, content, UI/UX, graphic design, translation and more — zero friction, all in one place.', th: 'แพลตฟอร์มเดียวที่เชื่อมธุรกิจกับนักสร้างสรรค์ชั้นนำ ทั้งงานแบรนด์ดิ้ง วิดีโอ เนื้อหา UI/UX กราฟิก แปลภาษา และอื่นๆ — ไม่มีอะไรติดขัด ครบทุกอย่างในที่เดียว' },

    /* ===== HOME — SERVICES ===== */
    'create-kicker':  { en: 'WHAT WE CREATE',    th: 'บริการของเรา' },
    'create-title':   { en: 'Services built for<br>ambitious brands.', th: 'บริการที่ออกแบบมา<br>เพื่อแบรนด์ที่มีความมุ่งมั่น' },
    'create-explore': { en: 'EXPLORE ALL SERVICES', th: 'ดูบริการทั้งหมด' },

    /* ===== HOME — HOW IT WORKS ===== */
    'hiw-kicker':     { en: 'HOW IT WORKS',      th: 'วิธีทำงาน' },
    'hiw-title':      { en: 'Four Steps from idea to reality.', th: 'สี่ขั้นตอน จากไอเดียสู่ความจริง' },
    'hiw-1-title':    { en: 'Tell us what you need', th: 'บอกเราว่าต้องการอะไร' },
    'hiw-1-desc':     { en: 'Share a brief, pick a service, and set the scope — our system matches you with the right talent instantly.', th: 'ส่งรายละเอียด เลือกบริการ และกำหนดขอบเขต — ระบบของเราจับคู่คุณกับนักสร้างสรรค์ที่合适ที่สุดให้ทันที' },
    'hiw-2-title':    { en: 'We find the right creative', th: 'เราหาคนที่ใช่ให้' },
    'hiw-2-desc':     { en: 'Our orbital platform pairs you with vetted creatives who specialize in exactly what you need.', th: 'แพลตฟอร์มของเราเชื่อมคุณกับนักสร้างสรรค์ที่ผ่านการตรวจสอบและเชี่ยวชาญในสิ่งที่คุณต้องการ' },
    'hiw-3-title':    { en: 'Create & collaborate', th: 'สร้างและร่วมงาน' },
    'hiw-3-desc':     { en: 'Collaborate live, review drafts, give feedback — everything happens inside a single shared workspace.', th: 'ทำงานร่วมกันแบบเรียลไทม์ ดูงาน ให้ feedback — ทุกอย่างอยู่ในพื้นที่ทำงานเดียวกัน' },
    'hiw-4-title':    { en: 'Deliver',            th: 'ส่งมอบ' },
    'hiw-4-desc':     { en: 'Final assets delivered on time, ready for production — your idea has officially entered orbit.', th: 'ไฟล์งานส่งมอบตรงเวลา พร้อมใช้งาน — ไอเดียของคุณเข้าสู่ระบบเรียบร้อยแล้ว' },

    /* ===== HOME — CTA ===== */
    'cta-title-home': { en: 'HAVE AN IDEA?<br>LET\'S MAKE IT REAL.', th: 'มีไอเดีย?<br>มาทำให้เป็นจริง' },
    'cta-btn-home':   { en: 'START NEW PROJECT', th: 'เริ่มโปรเจกต์ใหม่' },

    /* ===== FOOTER ===== */
    'footer-desc':    { en: 'The creative orbital system.<br>Connecting businesses with the talent they need.', th: 'ระบบออร์บิทัลสร้างสรรค์<br>เชื่อมธุรกิจกับนักสร้างสรรค์ที่พวกเขาต้องการ' },
    'footer-system':  { en: 'SYSTEM',            th: 'ระบบ' },
    'footer-explore': { en: 'EXPLORE',           th: 'สำรวจอื่นๆ' },
    'footer-connect': { en: 'CONNECT',           th: 'เชื่อมต่อ' },
    'footer-start':   { en: 'Start a project',   th: 'เริ่มโปรเจกต์' },
    'footer-copy':    { en: '\u00A9 2026 NezWorks. All rights reserved.', th: '\u00A9 2026 NezWorks สงวนลิขสิทธิ์' },
    'footer-tagline': { en: 'Made with precision, delivered in orbit.', th: 'สร้างด้วยความแม่นยำ ส่งมอบในออร์บิทัล' },

    /* ===== SERVICES ===== */
    'svc-search':     { en: 'Search\u2026',       th: 'ค้นหา...' },
    'svc-title':      { en: 'SERVICES',          th: 'บริการ' },
    'svc-create':     { en: '\uFF0B Create new project', th: '\uFF0B สร้างโปรเจกต์ใหม่' },
    'svc-all':        { en: 'ALL',               th: 'ทั้งหมด' },
    'svc-logo':       { en: 'LOGO',              th: 'โลโก้' },
    'svc-banner':     { en: 'BANNER',            th: 'แบนเนอร์' },
    'svc-poster':     { en: 'POSTER',            th: 'โปสเตอร์' },
    'svc-video':      { en: 'VIDEO',             th: 'วิดีโอ' },
    'svc-graphic':    { en: 'GRAPHIC DESIGN',    th: 'กราฟิกดีไซน์' },
    'svc-content':    { en: 'CONTENT',           th: 'เนื้อหา' },
    'svc-translator': { en: 'TRANSLATOR',        th: 'แปลภาษา' },
    'svc-all-desc':   { en: 'Explore the creative services available through NezWorks.', th: 'ดูบริการสร้างสรรค์ทั้งหมดที่มีใน NezWorks' },
    'svc-logo-desc':  { en: 'Logo design and visual identity for brands that want to stand out.', th: 'ออกแบบโลโก้และตัวตนแบรนด์ สำหรับแบรนด์ที่ต้องการความโดดเด่น' },
    'svc-banner-desc':{ en: 'Digital banners and promotional visuals for campaigns and platforms.', th: 'แบนเนอร์ดิจิทัลและสื่อส่งเสริมการขาย สำหรับแคมเปญและแพลตฟอร์มต่างๆ' },
    'svc-poster-desc':{ en: 'Posters and promotional artwork designed to capture attention.', th: 'โปสเตอร์และงานกราฟิกส่งเสริมการขาย ออกแบบมาเพื่อดึงดูดความสนใจ' },
    'svc-video-desc': { en: 'Video editing and visual storytelling for digital content.', th: 'ตัดต่อวิดีโอและเล่าเรื่องด้วยภาพ สำหรับเนื้อหาดิจิทัล' },
    'svc-graphic-desc':{ en: 'Creative graphics for brands, campaigns, social media, and digital platforms.', th: 'กราฟิกสร้างสรรค์ สำหรับแบรนด์ แคมเปญ โซเชียลมีเดีย และแพลตฟอร์มดิจิทัล' },
    'svc-content-desc':{ en: 'Strategic content creation \u2014 copy, social posts, blogs, and editorial visuals that tell your brand story.', th: 'สร้างเนื้อหาเชิงกลยุทธ์ — คัดลอก โพสต์โซเชียล บล็อก และภาพบรรณาธิการ เล่าเรื่องแบรนด์ของคุณ' },
    'svc-translator-desc':{ en: 'Professional translation across languages \u2014 documents, captions, subtitles, and localization that keeps your message clear everywhere.', th: 'แปลภาษาแบบมืออาชีพ — เอกสาร คำบรรยาย ซับไทเทิล และโลคัลไลเซชัน ให้ข้อความของคุณชัดเจนทุกที่' },

    /* ===== HOW WE WORK ===== */
    'how-breadcrumb':  { en: 'PROCESS',            th: 'ขั้นตอน' },
    'how-title':       { en: 'From first message<br><span class="accent">to final delivery.</span>', th: 'จากข้อความแรก<br><span class="accent">ถึงการส่งมอบสุดท้าย</span>' },
    'how-lead':        { en: 'One clear trajectory: contact a creator you like, agree on the work, review it at the checkout points \u2014 then pay safely by invoice. No guesswork anywhere.', th: 'เส้นทางชัดเจน: ติดต่อนักสร้างสรรค์ที่ชอบ ตกลงเรื่องงาน ตรวจสอบงานเป็นจุดๆ — แล้วจ่ายเงินผ่านใบแจ้งหนี้อย่างปลอดภัย ไม่มีอะไรต้องเดา' },
    'how-start':       { en: 'Create',             th: 'สร้าง' },
    'how-steps':       { en: 'See the steps',     th: 'ดูขั้นตอน' },
    'how-stat-1':      { en: 'Clear steps',       th: 'ขั้นตอนชัดเจน' },
    'how-stat-2':      { en: 'First reply',       th: 'ตอบกลับครั้งแรก' },
    'how-stat-3':      { en: 'Starting price',    th: 'ราคาเริ่มต้น' },
    'how-stat-4':      { en: 'Free revision round', th: 'แก้ไขฟรี 1 ครั้ง' },
    'how-trajectory':  { en: 'THE TRAJECTORY',    th: 'เส้นทาง' },
    'how-five':        { en: 'Five steps. Zero blind spots.', th: 'ห้าขั้นตอน ไม่มีจุดบอด' },
    'how-why':         { en: 'WHY IT WORKS',      th: 'ทำไมถึงเวิร์ค' },
    'how-both':        { en: 'Built for both<br><span class="accent">sides of the orbit.</span>', th: 'ออกแบบมาให้ทั้ง<br><span class="accent">สองฝั่งของออร์บิทัล</span>' },
    'how-client-tag':  { en: 'FOR CLIENTS',       th: 'สำหรับลูกค้า' },
    'how-client-title':{ en: 'Clear before you commit', th: 'ชัดเจนก่อนตัดสินใจ' },
    'how-client-desc': { en: 'Real creators, real starting prices from 500 THB, and a free revision round on every project. You approve the work before you ever pay.', th: 'นักสร้างสรรค์จริง ราคาเริ่มต้นจริงๆ ตั้งแต่ 500 บาท พร้อมแก้ไขฟรี 1 ครั้งทุกโปรเจกต์ คุณอนุมัติงานก่อนจ่ายเงิน' },
    'how-talent-tag':  { en: 'FOR TALENT',        th: 'สำหรับนักสร้างสรรค์' },
    'how-talent-title':{ en: 'Create, then get paid fairly', th: 'สร้างงาน แล้วได้รับเงินอย่างยุติธรรม' },
    'how-talent-desc': { en: 'Talent focuses on the craft. A transparent tier-based fee applies, and paid 199 THB placement can put your work on the front page so clients see it first.', th: 'นักสร้างสรรค์มุ่งเน้นงานฝีมือ ค่าธรรมเนียมตามระดับที่โปร่งใส และจ่าย 199 บาทเพื่อวางผลงานหน้าแรก ให้ลูกค้าเห็นก่อนใคร' },
    'how-everyone-tag':{ en: 'FOR EVERYONE',      th: 'สำหรับทุกคน' },
    'how-inv-title':   { en: 'Invoice from start to finish', th: 'ใบแจ้งหนี้ตั้งแต่ต้นจนจบ' },
    'how-inv-desc':    { en: 'Every payment runs through a creator-made invoice, confirmed with a payment slip, and closed as a receipt. Traceable history, total transparency.', th: 'ทุกการชำระเงินผ่านใบแจ้งหนี้จากนักสร้างสรรค์ ยืนยันด้วยสลิปชำระเงิน และปิดเป็นใบเสร็จ ประวัติตรวจสอบได้ โปร่งใสทุกขั้นตอน' },
    'how-step01':      { en: 'STEP 01 IS THE EASIEST', th: 'ขั้นตอนแรกง่ายที่สุด' },
    'how-cta-title':   { en: 'Message a creator today.', th: 'ส่งขหานักสร้างสรรค์วันนี้' },
    'how-cta-sub':     { en: 'Send your first message and get a reply within 10 hours.', th: 'ส่งข้อความครั้งแรก แล้วรอรับคำตอบภายใน 10 ชั่วโมง' },
    'how-note':        { en: 'No commitment \u00B7 First reply within 10h', th: 'ไม่ต้องผูกมัด \u00B7 ตอบกลับภายใน 10 ชม.' },

    /* ===== FAQ ===== */
    'faq-breadcrumb':  { en: 'FAQ',               th: 'คำถาม' },
    'faq-title':       { en: 'Answered before<br><span class="accent">you even ask</span>', th: 'ตอบไว้ก่อน<br><span class="accent">แม้ยังไม่ทันถาม</span>' },
    'faq-lead':        { en: "Everything most people wonder about \u2014 from starting a project and pricing to payments and delivery. Can't find your answer? Reach us through Contact.", th: 'ทุกอย่างที่คนส่วนใหญ่อยากรู้ — ตั้งแต่เริ่มโปรเจกต์ ราคา การชำระเงิน ไปจนถึงการส่งมอบ หาคำตอบไม่ได้? ติดต่อเราได้เลย' },
    'faq-contact-btn': { en: 'Still have a question? Contact us', th: 'ยังมีคำถาม? ติดต่อเรา' },
    'faq-browse':      { en: 'Browse all questions', th: 'ดูคำถามทั้งหมด' },
    'faq-cat-all':     { en: 'All',               th: 'ทั้งหมด' },
    'faq-cat-start':   { en: 'Getting started',   th: 'เริ่มต้น' },
    'faq-cat-price':   { en: 'Pricing & Payment', th: 'ราคาและการชำระเงิน' },
    'faq-cat-process': { en: 'Delivery',          th: 'การส่งมอบ' },
    'faq-cat-talent':  { en: 'For freelancers',   th: 'สำหรับฟรีแลนซ์' },
    'faq-no-result':   { en: 'No question found', th: 'ไม่พบคำถาม' },
    'faq-no-hint':     { en: 'Try a different keyword, or message us directly.', th: 'ลองค้นหาคำอื่น หรือส่งข้อความหาเราโดยตรง' },
    'faq-msg-btn':     { en: 'Message us',         th: 'ส่งข้อความ' },
    'faq-still':       { en: "Still can't find your answer?", th: 'ยังหาคำตอบไม่ได้?' },

    /* ===== CONTACT ===== */
    'contact-breadcrumb': { en: 'CONTACT',        th: 'ติดต่อ' },
    'contact-title':   { en: "Don't overthink it.<br><span class=\"accent\">Just say hello.</span>", th: 'อย่าคิดมาก<br><span class="accent\">แค่ทักมา</span>' },
    'contact-lead':    { en: 'Questions about a project, ready to talk, or want to become a freelancer \u2014 reach us through any channel. We always reply within 10 hours.', th: 'มีคำถามเกี่ยวกับโปรเจกต์ พร้อมคุย หรืออยากเป็นฟรีแลนซ์ — ติดต่อเราได้ทุกช่องทาง เราตอบกลับภายใน 10 ชั่วโมงเสมอ' },
    'contact-msg-btn': { en: 'Send a message',     th: 'ส่งข้อความ' },
    'contact-faq-btn': { en: 'Read the FAQ first', th: 'อ่านคำถามที่พบบ่อยก่อน' },
    'contact-stat-1':  { en: 'First reply',        th: 'ตอบกลับครั้งแรก' },
    'contact-stat-2':  { en: 'Ways to reach us',   th: 'ช่องทางติดต่อ' },
    'contact-stat-3':  { en: 'Hidden fees',        th: 'ค่าธรรมเนียมแอบแฝง' },
    'contact-stat-4':  { en: 'Point of contact',   th: 'จุดติดต่อเดียว' },
    'contact-pick':    { en: 'Pick whichever<br><span class="accent">suits you best.</span>', th: 'เลือกช่องทาง<br><span class="accent">ที่สะดวกที่สุด</span>' },
    'contact-email-tag':{ en: 'Email',             th: 'อีเมล' },
    'contact-email-desc':{ en: 'Best for long messages, project briefs, or anything that needs follow-up. Our go-to for general inquiries.', th: 'เหมาะสำหรับข้อความยาว รายละเอียดโปรเจกต์ หรือเรื่องที่ต้องติดตาม เป็นช่องทางหลักสำหรับคำถามทั่วไป' },
    'contact-project-tag': { en: 'Start a Project', th: 'เริ่มโปรเจกต์' },
    'contact-project-desc':{ en: 'Ready for a logo, banner, video edit or content run? Head straight to the project page and kick things off.', th: 'พร้อมทำโลโก้ แบนเนอร์ ตัดต่อวิดีโอ หรือเนื้อหา? เข้าไปที่หน้าโปรเจกต์แล้วเริ่มเลย' },
    'contact-freelancer-tag': { en: 'Freelancer',  th: 'ฟรีแลนซ์' },
    'contact-freelancer-desc':{ en: 'Want to work on NezWorks? Apply through Career \u2014 we bring you work, handle payments, and let you focus on creating.', th: 'อยากทำงานกับ NezWorks? สมัครผ่านหน้าอาชีพ — เราหางานให้ จัดการเรื่องเงิน ให้คุณมุ่งเน้นสร้างสรรค์' },
    'contact-form-note': { en: "Or fill in this form \u2014 we'll reply to your email within 10 hours.", th: 'หรือกรอกแบบฟอร์มนี้ — เราจะตอบกลับอีเมลคุณภายใน 10 ชั่วโมง' },
    'contact-name':    { en: 'Your name',          th: 'ชื่อ' },
    'contact-topic':   { en: 'Topic',              th: 'หัวข้อ' },
    'contact-topic-1': { en: 'General question',   th: 'คำถามทั่วไป' },
    'contact-topic-2': { en: 'Start a new project', th: 'เริ่มโปรเจกต์ใหม่' },
    'contact-topic-3': { en: 'Apply as a freelancer', th: 'สมัครเป็นฟรีแลนซ์' },
    'contact-topic-4': { en: 'Ongoing work / packages', th: 'งานประจำ / แพ็กเกจ' },
    'contact-topic-5': { en: 'Other',              th: 'อื่นๆ' },
    'contact-svc':     { en: 'Service (optional)', th: 'บริการ (ถ้ามี)' },
    'contact-svc-1':   { en: 'Logo / Identity',   th: 'โลโก้ / ตัวตนแบรนด์' },
    'contact-svc-2':   { en: 'Banner',            th: 'แบนเนอร์' },
    'contact-svc-3':   { en: 'Poster',            th: 'โปสเตอร์' },
    'contact-svc-4':   { en: 'Video',             th: 'วิดีโอ' },
    'contact-svc-5':   { en: 'Graphic Design',    th: 'กราฟิกดีไซน์' },
    'contact-svc-6':   { en: 'Content',           th: 'เนื้อหา' },
    'contact-svc-7':   { en: 'Translator',        th: 'แปลภาษา' },
    'contact-svc-8':   { en: 'Not sure yet',      th: 'ยังไม่แน่ใจ' },
    'contact-msg-label': { en: 'Message',          th: 'ข้อความ' },
    'contact-form-hint': { en: "We'll reply within 10 hours \u00B7 No spam, ever", th: 'ตอบกลับภายใน 10 ชั่วโมง \u00B7 ไม่spam แน่นอน' },
    'contact-send':    { en: 'Send message',       th: 'ส่งข้อความ' },
    'contact-sent':    { en: 'Message sent',       th: 'ส่งข้อความแล้ว' },
    'contact-sent-sub':{ en: "Thanks for reaching out \u2014 we'll reply to your email within 10 hours.", th: 'ขอบคุณที่ติดต่อมา — เราจะตอบกลับอีเมลคุณภายใน 10 ชั่วโมง' },
    'contact-back':    { en: '\u2190 Back to home', th: '\u2190 กลับหน้าแรก' },
    'contact-faq-eyebrow': { en: 'Want to see everything first?', th: 'อยากดูทุกอย่างก่อน?' },
    'contact-faq-title': { en: 'Start with the FAQ.', th: 'เริ่มจากคำถามที่พบบ่อย' },
    'contact-faq-sub': { en: 'All answers in one place \u2014 from pricing to delivery.', th: 'ทุกคำตอบอยู่ที่เดียว — ตั้งแต่ราคาถึงการส่งมอบ' },
    'contact-faq-go':  { en: 'Go to FAQ',          th: 'ดูคำถามที่พบบ่อย' },

    /* ===== LOGIN ===== */
    'login-title':     { en: 'Welcome back',      th: 'ยินดีต้อนรับกลับ' },
    'login-subtitle':  { en: 'Log in to your NezWorks account', th: 'เข้าสู่ระบบบัญชี NezWorks ของคุณ' },
    'login-email':     { en: 'EMAIL',             th: 'อีเมล' },
    'login-password':  { en: 'PASSWORD',          th: 'รหัสผ่าน' },
    'login-btn':       { en: 'Log in',            th: 'เข้าสู่ระบบ' },
    'login-footer':    { en: "Don't have an account?", th: 'ยังไม่มีบัญชี?' },
    'login-reg-client': { en: 'Register as Client', th: 'สมัครเป็นลูกค้า' },
    'login-reg-free':  { en: 'Freelancer',         th: 'ฟรีแลนซ์' },
    'login-or':        { en: 'or',                  th: 'หรือ' },

    /* ===== RELAX ===== */
    'relax-kicker':    { en: 'RELAX CONTROL',     th: 'ตั้งค่าพักผ่อน' },
    'relax-season':    { en: 'Season',            th: 'ฤดูกาล' },
    'relax-season-sub':{ en: 'Pick a seasonal atmosphere', th: 'เลือกบรรยากาศตามฤดูกาล' },
    'relax-fullscreen':{ en: 'Fullscreen',         th: 'เต็มจอ' },
    'relax-fs-sub':    { en: 'Expand to fill the entire screen', th: 'ขยายเต็มหน้าจอ' },
    'relax-fs-btn':    { en: 'Enter Fullscreen',   th: 'เข้าโหมดเต็มจอ' },
    'relax-brightness':{ en: 'Brightness',         th: 'ความสว่าง' },
    'relax-bright-sub':{ en: 'Drag to increase or reduce brightness', th: 'ลากเพื่อเพิ่มหรือลดความสว่าง' },
    'relax-sound':     { en: 'Sound',             th: 'เสียง' },
    'relax-sound-sub': { en: 'Choose your sound mood', th: 'เลือกอารมณ์เสียง' },
    'relax-effects':   { en: 'Effects',           th: 'เอฟเฟกต์' },
    'relax-fx-sub':    { en: 'Seasonal motion on / off', th: 'เอฟเฟกต์ตามฤดูกาล เปิด / ปิด' },
    'relax-music':     { en: 'Music',             th: 'เพลง' },
    'relax-music-sub': { en: 'Play / pause the ambient sound', th: 'เล่น / หยุดเสียงบรรยากาศ' },
    'relax-foot':      { en: "Good work doesn't have to be rushed \u2014 rest before you create again", th: 'งานดีไม่ต้องรีบ — พักก่อนแล้วค่อยสร้างสรรค์ใหม่' },
    'relax-home':      { en: '\u2190 Back home',   th: '\u2190 กลับหน้าแรก' },

    /* ===== FREELANCER WORKSPACE ===== */
    'fw-home-title':   { en: 'Your projects',     th: 'โปรเจกต์ของคุณ' },
    'fw-home-desc':    { en: 'List your projects with a price and details \u2014 so clients can see you and start booking.', th: 'ลงรายการโปรเจกต์พร้อมราคาและรายละเอียด — ให้ลูกค้าเห็นคุณและเริ่มสั่งงาน' },
    'fw-stat-works':   { en: 'Projects',          th: 'โปรเจกต์' },
    'fw-stat-views':   { en: 'Views',             th: 'เข้าชม' },
    'fw-stat-orders':  { en: 'Orders',            th: 'ออเดอร์' },
    'fw-empty-title':  { en: 'Your orbit is still empty', th: 'ยังไม่มีโปรเจกต์ในระบบ' },
    'fw-empty-desc':   { en: "Create your first project to start taking orders \u2014 add a photo, price, and details. That's all it takes.", th: 'สร้างโปรเจกต์แรกเพื่อรับออเดอร์ — ใส่รูป ราคา และรายละเอียด แค่นี้ก็พอ' },
    'fw-create-btn':   { en: 'Create your first project', th: 'สร้างโปรเจกต์แรก' },

    /* ===== MESSAGES ===== */
    'msg-title':       { en: 'Messages',          th: 'ข้อความ' },
    'msg-empty':       { en: 'Select a conversation to start chatting', th: 'เลือกแชทเพื่อเริ่มพูดคุย' },
    'msg-input':       { en: 'Type a message...', th: 'พิมพ์ข้อความ...' },
    'msg-create-inv':  { en: 'Create Invoice',     th: 'สร้างใบแจ้งหนี้' },

    /* ===== PROJECT ===== */
    'proj-breadcrumb': { en: 'START YOUR PROJECT', th: 'เริ่มโปรเจกต์ของคุณ' },
    'proj-title':      { en: 'Pick the work.<br><span class="accent">See the price.</span>', th: 'เลือกงาน<br><span class="accent">ดูราคา</span>' },
    'proj-lead':       { en: 'Browse real portfolios from our talent network, choose your category and starting price, and launch your project in minutes.', th: 'ดูผลงานจริงจากนักสร้างสรรค์ของเรา เลือกหมวดหมู่และราคาเริ่มต้น แล้วเปิดโปรเจกต์ได้ในไม่กี่นาที' },
    'proj-browse':     { en: 'Browse categories', th: 'ดูหมวดหมู่' },
    'proj-how':        { en: 'How it works',      th: 'วิธีทำงาน' },
    'proj-stat-talents': { en: 'Talents',         th: 'นักสร้างสรรค์' },
    'proj-stat-cats':  { en: 'Categories',        th: 'หมวดหมู่' },
    'proj-stat-reply': { en: 'First reply',        th: 'ตอบกลับครั้งแรก' },
    'proj-stat-fees':  { en: 'Hidden fees',        th: 'ค่าธรรมเนียมแอบแฝง' },
    'proj-what':       { en: 'What do you need made?', th: 'ต้องการให้ทำอะไร?' },

    /* ===== BANK DETAIL ===== */
    'bank-title':      { en: 'Bank Detail',       th: 'รายละเอียดบัญชีธนาคาร' },
    'bank-sub':        { en: 'Add your bank account for receiving payments.', th: 'เพิ่มบัญชีธนาคารสำหรับรับเงิน' },
    'bank-save':       { en: 'Save',              th: 'บันทึก' },
    'bank-back':       { en: '\u2190 Back to profile', th: '\u2190 กลับโปรไฟล์' },
    'bank-edit':       { en: 'Edit',              th: 'แก้ไข' },
    'bank-profile':    { en: 'Profile',           th: 'โปรไฟล์' },

    /* ===== PROFILE ===== */
    'profile-title':   { en: 'Profile',           th: 'โปรไฟล์' },
  };

  function apply(lang) {
    document.documentElement.setAttribute('lang', lang === 'th' ? 'th' : 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const t = T[key];
      if (!t) return;
      const val = t[lang] || t.en;
      if (val.includes('<')) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const t = T[key];
      if (t) el.placeholder = t[lang] || t.en;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const t = T[key];
      if (t) el.title = t[lang] || t.en;
    });
    const lbl = document.getElementById('langLabel');
    if (lbl) lbl.textContent = lang === 'th' ? 'TH' : 'EN';
    const flag = document.getElementById('langFlag');
    if (flag) flag.textContent = lang === 'th' ? '\u{1F1F9}\u{1F1ED}' : '\u{1F1EC}\u{1F1E7}';
  }

  function buildToggle() {
    const wrap = document.createElement('div');
    wrap.className = 'lang-dropdown';
    wrap.innerHTML = `
      <button class="lang-toggle" id="langToggleBtn" data-cursor="hover" aria-label="Toggle language">
        <span class="lang-flag" id="langFlag"></span>
        <span class="lang-label" id="langLabel"></span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="lang-menu" id="langMenu">
        <button class="lang-option" data-lang="th" data-cursor="hover">
          <span class="lang-flag">\u{1F1F9}\u{1F1ED}</span>
          <span>\u0E44\u0E17\u0E22</span>
        </button>
        <button class="lang-option" data-lang="en" data-cursor="hover">
          <span class="lang-flag">\u{1F1EC}\u{1F1E7}</span>
          <span>English</span>
        </button>
      </div>`;

    const navCta = document.querySelector('.nav-cta');
    if (navCta) navCta.insertBefore(wrap, navCta.firstChild);
    else {
      const inner = document.querySelector('.nav-inner');
      if (inner) inner.appendChild(wrap);
    }

    const btn = wrap.querySelector('.lang-toggle');
    const menu = wrap.querySelector('.lang-menu');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });

    wrap.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const lang = opt.getAttribute('data-lang');
        localStorage.setItem(LS_KEY, lang);
        apply(lang);
        menu.classList.remove('open');
      });
    });

    document.addEventListener('click', () => menu.classList.remove('open'));
  }

  buildToggle();
  apply(localStorage.getItem(LS_KEY) || 'en');
})();
