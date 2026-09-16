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
  const ORDER = ['rnb', 'jazz', 'cozy', 'warm', 'fun', 'focus'];
  const LABELS = { rnb: 'R&B', jazz: 'Jazz', cozy: 'Cozy', warm: 'Warm', fun: 'Fun', focus: 'Focus' };
  const STORE_KEY = 'nezworks:radio';

  let audio = null;
  let moodKey = null;

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

  function setActive() {
    if (!widget) return;
    widget.querySelectorAll('.label').forEach(lb => {
      const input = lb.querySelector('input');
      const on = input.value === moodKey;
      input.checked = on;
      lb.classList.toggle('active', on);
    });
  }

  function playMood(key) {
    if (!TRACKS[key]) key = null;
    if (moodKey === key) {
      moodKey = null;
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
    setActive();
    emit();
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
    setActive();
  }

  /* ---------- widget ---------- */
  let widget = null;

  function buildWidget() {
    if (document.getElementById('radio-player')) return;
    widget = document.createElement('div');
    widget.id = 'radio-player';
    const rail = document.createElement('div');
    rail.className = 'radio-input';
    ORDER.forEach(key => {
      const label = document.createElement('label');
      label.className = 'label';
      label.innerHTML = '<div class="back-side"></div>'
        + '<input type="radio" name="mood-radio" value="' + key + '">'
        + '<span class="text">' + LABELS[key] + '</span>'
        + '<div class="bottom-line"></div>';
      rail.appendChild(label);
    });
    widget.appendChild(rail);
    document.body.appendChild(widget);
    setActive();

    widget.querySelectorAll('input[type="radio"]').forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) playMood(input.value);
      });
    });
  }

  window.RelaxRadio = {
    setMood: playMood,
    getMood: function () { return moodKey; },
  };

  function fadeIn() {
    if (widget) requestAnimationFrame(() => widget.classList.add('ready'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    buildWidget();
    restore();
    fadeIn();
  });
})();