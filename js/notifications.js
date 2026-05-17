'use strict';

/* ================================================
   AMYSERVES — Notification Helper
   Triggers notifications for client actions
   ================================================ */

/* ── CREATE A SINGLE NOTIFICATION ── */
async function createNotification(userId, { title, body, type = 'general', direction = 'received', link = null }) {
  if (!userId) return;

  const { error } = await supabaseClient
    .from('notifications')
    .insert([{
      user_id:   userId,
      title:     title,
      body:      body,
      type:      type,
      direction: direction,
      is_read:   false,
      link:      link
    }]);

  if (error) {
    console.error('Notification error:', error);
  }
}

/* ── NOTIFY ADMIN & STAFF ── */
async function notifyAdminAndStaff(title, body, type, link) {
  const { data: adminStaff, error } = await supabaseClient
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'staff']);

  if (error || !adminStaff) return;

  const notifications = adminStaff.map(function (user) {
    return {
      user_id:   user.id,
      title:     title,
      body:      body,
      type:      type,
      direction: 'received',
      is_read:   false,
      link:      link || null
    };
  });

  await supabaseClient.from('notifications').insert(notifications);
}

/* ================================================
   TRIGGER FUNCTIONS — Call these on each action
   ================================================ */

/* 🔐 CLIENT LOGS IN */
async function notifyLogin(userId, userName) {
  await createNotification(userId, {
    title:     'Welcome back!',
    body:      'You successfully logged in to your AmyServes account.',
    type:      'login',
    direction: 'received',
    link:      '/dashboard/client/index.html'
  });

  await notifyAdminAndStaff(
    'Client Logged In',
    (userName || 'A client') + ' just logged in to their account.',
    'login',
    '/dashboard/admin/users.html'
  );
}

/* 📝 CLIENT SUBMITS A SERVICE REQUEST */
async function notifyServiceRequest(userId, userName, serviceName, brand) {
    var brandLabel = brand === 'puraklen'
      ? "Pura-Kle'N Cleaning"
      : brand === 'yourfirm'
      ? 'Yourfirm Consults'
      : 'AmyServes';
  
    // Notify the client
    await createNotification(userId, {
      title:     'Service Request Received ✅',
      body:      'Your request for "' + serviceName + '" via ' + brandLabel + ' has been yourfirmci@gmail.com be in touch within 24 hours.',
      type:      'booking',
      direction: 'received',
      link:      '/dashboard/client/index.html'
    });
  
    // Notify admin & staff
    await notifyAdminAndStaff(
      'New Service Request — ' + brandLabel,
      (userName || 'A client') + ' submitted a request for: ' + serviceName + '.',
      'booking',
      '/dashboard/admin/requests.html'
    );
  }
/* 💬 CLIENT SENDS A MESSAGE */
async function notifyMessageSent(userId, userName, recipientId) {
  // Notify the client (sender)
  await createNotification(userId, {
    title:     'Message Sent',
    body:      'Your message has been sent successfully.',
    type:      'message',
    direction: 'sent',
    link:      '/dashboard/client/messages.html'
  });

  // Notify the recipient
  if (recipientId) {
    await createNotification(recipientId, {
      title:     'New Message',
      body:      'You have a new message from ' + (userName || 'a client') + '.',
      type:      'message',
      direction: 'received',
      link:      '/dashboard/admin/messages.html'
    });
  }
}

/* 👍 CLIENT LIKES A POST */
async function notifyPostLike(userId, userName, postTitle) {
  await createNotification(userId, {
    title:     'Post Liked',
    body:      'You liked the post: "' + postTitle + '".',
    type:      'general',
    direction: 'sent',
    link:      '/blog.html'
  });

  await notifyAdminAndStaff(
    'Post Liked',
    (userName || 'A client') + ' liked the post: "' + postTitle + '".',
    'general',
    '/dashboard/admin/content.html'
  );
}

/* 💬 CLIENT LEAVES A COMMENT */
async function notifyComment(userId, userName, postTitle) {
  await createNotification(userId, {
    title:     'Comment Posted',
    body:      'Your comment on "' + postTitle + '" has been posted successfully.',
    type:      'general',
    direction: 'sent',
    link:      '/blog.html'
  });

  await notifyAdminAndStaff(
    'New Comment',
    (userName || 'A client') + ' commented on "' + postTitle + '".',
    'general',
    '/dashboard/admin/content.html'
  );
}

/* 📧 CLIENT SUBSCRIBES TO NEWSLETTER */
async function notifyNewsletterSubscription(userId, userEmail) {
  await createNotification(userId, {
    title:     'Newsletter Subscription Confirmed',
    body:      'yourfirmci@gmail.com successfully subscribed to the AmyServes newsletter.',
    type:      'general',
    direction: 'received',
    link:      '/dashboard/client/index.html'
  });

  await notifyAdminAndStaff(
    'New Newsletter Subscriber',
    (userEmail || 'A user') + ' subscribed to the newsletter.',
    'general',
    '/dashboard/admin/users.html'
  );
}

/* 🔄 STAFF UPDATES A REQUEST STATUS */
async function notifyStatusUpdate(clientId, staffName, serviceName, newStatus) {
  await createNotification(clientId, {
    title:     'Request Status Updated',
    body:      'Your request for "' + serviceName + '" has been updated to: ' + newStatus + '.',
    type:      'status_update',
    direction: 'received',
    link:      '/dashboard/client/index.html'
  });
}

/* 🆕 CLIENT SIGNS UP */
async function notifySignup(userId, userName, userEmail) {
    // Notify the new client
    await createNotification(userId, {
      title:     'Welcome to AmyServes! 🎉',
      body:      'Hi ' + userName + '! Your account has been created yourfirmci@gmail.com glad to have you.',
      type:      'general',
      direction: 'received',
      link:      '/dashboard/client/index.html'
    });
  
    // Notify admin & staff
    await notifyAdminAndStaff(
      'New Client Registered',
      userName + ' (' + userEmail + ') just created a client account.',
      'general',
      '/dashboard/admin/users.html'
    );
  }
