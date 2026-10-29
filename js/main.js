(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;

  // ---------- Drawer menu ----------
  // (Each block checks its elements exist, so this file works on every page.)
  const toggles = Array.from(document.querySelectorAll("[data-menu-toggle]"));
  const drawer = document.getElementById("drawer");

  function setMenu(open) {
    if (!drawer) return;
    body.classList.toggle("nav-open", open);
    body.classList.toggle("no-scroll", open);
    toggles.forEach((t) => t.setAttribute("aria-expanded", String(open)));
  }

  if (drawer) {
    toggles.forEach((t) => t.addEventListener("click", () => setMenu(!body.classList.contains("nav-open"))));
    document.getElementById("drawerBackdrop").addEventListener("click", () => setMenu(false));
    document.getElementById("drawerClose").addEventListener("click", () => setMenu(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  // ---------- Header dropdowns (Fleet, Services): hover on desktop, caret button for touch/keyboard ----------
  const dropdowns = Array.from(document.querySelectorAll(".site-header .dropdown"));

  function closeDropdowns(except) {
    dropdowns.forEach((d) => {
      if (d === except) return;
      d.classList.remove("is-open");
      d.querySelector(".nav-caret").setAttribute("aria-expanded", "false");
    });
  }

  dropdowns.forEach((d) => {
    const caret = d.querySelector(".nav-caret");
    caret.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !d.classList.contains("is-open");
      closeDropdowns(d);
      d.classList.toggle("is-open", open);
      caret.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", () => closeDropdowns());
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    setMenu(false);
    closeDropdowns();
  });

  // ---------- Floating header: appears once the banner has scrolled away ----------
  const floatHeader = document.getElementById("floatHeader");
  const heroCard = document.querySelector(".hero-card");
  if (floatHeader && heroCard) {
    let shown = false;
    const update = () => {
      const show = heroCard.getBoundingClientRect().bottom < 80;
      if (show === shown) return;
      shown = show;
      floatHeader.classList.toggle("is-visible", show);
      floatHeader.inert = !show;
      if (!show) closeDropdowns();
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

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
      const shown = cards.filter((card) => !card.hidden);
      shown.forEach((card, i) => {
        const next = shown[i + 1];
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

  // ---------- Page transitions ----------
  // Fade to the brand colour before leaving for another page of the site.
  if (!reduceMotion) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !/\.html$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return; // same-page anchor
      e.preventDefault();
      body.classList.add("is-leaving");
      setTimeout(() => { location.href = url.href; }, 380);
    });
    // Coming back via the browser's back button restores the page from cache
    window.addEventListener("pageshow", (e) => { if (e.persisted) body.classList.remove("is-leaving"); });
  }

  // ---------- Magnetic buttons ----------
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
        setTimeout(() => { el.style.transition = ""; }, 500);
      });
    });
  }

  // ---------- Chip filters (shared by fleet and blog) ----------
  function setupChips(container, onChange) {
    const chips = Array.from(container.querySelectorAll(".chip"));
    const select = (value) => {
      chips.forEach((chip) => {
        const on = chip.dataset.filter === value;
        chip.classList.toggle("is-active", on);
        chip.setAttribute("aria-pressed", String(on));
      });
      onChange(value);
    };
    chips.forEach((chip) => chip.addEventListener("click", () => select(chip.dataset.filter)));
    return select;
  }

  // ---------- Fleet filter + search ----------
  const fleetStack = document.getElementById("fleetStack");
  if (fleetStack) {
    const fleetCards = Array.from(fleetStack.querySelectorAll(".model-card"));
    const search = document.getElementById("fleetSearch");
    const empty = document.getElementById("fleetEmpty");
    const params = new URLSearchParams(location.search);
    let marque = "all";

    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let count = 0;
      fleetCards.forEach((card) => {
        const match = (marque === "all" || card.dataset.marque === marque)
          && (!q || card.dataset.search.toLowerCase().includes(q));
        const wasHidden = card.hidden;
        card.hidden = !match;
        if (match) {
          count++;
          card.classList.add("is-visible");
          if (wasHidden) {
            card.classList.remove("is-filtered-in");
            void card.offsetWidth; // restart the animation
            card.classList.add("is-filtered-in");
          }
        }
      });
      empty.hidden = count > 0;
      onScroll();
    };

    const selectMarque = setupChips(document.querySelector(".page-fleet .chips"), (value) => { marque = value; apply(); });
    search.addEventListener("input", apply);

    if (params.get("q")) search.value = params.get("q");
    selectMarque(params.get("marque") || "all");
  }

  // ---------- Journal: category, tag and search filters ----------
  const blogPosts = document.getElementById("blogPosts");
  if (blogPosts) {
    const posts = Array.from(blogPosts.querySelectorAll(".post"));
    const featured = document.getElementById("blogFeatured");
    const search = document.getElementById("blogSearch");
    const status = document.getElementById("blogStatus");
    const empty = document.getElementById("blogEmpty");
    const tagLinks = Array.from(document.querySelectorAll(".tag-cloud .tag-link"));
    const params = new URLSearchParams(location.search);
    const state = {
      category: (params.get("category") || "all").toLowerCase(),
      tag: (params.get("tag") || "").toLowerCase(),
      q: params.get("q") || "",
    };
    search.value = state.q;

    const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const apply = (updateUrl) => {
      const q = state.q.trim().toLowerCase();
      const filtering = state.category !== "all" || state.tag || q;
      let count = 0;
      posts.forEach((post) => {
        const match = (state.category === "all" || post.dataset.category === state.category)
          && (!state.tag || post.dataset.tags.split("|").includes(state.tag))
          && (!q || post.dataset.search.toLowerCase().includes(q));
        // Without a filter the featured article is shown above the grid instead
        const show = match && (filtering || !post.hasAttribute("data-featured"));
        post.classList.toggle("is-hidden", !show);
        if (show) {
          count++;
          post.classList.remove("is-filtered-in");
          void post.offsetWidth;
          post.classList.add("is-visible", "is-filtered-in");
        }
      });
      featured.hidden = Boolean(filtering);
      empty.hidden = count > 0;
      tagLinks.forEach((link) => link.classList.toggle("is-current", link.dataset.tag === state.tag));

      if (filtering) {
        const parts = [];
        if (state.category !== "all") parts.push(`in <strong>${escapeHtml(state.category)}</strong>`);
        if (state.tag) parts.push(`tagged <strong>#${escapeHtml(state.tag)}</strong>`);
        if (q) parts.push(`matching <strong>"${escapeHtml(state.q.trim())}"</strong>`);
        status.innerHTML = `<span>${count} article${count === 1 ? "" : "s"} ${parts.join(", ")}</span> <button type="button" class="link-btn" data-clear-blog>Clear filters</button>`;
      }
      status.hidden = !filtering;

      if (updateUrl) {
        const next = new URLSearchParams();
        if (state.category !== "all") next.set("category", state.category);
        if (state.tag) next.set("tag", state.tag);
        if (q) next.set("q", state.q.trim());
        history.replaceState(null, "", `${location.pathname}${next.toString() ? `?${next}` : ""}`);
      }
    };

    const selectCategory = setupChips(document.getElementById("blogChips"), (value) => { state.category = value; apply(true); });
    search.closest("form").addEventListener("submit", (e) => { e.preventDefault(); state.q = search.value; apply(true); });
    search.addEventListener("input", () => { state.q = search.value; apply(true); });
    tagLinks.forEach((link) => link.addEventListener("click", (e) => {
      e.preventDefault();
      state.tag = state.tag === link.dataset.tag ? "" : link.dataset.tag;
      apply(true);
      document.getElementById("articles").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }));
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-clear-blog]")) return;
      state.tag = ""; state.q = ""; search.value = "";
      selectCategory("all");
    });

    // Initial state from the URL (e.g. links from an article's tags)
    const chip = document.querySelector(`#blogChips .chip[data-filter="${CSS.escape(state.category)}"]`);
    if (!chip) state.category = "all";
    selectCategory(state.category);
    if (state.category !== "all" || state.tag || state.q) {
      requestAnimationFrame(() => document.getElementById("articles").scrollIntoView());
    }
  }

  // ---------- Article: copy link ----------
  document.querySelectorAll("[data-share]").forEach((button) => {
    const label = button.firstChild;
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        label.textContent = "Link Copied ";
      } catch (err) {
        label.textContent = "Copy failed ";
      }
      button.classList.add("is-copied");
      setTimeout(() => { label.textContent = "Copy Link "; button.classList.remove("is-copied"); }, 2000);
    });
  });

  // ---------- Packages & plans ----------
  const planToggle = document.querySelector(".plan-toggle");
  if (planToggle) {
    const buttons = Array.from(planToggle.querySelectorAll(".plan-toggle-btn"));
    const grids = Array.from(document.querySelectorAll("[data-plans]"));

    const countUp = (grid) => {
      grid.querySelectorAll(".plan-amount").forEach((el) => {
        const target = Number(el.dataset.amount);
        if (reduceMotion) { el.textContent = target.toLocaleString("en-US"); return; }
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / 900, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))).toLocaleString("en-US");
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };

    buttons.forEach((button) => button.addEventListener("click", () => {
      const show = button.dataset.show;
      planToggle.dataset.active = show;
      buttons.forEach((b) => {
        b.classList.toggle("is-active", b === button);
        b.setAttribute("aria-selected", String(b === button));
      });
      grids.forEach((grid) => {
        grid.hidden = grid.dataset.plans !== show;
        if (!grid.hidden) countUp(grid);
      });
    }));

    // Count the visible prices up the first time the section is seen
    if ("IntersectionObserver" in window) {
      const po = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        po.disconnect();
        countUp(grids.find((g) => !g.hidden));
      }, { threshold: 0.3 });
      po.observe(document.querySelector(".plan-panels"));
    }

    // Spotlight follows the cursor
    document.querySelectorAll(".plan-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  // ---------- Road trips carousel ----------
  const tripsTrack = document.getElementById("tripsTrack");
  if (tripsTrack) {
    const bar = document.getElementById("tripsBar");
    const step = () => (tripsTrack.querySelector(".trip-card").offsetWidth + 24);
    const updateBar = () => {
      const max = tripsTrack.scrollWidth - tripsTrack.clientWidth;
      const visible = tripsTrack.clientWidth / tripsTrack.scrollWidth;
      const p = max > 0 ? visible + (1 - visible) * (tripsTrack.scrollLeft / max) : 1;
      bar.style.setProperty("--p", p.toFixed(3));
    };
    tripsTrack.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();

    const scrollByCards = (dir) => tripsTrack.scrollBy({ left: dir * step(), behavior: reduceMotion ? "auto" : "smooth" });
    document.querySelector(".trips-prev").addEventListener("click", () => scrollByCards(-1));
    document.querySelector(".trips-next").addEventListener("click", () => scrollByCards(1));
    tripsTrack.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); scrollByCards(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); scrollByCards(-1); }
    });

    // Drag to scroll with a mouse (touch devices scroll natively)
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    tripsTrack.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      startX = e.clientX;
      startScroll = tripsTrack.scrollLeft;
      tripsTrack.setPointerCapture(e.pointerId);
    });
    tripsTrack.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) tripsTrack.classList.add("is-dragging");
      tripsTrack.scrollLeft = startScroll - dx;
    });
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      tripsTrack.classList.remove("is-dragging");
      // Settle on the nearest card
      tripsTrack.scrollTo({ left: Math.round(tripsTrack.scrollLeft / step()) * step(), behavior: "smooth" });
    };
    tripsTrack.addEventListener("pointerup", endDrag);
    tripsTrack.addEventListener("pointercancel", endDrag);
  }

  // ---------- Contact form ----------
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const params = new URLSearchParams(location.search);
    const topicFields = Array.from(contactForm.querySelectorAll("[data-topic]"));
    const setTopic = (topic) => {
      topicFields.forEach((el) => { el.hidden = el.dataset.topic !== topic; });
    };
    contactForm.querySelectorAll('input[name="topic"]').forEach((radio) => {
      radio.addEventListener("change", () => setTopic(radio.value));
    });

    // Prefill from links such as contact.html?car=bmw-m5 or ?service=tyres
    let topic = params.get("topic");
    if (params.get("car")) { topic = "rental"; contactForm.car.value = params.get("car"); }
    if (params.get("service")) { topic = "service"; contactForm.service.value = params.get("service"); }
    if (topic && contactForm.querySelector(`input[name="topic"][value="${topic}"]`)) {
      contactForm.querySelector(`input[name="topic"][value="${topic}"]`).checked = true;
      setTopic(topic);
    }

    const error = document.getElementById("formError");
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const required = Array.from(contactForm.querySelectorAll("[required]"));
      let firstInvalid = null;
      required.forEach((field) => {
        const ok = field.checkValidity();
        const target = field.type === "checkbox" ? field.closest(".consent") : field;
        target.classList.toggle("is-invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
      });
      error.hidden = !firstInvalid;
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Demo only: connect this to your booking system or a form service.
      Array.from(contactForm.children).forEach((child) => {
        if (child.id !== "formSuccess") child.hidden = true;
      });
      document.getElementById("formSuccess").hidden = false;
    });
    contactForm.addEventListener("input", (e) => {
      const field = e.target;
      if (field.checkValidity && field.checkValidity()) {
        (field.type === "checkbox" ? field.closest(".consent") : field).classList.remove("is-invalid");
      }
    });
  }

  // ---------- Map, loaded only after consent ----------
  const mapLoad = document.getElementById("mapLoad");
  if (mapLoad) {
    mapLoad.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.title = "Map showing the Velora studio in Munich";
      frame.loading = "lazy";
      frame.src = "https://www.openstreetmap.org/export/embed.html?bbox=11.578%2C48.158%2C11.595%2C48.167&layer=mapnik&marker=48.1625%2C11.5866";
      const box = document.getElementById("mapConsent");
      box.innerHTML = "";
      box.appendChild(frame);
    });
  }

  // ---------- FAQ accordion ----------
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    const content = item.querySelector(".faq-body");
    summary.addEventListener("click", (e) => {
      if (reduceMotion) return;
      e.preventDefault();
      if (item.open) {
        const anim = content.animate([{ height: `${content.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0 }], { duration: 350, easing: "ease-out" });
        anim.onfinish = () => { item.open = false; };
      } else {
        item.open = true;
        content.animate([{ height: "0px", opacity: 0 }, { height: `${content.offsetHeight}px`, opacity: 1 }], { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
      }
    });
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

  // ---------- Rental steps: photo follows the cursor ----------
  const mediaSteps = Array.from(document.querySelectorAll(".step--media"));
  if (mediaSteps.length && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const preview = document.createElement("div");
    preview.className = "cursor-preview";
    preview.setAttribute("aria-hidden", "true");
    preview.innerHTML = '<div class="cursor-preview-inner"><img alt=""><span class="cursor-preview-label"></span></div>';
    document.body.appendChild(preview);
    const previewImg = preview.querySelector("img");
    const previewLabel = preview.querySelector(".cursor-preview-label");
    const inner = preview.querySelector(".cursor-preview-inner");

    // Smoothly trail the pointer and tilt with horizontal speed
    const target = { x: innerWidth / 2, y: innerHeight / 2 };
    const pos = { ...target };
    let tilt = 0;
    let raf = 0;
    let active = false;

    const place = () => {
      const w = preview.offsetWidth;
      const h = preview.offsetHeight;
      const ease = reduceMotion ? 1 : 0.14;
      const dx = target.x - pos.x;
      pos.x += dx * ease;
      pos.y += (target.y - pos.y) * ease;
      tilt += ((reduceMotion ? 0 : Math.max(-12, Math.min(12, dx * 0.06))) - tilt) * 0.12;
      // Sit up and to the left of the cursor, kept inside the window
      const x = Math.min(Math.max(pos.x - w - 28, 12), innerWidth - w - 12);
      const y = Math.min(Math.max(pos.y - h / 2, 12), innerHeight - h - 12);
      preview.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      inner.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
      if (active || Math.abs(dx) > 0.5) raf = requestAnimationFrame(place);
      else raf = 0;
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(place); };

    mediaSteps.forEach((step) => {
      const src = step.querySelector(".step-media img").getAttribute("src");
      const title = step.querySelector("h3").textContent;
      step.addEventListener("pointerenter", (e) => {
        if (!active) { pos.x = target.x = e.clientX; pos.y = target.y = e.clientY; }
        if (previewImg.getAttribute("src") !== src) {
          previewImg.src = src;
          preview.classList.remove("is-swapping");
          void preview.offsetWidth;
          if (active) preview.classList.add("is-swapping");
        }
        previewLabel.textContent = title;
        active = true;
        preview.classList.add("is-active");
        start();
      });
      step.addEventListener("pointermove", (e) => { target.x = e.clientX; target.y = e.clientY; start(); });
      step.addEventListener("pointerleave", (e) => {
        // Stay open when moving straight onto the next step card
        const next = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".step--media");
        if (next) return;
        active = false;
        preview.classList.remove("is-active");
      });
    });
  }

  // ---------- Rental steps: tap to reveal the photo on touch screens ----------
  document.querySelectorAll(".step--media").forEach((step) => {
    step.addEventListener("click", () => {
      if (window.matchMedia("(hover: hover)").matches) return;
      const on = !step.classList.contains("is-touched");
      document.querySelectorAll(".step--media.is-touched").forEach((s) => s.classList.remove("is-touched"));
      step.classList.toggle("is-touched", on);
    });
  });

  // ---------- Light / dark theme switch ----------
  const themeSwitch = document.getElementById("themeSwitch");
  if (themeSwitch) {
    const root = document.documentElement;
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const label = themeSwitch.querySelector(".theme-switch-label");

    const sync = () => {
      const light = root.dataset.theme === "light";
      themeSwitch.setAttribute("aria-pressed", String(light));
      themeSwitch.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
      label.textContent = light ? "Dark mode" : "Light mode";
      if (themeMeta) themeMeta.content = light ? "#f6ece1" : "#080904";
    };

    const apply = (light) => {
      if (light) root.dataset.theme = "light";
      else delete root.dataset.theme;
      try { localStorage.setItem("velora-theme", light ? "light" : "dark"); } catch (e) { /* storage blocked */ }
      sync();
    };

    themeSwitch.addEventListener("click", () => {
      const light = root.dataset.theme !== "light";
      if (reduceMotion) { apply(light); return; }

      // Circular reveal from the button where the View Transitions API exists
      if (document.startViewTransition) {
        const r = themeSwitch.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const transition = document.startViewTransition(() => apply(light));
        transition.ready.then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
          );
        }).catch(() => {});
        return;
      }

      // Fallback: a short colour cross-fade
      root.classList.add("theme-changing");
      apply(light);
      setTimeout(() => root.classList.remove("theme-changing"), 550);
    });

    sync();
  }

  // ---------- Footer year ----------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
