/* Language picker. Google's translator loads only after someone picks a language,
   so English readers never load anything from Google. */
(function () {
  var LANGS = [
    ['en', 'English'], ['es', 'Español (Spanish)'], ['so', 'Soomaali (Somali)'],
    ['ar', 'العربية (Arabic)'], ['ne', 'नेपाली (Nepali)'], ['uk', 'Українська (Ukrainian)'],
    ['sw', 'Kiswahili (Swahili)'], ['fr', 'Français (French)'], ['ht', 'Kreyòl ayisyen (Haitian Creole)'],
    ['zh-CN', '中文 (Chinese)'], ['pt', 'Português (Portuguese)'], ['ru', 'Русский (Russian)'],
    ['vi', 'Tiếng Việt (Vietnamese)']
  ];

  function current() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : 'en';
  }

  function setLang(code) {
    var host = location.hostname;
    var past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'googtrans=; path=/; ' + past;
    document.cookie = 'googtrans=; path=/; domain=' + host + '; ' + past;
    if (code !== 'en') {
      document.cookie = 'googtrans=/en/' + code + '; path=/';
      document.cookie = 'googtrans=/en/' + code + '; path=/; domain=' + host;
    }
    location.reload();
  }

  var bar = document.createElement('div');
  bar.className = 'translate-bar';
  bar.innerHTML =
    '<label for="lang-pick">Read this page in another language</label>' +
    '<select id="lang-pick"></select>' +
    '<p class="translate-note">Translations are automatic and may contain mistakes.</p>';
  var sel = bar.querySelector('select');
  var cur = current();
  LANGS.forEach(function (l) {
    var o = document.createElement('option');
    o.value = l[0]; o.textContent = l[1];
    if (l[0] === cur) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', function () { setLang(sel.value); });
  document.body.appendChild(bar);

  if (cur !== 'en') {
    var holder = document.createElement('div');
    holder.id = 'google_translate_element';
    holder.className = 'translate-hidden';
    document.body.appendChild(holder);
    window.gtInit = function () {
      new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
    };
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit';
    document.head.appendChild(s);
  }
})();
