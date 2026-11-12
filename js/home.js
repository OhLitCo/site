// Home page: as each pillar scrolls into view, it fades in,
// its number takes its color, and its layer of the Ohio watercolor is revealed.

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

  var pillars = document.querySelectorAll('.pillar');
  if (!pillars.length) return;

  function reveal(el) {
    el.classList.add('visible');

    var wash = document.getElementById('wash-' + el.dataset.wash);
    if (wash) wash.classList.add('shown');

    var number = el.querySelector('.pillar-number');
    if (number && el.dataset.color) number.style.color = el.dataset.color;
  }

  // Older browsers without IntersectionObserver just get everything shown.
  if (!('IntersectionObserver' in window)) {
    pillars.forEach(reveal);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  pillars.forEach(function (p) { observer.observe(p); });
})();
