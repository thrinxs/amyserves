// ── IMPACT NUMBER COUNTER ANIMATION ──────────────────
function animateCounters() {
  const counters = document.querySelectorAll('.impact-num');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const step   = target / (duration / 16);
        let current  = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(current);
        }, 16);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// ── HERO SLIDESHOW ────────────────────────────────────
function initSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');

  if (!slides.length || !dots.length) return;

  let current = 0;
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

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goTo(i);
      startTimer();
    });
  });

  startTimer();
}

// ── MARQUEE DUPLICATE FOR SEAMLESS LOOP ──────────────
function initMarquee() {
  const track = document.getElementById('clientsTrack');
  if (!track) return;
  const chips = Array.from(track.children);
  chips.forEach(chip => {
    const clone = chip.cloneNode(true);
    track.appendChild(clone);
  });
}

// ── CONTACT FORM SUBMISSION ───────────────────────────
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');

  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    const data = {
      name:    document.getElementById('fullName').value,
      phone:   document.getElementById('phone').value,
      email:   document.getElementById('email').value,
      company: document.getElementById('company').value,
      service: document.getElementById('service').value,
      message: document.getElementById('message').value,
    };

    // TODO: Connect to Supabase in next phase
    setTimeout(() => {
      if (formMessage) {
        formMessage.innerHTML = '<p style="color:#0F6E56;font-weight:600;margin-bottom:12px">✅ Thank you! We will be in touch within 24 hours.</p>';
      }
      contactForm.reset();
      btn.textContent = 'Send Your Enquiry →';
      btn.disabled = false;
    }, 1000);
  });
}

// ── INIT — single DOMContentLoaded ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
  initSlideshow();
  initMarquee();
  initContactForm();
});
