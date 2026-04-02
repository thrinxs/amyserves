function showAlert(msg) {
    const el = document.getElementById('resetAlert');
    el.textContent = msg;
    el.classList.add('show', 'error');
  }
  
  async function handleReset() {
    const email = document.getElementById('email').value.trim();
    const errEl = document.getElementById('emailError');
    const input = document.getElementById('email');
  
    errEl.textContent = '';
    input.classList.remove('error');
    document.getElementById('resetAlert').classList.remove('show');
  
    if (!email) {
      errEl.textContent = 'Email is required.';
      input.classList.add('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'Enter a valid email address.';
      input.classList.add('error');
      return;
    }
  
    const btn = document.getElementById('resetBtn');
    btn.classList.add('loading');
    btn.disabled = true;
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/login.html'
      });
      if (error) throw error;
  
      document.getElementById('formState').style.display = 'none';
      document.getElementById('sentTo').textContent = email;
      document.getElementById('successState').style.display = 'block';
  
    } catch (err) {
      showAlert(err.message || 'Something went wrong. Please try again.');
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }
  
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleReset();
  });