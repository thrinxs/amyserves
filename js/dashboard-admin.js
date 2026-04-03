/* ══════════════════════════════════════════════════════
   DASHBOARD-ADMIN.JS — AmyServes Admin Portal
   All data is mock data. Replace with Supabase calls
   once your database schema is ready.
══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    /* ── MOCK DATA ───────────────────────────────────────── */
    var mockRequests = [
      { id: 'REQ-001', client: 'Emeka Nwosu', company: 'TechStart Ltd', service: 'Office Cleaning', brand: 'puraklen', status: 'pending', date: '2026-04-01', location: 'Wuse II, Abuja', phone: '+234 801 234 5678', email: 'emeka@techstart.ng', message: 'We need weekly office cleaning for a 6-room office on the 3rd floor. Approximately 400sqm. Weekday mornings preferred.' },
      { id: 'REQ-002', client: 'Fatima Abdullahi', company: 'FarmCo Nigeria', service: 'HR Audit', brand: 'yourfirm', status: 'in-progress', date: '2026-03-30', location: 'Maitama, Abuja', phone: '+234 802 345 6789', email: 'fatima@farmco.ng', message: 'Looking for a full HR audit of our 45-person team. We have been operating for 3 years without a proper HR system.' },
      { id: 'REQ-003', client: 'David Okonkwo', company: 'Okonkwo Holdings', service: 'Payroll Management', brand: 'yourfirm', status: 'completed', date: '2026-03-28', location: 'Gwarimpa, Abuja', phone: '+234 803 456 7890', email: 'david@okonkwo.ng', message: 'Monthly payroll for 22 staff. Currently handled manually on spreadsheet. Need proper system with PAYE and pension.' },
      { id: 'REQ-004', client: 'Ngozi Eze', company: 'Eze Properties', service: 'Post-Construction Cleaning', brand: 'puraklen', status: 'pending', date: '2026-03-27', location: 'Asokoro, Abuja', phone: '+234 804 567 8901', email: 'ngozi@ezeproperties.ng', message: 'Just completed construction on a 5-bedroom duplex. Need full post-construction clean before handing over to client.' },
      { id: 'REQ-005', client: 'Yusuf Garba', company: 'Garba Logistics', service: 'Employment Contracts', brand: 'yourfirm', status: 'in-progress', date: '2026-03-25', location: 'Karu, Abuja', phone: '+234 805 678 9012', email: 'yusuf@garbalogistics.ng', message: 'Need employment contracts drafted for 8 new hires. Also need a staff handbook for the company.' },
      { id: 'REQ-006', client: 'Amaka Obi', company: 'Obi Retail', service: 'Deep Cleaning', brand: 'puraklen', status: 'completed', date: '2026-03-22', location: 'Lugbe, Abuja', phone: '+234 806 789 0123', email: 'amaka@obiretail.ng', message: 'One-off deep clean for our retail store. 3 floors, approximately 800sqm total.' },
      { id: 'REQ-007', client: 'Bello Umar', company: 'Umar & Sons', service: 'Recruitment', brand: 'yourfirm', status: 'pending', date: '2026-04-02', location: 'Nyanya, Abuja', phone: '+234 807 890 1234', email: 'bello@umarandsons.ng', message: 'Need to hire 3 experienced accountants and 1 operations manager. Please help with full recruitment.' },
      { id: 'REQ-008', client: 'Kemi Adeyemi', company: 'AdeyemiTech', service: 'Office Cleaning', brand: 'puraklen', status: 'in-progress', date: '2026-03-29', location: 'Central Business District, Abuja', phone: '+234 808 901 2345', email: 'kemi@adeyemitech.ng', message: 'Looking for a reliable monthly cleaning retainer for our 20-person office.' }
    ];
  
    var mockMessages = [
      { id: 'MSG-001', from: 'Emeka Nwosu', email: 'emeka@techstart.ng', subject: 'Follow-up on cleaning quote', preview: 'Hi, just wanted to check if you received our quote request…', body: "Hi,\n\nJust wanted to check if you received our quote request from yesterday. We're keen to get started as soon as possible and would appreciate a quick confirmation.\n\nWe're flexible on timing but ideally would like to start within the next two weeks.\n\nThanks,\nEmeka", time: '10:24 AM', date: '2 Apr 2026', unread: true, brand: 'puraklen', avatar: '#0F6E56' },
      { id: 'MSG-002', from: 'Fatima Abdullahi', email: 'fatima@farmco.ng', subject: 'HR Audit — documents attached', preview: 'Please find attached our current employment agreements and…', body: "Good morning,\n\nPlease find attached our current employment agreements and staff records as requested. I've also included a summary of our current HR practices.\n\nLooking forward to your assessment.\n\nBest regards,\nFatima", time: '9:05 AM', date: '2 Apr 2026', unread: true, brand: 'yourfirm', avatar: '#3C3489' },
      { id: 'MSG-003', from: 'David Okonkwo', email: 'david@okonkwo.ng', subject: 'Payroll query — April run', preview: 'We have 2 new staff starting on the 5th. Can they be included…', body: "Hi team,\n\nWe have 2 new staff starting on the 5th of April. Can they be included in the April payroll run even though they're starting mid-month?\n\nAlso — one staff member had 3 unpaid days in March. Please advise on how to handle this.\n\nThanks,\nDavid", time: 'Yesterday', date: '1 Apr 2026', unread: false, brand: 'yourfirm', avatar: '#1A3C5E' },
      { id: 'MSG-004', from: 'Ngozi Eze', email: 'ngozi@ezeproperties.ng', subject: 'Site access — post-construction job', preview: 'The property will be accessible from Thursday. The site manager…', body: "Hello,\n\nThe property will be accessible from Thursday. The site manager's name is Chukwuemeka and his number is 0812 345 6789.\n\nPlease ensure the team brings their own equipment as the property is completely empty.\n\nThank you.", time: 'Yesterday', date: '1 Apr 2026', unread: false, brand: 'puraklen', avatar: '#C8941A' },
      { id: 'MSG-005', from: 'Yusuf Garba', email: 'yusuf@garbalogistics.ng', subject: 'Contract review feedback', preview: 'Thank you for the draft contracts. We have a few comments…', body: "Dear team,\n\nThank you for the draft contracts. We have reviewed them with our legal team and have a few comments:\n\n1. The non-compete clause period needs to be reduced to 6 months.\n2. We'd like to add a specific provision for commission-based roles.\n3. The disciplinary timeline needs to be reviewed.\n\nPlease let us know when you're available for a call.\n\nBest,\nYusuf", time: '31 Mar 2026', date: '31 Mar 2026', unread: false, brand: 'yourfirm', avatar: '#0F6E56' }
    ];
  
    var mockActivity = [
      { icon: '📋', text: 'New service request from <strong>Bello Umar</strong> (Recruitment)', time: '2 min ago', bg: '#f0f8f0' },
      { icon: '✅', text: 'Request <strong>REQ-006</strong> marked as completed', time: '1 hr ago', bg: '#e8f5e9' },
      { icon: '💬', text: 'New message from <strong>Fatima Abdullahi</strong>', time: '2 hr ago', bg: '#ede9ff' },
      { icon: '🔄', text: 'Request <strong>REQ-005</strong> updated to In Progress', time: '3 hr ago', bg: '#fff8e6' },
      { icon: '📋', text: 'New service request from <strong>Emeka Nwosu</strong> (Office Cleaning)', time: '5 hr ago', bg: '#f0f8f0' }
    ];
  
    /* ── SHARED STATE ────────────────────────────────────── */
    var state = {
      requests: JSON.parse(JSON.stringify(mockRequests)),
      messages: JSON.parse(JSON.stringify(mockMessages)),
      selectedMessage: null,
      selectedRequest: null,
      searchQuery: '',
      filterStatus: 'all',
      filterBrand: 'all'
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
  
    /* ── SIDEBAR TOGGLE (mobile) ─────────────────────────── */
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
  
    /* ── PAGE: INDEX (overview) ──────────────────────────── */
    function initIndexPage() {
      if (!document.getElementById('statTotalRequests')) return;
  
      var pending    = state.requests.filter(function (r) { return r.status === 'pending'; }).length;
      var inProgress = state.requests.filter(function (r) { return r.status === 'in-progress'; }).length;
      var completed  = state.requests.filter(function (r) { return r.status === 'completed'; }).length;
      var unread     = state.messages.filter(function (m) { return m.unread; }).length;
  
      document.getElementById('statTotalRequests').textContent  = state.requests.length;
      document.getElementById('statPending').textContent        = pending;
      document.getElementById('statInProgress').textContent     = inProgress;
      document.getElementById('statMessages').textContent       = unread;
  
      /* Recent requests table */
      var tbody = document.getElementById('recentRequestsBody');
      if (tbody) {
        var recent = state.requests.slice(0, 5);
        tbody.innerHTML = recent.map(function (r) {
          return '<tr>'
            + '<td><strong>' + r.id + '</strong></td>'
            + '<td>' + r.client + '<br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
            + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">' + r.service + '</span></td>'
            + '<td>' + r.date + '</td>'
            + '<td>' + statusBadge(r.status) + '</td>'
            + '<td><a href="messages.html" class="dash-btn dash-btn--secondary dash-btn--sm">View</a></td>'
            + '</tr>';
        }).join('');
      }
  
      /* Activity feed */
      var feed = document.getElementById('activityFeed');
      if (feed) {
        feed.innerHTML = mockActivity.map(function (a) {
          return '<div class="dash-feed-item">'
            + '<div class="dash-feed-icon" style="background:' + a.bg + '">' + a.icon + '</div>'
            + '<div class="dash-feed-text"><strong>' + a.text.replace(/<strong>/g, '').replace(/<\/strong>/g, '') + '</strong><span>' + a.time + '</span></div>'
            + '</div>';
        }).join('');
  
        /* Re-render with bold support */
        feed.innerHTML = mockActivity.map(function (a) {
          return '<div class="dash-feed-item">'
            + '<div class="dash-feed-icon" style="background:' + a.bg + '">' + a.icon + '</div>'
            + '<div class="dash-feed-text"><strong style="font-weight:500">' + a.text + '</strong><span>' + a.time + '</span></div>'
            + '</div>';
        }).join('');
      }
    }
  
    /* ── PAGE: MESSAGES ──────────────────────────────────── */
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
          + '<div class="dash-msg-avatar" style="background:' + m.avatar + '">' + getInitials(m.from) + '</div>'
          + '<div class="dash-msg-body">'
            + '<div style="display:flex;justify-content:space-between;align-items:center">'
              + '<span class="dash-msg-from">' + m.from + '</span>'
              + '<span class="dash-badge dash-badge--' + (m.brand === 'puraklen' ? 'teal' : 'purple') + '" style="font-size:.65rem;padding:2px 7px">' + (m.brand === 'puraklen' ? "Pura-Kle'N" : 'Yourfirm') + '</span>'
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
  
    function openMessage(id) {
      var msg = state.messages.find(function (m) { return m.id === id; });
      if (!msg) return;
  
      msg.unread = false;
      state.selectedMessage = msg;
  
      var detail = document.getElementById('messageDetail');
      if (!detail) return;
  
      detail.classList.add('open');
      detail.innerHTML = '<div class="dash-msg-detail-header">'
        + '<div class="dash-msg-detail-subject">' + msg.subject + '</div>'
        + '<div class="dash-msg-detail-meta">'
          + '<span>From: <strong>' + msg.from + '</strong> (' + msg.email + ')</span>'
          + '<span>' + msg.date + '</span>'
          + '<span class="dash-badge dash-badge--' + (msg.brand === 'puraklen' ? 'teal' : 'purple') + '">' + (msg.brand === 'puraklen' ? "Pura-Kle'N" : 'Yourfirm') + '</span>'
        + '</div>'
        + '</div>'
        + '<div class="dash-msg-detail-body">' + msg.body.replace(/\n/g, '<br>') + '</div>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
          + '<button class="dash-btn dash-btn--primary" onclick="openReplyModal(\'' + msg.id + '\')">Reply</button>'
          + '<button class="dash-btn dash-btn--secondary" onclick="markMessageDone(\'' + msg.id + '\')">Mark as Done</button>'
          + '<button class="dash-btn dash-btn--secondary" onclick="closeMessageDetail()">← Back</button>'
        + '</div>';
  
      renderMessagesList();
    }
  
    window.closeMessageDetail = function () {
      var detail = document.getElementById('messageDetail');
      if (detail) { detail.classList.remove('open'); detail.innerHTML = ''; }
      state.selectedMessage = null;
    };
  
    window.markMessageDone = function (id) {
      state.messages = state.messages.filter(function (m) { return m.id !== id; });
      closeMessageDetail();
      renderMessagesList();
      showToast('Message archived.', 'success');
    };
  
    window.openReplyModal = function (id) {
      var modal = document.getElementById('replyModal');
      var msg   = state.messages.find(function (m) { return m.id === id; });
      if (!modal || !msg) return;
      document.getElementById('replyTo').value = msg.from + ' <' + msg.email + '>';
      document.getElementById('replySubject').value = 'Re: ' + msg.subject;
      document.getElementById('replyBody').value = '';
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
  
    /* ── PAGE: REQUESTS ──────────────────────────────────── */
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
        if (q && r.client.toLowerCase().indexOf(q) === -1 && r.service.toLowerCase().indexOf(q) === -1 && r.company.toLowerCase().indexOf(q) === -1) return false;
        if (state.filterStatus !== 'all' && r.status !== state.filterStatus) return false;
        if (state.filterBrand !== 'all' && r.brand !== state.filterBrand) return false;
        return true;
      });
  
      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="dash-empty"><span>📭</span><h4>No requests found</h4><p>Adjust your filters.</p></div></td></tr>';
        return;
      }
  
      tbody.innerHTML = filtered.map(function (r) {
        return '<tr>'
          + '<td><strong style="color:var(--navy);font-size:.82rem">' + r.id + '</strong></td>'
          + '<td><strong>' + r.client + '</strong><br><span style="font-size:.75rem;color:var(--warm-grey)">' + r.company + '</span></td>'
          + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">' + r.service + '</span></td>'
          + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.location + '</td>'
          + '<td style="font-size:.82rem">' + r.date + '</td>'
          + '<td>' + statusBadge(r.status) + '</td>'
          + '<td>'
            + '<div style="display:flex;gap:6px">'
              + '<button class="dash-btn dash-btn--secondary dash-btn--sm" onclick="viewRequest(\'' + r.id + '\')">View</button>'
              + '<select class="dash-filter-select" style="padding:6px 28px 6px 8px;font-size:.78rem" onchange="updateRequestStatus(\'' + r.id + '\', this.value)">'
                + '<option value="">Update</option>'
                + ['pending','in-progress','completed'].map(function(s){ return '<option value="' + s + '"' + (r.status === s ? ' selected' : '') + '>' + capitalise(s) + '</option>'; }).join('')
              + '</select>'
            + '</div>'
          + '</td>'
          + '</tr>';
      }).join('');
    }
  
    window.viewRequest = function (id) {
      var r = state.requests.find(function (req) { return req.id === id; });
      if (!r) return;
      var modal = document.getElementById('requestDetailModal');
      var body  = document.getElementById('requestDetailBody');
      if (!modal || !body) return;
  
      body.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">'
        + detailItem('Request ID', r.id)
        + detailItem('Client', r.client)
        + detailItem('Company', r.company)
        + detailItem('Phone', r.phone)
        + detailItem('Email', r.email)
        + detailItem('Location', r.location)
        + detailItem('Service', r.service)
        + detailItem('Brand', r.brand === 'puraklen' ? "Pura-Kle'N" : 'Yourfirm')
        + detailItem('Date Submitted', r.date)
        + detailItem('Status', capitalise(r.status))
        + '</div>'
        + '<div style="margin-top:8px"><div style="font-size:.75rem;font-weight:700;color:var(--warm-grey);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Message / Brief</div>'
        + '<div style="background:#f8f7f4;border-radius:8px;padding:14px;font-size:.875rem;line-height:1.75;color:#3a3a3a">' + r.message + '</div></div>'
        + '<div style="margin-top:20px;display:flex;gap:10px">'
          + '<button class="dash-btn dash-btn--primary" onclick="updateRequestStatus(\'' + r.id + '\', \'in-progress\');closeRequestModal()">Mark In Progress</button>'
          + '<button class="dash-btn dash-btn--teal" onclick="updateRequestStatus(\'' + r.id + '\', \'completed\');closeRequestModal()">Mark Completed</button>'
        + '</div>';
  
      modal.classList.add('open');
    };
  
    window.closeRequestModal = function () {
      var modal = document.getElementById('requestDetailModal');
      if (modal) modal.classList.remove('open');
    };
  
    window.updateRequestStatus = function (id, status) {
      if (!status) return;
      var req = state.requests.find(function (r) { return r.id === id; });
      if (req) { req.status = status; renderRequestsTable(); showToast('Status updated to ' + capitalise(status) + '.', 'success'); }
    };
  
    function bindRequestEvents() {
      var search = document.getElementById('reqSearch');
      if (search) search.addEventListener('input', function () { state.searchQuery = search.value; renderRequestsTable(); });
  
      var statusFilter = document.getElementById('reqStatusFilter');
      if (statusFilter) statusFilter.addEventListener('change', function () { state.filterStatus = statusFilter.value; renderRequestsTable(); });
  
      var brandFilter = document.getElementById('reqBrandFilter');
      if (brandFilter) brandFilter.addEventListener('change', function () { state.filterBrand = brandFilter.value; renderRequestsTable(); });
    }
  
    /* ── HELPERS ─────────────────────────────────────────── */
    function statusBadge(status) {
      var map = { pending: 'yellow', 'in-progress': 'navy', completed: 'green' };
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
  
    function getInitials(name) {
      return name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    }
  
    /* ── INIT ────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
      initSidebar();
      initIndexPage();
      initMessagesPage();
      initRequestsPage();
    });
  
  })();