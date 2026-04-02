/* ══════════════════════════════════════════════════════
   YOURFIRM CONSULTS — yourfirm/yourfirm.js
══════════════════════════════════════════════════════ */


/* ── NAVBAR: scroll + mobile ───────────────────────── */
(function () {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
  
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  
    toggle.addEventListener('click', function () {
      navbar.classList.toggle('open');
    });
  
    document.querySelectorAll('.navbar-mobile .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navbar.classList.remove('open');
      });
    });
  })();
  
  
  /* ── COUNTER ANIMATION ─────────────────────────────── */
  (function () {
    const counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;
  
    function animateCounter(el) {
      const target   = parseInt(el.dataset.target);
      const duration = 1600;
      const start    = performance.now();
  
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
  
    counters.forEach(function (el) { observer.observe(el); });
  })();
  
  
  /* ── SERVICES TABS ─────────────────────────────────── */
  (function () {
    const tabs     = document.querySelectorAll('.yf-tab');
    const contents = document.querySelectorAll('.yf-tab-content');
  
    if (!tabs.length) return;
  
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const idx = parseInt(this.dataset.svc);
  
        // Update tabs
        tabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
  
        // Update content panels
        contents.forEach(function (c) { c.classList.remove('active'); });
        const target = document.querySelector('.yf-tab-content[data-svc="' + idx + '"]');
        if (target) target.classList.add('active');
      });
    });
  })();
  
  
  /* ── PRE-SELECT SERVICE (called from tab CTAs) ──────── */
  function yfPreSelect(serviceName) {
    setTimeout(function () {
      const chips = document.querySelectorAll('.yf-chip');
      chips.forEach(function (chip) {
        if (chip.dataset.service === serviceName && !chip.classList.contains('active')) {
          chip.click();
        }
      });
      const formSection = document.getElementById('get-a-quote');
      if (formSection) {
        const offset = 72;
        const top    = formSection.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 300);
  }
  
  
  /* ── SERVICE CHIPS (quote form) ─────────────────────── */
  (function () {
    const chips   = document.querySelectorAll('.yf-chip');
    const input   = document.getElementById('yfServicesInput');
    const selected = new Set();
  
    if (!chips.length) return;
  
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        const svc = chip.dataset.service;
        if (selected.has(svc)) {
          selected.delete(svc);
          chip.classList.remove('active');
        } else {
          selected.add(svc);
          chip.classList.add('active');
        }
        if (input) input.value = Array.from(selected).join(', ');
      });
    });
  })();
  
  
  /* ── QUOTE FORM SUBMISSION ─────────────────────────── */
  (function () {
    const form    = document.getElementById('yfQuoteForm');
    const success = document.getElementById('yfSuccess');
    const errMsg  = document.getElementById('yfFormError');
    const submit  = document.getElementById('yfSubmit');
    if (!form) return;
  
    // Sync replyto
    const emailInput   = document.getElementById('yfEmail');
    const replytoInput = document.getElementById('yfReplyto');
    if (emailInput && replytoInput) {
      emailInput.addEventListener('input', function () {
        replytoInput.value = emailInput.value;
      });
    }
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      const servicesVal = document.getElementById('yfServicesInput').value;
      if (!servicesVal.trim()) {
        errMsg.classList.add('visible');
        errMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      errMsg.classList.remove('visible');
  
      submit.disabled    = true;
      submit.textContent = 'Sending…';
  
      try {
        const response = await fetch(form.action, {
          method:  'POST',
          body:    new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
  
        if (response.ok) {
          form.style.display = 'none';
          success.classList.add('visible');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          submit.disabled    = false;
          submit.textContent = 'Send Enquiry →';
          errMsg.textContent = 'Something went wrong. Please try WhatsApp instead.';
          errMsg.classList.add('visible');
        }
      } catch (err) {
        submit.disabled    = false;
        submit.textContent = 'Send Enquiry →';
        errMsg.textContent = 'Network error. Please try WhatsApp instead.';
        errMsg.classList.add('visible');
      }
    });
  })();
  
  
  /* ── SMOOTH SCROLL ─────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id     = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });