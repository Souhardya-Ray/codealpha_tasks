document.getElementById('logout-btn').addEventListener('click', async () => {
  try { await api('/auth/logout', { method: 'POST' }); } catch (_) { /* ignore */ }
  state.user = null;
  updateAuthUI();
  await updateCartCount();
  location.hash = '#/';
});

(async function init() {
  await refreshUser();
  if (!location.hash) location.hash = '#/';
  handleRoute();
})();
