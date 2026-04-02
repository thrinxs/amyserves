/* ══════════════════════════════════════════════════════
   BLOG.JS — AmyServes Blog
   Features: Auth (Google/Apple/Email), Comments,
   Replies, Reactions, Filtering, Search, Share
   Note: Social OAuth (Google/Apple) requires Supabase
   or Firebase integration in production (Phase 5).
   For now, email auth is fully simulated.
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     STATE
  ────────────────────────────────────────────── */
  var state = {
    user: null,             // { name, email, initials, color }
    currentPostId: null,
    currentFilter: 'all',
    currentSort: 'newest',
    searchQuery: '',
    likedPosts: {},         // { postId: true }
    likedComments: {},      // { commentId: true }
    shareTarget: null,      // { postId, cardEl }
  };

  /* Demo comments data keyed by post ID */
  var commentsData = {
    1: [
      { id: 'c1', author: 'Emeka Nwosu', initials: 'EN', color: '#0F6E56', date: 'Mar 21, 2026', body: 'This is exactly what we needed. We've been running HR reactively for 3 years and it's finally catching up with us.', likes: 8, replies: [
        { id: 'r1', author: 'Chiamaka (Amy)', initials: 'CA', color: '#3C3489', date: 'Mar 21, 2026', body: 'Glad it resonated, Emeka! The sooner you start, the better — reach out if you'd like a free HR audit.' }
      ]},
      { id: 'c2', author: 'Fatima Abdullahi', initials: 'FA', color: '#C8941A', date: 'Mar 22, 2026', body: 'The section on documentation is golden. Most SMEs don't realise they're at legal risk until something goes wrong.', likes: 5, replies: [] },
      { id: 'c3', author: 'David Okonkwo', initials: 'DO', color: '#1A3C5E', date: 'Mar 23, 2026', body: 'How does this apply to businesses under 10 staff? Are the same frameworks relevant?', likes: 2, replies: [
        { id: 'r2', author: 'HR Lead', initials: 'HR', color: '#3C3489', date: 'Mar 23, 2026', body: 'Great question David! Yes, even for micro-businesses the foundations matter — we have a lite framework specifically for teams under 10.' }
      ]},
    ],
    2: [
      { id: 'c4', author: 'Ngozi Eze', initials: 'NE', color: '#0F6E56', date: 'Mar 16, 2026', body: 'We switched to a professional cleaning retainer 6 months ago and the difference is night and day. Staff morale visibly improved.', likes: 12, replies: [] },
      { id: 'c5', author: 'Bello Umar', initials: 'BU', color: '#1A3C5E', date: 'Mar 17, 2026', body: 'What's the typical cost of a monthly office retainer in Abuja?', likes: 3, replies: [
        { id: 'r3', author: 'Operations Team', initials: 'OM', color: '#0F6E56', date: 'Mar 17, 2026', body: 'It depends on office size and frequency, Bello. Drop us a WhatsApp or use the quote form and we'll give you a personalised rate.' }
      ]},
    ],
    3: [
      { id: 'c6', author: 'Chidi Obi', initials: 'CO', color: '#C8941A', date: 'Mar 11, 2026', body: 'Point 3 about delegation is what caught me. Most founders try to do everything themselves for too long.', likes: 14, replies: [] },
      { id: 'c7', author: 'Aisha Mohammed', initials: 'AM', color: '#3C3489', date: 'Mar 12, 2026', body: 'The SOP piece is critical. We documented our first process last week and already saved 4 hours in one day.', likes: 9, replies: [] },
      { id: 'c8', author: 'Tunde Bakare', initials: 'TB', color: '#0F6E56', date: 'Mar 13, 2026', body: 'Would love a deeper article on operational cash flow management for SMEs.', likes: 7, replies: [
        { id: 'r4', author: 'Chiamaka (Amy)', initials: 'CA', color: '#C8941A', date: 'Mar 14, 2026', body: 'That\'s a great request, Tunde! Adding it to our content calendar right now.' }
      ]},
    ],
    4: [
      { id: 'c9', author: 'Yusuf Garba', initials: 'YG', color: '#1A3C5E', date: 'Mar 6, 2026', body: 'CAC registration took us 3 months because we didn't know what documents to prepare. Wish I had this list earlier.', likes: 6, replies: [] },
    ],
    5: [
      { id: 'c10', author: 'Kemi Adeyemi', initials: 'KA', color: '#0F6E56', date: 'Mar 1, 2026', body: 'Our lawyer kept charging us to update our employment letter. Now I understand why — it was barely worth the paper.', likes: 10, replies: [] },
      { id: 'c11', author: 'Seun Lawal', initials: 'SL', color: '#3C3489', date: 'Mar 2, 2026', body: 'The probation clause section cleared up a lot of confusion for me. Thank you!', likes: 4, replies: [] },
    ],
    6: [],
  };

  /* Post content data */
  var postsData = {
    1: {
      title: "Why Nigerian SMEs Keep Getting HR Wrong — And What to Fix First",
      category: "HR & People",
      categoryClass: "blog-card-badge--purple",
      author: "Chiamaka (Amy)",
      authorInitials: "CA",
      authorColor: "#3C3489",
      date: "March 20, 2026",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
      content: `
        <p>Most growing businesses in Abuja and Lagos handle HR reactively. They hire fast when they need someone, fire slowly when things go wrong, and document almost nothing in between. The result? Disputes, inconsistency, and a workforce that doesn't trust management.</p>
        <p>After working with over 50 Nigerian businesses, Yourfirm Consults has identified the patterns that keep repeating. Here's what they are — and exactly where to begin.</p>
        <h2>1. The "employment letter" that isn't really a contract</h2>
        <p>Most Nigerian SMEs issue a one-page letter with a job title and a salary figure. That's not a contract. A proper employment contract covers probation terms, duties and KPIs, disciplinary procedure, termination notice, benefits, and confidentiality. Without this, both the employer and employee are exposed.</p>
        <h2>2. No performance management system</h2>
        <p>When it's time to let someone go, businesses without a documented performance process face real legal risk. "We told them verbally" is not a defence. Build a simple 3-month review cycle with documented goals and written feedback.</p>
        <h2>3. HR decisions live in the founder's head</h2>
        <p>What happens when the founder travels or falls ill? Policies need to be written down — leave management, disciplinary procedures, payroll approval. Documented systems don't just protect the business; they free the founder.</p>
        <h2>4. Payroll is handled on a spreadsheet with no oversight</h2>
        <p>Payroll errors are among the fastest ways to erode staff trust. PAYE remittance, pension deductions, and NHF contributions must be calculated correctly and filed on time. A payroll audit once a year is the minimum.</p>
        <h2>Where to start</h2>
        <p>If you're overwhelmed, start with just one thing: <strong>an employment contract template</strong>. Get one properly drafted, then roll it out to every staff member. That one step will cover your biggest legal risk immediately.</p>
        <p>If you'd like a free HR audit for your business, <strong>reach out to Yourfirm Consults</strong> today. We'll show you where the gaps are and give you a prioritised fix list — at no charge for your first session.</p>
      `
    },
    2: {
      title: "The Hidden Cost of a Dirty Office: What Abuja Businesses Are Missing",
      category: "Cleaning & Hygiene",
      categoryClass: "blog-card-badge--teal",
      author: "Operations Team",
      authorInitials: "OM",
      authorColor: "#0F6E56",
      date: "March 15, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=900&q=80",
      content: `
        <p>Walk into most Abuja offices and you'll find dusty keyboards, smudged glass, overflowing bins, and air conditioning vents caked in grey. The business owner barely notices anymore — but clients and new staff notice immediately.</p>
        <p>The evidence on workplace cleanliness and business performance is clear. Here's what the data shows and what Pura-Kle'N has observed across 500+ professional cleaning sessions.</p>
        <h2>Productivity drops in unclean environments</h2>
        <p>Studies consistently show workers are less focused and more stressed in cluttered or dirty environments. Dust accumulation in open-plan offices is a particular issue — it affects air quality and contributes to sick days, which directly cost the business.</p>
        <h2>Client perception is formed in 7 seconds</h2>
        <p>A client walking into a dirty reception area makes a judgement about your professionalism before you've said a word. The state of your office communicates your attention to detail, your respect for others, and your overall standards. In service businesses, this matters enormously.</p>
        <h2>Staff retention is affected</h2>
        <p>Employees who work in clean, well-maintained spaces report higher job satisfaction. It signals that the organisation cares about them. Abuja businesses that switched to monthly retainer cleaning with Pura-Kle'N consistently report improved feedback in staff surveys.</p>
        <h2>The retainer model is the most cost-effective solution</h2>
        <p>A one-off deep clean is a good start, but without regular maintenance, your office deteriorates within weeks. Our monthly retainer packages start from as low as ₦45,000 for small offices — and include scheduled visits, quality checks, and a dedicated team that knows your space.</p>
        <p>Ready to see the difference? <strong>Request a free assessment</strong> from Pura-Kle'N and we'll visit your office, assess what's needed, and give you a tailored plan.</p>
      `
    },
    3: {
      title: "Scaling an SME in Nigeria: 5 Operational Gaps That Stop Growth",
      category: "Business Growth",
      categoryClass: "blog-card-badge--gold",
      author: "Chiamaka (Amy)",
      authorInitials: "CA",
      authorColor: "#C8941A",
      date: "March 10, 2026",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80",
      content: `
        <p>After working alongside over 50 businesses in Abuja, the same blockers emerge again and again. Revenue grows, chaos follows, and growth stalls. These five gaps are what we see most — and what we help businesses close.</p>
        <h2>1. No Standard Operating Procedures (SOPs)</h2>
        <p>If your business depends on what people "just know," you don't have a business — you have a collection of habits. Document your core processes: how you onboard a client, how you deliver a service, how you handle a complaint. SOPs are what let you delegate and scale.</p>
        <h2>2. Founder dependency</h2>
        <p>The business only works when the founder is present. This isn't sustainability — it's a trap. Building management layers and empowering team leads is the single most leveraged investment a growing business can make.</p>
        <h2>3. Undefined roles leading to duplicated or dropped work</h2>
        <p>Without job descriptions and clear accountability, tasks fall between the cracks. Someone thinks someone else is handling it. This is the source of most client service failures in growing SMEs.</p>
        <h2>4. No feedback mechanisms</h2>
        <p>How do you know if your product or service is working? If your only signal is revenue, you're flying blind. Build structured client feedback, staff feedback, and monthly operational reviews into your calendar.</p>
        <h2>5. Reactive HR instead of proactive people management</h2>
        <p>Hiring when desperate, managing performance informally, and terminating without documentation — these habits create legal risk and high turnover. Build people systems before you need them.</p>
        <p>AmyServes helps businesses close all five of these gaps through our integrated service offering. <strong>Contact us today</strong> to book a business health check.</p>
      `
    },
    4: {
      title: "CAC Registration, PAYE & NHF: A Practical Compliance Checklist for 2026",
      category: "Compliance & Legal",
      categoryClass: "blog-card-badge--navy",
      author: "HR Lead",
      authorInitials: "HR",
      authorColor: "#1A3C5E",
      date: "March 5, 2026",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80",
      content: `
        <p>Regulatory compliance in Nigeria is often treated as optional until the day an inspector arrives. By then, the penalties are real and the scramble is stressful. Here's a plain-language checklist of what every Abuja-based business must have in order in 2026.</p>
        <h2>CAC Registration</h2>
        <p>Business Name Registration or Limited Liability Company (LLC) incorporation are both handled through the Corporate Affairs Commission. Your registration certificate, SCUML certificate (if required), and updated annual returns must all be current. Fines for late annual returns have been increasing.</p>
        <h2>PAYE (Pay As You Earn)</h2>
        <ul>
          <li>All employees must have a Tax Identification Number (TIN)</li>
          <li>PAYE must be deducted monthly and remitted to the relevant State Internal Revenue Service</li>
          <li>Annual tax returns (Form A) must be filed by 31 January each year</li>
        </ul>
        <h2>Pension (PenCom)</h2>
        <p>Any business with 15 or more employees is required to enrol staff in the Contributory Pension Scheme. The employer contributes 10% and the employee 8% of monthly emolument. Failure to remit attracts significant penalties.</p>
        <h2>NHF (National Housing Fund)</h2>
        <p>Every Nigerian employee earning ₦3,000 or more per month is required to contribute 2.5% of their basic salary to the NHF. Employers must deduct and remit this monthly.</p>
        <h2>NSITF (Employee Compensation)</h2>
        <p>Employers must contribute 1% of total monthly payroll to the Nigeria Social Insurance Trust Fund. This covers workplace accidents and occupational diseases.</p>
        <p>Yourfirm Consults handles compliance documentation end-to-end for our clients. <strong>Contact us</strong> to get a compliance audit for your business.</p>
      `
    },
    5: {
      title: "How to Write an Employment Contract That Actually Protects Your Business",
      category: "HR & People",
      categoryClass: "blog-card-badge--purple",
      author: "HR Lead",
      authorInitials: "HR",
      authorColor: "#3C3489",
      date: "February 28, 2026",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=900&q=80",
      content: `
        <p>Most employment letters in Nigerian SMEs fail to protect the employer. They state a job title, a salary, and a start date — and stop there. When disputes arise, there's nothing to reference. Here's what a solid employment contract must actually contain.</p>
        <h2>Essential clauses every contract must include</h2>
        <ul>
          <li><strong>Job title and duties:</strong> Specific enough to hold the employee accountable, broad enough not to be restrictive.</li>
          <li><strong>Probation period:</strong> Typically 3–6 months. State what happens at the end and what review process applies.</li>
          <li><strong>Remuneration:</strong> Basic salary, allowances, and when and how they're paid. Never leave allowances as verbal agreements.</li>
          <li><strong>Working hours and leave:</strong> Annual leave entitlement, sick leave, maternity/paternity policy.</li>
          <li><strong>Termination notice:</strong> How much notice either party must give. Typically one month for confirmed staff.</li>
          <li><strong>Disciplinary procedure:</strong> At minimum: verbal warning, written warning, final warning, termination. Each step must be documented.</li>
          <li><strong>Confidentiality:</strong> If your employee handles sensitive business information, client data, or trade processes.</li>
        </ul>
        <h2>What most letters miss</h2>
        <p>The biggest gap we see is <strong>no KPIs or performance targets</strong> tied to the contract. Without these, disciplinary action for poor performance becomes very difficult to defend legally.</p>
        <h2>Getting it right</h2>
        <p>A properly drafted employment contract is a one-time investment that protects every hire from that point forward. Yourfirm Consults provides contract drafting and review as a standalone service.</p>
        <p><strong>Contact us today</strong> for a complimentary contract review on your existing employment letter.</p>
      `
    },
    6: {
      title: "Post-Construction Cleaning: What Developers in Abuja Need to Know Before Handover",
      category: "Cleaning & Hygiene",
      categoryClass: "blog-card-badge--teal",
      author: "Operations Team",
      authorInitials: "OM",
      authorColor: "#0F6E56",
      date: "February 20, 2026",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&q=80",
      content: `
        <p>Post-construction cleaning is one of the most underestimated steps in a building handover. Developers who try to cut costs here often spend more correcting problems that proper cleaning would have prevented. Here's what the process actually involves.</p>
        <h2>What makes post-construction different</h2>
        <p>Construction sites produce dust and debris that ordinary cleaning cannot handle. Concrete dust penetrates HVAC systems, silica particles settle in flooring grout, and chemical residues from paint and sealants require specific removal methods. Standard household cleaning products and methods are insufficient.</p>
        <h2>A professional post-construction clean covers</h2>
        <ul>
          <li>HVAC and air duct cleaning to remove construction dust from ventilation systems</li>
          <li>Window and glass cleaning including frame tracks and seals</li>
          <li>Floor cleaning and scrubbing including grout lines</li>
          <li>Wall washing and baseboard cleaning</li>
          <li>Fixture and fitting cleaning including lighting, sockets, and switches</li>
          <li>Debris and waste removal</li>
        </ul>
        <h2>Timing matters</h2>
        <p>Post-construction cleaning is typically done in two phases: a rough clean during the final stages of construction, and a detail clean immediately before handover or occupation. Trying to combine these into one visit increases cost and reduces quality.</p>
        <h2>Why use specialists</h2>
        <p>Pura-Kle'N has completed post-construction cleans across commercial buildings, residential developments, and office fit-outs in Abuja. Our teams use industrial-grade equipment and EPA-compliant chemicals. We're also fully insured — important on construction sites where liability matters.</p>
        <p><strong>Planning a handover?</strong> Contact Pura-Kle'N for a site visit and quote.</p>
      `
    }
  };

  /* ──────────────────────────────────────────────
     LOAD SAVED STATE (simulated persistence)
  ────────────────────────────────────────────── */
  function loadSavedState() {
    try {
      var savedUser = sessionStorage.getItem('amyserves_blog_user');
      if (savedUser) state.user = JSON.parse(savedUser);
      var savedLikedPosts = sessionStorage.getItem('amyserves_blog_liked_posts');
      if (savedLikedPosts) state.likedPosts = JSON.parse(savedLikedPosts);
      var savedLikedComments = sessionStorage.getItem('amyserves_blog_liked_comments');
      if (savedLikedComments) state.likedComments = JSON.parse(savedLikedComments);
    } catch(e) {}
  }

  function saveState() {
    try {
      sessionStorage.setItem('amyserves_blog_user', JSON.stringify(state.user));
      sessionStorage.setItem('amyserves_blog_liked_posts', JSON.stringify(state.likedPosts));
      sessionStorage.setItem('amyserves_blog_liked_comments', JSON.stringify(state.likedComments));
    } catch(e) {}
  }

  /* ──────────────────────────────────────────────
     TOAST
  ────────────────────────────────────────────── */
  var toastTimer;
  function showToast(msg) {
    var toast = document.getElementById('blogToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 2800);
  }

  /* ──────────────────────────────────────────────
     AUTH MODAL
  ────────────────────────────────────────────── */
  function openAuthModal(tab) {
    var overlay = document.getElementById('authModalOverlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (tab) switchAuthTab(tab);
  }

  function closeAuthModal() {
    var overlay = document.getElementById('authModalOverlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    clearAuthErrors();
  }

  function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    document.getElementById('panelSignin').classList.toggle('active', tab === 'signin');
    document.getElementById('panelSignup').classList.toggle('active', tab === 'signup');
  }

  function clearAuthErrors() {
    var se = document.getElementById('signinError');
    var ue = document.getElementById('signupError');
    if (se) se.textContent = '';
    if (ue) ue.textContent = '';
  }

  /* Sign In (email, simulated) */
  function handleSignIn() {
    var email = (document.getElementById('signinEmail').value || '').trim();
    var password = (document.getElementById('signinPassword').value || '').trim();
    var errEl = document.getElementById('signinError');

    if (!email || !password) {
      errEl.textContent = 'Please fill in all fields.';
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      errEl.textContent = 'Please enter a valid email address.';
      return;
    }

    var btn = document.getElementById('signinSubmitBtn');
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    // Simulate API call
    setTimeout(function() {
      var name = email.split('@')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
      loginUser({ name: name, email: email });
      btn.textContent = 'Sign In →';
      btn.disabled = false;
      closeAuthModal();
      showToast('✅ Signed in as ' + name);
    }, 900);
  }

  /* Sign Up (email, simulated) */
  function handleSignUp() {
    var first = (document.getElementById('signupFirstName').value || '').trim();
    var last  = (document.getElementById('signupLastName').value || '').trim();
    var email = (document.getElementById('signupEmail').value || '').trim();
    var phone = (document.getElementById('signupPhone').value || '').trim();
    var pass  = (document.getElementById('signupPassword').value || '').trim();
    var conf  = (document.getElementById('signupConfirm').value || '').trim();
    var errEl = document.getElementById('signupError');

    if (!first || !last || !email || !phone || !pass || !conf) {
      errEl.textContent = 'Please fill in all required fields.';
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      errEl.textContent = 'Please enter a valid email address.';
      return;
    }
    if (pass.length < 8) {
      errEl.textContent = 'Password must be at least 8 characters.';
      return;
    }
    if (pass !== conf) {
      errEl.textContent = 'Passwords do not match.';
      return;
    }

    var btn = document.getElementById('signupSubmitBtn');
    btn.textContent = 'Creating account…';
    btn.disabled = true;

    setTimeout(function() {
      loginUser({ name: first + ' ' + last, email: email });
      btn.textContent = 'Create Account →';
      btn.disabled = false;
      closeAuthModal();
      showToast('🎉 Welcome, ' + first + '! Account created.');
    }, 1000);
  }

  /* Social sign-in (placeholder for Supabase OAuth in Phase 5) */
  function handleSocialAuth(provider) {
    showToast('⚙️ ' + provider + ' sign-in will be connected via Supabase in Phase 5.');
    /*
      In Phase 5, replace the above with:
      supabase.auth.signInWithOAuth({ provider: provider.toLowerCase() });
    */
  }

  function loginUser(user) {
    var initials = user.name.split(' ').map(function(w) { return w[0]; }).join('').slice(0,2).toUpperCase();
    var colors = ['#0F6E56','#3C3489','#C8941A','#1A3C5E','#c04040','#2a7a9a'];
    var color = colors[Math.abs(user.email.charCodeAt(0) + user.email.charCodeAt(1)) % colors.length];
    state.user = { name: user.name, email: user.email, initials: initials, color: color };
    saveState();
    updateAuthUI();
  }

  function logoutUser() {
    state.user = null;
    saveState();
    updateAuthUI();
    showToast('You have been signed out.');
  }

  function updateAuthUI() {
    var commentInputBox   = document.getElementById('commentInputBox');
    var commentAuthPrompt = document.getElementById('commentAuthPrompt');
    var commentAvatarDisplay = document.getElementById('commentAvatarDisplay');

    if (state.user) {
      if (commentInputBox)   { commentInputBox.style.display = 'flex'; }
      if (commentAuthPrompt) { commentAuthPrompt.style.display = 'none'; }
      if (commentAvatarDisplay) {
        commentAvatarDisplay.style.background = state.user.color;
        commentAvatarDisplay.textContent = state.user.initials;
      }
    } else {
      if (commentInputBox)   { commentInputBox.style.display = 'none'; }
      if (commentAuthPrompt) { commentAuthPrompt.style.display = 'block'; }
    }
  }

  /* ──────────────────────────────────────────────
     FILTER & SEARCH
  ────────────────────────────────────────────── */
  function applyFilters() {
    var cards = document.querySelectorAll('.blog-card[data-post-id]');
    var q = state.searchQuery.toLowerCase();
    var visible = 0;

    cards.forEach(function(card) {
      var category = card.dataset.category;
      var title    = card.querySelector('.blog-card-title').textContent.toLowerCase();
      var excerpt  = card.querySelector('.blog-card-excerpt');
      var excerptText = excerpt ? excerpt.textContent.toLowerCase() : '';

      var catMatch = state.currentFilter === 'all' || category === state.currentFilter;
      var searchMatch = !q || title.indexOf(q) > -1 || excerptText.indexOf(q) > -1;

      if (catMatch && searchMatch) {
        card.classList.remove('hidden');
        visible++;
      } else {
        card.classList.add('hidden');
      }
    });

    var noResults = document.getElementById('blogNoResults');
    if (noResults) noResults.style.display = visible === 0 ? 'block' : 'none';

    // Sort visible cards in grid
    sortCards();
  }

  function sortCards() {
    var grid = document.getElementById('blogGrid');
    if (!grid) return;
    var cards = Array.from(grid.querySelectorAll('.blog-card[data-post-id]'));
    cards.sort(function(a, b) {
      if (state.currentSort === 'newest') {
        return new Date(b.dataset.date) - new Date(a.dataset.date);
      } else if (state.currentSort === 'oldest') {
        return new Date(a.dataset.date) - new Date(b.dataset.date);
      } else if (state.currentSort === 'popular') {
        return parseInt(b.dataset.likes) - parseInt(a.dataset.likes);
      }
      return 0;
    });
    cards.forEach(function(c) { grid.appendChild(c); });
  }

  window.resetFilters = function() {
    state.currentFilter = 'all';
    state.searchQuery   = '';
    var searchInput = document.getElementById('blogSearch');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.filter === 'all');
    });
    applyFilters();
  };

  /* ──────────────────────────────────────────────
     POST REACTIONS (likes)
  ────────────────────────────────────────────── */
  function handlePostLike(btn) {
    var postId = btn.dataset.postId;
    if (!postId) return;

    var countEl = btn.querySelector('.reaction-count');
    var current = parseInt(countEl.textContent) || 0;

    if (state.likedPosts[postId]) {
      delete state.likedPosts[postId];
      btn.classList.remove('liked');
      countEl.textContent = current - 1;
      // Update dataset
      var card = btn.closest('[data-post-id]');
      if (card) card.dataset.likes = current - 1;
    } else {
      state.likedPosts[postId] = true;
      btn.classList.add('liked');
      countEl.textContent = current + 1;
      var card2 = btn.closest('[data-post-id]');
      if (card2) card2.dataset.likes = current + 1;
      animateLike(btn);
    }
    saveState();
  }

  function animateLike(btn) {
    btn.style.transform = 'scale(1.25)';
    setTimeout(function() { btn.style.transform = ''; }, 200);
  }

  /* Restore liked state on page load */
  function restoreLikedPosts() {
    Object.keys(state.likedPosts).forEach(function(postId) {
      document.querySelectorAll('.reaction-btn[data-post-id="' + postId + '"][data-type="like"]').forEach(function(btn) {
        btn.classList.add('liked');
      });
    });
  }

  /* ──────────────────────────────────────────────
     POST MODAL
  ────────────────────────────────────────────── */
  function openPostModal(postId) {
    var post = postsData[postId];
    if (!post) return;

    state.currentPostId = postId;

    var overlay = document.getElementById('postModalOverlay');
    var articleEl = document.getElementById('postModalArticle');

    // Render article
    var badgeHTML = '<span class="post-modal-category-badge ' + post.categoryClass + '">' + post.category + '</span>';
    var metaHTML = '<div class="post-modal-meta">'
      + '<div class="blog-author-chip"><div class="blog-author-avatar" style="background:' + post.authorColor + '">' + post.authorInitials + '</div><span>' + post.author + '</span></div>'
      + '<span class="blog-meta-dot">·</span><time>' + post.date + '</time>'
      + '<span class="blog-meta-dot">·</span><span>' + post.readTime + '</span>'
      + '</div>';

    articleEl.innerHTML = '<img src="' + post.image + '" alt="' + post.title + '" class="post-modal-hero-img" loading="lazy" />'
      + badgeHTML
      + '<h1 class="post-modal-title">' + post.title + '</h1>'
      + metaHTML
      + '<div class="post-modal-content">' + post.content + '</div>';

    // Load comments
    renderComments(postId);
    updateAuthUI();

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    var modal = document.getElementById('postModal');
    if (modal) modal.scrollTop = 0;
  }

  function closePostModal() {
    var overlay = document.getElementById('postModalOverlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    state.currentPostId = null;
  }

  /* ──────────────────────────────────────────────
     COMMENTS
  ────────────────────────────────────────────── */
  function renderComments(postId) {
    var comments = commentsData[postId] || [];
    var listEl = document.getElementById('commentsList');
    var badgeEl = document.getElementById('commentsBadge');
    var countEl = document.getElementById('comment-count-' + postId);

    // Count total (comments + replies)
    var total = 0;
    comments.forEach(function(c) { total += 1 + (c.replies ? c.replies.length : 0); });

    if (badgeEl) badgeEl.textContent = total;
    if (countEl) countEl.textContent = total;

    if (comments.length === 0) {
      listEl.innerHTML = '<p style="font-size:0.9rem;color:var(--warm-grey);padding:16px 0;">Be the first to comment on this article.</p>';
      return;
    }

    var html = '';
    comments.forEach(function(comment) {
      var isLiked = state.likedComments[comment.id];
      var likedClass = isLiked ? ' comment-liked' : '';
      var likedFill  = isLiked ? ' fill="currentColor" stroke="currentColor"' : '';

      html += '<div class="comment-item" id="' + comment.id + '">';
      html += '<div class="comment-header">';
      html += '<div class="comment-avatar" style="background:' + comment.color + '">' + comment.initials + '</div>';
      html += '<span class="comment-author-name">' + escHtml(comment.author) + '</span>';
      html += '<span class="comment-date">' + comment.date + '</span>';
      html += '</div>';
      html += '<p class="comment-body">' + escHtml(comment.body) + '</p>';
      html += '<div class="comment-actions">';
      html += '<button class="comment-action-btn comment-like-btn' + likedClass + '" data-comment-id="' + comment.id + '">';
      html += '<svg viewBox="0 0 24 24"' + likedFill + ' stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
      html += '<span class="comment-like-count" id="cl-' + comment.id + '">' + (comment.likes || 0) + '</span></button>';
      html += '<button class="comment-action-btn reply-toggle-btn" data-comment-id="' + comment.id + '">Reply</button>';
      html += '</div>';

      // Reply input (hidden by default)
      html += '<div class="reply-input-wrap" id="reply-input-' + comment.id + '">';
      html += '<textarea placeholder="Write a reply…" rows="2" id="reply-textarea-' + comment.id + '"></textarea>';
      html += '<button class="btn btn-primary btn-sm submit-reply-btn" data-comment-id="' + comment.id + '">Reply</button>';
      html += '</div>';

      // Replies
      if (comment.replies && comment.replies.length > 0) {
        html += '<div class="comment-replies">';
        comment.replies.forEach(function(reply) {
          html += '<div class="reply-item" id="' + reply.id + '">';
          html += '<div class="reply-header">';
          html += '<div class="reply-avatar" style="background:' + reply.color + '">' + reply.initials + '</div>';
          html += '<span class="reply-author">' + escHtml(reply.author) + '</span>';
          html += '<span class="reply-date">' + reply.date + '</span>';
          html += '</div>';
          html += '<p class="reply-body">' + escHtml(reply.body) + '</p>';
          html += '</div>';
        });
        html += '</div>';
      }

      html += '</div>';
    });

    listEl.innerHTML = html;
    attachCommentEvents();
  }

  function attachCommentEvents() {
    // Comment likes
    document.querySelectorAll('.comment-like-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (!state.user) { openAuthModal('signin'); return; }
        var cid = btn.dataset.commentId;
        var countEl = document.getElementById('cl-' + cid);
        var current = parseInt(countEl.textContent) || 0;
        if (state.likedComments[cid]) {
          delete state.likedComments[cid];
          btn.classList.remove('comment-liked');
          btn.querySelector('svg').removeAttribute('fill');
          countEl.textContent = current - 1;
          // Update in data
          updateCommentLikeCount(cid, current - 1);
        } else {
          state.likedComments[cid] = true;
          btn.classList.add('comment-liked');
          btn.querySelector('svg').setAttribute('fill', 'currentColor');
          countEl.textContent = current + 1;
          updateCommentLikeCount(cid, current + 1);
        }
        saveState();
      });
    });

    // Reply toggles
    document.querySelectorAll('.reply-toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (!state.user) { openAuthModal('signin'); return; }
        var cid = btn.dataset.commentId;
        var wrap = document.getElementById('reply-input-' + cid);
        if (wrap) {
          wrap.classList.toggle('open');
          if (wrap.classList.contains('open')) {
            var ta = document.getElementById('reply-textarea-' + cid);
            if (ta) ta.focus();
          }
        }
      });
    });

    // Submit reply
    document.querySelectorAll('.submit-reply-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var cid = btn.dataset.commentId;
        var ta = document.getElementById('reply-textarea-' + cid);
        if (!ta || !ta.value.trim()) return;
        submitReply(cid, ta.value.trim());
        ta.value = '';
        var wrap = document.getElementById('reply-input-' + cid);
        if (wrap) wrap.classList.remove('open');
      });
    });
  }

  function updateCommentLikeCount(commentId, count) {
    var postId = state.currentPostId;
    if (!commentsData[postId]) return;
    commentsData[postId].forEach(function(c) {
      if (c.id === commentId) c.likes = count;
    });
  }

  function submitReply(commentId, body) {
    var postId = state.currentPostId;
    if (!postId || !state.user) return;

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    var reply = {
      id: 'r' + Date.now(),
      author: state.user.name,
      initials: state.user.initials,
      color: state.user.color,
      date: dateStr,
      body: body
    };

    // Add to data
    commentsData[postId].forEach(function(c) {
      if (c.id === commentId) {
        if (!c.replies) c.replies = [];
        c.replies.push(reply);
      }
    });

    renderComments(postId);
    showToast('Reply posted!');
  }

  /* Submit comment */
  function submitComment() {
    var postId = state.currentPostId;
    if (!postId || !state.user) return;

    var ta = document.getElementById('commentTextarea');
    var body = ta ? ta.value.trim() : '';
    if (!body) return;
    if (body.length > 500) { showToast('Comment is too long (max 500 characters).'); return; }

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    var comment = {
      id: 'c' + Date.now(),
      author: state.user.name,
      initials: state.user.initials,
      color: state.user.color,
      date: dateStr,
      body: body,
      likes: 0,
      replies: []
    };

    if (!commentsData[postId]) commentsData[postId] = [];
    commentsData[postId].push(comment);

    ta.value = '';
    updateCharCount(ta, document.getElementById('charCount'));
    renderComments(postId);
    showToast('Comment posted!');
  }

  function updateCharCount(ta, countEl) {
    if (countEl) countEl.textContent = (ta.value.length) + ' / 500';
  }

  /* ──────────────────────────────────────────────
     SHARE
  ────────────────────────────────────────────── */
  function sharePost(postId, platform) {
    var post = postsData[postId];
    if (!post) return;

    var url   = window.location.origin + window.location.pathname + '?post=' + postId;
    var title = post.title;
    var text  = 'Check out this article from AmyServes: ' + title;

    switch (platform) {
      case 'facebook':
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text + ' ' + url), '_blank');
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title), '_blank', 'width=600,height=500');
        break;
      case 'copy':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function() { showToast('🔗 Link copied to clipboard!'); });
        } else {
          // Fallback
          var ta = document.createElement('textarea');
          ta.value = url; document.body.appendChild(ta);
          ta.select(); document.execCommand('copy');
          document.body.removeChild(ta);
          showToast('🔗 Link copied!');
        }
        break;
    }
  }

  /* Popover share (from card share button) */
  function showSharePopover(btn, postId) {
    var popover = document.getElementById('sharePopover');
    if (!popover) return;

    state.shareTarget = postId;
    popover.style.display = 'block';

    var rect = btn.getBoundingClientRect();
    var top  = rect.bottom + window.scrollY + 8;
    var left = rect.left + window.scrollX;

    // Clamp to viewport
    var pw = 220;
    if (left + pw > window.innerWidth - 16) left = window.innerWidth - pw - 16;

    popover.style.top  = top + 'px';
    popover.style.left = left + 'px';
  }

  function hideSharePopover() {
    var popover = document.getElementById('sharePopover');
    if (popover) popover.style.display = 'none';
    state.shareTarget = null;
  }

  /* ──────────────────────────────────────────────
     NEWSLETTER
  ────────────────────────────────────────────── */
  function handleNewsletterSubmit() {
    var emailInput = document.getElementById('newsletterEmail');
    var email = emailInput ? emailInput.value.trim() : '';
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }
    var form    = document.getElementById('newsletterForm');
    var success = document.getElementById('newsletterSuccess');
    if (form) form.style.display = 'none';
    if (success) success.style.display = 'block';
    showToast('📧 You\'re subscribed to the AmyServes blog!');
  }

  /* ──────────────────────────────────────────────
     UTILITY
  ────────────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ──────────────────────────────────────────────
     INIT
  ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function() {
    loadSavedState();

    /* ── Filter buttons ── */
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        state.currentFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    /* ── Sidebar category buttons ── */
    document.querySelectorAll('.sidebar-cat-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.currentFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(function(b) {
          b.classList.toggle('active', b.dataset.filter === state.currentFilter);
        });
        applyFilters();
        // Scroll to posts
        document.querySelector('.blog-posts-col').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* ── Sort ── */
    var sortSelect = document.getElementById('blogSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', function() {
        state.currentSort = sortSelect.value;
        sortCards();
      });
    }

    /* ── Search ── */
    var searchInput = document.getElementById('blogSearch');
    var searchClear = document.getElementById('searchClear');
    if (searchInput) {
      var searchTimeout;
      searchInput.addEventListener('input', function() {
        state.searchQuery = searchInput.value;
        if (searchClear) searchClear.style.display = state.searchQuery ? 'block' : 'none';
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 250);
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', function() {
        if (searchInput) searchInput.value = '';
        state.searchQuery = '';
        searchClear.style.display = 'none';
        applyFilters();
      });
    }

    /* ── Post links (open modal) ── */
    document.addEventListener('click', function(e) {
      var link = e.target.closest('.blog-post-link');
      if (link) {
        e.preventDefault();
        var postId = parseInt(link.dataset.id);
        if (postId) openPostModal(postId);
      }
    });

    /* ── Post like buttons ── */
    document.querySelectorAll('.reaction-btn[data-type="like"]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        handlePostLike(btn);
      });
    });

    /* ── Comment trigger from card ── */
    document.querySelectorAll('.comment-trigger-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var postId = parseInt(btn.dataset.postId);
        if (postId) {
          openPostModal(postId);
          // Scroll to comments after modal opens
          setTimeout(function() {
            var commentsEl = document.querySelector('.comments-section');
            if (commentsEl) commentsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 400);
        }
      });
    });

    /* ── Share buttons on cards ── */
    document.querySelectorAll('.share-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        showSharePopover(btn, btn.dataset.postId);
      });
    });

    /* ── Share popover buttons ── */
    document.getElementById('sharePopover').addEventListener('click', function(e) {
      var btn = e.target.closest('.share-pop-btn');
      if (btn && state.shareTarget) {
        sharePost(state.shareTarget, btn.dataset.platform);
        hideSharePopover();
      }
    });

    /* ── Close popover on outside click ── */
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.share-btn') && !e.target.closest('#sharePopover')) {
        hideSharePopover();
      }
    });

    /* ── Post modal close ── */
    document.getElementById('postModalClose').addEventListener('click', closePostModal);
    document.getElementById('postModalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closePostModal();
    });

    /* ── Share buttons inside post modal ── */
    document.querySelectorAll('#postShareBtns .share-social-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        sharePost(state.currentPostId, btn.dataset.platform);
      });
    });

    /* ── Copy link button inside modal ── */
    var copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', function() {
        sharePost(state.currentPostId, 'copy');
      });
    }

    /* ── Auth modal open/close ── */
    document.getElementById('authModalClose').addEventListener('click', closeAuthModal);
    document.getElementById('authModalOverlay').addEventListener('click', function(e) {
      if (e.target === this) closeAuthModal();
    });

    /* ── Auth tab clicks ── */
    document.querySelectorAll('.auth-tab, .auth-switch-link').forEach(function(el) {
      el.addEventListener('click', function() {
        if (this.dataset.tab) switchAuthTab(this.dataset.tab);
      });
    });

    /* ── Social auth buttons ── */
    ['googleSigninBtn','googleSignupBtn'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function() { handleSocialAuth('Google'); });
    });
    ['appleSigninBtn','appleSignupBtn'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function() { handleSocialAuth('Apple'); });
    });

    /* ── Sign in submit ── */
    document.getElementById('signinSubmitBtn').addEventListener('click', handleSignIn);
    document.getElementById('signinPassword').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleSignIn();
    });

    /* ── Sign up submit ── */
    document.getElementById('signupSubmitBtn').addEventListener('click', handleSignUp);

    /* ── Auth from comment prompt ── */
    var openAuthFromComment = document.getElementById('openAuthFromComment');
    if (openAuthFromComment) {
      openAuthFromComment.addEventListener('click', function() { openAuthModal('signin'); });
    }

    /* ── Comment textarea char count ── */
    var commentTextarea = document.getElementById('commentTextarea');
    var charCount = document.getElementById('charCount');
    if (commentTextarea && charCount) {
      commentTextarea.addEventListener('input', function() {
        updateCharCount(commentTextarea, charCount);
      });
    }

    /* ── Submit comment ── */
    var submitCommentBtn = document.getElementById('submitCommentBtn');
    if (submitCommentBtn) {
      submitCommentBtn.addEventListener('click', submitComment);
    }

    /* ── Newsletter ── */
    var newsletterSubmit = document.getElementById('newsletterSubmit');
    if (newsletterSubmit) {
      newsletterSubmit.addEventListener('click', handleNewsletterSubmit);
      var newsletterInput = document.getElementById('newsletterEmail');
      if (newsletterInput) {
        newsletterInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') handleNewsletterSubmit();
        });
      }
    }

    /* ── Load more (placeholder) ── */
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        loadMoreBtn.textContent = 'No more articles yet — check back soon!';
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.5';
      });
    }

    /* ── Escape key closes modals ── */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closePostModal();
        closeAuthModal();
        hideSharePopover();
      }
    });

    /* ── Restore liked state ── */
    restoreLikedPosts();

    /* ── Initial filter apply ── */
    applyFilters();
  });

})();
