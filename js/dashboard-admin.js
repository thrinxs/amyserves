/* ══════════════════════════════════════════════════════
   DASHBOARD-ADMIN.JS — AmyServes Admin Portal
   Full Supabase Integration
   Replaces all mock data with real database calls
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── SHARED STATE ────────────────────────────────────── */
  var state = {
    session:         null,
    user:            null,
    requests:        [],
    messages:        [],
    selectedMessage: null,
    selectedRequest: null,
    searchQuery:     '',
    filterStatus:    'all',
    filterBrand:     'all'
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

  function getGreeting() {
    var hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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
  }

  /* ── POPULATE ADMIN INFO ─────────────────────────────── */
  function populateAdminInfo() {
    var u = state.user;
    if (!u) return;

    var name     = getUserDisplayName(state.session);
    var initials = getUserInitials(name);

    /* Sidebar footer */
    var avatarEl = document.querySelector('.dash-user-avatar');
    var nameEl   = document.querySelector('.dash-user-name');
    var roleEl   = document.querySelector('.dash-user-role');

    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl)   nameEl.textContent   = name;
    if (roleEl)   roleEl.textContent   = 'Administrator';

    /* Sign out buttons */
    document.querySelectorAll('[title="Sign out"], #signOutBtn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        signOut();
      });
    });
  }

  /* ── LOAD REQUESTS FROM SUPABASE ─────────────────────── */
  async function loadRequests() {
    if (!supabaseClient) return;

    var { data, error } = await supabaseClient
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load requests error:', error);
      return;
    }

    state.requests = (data || []).map(function (r) {
      return {
        id:       r.id,
        shortId:  r.id.slice(0, 8).toUpperCase(),
        client:   r.full_name    || 'Unknown',
        company:  r.business     || '—',
        service:  r.services     || r.service || 'Service',
        brand:    r.brand        || 'general',
        location: r.location     || '—',
        phone:    r.phone        || '—',
        email:    r.email        || '—',
        urgency:  r.urgency      || '—',
        brief:    r.brief        || '—',
        date:     formatDate(r.created_at),
        status:   r.status       || 'pending',
        userId:   r.user_id,
        rawId:    r.id,
        createdAt: r.created_at
      };
    });
  }

  /* ── LOAD MESSAGES FROM SUPABASE ─────────────────────── */
  async function loadMessages() {
    if (!supabaseClient) return;

    var { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load messages error:', error);
      return;
    }

    state.messages = (data || []).map(function (m) {
      return {
        id:       m.id,
        from:     m.from_name  || 'Client',
        email:    m.email      || '',
        subject:  m.subject    || '(No subject)',
        body:     m.body       || '',
        preview:  (m.body || '').slice(0, 80) + '...',
        time:     timeAgo(m.created_at),
        date:     formatDate(m.created_at),
        unread:   !m.is_read,
        brand:    m.brand      || 'general',
        userId:   m.user_id,
        avatar:   m.brand === 'puraklen' ? '#0F6E56' : m.brand === 'yourfirm' ? '#3C3489' : '#1A3C5E'
      };
    });

    updateNavBadges();
  }

  /* ── UPDATE NAV BADGES ───────────────────────────────── */
  function updateNavBadges() {
    var unreadMessages = state.messages.filter(function (m) { return m.unread; }).length;
    var pendingRequests = state.requests.filter(function (r) { return r.status === 'pending'; }).length;

    /* Messages badge */
    var msgBadges = document.querySelectorAll('.dash-nav-badge--red');
    msgBadges.forEach(function (badge) {
      badge.textContent = unreadMessages;
      badge.style.display = unreadMessages > 0 ? 'inline-flex' : 'none';
    });

    /* Requests badge */
    var allBadges = document.querySelectorAll('.dash-nav-badge:not(.dash-nav-badge--red)');
    allBadges.forEach(function (badge) {
      badge.textContent = pendingRequests;
      badge.style.display = pendingRequests > 0 ? 'inline-flex' : 'none';
    });

    /* Topbar notification dot */
    var notifDot = document.querySelector('.dash-notif-dot');
    if (notifDot) {
      notifDot.style.display = unreadMessages > 0 ? 'block' : 'none';
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE: INDEX (OVERVIEW)
  ══════════════════════════════════════════════════════ */
  function initIndexPage() {
    if (!document.getElementById('statTotalRequests')) return;

    var name = getUserDisplayName(state.session);

    /* Dynamic greeting */
    var header = document.querySelector('.dash-page-header h1');
    if (header) {
      header.textContent = getGreeting() + ', ' + name.split(' ')[0] + ' 👋';
    }

    /* Stats */
    var pending    = state.requests.filter(function (r) { return r.status === 'pending'; }).length;
    var inProgress = state.requests.filter(function (r) { return r.status === 'in-progress'; }).length;
    var unread     = state.messages.filter(function (m) { return m.unread; }).length;

    var stTotal      = document.getElementById('statTotalRequests');
    var stPending    = document.getElementById('statPending');
    var stInProgress = document.getElementById('statInProgress');
    var stMessages   = document.getElementById('statMessages');

    if (stTotal)      stTotal.textContent      = state.requests.length;
    if (stPending)    stPending.textContent    = pending;
    if (stInProgress) stInProgress.textContent = inProgress;
    if (stMessages)   stMessages.textContent   = unread;

    renderRecentRequestsTable();
    renderActivityFeed();
  }

  function renderRecentRequestsTable() {
    var tbody = document.getElementById('recentRequestsBody');
    if (!tbody) return;

    var recent = state.requests.slice(0, 5);

    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--warm-grey)">No requests yet.</td></tr>';
      return;
    }

    tbody.innerHTML = recent.map(function (r) {
      return '<tr>'
        + '<td><strong>' + r.shortId + '</strong></td>'
        + '<td>' + r.client + '<br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
        + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : r.brand === 'yourfirm' ? 'purple' : 'grey') + '">' + r.service + '</span></td>'
        + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.date + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '<td><button class="dash-btn dash-btn--secondary dash-btn--sm" onclick="viewRequest(\'' + r.rawId + '\')">View</button></td>'
        + '</tr>';
    }).join('');
  }

  function renderActivityFeed() {
    var feed = document.getElementById('activityFeed');
    if (!feed) return;

    var activities = [];

    /* Build from real requests */
    state.requests.slice(0, 3).forEach(function (r) {
      activities.push({
        icon: r.status === 'completed' ? '✅' : r.status === 'in-progress' ? '🔄' : '📋',
        text: '<strong>' + r.client + '</strong> — ' + r.service + ' (' + capitalise(r.status) + ')',
        time: timeAgo(r.createdAt),
        bg:   r.status === 'completed' ? '#e8f5e9' : r.status === 'in-progress' ? '#e8f0fe' : '#fff8e6'
      });
    });

    /* Build from real messages */
    state.messages.filter(function (m) { return m.unread; }).slice(0, 2).forEach(function (m) {
      activities.push({
        icon: '💬',
        text: 'New message from <strong>' + m.from + '</strong> — ' + m.subject,
        time: m.time,
        bg:   '#ede9ff'
      });
    });

    if (activities.length === 0) {
      feed.innerHTML = '<div class="dash-empty" style="padding:24px 0"><span>📋</span><h4>No recent activity</h4><p>Activity will appear here as clients submit requests and messages.</p></div>';
      return;
    }

    feed.innerHTML = activities.map(function (a) {
      return '<div class="dash-feed-item">'
        + '<div class="dash-feed-icon" style="background:' + a.bg + '">' + a.icon + '</div>'
        + '<div class="dash-feed-text"><div style="font-size:.855rem;color:var(--navy);font-weight:500">' + a.text + '</div><span>' + a.time + '</span></div>'
        + '</div>';
    }).join('');
  }

  /* ══════════════════════════════════════════════════════
     PAGE: MESSAGES
  ══════════════════════════════════════════════════════ */
  function initMessagesPage() {
    if (!document.getElementById('messagesList')) return;
    renderMessagesList();
    bindMessageEvents();
  }

  function renderMessagesList() {
    var list = document.getElementById('messagesList');
    if (!list) return;

    var filtered = state.messages.filter(function (m) {
      var q = state.searchQuery.toLowerCase();
      if (q && m.from.toLowerCase().indexOf(q) === -1 && m.subject.toLowerCase().indexOf(q) === -1) return false;
      if (state.filterBrand !== 'all' && m.brand !== state.filterBrand) return false;
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div class="dash-empty"><span>📭</span><h4>No messages found</h4><p>Try adjusting your search or filter.</p></div>';
      return;
    }

    list.innerHTML = filtered.map(function (m) {
      return '<div class="dash-msg-item' + (m.unread ? ' unread' : '') + '" data-id="' + m.id + '">'
        + '<div class="dash-msg-avatar" style="background:' + m.avatar + '">'
          + m.from.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()
        + '</div>'
        + '<div class="dash-msg-body">'
          + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<span class="dash-msg-from">' + m.from + '</span>'
            + '<span class="dash-badge dash-badge--' + (m.brand === 'puraklen' ? 'teal' : m.brand === 'yourfirm' ? 'purple' : 'grey') + '" style="font-size:.65rem;padding:2px 7px">' + brandLabel(m.brand) + '</span>'
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

    list.querySelectorAll('.dash-msg-item').forEach(function (item) {
      item.addEventListener('click', function () {
        openMessage(item.dataset.id);
      });
    });
  }

  async function openMessage(id) {
    var msg = state.messages.find(function (m) { return m.id === id; });
    if (!msg) return;

    /* Mark as read in Supabase */
    if (msg.unread) {
      await supabaseClient
        .from('messages')
        .update({ is_read: true })
        .eq('id', id);
      msg.unread = false;
      updateNavBadges();
      renderMessagesList();
    }

    state.selectedMessage = msg;

    var detail = document.getElementById('messageDetail');
    if (!detail) return;

    detail.classList.add('open');
    detail.innerHTML =
      '<div class="dash-msg-detail-header">'
        + '<div class="dash-msg-detail-subject">' + msg.subject + '</div>'
        + '<div class="dash-msg-detail-meta">'
          + '<span>From: <strong>' + msg.from + '</strong> (' + msg.email + ')</span>'
          + '<span>' + msg.date + '</span>'
          + '<span class="dash-badge dash-badge--' + (msg.brand === 'puraklen' ? 'teal' : msg.brand === 'yourfirm' ? 'purple' : 'grey') + '">' + brandLabel(msg.brand) + '</span>'
        + '</div>'
      + '</div>'
      + '<div class="dash-msg-detail-body">' + msg.body.replace(/\n/g, '<br>') + '</div>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
        + '<button class="dash-btn dash-btn--primary" onclick="openReplyModal(\'' + msg.id + '\')">Reply</button>'
        + '<button class="dash-btn dash-btn--secondary" onclick="markMessageDone(\'' + msg.id + '\')">Mark as Done</button>'
        + '<button class="dash-btn dash-btn--secondary" onclick="closeMessageDetail()">← Back</button>'
      + '</div>';
  }

  window.closeMessageDetail = function () {
    var detail = document.getElementById('messageDetail');
    if (detail) { detail.classList.remove('open'); detail.innerHTML = ''; }
    state.selectedMessage = null;
  };

  window.markMessageDone = async function (id) {
    await supabaseClient
      .from('messages')
      .update({ is_read: true })
      .eq('id', id);

    state.messages = state.messages.filter(function (m) { return m.id !== id; });
    closeMessageDetail();
    renderMessagesList();
    updateNavBadges();
    showToast('Message archived.', 'success');
  };

  window.openReplyModal = function (id) {
    var modal = document.getElementById('replyModal');
    var msg   = state.messages.find(function (m) { return m.id === id; });
    if (!modal || !msg) return;
    document.getElementById('replyTo').value      = msg.from + ' <' + msg.email + '>';
    document.getElementById('replySubject').value = 'Re: ' + msg.subject;
    document.getElementById('replyBody').value    = '';
    modal.dataset.parentId = id;
    modal.classList.add('open');
  };

  window.closeReplyModal = function () {
    var modal = document.getElementById('replyModal');
    if (modal) modal.classList.remove('open');
  };

  window.sendReply = async function () {
    var body    = (document.getElementById('replyBody')    || {}).value.trim();
    var subject = (document.getElementById('replySubject') || {}).value.trim();
    var modal   = document.getElementById('replyModal');
    var parentId = modal ? modal.dataset.parentId : null;

    if (!body) { showToast('Please write a reply first.', 'error'); return; }

    var parentMsg = parentId ? state.messages.find(function (m) { return m.id === parentId; }) : null;
    var adminName = getUserDisplayName(state.session);

    var { error } = await supabaseClient
      .from('messages')
      .insert({
        user_id:   parentMsg ? parentMsg.userId : null,
        from_name: adminName,
        to_name:   parentMsg ? parentMsg.from : 'Client',
        subject:   subject,
        body:      body,
        is_read:   false,
        is_reply:  true,
        parent_id: parentId || null
      });

    if (error) {
      showToast('Failed to send reply.', 'error');
      return;
    }

    /* 🔔 Notify the client */
    if (parentMsg && parentMsg.userId && typeof createNotification === 'function') {
      await createNotification(parentMsg.userId, {
        title:     'New Reply from AmyServes',
        body:      adminName + ' replied to your message: "' + subject + '"',
        type:      'message',
        direction: 'received',
        link:      '/dashboard/client/messages.html'
      });
    }

    closeReplyModal();
    showToast('Reply sent successfully! ✅', 'success');

    /* Reload messages to show sent reply */
    await loadMessages();
    renderMessagesList();
  };

  function bindMessageEvents() {
    var search = document.getElementById('msgSearch');
    if (search) {
      search.addEventListener('input', function () {
        state.searchQuery = search.value;
        renderMessagesList();
      });
    }

    var brandFilter = document.getElementById('msgBrandFilter');
    if (brandFilter) {
      brandFilter.addEventListener('change', function () {
        state.filterBrand = brandFilter.value;
        renderMessagesList();
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     PAGE: REQUESTS
  ══════════════════════════════════════════════════════ */
  function initRequestsPage() {
    if (!document.getElementById('requestsTableBody')) return;
    renderRequestsTable();
    bindRequestEvents();
  }

  function renderRequestsTable() {
    var tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;

    var filtered = state.requests.filter(function (r) {
      var q = state.searchQuery.toLowerCase();
      if (q && r.client.toLowerCase().indexOf(q) === -1
            && r.service.toLowerCase().indexOf(q) === -1
            && r.company.toLowerCase().indexOf(q) === -1) return false;
      if (state.filterStatus !== 'all' && r.status !== state.filterStatus) return false;
      if (state.filterBrand  !== 'all' && r.brand  !== state.filterBrand)  return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="dash-empty"><span>📭</span><h4>No requests found</h4><p>Adjust your filters.</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(function (r) {
      return '<tr>'
        + '<td><strong style="color:var(--navy);font-size:.82rem">' + r.shortId + '</strong></td>'
        + '<td><strong>' + r.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
        + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">' + r.service + '</span></td>'
        + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.location + '</td>'
        + '<td style="font-size:.82rem">' + r.date + '</td>'
        + '<td>' + statusBadge(r.status) + '</td>'
        + '<td>'
          + '<div style="display:flex;gap:6px">'
            + '<button class="dash-btn dash-btn--secondary dash-btn--sm" onclick="viewRequest(\'' + r.rawId + '\')">View</button>'
            + '<select class="dash-filter-select" style="padding:6px 28px 6px 8px;font-size:.78rem" onchange="updateRequestStatus(\'' + r.rawId + '\', this.value)">'
              + '<option value="">Update</option>'
              + ['pending', 'in-progress', 'completed'].map(function (s) {
                  return '<option value="' + s + '"' + (r.status === s ? ' selected' : '') + '>' + capitalise(s) + '</option>';
                }).join('')
            + '</select>'
          + '</div>'
        + '</td>'
        + '</tr>';
    }).join('');
  }

  window.viewRequest = function (id) {
    var r = state.requests.find(function (req) { return req.rawId === id; });
    if (!r) return;

    var modal = document.getElementById('requestDetailModal');
    var body  = document.getElementById('requestDetailBody');
    if (!modal || !body) return;

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
        + detailItem('Date',       r.date)
        + detailItem('Status',     capitalise(r.status))
      + '</div>'
      + '<div style="margin-top:8px">'
        + '<div style="font-size:.75rem;font-weight:700;color:var(--warm-grey);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Brief / Message</div>'
        + '<div style="background:#f8f7f4;border-radius:8px;padding:14px;font-size:.875rem;line-height:1.75;color:#3a3a3a">' + r.brief + '</div>'
      + '</div>'
      + '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">'
        + '<button class="dash-btn dash-btn--primary" onclick="updateRequestStatus(\'' + r.rawId + '\',\'in-progress\');closeRequestModal()">Mark In Progress</button>'
        + '<button class="dash-btn dash-btn--teal" onclick="updateRequestStatus(\'' + r.rawId + '\',\'completed\');closeRequestModal()">Mark Completed</button>'
        + '<button class="dash-btn dash-btn--secondary" onclick="closeRequestModal()">Close</button>'
      + '</div>';

    modal.classList.add('open');
  };

  window.closeRequestModal = function () {
    var modal = document.getElementById('requestDetailModal');
    if (modal) modal.classList.remove('open');
  };

  window.updateRequestStatus = async function (id, status) {
    if (!status) return;

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

      /* 🔔 Notify the client */
      if (req.userId && typeof notifyStatusUpdate === 'function') {
        await notifyStatusUpdate(
          req.userId,
          getUserDisplayName(state.session),
          req.service,
          capitalise(status)
        );
      }
    }

    renderRequestsTable();
    renderRecentRequestsTable();
    updateNavBadges();
    showToast('Status updated to ' + capitalise(status) + '.', 'success');
  };

  function bindRequestEvents() {
    var search = document.getElementById('reqSearch');
    if (search) {
      search.addEventListener('input', function () {
        state.searchQuery = search.value;
        renderRequestsTable();
      });
    }

    var statusFilter = document.getElementById('reqStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', function () {
        state.filterStatus = statusFilter.value;
        renderRequestsTable();
      });
    }

    var brandFilter = document.getElementById('reqBrandFilter');
    if (brandFilter) {
      brandFilter.addEventListener('change', function () {
        state.filterBrand = brandFilter.value;
        renderRequestsTable();
      });
    }
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', async function () {

    /* ── 1. Auth check — redirect if not admin ── */
    var session = await requireAuth(['admin']);
    if (!session) return;

    state.session = session;
    state.user    = session.user;

    /* ── 2. Setup sidebar & sign out ── */
    initSidebar();
    populateAdminInfo();

    /* ── 3. Load all data from Supabase ── */
    await loadRequests();
    await loadMessages();

    /* ── 4. Init the correct page ── */
    initIndexPage();
    initMessagesPage();
    initRequestsPage();

    /* ── 5. Show the page ── */
    document.body.style.opacity = '1';

  });

})();
