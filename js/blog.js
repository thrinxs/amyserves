/* ══════════════════════════════════════════════════════
   BLOG.JS — AmyServes Blog
   Powered by supabaseClientClient
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── STATE ─────────────────────────────────────────── */
  var state = {
    user:          null,
    currentFilter: 'all',
    currentSort:   'newest',
    searchQuery:   '',
    posts:         [],
    filteredPosts: [],
    shareTarget:   null,
    page:          0,
    pageSize:      6,
    totalPosts:    0,
  };

  /* ── supabaseClient CHECK ────────────────────────────────── */
  function checksupabaseClient() {
    if (!supabaseClient) {
      console.error('supabaseClient client not initialized');
      return false;
    }
    return true;
  }

  /* ── TOAST ─────────────────────────────────────────── */
  var toastTimer;
  function showToast(msg) {
    var toast = document.getElementById('blogToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  }

  /* ── FETCH POSTS FROM supabaseClient ─────────────────────── */
  async function fetchPosts() {
    if (!checksupabaseClient()) return;

    try {
      var query = supabaseClient
        .from('posts')
        .select('*')
        .eq('published', true);

      /* Filter by category */
      if (state.currentFilter !== 'all') {
        query = query.eq('category', state.currentFilter);
      }

      /* Search */
      if (state.searchQuery) {
        query = query.or(
          'title.ilike.%' + state.searchQuery + '%,' +
          'excerpt.ilike.%' + state.searchQuery + '%'
        );
      }

      /* Sort */
      if (state.currentSort === 'newest') {
        query = query.order('published_at', { ascending: false });
      } else if (state.currentSort === 'oldest') {
        query = query.order('published_at', { ascending: true });
      }

      var { data, error } = await query;

      if (error) throw error;

      state.posts = data || [];

      /* Sort by likes client-side if needed */
      if (state.currentSort === 'popular') {
        await enrichPostsWithLikes();
      }

      renderPosts();

    } catch (err) {
      console.error('Error fetching posts:', err);
      showToast('Could not load posts. Please try again.');
    }
  }

  /* ── GET LIKE COUNTS ───────────────────────────────── */
  async function enrichPostsWithLikes() {
    if (!checksupabaseClient()) return;

    for (var i = 0; i < state.posts.length; i++) {
      var post = state.posts[i];
      var { count } = await supabaseClient
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', post.id)
        .eq('target_type', 'post');
      post.like_count = count || 0;
    }

    /* Sort by likes */
    state.posts.sort(function (a, b) {
      return (b.like_count || 0) - (a.like_count || 0);
    });
  }

  /* ── GET COMMENT COUNTS ────────────────────────────── */
  async function getCommentCount(postId) {
    if (!checksupabaseClient()) return 0;
    var { count } = await supabaseClient
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('deleted', false);
    return count || 0;
  }

  /* ── GET LIKE COUNT FOR POST ───────────────────────── */
  async function getLikeCount(postId) {
    if (!checksupabaseClient()) return 0;
    var { count } = await supabaseClient
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', postId)
      .eq('target_type', 'post');
    return count || 0;
  }

  /* ── CHECK IF USER LIKED POST ──────────────────────── */
  async function userLikedPost(postId) {
    if (!checksupabaseClient() || !state.user) return false;
    var { data } = await supabaseClient
      .from('likes')
      .select('id')
      .eq('target_id', postId)
      .eq('target_type', 'post')
      .eq('user_id', state.user.id)
      .single();
    return !!data;
  }

  /* ── RENDER POSTS ──────────────────────────────────── */
  async function renderPosts() {
    if (!state.posts.length) {
      showNoResults();
      return;
    }

    hideNoResults();

    var featured = state.posts.find(function (p) { return p.featured; });
    var regular  = state.posts.filter(function (p) { return !p.featured; });

    /* Render featured post */
    if (featured) {
      await renderFeaturedPost(featured);
    }

    /* Render regular posts grid */
    var grid = document.getElementById('blogGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (var i = 0; i < regular.length; i++) {
      var card = await buildRegularCard(regular[i]);
      grid.appendChild(card);
    }

    /* Hide load more if all loaded */
    var loadMoreWrap = document.getElementById('loadMoreWrap');
    if (loadMoreWrap) {
      loadMoreWrap.style.display = state.posts.length < 6 ? 'none' : 'flex';
    }
  }

  /* ── BUILD FEATURED CARD ───────────────────────────── */
  async function renderFeaturedPost(post) {
    var likeCount   = await getLikeCount(post.id);
    var commentCount = await getCommentCount(post.id);
    var liked       = await userLikedPost(post.id);

    var featured = document.getElementById('featuredPost');
    if (!featured) return;

    featured.dataset.postId   = post.id;
    featured.dataset.category = post.category;
    featured.dataset.date     = post.published_at;
    featured.dataset.likes    = likeCount;

    featured.innerHTML = `
      <div class="blog-card-image">
        <img src="${post.image_url}" alt="${escHtml(post.title)}" loading="lazy" />
        <span class="blog-card-badge ${getCategoryClass(post.category)}">${getCategoryLabel(post.category)}</span>
        <span class="blog-card-featured-label">Featured</span>
      </div>
      <div class="blog-card-body">
        <div class="blog-card-meta">
          <div class="blog-author-chip">
            <div class="blog-author-avatar" style="background:${post.author_color}">${post.author_initials}</div>
            <span>${escHtml(post.author_name)}</span>
          </div>
          <span class="blog-meta-dot">·</span>
          <time>${formatDate(post.published_at)}</time>
          <span class="blog-meta-dot">·</span>
          <span>${post.read_time}</span>
        </div>
        <h2 class="blog-card-title">
          <a href="blog-post.html?slug=${post.slug}" class="blog-post-link" data-id="${post.id}">
            ${escHtml(post.title)}
          </a>
        </h2>
        <p class="blog-card-excerpt">${escHtml(post.excerpt || '')}</p>
        <div class="blog-card-footer">
          <div class="blog-card-reactions">
            <button class="reaction-btn ${liked ? 'liked' : ''}" data-post-id="${post.id}" data-type="like" title="Like">
              <svg viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span class="reaction-count">${likeCount}</span>
            </button>
            <button class="reaction-btn comment-trigger-btn" data-post-id="${post.id}" title="Comments">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span class="reaction-count">${commentCount}</span>
            </button>
          </div>
          <div class="blog-card-share">
            <button class="share-btn" data-post-id="${post.id}" title="Share">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
          <a href="blog-post.html?slug=${post.slug}" class="blog-read-more">Read Article →</a>
        </div>
      </div>
    `;

    /* Rebind events on featured card */
    bindCardEvents(featured);
  }

  /* ── BUILD REGULAR CARD ────────────────────────────── */
  async function buildRegularCard(post) {
    var likeCount    = await getLikeCount(post.id);
    var commentCount = await getCommentCount(post.id);
    var liked        = await userLikedPost(post.id);

    var article = document.createElement('article');
    article.className = 'blog-card';
    article.dataset.postId   = post.id;
    article.dataset.category = post.category;
    article.dataset.date     = post.published_at;
    article.dataset.likes    = likeCount;

    article.innerHTML = `
      <div class="blog-card-image blog-card-image--sm">
        <img src="${post.image_url}" alt="${escHtml(post.title)}" loading="lazy" />
        <span class="blog-card-badge ${getCategoryClass(post.category)}">${getCategoryLabel(post.category)}</span>
      </div>
      <div class="blog-card-body">
        <div class="blog-card-meta">
          <div class="blog-author-chip">
            <div class="blog-author-avatar" style="background:${post.author_color}">${post.author_initials}</div>
            <span>${escHtml(post.author_name)}</span>
          </div>
          <span class="blog-meta-dot">·</span>
          <time>${formatDate(post.published_at)}</time>
          <span class="blog-meta-dot">·</span>
          <span>${post.read_time}</span>
        </div>
        <h3 class="blog-card-title">
          <a href="blog-post.html?slug=${post.slug}" class="blog-post-link" data-id="${post.id}">
            ${escHtml(post.title)}
          </a>
        </h3>
        <p class="blog-card-excerpt">${escHtml(post.excerpt || '')}</p>
        <div class="blog-card-footer">
          <div class="blog-card-reactions">
            <button class="reaction-btn ${liked ? 'liked' : ''}" data-post-id="${post.id}" data-type="like">
              <svg viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span class="reaction-count">${likeCount}</span>
            </button>
            <button class="reaction-btn comment-trigger-btn" data-post-id="${post.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span class="reaction-count">${commentCount}</span>
            </button>
          </div>
          <a href="blog-post.html?slug=${post.slug}" class="blog-read-more">Read →</a>
        </div>
      </div>
    `;

    bindCardEvents(article);
    return article;
  }

  /* ── LIKE A POST ───────────────────────────────────── */
  async function handlePostLike(btn) {
    if (!checksupabaseClient()) return;

    if (!state.user) {
      openAuthModal('signin');
      return;
    }

    var postId   = btn.dataset.postId;
    var countEl  = btn.querySelector('.reaction-count');
    var current  = parseInt(countEl.textContent) || 0;
    var isLiked  = btn.classList.contains('liked');

    if (isLiked) {
      /* Unlike */
      var { error } = await supabaseClient
        .from('likes')
        .delete()
        .eq('target_id', postId)
        .eq('target_type', 'post')
        .eq('user_id', state.user.id);

      if (!error) {
        btn.classList.remove('liked');
        btn.querySelector('svg').setAttribute('fill', 'none');
        countEl.textContent = Math.max(0, current - 1);
      }
    } else {
      /* Like */
      var { error: likeError } = await supabaseClient
        .from('likes')
        .insert({
          target_id:   postId,
          target_type: 'post',
          user_id:     state.user.id
        });

        if (!likeError) {
          btn.classList.add('liked');
          btn.querySelector('svg').setAttribute('fill', 'currentColor');
          countEl.textContent = current + 1;
          animateLike(btn);
        
          // 🔔 Trigger like notification
          var likedPost = state.posts.find(function(p) { return p.id === postId; });
          if (likedPost) {
            await notifyPostLike(state.user.id, state.user.name, likedPost.title);
          }
        }
    }
  }

  function animateLike(btn) {
    btn.style.transform = 'scale(1.25)';
    setTimeout(function () { btn.style.transform = ''; }, 200);
  }

  /* ── NEWSLETTER ────────────────────────────────────── */
  async function handleNewsletterSubmit() {
    if (!checksupabaseClient()) return;

    var emailInput = document.getElementById('newsletterEmail');
    var email = emailInput ? emailInput.value.trim() : '';

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    var { error } = await supabaseClient
      .from('newsletter_subscribers')
      .insert({ email: email });

    if (error && error.code === '23505') {
      showToast('You are already subscribed!');
      return;
    }

    if (error) {
      showToast('Something went wrong. Please try again.');
      return;
    }

    var form    = document.getElementById('newsletterForm');
    var success = document.getElementById('newsletterSuccess');
    if (form)    form.style.display = 'none';
    if (success) success.style.display = 'block';
    showToast('📧 yourfirmci@gmail.com subscribed to the AmyServes blog!');
    
    // 🔔 Trigger newsletter notification (only if user is logged in)
    if (state.user) {
      await notifyNewsletterSubscription(state.user.id, email);
    }
  }

  /* ── AUTH ──────────────────────────────────────────── */
  async function checkAuth() {
    if (!checksupabaseClient()) return;

    var { data: { session } } = await supabaseClient.auth.getSession();

    if (session && session.user) {
      var { data: profile } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      state.user = {
        id:       session.user.id,
        email:    session.user.email,
        name:     profile ? profile.full_name : session.user.email,
        initials: profile ? profile.initials  : 'U',
        color:    profile ? profile.color     : '#1A3C5E'
      };
    }

    updateAuthUI();
  }

  function updateAuthUI() {
    var commentInputBox    = document.getElementById('commentInputBox');
    var commentAuthPrompt  = document.getElementById('commentAuthPrompt');
    var commentAvatarDisplay = document.getElementById('commentAvatarDisplay');

    if (state.user) {
      if (commentInputBox)   commentInputBox.style.display = 'flex';
      if (commentAuthPrompt) commentAuthPrompt.style.display = 'none';
      if (commentAvatarDisplay) {
        commentAvatarDisplay.style.background = state.user.color;
        commentAvatarDisplay.textContent = state.user.initials;
      }
    } else {
      if (commentInputBox)   commentInputBox.style.display = 'none';
      if (commentAuthPrompt) commentAuthPrompt.style.display = 'block';
    }
  }

  function openAuthModal(tab) {
    var overlay = document.getElementById('authModalOverlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    if (tab) switchAuthTab(tab);
  }

  function closeAuthModal() {
    var overlay = document.getElementById('authModalOverlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    var signin = document.getElementById('panelSignin');
    var signup = document.getElementById('panelSignup');
    if (signin) signin.classList.toggle('active', tab === 'signin');
    if (signup) signup.classList.toggle('active', tab === 'signup');
  }

  /* Sign In */
  async function handleSignIn() {
    if (!checksupabaseClient()) return;

    var email    = (document.getElementById('signinEmail').value || '').trim();
    var password = (document.getElementById('signinPassword').value || '').trim();
    var errEl    = document.getElementById('signinError');

    if (!email || !password) {
      errEl.textContent = 'Please fill in all fields.';
      return;
    }

    var btn = document.getElementById('signinSubmitBtn');
    btn.textContent = 'Signing in…';
    btn.disabled = true;

    var { data, error } = await supabaseClient.auth.signInWithPassword({
      email:    email,
      password: password
    });

    btn.textContent = 'Sign In →';
    btn.disabled = false;

    if (error) {
      errEl.textContent = error.message;
      return;
    }

    var { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    state.user = {
      id:       data.user.id,
      email:    data.user.email,
      name:     profile ? profile.full_name : email,
      initials: profile ? profile.initials  : 'U',
      color:    profile ? profile.color     : '#1A3C5E'
    };

    closeAuthModal();
    updateAuthUI();
    showToast('✅ Signed in as ' + state.user.name);
    
    // 🔔 Trigger login notification
    await notifyLogin(data.user.id, state.user.name);
  }

  /* Sign Up */
  async function handleSignUp() {
    if (!checksupabaseClient()) return;

    var first = (document.getElementById('signupFirstName').value || '').trim();
    var last  = (document.getElementById('signupLastName').value || '').trim();
    var email = (document.getElementById('signupEmail').value || '').trim();
    var phone = (document.getElementById('signupPhone').value || '').trim();
    var pass  = (document.getElementById('signupPassword').value || '').trim();
    var conf  = (document.getElementById('signupConfirm').value || '').trim();
    var errEl = document.getElementById('signupError');

    if (!first || !last || !email || !pass || !conf) {
      errEl.textContent = 'Please fill in all required fields.';
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

    var colors   = ['#0F6E56','#3C3489','#C8941A','#1A3C5E'];
    var color    = colors[Math.floor(Math.random() * colors.length)];
    var initials = (first[0] + last[0]).toUpperCase();
    var fullName = first + ' ' + last;

    var { data, error } = await supabaseClient.auth.signUp({
      email:    email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          initials:  initials,
          color:     color,
          phone:     phone
        }
      }
    });
    
    btn.textContent = 'Create Account →';
    btn.disabled = false;
    
    if (error) {
      errEl.textContent = error.message;
      return;
    }
    
    /* Create profile in profiles table */
    var { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id:        data.user.id,
        full_name: fullName,
        initials:  initials,
        color:     color,
        phone:     phone,
        role:      'client'
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
    }
    
    state.user = {
      id:       data.user.id,
      email:    email,
      name:     fullName,
      initials: initials,
      color:    color
    };


    closeAuthModal();
updateAuthUI();
showToast('🎉 Welcome, ' + first + '! Account created.');

// 🔔 Trigger signup notification
await notifySignup(data.user.id, fullName, email);
  }

  /* ── FILTER & SEARCH ───────────────────────────────── */
  var searchTimeout;
  function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      fetchPosts();
    }, 350);
  }

  /* ── SHARE ─────────────────────────────────────────── */
  function sharePost(postId, platform) {
    var post = state.posts.find(function (p) { return p.id === postId; });
    if (!post) return;

    var url   = window.location.origin + '/blog-post.html?slug=' + post.slug;
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
        window.open('https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(url), '_blank', 'width=600,height=500');
        break;
      case 'copy':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () {
            showToast('🔗 Link copied to clipboard!');
          });
        }
        break;
    }
  }

  function showSharePopover(btn, postId) {
    var popover = document.getElementById('sharePopover');
    if (!popover) return;
    state.shareTarget = postId;
    popover.style.display = 'block';
    var rect = btn.getBoundingClientRect();
    var top  = rect.bottom + window.scrollY + 8;
    var left = rect.left + window.scrollX;
    var pw   = 220;
    if (left + pw > window.innerWidth - 16) left = window.innerWidth - pw - 16;
    popover.style.top  = top + 'px';
    popover.style.left = left + 'px';
  }

  function hideSharePopover() {
    var popover = document.getElementById('sharePopover');
    if (popover) popover.style.display = 'none';
    state.shareTarget = null;
  }

  /* ── HELPERS ───────────────────────────────────────── */
  function getCategoryClass(category) {
    var map = {
      hr:         'blog-card-badge--purple',
      cleaning:   'blog-card-badge--teal',
      business:   'blog-card-badge--gold',
      compliance: 'blog-card-badge--navy'
    };
    return map[category] || 'blog-card-badge--navy';
  }

  function getCategoryLabel(category) {
    var map = {
      hr:         'HR & People',
      cleaning:   'Cleaning',
      business:   'Business Growth',
      compliance: 'Compliance'
    };
    return map[category] || category;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day:   'numeric',
      month: 'short',
      year:  'numeric'
    });
  }

  function escHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showNoResults() {
    var el = document.getElementById('blogNoResults');
    if (el) el.style.display = 'block';
    var grid = document.getElementById('blogGrid');
    if (grid) grid.innerHTML = '';
  }

  function hideNoResults() {
    var el = document.getElementById('blogNoResults');
    if (el) el.style.display = 'none';
  }

  /* ── BIND CARD EVENTS ──────────────────────────────── */
  function bindCardEvents(card) {
    /* Like button */
    card.querySelectorAll('.reaction-btn[data-type="like"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        handlePostLike(btn);
      });
    });

    /* Share button */
    card.querySelectorAll('.share-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        showSharePopover(btn, btn.dataset.postId);
      });
    });
  }

  /* ── NO RESULTS RESET ──────────────────────────────── */
  window.resetFilters = function () {
    state.currentFilter = 'all';
    state.searchQuery   = '';
    var searchInput = document.getElementById('blogSearch');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.filter === 'all');
    });
    fetchPosts();
  };

  /* ── INIT ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', async function () {

    await checkAuth();
    await fetchPosts();

    /* Filter buttons */
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        state.currentFilter = btn.dataset.filter;
        fetchPosts();
      });
    });

    /* Sidebar category buttons */
    document.querySelectorAll('.sidebar-cat-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.currentFilter = btn.dataset.filter;
        document.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.toggle('active', b.dataset.filter === state.currentFilter);
        });
        fetchPosts();
        var col = document.querySelector('.blog-posts-col');
        if (col) col.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* Sort */
    var sortSelect = document.getElementById('blogSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.currentSort = sortSelect.value;
        fetchPosts();
      });
    }

    /* Search */
    var searchInput = document.getElementById('blogSearch');
    var searchClear = document.getElementById('searchClear');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.searchQuery = searchInput.value;
        if (searchClear) {
          searchClear.style.display = state.searchQuery ? 'block' : 'none';
        }
        handleSearch();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', function () {
        if (searchInput) searchInput.value = '';
        state.searchQuery = '';
        searchClear.style.display = 'none';
        fetchPosts();
      });
    }

    /* Share popover buttons */
    var sharePopover = document.getElementById('sharePopover');
    if (sharePopover) {
      sharePopover.addEventListener('click', function (e) {
        var btn = e.target.closest('.share-pop-btn');
        if (btn && state.shareTarget) {
          sharePost(state.shareTarget, btn.dataset.platform);
          hideSharePopover();
        }
      });
    }

    /* Close popover on outside click */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.share-btn') && !e.target.closest('#sharePopover')) {
        hideSharePopover();
      }
    });

    /* Auth modal close */
    var authClose = document.getElementById('authModalClose');
    if (authClose) authClose.addEventListener('click', closeAuthModal);

    var authOverlay = document.getElementById('authModalOverlay');
    if (authOverlay) {
      authOverlay.addEventListener('click', function (e) {
        if (e.target === this) closeAuthModal();
      });
    }

    /* Auth tabs */
    document.querySelectorAll('.auth-tab, .auth-switch-link').forEach(function (el) {
      el.addEventListener('click', function () {
        if (this.dataset.tab) switchAuthTab(this.dataset.tab);
      });
    });

    /* Sign in */
    var signinBtn = document.getElementById('signinSubmitBtn');
    if (signinBtn) signinBtn.addEventListener('click', handleSignIn);

    var signinPass = document.getElementById('signinPassword');
    if (signinPass) {
      signinPass.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleSignIn();
      });
    }

    /* Sign up */
    var signupBtn = document.getElementById('signupSubmitBtn');
    if (signupBtn) signupBtn.addEventListener('click', handleSignUp);

    /* Auth from comment prompt */
    var openAuthFromComment = document.getElementById('openAuthFromComment');
    if (openAuthFromComment) {
      openAuthFromComment.addEventListener('click', function () {
        openAuthModal('signin');
      });
    }

    /* Newsletter */
    var newsletterSubmit = document.getElementById('newsletterSubmit');
    if (newsletterSubmit) {
      newsletterSubmit.addEventListener('click', handleNewsletterSubmit);
      var newsletterInput = document.getElementById('newsletterEmail');
      if (newsletterInput) {
        newsletterInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') handleNewsletterSubmit();
        });
      }
    }

    /* Load more */
    var loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function () {
        loadMoreBtn.textContent = 'No more articles yet — check back soon!';
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.opacity = '0.5';
      });
    }

    /* Escape key */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAuthModal();
        hideSharePopover();
      }
    });
  });

})();
