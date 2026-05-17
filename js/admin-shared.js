/* ══════════════════════════════════════════════════════
   ADMIN-SHARED.JS — AmyServes Admin Portal
   Shared auth + UI init for all admin pages
══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    document.addEventListener('DOMContentLoaded', async function () {
  
      /* ── 1. Auth check — redirect if not admin ── */
      var session = await requireAuth(['admin']);
      if (!session) return;
  
      /* ── 2. Get real name and initials ── */
      var name     = getUserDisplayName(session);
      var initials = getUserInitials(name);
  
      /* ── 3. Update sidebar footer ── */
      var avatarEl = document.querySelector('.dash-user-avatar');
      var nameEl   = document.querySelector('.dash-user-name');
      var roleEl   = document.querySelector('.dash-user-role');
  
      if (avatarEl) {
        avatarEl.textContent = initials;
  
        /* Load avatar from profiles table */
        var { data: profile } = await supabaseClient
          .from('profiles')
          .select('avatar_url, color')
          .eq('id', session.user.id)
          .single();
  
        if (profile && profile.avatar_url) {
          avatarEl.innerHTML = '<img src="' + profile.avatar_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
        } else if (profile && profile.color) {
          avatarEl.style.background = profile.color;
        }
      }
  
      if (nameEl)   nameEl.textContent = name;
      if (roleEl)   roleEl.textContent = 'Administrator';
  
      /* ── 4. Make sidebar chip clickable → profile ── */
      var userChip = document.querySelector('.dash-user-chip');
      if (userChip) {
        userChip.style.cursor = 'pointer';
        userChip.title        = 'View Profile';
        userChip.addEventListener('click', function () {
          window.location.href = 'profile.html';
        });
      }
  
      /* ── 5. Fix sign out buttons ── */
      document.querySelectorAll('[title="Sign out"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          signOut();
        });
      });
  
      /* ── 6. Update nav badges ── */
      try {
        /* Unread messages count */
        var { count: unreadCount } = await supabaseClient
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);
  
        /* Pending requests count */
        var { count: pendingCount } = await supabaseClient
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
  
        /* Update message badges */
        document.querySelectorAll('.dash-nav-badge--red').forEach(function (badge) {
          badge.textContent   = unreadCount || 0;
          badge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
        });
  
        /* Update request badges */
        document.querySelectorAll('.dash-nav-badge:not(.dash-nav-badge--red)').forEach(function (badge) {
          badge.textContent   = pendingCount || 0;
          badge.style.display = pendingCount > 0 ? 'inline-flex' : 'none';
        });
  
        /* Topbar notification dot */
        var notifDot = document.querySelector('.dash-notif-dot');
        if (notifDot) {
          notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
        }
  
      } catch (err) {
        console.warn('Badge update error:', err);
      }
  
      /* ── 7. Show the page ── */
      document.body.style.opacity = '1';
  
    });
  
  })();
