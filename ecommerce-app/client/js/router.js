// Minimal hash-based client-side router with a short fade + slide transition
// between views (no full page reloads).
const routes = []; // { pattern: RegExp, keys: string[], render: fn }

function addRoute(path, render) {
  const keys = [];
  const pattern = new RegExp(
    '^' + path.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$'
  );
  routes.push({ pattern, keys, render });
}

function updateActiveNav(path) {
  document.querySelectorAll('.main-nav a').forEach((a) => {
    a.classList.remove('nav-active');
    const href = a.getAttribute('href');
    if (!href) return;
    const navPath = href.replace('#', '') || '/';
    // Exact match for '/', prefix match for everything else
    const isActive = navPath === '/'
      ? path === '/'
      : path.startsWith(navPath);
    if (isActive) a.classList.add('nav-active');
  });
}

async function handleRoute() {
  const hash = location.hash.slice(1) || '/';
  const path = hash.split('?')[0];
  const match = routes.find((r) => r.pattern.test(path));
  const app = document.getElementById('app');

  app.classList.add('fade-out');
  await new Promise((r) => setTimeout(r, 150));

  if (!match) {
    app.innerHTML = '<div class="empty-state"><h1>Page not found</h1></div>';
  } else {
    const values = match.pattern.exec(path).slice(1);
    const params = {};
    match.keys.forEach((k, i) => (params[k] = values[i]));
    try {
      await match.render(app, params);
    } catch (err) {
      app.innerHTML = `<div class="empty-state"><p>${err.message || 'Something went wrong.'}</p></div>`;
    }
  }

  updateActiveNav(path);
  window.scrollTo(0, 0);
  app.classList.remove('fade-out');
}

window.addEventListener('hashchange', handleRoute);
