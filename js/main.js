/* ============================================================
   Youkti teaser — premium interaction layer
   GSAP + ScrollTrigger: loader, scroll progress, hero entrance,
   cockpit micro-motion, section reveals, counters, marquee,
   CTA shine, footer reveal. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;
  var gsapReady = typeof window.gsap !== 'undefined';
  var hasST = gsapReady && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- Custom cursor (desktop hover-capable only) ---------- */
  function initCursor() {
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine || reduceMotion) return;
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    document.body.classList.add('cursor-active');
    var dotX = gsapReady ? gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' }) : null;
    var dotY = gsapReady ? gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' }) : null;
    var ringX = gsapReady ? gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' }) : null;
    var ringY = gsapReady ? gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' }) : null;
    window.addEventListener('mousemove', function (e) {
      if (dotX) dotX(e.clientX);
      if (dotY) dotY(e.clientY);
      if (ringX) ringX(e.clientX);
      if (ringY) ringY(e.clientY);
    });
    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest('a, button, input, .fdemo, .feature_card, .how_step, .persona_card, .proof_card, .int_chip');
      document.body.classList.toggle('cursor-hovering', !!t);
    });
  }
  initCursor();

  /* ---------- Nav: visible on load + blur/shadow on scroll ---------- */
  var nav = document.querySelector('.nav_wrap');
  var navThreshold = 40;
  if (nav) {
    nav.classList.add('nav-visible');
    function navState() {
      nav.classList.toggle('nav-scrolled', window.scrollY > navThreshold);
    }
    if (!reduceMotion) window.addEventListener('scroll', navState, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector('[data-nav-burger]');
  function closeMobile() { html.classList.remove('nav-open'); if (burger) burger.setAttribute('aria-expanded','false'); }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = html.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobile(); });
    var mobileLinks = document.querySelectorAll('.nav_mobile_link, .nav_mobile_cta');
    mobileLinks.forEach(function (l) { l.addEventListener('click', closeMobile); });
  }

  /* ---------- FAQ accordion ---------- */
  var faqRows = document.querySelectorAll('.faq_row');
  faqRows.forEach(function (row) {
    var q = row.querySelector('.faq_question');
    var a = row.querySelector('.faq_answer');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = row.classList.contains('is-open');
      faqRows.forEach(function (other) {
        other.classList.remove('is-open');
        var oq = other.querySelector('.faq_question');
        var oa = other.querySelector('.faq_answer');
        if (oq) oq.setAttribute('aria-expanded','false');
        if (oa) oa.style.maxHeight = '0px';
      });
      if (!isOpen) {
        row.classList.add('is-open');
        q.setAttribute('aria-expanded','true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- No-GSAP fallback: simple IntersectionObserver reveals ---------- */
  if (!gsapReady || reduceMotion) {
    html.classList.remove('js-anim');
    html.classList.add('js-reveal');
    document.querySelectorAll('[data-anim], .feature_card, .how_step, .persona_card, .proof_card, .tpoint, .section_head, .int_chip, .tstat, .hero_mockup_wrap').forEach(function (el) {
      el.classList.remove('opacity-0');
    });
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
    /* force hero content visible (clears any inline gsap.set opacity) */
    document.querySelectorAll('[data-anim="hero"] .hero_eyebrow, [data-anim="hero"] .hero_heading, [data-anim="hero"] .hero_heading .w, [data-anim="hero"] .hero_subhead, [data-anim="hero"] .aryaprompt, [data-anim="hero"] .hero_ctas').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    /* never leave the loader covering the page in static/reduced-motion mode */
    var loaderStatic = document.querySelector('.loader');
    if (loaderStatic) loaderStatic.style.display = 'none';
    /* dot wave still renders a static frame in reduced-motion / no-GSAP mode */
    initDotWave();
    return;
  }

  html.classList.add('js-anim');
  gsap.registerPlugin(ScrollTrigger);
