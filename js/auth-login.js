function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }
  
  function showAlert(msg) {
    const el = document.getElementById('loginAlert');
    el.textContent = msg;
    el.classList.add('show', 'error');
  }
  
  function clearErrors() {
    document.getElementById('loginAlert').classList.remove('show');
    document.getElementById('emailError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('email').classList.remove('error');
    document.getElementById('password').classList.remove('error');
  }
  
  async function handleLogin() {
    clearErrors();
  
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    let valid = true;
  
    if (!email) {
      document.getElementById('emailError').textContent = 'Email is required.';
      document.getElementById('email').classList.add('error');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('emailError').textContent = 'Enter a valid email address.';
      document.getElementById('email').classList.add('error');
      valid = false;
    }
  
    if (!password) {
      document.getElementById('passwordError').textContent = 'Password is required.';
      document.getElementById('password').classList.add('error');
      valid = false;
    }
  
    if (!valid) return;
  
    const btn = document.getElementById('loginBtn');
    btn.classList.add('loading');
    btn.disabled = true;
  
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
  
      // Redirect based on role
      const role = data.user?.user_metadata?.role || 'client';
      if (role === 'admin')       window.location.href = '../dashboard/admin/index.html';
      else if (role === 'staff')  window.location.href = '../dashboard/staff/index.html';
      else                        window.location.href = '../dashboard/client/index.html';
  
    } catch (err) {
      showAlert(err.message || 'Login failed. Please check your credentials.');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
  
  // Allow Enter key to submit
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });