(function () {
  'use strict';

  const TRACKS = {
    rnb:   'assets/sounds/lofi-cocktail-bar.mp3',
    jazz:  'assets/sounds/jazz-sunny-cafe.mp3',
    cozy:  'assets/sounds/lofi-coffee-shop.mp3',
    warm:  'assets/sounds/lofi-sunny-cafe.mp3',
    fun:   'assets/sounds/lofi-restaurant.mp3',
    focus: 'assets/sounds/trumpet-study.mp3',
  };
  const STORE_KEY = 'nezworks:radio';
  const IS_RELAX = (location.pathname.split('/').pop() || 'index.html').toLowerCase() === 'relax.html';

  let audio = null;
  let moodKey = null;
  let chip = null;

  /* ---------------- shared audio state ---------------- */
  function loadState() {
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveState() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({
        mood: moodKey,
        t: audio ? audio.currentTime : 0
      }));
    } catch (e) {}
  }
  window.addEventListener('pagehide', saveState);

  function isPlaying() { return !!(audio && !audio.paused && moodKey); }

  function emit() {
    window.dispatchEvent(new CustomEvent('relaxradio', { detail: { mood: moodKey, playing: isPlaying() } }));
  }

  function setupAudio() {
    if (audio) return;
    audio = new Audio();
    audio.loop = true;
    audio.volume = 0.55;
  }

  function ensureTrack(key) {
    if (!key || !TRACKS[key]) return;
    if (audio.src.indexOf(TRACKS[key]) === -1) {
      audio.src = TRACKS[key];
      audio.currentTime = 0;
    }
  }

  /* keep ON/OFF rails in sync (chip + drawer) */
  function syncRadios() {
    const on = isPlaying();
    document.querySelectorAll('.radio-input').forEach(rail => {
      rail.querySelectorAll('input[type="radio"]').forEach(inp => {
        const wantOn = (inp.value === 'on') === on;
        inp.checked = wantOn;
        const label = inp.closest('.label');
        if (label) label.classList.toggle('active', wantOn);
      });
    });
  }

  function setPlaying(on) {
    setupAudio();
    if (!moodKey) {
      const saved = loadState();
      moodKey = (saved && TRACKS[saved.mood]) ? saved.mood : 'rnb';
    }
    ensureTrack(moodKey);
    if (on) audio.play().catch(() => {});
    else audio.pause();
    saveState();
    syncRadios();
    emit();
  }

  function stopAll() {
    if (audio) audio.pause();
    syncRadios();
    emit();
    saveState();
  }

  function playMood(key) {
    if (!TRACKS[key]) return;
    if (moodKey === key) {
      moodKey = null;
      if (audio) audio.pause();
    } else {
      moodKey = key;
      setupAudio();
      ensureTrack(key);
      audio.play().catch(() => {});
    }
    saveState();
    syncRadios();
    emit();
  }

  function restore() {
    const saved = loadState();
    if (saved && saved.mood && TRACKS[saved.mood]) {
      moodKey = saved.mood;
      setupAudio();
      ensureTrack(moodKey);
      audio.currentTime = saved.t || 0;
      audio.play().catch(() => {});
    }
    syncRadios();
  }

  /* ---------------- draggable chip (relax page only) ---------------- */
  function railHTML(name) {
    return '<div class="radio-input" data-rail="' + name + '">'
      + '<label class="label"><div class="back-side"></div>'
      + '<input type="radio" name="' + name + '" value="on"><span class="text">ON</span><div class="bottom-line"></div></label>'
      + '<label class="label"><div class="back-side"></div>'
      + '<input type="radio" name="' + name + '" value="off"><span class="text">OFF</span><div class="bottom-line"></div></label>'
      + '</div>';
  }

  function wireRails() {
    document.querySelectorAll('.radio-input').forEach(rail => {
      if (rail.dataset.wired) return;
      rail.dataset.wired = '1';
      rail.querySelectorAll('input[type="radio"]').forEach(inp => {
        inp.addEventListener('change', () => {
          if (rail.dataset.suppress === '1') return;
          if (inp.checked) setPlaying(inp.value === 'on');
        });
      });
    });
  }

  function buildChip() {
    if (!IS_RELAX || document.getElementById('radio-player')) return;
    chip = document.createElement('div');
    chip.id = 'radio-player';
    chip.innerHTML = railHTML('chip-power') + '<button class="rp-close" aria-label="Move music controls to the panel"></button>';
    document.body.appendChild(chip);

    chip.querySelector('.rp-close').addEventListener('click', () => {
      stopAll();
      if (window.RelaxRadio.onChipClose) window.RelaxRadio.onChipClose();
    });

    /* dragging */
    let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const rect = () => chip.getBoundingClientRect();

    chip.addEventListener('pointerdown', e => {
      if (e.target.closest('.label, .rp-close')) return;
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      ox = rect().left; oy = rect().top;
      chip.setPointerCapture(e.pointerId);
      chip.classList.add('dragging');
    });
    chip.addEventListener('pointermove', e => {
      if (!dragging) return;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 6) moved = true;
      if (!moved) return;
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      nx = Math.max(8, Math.min(window.innerWidth - rect().width - 8, nx));
      ny = Math.max(8, Math.min(window.innerHeight - rect().height - 8, ny));
      chip.style.left = nx + 'px';
      chip.style.top = ny + 'px';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      chip.classList.remove('dragging');
      if (moved) {
        chip.querySelectorAll('.radio-input').forEach(r => { r.dataset.suppress = '1'; });
        setTimeout(() => chip.querySelectorAll('.radio-input').forEach(r => { r.dataset.suppress = '0'; }), 80);
        moved = false;
      }
    }
    chip.addEventListener('pointerup', endDrag);
    chip.addEventListener('pointercancel', endDrag);

    wireRails();
    syncRadios();
    requestAnimationFrame(() => chip.classList.add('ready'));
  }

  window.RelaxRadio = {
    setMood: playMood,
    getMood: function () { return moodKey; },
    setPlaying: setPlaying,
    isPlaying: isPlaying,
    hideChip: function () { if (chip) chip.classList.add('hidden'); },
    showChip: function () { if (chip) chip.classList.remove('hidden'); },
    onChipClose: null,
  };

  document.addEventListener('DOMContentLoaded', () => {
    buildChip();
    wireRails();
    restore();
  });
})();