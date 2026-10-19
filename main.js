(function () {
  "use strict";

  var config = window.CARD_CONFIG;
  var ROWS = 4;
  var MIN_PER_ROW = 8; // enough tiles to cover wide screens before the loop repeats
  var MAX_PHOTOS = 40; // photos loaded per visit, spread across the rows
  var LANG_KEY = "card-lang";
  var LANG_FADE_OUT_MS = 250; // keep in sync with the lang-out/lang-in animations in styles.css
  var LANG_FADE_IN_MS = 450;

  // ---------- Language ----------

  function fill(str) {
    return String(str).split("{name}").join(config.recipient);
  }

  function readLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && config.text[saved]) return saved;
    } catch (e) { /* storage blocked: fall back to default */ }
    return config.defaultLang;
  }

  function applyLang(lang) {
    var t = config.text[lang];
    document.documentElement.lang = lang;
    document.title = fill(t.pageTitle);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = fill(t[el.getAttribute("data-i18n")]);
    });

    var message = document.getElementById("message");
    message.innerHTML = "";
    t.message.forEach(function (line) {
      var p = document.createElement("p");
      p.className = "reveal";
      p.textContent = fill(line);
      message.appendChild(p);
    });
    document.getElementById("signature").textContent = config.sender;

    // The toggle shows the language you would switch TO.
    document.getElementById("lang-toggle").textContent = lang === "vi" ? "EN" : "VI";
    updateViewLabel();
    staggerReveal();
  }

  function setupLangToggle() {
    var lang = readLang();
    applyLang(lang);
    var switching = false;
    document.getElementById("lang-toggle").addEventListener("click", function () {
      if (switching) return;
      switching = true;
      lang = lang === "vi" ? "en" : "vi";
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* not critical */ }

      // Fade the old text out, swap it while invisible, then fade the new text in.
      var body = document.body;
      var card = document.getElementById("card");
      body.classList.add("lang-out");
      setTimeout(function () {
        var from = card.offsetHeight;
        applyLang(lang);
        animateSize(card, "height", from);
        body.classList.remove("lang-out");
        body.classList.add("lang-in");
        setTimeout(function () {
          body.classList.remove("lang-in");
          card.style.height = ""; // back to natural height
          switching = false;
        }, LANG_FADE_IN_MS);
      }, LANG_FADE_OUT_MS);
    });
  }

  // CSS cannot transition width/height:auto, so animate between measured pixel
  // sizes. `from` is the size measured before the content changed.
  function animateSize(el, prop, from) {
    var measure = prop === "width" ? "offsetWidth" : "offsetHeight";
    el.style[prop] = "";
    var to = el[measure];
    el.style[prop] = from + "px";
    void el[measure]; // commit the start size before changing it
    el.style[prop] = to + "px";
  }

  // Each card line fades in a little after the previous one.
  function staggerReveal() {
    document.querySelectorAll("#card .reveal").forEach(function (el, i) {
      el.style.transitionDelay = (0.9 + i * 0.35) + "s";
    });
  }

  // ---------- Envelope ----------

  function setupEnvelope() {
    var envelope = document.getElementById("envelope");
    envelope.addEventListener("click", function () {
      if (document.body.classList.contains("is-opening")) return;
      document.body.classList.add("is-opening");
      // Show the card once the flap has opened and the letter has risen.
      setTimeout(function () { document.body.classList.add("is-open"); }, 1300);
    });
  }

  // ---------- View photos ----------

  // Label reflects what the button will switch to, in the current language.
  function updateViewLabel() {
    var t = config.text[document.documentElement.lang];
    var viewing = document.body.classList.contains("is-viewing");
    var button = document.getElementById("view-toggle");
    var from = button.offsetWidth;
    button.textContent = viewing ? t.viewCard : t.viewPhotos;
    animateSize(button, "width", from);
  }

  function setupViewToggle() {
    var button = document.getElementById("view-toggle");
    // Once the resize finishes, let the button size itself to its label again.
    button.addEventListener("transitionend", function (e) {
      if (e.propertyName === "width") button.style.width = "";
    });
    button.addEventListener("click", function () {
      document.body.classList.toggle("is-viewing");
      updateViewLabel();
    });
  }

  // ---------- Photo wall ----------

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function buildRow(rowPhotos, index) {
    var tiles = rowPhotos.slice();
    while (tiles.length < MIN_PER_ROW) tiles = tiles.concat(rowPhotos);

    var row = document.createElement("div");
    row.className = "photo-row" + (index % 2 ? " is-reverse" : "");
    var track = document.createElement("div");
    track.className = "photo-track";
    // ~5s per tile keeps the drift slow regardless of how many photos there are.
    track.style.animationDuration = tiles.length * 5 + "s";

    // The track holds the sequence twice; animating to -50% loops seamlessly.
    tiles.concat(tiles).forEach(function (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      track.appendChild(img);
    });

    row.appendChild(track);
    return row;
  }

  function buildPhotoWall(photos) {
    if (!photos.length) return;
    var wall = document.getElementById("photo-wall");
    // A random subset per visit keeps the download small on phones while
    // still showing different photos each time the card is opened.
    var picked = shuffle(photos).slice(0, MAX_PHOTOS);
    for (var i = 0; i < ROWS; i++) {
      var rowPhotos = picked.filter(function (_, k) { return k % ROWS === i; });
      wall.appendChild(buildRow(rowPhotos.length ? rowPhotos : picked, i));
    }
    wall.classList.add("is-ready");
  }

  function loadPhotos() {
    // photos.json is generated by scripts/build-photos-manifest.mjs (locally or in CI).
    fetch("photos.json", { cache: "no-cache" })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (list) { buildPhotoWall(Array.isArray(list) ? list : []); })
      .catch(function () { /* no manifest: keep the plain gradient background */ });
  }

  setupLangToggle();
  setupEnvelope();
  setupViewToggle();
  loadPhotos();
})();
