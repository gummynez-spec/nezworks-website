/* ===== HOME — Sections 3-6  ===== */
(function(){
  "use strict";

  /* -------- HOW IT WORKS: Step activation + planet transitions -------- */
  var planets = ["mercury","venus","earth","mars"];
  var activePlanet = -1;
  var planetEls = [];
  var stepEls = [];

  function initHiiw(){
    planetEls = planets.map(function(id){
      var el = document.getElementById("planet-" + id);
      if(el) el.classList.add("hiw-planet");
      return el;
    });

    stepEls = Array.prototype.slice.call(document.querySelectorAll(".hiw-step"));
    if(!stepEls.length || planetEls.every(function(el){ return !el; })) return;

    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      stepEls.forEach(function(s,i){
        s.classList.add("active");
        if(planetEls[i]) planetEls[i].classList.add("active");
      });
      return;
    }

    /* explicit stepping on mobile */
    stepEls.forEach(function(step,i){
      step.addEventListener("click",function(){
        activateStep(i);
      });
    });

    /* IntersectionObserver */
    if(!("IntersectionObserver" in window)){
      stepEls.forEach(function(s,i){
        s.classList.add("active");
        if(planetEls[i]) planetEls[i].classList.add("active");
      });
      return;
    }

    var lastTriggered = -1;
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var idx = stepEls.indexOf(entry.target);
        if(idx < 0 || idx === lastTriggered) return;
        lastTriggered = idx;
        activateStep(idx);
      });
    },{threshold:0.55,rootMargin:"-40px 0px"});

    stepEls.forEach(function(step){ observer.observe(step); });
  }

  function activateStep(idx){
    if(idx === activePlanet) return;
    if(activePlanet >= 0 && planetEls[activePlanet]){
      planetEls[activePlanet].classList.remove("active");
      planetEls[activePlanet].classList.add("leaving");
    }

    stepEls.forEach(function(s){ s.classList.remove("active"); });
    if(stepEls[idx]) stepEls[idx].classList.add("active");

    if(planetEls[idx]){
      planetEls[idx].classList.remove("leaving");
      void planetEls[idx].offsetWidth;
      planetEls[idx].classList.add("active");
    }

    /* remove leaving after animation so DOM stays clean */
    if(activePlanet >= 0 && activePlanet !== idx && planetEls[activePlanet]){
      var prev = planetEls[activePlanet];
      setTimeout(function(){ prev.classList.remove("leaving"); },1600);
    }
    activePlanet = idx;
  }

  document.addEventListener("DOMContentLoaded", function(){
    initHiiw();
  });
})();
