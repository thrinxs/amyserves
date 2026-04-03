/* ══════════════════════════════════════════════════════
   DASHBOARD-STAFF.JS — AmyServes Staff Portal
   Mock data — replace with Supabase calls in Phase 5
══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    /* ── MOCK DATA ───────────────────────────────────────── */
    var mockStaff = {
      name: 'Operations Manager',
      role: 'Pura-Kle\'N Operations Lead',
      email: 'ops@amyserves.com',
      initials: 'OM',
      color: '#0F6E56'
    };
  
    var mockClients = [
      { id: 'REQ-001', client: 'Emeka Nwosu', company: 'TechStart Ltd', service: 'Office Cleaning', brand: 'puraklen', location: 'Wuse II, Abuja', phone: '+234 801 234 5678', email: 'emeka@techstart.ng', date: '1 Apr 2026', status: 'in-progress', lastActivity: '2 Apr 2026', notes: 'Weekly cleaning — Mon/Wed/Fri mornings. Access code: 4821.' },
      { id: 'REQ-004', client: 'Ngozi Eze', company: 'Eze Properties', service: 'Post-Construction Cleaning', brand: 'puraklen', location: 'Asokoro, Abuja', phone: '+234 804 567 8901', email: 'ngozi@ezeproperties.ng', date: '27 Mar 2026', status: 'pending', lastActivity: '30 Mar 2026', notes: '5-bedroom duplex. Client wants pre-inspection visit first.' },
      { id: 'REQ-006', client: 'Amaka Obi', company: 'Obi Retail', service: 'Deep Cleaning', brand: 'puraklen', location: 'Lugbe, Abuja', phone: '+234 806 789 0123', email: 'amaka@obiretail.ng', date: '22 Mar 2026', status: 'completed', lastActivity: '25 Mar 2026', notes: '3-floor retail store. Completed and client approved.' },
      { id: 'REQ-008', client: 'Kemi Adeyemi', company: 'AdeyemiTech', service: 'Office Cleaning', brand: 'puraklen', location: 'CBD, Abuja', phone: '+234 808 901 2345', email: 'kemi@adeyemitech.ng', date: '29 Mar 2026', status: 'in-progress', lastActivity: '1 Apr 2026', notes: 'Monthly retainer — 20-person office. Every Tuesday morning.' }
    ];
  
    var mockMessages = [
      { id: 'SMSG-001', from: 'Emeka Nwosu', email: 'emeka@techstart.ng', subject: 'Access issue Monday morning', preview: 'Hi, the security guard wasn\'t informed about the cleaning team arrival…', body: 'Hi,\n\nThe security guard wasn\'t informed about the cleaning team arrival on Monday morning and initially denied them access. This caused a 30-minute delay.\n\nCan you please ensure the building management is notified before each session?\n\nThanks,\nEmeka', time: '9:15 AM', date: '2 Apr 2026', unread: true, avatar: '#0F6E56' },
      { id: 'SMSG-002', from: 'Ngozi Eze', email: 'ngozi@ezeproperties.ng', subject: 'Pre-inspection — can we schedule Thursday?', preview: 'Good morning, I\'d like to schedule the pre-inspection for Thursday…', body: 'Good morning,\n\nI\'d like to schedule the pre-inspection for Thursday 4th April at 10am if possible. The site manager will be available to walk you through the property.\n\nPlease confirm.\n\nBest,\nNgozi', time: 'Yesterday', date: '1 Apr 2026', unread: true, avatar: '#C8941A' },
      { id: 'SMSG-003', from: 'Amaka Obi', email: 'amaka@obiretail.ng', subject: 'Excellent job — thank you!', preview: 'Just wanted to say the deep clean was exceptional. The team were…', body: 'Just wanted to say the deep clean was exceptional. The team were professional, thorough, and completed everything on schedule.\n\nWe\'ll definitely be booking a quarterly follow-up. Please send us the retainer pricing when you have a chance.\n\nThank you!\nAmaka', time: '26 Mar 2026', date: '26 Mar 2026', unread: false, avatar: '#3C3489' }
    ];
  
    /* ── STATE ───────────────────────────────────────────── */
    var state = {
      staff: mockStaff,
      clients: mockClients,
      messages: mockMessages,
      filteredClients: mockClients.slice(),
      filteredMessages: mockMessages.slice(),
      selectedMessage: null
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
  
    /* ── POPULATE STAFF INFO ─────────────────────────────── */
    function populateStaffInfo() {
      var s = state.staff;
      var avatarEl = document.getElementById('sidebarAvatar');
      var nameEl   = document.getElementById('sidebarName');
      if (avatarEl) { avatarEl.textContent = s.initials; avatarEl.style.background = s.color; }
      if (nameEl)   nameEl.textContent = s.name;
    }
  
    /* ── PAGE: STAFF INDEX ───────────────────────────────── */
    function initIndexPage() {
      if (!document.getElementById('welcomeName')) return;
      var s = state.staff;
  
      document.getElementById('welcomeName').textContent = 'Good morning, ' + s.name.split(' ')[0] + '!';
  
      var totalClients  = state.clients.length;
      var pending       = state.clients.filter(function (c) { return c.status === 'pending'; }).length;
      var inProgress    = state.clients.filter(function (c) { return c.status === 'in-progress'; }).length;
      var unreadMsgs    = state.messages.filter(function (m) { return m.unread; }).length;
  
      var sc = document.getElementById('statClients');
      var sp = document.getElementById('statPending');
      var si = document.getElementById('statInProgress');
      var sm = document.getElementById('statMessages');
      if (sc) sc.textContent = totalClients;
      if (sp) sp.textContent = pending;
      if (si) si.textContent = inProgress;
      if (sm) sm.textContent = unreadMsgs;
  
      var pendingBadge = document.getElementById('pendingBadge');
      if (pendingBadge) pendingBadge.textContent = pending;
  
      var unreadBadge = document.getElementById('unreadBadge');
      if (unreadBadge) { unreadBadge.textContent = unreadMsgs; unreadBadge.style.display = unreadMsgs > 0 ? 'inline-flex' : 'none'; }
  
      renderStaffClientsTable();
      renderActivityFeed();
    }
  
    function renderStaffClientsTable() {
      var tbody = document.getElementById('clientsBody');
      if (!tbody) return;
      var recent = state.clients.slice(0, 4);
      tbody.innerHTML = recent.map(function (c) {
        return '<tr>'
          + '<td><strong>' + c.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + c.company + '</span></td>'
          + '<td>' + c.service + '</td>'
          + '<td><span class="dash-badge dash-badge--' + (c.brand === 'puraklen' ? 'teal' : 'purple') + '">' + (c.brand === 'puraklen' ? "Pura-Kle'N" : 'Yourfirm') + '</span></td>'
          + '<td style="font-size:.82rem;color:var(--warm-grey)">' + c.lastActivity + '</td>'
          + '<td>' + statusBadge(c.status) + '</td>'
          + '<td><a href="clients.html" class="dash-btn dash-btn--secondary dash-btn--sm">View</a></td>'
          + '</tr>';
      }).join('');
    }
  
    function renderActivityFeed() {
      var feed = document.getElementById('activityFeed');
      if (!feed) return;
      var activities = [
        { icon: '💬', text: 'New message from <strong>Emeka Nwosu</strong> — Access issue', time: '2 hr ago', bg: '#e8f5e9' },
        { icon: '💬', text: 'New message from <strong>Ngozi Eze</strong> — Pre-inspection request', time: '5 hr ago', bg: '#fff8e6' },
        { icon: '✅', text: '<strong>Amaka Obi</strong> — Deep Cleaning marked completed', time: '26 Mar', bg: '#e8f5e9' },
        { icon: '🔄', text: '<strong>Kemi Adeyemi</strong> — Office Cleaning now In Progress', time: '29 Mar', bg: '#e8f0fe' }
      ];
      feed.innerHTML = activities.map(function (a) {
        return '<div class="dash-feed-item">'
          + '<div class="dash-feed-icon" style="background:' + a.bg + '">' + a.icon + '</div>'
          + '<div class="dash-feed-text"><strong style="font-weight:500">' + a.text + '</strong><span>' + a.time + '</span></div>'
          + '</div>';
      }).join('');
    }
  
    /* ── PAGE: CLIENTS ───────────────────────────────────── */
    function initClientsPage() {
      if (!document.getElementById('clientsTableBody')) return;
      state.filteredClients = state.clients.slice();
      renderClientsTable();
      bindClientFilters();
    }
  
    function renderClientsTable() {
      var tbody = document.getElementById('clientsTableBody');
      if (!tbody) return;
      var data = state.filteredClients;
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="dash-empty"><span>📭</span><h4>No clients found</h4><p>Adjust your filters.</p></div></td></tr>';
        return;
      }
      tbody.innerHTML = data.map(function (c) {
        return '<tr>'
          + '<td><strong>' + c.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + c.company + '</span></td>'
          + '<td><span class="dash-badge dash-badge--' + (c.brand === 'puraklen' ? 'teal' : 'purple') + '">' + c.service + '</span></td>'
          + '<td><span class="dash-badge dash-badge--grey">' + (c.brand === 'puraklen' ? "Pura-Kle'N" : 'Yourfirm') + '</span></td>'
          + '<td style="font-size:.82rem;color:var(--warm-grey)">' + c.location + '</td>'
          + '<td style="font-size:.82rem">' + c.date + '</td>'
          + '<td>' + statusBadge(c.status) + '</td>'
          + '<td><div style="display:flex;gap:6px">'
              + '<button class="dash-btn dash-btn--secondary dash-btn--sm" onclick="viewClient(\'' + c.id + '\')">View</button>'
              + '<select class="dash-filter-select" style="padding:6px 28px 6px 8px;font-size:.78rem" onchange="updateClientStatus(\'' + c.id + '\', this.value)">'
                + '<option value="">Update</option>'
                + ['pending', 'in-progress', 'completed'].map(function (s) {
                    return '<option value="' + s + '"' + (c.status === s ? ' selected' : '') + '>' + capitalise(s) + '</option>';
                  }).join('')
              + '</select>'
            + '</div></td>'
          + '</tr>';
      }).join('');
    }
  
    function bindClientFilters() {
      var search      = document.getElementById('clientSearch');
      var statusFilt  = document.getElementById('statusFilter');
      var brandFilt   = document.getElementById('brandFilter');
  
      function applyFilters() {
        var q = search ? search.value.toLowerCase() : '';
        var st = statusFilt ? statusFilt.value : 'all';
        var br = brandFilt ? brandFilt.value : 'all';
        state.filteredClients = state.clients.filter(function (c) {
          var matchQ  = !q || c.client.toLowerCase().indexOf(q) > -1 || c.service.toLowerCase().indexOf(q) > -1 || c.company.toLowerCase().indexOf(q) > -1;
          var matchSt = st === 'all' || c.status === st;
          var matchBr = br === 'all' || c.brand === br;
          return matchQ && matchSt && matchBr;
        });
        renderClientsTable();
      }
  
      if (search)     search.addEventListener('input', applyFilters);
      if (statusFilt) statusFilt.addEventListener('change', applyFilters);
      if (brandFilt)  brandFilt.addEventListener('change', applyFilters);
    }
  
    window.viewClient = function (id) {
      var c = state.clients.find(function (x) { return x.id === id; });
      if (!c) return;
      var modal = document.getElementById('clientDetailModal');
      var body  = document.getElementById('clientDetailBody');
      if (!modal || !body) return;
  
      body.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">'
        + detailItem('Request ID', c.id)
        + detailItem('Client', c.client)
        + detailItem('Company', c.company)
        + detailItem('Phone', '<a href="tel:' + c.phone + '" style="color:var(--teal)">' + c.phone + '</a>')
        + detailItem('Email', '<a href="mailto:' + c.email + '" style="color:var(--teal)">' + c.email + '</a>')
        + detailItem('Location', c.location)
        + detailItem('Service', c.service)
        + detailItem('Status', capitalise(c.status))
        + detailItem('Date', c.date)
        + detailItem('Last Activity', c.lastActivity)
        + '</div>'
        + '<div><div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--warm-grey);margin-bottom:8px">Notes</div>'
        + '<div style="background:#f8f7f4;border-radius:8px;padding:14px;font-size:.875rem;line-height:1.75;color:#3a3a3a">' + (c.notes || 'No notes.') + '</div></div>'
        + '<div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">'
          + '<button class="dash-btn dash-btn--primary" onclick="updateClientStatus(\'' + c.id + '\',\'in-progress\');closeClientModal()">Mark In Progress</button>'
          + '<button class="dash-btn dash-btn--teal" onclick="updateClientStatus(\'' + c.id + '\',\'completed\');closeClientModal()">Mark Completed</button>'
          + '<a href="https://wa.me/' + c.phone.replace(/\s+/g, '').replace('+', '') + '" target="_blank" class="dash-btn dash-btn--secondary">WhatsApp Client</a>'
        + '</div>';
  
      modal.classList.add('open');
    };
  
    window.closeClientModal = function () {
      var modal = document.getElementById('clientDetailModal');
      if (modal) modal.classList.remove('open');
    };
  
    window.updateClientStatus = function (id, status) {
      if (!status) return;
      var c = state.clients.find(function (x) { return x.id === id; });
      if (c) {
        c.status = status;
        state.filteredClients = state.filteredClients.map(function (x) { return x.id === id ? c : x; });
        renderClientsTable();
        renderStaffClientsTable();
        showToast('Status updated to ' + capitalise(status) + '.', 'success');
      }
    };
  
    /* ── PAGE: MESSAGES ──────────────────────────────────── */
    function initMessagesPage() {
      if (!document.getElementById('messagesList')) return;
      renderMessagesList();
  
      var search = document.getElementById('msgSearch');
      var filter = document.getElementById('msgFilter');
      if (search) search.addEventListener('input', function () { applyMessageFilters(); });
      if (filter) filter.addEventListener('change', function () { applyMessageFilters(); });
    }
  
    function applyMessageFilters() {
      var q  = (document.getElementById('msgSearch')  || {}).value || '';
      var ft = (document.getElementById('msgFilter')  || {}).value || 'all';
      state.filteredMessages = state.messages.filter(function (m) {
        var matchQ  = !q || m.from.toLowerCase().indexOf(q.toLowerCase()) > -1 || m.subject.toLowerCase().indexOf(q.toLowerCase()) > -1;
        var matchFt = ft === 'all' || (ft === 'unread' && m.unread) || (ft === 'read' && !m.unread);
        return matchQ && matchFt;
      });
      renderMessagesList();
    }
  
    function renderMessagesList() {
      var list = document.getElementById('messagesList');
      if (!list) return;
      var msgs = state.filteredMessages;
      if (msgs.length === 0) {
        list.innerHTML = '<div class="dash-empty" style="padding:32px"><span>📭</span><h4>No messages</h4></div>';
        return;
      }
      list.innerHTML = msgs.map(function (m) {
        return '<div class="dash-msg-item' + (m.unread ? ' unread' : '') + '" data-id="' + m.id + '" onclick="openStaffMessage(\'' + m.id + '\')" style="cursor:pointer">'
          + '<div class="dash-msg-avatar" style="background:' + m.avatar + '">' + m.from.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase() + '</div>'
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
    }
  
    window.openStaffMessage = function (id) {
      var msg = state.messages.find(function (m) { return m.id === id; });
      if (!msg) return;
      msg.unread = false;
      state.selectedMessage = msg;
      applyMessageFilters();
  
      var detail = document.getElementById('messageDetail');
      if (!detail) return;
      detail.innerHTML = '<div style="padding:28px 32px">'
        + '<div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e8e4de">'
          + '<div style="font-size:1.05rem;font-weight:700;color:var(--navy);margin-bottom:8px">' + msg.subject + '</div>'
          + '<div style="display:flex;gap:16px;font-size:.82rem;color:var(--warm-grey);flex-wrap:wrap">'
            + '<span>From: <strong style="color:var(--navy)">' + msg.from + '</strong> (' + msg.email + ')</span>'
            + '<span>' + msg.date + '</span>'
          + '</div>'
        + '</div>'
        + '<div style="font-size:.9rem;line-height:1.8;color:#3a3a3a;margin-bottom:28px">' + msg.body.replace(/\n/g, '<br>') + '</div>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
          + '<button class="dash-btn dash-btn--primary" onclick="openReplyModal(\'' + msg.id + '\')">Reply</button>'
          + '<button class="dash-btn dash-btn--secondary" onclick="markMessageDone(\'' + msg.id + '\')">Archive</button>'
          + '<a href="https://wa.me/' + msg.email + '" target="_blank" class="dash-btn dash-btn--secondary">WhatsApp</a>'
        + '</div>'
      + '</div>';
    };
  
    window.openReplyModal = function (id) {
      var modal = document.getElementById('replyModal');
      if (!modal) return;
      var msg = id ? state.messages.find(function (m) { return m.id === id; }) : null;
      document.getElementById('replyTo').value      = msg ? msg.from + ' <' + msg.email + '>' : '';
      document.getElementById('replySubject').value = msg ? 'Re: ' + msg.subject : '';
      document.getElementById('replyBody').value    = '';
      modal.classList.add('open');
    };
  
    window.closeReplyModal = function () {
      var modal = document.getElementById('replyModal');
      if (modal) modal.classList.remove('open');
    };
  
    window.sendReply = function () {
      var body = document.getElementById('replyBody').value.trim();
      if (!body) { showToast('Please write a reply first.', 'error'); return; }
      closeReplyModal();
      showToast('Reply sent successfully.', 'success');
    };
  
    window.markMessageDone = function (id) {
      state.messages = state.messages.filter(function (m) { return m.id !== id; });
      state.filteredMessages = state.filteredMessages.filter(function (m) { return m.id !== id; });
      var detail = document.getElementById('messageDetail');
      if (detail) detail.innerHTML = '<div class="dash-empty" style="padding-top:80px"><span>📩</span><h4>Select a message</h4><p>Click any message to read and reply.</p></div>';
      renderMessagesList();
      showToast('Message archived.', 'success');
    };
  
    /* ── HELPERS ─────────────────────────────────────────── */
    function statusBadge(status) {
      var map    = { pending: 'yellow', 'in-progress': 'navy', completed: 'green' };
      var labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
      return '<span class="dash-badge dash-badge--' + (map[status] || 'grey') + '">' + (labels[status] || status) + '</span>';
    }
  
    function detailItem(label, value) {
      return '<div><div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--warm-grey);margin-bottom:3px">' + label + '</div>'
        + '<div style="font-size:.875rem;color:var(--navy);font-weight:500">' + value + '</div></div>';
    }
  
    function capitalise(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    /* ── INIT ────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
      initSidebar();
      populateStaffInfo();
      initIndexPage();
      initClientsPage();
      initMessagesPage();
    });
  
  })();