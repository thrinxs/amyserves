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

/* ── AUTH-AWARE NAVBAR ───────────────────────────── */
(async function () {

  const authOut       = document.getElementById('navAuthOut');
  const authIn        = document.getElementById('navAuthIn');
  const profileAvatar = document.getElementById('navProfileAvatar');
  const profileName   = document.getElementById('navProfileName');
  const profileEmail  = document.getElementById('navProfileEmail');
  const profileBtn    = document.getElementById('navProfileBtn');
  const profileDD     = document.getElementById('navProfileDropdown');
  const signOutBtn    = document.getElementById('navSignOutBtn');
  const mobileOut     = document.getElementById('mobileAuthOut');
  const mobileIn      = document.getElementById('mobileAuthIn');

  // Only run if supabase is available
  if (typeof supabase === 'undefined' || !supabase) {
    // Supabase not connected yet — show logged-out state
    if (authOut)   authOut.style.display   = 'flex';
    if (mobileOut) mobileOut.style.display = 'flex';
    return;
  }

  // Check session
  let session = null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data?.session || null;
  } catch (e) {
    session = null;
  }

  if (session && session.user) {
    const user = session.user;
    const meta = user.user_metadata || {};

    // Get display name and initials
    const name     = meta.full_name || user.email.split('@')[0] || 'User';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Populate profile info
    if (profileAvatar) profileAvatar.textContent = initials;
    if (profileName)   profileName.textContent   = name;
    if (profileEmail)  profileEmail.textContent  = user.email;

    // Show logged-in state
    if (authIn)   authIn.style.display   = 'flex';
    if (mobileIn) mobileIn.style.display = 'flex';
    if (authOut)   authOut.style.display  = 'none';
    if (mobileOut) mobileOut.style.display = 'none';

    // Dropdown toggle
    if (profileBtn && profileDD) {
      profileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        profileDD.classList.toggle('open');
      });

      // Close when clicking outside
      document.addEventListener('click', function () {
        profileDD.classList.remove('open');
      });

      profileDD.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    // Sign out
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async function () {
        await supabase.auth.signOut();
        const depth = window.location.pathname.split('/').filter(Boolean).length;
        const loginPath = depth > 1 ? '../auth/login.html' : 'auth/login.html';
        window.location.href = loginPath; // adjust path per page if needed
      });
    }

  } else {
    // Not logged in
    if (authOut)   authOut.style.display   = 'flex';
    if (mobileOut) mobileOut.style.display = 'flex';
    if (authIn)    authIn.style.display    = 'none';
    if (mobileIn)  mobileIn.style.display  = 'none';
  }

})();