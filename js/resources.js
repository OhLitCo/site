// Resources page: reads data/resources.json and builds the cards, filters, and search.
// To add or change a resource, edit data/resources.json. This file does not need to change.

(function () {
  var DATA_URL = 'data/resources.json';

  var els = {
    sections: document.getElementById('sections'),
    status: document.getElementById('load-status'),
    noResults: document.getElementById('no-results'),
    count: document.getElementById('results-count'),
    clear: document.getElementById('clear'),
    search: document.getElementById('search'),
    topicTags: document.getElementById('topic-tags'),
    formatTags: document.getElementById('format-tags'),
    ohioBtn: document.getElementById('ohio-btn'),
    updated: document.getElementById('list-updated'),
    filters: document.getElementById('filters')
  };

  var state = { topics: new Set(), formats: new Set(), ohio: false, query: '' };
  var cards = [];      // { el, resource, haystack }
  var sectionEls = []; // { el, id }

  // ---------- small helpers (all text goes in with textContent, never as HTML) ----------
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function arrowIcon() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M7 17L17 7M7 7h10v10');
    svg.appendChild(path);
    return svg;
  }

  function monthYear(iso) {
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00Z' : '-01T00:00:00Z'));
    if (isNaN(d)) return null;
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function lookup(list) {
    var map = {};
    list.forEach(function (item) { map[item.id] = item; });
    return map;
  }

  // ---------- cards ----------
  function buildCard(r, formatsById, topicsById) {
    var card = el('article', 'resource-card');

    var header = el('div', 'card-header');
    var titleWrap = el('div');
    titleWrap.appendChild(el('h3', 'card-title', r.title));
    titleWrap.appendChild(el('p', 'card-source', r.source));
    header.appendChild(titleWrap);

    var badges = el('div', 'card-badges');
    r.formats.forEach(function (id) {
      var f = formatsById[id];
      badges.appendChild(el('span', 'badge badge-' + id, f ? f.label : id));
    });
    if (r.ohio) badges.appendChild(el('span', 'badge badge-ohio', 'Ohio'));
    header.appendChild(badges);
    card.appendChild(header);

    var facts = [];
    if (r.cost) facts.push({ text: r.cost, free: /^free/i.test(r.cost) });
    if (r.languages) facts.push({ text: r.languages });
    if (r.checked) {
      var when = monthYear(r.checked);
      if (when) facts.push({ text: 'Checked ' + when });
    }
    if (facts.length) {
      var ul = el('ul', 'card-facts');
      facts.forEach(function (f) { ul.appendChild(el('li', f.free ? 'fact-free' : '', f.text)); });
      card.appendChild(ul);
    }

    card.appendChild(el('p', 'card-desc', r.description));

    if (r.note) {
      var note = el('div', 'card-note');
      note.appendChild(el('p', 'card-note-label', r.note.label));
      note.appendChild(el('p', '', r.note.text));
      card.appendChild(note);
    }

    var link = el('a', 'card-link');
    link.href = r.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(document.createTextNode(r.linkLabel || r.url.replace(/^https?:\/\/(www\.)?/, '')));
    link.appendChild(arrowIcon());
    var sr = el('span', 'visually-hidden', ' (opens in a new tab)');
    link.appendChild(sr);
    card.appendChild(link);

    var topicLabels = r.topics.map(function (id) { return topicsById[id] ? topicsById[id].label : id; });
    var formatLabels = r.formats.map(function (id) { return formatsById[id] ? formatsById[id].label : id; });
    var haystack = [
      r.title, r.source, r.description, r.cost || '', r.languages || '',
      r.note ? r.note.text : '', topicLabels.join(' '), formatLabels.join(' '), r.ohio ? 'ohio' : ''
    ].join(' ').toLowerCase();

    return { el: card, resource: r, haystack: haystack };
  }

  // ---------- filter buttons ----------
  function buildTagButtons(container, items, selected, getCount) {
    items.forEach(function (item) {
      var btn = el('button', 'tag');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', 'false');
      btn.dataset.id = item.id;
      btn.appendChild(el('span', 'label', item.label));
      btn.appendChild(document.createTextNode(' '));
      btn.appendChild(el('span', 'n', String(getCount(item.id))));
      btn.addEventListener('click', function () {
        if (selected.has(item.id)) selected.delete(item.id); else selected.add(item.id);
        apply();
      });
      container.appendChild(btn);
    });
  }

  // ---------- filtering ----------
  function matches(c) {
    var r = c.resource;
    if (state.topics.size && !r.topics.some(function (t) { return state.topics.has(t); })) return false;
    if (state.formats.size && !r.formats.some(function (f) { return state.formats.has(f); })) return false;
    if (state.ohio && !r.ohio) return false;
    if (state.query) {
      var words = state.query.split(/\s+/);
      for (var i = 0; i < words.length; i++) {
        if (c.haystack.indexOf(words[i]) === -1) return false;
      }
    }
    return true;
  }

  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = matches(c);
      c.el.hidden = !ok;
      if (ok) shown++;
    });
    sectionEls.forEach(function (s) {
      s.el.hidden = !s.el.querySelector('.resource-card:not([hidden])');
    });
    [els.topicTags, els.formatTags].forEach(function (container) {
      var selected = container === els.topicTags ? state.topics : state.formats;
      container.querySelectorAll('.tag').forEach(function (b) {
        b.setAttribute('aria-pressed', selected.has(b.dataset.id) ? 'true' : 'false');
      });
    });
    els.ohioBtn.setAttribute('aria-pressed', state.ohio ? 'true' : 'false');
    els.count.textContent = 'Showing ' + shown + ' of ' + cards.length + ' resources';
    els.clear.hidden = !(state.topics.size || state.formats.size || state.ohio || state.query);
    els.noResults.classList.toggle('show', shown === 0);
  }

  // ---------- start ----------
  function init(data) {
    var formatsById = lookup(data.formats);
    var topicsById = lookup(data.topics);

    data.sections.forEach(function (s) {
      var section = el('section', 'res-section');
      section.id = s.id;
      var head = el('div', 'section-head');
      var bar = el('span', 'section-bar');
      bar.style.background = s.color;
      head.appendChild(bar);
      var text = el('div');
      text.appendChild(el('h2', 'section-title', s.title));
      text.appendChild(el('p', 'section-sub', s.blurb));
      head.appendChild(text);
      section.appendChild(head);

      var list = el('div', 'resources');
      data.resources.filter(function (r) { return r.section === s.id; }).forEach(function (r) {
        var c = buildCard(r, formatsById, topicsById);
        cards.push(c);
        list.appendChild(c.el);
      });
      section.appendChild(list);
      els.sections.appendChild(section);
      sectionEls.push({ el: section, id: s.id });
    });

    function countWhere(test) { return data.resources.filter(test).length; }
    buildTagButtons(els.topicTags, data.topics, state.topics, function (id) {
      return countWhere(function (r) { return r.topics.indexOf(id) !== -1; });
    });
    buildTagButtons(els.formatTags, data.formats, state.formats, function (id) {
      return countWhere(function (r) { return r.formats.indexOf(id) !== -1; });
    });
    els.ohioBtn.querySelector('.n').textContent = String(countWhere(function (r) { return r.ohio; }));
    els.ohioBtn.addEventListener('click', function () { state.ohio = !state.ohio; apply(); });

    els.search.addEventListener('input', function () {
      state.query = els.search.value.trim().toLowerCase();
      apply();
    });
    els.clear.addEventListener('click', function () {
      state.topics.clear(); state.formats.clear(); state.ohio = false; state.query = '';
      els.search.value = '';
      apply();
    });

    if (data.updated) {
      var when = monthYear(data.updated);
      if (when) els.updated.textContent = 'List last updated ' + when + '.';
    }

    // On wide screens the filters are always open in the sidebar. On phones they start folded away.
    var wide = window.matchMedia('(min-width: 900px)');
    function syncFilters() { els.filters.open = wide.matches; }
    syncFilters();
    if (wide.addEventListener) wide.addEventListener('change', syncFilters);

    els.status.hidden = true;
    apply();

    // The page was empty when the browser first tried to jump to a #section, so jump now.
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  function fail() {
    els.status.textContent = '';
    els.status.appendChild(document.createTextNode('The resource list did not load. Please refresh the page, or write to '));
    var a = el('a', '', 'hello@ohlitco.org');
    a.href = 'mailto:hello@ohlitco.org';
    els.status.appendChild(a);
    els.status.appendChild(document.createTextNode(' and we will help.'));
  }

  fetch(DATA_URL)
    .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
    .then(init)
    .catch(function (err) { if (window.console) console.error('Could not load resources:', err); fail(); });
})();
