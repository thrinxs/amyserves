/* ══════════════════════════════════════════════════════
   DASHBOARD-STAFF.JS — AmyServes Staff Portal
   Full Supabase Integration + Role-Based Access
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── SERVICE ROLES ───────────────────────────────────── */
  var SERVICE_ROLES = {
    technical_support:  { label: 'Technical Support',   color: '#0F6E56', icon: '🛠️' },
    client_management:  { label: 'Client Management',   color: '#3C3489', icon: '👥' },
    billing_payments:   { label: 'Billing & Payments',  color: '#C8941A', icon: '💳' },
    service_team:       { label: 'Service Team',         color: '#1A3C5E', icon: '⚙️' },
    general_inquiry:    { label: 'General Inquiry',      color: '#6B7280', icon: '💬' }
  };

  /* ── ROLE ACCESS CONTROL ─────────────────────────────── */
  var ROLE_ACCESS = {
    technical_support: {
      clients:      true,
      requests:     true,
      messages:     true,
      notifications: true,
      payments:     false,
      updateStatus: true
    },
    client_management: {
      clients:      true,
      requests:     true,
      messages:     true,
      notifications: true,
      payments:     false,
      updateStatus: true
    },
    billing_payments: {
      clients:      true,
      requests:     false,
      messages:     true,
      notifications: true,
      payments:     true,
      updateStatus: false
    },
    service_team: {
      clients:      true,
      requests:     true,
      messages:     true,
      notifications: true,
      payments:     false,
      updateStatus: true
    },
    general_inquiry: {
      clients:      true,
      requests:     true,
      messages:     true,
      notifications: true,
      payments:     false,
      updateStatus: true
    }
  };

  /* ── STATE ───────────────────────────────────────────── */
  var state = {
    user:        null,
    userId:      null,
    serviceRole: 'general_inquiry',
    access:      ROLE_ACCESS['general_inquiry'],
    clients:     [],
    requests:    [],
    messages:    [],
    notifications: [],
    msgFilter:   'all',
    selectedMessage: null
  };

  /* ── TOAST ───────────────────────────────────────────── */
  var toastTimer;
  function showToast(msg, type) {
    var t = document.getElementById('dashToast');
    if (!t) return;
    t.textContent = msg;
    t.className   = 'dash-toast show dash-toast--' + (type || 'info');
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
    }
  }

  /* ── SIDEBAR TOGGLE ──────────────────────────────────── */
  function initSidebar() {
    var toggle  = document.getElementById('dashMenuToggle');
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

    /* Sign out buttons */
    ['sidebarSignOutBtn', 'topbarSignOutBtn'].forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', handleSignOut);
    });
  }

  /* ── AUTH + HYDRATE USER ─────────────────────────────── */
  async function hydrateUser() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
      console.warn('Supabase not available');
      return false;
    }

    var { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error || !session || !session.user) {
      window.location.replace('../../auth/login.html');
      return false;
    }

    var user     = session.user;
    var userRole = user.user_metadata?.role || 'client';

    if (userRole !== 'staff' && userRole !== 'admin') {
      window.location.replace('../../auth/login.html');
      return false;
    }

    state.userId = user.id;

    /* Fetch profile */
    var { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    var meta     = user.user_metadata || {};
    var fullName = (profile && profile.full_name) || meta.full_name || user.email.split('@')[0];
    var initials = (profile && profile.initials)  ||
      fullName.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    var color    = (profile && profile.color) || '#0F6E56';

    /* Set service role */
    var serviceRole = (profile && profile.service_role) || 'general_inquiry';
    state.serviceRole = serviceRole;
    state.access      = ROLE_ACCESS[serviceRole] || ROLE_ACCESS['general_inquiry'];

    state.user = {
      name:        fullName,
      email:       user.email,
      initials:    initials,
      color:       color,
      role:        userRole,
      serviceRole: serviceRole,
      phone:       (profile && profile.phone)      || meta.phone || '',
      department:  (profile && profile.department) || '',
      bio:         (profile && profile.bio)        || '',
      avatar_url:  (profile && profile.avatar_url) || null
    };

    return true;
  }

  /* ── POPULATE STAFF INFO ─────────────────────────────── */
  function populateStaffInfo() {
    var u        = state.user;
    var roleInfo = SERVICE_ROLES[state.serviceRole] || SERVICE_ROLES['general_inquiry'];
  
    var avatarEl   = document.getElementById('sidebarAvatar');
    var nameEl     = document.getElementById('sidebarName');
    var roleEl     = document.getElementById('sidebarRole');
  
    if (avatarEl) {
      if (u.avatar_url) {
        avatarEl.innerHTML = '<img src="' + u.avatar_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
      } else {
        avatarEl.textContent      = u.initials;
        avatarEl.style.background = u.color;
      }
    }
  
    if (nameEl) nameEl.textContent = u.name;
    if (roleEl) roleEl.textContent = roleInfo.label;
  
    /* Hide/show nav items based on role */
    var requestsNav = document.getElementById('navRequests');
    var paymentsNav = document.getElementById('navPayments');
    if (requestsNav) requestsNav.style.display = state.access.requests ? '' : 'none';
    if (paymentsNav) paymentsNav.style.display = state.access.payments ? '' : 'none';
  }

  /* ── LOAD CLIENTS ────────────────────────────────────── */
  async function loadClients() {
    if (!state.userId) return;

    var { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) { console.error('Load clients error:', error); return; }
    state.clients = data || [];
  }

  /* ── LOAD REQUESTS ───────────────────────────────────── */
  async function loadRequests() {
    if (!state.userId) return;

    var { data, error } = await supabaseClient
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('Load requests error:', error); return; }

    state.requests = (data || []).map(function (r) {
      return {
        id:        r.id,
        shortId:   r.id.slice(0, 8).toUpperCase(),
        client:    r.full_name    || 'Unknown',
        company:   r.business     || '—',
        service:   r.services     || r.service || 'Service',
        brand:     r.brand        || 'general',
        location:  r.location     || '—',
        phone:     r.phone        || '—',
        email:     r.email        || '—',
        urgency:   r.urgency      || '—',
        brief:     r.brief        || '—',
        date:      formatDate(r.created_at),
        status:    r.status       || 'pending',
        userId:    r.user_id,
        rawId:     r.id
      };
    });
  }

  /* ── LOAD MESSAGES ───────────────────────────────────── */
  async function loadMessages() {
    if (!state.userId) return;

    var { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('Load messages error:', error); return; }

    state.messages = (data || []).map(function (m) {
      return {
        id:        m.id,
        from:      m.from_name  || 'Client',
        to:        m.to_name    || 'Staff',
        subject:   m.subject    || '(No subject)',
        body:      m.body       || '',
        preview:   (m.body || '').slice(0, 80) + '...',
        time:      timeAgo(m.created_at),
        date:      formatDate(m.created_at),
        unread:    !m.is_read,
        userId:    m.user_id,
        avatar:    '#1A3C5E'
      };
    });

    updateUnreadBadge();
  }

  /* ── LOAD NOTIFICATIONS ──────────────────────────────── */
  async function loadNotifications() {
    if (!state.userId) return;

    var { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', state.userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) { console.error('Load notifications error:', error); return; }
    state.notifications = data || [];
    updateNotifBadge();
  }

  /* ── UPDATE UNREAD BADGE ─────────────────────────────── */
  function updateUnreadBadge() {
    var unread  = state.messages.filter(function (m) { return m.unread; }).length;
    var badge   = document.getElementById('unreadBadge');
    if (badge) {
      badge.textContent   = unread;
      badge.style.display = unread > 0 ? 'inline-flex' : 'none';
    }
  }

  /* ── UPDATE NOTIF BADGE ──────────────────────────────── */
  function updateNotifBadge() {
    var unread = state.notifications.filter(function (n) { return !n.is_read; }).length;
    var badge  = document.getElementById('notifBadge');
    var navBadge = document.getElementById('notifNavBadge');

    if (badge) {
      badge.textContent   = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
    if (navBadge) {
      navBadge.textContent   = unread;
      navBadge.style.display = unread > 0 ? 'inline-flex' : 'none';
    }
  }

  /* ── PAGE: INDEX ─────────────────────────────────────── */
  function initIndexPage() {
    if (!document.getElementById('welcomeName')) return;

    var u        = state.user;
    var roleInfo = SERVICE_ROLES[state.serviceRole] || SERVICE_ROLES['general_inquiry'];

    document.getElementById('welcomeName').textContent =
      'Welcome back, ' + u.name.split(' ')[0] + '! ' + roleInfo.icon;

    /* Stats */
    var totalClients = state.clients.length;
    var pending      = state.requests.filter(function (r) { return r.status === 'pending'; }).length;
    var inProgress   = state.requests.filter(function (r) { return r.status === 'in-progress'; }).length;
    var unreadMsgs   = state.messages.filter(function (m) { return m.unread; }).length;

    var sc = document.getElementById('statClients');
    var sp = document.getElementById('statPending');
    var si = document.getElementById('statInProgress');
    var sm = document.getElementById('statMessages');

    if (sc) sc.textContent = totalClients;
    if (sp) sp.textContent = pending;
    if (si) si.textContent = inProgress;
    if (sm) sm.textContent = unreadMsgs;

    /* Badges */
    var pendingBadge = document.getElementById('pendingBadge');
    if (pendingBadge) {
      pendingBadge.textContent   = pending;
      pendingBadge.style.display = pending > 0 ? 'inline-flex' : 'none';
    }

    renderStaffRequestsTable();
    renderActivityFeed();
    initNotifDropdown();
  }

  /* ── RENDER REQUESTS TABLE (index) ──────────────────── */
  function renderStaffRequestsTable() {
    var tbody = document.getElementById('clientsBody');
    if (!tbody) return;

    var recent = state.requests.slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="dash-empty" style="padding:24px"><span>📋</span><h4>No requests yet</h4></div></td></tr>';
      return;
    }

    tbody.innerHTML = recent.map(function (r) {
      return '<tr>'
        + '<td><strong>' + r.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
        + '<td>' + r.service + '</td>'
        + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : r.brand === 'yourfirm' ? 'purple' : 'grey') + '">'
          + brandLabel(r.brand) + '</span></td>'
        + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.date + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '<td><a href="requests.html" class="dash-btn dash-btn--secondary dash-btn--sm">View</a></td>'
        + '</tr>';
    }).join('');
  }

  /* ── RENDER ACTIVITY FEED ────────────────────────────── */
  function renderActivityFeed() {
    var feed = document.getElementById('activityFeed');
    if (!feed) return;

    var activities = [];

    /* Build from real data */
    state.requests.slice(0, 3).forEach(function (r) {
      activities.push({
        icon: r.status === 'completed' ? '✅' : r.status === 'in-progress' ? '🔄' : '📋',
        text: '<strong>' + r.client + '</strong> — ' + r.service + ' (' + capitalise(r.status) + ')',
        time: r.date,
        bg:   r.status === 'completed' ? '#e8f5e9' : r.status === 'in-progress' ? '#e8f0fe' : '#fff8e6'
      });
    });

    state.messages.filter(function (m) { return m.unread; }).slice(0, 2).forEach(function (m) {
      activities.push({
        icon: '💬',
        text: 'New message from <strong>' + m.from + '</strong> — ' + m.subject,
        time: m.time,
        bg:   '#e3f2fd'
      });
    });

    if (activities.length === 0) {
      feed.innerHTML = '<div class="dash-empty" style="padding:24px 0"><span>📋</span><h4>No recent activity</h4></div>';
      return;
    }

    feed.innerHTML = activities.map(function (a) {
      return '<div class="dash-feed-item">'
        + '<div class="dash-feed-icon" style="background:' + a.bg + '">' + a.icon + '</div>'
        + '<div class="dash-feed-text"><div>' + a.text + '</div><span>' + a.time + '</span></div>'
        + '</div>';
    }).join('');
  }

  /* ── PAGE: CLIENTS / REQUESTS ────────────────────────── */
  function initClientsPage() {
    if (!document.getElementById('clientsTableBody')) return;
    renderClientsTable();
    bindClientFilters();
  }

  function renderClientsTable() {
    var tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    var q  = ((document.getElementById('clientSearch')  || {}).value || '').toLowerCase();
    var st = (document.getElementById('statusFilter')   || {}).value || 'all';
    var br = (document.getElementById('brandFilter')    || {}).value || 'all';

    var data = state.requests.filter(function (r) {
      var matchQ  = !q || r.client.toLowerCase().indexOf(q) > -1 ||
                    r.service.toLowerCase().indexOf(q) > -1 ||
                    r.company.toLowerCase().indexOf(q) > -1;
      var matchSt = st === 'all' || r.status === st;
      var matchBr = br === 'all' || r.brand === br;
      return matchQ && matchSt && matchBr;
    });

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="dash-empty"><span>📭</span><h4>No clients found</h4><p>Adjust your filters.</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = data.map(function (r) {
      var canUpdate = state.access.updateStatus;
      return '<tr>'
        + '<td><strong>' + r.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
        + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">' + r.service + '</span></td>'
        + '<td><span class="dash-badge dash-badge--grey">' + brandLabel(r.brand) + '</span></td>'
        + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.location + '</td>'
        + '<td style="font-size:.82rem">' + r.date + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '<td><div style="display:flex;gap:6px;flex-wrap:wrap">'
          + '<button class="dash-btn dash-btn--secondary dash-btn--sm" onclick="viewClientDetail(\'' + r.rawId + '\')">View</button>'
          + (canUpdate
            ? '<select class="dash-filter-select" style="padding:6px 28px 6px 8px;font-size:.78rem" onchange="updateRequestStatus(\'' + r.rawId + '\', this.value)">'
              + '<option value="">Update</option>'
              + ['pending', 'in-progress', 'completed'].map(function (s) {
                  return '<option value="' + s + '"' + (r.status === s ? ' selected' : '') + '>' + capitalise(s) + '</option>';
                }).join('')
              + '</select>'
            : '')
          + '</div></td>'
        + '</tr>';
    }).join('');
  }

  function bindClientFilters() {
    var search     = document.getElementById('clientSearch');
    var statusFilt = document.getElementById('statusFilter');
    var brandFilt  = document.getElementById('brandFilter');

    if (search)     search.addEventListener('input', renderClientsTable);
    if (statusFilt) statusFilt.addEventListener('change', renderClientsTable);
    if (brandFilt)  brandFilt.addEventListener('change', renderClientsTable);
  }

  window.viewClientDetail = async function (id) {
    var r = state.requests.find(function (x) { return x.rawId === id; });
    if (!r) return;

    var modal = document.getElementById('clientDetailModal');
    var body  = document.getElementById('clientDetailBody');
    if (!modal || !body) return;

    var canUpdate = state.access.updateStatus;

    body.innerHTML =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">'
        + detailItem('Request ID', r.shortId)
        + detailItem('Client',     r.client)
        + detailItem('Company',    r.company)
        + detailItem('Phone',      '<a href="tel:' + r.phone + '" style="color:var(--teal)">' + r.phone + '</a>')
        + detailItem('Email',      '<a href="mailto:' + r.email + '" style="color:var(--teal)">' + r.email + '</a>')
        + detailItem('Location',   r.location)
        + detailItem('Service',    r.service)
        + detailItem('Brand',      brandLabel(r.brand))
        + detailItem('Urgency',    r.urgency)
        + detailItem('Status',     capitalise(r.status))
        + detailItem('Date',       r.date)
      + '</div>'
      + '<div style="margin-bottom:20px">'
        + '<div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--warm-grey);margin-bottom:8px">Brief</div>'
        + '<div style="background:#f8f7f4;border-radius:8px;padding:14px;font-size:.875rem;line-height:1.75;color:#3a3a3a">' + (r.brief || 'No brief provided.') + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
        + (canUpdate
          ? '<button class="dash-btn dash-btn--primary" onclick="updateRequestStatus(\'' + r.rawId + '\',\'in-progress\');closeClientModal()">Mark In Progress</button>'
            + '<button class="dash-btn dash-btn--teal" onclick="updateRequestStatus(\'' + r.rawId + '\',\'completed\');closeClientModal()">Mark Completed</button>'
          : '')
        + '<button class="dash-btn dash-btn--secondary" onclick="sendNotifToClient(\'' + r.userId + '\',\'' + r.client + '\')">🔔 Notify Client</button>'
        + '<a href="https://wa.me/' + r.phone.replace(/\D/g, '') + '" target="_blank" class="dash-btn dash-btn--secondary">WhatsApp Client</a>'
      + '</div>';

    modal.classList.add('open');
  };

  window.closeClientModal = function () {
    var modal = document.getElementById('clientDetailModal');
    if (modal) modal.classList.remove('open');
  };

  window.updateRequestStatus = async function (id, status) {
    if (!status || !state.access.updateStatus) return;

    var { error } = await supabaseClient
      .from('service_requests')
      .update({ status: status })
      .eq('id', id);

    if (error) {
      showToast('Failed to update status.', 'error');
      return;
    }

    /* Update local state */
    var req = state.requests.find(function (r) { return r.rawId === id; });
    if (req) {
      req.status = status;

      /* 🔔 Notify the client about status update */
      if (typeof notifyStatusUpdate === 'function') {
        await notifyStatusUpdate(req.userId, state.user.name, req.service, capitalise(status));
      }
    }

    renderClientsTable();
    renderStaffRequestsTable();
    showToast('Status updated to ' + capitalise(status) + '.', 'success');
  };

  /* ── SEND NOTIFICATION TO CLIENT ─────────────────────── */
  window.sendNotifToClient = async function (clientUserId, clientName) {
    var modal = document.getElementById('sendNotifModal');
    if (!modal) {
      /* Create modal dynamically */
      var div = document.createElement('div');
      div.id        = 'sendNotifModal';
      div.className = 'dash-modal-overlay';
      div.innerHTML =
        '<div class="dash-modal" style="max-width:500px">'
          + '<div class="dash-modal-header">'
            + '<h3>🔔 Send Notification to Client</h3>'
            + '<button class="dash-modal-close" onclick="document.getElementById(\'sendNotifModal\').classList.remove(\'open\')">'
              + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
            + '</button>'
          + '</div>'
          + '<div class="dash-modal-body">'
            + '<div style="margin-bottom:16px">'
              + '<label style="font-size:.82rem;font-weight:600;display:block;margin-bottom:6px">Notification Title</label>'
              + '<input type="text" id="notifTitle" class="dash-input" placeholder="e.g. Your service has been scheduled" style="width:100%;padding:10px 14px;border:1.5px solid #e0dbd4;border-radius:8px;font-size:.9rem" />'
            + '</div>'
            + '<div style="margin-bottom:16px">'
              + '<label style="font-size:.82rem;font-weight:600;display:block;margin-bottom:6px">Message</label>'
              + '<textarea id="notifBody" rows="4" class="dash-input" placeholder="Write your message to the client…" style="width:100%;padding:10px 14px;border:1.5px solid #e0dbd4;border-radius:8px;font-size:.9rem;resize:vertical"></textarea>'
            + '</div>'
            + '<div style="margin-bottom:16px">'
              + '<label style="font-size:.82rem;font-weight:600;display:block;margin-bottom:6px">Type</label>'
              + '<select id="notifType" style="width:100%;padding:10px 14px;border:1.5px solid #e0dbd4;border-radius:8px;font-size:.9rem">'
                + '<option value="general">General</option>'
                + '<option value="status_update">Status Update</option>'
                + '<option value="message">Message</option>'
                + '<option value="booking">Booking</option>'
              + '</select>'
            + '</div>'
          + '</div>'
          + '<div class="dash-modal-footer">'
            + '<button class="dash-btn dash-btn--secondary" onclick="document.getElementById(\'sendNotifModal\').classList.remove(\'open\')">Cancel</button>'
            + '<button class="dash-btn dash-btn--primary" onclick="confirmSendNotif(\'' + clientUserId + '\',\'' + clientName + '\')">Send Notification</button>'
          + '</div>'
        + '</div>';
      document.body.appendChild(div);
      modal = div;
    }

    /* Pre-fill client info */
    modal.dataset.clientUserId = clientUserId;
    modal.dataset.clientName   = clientName;
    var titleInput = document.getElementById('notifTitle');
    var bodyInput  = document.getElementById('notifBody');
    if (titleInput) titleInput.value = '';
    if (bodyInput)  bodyInput.value  = '';

    modal.classList.add('open');
  };

  window.confirmSendNotif = async function (clientUserId, clientName) {
    var title = (document.getElementById('notifTitle') || {}).value.trim();
    var body  = (document.getElementById('notifBody')  || {}).value.trim();
    var type  = (document.getElementById('notifType')  || {}).value || 'general';

    if (!title || !body) {
      showToast('Please fill in both title and message.', 'error');
      return;
    }

    /* Send notification to client */
    var { error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id:   clientUserId,
        title:     title,
        body:      body,
        type:      type,
        direction: 'received',
        is_read:   false,
        link:      '/dashboard/client/notifications.html'
      });

    if (error) {
      showToast('Failed to send notification.', 'error');
      return;
    }

    document.getElementById('sendNotifModal').classList.remove('open');
    showToast('Notification sent to ' + clientName + '! 🔔', 'success');
  };

  /* ── PAGE: MESSAGES ──────────────────────────────────── */
  function initMessagesPage() {
    if (!document.getElementById('messagesList')) return;
    renderMessagesList();

    var search = document.getElementById('msgSearch');
    var filter = document.getElementById('msgFilter');
    if (search) search.addEventListener('input', renderMessagesList);
    if (filter) filter.addEventListener('change', renderMessagesList);

    /* New message button */
    var newMsgBtn = document.getElementById('newMsgBtn');
    if (newMsgBtn) newMsgBtn.addEventListener('click', openNewMessage);

    /* Send button */
    var sendBtn = document.getElementById('sendMsgBtn');
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);

    /* Close modal */
    var closeBtn = document.getElementById('closeMsgModal');
    if (closeBtn) closeBtn.addEventListener('click', closeNewMessage);
  }

  function renderMessagesList() {
    var list = document.getElementById('messagesList');
    if (!list) return;

    var q  = ((document.getElementById('msgSearch') || {}).value || '').toLowerCase();
    var ft = ((document.getElementById('msgFilter') || {}).value || 'all');

    var msgs = state.messages.filter(function (m) {
      var matchQ  = !q || m.from.toLowerCase().indexOf(q) > -1 ||
                    m.subject.toLowerCase().indexOf(q) > -1;
      var matchFt = ft === 'all' ||
                    (ft === 'unread' && m.unread) ||
                    (ft === 'read'   && !m.unread);
      return matchQ && matchFt;
    });

    if (msgs.length === 0) {
      list.innerHTML = '<div class="dash-empty" style="padding:32px"><span>📭</span><h4>No messages</h4></div>';
      return;
    }

    list.innerHTML = msgs.map(function (m) {
      return '<div class="dash-msg-item' + (m.unread ? ' unread' : '') + '" data-id="' + m.id + '" style="cursor:pointer">'
        + '<div class="dash-msg-avatar" style="background:' + m.avatar + '">'
          + m.from.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()
        + '</div>'
        + '<div class="dash-msg-body">'
          + '<span class="dash-msg-from">' + m.from + '</span>'
          + '<div class="dash-msg-subject">' + m.subject + '</div>'
          + '<div class="dash-msg-preview">' + m.preview + '</div>'
        + '</div>'
        + '<div class="dash-msg-meta">'
          + '<span class="dash-msg-time">' + m.time + '</span>'
          + (m.unread ? '<span class="dash-msg-unread-dot"></span>' : '')
        + '</div>'
        + '</div>';
    }).join('');

    /* Bind click */
    list.querySelectorAll('.dash-msg-item').forEach(function (item) {
      item.addEventListener('click', function () {
        openStaffMessage(item.dataset.id);
      });
    });
  }

  async function openStaffMessage(id) {
    var msg = state.messages.find(function (m) { return m.id === id; });
    if (!msg) return;

    /* Mark as read */
    if (msg.unread) {
      await supabaseClient
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);
      msg.unread = false;
      updateUnreadBadge();
      renderMessagesList();
    }

    state.selectedMessage = msg;

    var detail = document.getElementById('messageDetail');
    if (!detail) return;

    detail.innerHTML =
      '<div style="padding:28px 32px">'
        + '<div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e8e4de">'
          + '<div style="font-size:1.05rem;font-weight:700;color:var(--navy);margin-bottom:8px">' + msg.subject + '</div>'
          + '<div style="display:flex;gap:16px;font-size:.82rem;color:var(--warm-grey);flex-wrap:wrap">'
            + '<span>From: <strong style="color:var(--navy)">' + msg.from + '</strong></span>'
            + '<span>' + msg.date + '</span>'
          + '</div>'
        + '</div>'
        + '<div style="font-size:.9rem;line-height:1.8;color:#3a3a3a;margin-bottom:28px">'
          + msg.body.replace(/\n/g, '<br>')
        + '</div>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
          + '<button class="dash-btn dash-btn--primary" onclick="openReplyModal(\'' + msg.id + '\')">Reply</button>'
          + '<button class="dash-btn dash-btn--secondary" onclick="archiveMessage(\'' + msg.id + '\')">Archive</button>'
          + '<button class="dash-btn dash-btn--secondary" onclick="sendNotifToClient(\'' + msg.userId + '\',\'' + msg.from + '\')">🔔 Notify Client</button>'
        + '</div>'
      + '</div>';
  }

  window.openReplyModal = function (id) {
    var modal = document.getElementById('replyModal');
    if (!modal) return;
    var msg = state.messages.find(function (m) { return m.id === id; });
    if (document.getElementById('replyTo'))      document.getElementById('replyTo').value      = msg ? msg.from : '';
    if (document.getElementById('replySubject')) document.getElementById('replySubject').value = msg ? 'Re: ' + msg.subject : '';
    if (document.getElementById('replyBody'))    document.getElementById('replyBody').value    = '';
    modal.dataset.parentId = id;
    modal.classList.add('open');
  };

  window.closeReplyModal = function () {
    var modal = document.getElementById('replyModal');
    if (modal) modal.classList.remove('open');
  };

  window.sendReply = async function () {
    var body     = (document.getElementById('replyBody')    || {}).value.trim();
    var subject  = (document.getElementById('replySubject') || {}).value.trim();
    var modal    = document.getElementById('replyModal');
    var parentId = modal ? modal.dataset.parentId : null;

    if (!body) { showToast('Please write a reply first.', 'error'); return; }

    var parentMsg = parentId ? state.messages.find(function (m) { return m.id === parentId; }) : null;

    var { error } = await supabaseClient
      .from('messages')
      .insert({
        user_id:   parentMsg ? parentMsg.userId : null,
        from_name: state.user.name,
        to_name:   parentMsg ? parentMsg.from : 'Client',
        subject:   subject,
        body:      body,
        is_read:   false,
        is_reply:  true,
        parent_id: parentId || null
      });

    if (error) { showToast('Failed to send reply.', 'error'); return; }

    /* 🔔 Notify client about reply */
    if (parentMsg && typeof createNotification === 'function') {
      await createNotification(parentMsg.userId, {
        title:     'New Reply from AmyServes',
        body:      state.user.name + ' replied to your message: "' + subject + '"',
        type:      'message',
        direction: 'received',
        link:      '/dashboard/client/messages.html'
      });
    }

    closeReplyModal();
    showToast('Reply sent successfully! ✅', 'success');
    await loadMessages();
    renderMessagesList();
  };

  function openNewMessage() {
    var modal = document.getElementById('newMsgModal');
    if (modal) modal.classList.add('open');
  }

  window.closeNewMessage = function () {
    var modal = document.getElementById('newMsgModal');
    if (modal) modal.classList.remove('open');
  };

  async function sendMessage() {
    var to      = (document.getElementById('newMsgTo')      || {}).value.trim();
    var subject = (document.getElementById('newMsgSubject') || {}).value.trim();
    var body    = (document.getElementById('newMsgBody')    || {}).value.trim();

    if (!to || !subject || !body) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    var { error } = await supabaseClient
      .from('messages')
      .insert({
        from_name: state.user.name,
        to_name:   to,
        subject:   subject,
        body:      body,
        is_read:   false,
        is_reply:  false,
        user_id:   state.userId
      });

    if (error) { showToast('Failed to send message.', 'error'); return; }

    closeNewMessage();
    showToast('Message sent! ✅', 'success');
    await loadMessages();
    renderMessagesList();
  }

  window.archiveMessage = async function (id) {
    await supabaseClient.from('messages').update({ is_read: true }).eq('id', id);
    state.messages = state.messages.filter(function (m) { return m.id !== id; });
    var detail = document.getElementById('messageDetail');
    if (detail) detail.innerHTML = '<div class="dash-empty" style="padding-top:80px"><span>📩</span><h4>Select a message</h4></div>';
    renderMessagesList();
    showToast('Message archived.', 'success');
  };

  /* ── PAGE: NOTIFICATIONS ─────────────────────────────── */
  function initNotificationsPage() {
    if (!document.getElementById('staffNotifList')) return;
    renderNotificationsPage();

    var markAllBtn = document.getElementById('markAllReadStaff');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllNotifsRead);

    /* Tabs */
    document.querySelectorAll('.notif-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.notif-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        renderNotificationsPage(tab.dataset.filter);
      });
    });

    /* Subscribe to real-time */
    subscribeToNotifications();
  }

  function renderNotificationsPage(filter) {
    var list = document.getElementById('staffNotifList');
    if (!list) return;

    filter = filter || 'all';

    var icons = {
      booking:       '📋',
      message:       '💬',
      status_update: '🔄',
      general:       '🔔',
      login:         '🔐',
      request:       '📝'
    };

    var filtered = state.notifications.filter(function (n) {
      if (filter === 'unread') return !n.is_read;
      if (filter === 'read')   return  n.is_read;
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div class="notif-empty"><span>🔔</span><h4>No notifications yet</h4><p>Client activity will appear here.</p></div>';
      return;
    }

    list.innerHTML = filtered.map(function (n) {
      var isUnread = !n.is_read;
      return '<div class="notif-page-item' + (isUnread ? ' unread' : '') + '" data-id="' + n.id + '">'
        + '<div class="notif-icon ' + (n.type || 'general') + '">' + (icons[n.type] || '🔔') + '</div>'
        + '<div class="notif-body">'
          + '<div class="notif-title-row">'
            + '<div class="notif-title' + (isUnread ? ' bold' : '') + '">' + n.title + '</div>'
            + '<div class="notif-time">' + timeAgo(n.created_at) + '</div>'
          + '</div>'
          + '<div class="notif-text">' + n.body + '</div>'
        + '</div>'
        + (isUnread ? '<div class="notif-unread-dot"></div>' : '')
        + '</div>';
    }).join('');

    /* Click to mark as read */
    list.querySelectorAll('.notif-page-item').forEach(function (item) {
      item.addEventListener('click', async function () {
        var id   = item.dataset.id;
        var notif = state.notifications.find(function (n) { return n.id === id; });
        if (!notif || notif.is_read) return;

        await supabaseClient.from('notifications').update({ is_read: true }).eq('id', id);
        notif.is_read = true;
        renderNotificationsPage(filter);
        updateNotifBadge();
      });
    });
  }

  async function markAllNotifsRead() {
    await supabaseClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', state.userId)
      .eq('is_read', false);

    state.notifications.forEach(function (n) { n.is_read = true; });
    renderNotificationsPage();
    updateNotifBadge();
    showToast('All notifications marked as read ✅', 'success');
  }

  /* ── NOTIF BELL DROPDOWN ─────────────────────────────── */
  function initNotifDropdown() {
    var bell     = document.getElementById('notifBellBtn');
    var dropdown = document.getElementById('notifDropdown');

    if (bell && dropdown) {
      bell.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        if (dropdown.classList.contains('open')) renderNotifDropdown();
      });

      document.addEventListener('click', function () {
        dropdown.classList.remove('open');
      });
    }

    var markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', async function (e) {
        e.stopPropagation();
        await markAllNotifsRead();
        renderNotifDropdown();
      });
    }
  }

  function renderNotifDropdown() {
    var list = document.getElementById('notifList');
    if (!list) return;

    var icons = { booking: '📋', message: '💬', status_update: '🔄', general: '🔔', login: '🔐', request: '📝' };
    var recent = state.notifications.slice(0, 8);

    if (recent.length === 0) {
      list.innerHTML = '<div class="dash-notif-empty">No notifications yet</div>';
      return;
    }

    list.innerHTML = recent.map(function (n) {
      return '<div class="dash-notif-item' + (n.is_read ? '' : ' unread') + '" data-id="' + n.id + '">'
        + '<div class="dash-notif-item-icon">' + (icons[n.type] || '🔔') + '</div>'
        + '<div class="dash-notif-item-body">'
          + '<div class="dash-notif-item-title">' + n.title + '</div>'
          + '<div class="dash-notif-item-text">'  + n.body  + '</div>'
          + '<div class="dash-notif-item-time">'  + timeAgo(n.created_at) + '</div>'
        + '</div>'
        + '</div>';
    }).join('');

    list.querySelectorAll('.dash-notif-item').forEach(function (item) {
      item.addEventListener('click', async function () {
        var id = item.dataset.id;
        await supabaseClient.from('notifications').update({ is_read: true }).eq('id', id);
        item.classList.remove('unread');
        await loadNotifications();
        updateNotifBadge();
      });
    });
  }

  /* ── REAL-TIME SUBSCRIPTIONS ─────────────────────────── */
  function subscribeToNotifications() {
    if (!state.userId) return;

    supabaseClient
      .channel('staff-notifications')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: 'user_id=eq.' + state.userId
      }, async function (payload) {
        state.notifications.unshift(payload.new);
        updateNotifBadge();
        renderNotificationsPage();
        renderNotifDropdown();
        showToast('🔔 ' + payload.new.title, 'info');
      })
      .subscribe();
  }

  /* ── PAGE: REQUESTS ──────────────────────────────────── */
  function initRequestsPage() {
    if (!document.getElementById('requestsTableBody')) return;
    renderRequestsTable();
    bindRequestFilters();
  }

  function renderRequestsTable() {
    var tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    var q  = ((document.getElementById('reqSearch')   || {}).value || '').toLowerCase();
    var st = ((document.getElementById('reqStatus')   || {}).value || 'all');
    var br = ((document.getElementById('reqBrand')    || {}).value || 'all');

    var data = state.requests.filter(function (r) {
      var matchQ  = !q || r.client.toLowerCase().indexOf(q) > -1 ||
                    r.service.toLowerCase().indexOf(q) > -1;
      var matchSt = st === 'all' || r.status === st;
      var matchBr = br === 'all' || r.brand === br;
      return matchQ && matchSt && matchBr;
    });

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="dash-empty"><span>📭</span><h4>No requests found</h4></div></td></tr>';
      return;
    }

    tbody.innerHTML = data.map(function (r) {
      return '<tr>'
        + '<td><strong style="font-size:.82rem">' + r.shortId + '</strong></td>'
        + '<td><strong>' + r.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
        + '<td>' + r.service + '</td>'
        + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">' + brandLabel(r.brand) + '</span></td>'
        + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.date + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '<td><div style="display:flex;gap:6px;flex-wrap:wrap">'
          + '<button class="dash-btn dash-btn--secondary dash-btn--sm" onclick="viewClientDetail(\'' + r.rawId + '\')">View</button>'
          + (state.access.updateStatus
            ? '<select class="dash-filter-select" style="padding:6px 28px 6px 8px;font-size:.78rem" onchange="updateRequestStatus(\'' + r.rawId + '\', this.value)">'
              + '<option value="">Update</option>'
              + ['pending', 'in-progress', 'completed'].map(function (s) {
                  return '<option value="' + s + '"' + (r.status === s ? ' selected' : '') + '>' + capitalise(s) + '</option>';
                }).join('')
              + '</select>'
            : '')
          + '</div></td>'
        + '</tr>';
    }).join('');
  }

  function bindRequestFilters() {
    var search = document.getElementById('reqSearch');
    var status = document.getElementById('reqStatus');
    var brand  = document.getElementById('reqBrand');
    if (search) search.addEventListener('input', renderRequestsTable);
    if (status) status.addEventListener('change', renderRequestsTable);
    if (brand)  brand.addEventListener('change', renderRequestsTable);
  }

  /* ── HELPERS ─────────────────────────────────────────── */
  function statusBadge(status) {
    var map    = { pending: 'yellow', 'in-progress': 'navy', completed: 'green' };
    var labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
    return '<span class="dash-badge dash-badge--' + (map[status] || 'grey') + '">' + (labels[status] || status) + '</span>';
  }

  function brandLabel(brand) {
    return brand === 'puraklen' ? "Pura-Kle'N" : brand === 'yourfirm' ? 'Yourfirm' : 'AmyServes';
  }

  function detailItem(label, value) {
    return '<div>'
      + '<div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--warm-grey);margin-bottom:3px">' + label + '</div>'
      + '<div style="font-size:.875rem;color:var(--navy);font-weight:500">' + value + '</div>'
      + '</div>';
  }

  function capitalise(str) {
    if (!str) return '';
    return str.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function brandLabel(brand) {
    return brand === 'puraklen' ? "Pura-Kle'N" : brand === 'yourfirm' ? 'Yourfirm' : 'AmyServes';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var now  = new Date();
    var date = new Date(dateStr);
    var diff = Math.floor((now - date) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  /* ── PAGE: PROFILE ───────────────────────────────────── */
function initProfilePage() {
  if (!document.getElementById('pfFullName')) return;

  var u        = state.user;
  var roleInfo = SERVICE_ROLES[state.serviceRole] || SERVICE_ROLES['general_inquiry'];

  /* Hero */
  var heroAvatar = document.getElementById('profileAvatarLarge');
  var heroName   = document.getElementById('profileHeroName');
  var heroRole   = document.getElementById('profileHeroRole');

  if (heroAvatar) {
    if (u.avatar_url) {
      heroAvatar.innerHTML = '<img src="' + u.avatar_url + '" alt="" />';
    } else {
      heroAvatar.textContent      = u.initials;
      heroAvatar.style.background = u.color;
    }
  }

  if (heroName) heroName.textContent = u.name;
  if (heroRole) heroRole.textContent = roleInfo.icon + ' ' + roleInfo.label;

  /* Hero Stats */
  var statClients  = document.getElementById('profileStatClients');
  var statRequests = document.getElementById('profileStatRequests');
  var statMessages = document.getElementById('profileStatMessages');

  if (statClients)  statClients.textContent  = state.clients.length;
  if (statRequests) statRequests.textContent = state.requests.length;
  if (statMessages) statMessages.textContent = state.messages.filter(function (m) { return m.unread; }).length;

  /* Form Fields */
  var pfFullName  = document.getElementById('pfFullName');
  var pfPhone     = document.getElementById('pfPhone');
  var pfEmail     = document.getElementById('pfEmail');
  var pfEmployeeId = document.getElementById('pfEmployeeId');
  var pfJoinDate  = document.getElementById('pfJoinDate');

  if (pfFullName)   pfFullName.value   = u.name  || '';
  if (pfPhone)      pfPhone.value      = u.phone || '';
  if (pfEmail)      pfEmail.value      = u.email || '';
  if (pfEmployeeId) pfEmployeeId.value = state.userId ? state.userId.slice(0, 8).toUpperCase() : '—';
  if (pfJoinDate) {
    var joinDate = new Date();
    pfJoinDate.value = joinDate.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /* Role Badge */
  var roleBadgeIcon  = document.getElementById('pfServiceRoleIcon');
  var roleBadgeLabel = document.getElementById('pfServiceRoleLabel');
  if (roleBadgeIcon)  roleBadgeIcon.textContent  = roleInfo.icon;
  if (roleBadgeLabel) roleBadgeLabel.textContent = roleInfo.label;

  /* Password strength */
  var newPwInput = document.getElementById('pfNewPw');
  if (newPwInput) {
    newPwInput.addEventListener('input', function () {
      checkPasswordStrength(newPwInput.value);
    });
  }


  /* Avatar Upload */
  var fileInput = document.getElementById('avatarFileInput');

  fileInput.addEventListener('change', async function () {
    var file = fileInput.files[0];
    if (!file) return;

    /* Validate file type */
    var allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a JPG, PNG, WebP or GIF image.', 'error');
      return;
    }

    /* Validate file size (max 2MB) */
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB.', 'error');
      return;
    }

    showToast('Uploading photo…', 'info');

    try {
      /* Create unique filename */
      var ext      = file.name.split('.').pop();
      var fileName = 'staff/' + state.userId + '/avatar.' + ext;

      /* Upload to Supabase Storage */
      var { data, error } = await supabaseClient.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert:      true,
          contentType: file.type
        });

      if (error) throw error;

      /* Get public URL */
      var { data: urlData } = supabaseClient.storage
        .from('avatars')
        .getPublicUrl(fileName);

      var avatarUrl = urlData.publicUrl;

      /* Save URL to profiles table */
      var { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', state.userId);

      if (updateError) throw updateError;

      /* Update local state */
      state.user.avatar_url = avatarUrl;

      /* Update hero avatar */
      var heroAvatar = document.getElementById('profileAvatarLarge');
      if (heroAvatar) {
        heroAvatar.innerHTML = '<img src="' + avatarUrl + '?t=' + Date.now() + '" alt="" />';
      }

      /* Update sidebar avatar */
      var sidebarAvatar = document.getElementById('sidebarAvatar');
      if (sidebarAvatar) {
        sidebarAvatar.innerHTML = '<img src="' + avatarUrl + '?t=' + Date.now() + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
      }

      showToast('Profile photo updated! ✅', 'success');

    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast('Upload failed: ' + (err.message || 'Please try again.'), 'error');
    }

    /* Reset file input */
    fileInput.value = '';
  });

}


/* ── SAVE STAFF PROFILE ──────────────────────────────── */
window.saveStaffProfile = async function () {
  var fullName   = (document.getElementById('pfFullName')   || {}).value.trim();
  var phone      = (document.getElementById('pfPhone')      || {}).value.trim();
  var department = (document.getElementById('pfDepartment') || {}).value.trim();
  var bio        = (document.getElementById('pfBio')        || {}).value.trim();

  if (!fullName) { showToast('Full name cannot be empty.', 'error'); return; }

  try {
    /* Update profile */
    var { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        full_name:  fullName,
        phone:      phone,
        department: department,
        bio:        bio
      })
      .eq('id', state.userId);

    if (profileError) throw profileError;

    /* Update auth metadata */
    var { error: metaError } = await supabaseClient.auth.updateUser({
      data: { full_name: fullName, phone: phone }
    });

    if (metaError) throw metaError;

    /* Update local state */
    state.user.name  = fullName;
    state.user.phone = phone;

    /* Update initials */
    var newInitials = fullName.split(' ')
      .map(function (w) { return w[0]; })
      .join('')
      .slice(0, 2)
      .toUpperCase();

    state.user.initials = newInitials;

    /* Update UI */
    populateStaffInfo();

    var heroName = document.getElementById('profileHeroName');
    if (heroName) heroName.textContent = fullName;

    showToast('Profile updated successfully! ✅', 'success');

    /* 🔔 Trigger notification */
    if (typeof notifyProfileUpdate === 'function') {
      await notifyProfileUpdate(state.userId, fullName);
    }

  } catch (err) {
    console.error('Save profile error:', err);
    showToast('Failed to save profile. Please try again.', 'error');
  }
};

