// Home page: the Ohio watercolor builds up gradually as you scroll.
// Each pillar's paint layer follows how far that pillar has scrolled into view,
// so the color arrives a little at a time instead of all at once.

(function () {
  // The paint images are loaded after the page itself, so the first view is fast.
  function loadWashes() {
    document.querySelectorAll('img.wash[data-src]').forEach(function (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
  if (document.readyState === 'complete') loadWashes();
  else window.addEventListener('load', loadWashes);

  var pillars = Array.prototype.slice.call(document.querySelectorAll('.pillar'));
  if (!pillars.length) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function colorNumber(el) {
    var number = el.querySelector('.pillar-number');
    if (number && el.dataset.color) number.style.color = el.dataset.color;
  }

  function washFor(el) { return document.getElementById('wash-' + el.dataset.wash); }

  // Older browsers without IntersectionObserver just get everything shown.
  if (!('IntersectionObserver' in window)) {
    pillars.forEach(function (el) {
      el.classList.add('visible');
      colorNumber(el);
      var w = washFor(el);
      if (w) w.style.opacity = 1;
    });
    return;
  }

  // Pillar text fades in and its number takes its color.
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        colorNumber(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  pillars.forEach(function (p) { observer.observe(p); });

  // Paint opacity follows scroll position, eased so it never jumps.
  var layers = pillars.map(function (el) {
    return { el: el, wash: washFor(el), current: 0, target: 0 };
  });
  var ticking = false;

  function update() {
    var vh = window.innerHeight;
    var start = vh * 0.98;   // pillar top at the bottom of the screen: no paint yet
    var end = vh * 0.2;      // pillar top near the top of the screen: full paint
    var moving = false;
    layers.forEach(function (l) {
      if (!l.wash) return;
      var top = l.el.getBoundingClientRect().top;
      var p = Math.min(1, Math.max(0, (start - top) / (start - end)));
      l.target = p * p * (3 - 2 * p);
      l.current = reduceMotion ? l.target : l.current + (l.target - l.current) * 0.1;
      if (Math.abs(l.target - l.current) < 0.003) l.current = l.target;
      else moving = true;
      l.wash.style.opacity = l.current.toFixed(3);
    });
    ticking = false;
    if (moving) request();
  }
  function request() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  request();
})();
