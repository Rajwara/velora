(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Mobile / overflow menu ----------
  const toggle = document.getElementById("menuToggle");
  const toggleIcon = toggle.querySelector("use");

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggleIcon.setAttribute("href", open ? "#i-close" : "#i-menu");
  }

  toggle.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ---------- Models dropdown (click support for touch) ----------
  const dropdown = document.querySelector(".dropdown");
  const dropdownBtn = dropdown.querySelector("button");
  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = dropdown.classList.toggle("is-open");
    dropdownBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", () => {
    dropdown.classList.remove("is-open");
    dropdownBtn.setAttribute("aria-expanded", "false");
  });

  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Animated counters ----------
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = target.toFixed(decimals); return; }
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    }
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

  // ---------- Stacked model cards: shrink cards as the next one covers them ----------
  const cards = Array.from(document.querySelectorAll(".model-card"));
  const timeline = document.getElementById("timeline");
  let ticking = false;

  function onScroll() {
    const vh = window.innerHeight;

    if (!reduceMotion) {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const cardTop = card.getBoundingClientRect().top;
        const nextTop = next.getBoundingClientRect().top;
        const covered = Math.min(Math.max(1 - (nextTop - cardTop) / card.offsetHeight, 0), 1);
        card.style.transform = `scale(${1 - covered * 0.06})`;
        card.style.filter = `brightness(${1 - covered * 0.45})`;
      });
    }

    // Timeline progress line
    const rect = timeline.getBoundingClientRect();
    const progress = Math.min(Math.max((vh * 0.6 - rect.top) / rect.height, 0), 1);
    timeline.style.setProperty("--progress", `${progress * 100}%`);

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // ---------- Hide broken images gracefully ----------
  document.querySelectorAll("img").forEach((img) => {
    const hide = () => { img.style.visibility = "hidden"; };
    if (img.complete && img.naturalWidth === 0) hide();
    else img.addEventListener("error", hide, { once: true });
  });

  // ---------- Footer year ----------
  document.getElementById("year").textContent = new Date().getFullYear();
})();
