/* ────────────────────────────────────────────
   SERVICE DATA
──────────────────────────────────────────── */
const SERVICES = {
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
  ],
};

let selectedBrand    = '';
let selectedServices = [];

/* ────────────────────────────────────────────
   RENDER TAGS
──────────────────────────────────────────── */
function renderTags(brand) {
  const wrap = document.getElementById('serviceTags');
  if (!wrap) return;

  let tags = [];
  if (brand === 'puraklen')      tags = SERVICES.puraklen;
  else if (brand === 'yourfirm') tags = SERVICES.yourfirm;
  else                           tags = [...SERVICES.puraklen, ...SERVICES.yourfirm];

  let html = '';
  for (let i = 0; i < tags.length; i++) {
    const s      = tags[i];
    const isTeal = SERVICES.puraklen.includes(s);
    const cls    = isTeal ? 'teal' : 'purple';
    html += '<span class="qf-tag" data-service="' + s + '" data-color="' + cls + '">' + s + '</span>';
  }
  wrap.innerHTML = html;

  wrap.querySelectorAll('.qf-tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      toggleTag(this);
    });
  });
}

/* ────────────────────────────────────────────
   TOGGLE TAG
──────────────────────────────────────────── */
function toggleTag(el) {
  const svc   = el.dataset.service;
  const color = el.dataset.color;
  const idx   = selectedServices.indexOf(svc);

  if (idx > -1) {
    selectedServices.splice(idx, 1);
    el.classList.remove('selected--teal', 'selected--purple');
  } else {
    selectedServices.push(svc);
    el.classList.add('selected--' + color);
  }

  document.getElementById('servicesInput').value = selectedServices.join(', ');
}

/* ────────────────────────────────────────────
   BRAND SELECTION
──────────────────────────────────────────── */
function selectBrand(brand) {
  selectedBrand    = brand;
  selectedServices = [];
  document.getElementById('servicesInput').value = '';

  ['puraklen', 'yourfirm', 'both'].forEach(function(b) {
    const el = document.getElementById('opt-' + b);
    if (!el) return;
    el.classList.remove('selected--teal', 'selected--purple', 'selected--both');
  });

  const map = {
    puraklen: 'selected--teal',
    yourfirm: 'selected--purple',
    both:     'selected--both'
  };
  const opted = document.getElementById('opt-' + brand);
  if (opted) opted.classList.add(map[brand]);

  const brandLabels = {
    puraklen: "Pura-Kle'N",
    yourfirm: 'Yourfirm Consults',
    both:     "Both (Pura-Kle'N + Yourfirm)"
  };
  document.getElementById('brandInput').value = brandLabels[brand];

  markStep(1, true);
  renderTags(brand);
}

/* ────────────────────────────────────────────
   PRE-SELECT (called from service card CTAs)
──────────────────────────────────────────── */
function preSelectService(brand, serviceName) {
  selectBrand(brand);
  setTimeout(function() {
    const tag = document.querySelector('.qf-tag[data-service="' + serviceName + '"]');
    if (tag) toggleTag(tag);
  }, 80);
}

function preSelectBrand(brand) {
  setTimeout(function() { selectBrand(brand); }, 80);
}

/* ────────────────────────────────────────────
   STEP INDICATORS
──────────────────────────────────────────── */
function markStep(num, complete) {
  const el = document.getElementById('step-' + num);
  if (!el || el.classList.contains('complete')) return;
  if (complete) {
    el.classList.remove('active');
    el.classList.add('complete');
    el.querySelector('.qf-step-num').textContent = '✓';
    const next = document.getElementById('step-' + (num + 1));
    if (next && !next.classList.contains('complete')) next.classList.add('active');
  }
}

['fullName', 'email', 'phone'].forEach(function(id) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', function() {
    const fn = document.getElementById('fullName').value.trim();
    const em = document.getElementById('email').value.trim();
    const ph = document.getElementById('phone').value.trim();
    if (fn && em && ph) markStep(2, true);
  });
});

['bizName', 'location'].forEach(function(id) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('blur', function() {
    const bn = document.getElementById('bizName').value.trim();
    const lo = document.getElementById('location').value.trim();
    if (bn && lo) markStep(3, true);
  });
});

const briefEl = document.getElementById('brief');
if (briefEl) briefEl.addEventListener('input', function() {
  if (briefEl.value.length > 20) markStep(4, true);
});

