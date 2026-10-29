(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // ---------- Drawer menu ----------
  const toggle = document.getElementById("menuToggle");
  const backdrop = document.getElementById("drawerBackdrop");

  function setMenu(open) {
    body.classList.toggle("nav-open", open);
    body.classList.toggle("no-scroll", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", () => setMenu(!body.classList.contains("nav-open")));
  backdrop.addEventListener("click", () => setMenu(false));
  document.getElementById("drawerClose").addEventListener("click", () => setMenu(false));
  document.querySelectorAll(".drawer a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // ---------- Models dropdown ----------
  const dropdown = document.querySelector(".dropdown");
  const dropdownBtn = dropdown.querySelector("button");

  function setDropdown(open) {
    dropdown.classList.toggle("is-open", open);
    dropdownBtn.setAttribute("aria-expanded", String(open));
  }

  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setDropdown(!dropdown.classList.contains("is-open"));
  });
  document.addEventListener("click", () => setDropdown(false));
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
  document.querySelectorAll(".stats, .why-grid, .timeline, .posts, .footer-grid").forEach((group) => {
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
  const steps = Array.from(timeline.querySelectorAll(".step"));
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
      if (y < vh * 1.2) heroMedia.style.transform = `translateY(${y * 0.3}px)`;

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
    const rect = timeline.getBoundingClientRect();
    const line = vh * 0.6;
    const progress = Math.min(Math.max((line - rect.top) / rect.height, 0), 1);
    timeline.style.setProperty("--progress", `${progress * 100}%`);
    steps.forEach((step) => step.classList.toggle("is-active", step.getBoundingClientRect().top + 40 < line));

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
    else img.addEventListener("error", hide, { once: true });
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();
})();