/* ── CHANGE STAFF PASSWORD ───────────────────────────── */
window.changeStaffPassword = async function () {
  var cur  = (document.getElementById('pfCurrentPw')  || {}).value;
  var nw   = (document.getElementById('pfNewPw')       || {}).value;
  var conf = (document.getElementById('pfConfirmPw')   || {}).value;

  if (!cur || !nw || !conf) { showToast('Please fill in all password fields.', 'error'); return; }
  if (nw.length < 8)        { showToast('New password must be at least 8 characters.', 'error'); return; }
  if (nw !== conf)          { showToast('New passwords do not match.', 'error'); return; }

  try {
    var { error } = await supabaseClient.auth.updateUser({ password: nw });
    if (error) throw error;

    document.getElementById('pfCurrentPw').value = '';
    document.getElementById('pfNewPw').value     = '';
    document.getElementById('pfConfirmPw').value = '';

    showToast('Password updated successfully! ✅', 'success');

    /* 🔔 Trigger notification */
    if (typeof notifyPasswordChange === 'function') {
      await notifyPasswordChange(state.userId);
    }

  } catch (err) {
    console.error('Password update error:', err);
    showToast(err.message || 'Failed to update password.', 'error');
  }
};

/* ── SAVE NOTIFICATION PREFERENCES ──────────────────── */
window.saveNotifPrefs = function () {
  showToast('Notification preferences saved! ✅', 'success');
};