/* ────────────────────────────────────────────
   ATTACH BRAND OPTION CLICKS
──────────────────────────────────────────── */
window.addEventListener('load', function() {
  const puraklenEl = document.getElementById('opt-puraklen');
  const yourfirmEl = document.getElementById('opt-yourfirm');
  const bothEl     = document.getElementById('opt-both');

  if (puraklenEl) puraklenEl.addEventListener('click', function() { selectBrand('puraklen'); });
  if (yourfirmEl) yourfirmEl.addEventListener('click', function() { selectBrand('yourfirm'); });
  if (bothEl)     bothEl.addEventListener('click',     function() { selectBrand('both'); });
});

/* ────────────────────────────────────────────
   FORM SUBMISSION
──────────────────────────────────────────── */
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const errorEl  = document.getElementById('qfError');
    const submitEl = document.getElementById('qfSubmit');

    if (!selectedBrand) {
      errorEl.textContent = "Please select a brand — Pura-Kle'N, Yourfirm, or Both.";
      errorEl.classList.add('visible');
      document.getElementById('opt-puraklen').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (selectedServices.length === 0) {
      errorEl.textContent = 'Please select at least one specific service you\'re interested in.';
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    document.getElementById('replytoInput').value = document.getElementById('email').value;

    submitEl.disabled    = true;
    submitEl.textContent = 'Sending…';

    try {
      const formData = new FormData(this);
      const response = await fetch(this.action, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Formspree error');

      const now         = new Date();
      const submittedAt = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

      const gFormBase = 'https://docs.google.com/forms/d/e/1FAIpQLSclLud4Xv1-btMqUW3O6ufDMM0mlXkrHE3c4sN7_JXXUG_IQg/formResponse';

      const gFormUrl = gFormBase
        + '?entry.732918547='  + encodeURIComponent(document.getElementById('brandInput').value)
        + '&entry.1289683243=' + encodeURIComponent(document.getElementById('servicesInput').value)
        + '&entry.1157395290=' + encodeURIComponent(document.getElementById('fullName').value)
        + '&entry.7386232='    + encodeURIComponent(document.getElementById('email').value)
        + '&entry.1423398704=' + encodeURIComponent(document.getElementById('phone').value)
        + '&entry.534062144='  + encodeURIComponent(document.getElementById('role').value)
        + '&entry.1502664962=' + encodeURIComponent(document.getElementById('bizName').value)
        + '&entry.1806656199=' + encodeURIComponent(document.getElementById('industry').value)
        + '&entry.341698516='  + encodeURIComponent(document.getElementById('location').value)
        + '&entry.521831668='  + encodeURIComponent(document.getElementById('staffSize').value)
        + '&entry.1051565057=' + encodeURIComponent(document.getElementById('urgency').value)
        + '&entry.1688331750=' + encodeURIComponent(document.getElementById('brief').value)
        + '&entry.1133791102=' + encodeURIComponent(document.querySelector('[name="open_to_retainer"]:checked') ? 'Yes' : 'No')
        + '&entry.282127836='  + encodeURIComponent(submittedAt);

      document.getElementById('hidden_iframe').src = gFormUrl;

      quoteForm.style.display = 'none';
      document.querySelector('.qf-steps').style.display = 'none';
      document.getElementById('qfSuccess').classList.add('visible');

    } catch(err) {
      submitEl.disabled    = false;
      submitEl.textContent = 'Get a Quote →';
      errorEl.textContent  = 'Something went wrong. Please try again or WhatsApp us directly.';
      errorEl.classList.add('visible');
    }
  });
}

/* ────────────────────────────────────────────
   CARD EXPAND / COLLAPSE
──────────────────────────────────────────── */
document.querySelectorAll('.svc-card-toggle').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleCard(btn.closest('.svc-card'));
  });
});

function toggleCard(card) {
  const isExpanded = card.classList.contains('expanded');
  card.closest('.services-grid').querySelectorAll('.svc-card.expanded').forEach(function(c) {
    c.classList.remove('expanded');
    c.querySelector('.svc-card-toggle').setAttribute('aria-expanded', 'false');
    c.querySelector('.svc-card-toggle-label').textContent = 'Learn more';
  });
  if (!isExpanded) {
    card.classList.add('expanded');
    card.querySelector('.svc-card-toggle').setAttribute('aria-expanded', 'true');
    card.querySelector('.svc-card-toggle-label').textContent = 'Show less';
    setTimeout(function() {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 420);
  }
}

/* ────────────────────────────────────────────
   SMOOTH SCROLL
──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ────────────────────────────────────────────
   NAVBAR SCROLL
──────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});