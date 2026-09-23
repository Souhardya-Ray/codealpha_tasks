async function renderProfile(app) {
  if (!state.user) { location.hash = '#/login'; return; }

  const initials = state.user.name
    ? state.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  app.innerHTML = `
    <div class="page-header"><h1>Profile</h1></div>
    <div style="display:flex; align-items:center; gap:var(--space-5); margin-bottom:var(--space-8)">
      <div style="
        width:56px; height:56px; border-radius:50%;
        background:var(--accent-light); color:var(--accent);
        display:flex; align-items:center; justify-content:center;
        font-weight:700; font-size:1.1rem; flex-shrink:0;
      ">${initials}</div>
      <div>
        <div style="font-weight:700; font-size:1rem; color:var(--ink-900)">${escapeHtml(state.user.name)}</div>
        <div style="font-size:0.875rem; color:var(--ink-400)">${escapeHtml(state.user.email)}</div>
      </div>
    </div>
    <a class="btn btn-outline" href="#/orders">View order history</a>
  `;
}

addRoute('/profile', renderProfile);
