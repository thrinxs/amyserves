/* ══════════════════════════════════════════════════════
   AUTH.JS — Shared auth utilities
   Used by login.html, signup.html, forgot-password.html
   and all dashboard pages.
══════════════════════════════════════════════════════ */

/* ── GET SESSION ─────────────────────────────────────── */
async function getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  }
  
  /* ── REQUIRE AUTH ────────────────────────────────────── */
  async function requireAuth(allowedRoles) {
    const session = await getSession();
  
    if (!session) {
      window.location.href = '/auth/login.html';
      return null;
    }
  
    const role = session.user?.user_metadata?.role || 'client';
  
    if (allowedRoles && !allowedRoles.includes(role)) {
      const redirects = {
        admin:  '/dashboard/admin/index.html',
        staff:  '/dashboard/staff/index.html',
        client: '/dashboard/client/index.html'
      };
      window.location.href = redirects[role] || '/auth/login.html';
      return null;
    }
  
    return session;
  }
  
  /* ── SIGN OUT ────────────────────────────────────────── */
  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    window.location.href = '/auth/login.html';
  }
  
  /* ── GET USER DISPLAY NAME ───────────────────────────── */
  function getUserDisplayName(session) {
    if (!session) return 'User';
    const meta = session.user?.user_metadata || {};
    return meta.full_name || session.user?.email?.split('@')[0] || 'User';
  }
  
  /* ── GET USER INITIALS ───────────────────────────────── */
  function getUserInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }