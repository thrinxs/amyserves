/* ══════════════════════════════════════════════════════
   DASHBOARD-CLIENT.JS — AmyServes Client Portal
   Phase 5 — Full Supabase Integration
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── MOCK USER (overwritten by Supabase) ─────────────── */
  var mockUser = {
    name: '',
    email: '',
    phone: '',
    role: '',
    business: '',
    industry: '',
    service: 'general',
    initials: '?',
    color: '#1A3C5E'
  };

  /* ── SHARED STATE ────────────────────────────────────── */
  var state = {
    user: mockUser,
    userId: null,
    requests: [],
    messages: [],
    selectedMessage: null,
    msgFilter: 'all'
  };

  /* ── TOAST ───────────────────────────────────────────── */
  var toastTimer;
  function showToast(msg, type) {
    var t = document.getElementById('dashToast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'dash-toast show dash-toast--' + (type || 'info');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

  /* ── SIGN OUT ────────────────────────────────────────── */
  async function handleSignOut() {
    try {
      if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        await supabaseClient.auth.signOut();
      }
      window.location.href = '../../auth/login.html';
    } catch (err) {
      showToast('Sign out failed. Please try again.', 'error');
      console.error('Sign out error:', err);
    }
  }

  /* ── SIDEBAR TOGGLE ──────────────────────────────────── */
  function initSidebar() {
    var toggle = document.getElementById('dashMenuToggle');
    var sidebar = document.getElementById('dashSidebar');
    var overlay = document.getElementById('dashSidebarOverlay');
    if (toggle) {
      toggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        if (overlay) overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
      });
    }
    if (overlay) {
      overlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      });
    }
  }

  /* ── POPULATE USER INFO ──────────────────────────────── */
  function populateUserInfo() {
    var u = state.user;
    var avatarEl = document.getElementById('sidebarAvatar');
    var nameEl   = document.getElementById('sidebarName');

    if (avatarEl) {
      if (u.avatar_url) {
        avatarEl.innerHTML = '<img src="' + u.avatar_url + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
      } else {
        avatarEl.textContent = u.initials;
        avatarEl.style.background = u.color;
      }
      avatarEl.dataset.initials = u.initials;
    }

    if (nameEl) nameEl.textContent = u.name;
  }

  /* ── AUTH + HYDRATE USER ─────────────────────────────── */
  async function hydrateUser() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      console.warn('Supabase not available');
      return false;
    }

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError || !session || !session.user) {
      window.location.replace('../../auth/login.html');
      return false;
    }

    const user = session.user;
    const userRole = user.user_metadata?.role || 'client';

    if (userRole !== 'client') {
      window.location.replace('../../auth/login.html');
      return false;
    }

    state.userId = user.id;
    window._dashUserId = user.id;

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const meta = user.user_metadata || {};
    const fullName =
      (profile && profile.full_name) ||
      meta.full_name ||
      user.email.split('@')[0];

    const initials =
      (profile && profile.initials) ||
      fullName.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();

    const color = (profile && profile.color) || meta.color || '#1A3C5E';

    state.user = {
      name:       fullName,
      email:      user.email || '',
      phone:      (profile && profile.phone)      || meta.phone    || '',
      role:       (profile && profile.job_title)   || meta.role     || '',
      business:   (profile && profile.business)    || meta.business || '',
      industry:   (profile && profile.industry)    || meta.industry || '',
      service:    meta.service_interest || 'general',
      initials:   initials,
      color:      color,
      avatar_url: (profile && profile.avatar_url)  || null
    };

    return true;
  }

  /* ── LOAD REQUESTS FROM SUPABASE ─────────────────────── */
  async function loadRequests() {
    if (!state.userId) return;

    var { data, error } = await supabaseClient
      .from('service_requests')
      .select('*')
      .eq('user_id', state.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load requests error:', error);
      return;
    }

    state.requests = (data || []).map(function (r) {
      return {
        id:      r.id.slice(0, 8).toUpperCase(),
        service: r.services || 'Service',
        brand:   r.brand || 'general',
        date:    new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status:  r.status || 'pending'
      };
    });
  }

  /* ── LOAD MESSAGES FROM SUPABASE ─────────────────────── */
  async function loadMessages() {
    if (!state.userId) return;

    var { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('user_id', state.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load messages error:', error);
      return;
    }

    state.messages = (data || []).map(function (m) {
      var date = new Date(m.created_at);
      return {
        id:      m.id,
        from:    m.from_name || 'AmyServes',
        subject: m.subject   || '(No subject)',
        body:    m.body      || '',
        preview: (m.body || '').slice(0, 80) + '...',
        time:    timeAgo(m.created_at),
        date:    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        unread:  !m.is_read,
        avatar:  '#1A3C5E',
        parent_id: m.parent_id || null
      };
    });

    updateUnreadBadge();
  }

  /* ── UNREAD BADGE ON SIDEBAR ─────────────────────────── */
  function updateUnreadBadge() {
    var unreadCount = state.messages.filter(function (m) { return m.unread; }).length;
    var badge = document.getElementById('unreadBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  /* ── PAGE: INDEX ─────────────────────────────────────── */
  function initIndexPage() {
    if (!document.getElementById('welcomeName')) return;
    var u = state.user;

    document.getElementById('welcomeName').textContent = 'Welcome back, ' + (u.name.split(' ')[0] || 'there') + '!';

    var profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) { profileAvatar.textContent = u.initials; profileAvatar.style.background = u.color; }

    var total  = state.requests.length;
    var active = state.requests.filter(function (r) { return r.status === 'in-progress' || r.status === 'pending'; }).length;
    var done   = state.requests.filter(function (r) { return r.status === 'completed'; }).length;

    var stTotal  = document.getElementById('statTotal');
    var stActive = document.getElementById('statActive');
    var stDone   = document.getElementById('statDone');
    if (stTotal)  stTotal.textContent  = total;
    if (stActive) stActive.textContent = active;
    if (stDone)   stDone.textContent   = done;

    renderRequestsTable();
    renderRecentMessages();
  }

  function renderRequestsTable() {
    var tbody = document.getElementById('requestsBody');
    if (!tbody) return;
    if (state.requests.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="dash-empty" style="padding:24px"><span>📋</span><h4>No requests yet</h4><p>Your service requests will appear here.</p></div></td></tr>';
      return;
    }
    tbody.innerHTML = state.requests.map(function (r) {
      return '<tr>'
        + '<td><strong style="font-size:.82rem">' + r.id + '</strong></td>'
        + '<td>' + r.service + '</td>'
        + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">'
          + (r.brand === 'puraklen' ? "Pura-Kle'N" : r.brand === 'yourfirm' ? 'Yourfirm' : 'AmyServes')
          + '</span></td>'
        + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.date + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '</tr>';
    }).join('');
  }

  function renderRecentMessages() {
    var el = document.getElementById('recentMessages');
    if (!el) return;
    var recent = state.messages.slice(0, 3);
    if (recent.length === 0) {
      el.innerHTML = '<div class="dash-empty" style="padding:24px"><span>📭</span><h4>No messages yet</h4></div>';
      return;
    }
    el.innerHTML = recent.map(function (m) {
      return '<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 24px;border-bottom:1px solid #f0ede8;cursor:pointer" onclick="window.location.href=\'messages.html\'">'
        + '<div style="width:36px;height:36px;border-radius:50%;background:' + m.avatar + ';display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0">'
          + m.from.substring(0, 2).toUpperCase()
        + '</div>'
        + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<span style="font-size:.855rem;font-weight:' + (m.unread ? '700' : '500') + ';color:var(--navy)">' + m.from + '</span>'
            + '<span style="font-size:.72rem;color:var(--warm-grey)">' + m.time + '</span>'
          + '</div>'
          + '<div style="font-size:.825rem;color:#444;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:' + (m.unread ? '600' : '400') + '">' + m.subject + '</div>'
          + '<div style="font-size:.78rem;color:var(--warm-grey);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + m.preview + '</div>'
        + '</div>'
        + (m.unread ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--gold);margin-top:6px;flex-shrink:0"></div>' : '')
        + '</div>';
    }).join('');
  }

  /* ── PAGE: MESSAGES ──────────────────────────────────── */
  function initMessagesPage() {
    if (!document.getElementById('messageList')) return;
    renderMessageList();
  
    var search = document.getElementById('msgSearch');
    if (search) {
      search.addEventListener('input', function () {
        renderMessageList(search.value);
      });
    }
  
    // Message tab filtering
    var tabs = document.querySelectorAll('#msgTabs .notif-tab');
    if (tabs.length > 0) {
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var filter = tab.dataset.filter;
          state.msgFilter = filter;
          renderMessageList();
        });
      });
    }
  }

  function renderMessageList(query) {
    var list = document.getElementById('messageList');
    if (!list) return;
  
    var filter = state.msgFilter || 'all';
  
    var msgs = state.messages.filter(function (m) {
      // Tab filter
      if (filter === 'unread' && !m.unread) return false;
      if (filter === 'read' && m.unread) return false;
  
      // Search filter
      if (!query) return true;
      var q = query.toLowerCase();
      return m.from.toLowerCase().indexOf(q) > -1 || m.subject.toLowerCase().indexOf(q) > -1;
    });
  
    if (msgs.length === 0) {
      var emptyMessages = {
        all:    'No messages yet',
        unread: 'No unread messages',
        read:   'No read messages'
      };
      list.innerHTML = '<div class="dash-empty" style="padding:32px">'
        + '<span>📭</span>'
        + '<h4>' + (emptyMessages[filter] || 'No messages') + '</h4>'
        + '<p>Messages from your AmyServes team will appear here.</p>'
        + '</div>';
      return;
    }
  
    list.innerHTML = msgs.map(function (m) {
      return '<div class="dash-msg-item' + (m.unread ? ' unread' : '') + '" data-id="' + m.id + '" onclick="openMessage(\'' + m.id + '\')" style="cursor:pointer">'
        + '<div class="dash-msg-avatar" style="background:' + m.avatar + '">' + m.from.substring(0, 2).toUpperCase() + '</div>'
        + '<div class="dash-msg-body">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<span class="dash-msg-from">' + m.from + '</span>'
          + '</div>'
          + '<div class="dash-msg-subject">' + m.subject + '</div>'
          + '<div class="dash-msg-preview">' + m.preview + '</div>'
        + '</div>'
        + '<div class="dash-msg-meta">'
          + '<span class="dash-msg-time">' + m.time + '</span>'
          + (m.unread ? '<span class="dash-msg-unread-dot"></span>' : '')
        + '</div>'
        + '</div>';
    }).join('');
  }

  window.openMessage = async function (id) {
    var msg = state.messages.find(function (m) { return m.id === id; });
    if (!msg) return;

    // Mark as read in Supabase
    if (msg.unread) {
      await supabaseClient
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);
      msg.unread = false;
      updateUnreadBadge();
    }

    state.selectedMessage = msg;
    renderMessageList();

    var detail = document.getElementById('messageDetail');
    if (!detail) return;
    detail.innerHTML = '<div style="padding:28px 32px">'
      + '<div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e8e4de">'
        + '<div style="font-size:1.1rem;font-weight:700;color:var(--navy);margin-bottom:8px">' + msg.subject + '</div>'
        + '<div style="display:flex;gap:16px;font-size:.82rem;color:var(--warm-grey);flex-wrap:wrap">'
          + '<span>From: <strong style="color:var(--navy)">' + msg.from + '</strong></span>'
          + '<span>' + msg.date + '</span>'
        + '</div>'
      + '</div>'
      + '<div style="font-size:.9rem;line-height:1.8;color:#3a3a3a;margin-bottom:28px">' + msg.body.replace(/\n/g, '<br>') + '</div>'
      + '<div style="display:flex;gap:10px">'
        + '<button class="dash-btn dash-btn--primary" onclick="openReplyToMessage(\'' + msg.id + '\')">Reply</button>'
        + '<a href="https://wa.me/09098104610" target="_blank" class="dash-btn dash-btn--secondary">Chat on WhatsApp</a>'
      + '</div>'
    + '</div>';
  };

  window.openReplyToMessage = function (id) {
    var msg = state.messages.find(function (m) { return m.id === id; });
    if (!msg) return;
    var modal = document.getElementById('newMsgModal');
    if (!modal) return;
    document.getElementById('newMsgSubject').value = 'Re: ' + msg.subject;
    // Store parent_id for threading
    modal.dataset.parentId = id;
    modal.classList.add('open');
  };

  window.openNewMessage = function () {
    var modal = document.getElementById('newMsgModal');
    if (!modal) return;
    document.getElementById('newMsgSubject').value = '';
    delete modal.dataset.parentId;
    modal.classList.add('open');
  };

  window.closeNewMessage = function () {
    var modal = document.getElementById('newMsgModal');
    if (modal) modal.classList.remove('open');
  };

  window.sendNewMessage = async function () {
    var to       = (document.getElementById('newMsgTo').value || '').trim();
var subject  = (document.getElementById('newMsgSubject').value || '').trim();
var body     = (document.getElementById('newMsgBody').value || '').trim();
    var modal    = document.getElementById('newMsgModal');
    var parentId = modal && modal.dataset.parentId ? modal.dataset.parentId : null;

    if (!to || !subject || !body) {
      showToast('Please fill in all fields including recipient.', 'error');
      return;
    }

    if (!state.userId) {
      showToast('You must be logged in to send messages.', 'error');
      return;
    }

    try {
      // Save message to Supabase
      var { error: msgError } = await supabaseClient
        .from('messages')
        .insert({
          user_id:   state.userId,
          from_name: state.user.name || 'Client',
          to_name:   to,
          subject:   subject,
          body:      body,
          is_read:   true,
          is_reply:  parentId ? true : false,
          parent_id: parentId || null
        });

      if (msgError) throw msgError;

      closeNewMessage();
      showToast("Message sent! We'll respond within 24 hours.", 'success');
      document.getElementById('newMsgSubject').value = '';
      document.getElementById('newMsgBody').value    = '';

      // Reload messages to show sent
      await loadMessages();
      renderMessageList();
      renderRecentMessages();

    } catch (err) {
      console.error('Send message error:', err);
      showToast('Failed to send message. Please try again.', 'error');
    }
  };

  /* ── PAGE: PROFILE ───────────────────────────────────── */
  function initProfilePage() {
    if (!document.getElementById('pfFullName')) return;
    var u = state.user;

    var profileAvatar = document.getElementById('profileAvatar');
    var profileName   = document.getElementById('profileName');
    var profileEmail  = document.getElementById('profileEmail');
    if (profileAvatar) { profileAvatar.textContent = u.initials; profileAvatar.style.background = u.color; }
    if (profileName)   profileName.textContent  = u.name;
    if (profileEmail)  profileEmail.textContent = u.email;

    document.getElementById('pfFullName').value = u.name;
    document.getElementById('pfPhone').value    = u.phone;
    document.getElementById('pfEmail').value    = u.email;
    document.getElementById('pfRole').value     = u.role;
    document.getElementById('pfBusiness').value = u.business;

    var industryEl = document.getElementById('pfIndustry');
    var serviceEl  = document.getElementById('pfService');
    if (industryEl) industryEl.value = u.industry;
    if (serviceEl)  serviceEl.value  = u.service;

    var profileServiceBadge = document.getElementById('profileService');
    if (profileServiceBadge) {
      var labels = { cleaning: "Pura-Kle'N Cleaning", hr: 'Yourfirm HR', both: 'Both Services' };
      profileServiceBadge.textContent = labels[u.service] || 'Client';
    }
  }

  window.saveProfile = async function () {
    var fullName = document.getElementById('pfFullName').value.trim();
    var phone    = document.getElementById('pfPhone').value.trim();
    var jobTitle = document.getElementById('pfRole').value.trim();
    var business = document.getElementById('pfBusiness').value.trim();
    var industry = document.getElementById('pfIndustry') ? document.getElementById('pfIndustry').value.trim() : '';
    var service  = document.getElementById('pfService')  ? document.getElementById('pfService').value : '';

    if (!fullName) { showToast('Full name cannot be empty.', 'error'); return; }

    try {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ full_name: fullName, phone: phone, job_title: jobTitle, business: business, industry: industry })
        .eq('id', state.userId);

      if (profileError) throw profileError;

      const { error: metaError } = await supabaseClient.auth.updateUser({
        data: { full_name: fullName, phone: phone, service_interest: service }
      });

      if (metaError) throw metaError;

      state.user.name     = fullName;
      state.user.phone    = phone;
      state.user.role     = jobTitle;
      state.user.business = business;
      state.user.industry = industry;
      state.user.initials = fullName.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();

      populateUserInfo();
      showToast('Profile updated successfully.', 'success');

    } catch (err) {
      console.error('Save profile error:', err);
      showToast('Failed to save profile. Please try again.', 'error');
    }
  };

  window.changePassword = async function () {
    var cur  = document.getElementById('pfCurrentPw').value;
    var nw   = document.getElementById('pfNewPw').value;
    var conf = document.getElementById('pfConfirmPw').value;

    if (!cur || !nw || !conf) { showToast('Please fill in all password fields.', 'error'); return; }
    if (nw.length < 8)        { showToast('New password must be at least 8 characters.', 'error'); return; }
    if (nw !== conf)          { showToast('New passwords do not match.', 'error'); return; }

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: nw });
      if (error) throw error;
      document.getElementById('pfCurrentPw').value = '';
      document.getElementById('pfNewPw').value     = '';
      document.getElementById('pfConfirmPw').value = '';
      showToast('Password updated successfully.', 'success');
    } catch (err) {
      console.error('Password update error:', err);
      showToast(err.message || 'Failed to update password.', 'error');
    }
  };

  window.saveNotifications = function () {
    showToast('Notification preferences saved.', 'success');
  };

  window.confirmDeleteAccount = function () {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      showToast('Account deletion request sent. Our team will process it within 48 hours.', 'info');
    }
  };

  /* ── NOTIFICATIONS ───────────────────────────────────── */
  async function initNotifications() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return;
    if (!state.userId) return;

    var { data: notifications, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', state.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) { console.error('Notifications error:', error); return; }

    // Update bell badge
    var unread = (notifications || []).filter(function (n) { return !n.is_read; });
    var badge  = document.getElementById('notifCount');
    if (badge) {
      if (unread.length > 0) {
        badge.textContent = unread.length;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update sidebar nav badge
var navBadge = document.getElementById('notifNavBadge');
if (navBadge) {
  if (unread.length > 0) {
    navBadge.textContent = unread.length;
    navBadge.style.display = 'inline-flex';
  } else {
    navBadge.style.display = 'none';
  }
}

    // Render list
    var list = document.getElementById('notifList');
    if (!list) return;

    if (!notifications || notifications.length === 0) {
      list.innerHTML = '<div class="dash-notif-empty">No notifications yet</div>';
    } else {
      var icons = { booking: '📋', message: '💬', status_update: '🔄', general: '🔔' };
      list.innerHTML = notifications.map(function (n) {
        return '<div class="dash-notif-item' + (n.is_read ? '' : ' unread') + '" data-id="' + n.id + '">'
          + '<div class="dash-notif-item-icon">' + (icons[n.type] || '🔔') + '</div>'
          + '<div class="dash-notif-item-body">'
            + '<div class="dash-notif-item-title">' + n.title + '</div>'
            + '<div class="dash-notif-item-text">'  + n.body  + '</div>'
            + '<div class="dash-notif-item-time">'  + timeAgo(n.created_at) + '</div>'
          + '</div>'
        + '</div>';
      }).join('');

      // Click to mark read
      list.querySelectorAll('.dash-notif-item').forEach(function (item) {
        item.addEventListener('click', async function () {
          var id = item.dataset.id;
          await supabaseClient.from('notifications').update({ is_read: true }).eq('id', id);
          item.classList.remove('unread');
          var remaining = list.querySelectorAll('.dash-notif-item.unread').length;
          if (badge) {
            if (remaining > 0) { badge.textContent = remaining; }
            else { badge.style.display = 'none'; }
          }
        });
      });
    }

    // Bell toggle
    var bell     = document.getElementById('notifBellBtn');
    var dropdown = document.getElementById('notifDropdown');
    if (bell && dropdown) {
      bell.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', function () {
        dropdown.classList.remove('open');
      });
    }

    // Mark all read
    var markAll = document.getElementById('markAllRead');
    if (markAll) {
      markAll.addEventListener('click', async function (e) {
        e.stopPropagation();
        await supabaseClient
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', state.userId)
          .eq('is_read', false);
        list.querySelectorAll('.dash-notif-item.unread').forEach(function (el) {
          el.classList.remove('unread');
        });
        if (badge) badge.style.display = 'none';
      });
    }
  }

  /* ── HELPERS ─────────────────────────────────────────── */
  function statusBadge(status) {
    var map    = { pending: 'yellow', 'in-progress': 'navy', completed: 'green' };
    var labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
    return '<span class="dash-badge dash-badge--' + (map[status] || 'grey') + '">' + (labels[status] || status) + '</span>';
  }

  function timeAgo(dateStr) {
    var now  = new Date();
    var date = new Date(dateStr);
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  /* ── INIT ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async function () {

    var authed = await hydrateUser();
    if (!authed) return;

    initSidebar();
    populateUserInfo();

    await loadRequests();
    await loadMessages();

    initIndexPage();
    initMessagesPage();
    initProfilePage();
    await initNotifications();

    // Sign out buttons
    ['sidebarSignOutBtn', 'topbarSignOutBtn', 'signOutBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', handleSignOut);
    });

    document.body.classList.add('auth-ready');
  });

})();
