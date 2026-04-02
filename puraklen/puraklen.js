/* ══════════════════════════════════════════════════════
   PURA-KLE'N — puraklen/puraklen.js
══════════════════════════════════════════════════════ */


/* ── NAVBAR: scroll effect + mobile toggle ─────────── */
(function () {
    const navbar   = document.getElementById('navbar');
    const toggle   = document.getElementById('navToggle');
  
    // Scroll shadow
    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  
    // Mobile toggle
    toggle.addEventListener('click', function () {
      navbar.classList.toggle('open');
    });
  
    // Close mobile menu when a nav-link is clicked
    document.querySelectorAll('.navbar-mobile .nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navbar.classList.remove('open');
      });
    });
  })();
  
  
  /* ── HERO SLIDESHOW ────────────────────────────────── */
  (function () {
    const slides = document.querySelectorAll('.pk-slide');
    const dots   = document.querySelectorAll('.pk-dot');
    let current  = 0;
    let timer;
  
    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = index;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
  
    function next() {
      goTo((current + 1) % slides.length);
    }
  
    function startTimer() {
      timer = setInterval(next, 5000);
    }
  
    // Dot click
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        clearInterval(timer);
        goTo(parseInt(this.dataset.index));
        startTimer();
      });
    });
  
    startTimer();
  })();
  
  
  /* ── SERVICE CARD EXPAND / COLLAPSE ───────────────── */
  function toggleCard(card) {
    // Don't toggle if click was inside the drawer (e.g. clicking a link/button)
    const target = event.target;
    if (target.tagName === 'A' && !target.classList.contains('pk-svc-btn')) return;
  
    const isExpanded = card.classList.contains('expanded');
  
    // Collapse all other cards first
    document.querySelectorAll('.pk-svc-card.expanded').forEach(function (c) {
      if (c !== card) {
        c.classList.remove('expanded');
        const btn = c.querySelector('.pk-svc-toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  
    // Toggle this card
    card.classList.toggle('expanded', !isExpanded);
    const btn = card.querySelector('.pk-svc-toggle');
    if (btn) btn.setAttribute('aria-expanded', String(!isExpanded));
  }
  
  
  /* ── COUNTER ANIMATION ─────────────────────────────── */
  (function () {
    const counters = document.querySelectorAll('.pk-stat-num[data-target]');
    if (!counters.length) return;
  
    function animateCounter(el) {
      const target   = parseInt(el.dataset.target);
      const duration = 1800;
      const start    = performance.now();
  
      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  
    // Trigger when hero stats come into view
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
  
    counters.forEach(function (el) { observer.observe(el); });
  })();
  
  
  /* ── QUOTE FORM: service tag selection ─────────────── */
  (function () {
    const tags = document.querySelectorAll('.pk-tag');
    if (!tags.length) return;
  
    const selected = new Set();
  
    tags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        const svc = tag.dataset.service;
        if (selected.has(svc)) {
          selected.delete(svc);
          tag.classList.remove('active');
        } else {
          selected.add(svc);
          tag.classList.add('active');
        }
        document.getElementById('pkServicesInput').value = Array.from(selected).join(', ');
      });
    });
  })();
  
  
  /* ── PRE-SELECT SERVICE (called from card CTAs) ─────── */
  function preSelect(serviceName) {
    // Small delay to let scroll happen first
    setTimeout(function () {
      const tags = document.querySelectorAll('.pk-tag');
      tags.forEach(function (tag) {
        if (tag.dataset.service === serviceName && !tag.classList.contains('active')) {
          tag.click();
        }
      });
    }, 600);
  }
  
  
  /* ── QUOTE FORM SUBMISSION ─────────────────────────── */
  (function () {
    const form    = document.getElementById('pkQuoteForm');
    const success = document.getElementById('pkSuccess');
    const errMsg  = document.getElementById('pkFormError');
    const submit  = document.getElementById('pkSubmit');
    if (!form) return;
  
    // Sync replyto field with email input
    const emailInput   = document.getElementById('pkEmail');
    const replytoInput = document.getElementById('pkReplyto');
    if (emailInput && replytoInput) {
      emailInput.addEventListener('input', function () {
        replytoInput.value = emailInput.value;
      });
    }
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      // Validate services selected
      const servicesVal = document.getElementById('pkServicesInput').value;
      if (!servicesVal.trim()) {
        errMsg.classList.add('visible');
        errMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      errMsg.classList.remove('visible');
  
      // Disable submit
      submit.disabled = true;
      submit.textContent = 'Sending…';
  
      try {
        const data     = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
  
        if (response.ok) {
          form.style.display   = 'none';
          success.classList.add('visible');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          submit.disabled     = false;
          submit.textContent  = 'Get My Quote →';
          errMsg.textContent  = 'Something went wrong. Please try WhatsApp instead.';
          errMsg.classList.add('visible');
        }
      } catch (err) {
        submit.disabled    = false;
        submit.textContent = 'Get My Quote →';
        errMsg.textContent = 'Network error. Please try WhatsApp instead.';
        errMsg.classList.add('visible');
      }
    });
  })();
  
  
  /* ── SMOOTH SCROLL for anchor links ────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = 72; // navbar height
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });