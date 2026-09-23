async function renderCheckout(app) {
  if (!state.user) { location.hash = '#/login?next=checkout'; return; }

  app.innerHTML = `
    <div class="page-header"><h1>Checkout</h1></div>
    <div class="loading-state">Loading cart...</div>
  `;

  let cart;
  try {
    const data = await api('/cart');
    cart = data.cart;
  } catch (err) {
    app.innerHTML = `
      <div class="page-header"><h1>Checkout</h1></div>
      <div class="empty-state"><p>${err.message}</p></div>
    `;
    return;
  }

  const items = (cart.items || []).filter((i) => i.productId);
  if (items.length === 0) {
    app.innerHTML = `
      <div class="page-header"><h1>Checkout</h1></div>
      <div class="empty-state"><p>Your cart is empty.</p><a class="btn" href="#/">Browse products</a></div>
    `;
    return;
  }

  const subtotal = items.reduce((s, i) => s + i.productId.price * i.quantity, 0);

  app.innerHTML = `
    <div class="page-header"><h1>Checkout</h1></div>
    <div class="checkout-layout">
      <form id="checkout-form">
        <h2>Shipping address</h2>
        <div class="field"><label for="fullName">Full name</label><input id="fullName" autocomplete="name" required></div>
        <div class="field"><label for="line1">Street address</label><input id="line1" autocomplete="street-address" required></div>
        <div class="field"><label for="city">City</label><input id="city" autocomplete="address-level2" required></div>
        <div class="field"><label for="stateField">State / Province</label><input id="stateField" autocomplete="address-level1" required></div>
        <div class="field"><label for="postalCode">Postal code</label><input id="postalCode" autocomplete="postal-code" required></div>
        <div class="field"><label for="country">Country</label><input id="country" autocomplete="country-name" required></div>
        <p class="help-text">Payment is simulated for this demo — placing the order confirms it immediately.</p>
        <button type="submit" class="btn btn-lg btn-full" id="place-order-btn">Place order</button>
        <p id="checkout-error" class="error-text" hidden></p>
      </form>

      <aside>
        <div class="checkout-order-summary">
          <h2>Order summary</h2>
          ${items.map((i) => `
            <div class="cart-summary-row">
              <span>${escapeHtml(i.productId.name)}<span style="color:var(--ink-400)">&nbsp;&times;${i.quantity}</span></span>
              <span>$${(i.productId.price * i.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="cart-summary-row cart-summary-total"><span>Total</span><span>$${subtotal.toFixed(2)}</span></div>
        </div>
      </aside>
    </div>
  `;

  app.querySelector('#checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = app.querySelector('#checkout-error');
    errorEl.hidden = true;
    const btn = app.querySelector('#place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Placing order...';

    const shippingAddress = {
      fullName:   app.querySelector('#fullName').value,
      line1:      app.querySelector('#line1').value,
      city:       app.querySelector('#city').value,
      state:      app.querySelector('#stateField').value,
      postalCode: app.querySelector('#postalCode').value,
      country:    app.querySelector('#country').value
    };

    try {
      const { order } = await api('/orders', { method: 'POST', body: { shippingAddress } });
      await updateCartCount();
      location.hash = `#/orders/${order._id}`;
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Place order';
    }
  });
}

addRoute('/checkout', renderCheckout);
