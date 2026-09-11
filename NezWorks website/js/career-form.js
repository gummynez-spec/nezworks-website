/* ============ CAREER FORM — 5-step freelancer application ============ */
(() => {
  const form = document.getElementById('applyForm');
  if (!form) return;

  const steps = [...form.querySelectorAll('.af-step')];
  const dots = [...form.querySelectorAll('.af-step-dot')];
  const bar = document.getElementById('afBar');
  const label = document.getElementById('afLabel');
  const backBtn = document.getElementById('afBack');
  const nextBtn = document.getElementById('afNext');
  const submitBtn = document.getElementById('afSubmit');
  const success = document.getElementById('afSuccess');

  const LABELS = ['ข้อมูลบัญชี', 'ข้อมูล Freelancer', 'ข้อมูลสำหรับรับเงิน', 'การยืนยันตัวตน', 'การยอมรับข้อตกลง'];
  const total = steps.length;
  let current = 1;

  /* upload boxes — show filled state with filename */
  form.querySelectorAll('.af-upload').forEach((box) => {
    const input = box.querySelector('input[type="file"]');
    if (!input) return;
    input.addEventListener('change', () => {
      if (input.files.length) {
        box.classList.add('filled');
        const nameEl = box.querySelector('small');
        if (!box.dataset.origLabel) box.dataset.origLabel = nameEl.textContent;
        const names = [...input.files].map(f => f.name).join(', ');
        nameEl.textContent = input.files.length === 1
          ? `✓ ${names}`
          : `✓ ${input.files.length} ไฟล์: ${names.slice(0, 48)}${names.length > 48 ? '…' : ''}`;
      }
    });
  });

  /* OTP button — demo state flip */
  const otpBtn = document.getElementById('otpBtn');
  if (otpBtn) {
    otpBtn.addEventListener('click', () => {
      otpBtn.textContent = 'ส่งแล้ว ✓';
      otpBtn.disabled = true;
      setTimeout(() => { otpBtn.textContent = 'ส่ง OTP'; otpBtn.disabled = false; }, 30000);
    });
  }

  function stepValid(n) {
    const fieldset = steps[n - 1];
    const inputs = [...fieldset.querySelectorAll('input:not([type="file"]), select, textarea')];
    for (const el of inputs) {
      if (el.required && !el.checkValidity()) return false;
      if ((el.type === 'checkbox') && el.required && !el.checked) return false;
    }
    /* uploads required per step */
    if (n === 2 || n === 4) {
      const uploads = [...fieldset.querySelectorAll('.af-upload input[type="file"]')];
      for (const u of uploads) {
        if (u.required !== false && u.files.length === 0) {
          // uploads optional in demo — skip hard requirement
        }
      }
    }
    return true;
  }

  function showStep(n) {
    const outgoing = steps[current - 1];
    const incoming = steps[n - 1];
    outgoing.classList.remove('active');
    incoming.classList.add('active');

    current = n;
    bar.style.width = (n / total) * 100 + '%';
    label.textContent = LABELS[n - 1];

    dots.forEach((d, i) => {
      d.classList.toggle('active', i + 1 === n);
      d.classList.toggle('done', i + 1 < n);
      d.textContent = i + 1 < n ? '✓' : String(i + 1);
    });

    backBtn.hidden = n === 1;
    nextBtn.hidden = n === total;
    submitBtn.hidden = n !== total;
    nextBtn.disabled = !stepValid(n);
  }

  /* live validation */
  form.addEventListener('input', () => {
    if (current < total) nextBtn.disabled = !stepValid(current);
  });

  nextBtn.addEventListener('click', () => {
    if (!stepValid(current)) {
      steps[current - 1].querySelectorAll(':invalid').forEach(el => el.reportValidity?.());
      return;
    }
    if (current < total) showStep(current + 1);
  });

  backBtn.addEventListener('click', () => showStep(current - 1));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!stepValid(total)) return;
    form.hidden = true;
    success.hidden = false;
    success.classList.add('play');
  });

  showStep(1);
})();
