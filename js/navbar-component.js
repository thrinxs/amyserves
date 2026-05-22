/* ══════════════════════════════════════════════════════
   NAVBAR COMPONENT
   Shared across all pages. Edit once, updates everywhere.
   Active link is set automatically based on current URL.
══════════════════════════════════════════════════════ */

(function () {

    // ── NAVBAR HTML ──────────────────────────────────────
    // Edit your nav links here and it updates on every page
    const navbarHTML = `
      <!-- Row 1: Logo + Links + Get Started + Hamburger -->
      <div class="container">
  
        <a href="/index.html" class="navbar-logo">
          <img src="/assets/images/logos/amyserves.png" alt="AmyServes" />
        </a>
  
        <ul class="navbar-links">
          <li><a href="/index.html" data-page="index">Home</a></li>
          <li>
            <a href="/puraklen/index.html" class="brand-link" data-page="puraklen">
              <img src="/assets/images/logos/puraklen.png" alt="" class="nav-brand-logo" />
              Pura-Kle'N
            </a>
          </li>
          <li>
            <a href="/yourfirm/index.html" class="brand-link" data-page="yourfirm">
              <img src="/assets/images/logos/yourfirm.png" alt="" class="nav-brand-logo" />
              Yourfirm
            </a>
          </li>
          <li><a href="/about.html" data-page="about">About</a></li>
          <li><a href="/services.html" data-page="services">Services</a></li>
          <li><a href="/blog.html" data-page="blog">Blog</a></li>
          <li><a href="/contact.html" data-page="contact">Contact</a></li>
        </ul>
  
        <div class="navbar-cta navbar-cta--top">
          <a href="/contact.html" class="btn-getstarted">
            <span>Get Started</span> →
          </a>
        </div>
  
        <button class="navbar-toggle" id="navToggle" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
  
      </div>
  
      <!-- Row 2: Auth (desktop only, right-aligned) -->
      <div class="navbar-auth-row">
        <div class="container">
          <div class="navbar-auth-wrap">
  
            <div class="navbar-auth-loading" id="navAuthLoading">
              <div class="nav-auth-skeleton"></div>
            </div>
  
            <div class="navbar-auth" id="navAuthOut" style="display:none">
              <a href="/auth/login.html" class="btn-nav-login">Sign In</a>
              <a href="/auth/signup.html" class="btn-nav-signup">Sign Up</a>
            </div>
  
            <div class="navbar-auth" id="navAuthIn" style="display:none">
              <button class="nav-profile-btn" id="navProfileBtn">
                <div class="nav-profile-avatar" id="navProfileAvatar">--</div>
                <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="currentColor"
                        stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
              <div class="nav-profile-dropdown" id="navProfileDropdown">
                <div class="nav-profile-info">
                  <div class="nav-profile-name" id="navProfileName">User</div>
                  <div class="nav-profile-email" id="navProfileEmail"></div>
                </div>
                <div class="nav-profile-divider"></div>
                <a href="/dashboard/client/index.html" class="nav-profile-link">
                  My Dashboard
                </a>
                <a href="/dashboard/client/profile.html" class="nav-profile-link">
                  My Profile
                </a>
                <div class="nav-profile-divider"></div>
                <button class="nav-profile-signout" id="navSignOutBtn">
                  Sign Out
                </button>
              </div>
            </div>
  
          </div>
        </div>
      </div>
  
      <!-- Mobile Menu -->
      <div class="navbar-mobile" id="navMobile">
        <div class="navbar-mobile-inner">
          <a href="/index.html" class="nav-link" data-page="index">Home</a>
          <a href="/puraklen/index.html" class="nav-link" data-page="puraklen">
            Pura-Kle'N
          </a>
          <a href="/yourfirm/index.html" class="nav-link" data-page="yourfirm">
            Yourfirm
          </a>
          <a href="/about.html" class="nav-link" data-page="about">About</a>
          <a href="/services.html" class="nav-link" data-page="services">
            Services
          </a>
          <a href="/blog.html" class="nav-link" data-page="blog">Blog</a>
          <a href="/contact.html" class="nav-link" data-page="contact">Contact</a>
  
          <div class="navbar-mobile-divider"></div>
  
          <div class="navbar-mobile-actions">
            <a href="https://wa.me/2349098104610?text=Hello%2C%20AmyServes%2C%20I%27d%20like%20to%20make%20inquiries%20about%20your%20services." target="_blank"
               class="btn-whatsapp-mobile">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp Us
            </a>
            <a href="/contact.html" class="btn-getstarted-mobile">
              Get Started →
            </a>
          </div>
  
          <div class="navbar-mobile-divider"></div>
  
          <!-- Mobile: Logged OUT -->
          <div class="navbar-mobile-auth" id="mobileAuthOut" style="display:flex">
            <a href="/auth/login.html" class="btn-mobile-login">Sign In</a>
            <a href="/auth/signup.html" class="btn-mobile-signup">Sign Up</a>
          </div>
  
          <!-- Mobile: Logged IN -->
          <div class="navbar-mobile-auth" id="mobileAuthIn" style="display:none">
            <a href="/dashboard/client/index.html" class="btn-mobile-dashboard">
              My Dashboard →
            </a>
          </div>
  
        </div>
      </div>
    `;
  
    // ── INJECT INTO PAGE ─────────────────────────────────
    const navEl = document.getElementById('navbar');
    if (!navEl) return;
    navEl.innerHTML = navbarHTML;
  
    // ── SET ACTIVE LINK ──────────────────────────────────
    // Works out which page we're on and highlights it
    const path = window.location.pathname;
  
    // Detect the current "page key"
    function getPageKey() {
      if (path.includes('/puraklen/')) return 'puraklen';
      if (path.includes('/yourfirm/')) return 'yourfirm';
      if (path.includes('/about'))    return 'about';
      if (path.includes('/services')) return 'services';
      if (path.includes('/blog'))     return 'blog';
      if (path.includes('/contact'))  return 'contact';
      return 'index'; // default = home
    }
  
    const currentPage = getPageKey();
  
    // Add active class to matching links
    document.querySelectorAll('[data-page]').forEach(link => {
      if (link.getAttribute('data-page') === currentPage) {
        link.classList.add('active');
      }
    });
  
    // ── HAMBURGER TOGGLE ─────────────────────────────────
    const navbar    = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
  
    if (navToggle) {
      navToggle.addEventListener('click', () => {
        navbar.classList.toggle('open');
      });
    }
  
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.navbar-mobile .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('open');
      });
    });
  
    // ── SCROLL EFFECT ────────────────────────────────────
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
  
    // ── AUTH STATE ───────────────────────────────────────
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
      const role     = meta.role || 'client';
      const initials = name.split(' ')
                           .map(w => w[0])
                           .join('')
                           .slice(0, 2)
                           .toUpperCase();
    
      // Set dashboard URL based on role
      const dashboardUrl = role === 'admin'  ? '/dashboard/admin/index.html'
                         : role === 'staff'  ? '/dashboard/staff/index.html'
                         : '/dashboard/client/index.html';
    
      if (profileAvatar) profileAvatar.textContent = initials;
      if (profileName)   profileName.textContent   = name;
      if (profileEmail)  profileEmail.textContent  = user.email;
    
      // Update desktop dashboard link
      var desktopDashLink = document.querySelector('.nav-profile-link[href*="dashboard"]');
      if (desktopDashLink) desktopDashLink.href = dashboardUrl;
    
      // Update mobile dashboard link
      var mobileDashLink = document.querySelector('.btn-mobile-dashboard');
      if (mobileDashLink) mobileDashLink.href = dashboardUrl;
    
      if (authIn)    authIn.style.display    = 'flex';
      if (authOut)   authOut.style.display   = 'none';
      if (mobileIn)  mobileIn.style.display  = 'flex';
      if (mobileOut) mobileOut.style.display = 'none';
    }
  
    // Dropdown toggle
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
  
    // Check Supabase session
    (async function () {
      if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        showLoggedOut();
        return;
      }
  
      let session = null;
      try {
        const { data } = await supabaseClient.auth.getSession();
        session = data?.session || null;
      } catch (e) {
        session = null;
      }
  
      if (session && session.user) {
        showLoggedIn(session.user);
  
        // Sign out button
        if (signOutBtn) {
          signOutBtn.addEventListener('click', async function () {
            await supabaseClient.auth.signOut();
            window.location.href = '/auth/login.html';
          });
        }
  
        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((event, newSession) => {
          if (event === 'SIGNED_OUT' || !newSession) {
            showLoggedOut();
          } else if (event === 'SIGNED_IN' && newSession?.user) {
            showLoggedIn(newSession.user);
          }
        });
  
      } else {
        showLoggedOut();
      }
    })();
  
  })();
