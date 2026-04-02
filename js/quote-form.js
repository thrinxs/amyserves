/* ════════════════════════════════════════════════
   AmyServes — Quote Form JS
   Place this file as quote-form.js and load it
   at the bottom of <body>, AFTER your existing
   main.js (so navbar / card-expand / smooth-scroll
   from main.js are not affected).
   ════════════════════════════════════════════════ */

(function () {

  /* ─────────────────────────────────────────────
     SERVICE DATA
  ───────────────────────────────────────────── */
  var SERVICES = {
    puraklen: [
      'Office & Commercial Cleaning',
      'Deep Cleaning',
      'Post-Construction Cleaning',
      'Post-Event Cleaning',
      'Residential Cleaning',
      'Fumigation & Pest Control'
    ],
    yourfirm: [
      'HR Audit',
      'Employment Contracts & Policies',
      'Recruitment & Outsourcing',
      'Payroll Management',
      'Performance Management',
      'Business Registration & Compliance'
    ]
  };

  /* ─────────────────────────────────────────────
     STATE
  ───────────────────────────────────────────── */
  var curStep    = 1;
  var selBrand   = '';
  var selTags    = [];
  var maxReached = 1;

  /* ─────────────────────────────────────────────
     GOOGLE FORM CONFIG
     Keep entry IDs in sync with your Google Form
  ───────────────────────────────────────────── */
  var G_FORM_BASE = 'https://docs.google.com/forms/d/e/1FAIpQLSclLud4Xv1-btMqUW3O6ufDMM0mlXkrHE3c4sN7_JXXUG_IQg/formResponse';
  var G_ENTRIES = {
    brand:          'entry.732918547',
    services:       'entry.1289683243',
    full_name:      'entry.1157395290',
    email:          'entry.7386232',
    phone:          'entry.1423398704',
    role:           'entry.534062144',
    business_name:  'entry.1502664962',
    industry:       'entry.1806656199',
    location:       'entry.341698516',
    staff_size:     'entry.521831668',
    urgency:        'entry.1051565057',
    brief:          'entry.1688331750',
    open_to_retainer: 'entry.1133791102',
    submitted_at:   'entry.282127836'
  };

  /* ─────────────────────────────────────────────
     INIT — wait for DOM
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {

    /* Progress bar click navigation */
    document.querySelectorAll('.qs-prog-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var target = parseInt(item.dataset.step, 10);
        if (target === curStep || target > maxReached) return;
        goToStep(target);
      });
    });

    /* Brand card clicks */
    var puraklenEl = document.getElementById('opt-puraklen');
    var yourfirmEl = document.getElementById('opt-yourfirm');
    var bothEl     = document.getElementById('opt-both');
    if (puraklenEl) puraklenEl.addEventListener('click', function () { selectBrand('puraklen'); });
    if (yourfirmEl) yourfirmEl.addEventListener('click', function () { selectBrand('yourfirm'); });
    if (bothEl)     bothEl.addEventListener('click',     function () { selectBrand('both'); });

    updateProgress();
  });

  /* ─────────────────────────────────────────────
     BRAND SELECTION
  ───────────────────────────────────────────── */
  function selectBrand(brand) {
    if (selBrand === brand) return;
    selBrand = brand;
    selTags  = [];

    document.querySelectorAll('.brand-opt').forEach(function (el) {
      el.classList.remove('sel-teal', 'sel-purple', 'sel-gold');
    });

    var map = { puraklen: 'sel-teal', yourfirm: 'sel-purple', both: 'sel-gold' };
    var opted = document.getElementById('opt-' + brand);
    if (opted) opted.classList.add(map[brand]);

    renderTags();
    hideErr('err1');
  }

  /* ─────────────────────────────────────────────
     RENDER TAGS
  ───────────────────────────────────────────── */
  function renderTags() {
    var label = document.getElementById('tagsLabel');
    var area  = document.getElementById('tagArea');
    if (!label || !area) return;

    label.style.display = 'block';
    var html = '';

    if (selBrand === 'puraklen' || selBrand === 'both') {
      if (selBrand === 'both') {
        html += '<span class="tags-group-label">Pura-Kle\'N — Cleaning</span>';
      }
      SERVICES.puraklen.forEach(function (s) {
        var sel = selTags.indexOf(s) > -1 ? 'sel-teal' : '';
        html += '<span class="qf-tag ' + sel + '" data-service="' + s + '" data-color="teal">'
              + '<span class="tag-dot" style="background:#1D9E75"></span>' + s + '</span>';
      });
    }

    if (selBrand === 'yourfirm' || selBrand === 'both') {
      if (selBrand === 'both') {
        html += '<span class="tags-group-label">Yourfirm Consults — HR</span>';
      }
      SERVICES.yourfirm.forEach(function (s) {
        var sel = selTags.indexOf(s) > -1 ? 'sel-purple' : '';
        html += '<span class="qf-tag ' + sel + '" data-service="' + s + '" data-color="purple">'
              + '<span class="tag-dot" style="background:#534AB7"></span>' + s + '</span>';
      });
    }

    area.innerHTML = html;

    area.querySelectorAll('.qf-tag').forEach(function (tag) {
      tag.addEventListener('click', function () {
        var svc = tag.dataset.service;
        var col = tag.dataset.color;
        var idx = selTags.indexOf(svc);
        if (idx > -1) {
          selTags.splice(idx, 1);
          tag.classList.remove('sel-teal', 'sel-purple');
        } else {
          selTags.push(svc);
          tag.classList.add('sel-' + col);
        }
        hideErr('err1');
      });
    });
  }

  /* ─────────────────────────────────────────────
     STEP NAVIGATION
  ───────────────────────────────────────────── */
  window.goNext = function () {
    if (!validate(curStep)) return;
    if (curStep === 4) { submitForm(); return; }
    var next = curStep + 1;
    if (next > maxReached) maxReached = next;
    goToStep(next);
  };

  window.goBack = function () {
    if (curStep > 1) goToStep(curStep - 1);
  };

  function goToStep(n) {
    var current = document.getElementById('step' + curStep);
    var target  = document.getElementById('step' + n);
    if (current) current.classList.remove('active');
    curStep = n;
    if (target) target.classList.add('active');
    updateProgress();
  }

  /* ─────────────────────────────────────────────
     PROGRESS BAR
  ───────────────────────────────────────────── */
  function updateProgress() {
    document.querySelectorAll('.qs-prog-item').forEach(function (item) {
      var s = parseInt(item.dataset.step, 10);
      item.classList.remove('active', 'done', 'clickable');
      if (s === curStep) {
        item.classList.add('active');
        item.querySelector('.qs-prog-dot').textContent = s;
      } else if (s < curStep) {
        item.classList.add('done');
        item.querySelector('.qs-prog-dot').textContent = '✓';
      } else {
        item.querySelector('.qs-prog-dot').textContent = s;
      }
      if (s <= maxReached && s !== curStep) item.classList.add('clickable');
    });

    var btnBack = document.getElementById('btnBack');
    var btnNext = document.getElementById('btnNext');
    if (btnBack) btnBack.style.display = curStep > 1 ? '' : 'none';
    if (btnNext) btnNext.textContent = curStep === 4 ? 'Submit →' : 'Continue →';
  }

  /* ─────────────────────────────────────────────
     VALIDATION
  ───────────────────────────────────────────── */
  function validate(step) {
    if (step === 1) {
      var ok = selBrand && selTags.length > 0;
      if (!ok) showErr('err1');
      return ok;
    }
    if (step === 2) {
      var n  = val('fullName');
      var e  = val('email');
      var p  = val('phone');
      var ok = n && e && /\S+@\S+\.\S+/.test(e) && p;
      if (!ok) showErr('err2');
      return ok;
    }
    if (step === 3) {
      var b  = val('bizName');
      var i  = val('industry');
      var l  = val('location');
      var ok = b && i && l;
      if (!ok) showErr('err3');
      return ok;
    }
    if (step === 4) {
      var br = val('brief');
      if (!br) showErr('err4');
      return !!br;
    }
    return true;
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  /* ─────────────────────────────────────────────
     FORM SUBMISSION
  ───────────────────────────────────────────── */
  function submitForm() {
    var btn = document.getElementById('btnNext');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    var emailVal = val('email');

    var data = {
      brand:            selBrand,
      services:         selTags.join(', '),
      full_name:        val('fullName'),
      email:            emailVal,
      phone:            val('phone'),
      role:             val('role'),
      business_name:    val('bizName'),
      industry:         val('industry'),
      location:         val('location'),
      staff_size:       val('staffSize'),
      urgency:          val('urgency'),
      brief:            val('brief'),
      send_copy:        document.getElementById('chkCopy')     && document.getElementById('chkCopy').checked     ? 'Yes' : 'No',
      open_to_retainer: document.getElementById('chkRetainer') && document.getElementById('chkRetainer').checked ? 'Yes' : 'No',
      _replyto:         emailVal,
      _subject:         "New Quote Request — AmyServes"
    };

    fetch('https://formspree.io/f/xdapnwzd', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(data)
    })
    .then(function (r) {
      if (!r.ok) throw new Error('Formspree error');

      /* Silent Google Form submission */
      var now = new Date();
      var submittedAt = now.toLocaleDateString('en-GB') + ' '
                      + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      var gUrl = G_FORM_BASE
        + '?' + G_ENTRIES.brand          + '=' + encodeURIComponent(selBrand)
        + '&' + G_ENTRIES.services       + '=' + encodeURIComponent(selTags.join(', '))
        + '&' + G_ENTRIES.full_name      + '=' + encodeURIComponent(data.full_name)
        + '&' + G_ENTRIES.email          + '=' + encodeURIComponent(data.email)
        + '&' + G_ENTRIES.phone          + '=' + encodeURIComponent(data.phone)
        + '&' + G_ENTRIES.role           + '=' + encodeURIComponent(data.role)
        + '&' + G_ENTRIES.business_name  + '=' + encodeURIComponent(data.business_name)
        + '&' + G_ENTRIES.industry       + '=' + encodeURIComponent(data.industry)
        + '&' + G_ENTRIES.location       + '=' + encodeURIComponent(data.location)
        + '&' + G_ENTRIES.staff_size     + '=' + encodeURIComponent(data.staff_size)
        + '&' + G_ENTRIES.urgency        + '=' + encodeURIComponent(data.urgency)
        + '&' + G_ENTRIES.brief          + '=' + encodeURIComponent(data.brief)
        + '&' + G_ENTRIES.open_to_retainer + '=' + encodeURIComponent(data.open_to_retainer)
        + '&' + G_ENTRIES.submitted_at   + '=' + encodeURIComponent(submittedAt);

      var iframe = document.getElementById('hidden_iframe');
      if (iframe) iframe.src = gUrl;

      showSuccess();
    })
    .catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = 'Submit →'; }
      var errEl = document.getElementById('err4');
      if (errEl) {
        errEl.textContent = 'Something went wrong. Please try again or WhatsApp us directly.';
        errEl.classList.add('show');
      }
    });
  }

  /* ─────────────────────────────────────────────
     SUCCESS STATE
  ───────────────────────────────────────────── */
  function showSuccess() {
    var body     = document.getElementById('formBody');
    var footer   = document.getElementById('formFooter');
    var progress = document.getElementById('progressBar');
    var success  = document.getElementById('successScreen');
    if (body)     body.style.display     = 'none';
    if (footer)   footer.style.display   = 'none';
    if (progress) progress.style.display = 'none';
    if (success)  success.classList.add('visible');
  }

  /* ─────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────── */
  function showErr(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('show');
  }

  function hideErr(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('show');
  }

  /* ─────────────────────────────────────────────
     PRE-SELECT helpers (called from service CTAs)
  ───────────────────────────────────────────── */
  window.preSelectBrand = function (brand) {
    setTimeout(function () { selectBrand(brand); }, 80);
  };

  window.preSelectService = function (brand, serviceName) {
    selectBrand(brand);
    setTimeout(function () {
      var tag = document.querySelector('.qf-tag[data-service="' + serviceName + '"]');
      if (tag) tag.click();
    }, 120);
  };

})();
