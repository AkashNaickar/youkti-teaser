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

  /* ---------- Loader sequence ---------- */
  var loader = document.querySelector('.loader');
  var loaderFill = document.querySelector('.loader_bar_fill');
  if (loader) {
    if (reduceMotion) {
      loader.style.display = 'none';
      heroIn();
    } else {
      var tl = gsap.timeline();
      tl.to(loaderFill, { width: '100%', duration: 0.7, ease: 'power2.inOut' })
        .to('.loader_logo', { opacity: 0, y: -8, duration: 0.25, ease: 'power2.in' }, '+=0.05')
        .to(loader, { opacity: 0, duration: 0.4, ease: 'power2.out', onComplete: function () { loader.style.display = 'none'; } }, '-=0.1');
      /* Kick hero in while loader fades (parallel, faster paint) */
      tl.add(heroIn, '-=0.45');
    }
  } else {
    heroIn();
  }

  /* ---------- Scroll progress bar ---------- */
  if (hasST) {
    gsap.fromTo('.progress_bar',
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        transformOrigin: '0% 50%',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
      }
    );
  }

  /* ---------- Hero entrance (v2: word-split + prompt + floats) ---------- */
  function splitWords() {
    var h = document.querySelector('[data-split]');
    if (!h) return [];
    if (h.querySelector('.w')) return []; /* already split */

    /* snapshot original children BEFORE clearing */
    var original = Array.prototype.slice.call(h.childNodes);
    var words = [];

    /* build a fresh fragment so we never duplicate or mutate live DOM mid-pass */
    var frag = document.createDocumentFragment();

    original.forEach(function (node) {
      if (node.nodeType === 3) {
        /* plain text node */
        node.textContent.split(/(\s+)/).forEach(function (chunk) {
          if (chunk.trim().length === 0) { frag.appendChild(document.createTextNode(chunk)); return; }
          var w = document.createElement('span');
          w.className = 'w';
          var inner = document.createElement('span');
          inner.textContent = chunk;
          w.appendChild(inner);
          frag.appendChild(w);
          words.push(inner);
        });
      } else if (node.nodeType === 1 && node.classList.contains('accent')) {
        /* accent element: preserve its class, wrap its words in .w */
        var accText = node.textContent;
        node.textContent = '';
        accText.split(/(\s+)/).forEach(function (chunk) {
          if (chunk.trim().length === 0) { node.appendChild(document.createTextNode(chunk)); return; }
          var w = document.createElement('span');
          w.className = 'w';
          var inner = document.createElement('span');
          inner.textContent = chunk;
          w.appendChild(inner);
          node.appendChild(w);
          words.push(inner);
        });
        frag.appendChild(node);
      } else {
        /* any other element: keep as-is */
        frag.appendChild(node);
      }
    });

    /* clear once, then append the rebuilt tree */
    h.innerHTML = '';
    h.appendChild(frag);
    return words;
  }
  var wordSpans = splitWords();

  function heroIn() {
    var hero = document.querySelector('[data-anim="hero"]');
    if (!hero) return;
    /* fade the parent H1 in FIRST, then animate the word spans inside it */
    gsap.to(hero.querySelectorAll('.hero_heading'), { opacity: 1, duration: 0.1, ease: 'power1.out' });
    gsap.to(hero.querySelectorAll('.hero_eyebrow'), { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    if (wordSpans.length && !reduceMotion) {
      gsap.fromTo(wordSpans,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.035 });
    } else {
      gsap.to(hero.querySelectorAll('.hero_heading'), { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }
    gsap.to(hero.querySelectorAll('.hero_subhead'), { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.25 });
    gsap.to(hero.querySelectorAll('.aryaprompt'), { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.4 });
    gsap.to(hero.querySelectorAll('.hero_ctas'), { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, delay: 0.5 });
  }
  gsap.set('[data-anim="hero"] .hero_eyebrow', { opacity: 0, y: 20 });
  gsap.set('[data-anim="hero"] .hero_heading', { opacity: 0 });
  gsap.set('[data-anim="hero"] .hero_subhead', { opacity: 0, y: 22 });
  gsap.set('[data-anim="hero"] .aryaprompt', { opacity: 0, y: 24 });
  gsap.set('[data-anim="hero"] .hero_ctas', { opacity: 0, y: 18 });

  /* Safety net: if anything above ever fails, force hero visible */
  function heroVisibilitySafe() {
    var hero = document.querySelector('[data-anim="hero"]');
    if (!hero) return;
    gsap.set(hero.querySelectorAll('.hero_eyebrow, .hero_heading, .hero_subhead, .aryaprompt, .hero_ctas, .hero_heading .w'), { opacity: 1, y: 0, yPercent: 0 });
  }
  window.addEventListener('error', function (e) {
    if (e.message && /gsap|ScrollTrigger|TypeError/i.test(e.message)) heroVisibilitySafe();
  });
  setTimeout(function () {
    var h = document.querySelector('[data-split]');
    if (h && getComputedStyle(h).opacity === '0') heroVisibilitySafe();
  }, 4000);

  /* ---------- Interactive ARYA prompt ---------- */
  function initPrompt() {
    var box = document.querySelector('[data-prompt]');
    if (!box) return;
    var input = box.querySelector('.aryaprompt_input');
    var btn = box.querySelector('.aryaprompt_btn');
    var result = box.querySelector('[data-prompt-result]');
    var done = box.querySelector('[data-prompt-done]');
    var thinking = box.querySelector('.aryaprompt_thinking');
    var busy = false;

    /* Clear any value the browser restored on refresh/back-forward.
       Browsers restore form values at different points (load, pageshow,
       or shortly after), so clear on all of them + a delayed fallback. */
    function clearRestored() { input.value = ''; }
    window.addEventListener('load', clearRestored);
    window.addEventListener('pageshow', clearRestored);
    window.addEventListener('pageshow', function (e) { if (e.persisted) clearRestored(); });
    setTimeout(clearRestored, 0);
    setTimeout(clearRestored, 50);
    setTimeout(clearRestored, 300);

    function run() {
      if (busy) return;
      busy = true;
      result.classList.add('is-active');
      thinking.style.display = 'flex';
      done.style.display = 'none';
      var miniRows = box.querySelectorAll('.ap_mini_row');
      var summary = box.querySelector('.ap_done_summary');
      var t = gsap.timeline();
      t.to(thinking, { opacity: 1, duration: 0.2 })
        .to({}, { duration: 1.4 })
        .call(function () {
          thinking.style.display = 'none';
          done.style.display = 'block';
          done.style.opacity = '1';
          gsap.from(miniRows, { opacity: 0, y: 8, duration: 0.45, stagger: 0.14, ease: 'power2.out', clearProps: 'all' });
          gsap.from(summary, { opacity: 0, y: 6, duration: 0.4, ease: 'power2.out', delay: 0.4, clearProps: 'all' });
          busy = false;
        });
    }

    function submit() {
      var val = (input.value || '').trim();
      var boxEl = input.closest('.aryaprompt_box');
      if (!val) {
        input.placeholder = 'Try: Fintech Series B, opened a US office, Q3…';
        if (boxEl) boxEl.classList.add('is-empty');
        setTimeout(function () { if (boxEl) boxEl.classList.remove('is-empty'); }, 500);
        return;
      }
      if (boxEl) boxEl.classList.remove('is-empty');
      run();
    }
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  }
  initPrompt();

  /* ---------- Hero dot wave (canvas) ---------- */
  function initDotWave() {
    var canvas = document.querySelector('.hero_dotwave');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var spacingX = 34;
    var spacingY = 56;
    var baseAmp = 16;
    var cols = 0, rows = 0;
    var rafId = null;
    var running = false;
    var time = 0;
    var last = null;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = canvas.offsetWidth;
      var h = canvas.offsetHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(8, Math.ceil(w / spacingX));
      rows = Math.max(6, Math.ceil(h / spacingY));
    }

    function draw() {
      var w = canvas.offsetWidth;
      var h = canvas.offsetHeight;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      var breathing = 0.62 + 0.38 * Math.sin(time * 0.5);
      var x0 = spacingX / 2;
      var y0 = spacingY / 2;

      for (var j = 0; j < rows; j++) {
        var t = rows === 1 ? 1 : j / (rows - 1);
        var radius = 1.1 + 1.9 * t;
        var amp = baseAmp * (0.45 + 0.55 * t) * breathing;
        var alpha = (0.18 + 0.18 * t).toFixed(3);
        var yBase = y0 + j * spacingY;
        for (var i = 0; i < cols; i++) {
          var x = x0 + i * spacingX;
          var fx = cols === 1 ? 1 : i / (cols - 1);
          var y = yBase + amp * Math.sin(x * 0.012 + time * 0.9 + j * 0.35);
          var r = Math.round(46 + (242 - 46) * fx);
          var g = Math.round(107 + (60 - 107) * fx);
          var b = Math.round(255 + (139 - 255) * fx);
          ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function tick(now) {
      if (!running) return;
      if (last == null) last = now;
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      draw();
      rafId = requestAnimationFrame(tick);
    }

    resize();
    if (reduceMotion) {
      time = 2;
      draw();
      return;
    }
    running = true;
    rafId = requestAnimationFrame(tick);

    window.addEventListener('resize', resize);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!reduceMotion) {
        running = true;
        last = null;
        rafId = requestAnimationFrame(tick);
      }
    });
  }
  initDotWave();

  /* Hero content: scale up + fade as it scrolls away (hand-off to trust band) */
  var heroContent = document.querySelector('.hero_content');
  if (heroContent && hasST && !reduceMotion) {
    gsap.to(heroContent, {
      y: -60, scale: 0.94, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.section_hero', start: 'top top', end: '60% top', scrub: true }
    });
  }

  /* ---------- Cockpit cinematic reveal ---------- */
  function initCockpitCinematic() {
    var mockup = document.querySelector('[data-anim="mockup"]');
    if (!mockup) return;

    /* wrapper visible, inner elements hidden */
    gsap.set(mockup, { opacity: 1 });
    gsap.set('.browser_chrome', { opacity: 0, y: 20 });
    gsap.set('.cockpit_side', { x: -40, opacity: 0 });
    gsap.set('.cockpit_main', { opacity: 0 });
    gsap.set('.cockpit_right', { x: 40, opacity: 0 });
    gsap.set('.cockpit_greeting', { opacity: 0, y: 10 });
    gsap.set('.cockpit_title', { opacity: 0, y: 10 });
    gsap.set('.account_row', { opacity: 0, y: 16 });
    gsap.set('.cockpit_arya', { opacity: 0, y: 12 });
    gsap.set('.arya_chip', { opacity: 0, y: 8 });
    gsap.set('.stat_block', { opacity: 0, y: 10 });
    gsap.set('.pill-green', { opacity: 0, scale: 0.8 });
    gsap.set('.spark_bar', { scaleY: 0 });

    if (reduceMotion) {
      gsap.set([
        '.browser_chrome', '.cockpit_side', '.cockpit_main', '.cockpit_right',
        '.cockpit_greeting', '.cockpit_title', '.account_row', '.cockpit_arya',
        '.arya_chip', '.stat_block', '.pill-green', '.spark_bar'
      ], { clearProps: 'all' });
      return;
    }

    var aryaText = document.querySelector('.cockpit_arya .arya_text');
    var originalText = aryaText ? aryaText.textContent.trim() : '';

    var tl = gsap.timeline({ paused: true });

    tl.to('.browser_chrome', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to('.cockpit_side', { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.4)
      .to('.cockpit_main', { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.8)
      .to('.cockpit_right', { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.0)
      .to('.cockpit_greeting', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.4)
      .to('.cockpit_title', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.6)
      .to('.account_row', { opacity: 1, y: 0, duration: 0.5, stagger: 0.25, ease: 'power2.out' }, 2.0)
      .to('.cockpit_arya', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 3.0);

    if (aryaText && originalText) {
      var counter = { v: 0 };
      tl.to(counter, {
        v: originalText.length, duration: 1.5, ease: 'none',
        onStart: function () { aryaText.textContent = ''; },
        onUpdate: function () { aryaText.textContent = originalText.slice(0, Math.round(counter.v)); }
      }, 3.2);
    }

    tl.to('.arya_chip', { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: 'power2.out' }, 4.7)
      .to('.stat_block', { opacity: 1, y: 0, duration: 0.4, stagger: 0.15, ease: 'power2.out' }, 4.5)
      .to('.spark_bar', { scaleY: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(1.7)' }, 5.0)
      .to('.pill-green', { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 5.5);

    if (hasST) {
      ScrollTrigger.create({
        trigger: '.hero_mockup_wrap',
        start: 'top 85%',
        once: true,
        onEnter: function () { tl.play(); }
      });
    } else {
      tl.play();
    }
  }
  initCockpitCinematic();

  /* ---------- Generic section reveals (cards, steps, personas, proof, tpoints) ---------- */
  function batchReveal(selector, opts) {
    var els = document.querySelectorAll(selector);
    if (!els.length) return;
    var o = Object.assign({ y: 34, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, opts || {});
    gsap.to(els, {
      y: 0, opacity: 1, duration: o.duration, ease: o.ease, stagger: o.stagger,
      scrollTrigger: { trigger: els[0].parentElement || els[0], start: o.start || 'top 82%' }
    });
  }
  gsap.set('.feature_card, .how_step, .persona_card, .proof_card, .tpoint, .section_head, .trust_stats .tstat, .integration_grid .int_chip', { opacity: 0, y: 34 });
  batchReveal('.feature_card');
  batchReveal('.how_step', { stagger: 0.14 });
  batchReveal('.persona_card');
  batchReveal('.proof_card', { stagger: 0.2 });
  batchReveal('.tpoint', { stagger: 0.12 });
  batchReveal('.section_head', { y: 26, duration: 0.6 });
  batchReveal('.trust_stats .tstat', { y: 20, stagger: 0.1 });

  /* ---------- Trust stat counters (single trigger) ---------- */
  var stats = document.querySelectorAll('.tstat_num');
  if (stats.length && !reduceMotion) {
    var statData = [];
    stats.forEach(function (el) {
      var original = el.textContent;
      var numericMatch = original.match(/([\d.,]+)/);
      if (!numericMatch) return;
      var num = parseFloat(numericMatch[0].replace(/,/g, ''));
      var suffix = original.replace(numericMatch[0], '');
      el.dataset.count = num;
      el.textContent = '0' + suffix;
      statData.push({ el: el, num: num, suffix: suffix });
    });
    if (statData.length) {
      ScrollTrigger.create({
        trigger: document.querySelector('.trust_stats'),
        start: 'top 85%',
        once: true,
        onEnter: function () {
          statData.forEach(function (d) {
            var obj = { v: 0 };
            gsap.to(obj, {
              v: d.num, duration: 1.6, ease: 'power2.out',
              onUpdate: function () { d.el.textContent = Math.round(obj.v).toLocaleString() + d.suffix; }
            });
          });
        }
      });
    }
  }

  /* ---------- Integration chips: staggered reveal (grid stays static) ---------- */
  var grid = document.querySelector('.integration_grid');
  if (grid) {
    gsap.fromTo(grid.querySelectorAll('.int_chip'),
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.05,
        scrollTrigger: { trigger: grid, start: 'top 85%' } }
    );
  }

  /* ---------- CTA shine ---------- */
  var ctaCard = document.querySelector('.cta_card');
  if (ctaCard) {
    gsap.from(ctaCard, { scale: 0.96, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: ctaCard, start: 'top 85%' } });
    ctaCard.classList.add('is-shining');
  }

  /* ---------- Feature card mini-demos (Razorpay-style looping boxes) ---------- */
  function initDemoLoops() {
    if (reduceMotion) return;
    var demos = document.querySelectorAll('.fdemo');

    demos.forEach(function (demo) {
      var kind = demo.getAttribute('data-demo');
      if (kind === 'execute') demoExecute(demo);
      else if (kind === 'research') demoResearch(demo);
      else if (kind === 'outreach') demoOutreach(demo);
      else if (kind === 'ci') demoCI(demo);
    });

    /* Execute: rows cascade in, ARYA pops, then reset */
    function demoExecute(root) {
      var rows = root.querySelectorAll('.xrow');
      var arya = root.querySelector('.xarya');
      gsap.set(rows, { opacity: 0, y: 10 });
      gsap.set(arya, { opacity: 0, y: 6 });
      var tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 0.6 });
      tl.to(rows, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.28 })
        .to(arya, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .to({}, { duration: 2.4 })
        .to(rows, { opacity: 0, y: -10, duration: 0.35, ease: 'power2.in', stagger: 0.08 }, '+=0.1')
        .to(arya, { opacity: 0, duration: 0.2 }, '<');
    }

    /* Research: counter counts up, tags pop in staggered, scan sweep */
    function demoResearch(root) {
      var numEl = root.querySelector('.rcount_num');
      var tags = root.querySelectorAll('.rtag');
      var scan = root.querySelector('.rscan');
      gsap.set(tags, { opacity: 0, y: 8 });
      var counter = { v: 0 };
      var tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 0.4 });
      tl.to(counter, {
        v: 104, duration: 1.2, ease: 'power2.out',
        onUpdate: function () { numEl.textContent = Math.round(counter.v); }
      })
        .to(tags, { opacity: 1, y: 0, duration: 0.3, stagger: 0.12 }, '-=0.6');
      tl.to(scan, { y: 120, duration: 0.9, ease: 'power1.inOut' }, '<');
      tl.to({}, { duration: 1.8 });
      tl.set(tags, { opacity: 0, y: 8 }).set(scan, { y: 0 });
    }

    /* Outreach: steps light 1->4, line fills, text types */
    function demoOutreach(root) {
      var dots = root.querySelectorAll('.odot');
      var lines = root.querySelectorAll('.oline');
      var textEl = root.querySelector('.otype_text');
      var msgs = [
        'Hey Sarah — saw Nimbus raised Series B…',
        'Noticed your new CISO hire last month…',
        'Here is the security-led deck →',
        'Worth a 15-min intro call?'
      ];
      gsap.set(dots, { scale: 0.7 });
      gsap.set(lines, { clearProps: 'transform' });
      var tl = gsap.timeline({ repeat: -1, repeatDelay: 2.0, delay: 0.5 });
      var cur = 0;
      dots.forEach(function (d, i) {
        tl.to(d, { scale: 1, duration: 0.22, ease: 'back.out(2.5)' });
        if (lines[i]) tl.to(lines[i], { scaleX: 1, transformOrigin: 'left', duration: 0.25, ease: 'power1.inOut' });
        tl.call(function () {
          textEl.textContent = msgs[cur % msgs.length];
          cur++;
        });
        tl.to(textEl, { opacity: 0.6, duration: 0.2, onComplete: function () { textEl.style.opacity = 1; } });
        tl.to({}, { duration: 0.8 });
      });
      tl.to({}, { duration: 1.6 });
      tl.set(dots, { scale: 0.7 }).set(lines, { scaleX: 0 });
    }

    /* CI: bars grow to values, counter ticks, signal line updates */
    function demoCI(root) {
      var bars = root.querySelectorAll('.cbar i');
      var vals = root.querySelectorAll('.cval');
      var sig = root.querySelector('.csig_text');
      var sigDot = root.querySelector('.csig_dot');
      gsap.set(bars, { width: 0 });
      var tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 0.5 });
      tl.to(bars[0], { width: '86%', duration: 1.0, ease: 'power2.out' })
        .to(bars[1], { width: '54%', duration: 1.0, ease: 'power2.out' }, '-=0.7');
      tl.call(function () { sig.textContent = 'Rival repositioned pricing · your deal strong'; }, null, '-=0.3');
      tl.to(sigDot, { scale: 1.4, duration: 0.3, yoyo: true, repeat: 1 });
      tl.to({}, { duration: 2.0 });
      tl.set(bars, { width: 0 });
    }
  }
  setTimeout(initDemoLoops, 300);

  /* ---------- Ciridae-style footer reveal (slide up) ---------- */
  var footer = document.querySelector('.section_footer');
  if (footer && hasST) {
    gsap.from(footer, { y: 60, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: footer, start: 'top 95%' } });
  }

  /* ---------- ARYA section demo: auto-loop + click-to-replay ---------- */
  function initAryaDemo() {
    var section = document.getElementById('arya');
    var chat = section.querySelector('[data-arya-chat]');
    var replayBtn = section.querySelector('[data-arya-replay]');
    if (!section || !chat) return;

    var userP = chat.querySelector('[data-type="user"]');
    var aryaP = chat.querySelector('[data-type="arya"]');
    var userBubble = userP.closest('.chat_msg');
    var thinkingMsg = chat.querySelector('.chat_thinking');
    var aryaBubble = aryaP.closest('.chat_msg');
    var actionChips = chat.querySelectorAll('.arya_chip');

    var userText = userP.textContent.trim();
    var aryaText = aryaP.textContent.trim();

    var timeline = null;

    /* GSAP-driven typewriter: tween a counter 0->text.length, write slice */
    function typeTween(el, text, rate) {
      var counter = { v: 0 };
      var caret = document.createElement('span');
      caret.className = 'arya_caret';
      el.textContent = '';
      el.appendChild(caret);
      var tween = gsap.to(counter, {
        v: text.length,
        duration: Math.max(0.5, text.length * (rate || 0.035)),
        ease: 'none',
        onUpdate: function () {
          var n = Math.round(counter.v);
          el.textContent = text.slice(0, n);
          el.appendChild(caret);
        }
      });
      return tween;
    }

    function buildTimeline() {
      if (timeline) { timeline.kill(); timeline = null; }

      /* hard reset DOM to source text, hide everything */
      userP.textContent = userText;
      aryaP.textContent = aryaText;
      gsap.set([userBubble, thinkingMsg, aryaBubble], { opacity: 0, y: 10 });
      gsap.set(actionChips, { opacity: 0, y: 8 });
      gsap.set(thinkingMsg, { display: 'none' });
      actionChips.forEach(function (c) { c.classList.remove('is-glowing'); });

      var t = gsap.timeline({ repeat: -1, repeatDelay: 2.6 });

      /* 1. user message types in */
      t.to(userBubble, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' })
        .add(typeTween(userP, userText, 0.05))
        .to({}, { duration: 0.5 })

        /* 2. thinking dots */
        .set(thinkingMsg, { display: 'flex' })
        .to(thinkingMsg, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
        .to({}, { duration: 1.0 })

        /* 3. ARYA reply types in */
        .set(aryaBubble, { opacity: 1, y: 0, duration: 0.2 })
        .to(aryaBubble, { opacity: 1, y: 0, duration: 0.25 })
        .add(typeTween(aryaP, aryaText, 0.028))
        .to({}, { duration: 0.6 })

        /* 4. chips slide in + glow */
        .to(actionChips, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.6)', stagger: 0.12 })
        .call(function () {
          actionChips.forEach(function (c) { c.classList.add('is-glowing'); });
        })
        .to({}, { duration: 2.6 })
        .call(function () {
          actionChips.forEach(function (c) { c.classList.remove('is-glowing'); });
        });

      timeline = t;
      return t;
    }

    /* left column stagger once when section enters viewport */
    var leftEls = section.querySelectorAll('[data-arya-el]');
    var leftHandled = false;
    function playLeft() {
      if (leftHandled) return;
      leftHandled = true;
      var eyebrow = section.querySelector('[data-arya-el="eyebrow"]');
      var title = section.querySelector('[data-arya-el="title"]');
      var sub = section.querySelector('[data-arya-el="sub"]');
      var checklist = section.querySelector('[data-arya-el="checklist"]');
      var cta = section.querySelector('[data-arya-el="cta"]');
      var items = checklist.querySelectorAll('li');

      gsap.set(eyebrow, { opacity: 0, y: 16 });
      gsap.set(title, { opacity: 0, y: 22 });
      gsap.set(sub, { opacity: 0, y: 18 });
      gsap.set(items, { opacity: 0, y: 12 });
      gsap.set(cta, { opacity: 0, y: 14 });

      gsap.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      gsap.to(title, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.08 });
      gsap.to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.16 });
      gsap.to(items, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.1, delay: 0.24 });
      gsap.to(cta, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.42 });
    }

    if (reduceMotion) {
      gsap.set([userBubble, thinkingMsg, aryaBubble], { clearProps: 'all' });
      gsap.set(actionChips, { clearProps: 'all' });
      gsap.set(leftEls, { clearProps: 'all' });
      gsap.set(thinkingMsg, { display: 'none' });
      return;
    }

    /* Start once the section scrolls into view */
    ScrollTrigger.create({
      trigger: section,
      start: 'top 70%',
      once: true,
      onEnter: function () {
        playLeft();
        buildTimeline();
      }
    });

    /* Replay button */
    if (replayBtn) {
      replayBtn.addEventListener('click', function () {
        replayBtn.classList.remove('is-spinning');
        void replayBtn.offsetWidth;
        replayBtn.classList.add('is-spinning');
        if (timeline) timeline.restart();
      });
    }
  }
  initAryaDemo();

  /* ---------- Walkthrough: pinned scroll-driven screenshot story ---------- */
  function initWalkthrough() {
    var stage = document.querySelector('[data-walkstage]');
    if (!stage || !hasST) return;
    var shots = stage.querySelectorAll('.walk_shot');
    var caps = stage.querySelectorAll('.walk_caption');
    var progress = stage.querySelector('[data-walkprogress]');
    if (shots.length < 2) return;

    var stepCount = shots.length;
    if (reduceMotion) return;
    var isMobile = window.matchMedia('(max-width: 767px)').matches;

    /* Set deterministic initial visual state: shot 0 + caption 0 active */
    var counterEl = stage.querySelector('[data-walkcur]');
    function setActive(i) {
      shots.forEach(function (s, idx) { s.classList.toggle('is-active', idx === i); });
      caps.forEach(function (c, idx) { c.classList.toggle('is-active', idx === i); });
      if (counterEl) counterEl.textContent = String(i + 1).padStart(2, '0');
    }
    setActive(0);

    if (isMobile) {
      /* mobile: no pin — simple scroll-reveal crossfade via IntersectionObserver */
      var mq = window.matchMedia('(max-width: 767px)');
      function mobileReveal() {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              shots.forEach(function (s, i) {
                var r = s.getBoundingClientRect();
                var isVisible = r.top < window.innerHeight * 0.8 && r.bottom > 0;
                if (isVisible) setActive(i);
              });
            }
          });
        }, { threshold: 0.25 });
        io.observe(stage);
      }
      mobileReveal();
      return;
    }

    /* Master pin: trigger when stage top reaches a comfortable point,
       end = enough scroll for stepCount steps */
    var pinStart = 'top 18%';
    var pinDistance = 800 + stepCount * 350;

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: pinStart,
        end: '+=' + pinDistance,
        scrub: 0.3,
        pin: stage,
        anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress; /* 0..1 */
          var idx = Math.min(stepCount - 1, Math.floor(p * stepCount));
          setActive(idx);
          /* progress rail */
          if (progress) progress.style.transform = 'scaleX(' + p + ')';
        },
        onLeave: function () { setActive(stepCount - 1); },
        onLeaveBack: function () { setActive(0); }
      }
    });

    /* simple crossfade+scale between adjacent shots, driven by the same scrub */
    shots.forEach(function (shot, i) {
      if (i === 0) return;
      var prev = shots[i - 1];
      tl.to(prev, { opacity: 0, scale: 1.04, duration: 0.6, ease: 'none' }, '>')
        .to(shot, { opacity: 1, scale: 1, duration: 0.6, ease: 'none' }, '<');
    });

    /* progress rail fill (single source of truth = same trigger) */
    if (progress) {
      gsap.fromTo(progress, { scaleX: 0 }, {
        scaleX: 1, transformOrigin: 'left center', ease: 'none',
        scrollTrigger: { trigger: stage, start: pinStart, end: '+=' + pinDistance, scrub: true }
      });
    }
  }
  initWalkthrough();

  /* ---------- How-it-works: scroll-fill progress + step highlight ---------- */
  function initHowStepper() {
    var stage = document.querySelector('[data-howstage]');
    if (!stage || !hasST || reduceMotion) return;
    var steps = stage.querySelectorAll('[data-hstep]');
    var fill = stage.querySelector('.how_progress_fill');
    if (!steps.length || !fill) return;

    /* progress fill scrubs across the section */
    gsap.fromTo(fill, { scaleX: 0 }, {
      scaleX: 1, transformOrigin: 'left center', ease: 'none',
      scrollTrigger: { trigger: stage, start: 'top 70%', end: '+=700', scrub: 0.4 }
    });

    /* highlight steps in sequence based on scroll progress */
    var st = ScrollTrigger.create({
      trigger: stage,
      start: 'top 70%',
      end: '+=700',
      scrub: 0.4,
      onUpdate: function (self) {
        var p = self.progress; /* 0..1 */
        steps.forEach(function (step, i) {
          var threshold = (i + 0.5) / steps.length;
          step.classList.toggle('is-live', p >= threshold);
        });
      }
    });
  }
  initHowStepper();

  /* ---------- Personas: interactive selection (click, hover, keyboard) ---------- */
  function initPersonas() {
    var grid = document.querySelector('[data-personas]');
    if (!grid) return;
    var cards = grid.querySelectorAll('.persona_card');
    function activate(card) {
      cards.forEach(function (c) { c.classList.remove('is-active'); });
      card.classList.add('is-active');
    }
    cards.forEach(function (card) {
      card.addEventListener('click', function () { activate(card); });
      card.addEventListener('mouseenter', function () { activate(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(card); }
      });
    });
  }
  initPersonas();

  /* ---------- Proof spotlight cycle (pauses on hover, stops when out of view) ---------- */
  function initProofSpotlight() {
    var grid = document.querySelector('[data-proof]');
    if (!grid || reduceMotion) return;
    var cards = grid.querySelectorAll('[data-proofcard]');
    if (cards.length < 2) return;
    var idx = 0;
    var inView = false;
    var timer = null;

    function show(i) {
      cards.forEach(function (c, n) { c.classList.toggle('is-spotlit', n === i); });
    }
    function tick() {
      if (!inView) return;
      idx = (idx + 1) % cards.length;
      show(idx);
      timer = setTimeout(tick, 4200);
    }
    grid.addEventListener('mouseenter', function () { clearTimeout(timer); });
    grid.addEventListener('mouseleave', function () { if (inView) { clearTimeout(timer); timer = setTimeout(tick, 900); } });

    var st = ScrollTrigger.create({
      trigger: grid, start: 'top 85%', end: 'bottom 15%',
      onEnter: function () { inView = true; clearTimeout(timer); timer = setTimeout(tick, 3800); },
      onLeave: function () { inView = false; clearTimeout(timer); },
      onEnterBack: function () { inView = true; clearTimeout(timer); timer = setTimeout(tick, 1000); }
    });
  }
  initProofSpotlight();

  /* ---------- Parallax touches ---------- */
  if (hasST && !reduceMotion) {
    /* proof cards drift at slightly different rates */
    var proofs = document.querySelectorAll('.proof_card');
    if (proofs.length >= 2) {
      gsap.to(proofs[0], { y: -18, ease: 'none', scrollTrigger: { trigger: '#proof', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to(proofs[1], { y: 18, ease: 'none', scrollTrigger: { trigger: '#proof', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    /* ARYA chat mockup subtle float */
    var aryaChat = document.querySelector('.arya_chat');
    if (aryaChat) {
      gsap.to(aryaChat, { y: -24, ease: 'none', scrollTrigger: { trigger: '#arya', start: 'top bottom', end: 'bottom top', scrub: true } });
    }
    /* trust band stats counter trigger is handled; marquee is CSS */
  }

  /* ---------- Tab visibility: pause repeating animations in background ---------- */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      gsap.globalTimeline.pause();
    } else {
      gsap.globalTimeline.resume();
    }
  });

  /* ---------- Refresh after load (fixed nav can offset triggers) ---------- */
  /* One refresh after load, one after fonts — avoids repeated forced-reflow measuring */
  var refreshDone = false;
  function safeRefresh() {
    if (hasST) { ScrollTrigger.refresh(); refreshDone = true; }
  }
  window.addEventListener('load', function () {
    safeRefresh();
    setTimeout(function () { if (!refreshDone) safeRefresh(); }, 500);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { safeRefresh(); });
  }
  setTimeout(safeRefresh, 2000);
})();
