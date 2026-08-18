/* -------------------------------------------------------------- */
/*  Public site behaviour.                                          */
/*                                                                  */
/*  Everything the React components did on the client, rewritten as  */
/*  plain DOM code: scroll reveals, the navbar, carousels, the FAQ   */
/*  accordion, the theme toggle and the rest. Each block reads the   */
/*  markup it drives through data- attributes, so a page that        */
/*  doesn't contain a widget simply skips it.                        */
/* -------------------------------------------------------------- */

import Lenis from "lenis";

const EASE_DELAY = (i, step) => `${(i * step).toFixed(3)}s`;
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------- scroll reveals ------------------------ */

/**
 * `<Reveal>` / `<RevealGroup>` / `<RevealItem>` in one observer.
 *
 * A group gets `.is-in` once, and its items' per-child delay is written as a
 * CSS variable — the same cascade motion's `staggerChildren` produced.
 */
function initReveals() {
  const groups = document.querySelectorAll("[data-reveal-group]");
  groups.forEach((group) => {
    const stagger = Number(group.dataset.stagger || 0.08);
    group.querySelectorAll("[data-reveal-item]").forEach((item, i) => {
      item.style.setProperty("--reveal-delay", EASE_DELAY(i, stagger));
    });
  });

  const targets = document.querySelectorAll(
    "[data-reveal], [data-reveal-group], [data-reveal-item], .word-reveal, .title-sweep",
  );
  if (targets.length === 0) return;

  if (reduced()) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    // Mirrors viewport={{ margin: "0px 0px -12% 0px" }} on the React side.
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );

  targets.forEach((el) => {
    // An item inside a group is driven by the group, not on its own.
    if (el.matches("[data-reveal-item]") && el.closest("[data-reveal-group]")) return;
    observer.observe(el);
  });
}

/** Split a headline into per-word masked spans and stagger them in. */
function initWordReveals() {
  document.querySelectorAll(".word-reveal").forEach((el) => {
    const text = el.dataset.text ?? el.textContent ?? "";
    const words = text.split(" ").filter(Boolean);
    const delay = Number(el.dataset.delay || 0);
    const stagger = Number(el.dataset.stagger || 0.055);

    el.setAttribute("aria-label", text);
    el.textContent = "";

    words.forEach((word, i) => {
      const mask = document.createElement("span");
      mask.setAttribute("aria-hidden", "true");
      const inner = document.createElement("span");
      inner.style.setProperty("--word-delay", `${(delay + i * stagger).toFixed(3)}s`);
      inner.textContent = word;
      mask.appendChild(inner);
      el.appendChild(mask);
      // The space goes between the masks, not inside one: a trailing space at
      // the end of an inline-block is trimmed, which runs the words together.
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });
}

/* -------------------------- hero entrance ------------------------ */

function initHero() {
  const items = document.querySelectorAll("[data-hero-item]");
  items.forEach((el, i) => {
    el.style.setProperty("--reveal-delay", EASE_DELAY(i, 0.09));
  });
  document.querySelectorAll("[data-float-card]").forEach((el) => {
    el.style.setProperty("--reveal-delay", `${el.dataset.delay || 0}s`);
  });

  // Everything above the fold plays on load rather than on intersection.
  requestAnimationFrame(() => {
    document
      .querySelectorAll("[data-hero-item], [data-float-card]")
      .forEach((el) => el.classList.add("is-in"));
  });

  // Cursor spotlight behind the hero copy.
  const hero = document.querySelector("[data-hero]");
  if (hero) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--sx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--sy", `${e.clientY - r.top}px`);
    });
  }
}

/**
 * The hero's parallax: background scale, content drift and fade as you scroll
 * past it — motion's `useScroll` + `useTransform`, done with one rAF-throttled
 * scroll listener.
 */
