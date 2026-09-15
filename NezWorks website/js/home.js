/* ===== HOME — Sections 3-6  ===== */
(function(){
  "use strict";

  var stepEls = [];
  var activeIdx = -1;
  var started = false;
  var counterEl = null;

  function init(){
    counterEl = document.getElementById("hiwCounterCur");
    stepEls = Array.prototype.slice.call(document.querySelectorAll(".hiw-step"));
    if(!stepEls.length) return;

    /* reduced motion: every slide keeps its state visible */
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      stepEls.forEach(function(s){ s.classList.add("active"); });
      return;
    }

    /* users can always click a slide to jump to it */
    stepEls.forEach(function(step,i){
      step.addEventListener("click", function(){ activate(i); });
    });

    if("IntersectionObserver" in window){
      /* Step 01 becomes active once the journey section is reached */
      var wrap = document.querySelector(".hiw-steps");
      if(wrap){
        var enterObs = new IntersectionObserver(function(entries){
          entries.forEach(function(entry){
            if(entry.isIntersecting && !started){
              started = true;
              activate(0);
              enterObs.disconnect();
            }
          });
        },{ threshold:0.35 });
        enterObs.observe(wrap);
      }

      /* the slide whose center sits inside the viewport band becomes active */
      var stepObs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!started) return;
          var idx = stepEls.indexOf(entry.target);
          if(idx < 0) return;
          var r = entry.boundingClientRect;
          var vh = window.innerHeight;
          var mid = r.top + r.height / 2;
          if(mid > vh * 0.12 && mid < vh * 0.88) activate(idx);
        });
      },{ threshold:[0.2,0.5,0.8] });

      stepEls.forEach(function(step){ stepObs.observe(step); });
    } else {
      stepEls[0].classList.add("active");
    }
  }

  function activate(idx){
    if(idx < 0 || idx >= stepEls.length || idx === activeIdx) return;
    if(activeIdx >= 0) stepEls[activeIdx].classList.remove("active");
    stepEls[idx].classList.add("active");
    if(counterEl) counterEl.textContent = (idx < 9 ? "0" : "") + (idx + 1);
    activeIdx = idx;
  }

  document.addEventListener("DOMContentLoaded", init);
})();