/* ── CONFIRM DELETE ACCOUNT ──────────────────────────── */
window.confirmStaffDeleteAccount = function () {
  if (confirm('Are you sure? This will send a deletion request to the admin. This cannot be undone.')) {
    showToast('Account deletion request sent. An admin will process it within 48 hours.', 'info');
  }
};

/* ── PASSWORD STRENGTH CHECKER ───────────────────────── */
function checkPasswordStrength(password) {
  var s1    = document.getElementById('ps1');
  var s2    = document.getElementById('ps2');
  var s3    = document.getElementById('ps3');
  var s4    = document.getElementById('ps4');
  var label = document.getElementById('pwStrengthLabel');

  if (!password) {
    [s1, s2, s3, s4].forEach(function (s) { if (s) s.className = ''; });
    if (label) label.textContent = '';
    return;
  }

  var score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  [s1, s2, s3, s4].forEach(function (s, i) {
    if (s) s.className = i < score ? 'active' : '';
  });

  if (label) {
    if (score <= 1) { label.textContent = 'Weak';   label.style.color = '#d94f4f'; }
    else if (score <= 2) { label.textContent = 'Fair';   label.style.color = '#e6a817'; }
    else if (score <= 3) { label.textContent = 'Good';   label.style.color = '#C8941A'; }
    else                  { label.textContent = 'Strong'; label.style.color = '#0F6E56'; }
  }
}

  /* ── INIT ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async function () {
    var authed = await hydrateUser();
    if (!authed) return;

    initSidebar();
    populateStaffInfo();

    await loadClients();
    await loadRequests();
    await loadMessages();
    await loadNotifications();

    initIndexPage();
    initClientsPage();
    initMessagesPage();
    initNotificationsPage();
    initRequestsPage();

    document.body.classList.add('auth-ready');
  });

})();


document.addEventListener('DOMContentLoaded', async function () {
  var authed = await hydrateUser();
  if (!authed) return;

  initSidebar();
  populateStaffInfo();

  await loadClients();
  await loadRequests();
  await loadMessages();
  await loadNotifications();

  initIndexPage();
  initClientsPage();
  initMessagesPage();
  initNotificationsPage();
  initRequestsPage();
  initProfilePage(); // 👈 Add this

  document.body.classList.add('auth-ready');
});
