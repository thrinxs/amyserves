document.addEventListener('DOMContentLoaded', function () {
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  // ── HAMBURGER TOGGLE
  if (navToggle && navbar && navMobile) {
    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      navbar.classList.toggle('open');
    });
  }

  // ── CLOSE ON MOBILE LINK CLICK
  document.querySelectorAll('.navbar-mobile .nav-link, .navbar-mobile .btn-getstarted-mobile, .navbar-mobile .btn-whatsapp-mobile').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navbar) navbar.classList.remove('open');
    });
  });

  // ── CLOSE MOBILE MENU WHEN RESIZING TO DESKTOP
  window.addEventListener('resize', function () {
    if (window.innerWidth > 960 && navbar) {
      navbar.classList.remove('open');
    }
  });

  // ── SCROLL EFFECT
  window.addEventListener('scroll', function () {
    if (navbar) {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });

  // ── ACTIVE LINK
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a, .navbar-mobile .nav-link').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkPath = href.split('/').pop();

    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });

  /* ── AUTH-AWARE NAVBAR ───────────────────────────── */
  (async function () {
    const authLoading   = document.getElementById('navAuthLoading');
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

    function hideLoading() {
      if (authLoading) authLoading.style.display = 'none';
    }

    function showLoggedOut() {
      hideLoading();
      if (authOut)   authOut.style.display   = 'flex';
      if (authIn)    authIn.style.display    = 'none';
      if (mobileOut) mobileOut.style.display = 'flex';
      if (mobileIn)  mobileIn.style.display  = 'none';
    }

    function showLoggedIn(user) {
      hideLoading();
      const meta     = user.user_metadata || {};
      const name     = meta.full_name || user.email.split('@')[0] || 'User';
      const initials = name.split(' ')
        .map(function (w) { return w[0]; })
        .join('')
        .slice(0, 2)
        .toUpperCase();

      if (profileAvatar) profileAvatar.textContent = initials;
      if (profileName)   profileName.textContent   = name;
      if (profileEmail)  profileEmail.textContent  = user.email;

      if (authIn)    authIn.style.display    = 'flex';
      if (authOut)   authOut.style.display   = 'none';
      if (mobileIn)  mobileIn.style.display  = 'flex';
      if (mobileOut) mobileOut.style.display = 'none';
    }

    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      showLoggedOut();
      return;
    }

    let session = null;
    try {
      const result = await supabaseClient.auth.getSession();
      session = result.data ? result.data.session : null;
    } catch (e) {
      session = null;
    }

    if (session && session.user) {
      showLoggedIn(session.user);

      if (profileBtn && profileDD) {
        profileBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          profileDD.classList.toggle('open');
        });

        document.addEventListener('click', function () {
          profileDD.classList.remove('open');
        });

        profileDD.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }

      if (signOutBtn) {
        signOutBtn.addEventListener('click', async function () {
          await supabaseClient.auth.signOut();
          const depth = window.location.pathname.split('/').filter(Boolean).length;
          window.location.href = depth > 1
            ? '../auth/login.html'
            : 'auth/login.html';
        });
      }

      supabaseClient.auth.onAuthStateChange(function (event, newSession) {
        if (event === 'SIGNED_OUT' || !newSession) {
          showLoggedOut();
        } else if (event === 'SIGNED_IN' && newSession && newSession.user) {
          showLoggedIn(newSession.user);
        }
      });

    } else {
      showLoggedOut();
    }
  })();
});
