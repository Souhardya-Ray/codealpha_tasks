// Central bit of shared state: current user + guest cart helpers.
const state = {
  user: null
};

const GUEST_CART_KEY = 'guestCart'; // [{ productId, quantity }]

function getGuestCart() {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || []; }
  catch (_) { return []; }
}
function setGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}
function addToGuestCart(productId, quantity) {
  const items = getGuestCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else items.push({ productId, quantity });
  setGuestCart(items);
}
function clearGuestCart() { localStorage.removeItem(GUEST_CART_KEY); }

// Merge the guest cart into the server cart right after login/register.
async function mergeGuestCartIfAny() {
  const items = getGuestCart();
  if (items.length === 0) return;
  for (const item of items) {
    try { await api('/cart', { method: 'POST', body: { productId: item.productId, quantity: item.quantity } }); }
    catch (_) { /* skip items that fail (e.g. deleted product) */ }
  }
  clearGuestCart();
}

async function refreshUser() {
  try {
    const data = await api('/auth/me');
    state.user = data.user;
  } catch (_) {
    state.user = null;
  }
  updateAuthUI();
  updateCartCount();
}

function updateAuthUI() {
  const loggedIn = !!state.user;
  document.querySelectorAll('.auth-only').forEach((el) => (el.hidden = !loggedIn) && (el.style.display = loggedIn ? '' : 'none'));
  document.querySelectorAll('.guest-only').forEach((el) => (el.style.display = loggedIn ? 'none' : ''));
  document.querySelectorAll('.auth-only').forEach((el) => (el.style.display = loggedIn ? '' : 'none'));
}

async function updateCartCount() {
  const badge = document.getElementById('cart-count');
  let count = 0;
  if (state.user) {
    try {
      const { cart } = await api('/cart');
      count = (cart.items || []).reduce((sum, i) => sum + i.quantity, 0);
    } catch (_) { /* ignore */ }
  } else {
    count = getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
  }
  badge.textContent = count;
  badge.hidden = count === 0;
}
