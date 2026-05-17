/* ══════════════════════════════════════════════════════
   BLOG-POST.JS — AmyServes Single Article Page
   Powered by supabaseClient
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── STATE ─────────────────────────────────────────── */
  var state = {
    postId:        null,
    post:          null,
    user:          null,
    comments:      [],
    likedComments: {},
    likedReplies:  {}
  };

  /* ── SUPABASE CHECK ──────────────────────────────────── */
  function checksupabaseClient() {
    if (!supabaseClient) {
      console.error('supabaseClient not initialized');
      return false;
    }
    return true;
  }

  /* ── TOAST ─────────────────────────────────────────── */
  var toastTimer;
  function showToast(msg) {
    var t = document.getElementById('blogToast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove('show');
    }, 3000);
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
      cleaning:   'Cleaning & Hygiene',
      business:   'Business Growth',
      compliance: 'Compliance & Legal'
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

  /* ── CHECK USER LIKED (missing function — now added) ── */
  async function checkUserLiked(targetId, targetType) {
    if (!checksupabaseClient() || !state.user) return false;
    var { data } = await supabaseClient
      .from('likes')
      .select('id')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .eq('user_id', state.user.id)
      .single();
    return !!data;
  }

  /* ── INIT ──────────────────────────────────────────── */
  async function init() {
    if (!checksupabaseClient()) return;

    var params  = new URLSearchParams(window.location.search);
    var slug    = params.get('slug');
    var idParam = params.get('id');

    if (!slug && !idParam) { showNotFound(); return; }

    var query = supabaseClient
      .from('posts')
      .select('*')
      .eq('published', true);

    if (slug) query = query.eq('slug', slug);
    else      query = query.eq('id', idParam);

    var { data, error } = await query.single();

    if (error || !data) { showNotFound(); return; }

    state.post   = data;
    state.postId = data.id;

    await checkAuth();
    await renderPost();
    await loadReactions();
    renderTOC();
    setTimeout(renderTOC, 50);
    setupTOCScroll();
    await renderComments();
    renderRelated();
    renderPrevNext();
    bindEvents();
    setupReadingProgress();
  }

  /* ── SHOW NOT FOUND ────────────────────────────────── */
  function showNotFound() {
    document.title = 'Post Not Found — AmyServes';
    var content = document.getElementById('postContent');
    if (content) {
      content.innerHTML = '<p>Article not found. <a href="../blog.html">Back to Blog →</a></p>';
    }
  }

  /* ── RENDER POST ───────────────────────────────────── */
  async function renderPost() {
    var p = state.post;

    document.title = p.title + ' — AmyServes Blog';
    var metaDesc = document.getElementById('metaDescription');
    if (metaDesc) metaDesc.content = p.excerpt || p.title;

    var img = document.getElementById('postHeroImage');
    if (img) { img.src = p.image_url; img.alt = p.title; }

    var badge = document.getElementById('postBadge');
    if (badge) {
      badge.textContent = getCategoryLabel(p.category);
      badge.className   = 'blog-card-badge ' + getCategoryClass(p.category);
    }

    var featuredTag = document.getElementById('postFeaturedTag');
    if (featuredTag) featuredTag.style.display = p.featured ? 'inline-block' : 'none';

    var titleEl = document.getElementById('postTitle');
    if (titleEl) titleEl.textContent = p.title;

    var authorAvatar = document.getElementById('postAuthorAvatar');
    if (authorAvatar) {
      authorAvatar.textContent      = p.author_initials;
      authorAvatar.style.background = p.author_color;
    }

    var authorName = document.getElementById('postAuthorName');
    if (authorName) authorName.textContent = p.author_name;

    var dateEl = document.getElementById('postDate');
    if (dateEl) dateEl.textContent = formatDate(p.published_at);

    var readTimeEl = document.getElementById('postReadTime');
    if (readTimeEl) readTimeEl.textContent = p.read_time;

    var likeSummary = document.getElementById('postLikeCount');
    if (likeSummary) likeSummary.textContent = '0 reactions';

    var contentEl = document.getElementById('postContent');
    if (contentEl) contentEl.innerHTML = p.content;

    var tagsEl = document.getElementById('postTags');
    if (tagsEl) {
      tagsEl.innerHTML = (p.tags || []).map(function (t) {
        return '<span class="post-tag">' + escHtml(t) + '</span>';
      }).join('');
    }

    var cardAvatar = document.getElementById('authorCardAvatar');
    if (cardAvatar) {
      cardAvatar.textContent      = p.author_initials;
      cardAvatar.style.background = p.author_color;
    }

    var cardName = document.getElementById('authorCardName');
    if (cardName) cardName.textContent = p.author_name;
  }

  /* ── LIKE COUNT ────────────────────────────────────── */
  async function getLikeCount(targetId, targetType) {
    if (!checksupabaseClient()) return 0;
    var { count } = await supabaseClient
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', targetId)
      .eq('target_type', targetType);
    return count || 0;
  }

  /* ── EMOJI REACTIONS ───────────────────────────────── */
  async function loadReactions() {
    if (!checksupabaseClient()) return;

    var reactions      = ['love', 'applaud', 'like', 'shock', 'flower', 'congrats'];
    var totalReactions = 0;

    for (var i = 0; i < reactions.length; i++) {
      var type = reactions[i];

      var { count } = await supabaseClient
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('target_id', state.postId)
        .eq('target_type', 'post')
        .eq('reaction_type', type);

      var countVal = count || 0;
      totalReactions += countVal;

      var countEl = document.getElementById('reaction-' + type);
      if (countEl) countEl.textContent = countVal;

      if (state.user) {
        var { data } = await supabaseClient
          .from('likes')
          .select('id')
          .eq('target_id', state.postId)
          .eq('target_type', 'post')
          .eq('reaction_type', type)
          .eq('user_id', state.user.id)
          .single();

        if (data) {
          var btn = document.querySelector('.emoji-reaction-btn[data-reaction="' + type + '"]');
          if (btn) btn.classList.add('reacted');
        }
      }
    }

    var tocLabel = document.getElementById('tocLikeCountLabel');
    if (tocLabel) tocLabel.textContent = totalReactions + ' reactions';

    var likeSummary = document.getElementById('postLikeCount');
    if (likeSummary) likeSummary.textContent = totalReactions + ' reactions';
  }

  async function handleEmojiReaction(btn) {
    if (!checksupabaseClient()) return;
    if (!state.user) { openAuth(); return; }

    var reactionType = btn.dataset.reaction;

    var { data: existingReaction } = await supabaseClient
      .from('likes')
      .select('id, reaction_type')
      .eq('target_id', state.postId)
      .eq('target_type', 'post')
      .eq('user_id', state.user.id)
      .single();

    if (existingReaction) {
      var oldType = existingReaction.reaction_type;

      if (oldType === reactionType) {
        await supabaseClient.from('likes').delete().eq('id', existingReaction.id);
        btn.classList.remove('reacted');
        var countEl = document.getElementById('reaction-' + reactionType);
        if (countEl) countEl.textContent = Math.max(0, (parseInt(countEl.textContent) || 0) - 1);
        updateTotalReactions();
        showToast('Reaction removed');
        return;
      }

      await supabaseClient.from('likes').delete().eq('id', existingReaction.id);
      var oldBtn = document.querySelector('.emoji-reaction-btn[data-reaction="' + oldType + '"]');
      if (oldBtn) oldBtn.classList.remove('reacted');
      var oldCountEl = document.getElementById('reaction-' + oldType);
      if (oldCountEl) oldCountEl.textContent = Math.max(0, (parseInt(oldCountEl.textContent) || 0) - 1);
    }

    var { error } = await supabaseClient
      .from('likes')
      .insert({
        target_id:     state.postId,
        target_type:   'post',
        reaction_type: reactionType,
        user_id:       state.user.id
      });

    if (!error) {
      btn.classList.add('reacted');
      var newCountEl = document.getElementById('reaction-' + reactionType);
      if (newCountEl) newCountEl.textContent = (parseInt(newCountEl.textContent) || 0) + 1;

      var icon = btn.querySelector('.emoji-icon');
      if (icon) {
        icon.style.transform = 'scale(1.4)';
        setTimeout(function () { icon.style.transform = ''; }, 300);
      }

      updateTotalReactions();
      showToast(getReactionToast(reactionType));

      // 🔔 Trigger reaction notification
      if (typeof notifyPostLike === 'function') {
        await notifyPostLike(state.user.id, state.user.name, state.post.title);
      }
    }
  }

  /* ── COMMENT EMOJI REACTIONS ───────────────────────── */
  async function handleCommentEmojiReaction(btn) {
    if (!checksupabaseClient()) return;
    if (!state.user) { openAuth(); return; }

    var targetId     = btn.dataset.id;
    var targetType   = btn.dataset.type;
    var reactionType = btn.dataset.reaction;

    var { data: existing } = await supabaseClient
      .from('likes')
      .select('id, reaction_type')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .eq('user_id', state.user.id)
      .single();

    if (existing) {
      var oldType = existing.reaction_type;

      if (oldType === reactionType) {
        await supabaseClient.from('likes').delete().eq('id', existing.id);
        btn.classList.remove('reacted');
        var countEl = document.getElementById('cer-' + reactionType + '-' + targetId);
        if (countEl) countEl.textContent = Math.max(0, (parseInt(countEl.textContent) || 0) - 1);
        return;
      }

      await supabaseClient.from('likes').delete().eq('id', existing.id);
      var oldBtn = btn.closest('.comment-emoji-reactions')
        .querySelector('[data-reaction="' + oldType + '"]');
      if (oldBtn) oldBtn.classList.remove('reacted');
      var oldCount = document.getElementById('cer-' + oldType + '-' + targetId);
      if (oldCount) oldCount.textContent = Math.max(0, (parseInt(oldCount.textContent) || 0) - 1);
    }

    var { error } = await supabaseClient
      .from('likes')
      .insert({
        target_id:     targetId,
        target_type:   targetType,
        reaction_type: reactionType,
        user_id:       state.user.id
      });

    if (!error) {
      btn.classList.add('reacted');
      var newCount = document.getElementById('cer-' + reactionType + '-' + targetId);
      if (newCount) newCount.textContent = (parseInt(newCount.textContent) || 0) + 1;
    }
  }

  function updateTotalReactions() {
    var total = 0;
    document.querySelectorAll('.emoji-count').forEach(function (el) {
      total += parseInt(el.textContent) || 0;
    });
    var tocLabel = document.getElementById('tocLikeCountLabel');
    if (tocLabel) tocLabel.textContent = total + ' reactions';
    var likeSummary = document.getElementById('postLikeCount');
    if (likeSummary) likeSummary.textContent = total + ' reactions';
  }

  function getReactionToast(type) {
    var messages = {
      love:     '❤️ You loved this article!',
      applaud:  '👏 Great read, right?',
      like:     '👍 Thanks for the like!',
      shock:    '😮 Mind blown!',
      flower:   '🌸 Beautiful, isn\'t it?',
      congrats: '🎉 Congrats sent!'
    };
    return messages[type] || '✅ Reaction added!';
  }

  /* ── TOC ───────────────────────────────────────────── */
  function renderTOC() {
    var contentEl = document.getElementById('postContent');
    var tocEl     = document.getElementById('postToc');
    var tocCol    = document.getElementById('postTocCol');

    if (!contentEl || !tocEl) return;

    tocEl.innerHTML = '';

    var headings = contentEl.querySelectorAll('h2, h3');

    if (!headings.length) {
      if (tocCol) tocCol.style.display = 'none';
      return;
    }

    if (tocCol) tocCol.style.display = '';

    headings.forEach(function (h, i) {
      var id = h.id || ('heading-' + i);
      h.id = id;

      var a = document.createElement('a');
      a.href        = '#' + id;
      a.textContent = h.textContent;

      if (h.tagName === 'H3') a.style.paddingLeft = '20px';

      tocEl.appendChild(a);
    });
  }

  function setupTOCScroll() {
    var links    = document.querySelectorAll('.post-toc a');
    var headings = Array.from(
      document.getElementById('postContent').querySelectorAll('h2, h3')
    );
    if (!headings.length) return;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY + 120;
      var current = headings[0].id;
      headings.forEach(function (h) {
        if (h.offsetTop <= scrollY) current = h.id;
      });
      links.forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + current);
      });
    }, { passive: true });
  }

  /* ── READING PROGRESS ──────────────────────────────── */
  function setupReadingProgress() {
    var bar = document.getElementById('readingProgress');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var el = document.getElementById('postArticle');
      if (!el) return;
      var rect   = el.getBoundingClientRect();
      var total  = el.offsetHeight - window.innerHeight;
      var scrolled = -rect.top;
      var pct    = Math.min(100, Math.max(0, (scrolled / total) * 100));
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── COMMENTS ──────────────────────────────────────── */
  async function renderComments() {
    if (!checksupabaseClient()) return;

    var { data: comments, error } = await supabaseClient
      .from('comments')
      .select('*, replies (*)')
      .eq('post_id', state.postId)
      .eq('deleted', false)
      .order('created_at', { ascending: true });

    if (error) { console.error('Error fetching comments:', error); return; }

    state.comments = comments || [];

    var total = state.comments.reduce(function (acc, c) {
      var activeReplies = (c.replies || []).filter(function (r) { return !r.deleted; });
      return acc + 1 + activeReplies.length;
    }, 0);

    var badge = document.getElementById('commentsBadge');
    if (badge) badge.textContent = total;

    if (state.user) {
      for (var i = 0; i < state.comments.length; i++) {
        var c = state.comments[i];
        state.likedComments[c.id] = await checkUserLiked(c.id, 'comment');
        var replies = (c.replies || []).filter(function (r) { return !r.deleted; });
        for (var j = 0; j < replies.length; j++) {
          state.likedReplies[replies[j].id] = await checkUserLiked(replies[j].id, 'reply');
        }
      }
    }

    var listEl = document.getElementById('commentsList');
    if (!listEl) return;

    if (!state.comments.length) {
      listEl.innerHTML = '<p style="font-size:0.9rem;color:var(--warm-grey);padding:16px 0;">Be the first to comment on this article.</p>';
      return;
    }

    listEl.innerHTML = state.comments.map(function (c) {
      return buildCommentHTML(c);
    }).join('');

    bindCommentEvents();
  }

  /* ── BUILD COMMENT HTML ────────────────────────────── */
  function buildCommentHTML(c) {
    var activeReplies = (c.replies || []).filter(function (r) { return !r.deleted; });

    var repliesHTML = activeReplies.length
      ? '<div class="replies-list">' +
          activeReplies.map(function (r) { return buildReplyHTML(r); }).join('') +
        '</div>'
      : '';

    var canDelete = state.user && (
      state.user.id === c.user_id || state.user.role === 'admin'
    );

    return '<div class="comment-item" data-id="' + c.id + '">' +
      '<div class="comment-avatar" style="background:' + c.author_color + '">' + c.author_initials + '</div>' +
      '<div class="comment-body-wrap">' +
        '<div class="comment-header">' +
          '<span class="comment-author">' + escHtml(c.author_name) + '</span>' +
          '<span class="comment-date">' + formatDate(c.created_at) + '</span>' +
          (canDelete ? '<button class="comment-action-btn comment-delete-btn" data-id="' + c.id + '" data-type="comment" style="margin-left:auto;color:#dc3246;">Delete</button>' : '') +
        '</div>' +
        '<p class="comment-body">' + escHtml(c.body) + '</p>' +
        '<div class="comment-actions">' +
          '<div class="comment-emoji-reactions">' +
            '<button class="comment-emoji-btn" data-id="' + c.id + '" data-type="comment" data-reaction="love"><span>❤️</span><span class="cer-count" id="cer-love-' + c.id + '">0</span></button>' +
            '<button class="comment-emoji-btn" data-id="' + c.id + '" data-type="comment" data-reaction="applaud"><span>👏</span><span class="cer-count" id="cer-applaud-' + c.id + '">0</span></button>' +
            '<button class="comment-emoji-btn" data-id="' + c.id + '" data-type="comment" data-reaction="like"><span>👍</span><span class="cer-count" id="cer-like-' + c.id + '">0</span></button>' +
          '</div>' +
          '<button class="comment-action-btn comment-reply-btn" data-id="' + c.id + '">Reply</button>' +
        '</div>' +
        '<div class="reply-input-area" id="reply-area-' + c.id + '" style="display:none;margin-top:12px;"></div>' +
        repliesHTML +
      '</div>' +
    '</div>';
  }

  /* ── BUILD REPLY HTML ──────────────────────────────── */
  function buildReplyHTML(r) {
    var canDelete = state.user && (
      state.user.id === r.user_id || state.user.role === 'admin'
    );

    return '<div class="reply-item" data-id="' + r.id + '">' +
      '<div class="reply-avatar" style="background:' + r.author_color + '">' + r.author_initials + '</div>' +
      '<div>' +
        '<div style="display:flex;gap:10px;align-items:center">' +
          '<span class="reply-author">' + escHtml(r.author_name) + '</span>' +
          '<span class="reply-date">' + formatDate(r.created_at) + '</span>' +
          (canDelete ? '<button class="comment-action-btn comment-delete-btn" data-id="' + r.id + '" data-type="reply" style="margin-left:auto;color:#dc3246;">Delete</button>' : '') +
        '</div>' +
        '<p class="reply-body">' + escHtml(r.body) + '</p>' +
        '<div class="comment-actions">' +
          '<div class="comment-emoji-reactions">' +
            '<button class="comment-emoji-btn" data-id="' + r.id + '" data-type="reply" data-reaction="love"><span>❤️</span><span class="cer-count" id="cer-love-' + r.id + '">0</span></button>' +
            '<button class="comment-emoji-btn" data-id="' + r.id + '" data-type="reply" data-reaction="applaud"><span>👏</span><span class="cer-count" id="cer-applaud-' + r.id + '">0</span></button>' +
            '<button class="comment-emoji-btn" data-id="' + r.id + '" data-type="reply" data-reaction="like"><span>👍</span><span class="cer-count" id="cer-like-' + r.id + '">0</span></button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── LOAD COMMENT LIKE COUNTS ──────────────────────── */
  async function loadCommentLikeCounts() {
    var reactions = ['love', 'applaud', 'like'];

    for (var i = 0; i < state.comments.length; i++) {
      var c = state.comments[i];

      for (var r = 0; r < reactions.length; r++) {
        var type = reactions[r];

        var { count } = await supabaseClient
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', c.id)
          .eq('target_type', 'comment')
          .eq('reaction_type', type);

        var el = document.getElementById('cer-' + type + '-' + c.id);
        if (el) el.textContent = count || 0;

        if (state.user) {
          var { data } = await supabaseClient
            .from('likes')
            .select('id')
            .eq('target_id', c.id)
            .eq('target_type', 'comment')
            .eq('reaction_type', type)
            .eq('user_id', state.user.id)
            .single();

          if (data) {
            var btn = document.querySelector('.comment-emoji-btn[data-id="' + c.id + '"][data-reaction="' + type + '"]');
            if (btn) btn.classList.add('reacted');
          }
        }
      }

      var activeReplies = (c.replies || []).filter(function (rep) { return !rep.deleted; });
      for (var j = 0; j < activeReplies.length; j++) {
        var reply = activeReplies[j];

        for (var r2 = 0; r2 < reactions.length; r2++) {
          var rType = reactions[r2];

          var { count: rCount } = await supabaseClient
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('target_id', reply.id)
            .eq('target_type', 'reply')
            .eq('reaction_type', rType);

          var rEl = document.getElementById('cer-' + rType + '-' + reply.id);
          if (rEl) rEl.textContent = rCount || 0;

          if (state.user) {
            var { data: rData } = await supabaseClient
              .from('likes')
              .select('id')
              .eq('target_id', reply.id)
              .eq('target_type', 'reply')
              .eq('reaction_type', rType)
              .eq('user_id', state.user.id)
              .single();

            if (rData) {
              var rBtn = document.querySelector('.comment-emoji-btn[data-id="' + reply.id + '"][data-reaction="' + rType + '"]');
              if (rBtn) rBtn.classList.add('reacted');
            }
          }
        }
      }
    }
  }

  /* ── BIND COMMENT EVENTS ───────────────────────────── */
  function bindCommentEvents() {
    document.querySelectorAll('.comment-emoji-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { handleCommentEmojiReaction(btn); });
    });

    document.querySelectorAll('.comment-reply-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { openReplyBox(btn.dataset.id); });
    });

    document.querySelectorAll('.comment-delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { handleDelete(btn.dataset.id, btn.dataset.type); });
    });

    loadCommentLikeCounts();
  }

  /* ── OPEN REPLY BOX ────────────────────────────────── */
  function openReplyBox(commentId) {
    if (!state.user) { openAuth(); return; }

    var area = document.getElementById('reply-area-' + commentId);
    if (!area) return;

    if (area.innerHTML) {
      area.innerHTML    = '';
      area.style.display = 'none';
      return;
    }

    area.style.display = 'block';
    area.innerHTML =
      '<div style="display:flex;gap:10px">' +
        '<div class="reply-avatar" style="background:' + (state.user.color || '#3C3489') + '">' + state.user.initials + '</div>' +
        '<div style="flex:1">' +
          '<textarea id="reply-input-' + commentId + '" style="width:100%;padding:8px 12px;border:1.5px solid var(--border);border-radius:6px;font-family:inherit;font-size:.85rem;resize:vertical;" rows="2" placeholder="Write a reply…"></textarea>' +
          '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px">' +
            '<button class="btn btn-sm" style="background:#f5f3f0;border:1.5px solid #e8e4de;color:var(--navy)" onclick="closeReplyBox(\'' + commentId + '\')">Cancel</button>' +
            '<button class="btn btn-primary btn-sm" onclick="submitReply(\'' + commentId + '\')">Post Reply</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    setTimeout(function () {
      var ta = document.getElementById('reply-input-' + commentId);
      if (ta) ta.focus();
    }, 50);
  }

  /* ── CLOSE REPLY BOX ───────────────────────────────── */
  window.closeReplyBox = function (commentId) {
    var area = document.getElementById('reply-area-' + commentId);
    if (area) {
      area.innerHTML     = '';
      area.style.display = 'none';
    }
  };

  /* ── SUBMIT COMMENT ────────────────────────────────── */
  async function submitComment() {
    if (!checksupabaseClient() || !state.user) return;

    var textarea = document.getElementById('commentTextarea');
    var body     = textarea ? textarea.value.trim() : '';

    if (!body) { showToast('Please write a comment first.'); return; }
    if (body.length > 500) { showToast('Comment must be under 500 characters.'); return; }

    var btn = document.getElementById('submitCommentBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Posting…'; }

    var { error } = await supabaseClient
      .from('comments')
      .insert({
        post_id:         state.postId,
        user_id:         state.user.id,
        body:            body,
        author_name:     state.user.name,
        author_initials: state.user.initials,
        author_color:    state.user.color,
        deleted:         false
      });

    if (btn) { btn.disabled = false; btn.textContent = 'Post Comment'; }

    if (error) {
      console.error('Submit comment error:', error);
      showToast('Failed to post comment. Please try again.');
      return;
    }

    if (textarea) textarea.value = '';
    var charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0 / 500';

    showToast('✅ Comment posted!');

    /* 🔔 Trigger comment notification */
    if (typeof notifyComment === 'function') {
      await notifyComment(state.user.id, state.user.name, state.post.title);
    }

    await renderComments();
  }

  /* ── SUBMIT REPLY ──────────────────────────────────── */
  window.submitReply = async function (commentId) {
    if (!checksupabaseClient() || !state.user) return;

    var textarea = document.getElementById('reply-input-' + commentId);
    var body     = textarea ? textarea.value.trim() : '';

    if (!body) { showToast('Please write a reply first.'); return; }
    if (body.length > 500) { showToast('Reply must be under 500 characters.'); return; }

    var { error } = await supabaseClient
      .from('replies')
      .insert({
        comment_id:      commentId,
        user_id:         state.user.id,
        body:            body,
        author_name:     state.user.name,
        author_initials: state.user.initials,
        author_color:    state.user.color,
        deleted:         false
      });

    if (error) {
      console.error('Submit reply error:', error);
      showToast('Failed to post reply. Please try again.');
      return;
    }

    window.closeReplyBox(commentId);
    showToast('✅ Reply posted!');
    await renderComments();
  };

  /* ── HANDLE DELETE ─────────────────────────────────── */
  window.handleDelete = async function (id, type) {
    if (!checksupabaseClient() || !state.user) return;
    if (!confirm('Are you sure you want to delete this ' + type + '?')) return;

    var table      = type === 'reply' ? 'replies' : 'comments';
    var { error }  = await supabaseClient
      .from(table)
      .update({ deleted: true })
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      showToast('Failed to delete. Please try again.');
      return;
    }

    showToast('Deleted successfully.');
    await renderComments();
  };

  /* ── RENDER RELATED POSTS ──────────────────────────── */
  async function renderRelated() {
    if (!checksupabaseClient() || !state.post) return;

    var container = document.getElementById('relatedPosts');
    if (!container) return;

    var { data, error } = await supabaseClient
      .from('posts')
      .select('id, title, slug, image_url, category, read_time, published_at')
      .eq('published', true)
      .eq('category', state.post.category)
      .neq('id', state.postId)
      .order('published_at', { ascending: false })
      .limit(3);

    if (error || !data || !data.length) {
      container.innerHTML = '<p style="font-size:.875rem;color:var(--warm-grey)">No related articles yet.</p>';
      return;
    }

    container.innerHTML = data.map(function (p) {
      return '<a href="blog-post.html?slug=' + p.slug + '" class="related-post-item">' +
        '<div class="related-post-img">' +
          '<img src="' + p.image_url + '" alt="' + escHtml(p.title) + '" loading="lazy" />' +
        '</div>' +
        '<div class="related-post-info">' +
          '<p class="related-post-title">' + escHtml(p.title) + '</p>' +
          '<span class="related-post-meta">' + formatDate(p.published_at) + ' · ' + p.read_time + '</span>' +
        '</div>' +
      '</a>';
    }).join('');
  }

  /* ── RENDER PREV / NEXT ────────────────────────────── */
  async function renderPrevNext() {
    if (!checksupabaseClient() || !state.post) return;

    /* Previous post */
    var { data: prevData } = await supabaseClient
      .from('posts')
      .select('id, title, slug')
      .eq('published', true)
      .lt('published_at', state.post.published_at)
      .order('published_at', { ascending: false })
      .limit(1)
      .single();

    if (prevData) {
      var prevLink  = document.getElementById('prevPostLink');
      var prevTitle = document.getElementById('prevPostTitle');
      if (prevLink)  { prevLink.href = 'blog-post.html?slug=' + prevData.slug; prevLink.style.display = ''; }
      if (prevTitle) prevTitle.textContent = prevData.title;
    }

    /* Next post */
    var { data: nextData } = await supabaseClient
      .from('posts')
      .select('id, title, slug')
      .eq('published', true)
      .gt('published_at', state.post.published_at)
      .order('published_at', { ascending: true })
      .limit(1)
      .single();

    if (nextData) {
      var nextLink  = document.getElementById('nextPostLink');
      var nextTitle = document.getElementById('nextPostTitle');
      if (nextLink)  { nextLink.href = 'blog-post.html?slug=' + nextData.slug; nextLink.style.display = ''; }
      if (nextTitle) nextTitle.textContent = nextData.title;
    }
  }

  /* ── CHECK AUTH ────────────────────────────────────── */
  async function checkAuth() {
    if (!checksupabaseClient()) return;

    var { data: { session } } = await supabaseClient.auth.getSession();

    if (!session || !session.user) {
      updateCommentUI(false);
      return;
    }

    var { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    state.user = {
      id:       session.user.id,
      email:    session.user.email,
      name:     (profile && profile.full_name) || session.user.email.split('@')[0],
      initials: (profile && profile.initials)  || 'U',
      color:    (profile && profile.color)     || '#1A3C5E',
      role:     (profile && profile.role)      || 'client'
    };

    updateCommentUI(true);
  }

  /* ── UPDATE COMMENT UI ─────────────────────────────── */
  function updateCommentUI(isLoggedIn) {
    var commentInputBox   = document.getElementById('commentInputBox');
    var commentAuthPrompt = document.getElementById('commentAuthPrompt');
    var avatarDisplay     = document.getElementById('commentAvatarDisplay');

    if (isLoggedIn && state.user) {
      if (commentInputBox)   commentInputBox.style.display   = 'flex';
      if (commentAuthPrompt) commentAuthPrompt.style.display = 'none';
      if (avatarDisplay) {
        avatarDisplay.textContent      = state.user.initials;
        avatarDisplay.style.background = state.user.color;
      }
    } else {
      if (commentInputBox)   commentInputBox.style.display   = 'none';
      if (commentAuthPrompt) commentAuthPrompt.style.display = 'block';
    }
  }

  /* ── OPEN AUTH ─────────────────────────────────────── */
  function openAuth() {
    var prompt = document.getElementById('commentAuthPrompt');
    if (prompt) {
      prompt.style.display = 'block';
      prompt.scrollIntoView({ behavior: 'smooth', block: 'center' });
      prompt.style.outline = '2px solid var(--gold)';
      setTimeout(function () { prompt.style.outline = ''; }, 2000);
    }
  }

  /* ── SHARE POST ────────────────────────────────────── */
  function sharePost(platform) {
    if (!state.post) return;

    var url  = window.location.origin + '/blog-post.html?slug=' + state.post.slug;
    var text = 'Check out this article from AmyServes: ' + state.post.title;

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
        window.open('https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(state.post.title), '_blank', 'width=600,height=500');
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

  /* ── NEWSLETTER ────────────────────────────────────── */
  async function handleNewsletterSubmit() {
    if (!checksupabaseClient()) return;

    var input = document.getElementById('newsletterEmail');
    var email = input ? input.value.trim() : '';

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
    if (form)    form.style.display    = 'none';
    if (success) success.style.display = 'block';

    showToast('📧 yourfirmci@gmail.com subscribed to the AmyServes blog!');

    if (state.user && typeof notifyNewsletterSubscription === 'function') {
      await notifyNewsletterSubscription(state.user.id, email);
    }
  }

  /* ── BIND EVENTS ───────────────────────────────────── */
  function bindEvents() {

    /* Emoji reaction buttons */
    document.querySelectorAll('.emoji-reaction-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { handleEmojiReaction(btn); });
    });

    /* Share buttons */
    document.querySelectorAll('.share-social-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { sharePost(btn.dataset.platform); });
    });

    /* TOC Like button — scrolls to reactions bar */
    var tocLikeBtn = document.getElementById('tocLikeBtn');
    if (tocLikeBtn) {
      tocLikeBtn.addEventListener('click', function () {
        var bar = document.getElementById('reactionsBar');
        if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    /* TOC Share button — scrolls to share bar */
    var tocShareBtn = document.getElementById('tocShareBtn');
    if (tocShareBtn) {
      tocShareBtn.addEventListener('click', function () {
        var shareBar = document.querySelector('.post-share-bar');
        if (shareBar) shareBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    /* Submit comment */
    var submitCommentBtn = document.getElementById('submitCommentBtn');
    if (submitCommentBtn) {
      submitCommentBtn.addEventListener('click', submitComment);
    }

    /* Comment character count */
    var commentTextarea = document.getElementById('commentTextarea');
    var charCount       = document.getElementById('charCount');
    if (commentTextarea && charCount) {
      commentTextarea.addEventListener('input', function () {
        var len = commentTextarea.value.length;
        charCount.textContent = len + ' / 500';
        charCount.style.color = len > 450 ? '#dc3246' : '';
      });
    }

    /* Newsletter */
    var newsletterSubmit = document.getElementById('newsletterSubmit');
    if (newsletterSubmit) {
      newsletterSubmit.addEventListener('click', handleNewsletterSubmit);
    }
    var newsletterEmail = document.getElementById('newsletterEmail');
    if (newsletterEmail) {
      newsletterEmail.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') handleNewsletterSubmit();
      });
    }

    /* Escape key — close open reply boxes */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.reply-input-area').forEach(function (area) {
          area.innerHTML     = '';
          area.style.display = 'none';
        });
      }
    });
  }

  /* ── INIT ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', init);

})();
