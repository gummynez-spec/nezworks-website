/* ===== HOME — Sections 3-6  ===== */
(function(){
  "use strict";

  var planets = ["mercury","venus","earth","mars"];
  var stepEls = [];
  var planetEls = [];
  var activeIdx = -1;
  var started = false;
  var counterEl = null;

  function init(){
    counterEl = document.getElementById("hiwCounterCur");
    stepEls = Array.prototype.slice.call(document.querySelectorAll(".hiw-step"));
    planetEls = planets.map(function(id){
      var el = document.getElementById("planet-" + id);
      if(el){
        el.classList.remove("active");
        el.classList.remove("leaving");
      }
      return el;
    });
    if(!stepEls.length) return;

    /* reduced motion: show step 01 + planet 01 statically */
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      stepEls[0].classList.add("active");
      if(planetEls[0]) planetEls[0].classList.add("active");
      return;
    }

    /* users can always click any step */
    stepEls.forEach(function(step,i){
      step.addEventListener("click", function(){ activate(i); });
    });

    if("IntersectionObserver" in window){
      /* Step 01 becomes active by default once the section is reached */
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
        },{ threshold:0.15 });
        enterObs.observe(wrap);
      }

      /* steps activate progressively as the user scrolls (both directions) */
      var stepObs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(!started) return;
          /* only trigger when the step is entering view, not while leaving */
          if(entry.intersectionRatio < 0.5) return;
          var idx = stepEls.indexOf(entry.target);
          if(idx >= 0 && idx !== activeIdx) activate(idx);
        });
      },{ threshold:0.5, rootMargin:"-40px 0px" });

      stepEls.forEach(function(step){ stepObs.observe(step); });
    } else {
      /* fallback */
      stepEls[0].classList.add("active");
      if(planetEls[0]) planetEls[0].classList.add("active");
    }
  }

  function activate(idx){
    if(idx < 0 || idx >= stepEls.length || idx === activeIdx) return;

    /* previous step returns to normal */
    if(activeIdx >= 0){
      stepEls[activeIdx].classList.remove("active");
      var prev = planetEls[activeIdx];
      if(prev){
        prev.classList.remove("active");
        prev.classList.add("leaving");
        clearTimeout(prev._t);
        prev._t = setTimeout(function(){ prev.classList.remove("leaving"); }, 2000);
      }
    }

    /* new step becomes active */
    stepEls[idx].classList.add("active");
    if(counterEl) counterEl.textContent = (idx < 9 ? "0" : "") + (idx + 1);
    var cur = planetEls[idx];
    if(cur){
      cur.classList.remove("leaving");
      void cur.offsetWidth;
      cur.classList.add("active");
    }
    activeIdx = idx;
  }

  document.addEventListener("DOMContentLoaded", init);
})();