function initHeroParallax() {
  const hero = document.querySelector("[data-hero]");
  if (!hero || reduced()) return;

  const bg = hero.querySelector("[data-hero-bg]");
  const content = hero.querySelector("[data-hero-content]");
  const floats = hero.querySelector("[data-hero-floats]");
  if (!bg && !content && !floats) return;

  let ticking = false;
  const apply = () => {
    ticking = false;
    const height = hero.offsetHeight || 1;
    // 0 at the top of the hero, 1 once it has scrolled entirely away.
    const p = Math.min(1, Math.max(0, window.scrollY / height));
    if (bg) bg.style.transform = `scale(${(1 + p * 0.12).toFixed(4)})`;
    if (content) {
      content.style.transform = `translateY(${(p * 80).toFixed(2)}px)`;
      content.style.opacity = String(Math.max(0, 1 - p / 0.8));
    }
    if (floats) floats.style.transform = `translateY(${(p * 140).toFixed(2)}px)`;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    },
    { passive: true },
  );
  apply();
}

/* ----------------------------- navbar ---------------------------- */

function initNavbar() {
  const header = document.querySelector("[data-navbar]");
  if (!header) return;

  const shell = header.querySelector("[data-nav-shell]");
  const ring = header.querySelector("[data-nav-ring]");
  const glow = header.querySelector("[data-nav-glow]");
  const progress = header.querySelector("[data-nav-progress]");
  const links = [...header.querySelectorAll("[data-nav-link]")];
  const indicator = header.querySelector("[data-nav-indicator]");
  const dot = header.querySelector("[data-nav-dot]");
  const toggle = header.querySelector("[data-nav-toggle]");
  const sheet = header.querySelector("[data-nav-sheet]");
  const scrim = header.querySelector("[data-nav-scrim]");
  const burger = header.querySelector("[data-burger]");

  requestAnimationFrame(() => header.classList.add("is-in"));

  /* --- scrolled state + reading progress --- */
  const SCROLLED = [
    "bg-[linear-gradient(120deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04)_38%,rgba(138,92,255,0.32)_64%,rgba(255,255,255,0.12))]",
    "shadow-[0_18px_50px_-16px_rgba(0,0,0,0.9)]",
  ];
  const RESTING = [
    "bg-[linear-gradient(120deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.08))]",
  ];

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    const scrolled = y > 24;

    if (ring) {
      ring.classList.toggle("shadow-[0_18px_50px_-16px_rgba(0,0,0,0.9)]", scrolled);
      SCROLLED.forEach((c) => ring.classList.toggle(c, scrolled));
      RESTING.forEach((c) => ring.classList.toggle(c, !scrolled));
    }
    if (shell) {
      shell.classList.toggle("bg-bg-2/85", scrolled);
      shell.classList.toggle("saturate-150", scrolled);
      shell.classList.toggle("bg-bg-2/45", !scrolled);
    }
    if (glow) glow.classList.toggle("opacity-0", !scrolled);
    if (glow) glow.classList.toggle("opacity-100", scrolled);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      progress.classList.toggle("opacity-0", !scrolled);
      progress.classList.toggle("opacity-100", scrolled);
    }
  };
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true },
  );
  onScroll();

  /* --- the sliding pill + dot (motion's shared `layoutId`) --- */
  let activeHref = header.dataset.activeHref || "";

  function moveIndicator(href, { instant = false } = {}) {
    const link = links.find((l) => l.dataset.navLink === href);
    if (!indicator) return;
    if (!link) {
      indicator.style.opacity = "0";
      return;
    }
    const list = indicator.parentElement;
    if (!list) return;
    const a = link.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    if (instant) indicator.style.transition = "none";
    indicator.style.opacity = "1";
    indicator.style.width = `${a.width}px`;
    indicator.style.transform = `translateX(${a.left - b.left}px)`;
    if (instant) {
      // Flush the untransitioned position before restoring the animation.
      void indicator.offsetWidth;
      indicator.style.transition = "";
    }
  }

  function moveDot(href) {
    const link = links.find((l) => l.dataset.navLink === href);
    if (!dot) return;
    if (!link) {
      dot.style.opacity = "0";
      return;
    }
    const list = dot.parentElement;
    if (!list) return;
    const a = link.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    dot.style.opacity = "1";
    dot.style.transform = `translateX(${a.left - b.left + a.width / 2 - 2}px)`;
  }

  function setActive(href) {
    activeHref = href;
    links.forEach((l) => {
      const on = l.dataset.navLink === href;
      l.classList.toggle("text-ink", on);
      l.classList.toggle("text-ink-2", !on);
      if (on) l.setAttribute("aria-current", "page");
      else l.removeAttribute("aria-current");
    });
    moveIndicator(href);
    moveDot(href);
  }

  links.forEach((link) => {
    link.addEventListener("mouseenter", () => moveIndicator(link.dataset.navLink));
    link.addEventListener("focus", () => moveIndicator(link.dataset.navLink));
    link.addEventListener("blur", () => moveIndicator(activeHref));
    link.addEventListener("click", () => setActive(link.dataset.navLink));
  });
  const list = indicator?.parentElement;
  if (list) list.addEventListener("mouseleave", () => moveIndicator(activeHref));

  if (activeHref) requestAnimationFrame(() => setActive(activeHref));
  window.addEventListener("resize", () => {
    moveIndicator(activeHref, { instant: true });
    moveDot(activeHref);
  });

  /* --- scroll spy: only the landing page has the section anchors --- */
  if (header.dataset.spy === "1") {
    const sections = links
      .map((l) => l.dataset.navLink)
      .filter((href) => href && href.startsWith("#"))
      .map((href) => ({ href, el: document.querySelector(href) }))
      .filter((s) => s.el);

    if (sections.length > 0) {
      const spy = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible) return;
          const match = sections.find((s) => s.el === visible.target);
          if (match) setActive(match.href);
        },
        { rootMargin: "-18% 0px -58%", threshold: [0.01, 0.2, 0.5] },
      );
      sections.forEach((s) => spy.observe(s.el));
    }
  }

  /* --- mobile sheet --- */
  let open = false;
  function setOpen(next) {
    open = next;
    if (!sheet || !scrim) return;
    toggle?.setAttribute("aria-expanded", String(open));
    sheet.classList.toggle("hidden", !open);
    scrim.classList.toggle("hidden", !open);
    burger?.classList.toggle("is-open", open);
    if (open) requestAnimationFrame(() => sheet.classList.add("is-in"));
    else sheet.classList.remove("is-in");
  }

  toggle?.addEventListener("click", () => setOpen(!open));
  scrim?.addEventListener("click", () => setOpen(false));
  sheet?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open) setOpen(false);
  });
}

