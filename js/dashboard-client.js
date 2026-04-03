/* ══════════════════════════════════════════════════════
   DASHBOARD-CLIENT.JS — AmyServes Client Portal
   Mock data — replace with Supabase calls in Phase 5
══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    /* ── MOCK DATA ───────────────────────────────────────── */
    var mockUser = {
      name: 'Emeka Nwosu',
      email: 'emeka@techstart.ng',
      phone: '+234 801 234 5678',
      role: 'CEO',
      business: 'TechStart Ltd',
      industry: 'Technology',
      service: 'cleaning',
      initials: 'EN',
      color: '#0F6E56'
    };
  
    var mockRequests = [
      { id: 'REQ-001', service: 'Office Cleaning', brand: 'puraklen', date: '1 Apr 2026', status: 'in-progress' },
      { id: 'REQ-002', service: 'HR Audit', brand: 'yourfirm', date: '15 Mar 2026', status: 'completed' },
      { id: 'REQ-003', service: 'Deep Cleaning', brand: 'puraklen', date: '10 Mar 2026', status: 'completed' },
      { id: 'REQ-004', service: 'Employment Contracts', brand: 'yourfirm', date: '20 Feb 2026', status: 'pending' }
    ];
  
    var mockMessages = [
      {
        id: 'MSG-001',
        from: 'AmyServes Team',
        subject: 'Your office cleaning is confirmed',
        preview: 'Hi Emeka, your weekly office cleaning has been confirmed for Monday 7 Apr…',
        body: 'Hi Emeka,\n\nYour weekly office cleaning has been confirmed for Monday 7 April at 8:00am. Our team of 3 will arrive at your Wuse II office.\n\nPlease ensure the reception area is accessible by 7:45am.\n\nBest regards,\nPura-Kle\'N Operations',
        time: '10:30 AM',
        date: '2 Apr 2026',
        unread: true,
        avatar: '#0F6E56'
      },
      {
        id: 'MSG-002',
        from: 'Yourfirm Consults',
        subject: 'HR Audit Report Ready',
        preview: 'Dear Emeka, your HR Audit report is now complete. Please find attached…',
        body: 'Dear Emeka,\n\nYour HR Audit report is now complete. We identified 4 key areas for improvement:\n\n1. Employment contracts need updating to include KPIs\n2. Disciplinary procedure not documented\n3. Payroll statutory deductions are missing NHF\n4. No formal onboarding process\n\nWe recommend scheduling a follow-up call this week to discuss next steps.\n\nBest regards,\nYourfirm Consults',
        time: 'Yesterday',
        date: '1 Apr 2026',
        unread: false,
        avatar: '#3C3489'
      },
      {
        id: 'MSG-003',
        from: 'AmyServes',
        subject: 'Welcome to the AmyServes Client Portal',
        preview: 'Welcome Emeka! Your AmyServes client portal is now active…',
        body: 'Welcome Emeka!\n\nYour AmyServes client portal is now active. You can use this portal to:\n\n- Track your service requests\n- Send and receive messages from our team\n- Update your profile and preferences\n- Request new services\n\nIf you have any questions, don\'t hesitate to reach out via WhatsApp or the contact form.\n\nWarm regards,\nThe AmyServes Team',
        time: '15 Mar 2026',
        date: '15 Mar 2026',
        unread: false,
        avatar: '#1A3C5E'
      }
    ];
  
    /* ── SHARED STATE ────────────────────────────────────── */
    var state = {
      user: mockUser,
      requests: mockRequests,
      messages: mockMessages,
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
      if (avatarEl) { avatarEl.textContent = u.initials; avatarEl.style.background = u.color; }
      if (nameEl)   nameEl.textContent = u.name;
    }
  
    /* ── PAGE: INDEX ─────────────────────────────────────── */
    function initIndexPage() {
      if (!document.getElementById('welcomeName')) return;
      var u = state.user;
  
      document.getElementById('welcomeName').textContent = 'Welcome back, ' + u.name.split(' ')[0] + '!';
  
      var profileAvatar = document.getElementById('profileAvatar');
      if (profileAvatar) { profileAvatar.textContent = u.initials; profileAvatar.style.background = u.color; }
  
      var total    = state.requests.length;
      var active   = state.requests.filter(function (r) { return r.status === 'in-progress' || r.status === 'pending'; }).length;
      var done     = state.requests.filter(function (r) { return r.status === 'completed'; }).length;
  
      var stTotal = document.getElementById('statTotal');
      var stActive = document.getElementById('statActive');
      var stDone = document.getElementById('statDone');
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
          + '<td><span class="dash-badge dash-badge--' + (r.brand === 'puraklen' ? 'teal' : 'purple') + '">' + (r.brand === 'puraklen' ? "Pura-Kle'N" : 'Yourfirm') + '</span></td>'
          + '<td style="font-size:.82rem;color:var(--warm-grey)">' + r.date + '</td>'
          + '<td>' + statusBadge(r.status) + '</td>'
          + '</tr>';
      }).join('');
    }
  
    function renderRecentMessages() {
      var el = document.getElementById('recentMessages');
      if (!el) return;
      var recent = state.messages.slice(0, 3);
      if (recent.length === 0) return;
      el.innerHTML = recent.map(function (m) {
        return '<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 24px;border-bottom:1px solid #f0ede8;cursor:pointer" onclick="window.location.href=\'messages.html\'">'
          + '<div style="width:36px;height:36px;border-radius:50%;background:' + m.avatar + ';display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0">' + m.from.substring(0, 2).toUpperCase() + '</div>'
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
        search.addEventListener('input', function () { renderMessageList(search.value); });
      }
    }
  
    function renderMessageList(query) {
      var list = document.getElementById('messageList');
      if (!list) return;
      var msgs = state.messages.filter(function (m) {
        if (!query) return true;
        var q = query.toLowerCase();
        return m.from.toLowerCase().indexOf(q) > -1 || m.subject.toLowerCase().indexOf(q) > -1;
      });
      if (msgs.length === 0) {
        list.innerHTML = '<div class="dash-empty" style="padding:32px"><span>📭</span><h4>No messages</h4></div>';
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
  
    window.openMessage = function (id) {
      var msg = state.messages.find(function (m) { return m.id === id; });
      if (!msg) return;
      msg.unread = false;
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
          + '<a href="https://wa.me/2349011339978" target="_blank" class="dash-btn dash-btn--secondary">Chat on WhatsApp</a>'
        + '</div>'
      + '</div>';
    };
  
    window.openReplyToMessage = function (id) {
      var msg = state.messages.find(function (m) { return m.id === id; });
      if (!msg) return;
      var modal = document.getElementById('newMsgModal');
      if (!modal) return;
      document.getElementById('newMsgSubject').value = 'Re: ' + msg.subject;
      modal.classList.add('open');
    };
  
    window.openNewMessage = function () {
      var modal = document.getElementById('newMsgModal');
      if (modal) modal.classList.add('open');
    };
  
    window.closeNewMessage = function () {
      var modal = document.getElementById('newMsgModal');
      if (modal) modal.classList.remove('open');
    };
  
    window.sendNewMessage = function () {
      var subject = (document.getElementById('newMsgSubject').value || '').trim();
      var body    = (document.getElementById('newMsgBody').value || '').trim();
      if (!subject || !body) { showToast('Please fill in all fields.', 'error'); return; }
      closeNewMessage();
      showToast('Message sent! We\'ll respond within 24 hours.', 'success');
      document.getElementById('newMsgSubject').value = '';
      document.getElementById('newMsgBody').value = '';
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
  
      document.getElementById('pfFullName').value  = u.name;
      document.getElementById('pfPhone').value     = u.phone;
      document.getElementById('pfEmail').value     = u.email;
      document.getElementById('pfRole').value      = u.role;
      document.getElementById('pfBusiness').value  = u.business;
  
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
  
    window.saveProfile = function () {
      state.user.name     = document.getElementById('pfFullName').value.trim() || state.user.name;
      state.user.phone    = document.getElementById('pfPhone').value.trim()    || state.user.phone;
      state.user.role     = document.getElementById('pfRole').value.trim()     || state.user.role;
      state.user.business = document.getElementById('pfBusiness').value.trim() || state.user.business;
      populateUserInfo();
      showToast('Profile updated successfully.', 'success');
    };
  
    window.changePassword = function () {
      var cur  = document.getElementById('pfCurrentPw').value;
      var nw   = document.getElementById('pfNewPw').value;
      var conf = document.getElementById('pfConfirmPw').value;
      if (!cur || !nw || !conf) { showToast('Please fill in all password fields.', 'error'); return; }
      if (nw.length < 8)        { showToast('New password must be at least 8 characters.', 'error'); return; }
      if (nw !== conf)          { showToast('New passwords do not match.', 'error'); return; }
      document.getElementById('pfCurrentPw').value = '';
      document.getElementById('pfNewPw').value = '';
      document.getElementById('pfConfirmPw').value = '';
      showToast('Password updated successfully.', 'success');
    };
  
    window.saveNotifications = function () {
      showToast('Notification preferences saved.', 'success');
    };
  
    window.confirmDeleteAccount = function () {
      if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
        showToast('Account deletion request sent. Our team will process it within 48 hours.', 'info');
      }
    };
  
    /* ── HELPERS ─────────────────────────────────────────── */
    function statusBadge(status) {
      var map    = { pending: 'yellow', 'in-progress': 'navy', completed: 'green' };
      var labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' };
      return '<span class="dash-badge dash-badge--' + (map[status] || 'grey') + '">' + (labels[status] || status) + '</span>';
    }
  
    /* ── INIT ────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {
      initSidebar();
      populateUserInfo();
      initIndexPage();
      initMessagesPage();
      initProfilePage();
    });
  
  })();