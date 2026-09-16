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
  const LABELS = { rnb: 'R&B', jazz: 'Jazz', cozy: 'Cozy', warm: 'Warm', fun: 'Fun', focus: 'Focus' };
  const STORE_KEY = 'nezworks:radio';
  const IS_RELAX = (location.pathname.split('/').pop() || 'index.html').toLowerCase() === 'relax.html';

  let audio = null;
  let moodKey = null;
  let widget = null;

  /* ---------------- shared audio state ---------------- */
  function saveState() {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({
        mood: moodKey,
        t: audio ? audio.currentTime : 0
      }));
    } catch (e) {}
  }
  window.addEventListener('pagehide', saveState);

  function emit() {
    window.dispatchEvent(new CustomEvent('relaxradio', { detail: { mood: moodKey } }));
  }

  function isPlaying() { return !!(audio && !audio.paused && moodKey); }

  function playMood(key) {
    if (!TRACKS[key]) key = null;
    if (moodKey === key) {
      moodKey = null;
      if (audio) audio.pause();
    } else {
      moodKey = key;
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.volume = 0.55;
      }
      if (key) {
        if (audio.src.indexOf(TRACKS[key]) === -1) {
          audio.src = TRACKS[key];
          audio.currentTime = 0;
        }
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
    saveState();
    updateUi();
    emit();
  }

  function toggle() {
    if (!moodKey) {
      if (window.RelaxRadio.onChipClose) window.RelaxRadio.onChipClose();
      return;
    }
    if (isPlaying()) audio.pause();
    else if (audio) audio.play().catch(() => {});
    updateUi();
  }

  function restore() {
    let s = null;
    try { s = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch (e) {}
    if (s && s.mood && TRACKS[s.mood]) {
      moodKey = s.mood;
      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.volume = 0.55;
      }
      audio.src = TRACKS[moodKey];
      audio.currentTime = s.t || 0;
      audio.play().catch(() => {});
    }
    updateUi();
  }

  /* ---------------- draggable on/off chip (relax page only) ---------------- */
  function updateUi() {
    if (!widget) return;
    const power = widget.querySelector('.rp-power');
    const mood = widget.querySelector('.rp-mood');
    const on = isPlaying();
    power.classList.toggle('on', on);
    power.setAttribute('aria-pressed', on);
    mood.textContent = moodKey ? (LABELS[moodKey] + (on ? ' · ON' : ' · OFF')) : 'Pick a sound';
    widget.classList.toggle('playing', on);
  }

  function buildWidget() {
    if (!IS_RELAX || document.getElementById('radio-player')) return;
    widget = document.createElement('div');
    widget.id = 'radio-player';
    widget.innerHTML =
      '<button class="rp-power" aria-pressed="false" aria-label="Music on/off"></button>'
      + '<div class="rp-label"><span class="rp-mood">Pick a sound</span></div>'
      + '<button class="rp-close" aria-label="Close player"></button>';

    document.body.appendChild(widget);
    updateUi();

    const power = widget.querySelector('.rp-power');
    const close = widget.querySelector('.rp-close');

    power.addEventListener('click', toggle);
    close.addEventListener('click', () => {
      if (window.RelaxRadio.onChipClose) window.RelaxRadio.onChipClose();
    });

    // drag freely (pointer events)
    let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
    const rect = () => widget.getBoundingClientRect();

    widget.addEventListener('pointerdown', e => {
      if (e.target.closest('.rp-power, .rp-close')) return;
      dragging = true; moved = false;
      sx = e.clientX; sy = e.clientY;
      ox = rect().left; oy = rect().top;
      widget.setPointerCapture(e.pointerId);
      widget.classList.add('dragging');
    });
    widget.addEventListener('pointermove', e => {
      if (!dragging) return;
      if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 6) moved = true;
      if (!moved) return;
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      nx = Math.max(8, Math.min(window.innerWidth - rect().width - 8, nx));
      ny = Math.max(8, Math.min(window.innerHeight - rect().height - 8, ny));
      widget.style.left = nx + 'px';
      widget.style.top = ny + 'px';
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      widget.classList.remove('dragging');
    }
    widget.addEventListener('pointerup', endDrag);
    widget.addEventListener('pointercancel', endDrag);

    // entrance
    requestAnimationFrame(() => widget.classList.add('ready'));
  }

  window.RelaxRadio = {
    setMood: playMood,
    getMood: function () { return moodKey; },
    isPlaying: isPlaying,
    hideChip: function () { if (widget) widget.classList.add('hidden'); },
    showChip: function () { if (widget) widget.classList.remove('hidden'); },
    onChipClose: null,
  };

  document.addEventListener('DOMContentLoaded', () => {
    buildWidget();
    restore();
  });
})();