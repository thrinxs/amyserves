/* ══════════════════════════════════════════════════════
   TESTIMONIALS.JS — AmyServes Testimonials System
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var selectedRating = 5;

  /* ── STAR RATING UI ──────────────────────────────── */
  function initStars() {
    var stars = document.querySelectorAll('#tfStars span');
    if (!stars.length) return;

    stars.forEach(function (star) {
      star.style.fontSize = '1.8rem';
      star.style.cursor = 'pointer';
      star.style.color = '#ccc';
      star.style.marginRight = '4px';
    });

    function highlightStars(val) {
      stars.forEach(function (s) {
        s.style.color = parseInt(s.dataset.val) <= val ? '#e0b040' : '#ccc';
      });
    }

    highlightStars(selectedRating);

    stars.forEach(function (star) {
      star.addEventListener('mouseover', function () {
        highlightStars(parseInt(star.dataset.val));
      });
      star.addEventListener('mouseout', function () {
        highlightStars(selectedRating);
      });
      star.addEventListener('click', function () {
        selectedRating = parseInt(star.dataset.val);
        highlightStars(selectedRating);
      });
    });
  }

  /* ── RENDER TESTIMONIALS ─────────────────────────── */
  function renderTestimonials(testimonials) {
    var grid = document.getElementById('testimonialsGrid');
    var section = document.getElementById('testimonials');
    if (!grid) return;

    if (!testimonials.length) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    var colors = ['var(--navy)', 'var(--teal)', 'var(--purple)'];

    grid.innerHTML = testimonials.map(function (t, i) {
      var initials = t.name.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      var stars = '';
      for (var s = 1; s <= 5; s++) {
        stars += s <= t.rating ? '★' : '☆';
      }
      var subtitle = [t.role, t.company].filter(Boolean).join(' · ');
      return '<div class="testimonial-card">' +
        '<div class="stars" style="color:#e0b040;font-size:1.1rem;margin-bottom:12px;">' + stars + '</div>' +
        '<p class="testimonial-text">"' + t.message + '"</p>' +
        '<div class="testimonial-author">' +
        '<div class="testimonial-avatar" style="background:' + colors[i % colors.length] + '">' + initials + '</div>' +
        '<div><strong>' + t.name + '</strong>' +
        (subtitle ? '<span>' + subtitle + '</span>' : '') +
        '</div></div></div>';
    }).join('');
  }

  /* ── LOAD TESTIMONIALS ───────────────────────────── */
  async function loadTestimonials() {
    if (!supabaseClient) return;
    try {
      var res = await supabaseClient
        .from('testimonials')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (res.error) throw res.error;
      renderTestimonials(res.data || []);
    } catch (err) {
      console.error('Error loading testimonials:', err);
    }
  }

  /* ── SHOW/HIDE FORM BASED ON AUTH ────────────────── */
  async function initAuthState() {
    var section = document.getElementById('testimonials');
    var formWrap = document.getElementById('testimonialFormWrap');
    var loginCta = document.getElementById('testimonialLoginCta');
    if (!section) return;

    var session = await getSession();

    if (session) {
      if (formWrap) formWrap.style.display = 'block';
      if (loginCta) loginCta.style.display = 'none';
    } else {
      if (formWrap) formWrap.style.display = 'none';
      if (loginCta) loginCta.style.display = 'block';
    }
  }

  /* ── SUBMIT TESTIMONIAL ──────────────────────────── */
  async function submitTestimonial() {
    var btn = document.getElementById('tfSubmitBtn');
    var errEl = document.getElementById('tfError');
    var successEl = document.getElementById('tfSuccess');
    var message = (document.getElementById('tfMessage').value || '').trim();
    var role = (document.getElementById('tfRole').value || '').trim();
    var company = (document.getElementById('tfCompany').value || '').trim();

    if (errEl) errEl.textContent = '';
    if (!message) {
      if (errEl) errEl.textContent = 'Please write your experience before submitting.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
      var session = await getSession();
      if (!session) {
        if (errEl) errEl.textContent = 'You must be signed in to submit a testimonial.';
        btn.disabled = false;
        btn.textContent = 'Submit Testimonial';
        return;
      }

      var name = session.user?.user_metadata?.full_name || session.user?.email?.split('@')[0] || 'Anonymous';

      var res = await supabaseClient.from('testimonials').insert({
        user_id: session.user.id,
        name: name,
        role: role || null,
        company: company || null,
        rating: selectedRating,
        message: message,
        approved: false
      });

      if (res.error) throw res.error;

      btn.style.display = 'none';
      document.getElementById('tfMessage').style.display = 'none';
      document.getElementById('tfRole').closest('.tf-row').style.display = 'none';
      document.getElementById('tfStars').style.display = 'none';
      if (successEl) successEl.style.display = 'block';

    } catch (err) {
      console.error('Submit error:', err);
      if (errEl) errEl.textContent = 'Something went wrong. Please try again.';
      btn.disabled = false;
      btn.textContent = 'Submit Testimonial';
    }
  }

  /* ── INIT ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    loadTestimonials();
    initAuthState();
    initStars();

    var submitBtn = document.getElementById('tfSubmitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', submitTestimonial);
    }
  });

})();
