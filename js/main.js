(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // ---------- Drawer menu ----------
  // (Each block checks its elements exist, so this file works on every page.)
  const toggle = document.getElementById("menuToggle");
  const drawer = document.getElementById("drawer");

  function setMenu(open) {
    if (!drawer) return;
    body.classList.toggle("nav-open", open);
    body.classList.toggle("no-scroll", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  if (toggle && drawer) {
    toggle.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
    document.getElementById("drawerBackdrop").addEventListener("click", () => setMenu(false));
    document.getElementById("drawerClose").addEventListener("click", () => setMenu(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  // ---------- Models dropdown ----------
  const dropdown = document.querySelector(".dropdown");
  const dropdownBtn = dropdown && dropdown.querySelector("button");

  function setDropdown(open) {
    if (!dropdown) return;
    dropdown.classList.toggle("is-open", open);
    dropdownBtn.setAttribute("aria-expanded", String(open));
  }

  if (dropdown) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setDropdown(!dropdown.classList.contains("is-open"));
    });
    document.addEventListener("click", () => setDropdown(false));
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setMenu(false);
    setDropdown(false);
  });

  // ---------- Split headings into words ----------
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (child.tagName !== "BR") walk(child);
          return;
        }
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const word = document.createElement("span");
          const inner = document.createElement("span");
          word.className = "word";
          inner.style.setProperty("--i", i++);
          inner.textContent = part;
          word.appendChild(inner);
          frag.appendChild(word);
        });
        child.replaceWith(frag);
      });
    };
    walk(el);
    el.classList.remove("reveal");
    el.classList.add("split");
  }
  document.querySelectorAll(".section-title, .about-lead").forEach(splitWords);

  // ---------- Stagger siblings in grids ----------
  document.querySelectorAll(".stats, .why-grid, .timeline, .posts, .footer-right, .footer-menus, .works-row").forEach((group) => {
    group.querySelectorAll(":scope > .reveal, :scope > .reveal-once").forEach((el, i) => {
      el.style.setProperty("--d", `${i * 0.12}s`);
    });
  });

  // ---------- Infinite testimonial columns ----------
  document.querySelectorAll(".reviews-col").forEach((col) => {
    const track = document.createElement("div");
    track.className = "reviews-track";
    while (col.firstChild) track.appendChild(col.firstChild);
    Array.from(track.children).forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    col.appendChild(track);
  });

  // ---------- Services tabs ----------
  const tabList = document.querySelector(".tabs-menu");
  if (tabList) {
    const tabs = Array.from(tabList.querySelectorAll(".tab"));
    const panes = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
    const OUT = reduceMotion ? 0 : 150;
    let current = tabs.findIndex((tab) => tab.classList.contains("is-active"));
    let timer;

    panes.forEach((pane) => {
      pane.querySelectorAll(".features li").forEach((li, i) => li.style.setProperty("--i", i));
    });

    function showTab(i, focus) {
      if (i === current) return;
      const prev = panes[current];
      const next = panes[i];

      tabs.forEach((tab, k) => {
        const active = k === i;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      if (focus) tabs[i].focus();
      tabs[i].scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });

      clearTimeout(timer);
      panes.forEach((pane) => { if (pane !== prev) { pane.hidden = true; pane.classList.remove("is-visible"); } });
      prev.classList.remove("is-visible");
      timer = setTimeout(() => {
        prev.hidden = true;
        next.hidden = false;
        requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add("is-visible")));
      }, OUT);
      current = i;
    }

    tabs.forEach((tab, i) => tab.addEventListener("click", () => showTab(i)));

    // Links like index.html#service-pane-3 (from the Services page) open that tab
    const openFromHash = () => {
      const i = panes.findIndex((pane) => `#${pane.id}` === location.hash);
      if (i < 0) return;
      showTab(i);
      document.getElementById("services").scrollIntoView();
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    tabList.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        showTab((current + keys[e.key] + tabs.length) % tabs.length, true);
      } else if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        showTab(e.key === "Home" ? 0 : tabs.length - 1, true);
      }
    });
  }

  // ---------- Before & after slider ----------
  const baSlider = document.getElementById("baSlider");
  if (baSlider) {
    // Replace with your own before/after photo pairs
    const PAIRS = [
      { before: "https://images.pexels.com/photos/6872162/pexels-photo-6872162.jpeg?auto=compress&w=1600",
        after: "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&w=1600" },
      { before: "https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg?auto=compress&w=1600",
        after: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&w=1600" },
    ];
    const beforeImg = baSlider.querySelector(".ba-before");
    const afterImg = baSlider.querySelector(".ba-after");
    const handle = baSlider.querySelector(".ba-handle");
    let pos = 50;
    let pair = 0;
    let dragging = false;

    const setPos = (pct) => {
      pos = Math.max(0, Math.min(100, pct));
      baSlider.style.setProperty("--pos", `${pos}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(pos)));
    };
    const fromPointer = (e) => {
      const r = baSlider.getBoundingClientRect();
      setPos(((e.clientX - r.left) / r.width) * 100);
    };
    // Glide the divider to a position (used for the intro hint and pair changes)
    const glideTo = (pct, done) => {
      if (reduceMotion) { setPos(pct); if (done) done(); return; }
      baSlider.classList.add("is-animating");
      setPos(pct);
      setTimeout(() => { baSlider.classList.remove("is-animating"); if (done) done(); }, 800);
    };

    baSlider.addEventListener("pointerdown", (e) => {
      dragging = true;
      baSlider.classList.remove("is-animating");
      baSlider.classList.add("is-dragging");
      baSlider.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    baSlider.addEventListener("pointermove", (e) => { if (dragging) fromPointer(e); });
    ["pointerup", "pointercancel"].forEach((type) => baSlider.addEventListener(type, () => {
      dragging = false;
      baSlider.classList.remove("is-dragging");
    }));

    handle.addEventListener("keydown", (e) => {
      const steps = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
      if (e.key in steps) { e.preventDefault(); setPos(pos + steps[e.key]); }
      else if (e.key === "Home") { e.preventDefault(); setPos(0); }
      else if (e.key === "End") { e.preventDefault(); setPos(100); }
    });

    const loadPair = (i) => {
      pair = (i + PAIRS.length) % PAIRS.length;
      baSlider.classList.add("is-fading");
      setTimeout(() => {
        beforeImg.src = PAIRS[pair].before;
        afterImg.src = PAIRS[pair].after;
        setPos(50);
        baSlider.classList.remove("is-fading");
      }, reduceMotion ? 0 : 300);
    };
    document.querySelector(".ba-prev").addEventListener("click", () => loadPair(pair - 1));
    document.querySelector(".ba-next").addEventListener("click", () => loadPair(pair + 1));

    // First time the slider is seen, sweep the divider to show it can be dragged
    if ("IntersectionObserver" in window && !reduceMotion) {
      const hint = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        hint.disconnect();
        setTimeout(() => glideTo(25, () => glideTo(75, () => glideTo(50))), 600);
      }, { threshold: 0.6 });
      hint.observe(baSlider);
    }
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll(".reveal, .reveal-once, .split");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Animated counters ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const duration = 2000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  // ---------- Scroll-driven effects ----------
  const heroMedia = document.querySelector(".hero-media");
  const cards = Array.from(document.querySelectorAll(".model-card"));
  const timeline = document.getElementById("timeline");
  const steps = timeline ? Array.from(timeline.querySelectorAll(".step")) : [];
  const progressBar = document.querySelector(".scroll-progress");
  const toTop = document.getElementById("toTop");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;

    progressBar.style.setProperty("--p", docH > 0 ? y / docH : 0);
    toTop.classList.toggle("is-visible", y > vh);

    if (!reduceMotion) {
      // Hero parallax
      if (heroMedia && y < vh * 1.2) heroMedia.style.transform = `translateY(${y * 0.3}px)`;

      // Stacked cards shrink and dim as the next one slides over
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const covered = Math.min(Math.max(1 - (next.getBoundingClientRect().top - card.getBoundingClientRect().top) / card.offsetHeight, 0), 1);
        card.style.transform = `scale(${1 - covered * 0.06})`;
        card.style.filter = `brightness(${1 - covered * 0.5})`;
      });
    }

    // Timeline progress line + active steps
    if (timeline) {
      const rect = timeline.getBoundingClientRect();
      const line = vh * 0.6;
      const progress = Math.min(Math.max((line - rect.top) / rect.height, 0), 1);
      timeline.style.setProperty("--progress", `${progress * 100}%`);
      steps.forEach((step) => step.classList.toggle("is-active", step.getBoundingClientRect().top + 40 < line));
    }

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // ---------- Hide broken images gracefully ----------
  document.querySelectorAll("img").forEach((img) => {
    const hide = () => { img.style.visibility = "hidden"; };
    if (img.complete && img.naturalWidth === 0) hide();
    img.addEventListener("error", hide);
    img.addEventListener("load", () => { img.style.visibility = ""; });
  });

  // ---------- Priority booking form (demo: hook up your own endpoint) ----------
  const subscribeForm = document.getElementById("subscribeForm");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      subscribeForm.hidden = true;
      document.getElementById("subscribeMessage").hidden = false;
    });
  }

  // ---------- Footer year ----------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