/* -------------------------- smooth scroll ------------------------ */

function initSmoothScroll() {
  if (reduced()) return;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5,
  });
  window.__lenis = lenis;

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // In-page anchors scroll smoothly, offset for the fixed navbar.
  document.addEventListener("click", (e) => {
    const anchor = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!anchor) return;
    const hash = anchor.getAttribute("href");
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    window.history.pushState(null, "", hash);
    const scrollTarget = target.querySelector("[data-scroll-target]") ?? target;
    lenis.scrollTo(scrollTarget, { offset: -88, duration: 1.2 });
  });
}

/* --------------------------- preloader --------------------------- */

function initPreloader() {
  const el = document.querySelector("[data-preloader]");
  if (!el) return;

  let skip = reduced();
  try {
    skip = skip || Boolean(sessionStorage.getItem("tk_loaded"));
  } catch {
    /* storage blocked — just play the intro */
  }

  requestAnimationFrame(() => el.classList.add("is-ready"));
  document.documentElement.style.overflow = "hidden";

  window.setTimeout(
    () => {
      try {
        sessionStorage.setItem("tk_loaded", "1");
      } catch {
        /* storage blocked — the curtain still lifts */
      }
      el.classList.add("is-out");
      document.documentElement.style.overflow = "";
      window.setTimeout(() => el.remove(), 800);
    },
    skip ? 0 : 1500,
  );
}

/* ------------------------ counters (stats) ----------------------- */

function initCounters() {
  const nodes = document.querySelectorAll("[data-counter]");
  if (nodes.length === 0) return;

  const run = (el) => {
    const to = Number(el.dataset.counter || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 2000;
    if (reduced()) {
      el.textContent = `${to.toLocaleString()}${suffix}`;
      return;
    }
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = `${Math.round(to * ease(t)).toLocaleString()}${suffix}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -20% 0px" },
  );
  nodes.forEach((el) => observer.observe(el));
}

/* ---------------------------- carousel --------------------------- */

/**
 * Scroll-snap carousel — the port of components/ui/carousel.tsx.
 *
 * Real overflow scrolling does the work, so touch, trackpad and keyboard all
 * behave natively; the arrows, dots and pointer drag just script scrollLeft.
 */
function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const rail = root.querySelector("[data-carousel-rail]");
    if (!rail) return;

    const dotsWrap = root.querySelector("[data-carousel-dots]");
    const progress = root.querySelector("[data-carousel-progress]");
    const prev = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    const controls = root.querySelector("[data-carousel-controls]");
    const autoPlay = root.dataset.autoplay === "1";
    const intervalMs = Number(root.dataset.interval || 5600);

    let index = 0;
    let stops = 1;
    let paused = false;
    let timer = 0;

    const measure = () => {
      const first = rail.children[0];
      const second = rail.children[1];
      const step =
        first && second
          ? second.offsetLeft - first.offsetLeft
          : (first?.offsetWidth ?? rail.clientWidth);
      const scrollable = rail.scrollWidth - rail.clientWidth;
      const count = step > 0 ? Math.max(1, Math.round(scrollable / step) + 1) : 1;
      return { step: step || 1, count };
    };

    const renderDots = () => {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      if (stops < 2) return;
      for (let i = 0; i < stops; i++) {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.className =
          i === index
            ? "h-1.5 w-8 rounded-full bg-linear-to-r from-brand-2 to-brand-3 shadow-[0_0_12px_2px_rgba(138,92,255,0.5)] transition-all duration-500 ease-out-expo"
            : "h-1.5 w-1.5 rounded-full bg-ink-3/40 transition-all duration-500 ease-out-expo hover:bg-ink-3/70";
        if (i === index) b.setAttribute("aria-current", "true");
        b.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(b);
      }
    };

    const sync = () => {
      const { step, count } = measure();
      stops = count;
      index = Math.min(count - 1, Math.max(0, Math.round(rail.scrollLeft / step)));
      renderDots();
      if (progress) progress.style.width = `${((index + 1) / stops) * 100}%`;
      if (controls) controls.classList.toggle("hidden", stops < 2);
      rail.classList.toggle("cursor-grab", stops > 1);
    };

    function goTo(target) {
      const { step, count } = measure();
      const clamped = ((target % count) + count) % count;
      rail.scrollTo({ left: clamped * step, behavior: "smooth" });
    }

    let frame = 0;
    rail.addEventListener(
      "scroll",
      () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(sync);
      },
      { passive: true },
    );
    new ResizeObserver(sync).observe(rail);
    sync();

    prev?.addEventListener("click", () => goTo(index - 1));
    next?.addEventListener("click", () => goTo(index + 1));

    rail.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      }
    });

    /* --- autoplay, paused by hover, focus, drag and a hidden tab --- */
    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!autoPlay || paused || stops < 2) return;
      timer = window.setInterval(() => goTo(index + 1), intervalMs);
    };
    const setPaused = (v) => {
      paused = v;
      start();
    };

    root.addEventListener("mouseenter", () => setPaused(true));
    root.addEventListener("mouseleave", () => {
      endDrag();
      setPaused(false);
    });
    root.addEventListener("focusin", () => setPaused(true));
    root.addEventListener("focusout", () => setPaused(false));
    document.addEventListener("visibilitychange", () => setPaused(document.hidden));
    start();

    /* --- pointer drag (mouse); touch scrolls natively --- */
    const drag = { active: false, startX: 0, startLeft: 0, moved: 0 };

    rail.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      drag.active = true;
      drag.startX = e.clientX;
      drag.startLeft = rail.scrollLeft;
      drag.moved = 0;
      setPaused(true);
    });
    rail.addEventListener("pointermove", (e) => {
      if (!drag.active) return;
      const delta = e.clientX - drag.startX;
      drag.moved = Math.max(drag.moved, Math.abs(delta));
      rail.scrollLeft = drag.startLeft - delta;
    });
    function endDrag() {
      if (!drag.active) return;
      drag.active = false;
      setPaused(false);
      const { step } = measure();
      goTo(Math.round(rail.scrollLeft / step));
    }
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    // A drag that finishes on a link must not also follow it.
    rail.addEventListener(
      "click",
      (e) => {
        if (drag.moved > 8) {
          e.preventDefault();
          e.stopPropagation();
          drag.moved = 0;
        }
      },
      true,
    );
  });
}

/* ------------------------- image slider -------------------------- */

function initImageSliders() {
  document.querySelectorAll("[data-slider]").forEach((root) => {
    const track = root.querySelector("[data-slider-track]");
    const counter = root.querySelector("[data-slider-counter]");
    const dots = [...root.querySelectorAll("[data-slider-dot]")];
    const thumbs = [...root.querySelectorAll("[data-slider-thumb]")];
    const count = Number(root.dataset.slider || 0);
    if (!track || count === 0) return;

    let index = 0;
    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      if (counter) counter.textContent = `${index + 1} / ${count}`;
      dots.forEach((d, i) => {
        d.className =
          i === index
            ? "h-1.5 w-6 rounded-full bg-white transition-all duration-300"
            : "h-1.5 w-1.5 rounded-full bg-white/40 transition-all duration-300 hover:bg-white/70";
      });
      thumbs.forEach((t, i) => {
        t.classList.toggle("border-brand-2/70", i === index);
        t.classList.toggle("opacity-100", i === index);
        t.classList.toggle("ring-1", i === index);
        t.classList.toggle("ring-brand-2/50", i === index);
        t.classList.toggle("border-white/10", i !== index);
        t.classList.toggle("opacity-55", i !== index);
      });
    };
    const go = (n) => {
      index = (index + n + count) % count;
      render();
    };

    root.querySelector("[data-slider-prev]")?.addEventListener("click", () => go(-1));
    root.querySelector("[data-slider-next]")?.addEventListener("click", () => go(1));
    dots.forEach((d, i) =>
      d.addEventListener("click", () => {
        index = i;
        render();
      }),
    );
    thumbs.forEach((t, i) =>
      t.addEventListener("click", () => {
        index = i;
        render();
      }),
    );
    root.querySelector("[data-slider-stage]")?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });

    render();
  });
}

/* ------------------------- FAQ accordion ------------------------- */

function initAccordions() {
  document.querySelectorAll("[data-accordion]").forEach((root) => {
    const items = [...root.querySelectorAll("[data-accordion-item]")];

    const setOpen = (item, open) => {
      const panel = item.querySelector("[data-accordion-panel]");
      const trigger = item.querySelector("[data-accordion-trigger]");
      const plus = item.querySelector("[data-accordion-plus]");
      const card = item.querySelector("[data-accordion-card]");
      const wash = item.querySelector("[data-accordion-wash]");
      if (!panel || !trigger) return;

      trigger.setAttribute("aria-expanded", String(open));
      panel.style.height = open ? `${panel.scrollHeight}px` : "0px";
      panel.style.opacity = open ? "1" : "0";
      card?.classList.toggle("border-brand-2/35", open);
      wash?.classList.toggle("hidden", !open);
      item.querySelector("[data-accordion-index]")?.classList.toggle("text-brand-3", open);
      item.querySelector("[data-accordion-index]")?.classList.toggle("text-ink-3/50", !open);
      if (plus) {
        plus.classList.toggle("rotate-45", open);
        plus.classList.toggle("border-transparent", open);
        plus.classList.toggle("btn-brand", open);
        plus.classList.toggle("text-white", open);
        plus.classList.toggle("border-white/10", !open);
        plus.classList.toggle("text-ink-2", !open);
      }
    };

    items.forEach((item, i) => {
      const trigger = item.querySelector("[data-accordion-trigger]");
      // The first question opens by default, as `useState(0)` did.
      setOpen(item, i === 0);
      trigger?.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        items.forEach((other) => setOpen(other, false));
        if (!isOpen) setOpen(item, true);
      });
    });

    // A resize changes the measured height of whatever is open.
    window.addEventListener("resize", () => {
      items.forEach((item) => {
        const panel = item.querySelector("[data-accordion-panel]");
        const trigger = item.querySelector("[data-accordion-trigger]");
        if (panel && trigger?.getAttribute("aria-expanded") === "true") {
          panel.style.height = `${panel.scrollHeight}px`;
        }
      });
    });
  });
}

/* --------------------------- legal TOC --------------------------- */

function initLegalToc() {
  const toc = document.querySelector("[data-legal-toc]");
  if (!toc) return;

  const links = [...toc.querySelectorAll("a[href^='#']")];
  const targets = links
    .map((l) => document.getElementById(l.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (targets.length === 0) return;

  const setActive = (id) => {
    links.forEach((l) => {
      const on = l.getAttribute("href") === `#${id}`;
      l.classList.toggle("bg-white/[0.06]", on);
      l.classList.toggle("text-ink", on);
      l.classList.toggle("text-ink-3", !on);
      if (on) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
      const num = l.querySelector("[data-toc-index]");
      num?.classList.toggle("text-brand-3", on);
      num?.classList.toggle("text-ink-3/60", !on);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    },
    { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
  );
  targets.forEach((el) => observer.observe(el));
  setActive(targets[0].id);
}

/* ---------------------- floating page widgets -------------------- */

function initFloatingWidgets() {
  const backToTop = document.querySelector("[data-back-to-top]");
  const ring = backToTop?.querySelector("[data-progress-ring]");
  const sticky = document.querySelector("[data-sticky-cta]");
  const dismiss = sticky?.querySelector("[data-sticky-dismiss]");

  let dismissed = false;
  dismiss?.addEventListener("click", () => {
    dismissed = true;
    sticky?.classList.remove("is-in");
  });

  backToTop?.addEventListener("click", () =>
    window.__lenis
      ? window.__lenis.scrollTo(0, { duration: 1.2 })
      : window.scrollTo({ top: 0, behavior: "smooth" }),
  );

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    backToTop?.classList.toggle("is-in", y > 1200);
    if (!dismissed) sticky?.classList.toggle("is-in", y > 900);
    if (ring) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ring.style.strokeDashoffset = String(1 - (max > 0 ? Math.min(1, y / max) : 0));
    }
  };
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true },
  );
  onScroll();
}

/* --------------------------- theme toggle ------------------------ */

function initThemeToggle() {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const key = button.dataset.storageKey || "tekoovi-theme";
  const sun = button.querySelector("[data-theme-sun]");
  const moon = button.querySelector("[data-theme-moon]");

  const render = () => {
    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    moon?.classList.toggle("hidden", !dark);
    sun?.classList.toggle("hidden", dark);
    button.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    button.setAttribute("title", dark ? "Light mode" : "Dark mode");
  };

  button.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    root.style.colorScheme = next;
    try {
      localStorage.setItem(key, next);
    } catch {
      /* storage blocked — the in-memory toggle still works for this visit */
    }
    render();
  });

  render();
}

/* ------------------------- pointer effects ----------------------- */

/** GlowCard: a cursor-following spotlight driven by two CSS variables. */
function initGlowCards() {
  document.querySelectorAll("[data-glow-card]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/** TiltCard: a small springy tilt with a glare that tracks the pointer. */
function initTiltCards() {
  if (reduced()) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = Number(card.dataset.tilt || 7);
    const glare = card.querySelector("[data-tilt-glare]");

    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(1200px) rotateX(${((0.5 - py) * 2 * max).toFixed(2)}deg) rotateY(${((px - 0.5) * 2 * max).toFixed(2)}deg)`;
      if (glare) {
        glare.style.background = `radial-gradient(420px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.14), transparent 60%)`;
      }
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

/** Magnetic buttons drift toward the pointer, then spring back. */
function initMagnetic() {
  if (reduced()) return;

  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
      el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      el.style.transition = "transform 0.08s linear";
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = "translate(0px, 0px)";
    });
  });
}

/* ----------------------------- boot ------------------------------ */

function boot() {
  initPreloader();
  initWordReveals();
  initReveals();
  initHero();
  initHeroParallax();
  initNavbar();
  initSmoothScroll();
  initCounters();
  initCarousels();
  initImageSliders();
  initAccordions();
  initLegalToc();
  initFloatingWidgets();
  initThemeToggle();
  initGlowCards();
  initTiltCards();
  initMagnetic();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
