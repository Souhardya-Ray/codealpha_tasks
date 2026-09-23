function getNextHash() {
  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  const next = qs.get('next');
  return next === 'checkout' ? '#/checkout' : '#/';
}

async function renderLogin(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Log in</h1>
        <form id="login-form">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn btn-full btn-lg">Log in</button>
          <p id="login-error" class="error-text" hidden></p>
        </form>
        <hr class="divider">
        <p class="help-text" style="text-align:center">
          Don't have an account? <a href="#/register">Create one</a>
        </p>
        <p class="help-text" style="text-align:center">
          <button class="link-btn" id="google-btn" style="color:var(--accent)">Sign in with Google</button>
          <span style="color:var(--ink-200)">&mdash; not configured in this demo</span>
        </p>
      </div>
    </div>
  `;

  app.querySelector('#google-btn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Google sign-in is a stub in this demo. See server/routes/auth.js for wiring notes.');
  });

  app.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = app.querySelector('#login-error');
    errorEl.hidden = true;
    try {
      await api('/auth/login', {
        method: 'POST',
        body: { email: app.querySelector('#email').value, password: app.querySelector('#password').value }
      });
      await mergeGuestCartIfAny();
      await refreshUser();
      location.hash = getNextHash();
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = err.message;
    }
  });
}

async function renderRegister(app) {
  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h1>Create account</h1>
        <form id="register-form">
          <div class="field">
            <label for="name">Full name</label>
            <input id="name" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" autocomplete="email" required>
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" autocomplete="new-password" minlength="8" required>
            <p class="help-text">At least 8 characters.</p>
          </div>
          <button type="submit" class="btn btn-full btn-lg">Create account</button>
          <p id="register-error" class="error-text" hidden></p>
        </form>
        <hr class="divider">
        <p class="help-text" style="text-align:center">
          Already have an account? <a href="#/login">Log in</a>
        </p>
      </div>
    </div>
  `;

  app.querySelector('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = app.querySelector('#register-error');
    errorEl.hidden = true;
    try {
      await api('/auth/register', {
        method: 'POST',
        body: {
          name: app.querySelector('#name').value,
          email: app.querySelector('#email').value,
          password: app.querySelector('#password').value
        }
      });
      await mergeGuestCartIfAny();
      await refreshUser();
      location.hash = getNextHash();
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = err.message;
    }
  });
}

addRoute('/login', renderLogin);
addRoute('/register', renderRegister);
