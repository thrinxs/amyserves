/* ══════════════════════════════════════════════════════
   BLOG-POST.JS — AmyServes Single Article Page
   Reads ?id= from URL and renders the matching post.
   All post data lives in blog.js; this file imports
   a shared data module OR duplicates just what it needs.
   For simplicity, data is self-contained here.
══════════════════════════════════════════════════════ */

(function () {
    'use strict';
  
    /* ── POST DATA (mirror of blog.js postsData) ──────── */
    var postsData = {
      1: {
        title: "Why Nigerian SMEs Keep Getting HR Wrong — And What to Fix First",
        category: "HR & People", categoryClass: "blog-card-badge--purple",
        author: "Chiamaka (Amy)", authorInitials: "CA", authorColor: "#3C3489",
        date: "March 20, 2026", readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
        likes: 47, featured: true,
        tags: ["HR", "Nigeria", "SME", "Employment"],
        content: `
          <p>Most growing businesses in Abuja and Lagos handle HR reactively. They hire fast when they need someone, fire slowly when things go wrong, and document almost nothing in between. The result? Disputes, inconsistency, and a workforce that doesn't trust management.</p>
          <p>After working with over 50 Nigerian businesses, Yourfirm Consults has identified the patterns that keep repeating. Here's what they are — and exactly where to begin.</p>
          <h2>1. The "employment letter" that isn't really a contract</h2>
          <p>Most Nigerian SMEs issue a one-page letter with a job title and a salary figure. That's not a contract. A proper employment contract covers probation terms, duties and KPIs, disciplinary procedure, termination notice, benefits, and confidentiality. Without this, both parties are exposed.</p>
          <h2>2. No performance management system</h2>
          <p>When it's time to let someone go, businesses without a documented performance process face real legal risk. "We told them verbally" is not a defence. Build a simple 3-month review cycle with documented goals and written feedback.</p>
          <h2>3. HR decisions live in the founder's head</h2>
          <p>When the founder is the HR manager, the operations lead, and the finance director — nothing gets documented. The moment they step back, everything breaks. Your first hire should almost always be an operations or HR coordinator.</p>
          <h2>4. Payroll is not HR</h2>
          <p>Many businesses confuse paying salaries with managing people. Payroll is one output of HR. The function also covers onboarding, training, performance, compliance, and offboarding. Treat it as a system, not a task.</p>
          <h2>5. Where to begin</h2>
          <p>Start with three documents: an employment contract template, a disciplinary procedure, and a probation review form. These three alone will protect you from the majority of HR disputes we see in Nigerian SMEs.</p>
          <div class="post-callout">
            <p><strong>Ready to build a proper HR foundation?</strong> Yourfirm Consults offers a free 30-minute HR audit for Nigerian SMEs. Book yours via the contact page.</p>
          </div>
        `
      },
      2: {
        title: "The Hidden Cost of a Dirty Office: What Abuja Businesses Are Missing",
        category: "Cleaning & Hygiene", categoryClass: "blog-card-badge--teal",
        author: "Operations Team", authorInitials: "OM", authorColor: "#0F6E56",
        date: "March 15, 2026", readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200&q=80",
        likes: 31, featured: false,
        tags: ["Cleaning", "Office", "Productivity", "Abuja"],
        content: `
          <p>Walk into a poorly maintained office and you feel it before you consciously register it. The subtle mustiness, dusty surfaces, smudged glass. It signals to clients: we don't sweat the details. And to staff: you're not worth the effort.</p>
          <h2>The productivity connection</h2>
          <p>Studies consistently link clean working environments to reduced sick days, better concentration, and higher morale. In a Nigerian context — where air conditioning circulates dust and humidity encourages mould — this is even more pronounced.</p>
          <h2>What Abuja businesses typically miss</h2>
          <p>Most offices manage basic cleaning — floors swept, bins emptied. But they neglect: air vents and AC filters, deep sanitisation of shared surfaces, restroom hygiene standards, and post-event restoration. These are exactly where pathogens and allergens accumulate.</p>
          <h2>The cost calculation</h2>
          <p>If one senior staff member loses one productive day per month to illness linked to workspace conditions, the lost output far exceeds what a monthly professional cleaning retainer would cost. The economics are clear.</p>
          <div class="post-callout">
            <p><strong>Pura-Kle'N</strong> offers monthly cleaning retainers for offices across Abuja starting from ₦45,000/month. Get a custom quote via our services page.</p>
          </div>
        `
      },
      3: {
        title: "Scaling an SME in Nigeria: 5 Operational Gaps That Stop Growth",
        category: "Business Growth", categoryClass: "blog-card-badge--gold",
        author: "Chiamaka (Amy)", authorInitials: "CA", authorColor: "#C8941A",
        date: "March 10, 2026", readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",
        likes: 58, featured: false,
        tags: ["Business", "Operations", "Growth", "Nigeria"],
        content: `
          <p>After working with over 50 businesses across Abuja, these are the five structural gaps we see repeatedly — and exactly how to close them.</p>
          <h2>1. No written SOPs</h2>
          <p>Standard Operating Procedures are not corporate bureaucracy — they're how you scale. If a process only works because a specific person does it, you don't have a process, you have a dependency.</p>
          <h2>2. Founder bottleneck</h2>
          <p>When every decision flows through the founder, growth is capped at the founder's capacity. Delegation requires documented processes and trusted team members — both of which take investment to build.</p>
          <h2>3. No financial dashboard</h2>
          <p>Many SME owners know their bank balance but not their margins, burn rate, or debtor days. Without these numbers, scaling is guesswork.</p>
          <h2>4. Reactive hiring</h2>
          <p>Hiring when you're desperate leads to bad fits and rushed onboarding. Plan your team structure 6 months ahead of where you need to be.</p>
          <h2>5. No client retention system</h2>
          <p>Acquiring a new client costs 5x more than retaining one. Most Nigerian SMEs have no formal follow-up process, no feedback loop, and no loyalty mechanism.</p>
        `
      },
      4: {
        title: "CAC Registration, PAYE & NHF: A Practical Compliance Checklist for 2026",
        category: "Compliance & Legal", categoryClass: "blog-card-badge--navy",
        author: "HR Lead", authorInitials: "HR", authorColor: "#1A3C5E",
        date: "March 5, 2026", readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",
        likes: 24, featured: false,
        tags: ["Compliance", "CAC", "PAYE", "Legal", "Nigeria"],
        content: `
          <p>Regulatory compliance in Nigeria is easier than it looks when you have the right checklist. Here's what every Abuja-based business must have in order this year.</p>
          <h2>CAC Registration</h2>
          <p>If you're operating as a business name or limited company without CAC registration, you're trading illegally. Beyond the legal risk, unregistered businesses cannot open corporate bank accounts or win formal contracts. The process is now largely online via the CAC portal.</p>
          <h2>PAYE (Pay As You Earn)</h2>
          <p>If you have staff on payroll, you are legally obligated to register with your state's Internal Revenue Service and remit PAYE monthly. Failure to do so attracts penalties and back-payments. Many SMEs don't realise this applies from the first employee.</p>
          <h2>NHF (National Housing Fund)</h2>
          <p>Employers must deduct 2.5% of each employee's basic salary and remit to the Federal Mortgage Bank of Nigeria. This is often overlooked by smaller businesses.</p>
          <h2>Pension (PenCom)</h2>
          <p>Businesses with 3 or more employees must register with a licensed Pension Fund Administrator. Employee contributes 8%, employer contributes 10% of monthly emoluments.</p>
          <div class="post-callout">
            <p><strong>Need help getting compliant?</strong> Yourfirm Consults offers compliance audits and can handle registration on your behalf. Contact us to get started.</p>
          </div>
        `
      },
      5: {
        title: "How to Write an Employment Contract That Actually Protects Your Business",
        category: "HR & People", categoryClass: "blog-card-badge--purple",
        author: "HR Lead", authorInitials: "HR", authorColor: "#3C3489",
        date: "February 28, 2026", readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=1200&q=80",
        likes: 39, featured: false,
        tags: ["HR", "Employment", "Contracts", "Legal"],
        content: `
          <p>Vague employment letters are one of the biggest legal risks for Nigerian businesses. Here's what a proper contract must include — with plain-language explanations.</p>
          <h2>The essentials every contract needs</h2>
          <p>At minimum, an employment contract must state: job title and reporting line, start date and probation period, salary and payment schedule, working hours and location, leave entitlements, notice period, grounds for termination, and confidentiality obligations.</p>
          <h2>The probation clause</h2>
          <p>A standard probation period is 3–6 months. During this period, either party can terminate with shorter notice (typically one week). After confirmation, a longer notice period applies. Make this explicit — don't leave it implied.</p>
          <h2>Disciplinary procedure</h2>
          <p>Your contract should reference a disciplinary policy. This doesn't have to be a 20-page document — a single page outlining verbal warning, written warning, final written warning, and dismissal is sufficient for most SMEs.</p>
          <h2>What NOT to include</h2>
          <p>Avoid clauses that violate Nigerian labour law — such as unpaid overtime requirements or non-compete periods longer than 12 months. These are unenforceable and signal poor legal counsel.</p>
        `
      },
      6: {
        title: "Post-Construction Cleaning: What Developers in Abuja Need to Know Before Handover",
        category: "Cleaning & Hygiene", categoryClass: "blog-card-badge--teal",
        author: "Operations Team", authorInitials: "OM", authorColor: "#0F6E56",
        date: "February 20, 2026", readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
        likes: 19, featured: false,
        tags: ["Cleaning", "Construction", "Abuja", "Handover"],
        content: `
          <p>Construction dust, chemical residues, and debris require specialist handling. Here's what a professional post-construction clean actually involves — and why it matters before handover.</p>
          <h2>What's different about post-construction cleaning</h2>
          <p>Standard cleaning removes surface dirt. Post-construction cleaning removes construction dust (which is ultra-fine and penetrates everywhere), paint overspray, adhesive residues, cement splatter, and packaging debris. It requires specialist equipment and training.</p>
          <h2>The three-phase approach</h2>
          <p>Professional post-construction cleaning happens in three phases: rough clean (bulk debris removal), light clean (surface sanitisation and window cleaning), and final clean (detailed inspection and touch-ups before handover).</p>
          <h2>What developers often miss</h2>
          <p>Air duct cleaning after construction is critical — construction dust enters HVAC systems and will circulate indefinitely if not addressed. This is often overlooked but affects occupant health from day one.</p>
          <div class="post-callout">
            <p><strong>Pura-Kle'N</strong> specialises in post-construction cleaning for residential and commercial projects across Abuja. Request a site assessment before your handover date.</p>
          </div>
        `
      }
    };
  
    var commentsData = {
      1: [
        { id: 'c1', author: 'Emeka Nwosu', initials: 'EN', color: '#0F6E56', date: 'Mar 21, 2026', body: 'This is exactly what we needed. We've been running HR reactively for 3 years and it's finally catching up with us.', likes: 8, replies: [
          { id: 'r1', author: 'Chiamaka (Amy)', initials: 'CA', color: '#3C3489', date: 'Mar 21, 2026', body: 'Glad it resonated, Emeka! Reach out if you'd like a free HR audit.' }
        ]},
        { id: 'c2', author: 'Fatima Abdullahi', initials: 'FA', color: '#C8941A', date: 'Mar 22, 2026', body: 'The section on documentation is golden. Most SMEs don't realise they're at legal risk until something goes wrong.', likes: 5, replies: [] },
        { id: 'c3', author: 'David Okonkwo', initials: 'DO', color: '#1A3C5E', date: 'Mar 23, 2026', body: 'How does this apply to businesses under 10 staff?', likes: 2, replies: [
          { id: 'r2', author: 'HR Lead', initials: 'HR', color: '#3C3489', date: 'Mar 23, 2026', body: 'Yes, even for micro-businesses the foundations matter — we have a lite framework for teams under 10.' }
        ]},
      ],
      2: [
        { id: 'c4', author: 'Ngozi Eze', initials: 'NE', color: '#0F6E56', date: 'Mar 16, 2026', body: 'We switched to a professional cleaning retainer 6 months ago and the difference is night and day.', likes: 12, replies: [] },
        { id: 'c5', author: 'Bello Umar', initials: 'BU', color: '#1A3C5E', date: 'Mar 17, 2026', body: 'What's the typical cost of a monthly retainer in Abuja?', likes: 3, replies: [
          { id: 'r3', author: 'Operations Team', initials: 'OM', color: '#0F6E56', date: 'Mar 17, 2026', body: 'It depends on size and frequency. Drop us a WhatsApp or use the quote form for a personalised rate.' }
        ]},
      ],
      3: [
        { id: 'c6', author: 'Chidi Obi', initials: 'CO', color: '#C8941A', date: 'Mar 11, 2026', body: 'Point 3 about delegation is what caught me. Most founders try to do everything for too long.', likes: 14, replies: [] },
      ],
      4: [
        { id: 'c9', author: 'Yusuf Garba', initials: 'YG', color: '#1A3C5E', date: 'Mar 6, 2026', body: 'CAC registration took us 3 months because we didn't know what documents to prepare. Wish I had this list earlier.', likes: 6, replies: [] },
      ],
      5: [
        { id: 'c10', author: 'Kemi Adeyemi', initials: 'KA', color: '#0F6E56', date: 'Mar 1, 2026', body: 'Our lawyer kept charging us to update our employment letter. Now I understand why — it was barely worth the paper.', likes: 10, replies: [] },
      ],
      6: []
    };
  
    /* ── STATE ─────────────────────────────────────────── */
    var state = {
      postId: null,
      post: null,
      user: null,
      liked: false,
      likedComments: {},
      comments: []
    };
  
    /* ── INIT ──────────────────────────────────────────── */
    function init() {
      var params = new URLSearchParams(window.location.search);
      state.postId = parseInt(params.get('id'), 10) || 1;
      state.post = postsData[state.postId];
  
      if (!state.post) {
        document.title = 'Post Not Found — AmyServes';
        document.querySelector('.post-content').innerHTML = '<p>Article not found. <a href="../blog.html">Back to Blog →</a></p>';
        return;
      }
  
      state.comments = JSON.parse(JSON.stringify(commentsData[state.postId] || []));
      state.liked = !!JSON.parse(localStorage.getItem('bp_liked_' + state.postId) || 'false');
  
      renderPost();
      renderTOC();
      renderComments();
      renderRelated();
      renderPrevNext();
      bindEvents();
      setupReadingProgress();
      setupTOCScroll();
      checkAuth();
    }
  
    /* ── RENDER POST ───────────────────────────────────── */
    function renderPost() {
      var p = state.post;
      document.title = p.title + ' — AmyServes Blog';
      document.getElementById('metaDescription').content = p.title;
      document.getElementById('pageTitle').textContent = p.title + ' — AmyServes Blog';
  
      var img = document.getElementById('postHeroImage');
      img.src = p.image; img.alt = p.title;
  
      document.getElementById('postBadge').textContent = p.category;
      document.getElementById('postBadge').className = 'blog-card-badge ' + p.categoryClass;
      if (p.featured) document.getElementById('postFeaturedTag').style.display = 'inline-block';
  
      document.getElementById('postTitle').textContent = p.title;
  
      var av = document.getElementById('postAuthorAvatar');
      av.textContent = p.authorInitials;
      av.style.background = p.authorColor;
      document.getElementById('postAuthorName').textContent = p.author;
      document.getElementById('postDate').textContent = p.date;
      document.getElementById('postReadTime').textContent = p.readTime;
  
      var likeCount = p.likes + (state.liked ? 1 : 0);
      document.getElementById('postLikeCount').textContent = likeCount + ' likes';
      document.getElementById('postContent').innerHTML = p.content;
  
      // Tags
      var tagsEl = document.getElementById('postTags');
      tagsEl.innerHTML = (p.tags || []).map(function(t) {
        return '<span class="post-tag">' + t + '</span>';
      }).join('');
  
      // Like btn
      updateLikeUI();
  
      // Author card
      var cardAv = document.getElementById('authorCardAvatar');
      cardAv.textContent = p.authorInitials;
      cardAv.style.background = p.authorColor;
      document.getElementById('authorCardName').textContent = p.author;
    }
  
    function updateLikeUI() {
      var p = state.post;
      var count = p.likes + (state.liked ? 1 : 0);
      var articleBtn = document.getElementById('articleLikeBtn');
      var tocBtn = document.getElementById('tocLikeBtn');
      document.getElementById('articleLikeCount').textContent = count;
      document.getElementById('tocLikeCountLabel').textContent = count + ' likes';
      document.getElementById('postLikeCount').textContent = count + ' likes';
  
      if (state.liked) {
        articleBtn.classList.add('liked');
        tocBtn.classList.add('liked');
        document.getElementById('articleLikeLabel').textContent = 'Liked!';
      } else {
        articleBtn.classList.remove('liked');
        tocBtn.classList.remove('liked');
        document.getElementById('articleLikeLabel').textContent = 'Like this article';
      }
    }
  
    /* ── TOC ───────────────────────────────────────────── */
    function renderTOC() {
      var headings = document.getElementById('postContent').querySelectorAll('h2, h3');
      var toc = document.getElementById('postToc');
      if (!headings.length) { document.getElementById('postTocCol').style.display = 'none'; return; }
      headings.forEach(function(h, i) {
        var id = 'heading-' + i;
        h.id = id;
        var a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = h.textContent;
        if (h.tagName === 'H3') a.style.paddingLeft = '20px';
        toc.appendChild(a);
      });
    }
  
    function setupTOCScroll() {
      var links = document.querySelectorAll('.post-toc a');
      var headings = Array.from(document.getElementById('postContent').querySelectorAll('h2,h3'));
      if (!headings.length) return;
      window.addEventListener('scroll', function() {
        var scrollY = window.scrollY + 120;
        var current = headings[0].id;
        headings.forEach(function(h) { if (h.offsetTop <= scrollY) current = h.id; });
        links.forEach(function(l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
      }, { passive: true });
    }
  
    /* ── READING PROGRESS ──────────────────────────────── */
    function setupReadingProgress() {
      var bar = document.getElementById('readingProgress');
      window.addEventListener('scroll', function() {
        var el = document.getElementById('postArticle');
        var rect = el.getBoundingClientRect();
        var total = el.offsetHeight - window.innerHeight;
        var scrolled = -rect.top;
        var pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
        bar.style.width = pct + '%';
      }, { passive: true });
    }
  
    /* ── COMMENTS ──────────────────────────────────────── */
    function renderComments() {
      var list = document.getElementById('commentsList');
      var badge = document.getElementById('commentsBadge');
      var total = state.comments.reduce(function(acc, c) {
        return acc + 1 + (c.replies ? c.replies.length : 0);
      }, 0);
      badge.textContent = total;
      list.innerHTML = state.comments.map(function(c) { return buildCommentHTML(c); }).join('');
      list.querySelectorAll('.comment-like-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { toggleCommentLike(btn); });
      });
      list.querySelectorAll('.comment-reply-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { openReplyBox(btn); });
      });
    }
  
    function buildCommentHTML(c) {
      var liked = !!state.likedComments[c.id];
      var likeCount = c.likes + (liked ? 1 : 0);
      var repliesHTML = (c.replies && c.replies.length) ? '<div class="replies-list">' + c.replies.map(function(r) {
        return '<div class="reply-item"><div class="reply-avatar" style="background:' + r.color + '">' + r.initials + '</div><div><div style="display:flex;gap:10px;align-items:center"><span class="reply-author">' + r.author + '</span><span class="reply-date">' + r.date + '</span></div><p class="reply-body">' + r.body + '</p></div></div>';
      }).join('') + '</div>' : '';
      return '<div class="comment-item" data-id="' + c.id + '">' +
        '<div class="comment-avatar" style="background:' + c.color + '">' + c.initials + '</div>' +
        '<div class="comment-body-wrap">' +
          '<div class="comment-header"><span class="comment-author">' + c.author + '</span><span class="comment-date">' + c.date + '</span></div>' +
          '<p class="comment-body">' + c.body + '</p>' +
          '<div class="comment-actions">' +
            '<button class="comment-action-btn comment-like-btn' + (liked ? ' liked' : '') + '" data-id="' + c.id + '">' +
              '<svg viewBox="0 0 24 24" fill="' + (liked ? '#e05c7a' : 'none') + '" stroke="' + (liked ? '#e05c7a' : 'currentColor') + '" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> ' + likeCount +
            '</button>' +
            '<button class="comment-action-btn comment-reply-btn" data-id="' + c.id + '">Reply</button>' +
          '</div>' +
          repliesHTML +
          '<div class="reply-input-area" id="reply-area-' + c.id + '" style="display:none;margin-top:12px"></div>' +
        '</div>' +
      '</div>';
    }
  
    function toggleCommentLike(btn) {
      if (!state.user) { openAuth(); return; }
      var id = btn.dataset.id;
      state.likedComments[id] = !state.likedComments[id];
      renderComments();
    }
  
    function openReplyBox(btn) {
      if (!state.user) { openAuth(); return; }
      var id = btn.dataset.id;
      var area = document.getElementById('reply-area-' + id);
      if (area.innerHTML) { area.innerHTML = ''; area.style.display = 'none'; return; }
      area.style.display = 'block';
      area.innerHTML = '<div style="display:flex;gap:10px"><div class="reply-avatar" style="background:' + (state.user.color || '#3C3489') + '">' + state.user.initials + '</div><div style="flex:1"><textarea style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:6px;font-family:inherit;font-size:.85rem;resize:vertical" rows="2" placeholder="Write a reply…" id="reply-ta-' + id + '"></textarea><div style="display:flex;justify-content:flex-end;margin-top:6px"><button class="btn btn-primary btn-sm" onclick="window._submitReply(\'' + id + '\')">Post Reply</button></div></div></div>';
    }
  
    window._submitReply = function(commentId) {
      var ta = document.getElementById('reply-ta-' + commentId);
      var text = ta.value.trim();
      if (!text) return;
      var comment = state.comments.find(function(c) { return c.id === commentId; });
      if (comment) {
        if (!comment.replies) comment.replies = [];
        comment.replies.push({
          id: 'r-' + Date.now(),
          author: state.user.name,
          initials: state.user.initials,
          color: state.user.color || '#3C3489',
          date: 'Just now',
          body: text
        });
      }
      renderComments();
      showToast('Reply posted!');
    };
  
    /* ── RELATED POSTS ─────────────────────────────────── */
    function renderRelated() {
      var p = state.post;
      var related = Object.keys(postsData).filter(function(id) {
        return parseInt(id) !== state.postId;
      }).sort(function() { return Math.random() - 0.5; }).slice(0, 3);
  
      document.getElementById('relatedPosts').innerHTML = related.map(function(id) {
        var rp = postsData[id];
        return '<a href="blog-post.html?id=' + id + '" class="related-post-item">' +
          '<img class="related-post-thumb" src="' + rp.image + '" alt="' + rp.title + '" loading="lazy" />' +
          '<div><p class="related-post-badge">' + rp.category + '</p><p class="related-post-title">' + rp.title + '</p></div>' +
        '</a>';
      }).join('');
    }
  
    /* ── PREV / NEXT ───────────────────────────────────── */
    function renderPrevNext() {
      var ids = Object.keys(postsData).map(Number).sort(function(a,b){return a-b;});
      var idx = ids.indexOf(state.postId);
      if (idx > 0) {
        var prevId = ids[idx - 1];
        var prevLink = document.getElementById('prevPostLink');
        prevLink.href = 'blog-post.html?id=' + prevId;
        prevLink.style.display = 'flex';
        document.getElementById('prevPostTitle').textContent = postsData[prevId].title;
      }
      if (idx < ids.length - 1) {
        var nextId = ids[idx + 1];
        var nextLink = document.getElementById('nextPostLink');
        nextLink.href = 'blog-post.html?id=' + nextId;
        nextLink.style.display = 'flex';
        document.getElementById('nextPostTitle').textContent = postsData[nextId].title;
      }
    }
  
    /* ── AUTH ──────────────────────────────────────────── */
    function checkAuth() {
      var stored = sessionStorage.getItem('bp_user');
      if (stored) { state.user = JSON.parse(stored); updateAuthUI(); }
    }
  
    function updateAuthUI() {
      if (state.user) {
        document.getElementById('commentInputBox').style.display = 'flex';
        document.getElementById('commentAuthPrompt').style.display = 'none';
        var av = document.getElementById('commentAvatarDisplay');
        av.textContent = state.user.initials;
        av.style.background = state.user.color || '#3C3489';
      }
    }
  
    function openAuth() {
      document.getElementById('authModalOverlay').classList.add('open');
    }
  
    /* ── EVENTS ────────────────────────────────────────── */
    function bindEvents() {
      // Like
      document.getElementById('articleLikeBtn').addEventListener('click', toggleLike);
      document.getElementById('tocLikeBtn').addEventListener('click', toggleLike);
  
      // Share
      document.querySelectorAll('.share-social-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { doShare(btn.dataset.platform); });
      });
  
      // Auth modal
      document.getElementById('openAuthBtn').addEventListener('click', openAuth);
      document.getElementById('authModalClose').addEventListener('click', function() {
        document.getElementById('authModalOverlay').classList.remove('open');
      });
      document.getElementById('authModalOverlay').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
      });
  
      // Auth tabs
      document.querySelectorAll('.auth-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
          var t = tab.dataset.tab;
          document.querySelectorAll('.auth-tab').forEach(function(x) { x.classList.remove('active'); });
          document.querySelectorAll('.auth-panel').forEach(function(x) { x.classList.remove('active'); });
          tab.classList.add('active');
          document.getElementById('panel' + t.charAt(0).toUpperCase() + t.slice(1)).classList.add('active');
        });
      });
      document.querySelectorAll('.auth-switch-link').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var t = btn.dataset.tab;
          document.querySelectorAll('.auth-tab[data-tab="' + t + '"]').forEach(function(x) { x.click(); });
        });
      });
  
      // Sign in
      document.getElementById('signinSubmitBtn').addEventListener('click', function() {
        var email = document.getElementById('signinEmail').value.trim();
        var pw = document.getElementById('signinPassword').value;
        var err = document.getElementById('signinError');
        if (!email || !pw) { err.textContent = 'Please fill in all fields.'; return; }
        var name = email.split('@')[0];
        var initials = name.substring(0, 2).toUpperCase();
        state.user = { name: name, email: email, initials: initials, color: '#3C3489' };
        sessionStorage.setItem('bp_user', JSON.stringify(state.user));
        document.getElementById('authModalOverlay').classList.remove('open');
        updateAuthUI();
        renderComments();
        showToast('Welcome back, ' + name + '!');
      });
  
      // Sign up
      document.getElementById('signupSubmitBtn').addEventListener('click', function() {
        var fn = document.getElementById('signupFirstName').value.trim();
        var ln = document.getElementById('signupLastName').value.trim();
        var email = document.getElementById('signupEmail').value.trim();
        var pw = document.getElementById('signupPassword').value;
        var err = document.getElementById('signupError');
        if (!fn || !ln || !email || !pw) { err.textContent = 'Please fill in all fields.'; return; }
        if (pw.length < 8) { err.textContent = 'Password must be at least 8 characters.'; return; }
        var name = fn + ' ' + ln;
        var initials = (fn[0] + ln[0]).toUpperCase();
        state.user = { name: name, email: email, initials: initials, color: '#0F6E56' };
        sessionStorage.setItem('bp_user', JSON.stringify(state.user));
        document.getElementById('authModalOverlay').classList.remove('open');
        updateAuthUI();
        renderComments();
        showToast('Account created! Welcome, ' + fn + '!');
      });
  
      // Comment submit
      var ta = document.getElementById('commentTextarea');
      ta.addEventListener('input', function() {
        document.getElementById('charCount').textContent = ta.value.length + ' / 500';
        if (ta.value.length > 500) ta.value = ta.value.substring(0, 500);
      });
      document.getElementById('submitCommentBtn').addEventListener('click', function() {
        var text = ta.value.trim();
        if (!text) return;
        state.comments.unshift({
          id: 'c-' + Date.now(),
          author: state.user.name,
          initials: state.user.initials,
          color: state.user.color || '#3C3489',
          date: 'Just now',
          body: text,
          likes: 0,
          replies: []
        });
        ta.value = '';
        document.getElementById('charCount').textContent = '0 / 500';
        renderComments();
        showToast('Comment posted!');
      });
  
      // Newsletter
      document.getElementById('newsletterSubmit').addEventListener('click', function() {
        var email = document.getElementById('newsletterEmail').value.trim();
        if (!email) return;
        document.getElementById('newsletterForm').style.display = 'none';
        document.getElementById('newsletterSuccess').style.display = 'block';
      });
  
      // TOC share
      document.getElementById('tocShareBtn').addEventListener('click', function() {
        doShare('copy');
      });
    }
  
    function toggleLike() {
      state.liked = !state.liked;
      localStorage.setItem('bp_liked_' + state.postId, JSON.stringify(state.liked));
      updateLikeUI();
      showToast(state.liked ? '❤️ Thanks for the like!' : 'Like removed');
    }
  
    function doShare(platform) {
      var url = encodeURIComponent(window.location.href);
      var title = encodeURIComponent(state.post.title);
      var links = {
        facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
        twitter:  'https://twitter.com/intent/tweet?text=' + title + '&url=' + url,
        whatsapp: 'https://wa.me/?text=' + title + ' ' + url,
        linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url
      };
      if (platform === 'copy') {
        navigator.clipboard.writeText(window.location.href).then(function() {
          showToast('Link copied to clipboard!');
        });
        return;
      }
      if (links[platform]) window.open(links[platform], '_blank', 'width=600,height=400');
    }
  
    /* ── TOAST ─────────────────────────────────────────── */
    function showToast(msg) {
      var t = document.getElementById('blogToast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(function() { t.classList.remove('show'); }, 3000);
    }
  
    /* ── START ─────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', init);
  
  })();