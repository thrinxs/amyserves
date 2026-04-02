function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }
  
  function checkStrength(val) {
    const bars   = ['s1','s2','s3','s4'];
    const label  = document.getElementById('strengthLabel');
    let score = 0;
    if (val.length >= 8)              score++;
    if (/[A-Z]/.test(val))           score++;
    if (/[0-9]/.test(val))           score++;
    if (/[^A-Za-z0-9]/.test(val))   score++;
  
    const levels = ['', 'weak', 'fair', 'strong', 'strong'];
    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very strong'];
  
    bars.forEach((id, i) => {
      const el = document.getElementById(id);
      el.className = '';
      if (i < score) el.classList.add('active', levels[score]);
    });
  
    label.textContent = val.length ? labels[score] : '';
  }
  
  function showError(id, msg) {
    document.getElementById(id).textContent = msg;
    const input = document.getElementById(id.replace('Error',''));
    if (input) input.classList.add('error');
  }
  
  function clearErrors() {
    ['nameError','emailError','phoneError','serviceError','passwordError'].forEach(id => {
      document.getElementById(id).textContent = '';
    });
    ['fullName','email','phone','service','password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
    document.getElementById('signupAlert').classList.remove('show');
    document.getElementById('signupSuccess').classList.remove('show');
  }
  
  async function handleSignup() {
    clearErrors();
  
    const name     = document.getElementById('fullName').value.trim();
    const email    = document.getElementById('email').value.trim();
    const phone    = document.getElementById('phone').value.trim();
    const service  = document.getElementById('service').value;
    const password = document.getElementById('password').value;
    const terms    = document.getElementById('terms').checked;
    let valid = true;
  
    if (!name)    { showError('nameError', 'Full name is required.');      valid = false; }
    if (!email)   { showError('emailError', 'Email is required.');         valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('emailError', 'Enter a valid email address.');             valid = false;
    }
    if (!phone)   { showError('phoneError', 'Phone number is required.');  valid = false; }
    if (!service) { showError('serviceError', 'Please select a service.'); valid = false; }
    if (password.length < 8) {
      showError('passwordError', 'Password must be at least 8 characters.'); valid = false;
    }
    if (!terms) {
      const alert = document.getElementById('signupAlert');
      alert.textContent = 'Please accept the Terms of Service to continue.';
      alert.classList.add('show');
      valid = false;
    }
  
    if (!valid) return;
  
    const btn = document.getElementById('signupBtn');
    btn.classList.add('loading');
    btn.disabled = true;
  
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone, service_interest: service, role: 'client' }
        }
      });
      if (error) throw error;
  
      const success = document.getElementById('signupSuccess');
      success.textContent = '✅ Account created! Check your email to confirm before logging in.';
      success.classList.add('show');
      btn.classList.remove('loading');
      btn.disabled = false;
  
    } catch (err) {
      const alert = document.getElementById('signupAlert');
      alert.textContent = err.message || 'Signup failed. Please try again.';
      alert.classList.add('show');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }