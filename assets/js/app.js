/* =====================================================================
   app.js  —  rendering + interactie. Je hoeft dit meestal niet te wijzigen.
   ===================================================================== */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const ITEMS = Array.isArray(window.THUMBNAILS) ? window.THUMBNAILS : [];
  const CREATORS = Array.isArray(window.CREATORS) ? window.CREATORS : [];
  const REVIEWS = Array.isArray(window.REVIEWS) ? window.REVIEWS : [];
  const BEFORE_AFTER = Array.isArray(window.BEFORE_AFTER) ? window.BEFORE_AFTER : [];
  const FAQ = Array.isArray(window.FAQ) ? window.FAQ : [];

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* ---------- Taal (NL/EN) ---------- */
  const I18N = window.I18N || {};
  let lang = SITE.defaultLang || "nl";

  // Haalt een vertaalde vaste tekst op, bijv. t("nav.werk").
  function t(key) {
    const read = (dict) => {
      let node = dict;
      const parts = key.split(".");
      for (let i = 0; i < parts.length; i += 1) {
        if (node && typeof node === "object" && parts[i] in node) node = node[parts[i]];
        else return undefined;
      }
      return node;
    };
    const val = read(I18N[lang]);
    if (val != null) return val;
    const fallback = read(I18N.nl);
    return fallback != null ? fallback : key;
  }

  // Geeft de juiste taalwaarde terug. Een waarde is een platte tekst (zelfde
  // in beide talen) of een object { nl: "...", en: "..." }.
  function L(value) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (value[lang] != null) return value[lang];
      if (value.nl != null) return value.nl;
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i += 1) {
        if (value[keys[i]] != null) return value[keys[i]];
      }
      return "";
    }
    return value == null ? "" : value;
  }

  // Past alle vaste teksten in de pagina aan op de gekozen taal: de
  // data-i18n-attributen, de meta-omschrijving en de taalknop.
  function applyI18nStatic() {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const val = t(node.getAttribute("data-i18n"));
      if (val != null) node.textContent = val;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.setAttribute("title", t(node.getAttribute("data-i18n-title")));
    });

    const label = document.getElementById("langLabel");
    if (label) label.textContent = lang.toUpperCase();
    const menu = document.getElementById("themeMenu");
    if (menu) menu.setAttribute("data-label", t("theme.menuTitle"));
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      const theme = themeById(currentTheme);
      themeToggle.title = t("theme.choose") + ": " + (theme.label || theme.id);
    }

    const desc = t("meta.description");
    const metaDesc = document.getElementById("metaDescription");
    if (metaDesc) metaDesc.setAttribute("content", desc);
    const ogDesc = document.getElementById("ogDescription");
    if (ogDesc) ogDesc.setAttribute("content", desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", (SITE.name || "Portfolio") + " — " + (SITE.role || "Portfolio"));
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", lang === "en" ? "en_US" : "nl_NL");
    document.title = (SITE.name || "Portfolio") + " — " + (SITE.role || "Portfolio");
  }

  // Wisselt (of zet bij het laden) de taal en hertekent alles wat van de
  // taal afhangt. "save" bewaart de keuze van de bezoeker.
  function applyLang(next, save) {
    lang = next;
    if (save) {
      try { localStorage.setItem("md-lang", lang); } catch (e) {}
    }
    applyI18nStatic();
    fillSite();
    renderStats();
    renderFilters();
    renderGrid();
    renderCreators();
    renderReviews();
    renderFaq();
    updateDiscordTexts();
    animateCounters();
  }

  function bindLangToggle(langs) {
    const btn = document.getElementById("langToggle");
    if (!btn) return;
    if (!Array.isArray(langs) || langs.length < 2) {
      btn.hidden = true;
      return;
    }
    btn.addEventListener("click", () => {
      const idx = langs.indexOf(lang);
      const next = langs[(idx + 1) % langs.length];
      applyLang(next, true);
    });
  }

  /* ---------- Thema's ---------- */
  const THEMES = Array.isArray(window.THEMES) && window.THEMES.length
    ? window.THEMES
    : [{ id: "standaard", label: "Standaard", emoji: "🎨", symbols: ["✦"] }];
  const themeAccents = {};
  let currentTheme = "standaard";

  function themeById(id) {
    return THEMES.find((t) => t.id === id) || THEMES[0];
  }

  // Kiest op basis van de datum een seizoens-thema (zie SITE.seasonal in data.js).
  function seasonalTheme() {
    const list = Array.isArray(SITE.seasonal) ? SITE.seasonal : null;
    if (!list || !list.length) return null;
    const now = new Date();
    const md =
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const hit = list.find((s) => s && s.from && s.to && md >= s.from && md <= s.to);
    return hit && hit.theme ? hit.theme : null;
  }

  // Kiest één thema per week (zie SITE.themeOfWeek in data.js). Stabiel binnen
  // dezelfde week, verandert automatisch de volgende week.
  function weeklyTheme() {
    const cfg = SITE.themeOfWeek || {};
    if (!cfg.enabled) return null;
    const all = THEMES.map((t) => t.id);
    const list = Array.isArray(cfg.themes) && cfg.themes.length
      ? cfg.themes.filter((id) => all.indexOf(id) !== -1)
      : all.slice();
    if (!list.length) return null;
    const offset = Number(cfg.offset) || 0;
    const week = Math.floor(Date.now() / 604800000); // weken sinds 1970
    const idx = (((week + offset) % list.length) + list.length) % list.length;
    return list[idx];
  }

  // Leest de accentkleur van een thema uit de CSS (zonder zichtbare flits).
  function readAccent(id) {
    const root = document.documentElement;
    const prev = root.getAttribute("data-theme");
    root.setAttribute("data-theme", id);
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
    if (prev === null) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", prev);
    return accent || "#09a9ff";
  }

  // Vult de achtergrondlaag met de figuurtjes van het gekozen thema.
  // Elk figuurtje valt naar beneden, wiegt heen en weer en twinkelt zachtjes.
  // Met "diepte" krijgen verder weg staande figuurtjes een kleinere maat,
  // minder felheid en een lichte blur, zodat de regen gelaagd en levendig voelt.
  function buildFx() {
    const layer = document.getElementById("fxLayer");
    if (!layer) return;
    layer.innerHTML = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const theme = themeById(currentTheme);
    const symbols = Array.isArray(theme.symbols) && theme.symbols.length ? theme.symbols : [];
    if (!symbols.length) return;

    const count = 48;
    for (let i = 0; i < count; i += 1) {
      const depth = Math.pow(Math.random(), 1.6); // 0 = dichtbij, 1 = ver weg
      const size = 30 - depth * 19;               // 30px dichtbij .. 11px ver
      const opacity = 1 - depth * 0.55;           // vager naarmate ze verder weg staan
      const blur = depth * 1.5;                   // lichte dieptewerking

      const particle = el("span", "fx-particle");
      particle.style.setProperty("--x", Math.random() * 100 + "vw");
      particle.style.setProperty("--drift", (Math.random() * 160 - 80).toFixed(1) + "px");
      particle.style.setProperty("--delay", (Math.random() * -30).toFixed(2) + "s");
      particle.style.setProperty("--duration", (14 + depth * 14 + Math.random() * 8).toFixed(2) + "s");

      const symbol = el("span", "fx-symbol", symbols[i % symbols.length]);
      symbol.style.setProperty("--size", size.toFixed(1) + "px");
      symbol.style.setProperty("--op", opacity.toFixed(2));
      symbol.style.setProperty("--blur", blur.toFixed(2) + "px");
      symbol.style.setProperty("--sway", (6 + Math.random() * 26).toFixed(1) + "px");
      symbol.style.setProperty("--spin", Math.round(Math.random() * 50 - 25) + "deg");
      symbol.style.setProperty("--sway-dur", (2.4 + Math.random() * 2.6).toFixed(2) + "s");
      symbol.style.setProperty("--sway-delay", (Math.random() * -4).toFixed(2) + "s");
      symbol.style.setProperty("--twinkle-dur", (1.8 + Math.random() * 2.4).toFixed(2) + "s");
      symbol.style.setProperty("--twinkle-delay", (Math.random() * -4).toFixed(2) + "s");

      particle.appendChild(symbol);
      layer.appendChild(particle);
    }
  }

  function applyTheme(id, save) {
    const theme = themeById(id);
    currentTheme = theme.id;
    const root = document.documentElement;
    root.setAttribute("data-theme", theme.id);

    // Feestversiering per thema aan/uit (zie het "decor"-blok in data.js).
    const decor = theme.decor || {};
    root.classList.toggle("decor-lights", !!decor.lights);
    root.classList.toggle("decor-bauble", !!decor.bauble);
    root.classList.toggle("decor-snowcap", !!decor.snowcap);
    root.classList.toggle("decor-ornaments", !!decor.ornaments);
    root.classList.toggle("decor-garland", !!decor.garland);

    if (save) {
      try { localStorage.setItem("md-theme", theme.id); } catch (e) {}
    }

    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.style.setProperty("--swatch", themeAccents[theme.id] || "#09a9ff");
      const emoji = toggle.querySelector(".theme-emoji");
      if (emoji) emoji.textContent = theme.emoji || "🎨";
      toggle.title = t("theme.choose") + ": " + (theme.label || theme.id);
    }
    document.querySelectorAll(".theme-option").forEach((opt) => {
      const on = opt.getAttribute("data-theme-id") === theme.id;
      opt.classList.toggle("is-active", on);
      opt.setAttribute("aria-selected", on ? "true" : "false");
    });
    buildFx();
    buildGarland();
  }

  // Vult de slinger bovenin met de figuurtjes van het actieve thema.
  // Alleen zichtbaar als het thema "garland: true" heeft (zie data.js).
  function buildGarland() {
    const wrap = document.getElementById("themeGarland");
    if (!wrap) return;
    wrap.innerHTML = "";
    const theme = themeById(currentTheme);
    const decor = theme.decor || {};
    if (!decor.garland) return;
    const symbols = Array.isArray(theme.symbols) && theme.symbols.length ? theme.symbols : [theme.emoji || "✦"];
    for (let i = 0; i < 15; i += 1) {
      const bead = el("span", "garland-bead", symbols[i % symbols.length]);
      bead.style.setProperty("--i", i);
      wrap.appendChild(bead);
    }
  }

  /* ---------- Site-info invullen ---------- */
  function fillSite() {
    document.title = (SITE.name || "Portfolio") + " — " + (SITE.role || "Portfolio");

    const setText = (id, value) => {
      const node = document.getElementById(id);
      if (node && value) node.textContent = value;
    };
    document.querySelectorAll("[data-order-link]").forEach((link) => {
      link.href = SITE.orderUrl || "https://discord.gg/StqqMKKeu6";
    });
    setText("brandName", SITE.name);
    setText("footerName", SITE.name);
    setText("heroEyebrow", SITE.role);
    setText("aboutText", L(SITE.about));
    setText("startingPrice", SITE.startingPrice);

    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle && SITE.headline) heroTitle.innerHTML = L(SITE.headline);
    const heroSub = document.getElementById("heroSub");
    if (heroSub && SITE.sub) heroSub.textContent = L(SITE.sub);

    document.getElementById("footerYear").textContent = new Date().getFullYear();

    const feature = document.getElementById("heroFeature");
    if (feature && ITEMS.length) {
      setImage(feature, ITEMS[0]);
      feature.alt = ITEMS[0].alt || ITEMS[0].title || "Thumbnail uit het portfolio";
      setText("heroFeatureTitle", ITEMS[0].title || "Featured thumbnail");
    }

    // Skills
    const skills = document.getElementById("skills");
    if (skills && Array.isArray(SITE.skills)) {
      skills.innerHTML = "";
      SITE.skills.forEach((s) => skills.appendChild(el("li", "chip", L(s))));
    }

    // Checklist
    const checklist = document.getElementById("checklist");
    if (checklist && Array.isArray(SITE.checklist)) {
      checklist.innerHTML = "";
      SITE.checklist.forEach((c) => {
        const li = el("li");
        li.innerHTML = '<span class="check" aria-hidden="true">✓</span><span>' + escapeHtml(L(c)) + "</span>";
        checklist.appendChild(li);
      });
    }

    // Contact-knoppen
    const actions = document.getElementById("contactActions");
    if (actions && Array.isArray(SITE.socials) && SITE.socials.length) {
      actions.innerHTML = "";
      SITE.socials.forEach((s, i) => {
        const a = el("a", "btn " + (i === 0 ? "btn-primary" : "btn-ghost"), L(s.label));
        a.href = s.href;
        if (!s.href.startsWith("mailto:") && !s.href.startsWith("tel:")) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        actions.appendChild(a);
      });
    } else if (actions) {
      const a = el("a", "btn btn-primary", "Mail me");
      a.href = "mailto:" + (SITE.email || "");
      actions.appendChild(a);
    }
  }

  /* ---------- Filters + grid ---------- */
  let activeCategory = "Alle";
  let visible = [];

  function getCategories() {
    const set = [];
    ITEMS.forEach((it) => {
      const c = (it.category || "Overig").trim();
      if (!set.includes(c)) set.push(c);
    });
    return ["Alle"].concat(set);
  }

  function renderFilters() {
    const wrap = document.getElementById("filters");
    if (!wrap) return;
    wrap.innerHTML = "";
    getCategories().forEach((cat) => {
      const label = cat === "Alle" ? t("werk.filterAll") : cat;
      const btn = el("button", "filter" + (cat === activeCategory ? " is-active" : ""), label);
      btn.type = "button";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", cat === activeCategory ? "true" : "false");
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderFilters();
        renderGrid();
      });
      wrap.appendChild(btn);
    });
  }

  function renderGrid() {
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    if (!grid) return;
    grid.innerHTML = "";

    visible = ITEMS.filter(
      (it) => activeCategory === "Alle" || (it.category || "Overig") === activeCategory
    );

    if (empty) empty.hidden = visible.length > 0;

    visible.forEach((item, index) => {
      const card = el("article", "card");
      card.tabIndex = 0;
      card.style.setProperty("--card-delay", (index % 4) * 65 + "ms");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", t("common.view") + ": " + (item.title || ""));

      const media = el("div", "card-media");
      const img = el("img");
      setImage(img, item);
      img.alt = item.alt || item.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);
      media.appendChild(el("span", "card-zoom", t("common.view")));

      const info = el("div", "card-info");
      info.appendChild(el("h3", "card-title", item.title));
      if (item.category) info.appendChild(el("span", "tag", item.category));

      card.appendChild(media);
      card.appendChild(info);
      card.addEventListener("click", () => {
        openLightbox(index);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(index);
        }
      });
      grid.appendChild(card);
    });
  }

  function renderCreators() {
    const grid = document.getElementById("creatorsGrid");
    const empty = document.getElementById("creatorsEmpty");
    if (!grid || !empty) return;
    grid.innerHTML = "";

    empty.hidden = CREATORS.length > 0;
    CREATORS.forEach((creator) => {
      const validUrl = /^https?:\/\//i.test(creator.url || "");
      const card = el(validUrl ? "a" : "article", "creator-card");
      if (validUrl) {
        card.href = creator.url;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
      }

      const avatar = el("span", "creator-avatar", (creator.name || "Creator").slice(0, 2).toUpperCase());
      avatar.setAttribute("aria-hidden", "true");
      if (creator.avatar) {
        const image = el("img");
        image.src = creator.avatar;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.onerror = () => image.remove();
        avatar.appendChild(image);
      }

      const details = el("span", "creator-details");
      details.appendChild(el("strong", null, creator.name || "Creator"));
      if (creator.channel) details.appendChild(el("span", null, creator.channel));
      if (validUrl) details.appendChild(el("span", "creator-view", t("creators.view") + " ↗"));

      card.appendChild(avatar);
      card.appendChild(details);
      grid.appendChild(card);
    });
  }

  function setImage(img, item) {
    img.onerror = function () {
      if (item.fallback && img.src !== item.fallback) {
        img.onerror = null;
        img.src = item.fallback;
      }
    };
    img.src = item.image || item.fallback || "";
  }

  /* ---------- Stats met optellende getallen ---------- */
  function renderStats() {
    const wrap = document.getElementById("stats");
    if (!wrap || !Array.isArray(SITE.stats) || !SITE.stats.length) return;
    wrap.innerHTML = "";
    SITE.stats.forEach((s) => {
      const item = el("div", "stat");
      const strong = el("strong", null, s.value || "");
      strong.setAttribute("data-target", s.value || "");
      item.appendChild(strong);
      item.appendChild(el("span", null, L(s.label)));
      wrap.appendChild(item);
    });
  }

  function animateCounters() {
    const nodes = document.querySelectorAll(".stat strong[data-target]");
    if (!nodes.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = (node) => {
      const raw = node.getAttribute("data-target") || "";
      const match = raw.match(/[\d.,]+/);
      if (reduce || !match) {
        node.textContent = raw;
        return;
      }
      const target = parseFloat(match[0].replace(",", "."));
      const prefix = raw.slice(0, match.index);
      const suffix = raw.slice(match.index + match[0].length);
      const duration = 1400;
      const startTime = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * eased);
        node.textContent = prefix + val + suffix;
        if (p < 1) window.requestAnimationFrame(tick);
        else node.textContent = raw;
      };
      window.requestAnimationFrame(tick);
    };

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(run);
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nodes.forEach((n) => observer.observe(n));
  }

  /* ---------- Voor & na (sleepbare slider) ---------- */
  function renderBeforeAfter() {
    const grid = document.getElementById("beforeAfter");
    const block = document.getElementById("baBlock");
    if (!grid) return;
    if (!BEFORE_AFTER.length) {
      if (block) block.hidden = true;
      return;
    }

    BEFORE_AFTER.forEach((item) => {
      const figure = el("figure", "ba-item");
      const stage = el("div", "ba-stage");
      stage.setAttribute("role", "slider");
      stage.setAttribute("tabindex", "0");
      stage.setAttribute("aria-label", "Voor en na: " + (item.title || "thumbnail"));
      stage.setAttribute("aria-valuemin", "0");
      stage.setAttribute("aria-valuemax", "100");
      stage.setAttribute("aria-valuenow", "50");
      stage.style.setProperty("--pos", "50%");

      const before = el("img", "ba-img ba-before");
      before.alt = "Voor: onbewerkte video-still";
      before.draggable = false;
      if (item.before) {
        before.src = item.before;
      } else {
        before.classList.add("is-simulated");
        setImage(before, { image: item.after, fallback: item.fallback });
      }

      const afterWrap = el("div", "ba-after");
      const after = el("img", "ba-img");
      after.alt = "Na: " + (item.title || "thumbnail");
      after.draggable = false;
      setImage(after, { image: item.after, fallback: item.fallback });
      afterWrap.appendChild(after);

      const handle = el("div", "ba-handle");
      handle.setAttribute("aria-hidden", "true");
      handle.appendChild(el("span", "ba-line"));
      handle.appendChild(el("span", "ba-grip", "↔"));

      stage.appendChild(before);
      stage.appendChild(afterWrap);
      stage.appendChild(handle);
      figure.appendChild(stage);
      if (item.title) figure.appendChild(el("figcaption", "ba-caption", item.title));
      grid.appendChild(figure);

      bindSlider(stage);
    });
  }

  function bindSlider(stage) {
    const setPos = (p) => {
      const clamped = Math.max(0, Math.min(100, p));
      stage.style.setProperty("--pos", clamped + "%");
      stage.setAttribute("aria-valuenow", String(Math.round(clamped)));
    };
    const posFromX = (clientX) => {
      const rect = stage.getBoundingClientRect();
      if (!rect.width) return 50;
      return ((clientX - rect.left) / rect.width) * 100;
    };

    // Automatische demo: de slider wiegt zachtjes heen en weer totdat de
    // bezoeker hem zelf vastpakt. Uit bij "verminder beweging".
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let auto = !reduce;
    let rafId = 0;
    let phase = 0;
    const stopAuto = () => {
      auto = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const demo = () => {
      if (!auto) return;
      phase += 0.014;
      setPos(50 + Math.sin(phase) * 42);
      rafId = window.requestAnimationFrame(demo);
    };

    let dragging = false;
    stage.addEventListener("pointerdown", (e) => {
      stopAuto();
      dragging = true;
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
      setPos(posFromX(e.clientX));
    });
    stage.addEventListener("pointermove", (e) => {
      if (dragging) setPos(posFromX(e.clientX));
    });
    const stop = () => { dragging = false; };
    stage.addEventListener("pointerup", stop);
    stage.addEventListener("pointercancel", stop);
    stage.addEventListener("lostpointercapture", stop);

    stage.addEventListener("keydown", (e) => {
      const current = parseFloat(stage.style.getPropertyValue("--pos")) || 50;
      let next = current;
      if (e.key === "ArrowLeft") next = current - 4;
      else if (e.key === "ArrowRight") next = current + 4;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 100;
      else return;
      e.preventDefault();
      stopAuto();
      setPos(next);
    });

    // Start de demo pas zodra de slider in beeld is.
    if (auto && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (auto && !rafId) rafId = window.requestAnimationFrame(demo);
          } else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        });
      }, { threshold: 0.4 });
      io.observe(stage);
    }
  }

  /* ---------- Reviews (auto-scrollende carrousel) ---------- */
  function renderReviews() {
    const grid = document.getElementById("reviewsGrid");
    const block = document.getElementById("reviewsBlock");
    if (!grid) return;
    grid.innerHTML = "";
    grid.classList.remove("reviews-grid--marquee");
    if (!REVIEWS.length) {
      if (block) block.hidden = true;
      return;
    }

    const makeCard = (review) => {
      const card = el("figure", "review-card");

      const top = el("div", "review-top");
      const avatar = el("span", "review-avatar", (review.name || "?").slice(0, 2).toUpperCase());
      avatar.setAttribute("aria-hidden", "true");
      if (review.avatar) {
        const img = el("img");
        img.src = review.avatar;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.onerror = () => img.remove();
        avatar.appendChild(img);
      }
      const meta = el("div", "review-meta");
      meta.appendChild(el("strong", null, review.name || "Creator"));
      if (review.role) meta.appendChild(el("span", null, review.role));
      top.appendChild(avatar);
      top.appendChild(meta);
      card.appendChild(top);

      const stars = Math.max(0, Math.min(5, review.stars || 5));
      const starsRow = el("div", "review-stars");
      starsRow.setAttribute("role", "img");
      starsRow.setAttribute("aria-label", t("common.starsAria").replace("{n}", stars));
      for (let i = 0; i < 5; i += 1) {
        starsRow.appendChild(el("span", i < stars ? "is-on" : null, "★"));
      }
      card.appendChild(starsRow);
      card.appendChild(el("blockquote", "review-text", L(review.text)));

      if (review.url) {
        const link = el("a", "review-link", t("creators.view") + " ↗");
        link.href = review.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }
      return card;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Statisch raster bij weinig reviews of bij "verminder beweging".
    if (reduce || REVIEWS.length < 2) {
      REVIEWS.forEach((review) => grid.appendChild(makeCard(review)));
      return;
    }

    // Auto-scrollende carrousel: de kaartjes worden gedupliceerd voor een
    // naadloze loop. De beweging pauzeert zodra je eroverheen zweeft/klikt.
    const track = el("div", "reviews-track");
    REVIEWS.forEach((review) => track.appendChild(makeCard(review)));
    REVIEWS.forEach((review) => {
      const clone = makeCard(review);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    grid.classList.add("reviews-grid--marquee");
    grid.appendChild(track);
  }

  /* ---------- FAQ ---------- */
  function renderFaq() {
    const list = document.getElementById("faqList");
    if (!list || !FAQ.length) return;
    list.innerHTML = "";
    FAQ.forEach((item, index) => {
      const details = el("details", "faq-item");
      if (index === 0) details.open = true;
      const summary = el("summary", "faq-q");
      summary.appendChild(el("span", null, L(item.q)));
      summary.appendChild(el("span", "faq-icon"));
      details.appendChild(summary);
      details.appendChild(el("div", "faq-a", L(item.a)));
      list.appendChild(details);
    });
  }

  /* ---------- Kerstverrassing (easter egg) ---------- */
  function bindBauble() {
    const btn = document.getElementById("bauble");
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.classList.remove("is-shaking");
      void btn.offsetWidth;
      btn.classList.add("is-shaking");
      burstConfetti();
    });
  }

  function burstConfetti() {
    const colors = ["#09a9ff", "#68e4fa", "#ffe08a", "#ff667e", "#72e3a1", "#ffffff"];
    const layer = el("div", "confetti-layer");
    layer.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 70; i += 1) {
      const piece = el("span", "confetti-piece");
      piece.style.setProperty("--x", Math.random() * 100 + "vw");
      piece.style.setProperty("--delay", Math.random() * 0.35 + "s");
      piece.style.setProperty("--duration", 1.7 + Math.random() * 1.6 + "s");
      piece.style.setProperty("--spin", Math.round(Math.random() * 900 - 450) + "deg");
      piece.style.setProperty("--color", colors[i % colors.length]);
      piece.style.setProperty("--size", 6 + Math.random() * 7 + "px");
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    window.setTimeout(() => layer.remove(), 3800);
  }

  /* ---------- Cursor glow ---------- */
  function bindCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (!glow) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;

    window.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add("is-active");
    }, { passive: true });

    const loop = () => {
      x += (targetX - x) * 0.14;
      y += (targetY - y) * 0.14;
      glow.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
      window.requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Custom cursor (volgend ringetje) ---------- */
  function bindCursor() {
    const dot = document.getElementById("cursorDot");
    if (!dot) return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    window.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      dot.classList.add("is-active");
      const hit = e.target && e.target.closest
        ? e.target.closest("a, button, .card, .filter, .theme-option, .faq-q, .ba-stage, .review-link")
        : null;
      dot.classList.toggle("is-hover", !!hit);
    }, { passive: true });

    document.addEventListener("pointerdown", () => dot.classList.add("is-down"));
    document.addEventListener("pointerup", () => dot.classList.remove("is-down"));

    const loop = () => {
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      dot.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
      window.requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Loader ---------- */
  function bindLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;
    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      loader.classList.add("is-done");
      window.setTimeout(() => loader.remove(), 700);
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      if (document.readyState === "complete") hide();
      else window.addEventListener("load", hide, { once: true });
    }, reduce ? 0 : 550);
    window.setTimeout(hide, 3500); // veiligheidsnet
  }

  /* ---------- Easter egg (Konami-code) ---------- */
  function bindEasterEgg() {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    document.addEventListener("keydown", (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === seq[pos]) {
        pos += 1;
        if (pos === seq.length) {
          pos = 0;
          runParty();
        }
      } else {
        pos = key === seq[0] ? 1 : 0;
      }
    });
  }

  // Feestje: confetti + het thema fietst even langs alle thema's en keert terug.
  function runParty() {
    const original = currentTheme;
    const ids = THEMES.map((t) => t.id);
    burstConfetti();
    showEggToast("🎉 Easter egg ontgrendeld!");
    let i = 0;
    const timer = window.setInterval(() => {
      applyTheme(ids[i % ids.length], false);
      i += 1;
    }, 350);
    window.setTimeout(() => {
      window.clearInterval(timer);
      applyTheme(original, false);
      burstConfetti();
    }, 3200);
  }

  function showEggToast(text) {
    const toast = el("div", "egg-toast", text);
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4000);
  }

  /* ---------- Terug naar boven ---------- */
  function bindToTop() {
    const btn = document.getElementById("toTop");
    if (!btn) return;
    let scheduled = false;
    const update = () => {
      btn.classList.toggle("is-visible", window.scrollY > 520);
      scheduled = false;
    };
    window.addEventListener("scroll", () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
  }

  /* ---------- Discord-widget met live ledenaantal ---------- */
  let discordInfo = { name: "", count: null };

  // Vult de teksten van de widget in de gekozen taal. Wordt ook opnieuw
  // aangeroepen als de bezoeker van taal wisselt.
  function updateDiscordTexts() {
    const nameNode = document.getElementById("dwName");
    const membersNode = document.getElementById("dwMembers");
    if (nameNode) nameNode.textContent = discordInfo.name || t("discord.server");
    if (membersNode) {
      if (typeof discordInfo.count === "number") {
        const unit = discordInfo.count === 1 ? t("discord.member") : t("discord.members");
        membersNode.textContent = discordInfo.count + " " + unit;
      } else {
        membersNode.textContent = t("discord.join");
      }
    }
  }

  function renderDiscordWidget() {
    const widget = document.getElementById("discordWidget");
    if (!widget) return;
    const membersNode = document.getElementById("dwMembers");
    const icon = document.getElementById("dwIcon");
    const glyph = document.getElementById("dwGlyph");

    if (membersNode) membersNode.textContent = t("discord.loading");

    const code = ((SITE.orderUrl || "").match(/discord\.gg\/([A-Za-z0-9-]+)/) || [])[1];
    if (!code) {
      updateDiscordTexts();
      return;
    }

    if (glyph && icon) {
      icon.onload = () => { icon.hidden = false; glyph.style.display = "none"; };
      icon.onerror = () => { icon.hidden = true; glyph.style.display = ""; };
    }

    fetch("https://discord.com/api/v9/invites/" + code + "?with_counts=true")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("invite"))))
      .then((data) => {
        const guild = data.guild || {};
        if (guild.name) discordInfo.name = guild.name;
        if (typeof data.approximate_member_count === "number") {
          discordInfo.count = data.approximate_member_count;
        }
        updateDiscordTexts();
        if (icon && guild.id && guild.icon) {
          icon.src = "https://cdn.discordapp.com/icons/" + guild.id + "/" + guild.icon + ".png?size=64";
        }
      })
      .catch(() => {
        discordInfo.count = null;
        updateDiscordTexts();
      });
  }

  /* ---------- Thema kiezen ---------- */
  function bindThemePicker() {
    const picker = document.getElementById("themePicker");
    const toggle = document.getElementById("themeToggle");
    const menu = document.getElementById("themeMenu");
    if (!picker || !toggle || !menu) return;

    THEMES.forEach((t) => {
      themeAccents[t.id] = readAccent(t.id);

      const opt = el("button", "theme-option");
      opt.type = "button";
      opt.setAttribute("role", "option");
      opt.setAttribute("data-theme-id", t.id);

      const swatch = el("span", "theme-option-swatch");
      swatch.style.background = themeAccents[t.id] || "var(--accent)";
      opt.appendChild(swatch);
      opt.appendChild(el("span", "theme-option-emoji", t.emoji || "🎨"));
      opt.appendChild(el("span", "theme-option-label", t.label || t.id));

      opt.addEventListener("click", () => {
        switchThemeSoft(t.id, true);
        close();
        toggle.focus();
      });
      menu.appendChild(opt);
    });

    const close = () => {
      picker.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    const open = () => {
      picker.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (picker.classList.contains("is-open")) close();
      else open();
    });
    document.addEventListener("click", (e) => {
      if (picker.classList.contains("is-open") && !picker.contains(e.target)) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && picker.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });

    // Startthema: eerder gekozen thema, anders een seizoens-thema, anders het
    // thema van deze week, anders het standaardthema uit data.js.
    let saved = null;
    try { saved = localStorage.getItem("md-theme"); } catch (e) {}
    const initial = saved || seasonalTheme() || weeklyTheme() || SITE.defaultTheme ||
      document.documentElement.getAttribute("data-theme") || "standaard";
    applyTheme(initial, false);
  }

  // Wisselt van thema met een korte, vloeiende overgang (behalve bij
  // "verminder beweging" of als het thema al actief is).
  function switchThemeSoft(id, save) {
    const flash = document.getElementById("themeFlash");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!flash || reduce || id === currentTheme) {
      applyTheme(id, save);
      return;
    }
    flash.classList.add("is-on");
    window.setTimeout(() => {
      applyTheme(id, save);
      flash.classList.remove("is-on");
    }, 200);
  }

  // Wisselt automatisch van thema zodra er een nieuwe week begint (zie
  // SITE.themeOfWeek in data.js). Heeft de bezoeker zelf een thema gekozen,
  // dan blijft dat gewoon staan en wisselt de site niet meer.
  function startWeeklyRotation() {
    const cfg = SITE.themeOfWeek || {};
    if (!cfg.enabled) return;

    let last = currentTheme;
    // Eén keer per minuut kijken of de week is veranderd. Dat is ruim genoeg
    // voor een wekelijkse wissel en belast de site nauwelijks.
    window.setInterval(() => {
      let saved = null;
      try { saved = localStorage.getItem("md-theme"); } catch (e) {}
      if (saved) return;              // bezoeker koos zelf een thema
      if (document.hidden) return;    // tabblad staat op de achtergrond
      const now = seasonalTheme() || weeklyTheme();
      if (now && now !== last) {
        last = now;
        switchThemeSoft(now, false);
      }
    }, 60000);
  }

  /* ---------- Lightbox ---------- */
  let lbIndex = -1;

  function openLightbox(index) {
    lbIndex = index;
    const lb = document.getElementById("lightbox");
    updateLightbox();
    lb.hidden = false;
    document.body.classList.add("no-scroll");
    document.getElementById("lbClose").focus();
  }

  function updateLightbox() {
    const item = visible[lbIndex];
    if (!item) return;
    const img = document.getElementById("lbImage");
    setImage(img, item);
    img.alt = item.alt || item.title || "";
    document.getElementById("lbTitle").textContent = item.title || "";
    document.getElementById("lbCategory").textContent = item.category || "";

    const link = document.getElementById("lbLink");
    if (item.video) {
      link.href = item.video;
      link.hidden = false;
    } else {
      link.hidden = true;
    }
  }

  /* ---------- Scrollanimaties ---------- */
  function setupMotion() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll(
      ".hero-copy, .hero-art, .hero-note, .starting-price, .stats, .section-head, .filters, " +
      ".over-grid > *, .skills, .about-card, .contact-inner, .contact-actions, .footer-inner, " +
      ".creator-card, .creators-empty, .order-step, .ba-item, .reviews-head, .review-card, .faq-item"
    );
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach((target, index) => {
      target.classList.add("reveal");
      target.style.setProperty("--reveal-delay", (index % 4) * 65 + "ms");
      observer.observe(target);
    });
  }

  function closeLightbox() {
    document.getElementById("lightbox").hidden = true;
    document.body.classList.remove("no-scroll");
    lbIndex = -1;
  }

  function stepLightbox(dir) {
    if (!visible.length) return;
    lbIndex = (lbIndex + dir + visible.length) % visible.length;
    updateLightbox();
  }

  function bindLightbox() {
    document.getElementById("lbClose").addEventListener("click", closeLightbox);
    document.getElementById("lbPrev").addEventListener("click", () => stepLightbox(-1));
    document.getElementById("lbNext").addEventListener("click", () => stepLightbox(1));

    const lb = document.getElementById("lightbox");
    lb.addEventListener("click", (e) => {
      if (e.target === lb) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") stepLightbox(-1);
      else if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  /* ---------- Mobiel menu ---------- */
  function bindNav() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", t("menu"));
    };

    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? t("menuClose") : t("menu"));
    });
    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("click", (event) => {
      if (!menu.classList.contains("is-open")) return;
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  function setupScrollUI() {
    const progress = document.getElementById("scrollProgress");
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const links = document.querySelectorAll(".nav a[href^='#'], .mobile-menu a[href^='#']");
    let scheduled = false;

    const update = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) {
        const ratio = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
        progress.style.transform = "scaleX(" + ratio + ")";
      }

      const marker = window.scrollY + Math.min(window.innerHeight * 0.36, 280);
      let currentId = sections.length ? sections[0].id : "home";
      sections.forEach((section) => {
        if (section.offsetTop <= marker) currentId = section.id;
      });

      links.forEach((link) => {
        const active = link.getAttribute("href") === "#" + currentId;
        link.classList.toggle("is-current", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      scheduled = false;
    };

    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    update();
  }

  /* ---------- Speciale datums: sneeuw of confetti ---------- */
  // Kijkt of vandaag binnen een periode uit SITE.dateEffects valt.
  function activeDateEffect() {
    const list = Array.isArray(SITE.dateEffects) ? SITE.dateEffects : null;
    if (!list || !list.length) return null;
    const now = new Date();
    const md =
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    return list.find((d) => d && d.from && d.to && md >= d.from && md <= d.to) || null;
  }

  // Bouwt de extra laag met sneeuw of confetti als er een speciale datum is.
  function setupDateFx() {
    const layer = document.getElementById("dateFx");
    if (!layer) return;
    layer.innerHTML = "";
    const effect = activeDateEffect();
    if (!effect) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const symbols =
      Array.isArray(effect.symbols) && effect.symbols.length ? effect.symbols : ["❄"];
    const isConfetti = effect.effect === "confetti";
    const count = isConfetti ? 40 : 60;

    for (let i = 0; i < count; i += 1) {
      const depth = Math.pow(Math.random(), 1.6);
      const size = (isConfetti ? 24 : 27) - depth * 15;
      const opacity = 1 - depth * 0.5;

      const particle = el("span", "fx-particle");
      particle.style.setProperty("--x", Math.random() * 100 + "vw");
      particle.style.setProperty("--drift", (Math.random() * 200 - 100).toFixed(1) + "px");
      particle.style.setProperty("--delay", (Math.random() * -30).toFixed(2) + "s");
      particle.style.setProperty("--duration", (10 + depth * 12 + Math.random() * 8).toFixed(2) + "s");

      const symbol = el("span", "fx-symbol", symbols[i % symbols.length]);
      symbol.style.setProperty("--size", size.toFixed(1) + "px");
      symbol.style.setProperty("--op", opacity.toFixed(2));
      symbol.style.setProperty("--blur", (depth * 1.2).toFixed(2) + "px");
      symbol.style.setProperty("--particle-color", isConfetti ? "#ffffff" : "#c6ecff");
      symbol.style.setProperty("--sway", (8 + Math.random() * 30).toFixed(1) + "px");
      symbol.style.setProperty("--spin", Math.round(Math.random() * 60 - 30) + "deg");
      symbol.style.setProperty("--sway-dur", (2.2 + Math.random() * 2.6).toFixed(2) + "s");
      symbol.style.setProperty("--sway-delay", (Math.random() * -4).toFixed(2) + "s");
      symbol.style.setProperty("--twinkle-dur", (1.8 + Math.random() * 2.4).toFixed(2) + "s");
      symbol.style.setProperty("--twinkle-delay", (Math.random() * -4).toFixed(2) + "s");

      particle.appendChild(symbol);
      layer.appendChild(particle);
    }
  }

  /* ---------- PWA: service worker (offline) ---------- */
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "http:" && location.protocol !== "https:") return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    // Taal: eerder gekozen taal, anders de standaardtaal uit data.js.
    const langs =
      Array.isArray(SITE.langs) && SITE.langs.length ? SITE.langs : ["nl", "en"];
    let savedLang = null;
    try { savedLang = localStorage.getItem("md-lang"); } catch (e) {}
    lang = langs.indexOf(savedLang) !== -1 ? savedLang : SITE.defaultLang || langs[0];

    bindLightbox();
    bindNav();
    bindBauble();
    bindToTop();
    bindLangToggle(langs);
    bindThemePicker();
    startWeeklyRotation();
    setupDateFx();
    applyLang(lang, false); // vult alle teksten en dynamische onderdelen
    renderBeforeAfter();
    setupMotion();
    setupScrollUI();
    bindCursorGlow();
    bindCursor();
    bindLoader();
    bindEasterEgg();
    renderDiscordWidget();
    registerServiceWorker();
  });
})();
