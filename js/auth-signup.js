
function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  var isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.innerHTML = isText
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
}

function checkStrength() {
  var passwordInput = document.getElementById('password');
  var strengthLabel = document.getElementById('strengthLabel');
  var s1 = document.getElementById('s1');
  var s2 = document.getElementById('s2');
  var s3 = document.getElementById('s3');
  var s4 = document.getElementById('s4');

  if (!passwordInput) return;
  var password = passwordInput.value;

  if (!password) {
    if (strengthLabel) strengthLabel.textContent = '';
    [s1,s2,s3,s4].forEach(function(s) { if (s) s.className = ''; });
    return;
  }

  var score = 0;
  if (password.length >= 8)           score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  var spans = [s1, s2, s3, s4];
  spans.forEach(function(s, i) {
    if (!s) return;
    s.className = i < score ? 'active' : '';
  });

  if (strengthLabel) {
    if (score <= 1) {
      strengthLabel.textContent = 'Weak';
      strengthLabel.style.color = '#d94f4f';
    } else if (score <= 2) {
      strengthLabel.textContent = 'Fair';
      strengthLabel.style.color = '#e6a817';
    } else if (score <= 3) {
      strengthLabel.textContent = 'Good';
      strengthLabel.style.color = '#C8941A';
    } else {
      strengthLabel.textContent = 'Strong';
      strengthLabel.style.color = '#0F6E56';
    }
  }
}

function clearMessages() {
  var alert   = document.getElementById('signupAlert');
  var success = document.getElementById('signupSuccess');
  if (alert)   { alert.textContent = '';   alert.classList.remove('show'); }
  if (success) { success.textContent = ''; success.classList.remove('show'); }
}

function showError(msg) {
  var el = document.getElementById('signupAlert');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function showSuccess(msg) {
  var el = document.getElementById('signupSuccess');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function getInitials(name) {
  var parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getRandomColor() {
  var colors = ['#0F6E56', '#3C3489', '#C8941A', '#1A3C5E'];
  return colors[Math.floor(Math.random() * colors.length)];
}

async function handleSignup() {
  clearMessages();

  var name     = ((document.getElementById('fullName') || {}).value || '').trim();
  var email    = ((document.getElementById('email')    || {}).value || '').trim();
  var phone    = ((document.getElementById('phone')    || {}).value || '').trim();
  var password = ((document.getElementById('password') || {}).value || '').trim();
  var service  = ((document.getElementById('service')  || {}).value || '');
  var termsEl  = document.getElementById('terms');
  var termsChecked = termsEl ? termsEl.checked : true;

  if (!name || !email || !password) {
    showError('Please fill in all required fields.');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    showError('Please enter a valid email address.');
    return;
  }
  if (password.length < 8) {
    showError('Password must be at least 8 characters.');
    return;
  }
  if (termsEl && !termsChecked) {
    showError('Please accept the terms to continue.');
    return;
  }
  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    showError('Connection error. Please refresh and try again.');
    return;
  }

  var btn = document.getElementById('signupBtn');
  if (btn) { btn.classList.add('loading'); btn.disabled = true; }

  try {
    var initials = getInitials(name);
    var color    = getRandomColor();

    var result = await supabaseClient.auth.signUp({
      email:    email,
      password: password,
      options: {
        data: {
          full_name:        name,
          phone:            phone,
          service_interest: service,
          role:             'client',
          initials:         initials,
          color:            color
        }
      }
    });

    if (result.error) throw result.error;

    if (result.data && result.data.user) {
      var profileResult = await supabaseClient
        .from('profiles')
        .insert({
          id:        result.data.user.id,
          full_name: name,
          initials:  initials,
          color:     color,
          phone:     phone || '',
          role:      'client'
        });

      if (profileResult.error) {
        console.error('Profile error:', profileResult.error);
      }

      // 🔔 Trigger signup notification
      await notifySignup(result.data.user.id, name, email);
    }

    showSuccess('Account created! Redirecting to sign in...');
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }

    setTimeout(function () {
      window.location.href = 'login.html';
    }, 1500);

  } catch (err) {
    showError(err.message || 'Signup failed. Please try again.');
    if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', checkStrength);
  }
});
