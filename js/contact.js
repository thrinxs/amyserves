/* ══════════════════════════════════════════════════════
   CONTACT.JS — AmyServes Contact Page
══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    /* ── TOAST ────────────────────────────────────────── */
    var toastTimer;
    function showToast(msg) {
      var toast = document.getElementById('contactToast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove('show');
      }, 2800);
    }
  
    /* ── NAVBAR ───────────────────────────────────────── */
    (function () {
      var navbar = document.getElementById('navbar');
      var toggle = document.getElementById('navToggle');
      if (!navbar || !toggle) return;
  
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
  
    /* ── BRAND SELECTOR ──────────────────────────────── */
    (function () {
      var btns      = document.querySelectorAll('.brand-sel-btn');
      var brandInput = document.getElementById('contactBrand');
      if (!btns.length) return;
  
      var labelMap = {
        general:   'General',
        puraklen:  "Pura-Kle'N (Cleaning)",
        yourfirm:  'Yourfirm Consults (HR)'
      };
  
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          btns.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          if (brandInput) brandInput.value = labelMap[btn.dataset.brand] || 'General';
  
          // Auto-update service select placeholder relevance
          updateServiceByBrand(btn.dataset.brand);
        });
      });
  
      function updateServiceByBrand(brand) {
        var select = document.getElementById('cfService');
        if (!select) return;
        // Reset to top — user still picks explicitly
        select.value = '';
      }
    })();
  
    /* ── FAQ ACCORDION ───────────────────────────────── */
    (function () {
      var questions = document.querySelectorAll('.faq-question');
      if (!questions.length) return;
  
      questions.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var isOpen   = btn.getAttribute('aria-expanded') === 'true';
          var answer   = btn.nextElementSibling;
  
          // Close all
          questions.forEach(function (q) {
            q.setAttribute('aria-expanded', 'false');
            var a = q.nextElementSibling;
            if (a) a.classList.remove('open');
          });
  
          // Open clicked (if it was closed)
          if (!isOpen) {
            btn.setAttribute('aria-expanded', 'true');
            if (answer) answer.classList.add('open');
          }
        });
      });
    })();
  
    /* ── FORM VALIDATION & SUBMISSION ────────────────── */
    (function () {
      var form      = document.getElementById('contactForm');
      var submitBtn = document.getElementById('cfSubmit');
      var successEl = document.getElementById('cfSuccess');
      var formErrorEl = document.getElementById('cfFormError');
      if (!form) return;
  
      // Sync replyto with email input
      var emailInput   = document.getElementById('cfEmail');
      var replytoInput = document.getElementById('contactReplyto');
      if (emailInput && replytoInput) {
        emailInput.addEventListener('input', function () {
          replytoInput.value = emailInput.value;
        });
      }
  
      // Clear errors on input
      ['cfFirstName','cfLastName','cfEmail','cfMessage'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.addEventListener('input', function () {
            el.classList.remove('invalid');
            var errEl = document.getElementById('err' + id.replace('cf',''));
            if (errEl) errEl.textContent = '';
          });
        }
      });
  
      function validate() {
        var valid = true;
  
        function setError(fieldId, errId, msg) {
          var field = document.getElementById(fieldId);
          var errEl = document.getElementById(errId);
          if (field) field.classList.add('invalid');
          if (errEl) errEl.textContent = msg;
          valid = false;
        }
  
        var firstName = (document.getElementById('cfFirstName').value || '').trim();
        var lastName  = (document.getElementById('cfLastName').value || '').trim();
        var email     = (document.getElementById('cfEmail').value || '').trim();
        var message   = (document.getElementById('cfMessage').value || '').trim();
  
        if (!firstName) setError('cfFirstName', 'errFirstName', 'First name is required.');
        if (!lastName)  setError('cfLastName',  'errLastName',  'Last name is required.');
        if (!email)     setError('cfEmail', 'errEmail', 'Email address is required.');
        else if (!/\S+@\S+\.\S+/.test(email)) setError('cfEmail', 'errEmail', 'Please enter a valid email address.');
        if (!message)   setError('cfMessage', 'errMessage', 'Please tell us a bit about what you need.');
  
        return valid;
      }
  
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (formErrorEl) formErrorEl.textContent = '';
  
        if (!validate()) {
          // Scroll to first error
          var firstInvalid = form.querySelector('.invalid');
          if (firstInvalid) {
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
  
        submitBtn.disabled    = true;
        submitBtn.textContent = 'Sending…';
  
        try {
          var response = await fetch(form.action, {
            method:  'POST',
            body:    new FormData(form),
            headers: { 'Accept': 'application/json' }
          });
  
          if (response.ok) {
            form.style.display    = 'none';
            successEl.style.display = 'block';
            successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            submitBtn.disabled    = false;
            submitBtn.textContent = 'Send Message →';
            if (formErrorEl) formErrorEl.textContent = 'Something went wrong. Please try WhatsApp instead.';
          }
        } catch (err) {
          submitBtn.disabled    = false;
          submitBtn.textContent = 'Send Message →';
          if (formErrorEl) formErrorEl.textContent = 'Network error. Please try WhatsApp instead.';
        }
      });
    })();
  
  })();