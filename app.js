/* eslint-disable no-unused-vars */
/*
  ERP & İş Süreçleri Analizi Portfolyo
  Vanilla JS:
  - Dark/Light mode (localStorage)
  - Mobile drawer menu (hamburger)
  - Smooth scroll improvements + drawer close
  - FAQ accordion
  - Toast notification (setTimeout)
*/

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const html = document.documentElement;
  const nav = $(".nav");

  // ---- Theme ---------------------------------------------------------------
  const THEME_KEY = "erp_portfolio_theme";
  const themeToggle = $("#themeToggle");

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  }

  function applyTheme(theme, { persist } = { persist: false }) {
    html.dataset.theme = theme;
    // aria-pressed is useful for assistive tech to reflect toggle state.
    if (themeToggle) themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    if (persist) localStorage.setItem(THEME_KEY, theme);
  }

  // Apply early-ish on load.
  applyTheme(getPreferredTheme(), { persist: false });

  // ---- Toast ---------------------------------------------------------------
  const toast = $("#toast");
  const toastMsg = $("#toastMsg");
  const toastClose = $("#toastClose");

  let toastTimer = null;

  function showToast(message, durationMs = 2800) {
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.hidden = false;
    toast.classList.add("is-visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
      // Let the transition finish before hiding.
      setTimeout(() => {
        toast.hidden = true;
      }, 220);
    }, durationMs);
  }

  toastClose?.addEventListener("click", () => {
    if (!toast) return;
    toast.classList.remove("is-visible");
    toast.hidden = true;
    if (toastTimer) clearTimeout(toastTimer);
  });

  // ---- Navbar scroll state -------------------------------------------------
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("nav--scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu ---------------------------------------------------------
  const menuToggle = $("#menuToggle");
  const menuClose = $("#menuClose");
  const mobileMenu = $("#mobileMenu");
  const navBackdrop = $("#navBackdrop");

  let lastFocusedEl = null;

  function setDrawerOpen(isOpen) {
    if (!mobileMenu || !navBackdrop || !menuToggle) return;

    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");

    if (isOpen) {
      navBackdrop.hidden = false;
      mobileMenu.hidden = false;
      // Ensure transition triggers reliably.
      requestAnimationFrame(() => mobileMenu.classList.add("is-open"));

      // Prevent background scroll when drawer is open.
      document.body.style.overflow = "hidden";

      lastFocusedEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // Focus close button for quick escape.
      (menuClose || $(".nav__drawerLink", mobileMenu))?.focus?.();
      return;
    }

    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
    lastFocusedEl?.focus?.();

    // Hide after transition for a smoother close.
    setTimeout(() => {
      if (!mobileMenu.classList.contains("is-open")) {
        mobileMenu.hidden = true;
        navBackdrop.hidden = true;
      }
    }, 240);
  }

  function toggleDrawer() {
    if (!mobileMenu) return;
    const isOpen = mobileMenu.classList.contains("is-open");
    setDrawerOpen(!isOpen);
  }

  menuToggle?.addEventListener("click", toggleDrawer);
  menuClose?.addEventListener("click", () => setDrawerOpen(false));
  navBackdrop?.addEventListener("click", () => setDrawerOpen(false));

  // Close on Escape and trap focus lightly inside drawer.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!mobileMenu?.classList.contains("is-open")) return;
    setDrawerOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (!mobileMenu?.classList.contains("is-open")) return;

    const focusables = $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      mobileMenu
    ).filter((el) => el instanceof HTMLElement && !el.hasAttribute("disabled"));

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // ---- Smooth scroll + close drawer on navigation -------------------------
  function isSamePageAnchor(link) {
    if (!(link instanceof HTMLAnchorElement)) return false;
    const href = link.getAttribute("href") || "";
    return href.startsWith("#") && href.length > 1;
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    const link = target?.closest?.("a");
    if (!isSamePageAnchor(link)) return;

    const id = (link.getAttribute("href") || "").slice(1);
    if (!id) return;

    e.preventDefault();
    setDrawerOpen(false);
    scrollToId(id);
  });

  // ---- Accordion -----------------------------------------------------------
  const accordion = $("[data-accordion]");
  const faqButtons = accordion ? $$(".faq__btn", accordion) : [];

  function setFaqOpen(btn, open) {
    const controlsId = btn.getAttribute("aria-controls");
    const region = controlsId ? document.getElementById(controlsId) : null;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (region) region.hidden = !open;
  }

  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      // Single-open behavior keeps the section compact on mobile.
      faqButtons.forEach((b) => setFaqOpen(b, false));
      setFaqOpen(btn, !isOpen);
    });
  });

  // ---- Hook up toast triggers ---------------------------------------------
  $$("#projects [data-toast], #erp [data-toast], footer [data-toast]").forEach((el) => {
    el.addEventListener("click", () => showToast(el.getAttribute("data-toast") || "Bildirim"));
  });

  

  $("#toastDemoBtn")?.addEventListener("click", () => {
    showToast("Mobil menü, tema ve toast aktif. Smooth scroll ile gezinebilirsin.");
  });

  themeToggle?.addEventListener("click", () => {
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next, { persist: true });
    showToast(next === "dark" ? "Koyu tema etkin." : "Açık tema etkin.");
  });

  // ---- Footer year ---------------------------------------------------------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

