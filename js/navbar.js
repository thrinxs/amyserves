const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

// ── HAMBURGER TOGGLE
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navbar.classList.toggle('open');
  });
}

// ── CLOSE ON LINK CLICK
document.querySelectorAll('.navbar-mobile .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navbar.classList.remove('open');
  });
});

// ── SCROLL EFFECT
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ── ACTIVE LINK
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar-links a, .navbar-mobile .nav-link').forEach(link => {
  const linkPath = link.getAttribute('href').split('/').pop();
  if (linkPath === currentPath) {
    link.classList.add('active');
  }
});