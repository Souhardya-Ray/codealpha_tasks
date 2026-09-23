async function renderCart(app, params) {
  app.innerHTML = `
    <div class="page-header"><h1>Your cart</h1></div>
    <div class="loading-state">Loading cart...</div>
  `;

  let items = []; // normalized: [{ productId, name, price, quantity, stock, image }]

  function getProductImg(p) {
    if (p.images && p.images.length > 0 && p.images[0]) return p.images[0];
    if (p.imageUrl) return p.imageUrl;
    if (p.image) return p.image;
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }

  try {
    if (state.user) {
      const { cart } = await api('/cart');
      items = (cart.items || [])
        .filter((i) => i.productId)
        .map((i) => ({
          productId: i.productId._id,
          name: i.productId.name,
          price: i.productId.price,
          stock: i.productId.stock,
          image: getProductImg(i.productId),
          quantity: i.quantity
        }));
    } else {
      const guestItems = getGuestCart();
      const results = await Promise.all(
        guestItems.map((gi) => api(`/products/${gi.productId}`).then((r) => ({ ...gi, product: r.product })).catch(() => null))
      );
      items = results.filter(Boolean).map((r) => ({
        productId: r.productId,
        name: r.product.name,
        price: r.product.price,
        stock: r.product.stock,
        image: getProductImg(r.product),
        quantity: r.quantity
      }));
    }
  } catch (err) {
    app.innerHTML = `
      <div class="page-header"><h1>Your cart</h1></div>
      <div class="empty-state"><p>${err.message}</p></div>
    `;
    return;
  }

  if (items.length === 0) {
    app.innerHTML = `
      <div class="page-header"><h1>Your cart</h1></div>
      <div class="empty-state">
        <p>Your cart is empty.</p>
        <a class="btn" href="#/">Browse products</a>
      </div>
    `;
    return;
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  app.innerHTML = `
    <div class="page-header"><h1>Your cart</h1></div>
    <div class="cart-layout">
      <div>
        <div class="cart-items">
          ${items.map((i) => `
            <div class="cart-item" data-id="${i.productId}">
              <div style="display:flex; align-items:center; gap:var(--space-4)">
                <img src="${i.image}" alt="${escapeHtml(i.name)}" style="width:48px; height:48px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--color-border);" onerror="this.style.display='none'">
                <div>
                  <div class="cart-item-name">${escapeHtml(i.name)}</div>
                  <div class="cart-item-price">$${i.price.toFixed(2)} each</div>
                </div>
              </div>
              <input type="number" min="1" max="${i.stock}" value="${i.quantity}" class="qty-input" aria-label="Quantity for ${escapeHtml(i.name)}">
              <div class="cart-item-total line-total">$${(i.price * i.quantity).toFixed(2)}</div>
              <button class="btn btn-ghost btn-sm remove-btn" aria-label="Remove ${escapeHtml(i.name)}">Remove</button>
            </div>
          `).join('')}
        </div>
      </div>
      <aside>
        <div class="cart-summary">
          <h2>Order summary</h2>
          <div class="cart-summary-row"><span>Items</span><span>${totalQty}</span></div>
          <div class="cart-summary-row cart-summary-total"><span>Subtotal</span><span id="cart-subtotal">$${subtotal.toFixed(2)}</span></div>
          <button id="checkout-btn" class="btn btn-full btn-lg">Proceed to checkout</button>
        </div>
      </aside>
    </div>
  `;

  function recalc() {
    let newSubtotal = 0;
    app.querySelectorAll('.cart-item').forEach((row) => {
      const price = parseFloat(row.querySelector('.cart-item-price').textContent.replace('$', ''));
      const qty = parseInt(row.querySelector('.qty-input').value, 10) || 1;
      const lineTotal = price * qty;
      row.querySelector('.line-total').textContent = `$${lineTotal.toFixed(2)}`;
      newSubtotal += lineTotal;
    });
    app.querySelector('#cart-subtotal').textContent = `$${newSubtotal.toFixed(2)}`;
  }

  app.querySelectorAll('.qty-input').forEach((input) => {
    input.addEventListener('change', async () => {
      const productId = input.closest('.cart-item').dataset.id;
      const quantity = Math.max(1, parseInt(input.value, 10) || 1);
      if (state.user) {
        try { await api(`/cart/${productId}`, { method: 'PUT', body: { quantity } }); }
        catch (err) { alert(err.message); return; }
      } else {
        const guestItems = getGuestCart();
        const found = guestItems.find((g) => g.productId === productId);
        if (found) found.quantity = quantity;
        setGuestCart(guestItems);
      }
      recalc();
      await updateCartCount();
    });
  });

  app.querySelectorAll('.remove-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const item = btn.closest('.cart-item');
      const productId = item.dataset.id;
      if (state.user) {
        try { await api(`/cart/${productId}`, { method: 'DELETE' }); }
        catch (err) { alert(err.message); return; }
      } else {
        setGuestCart(getGuestCart().filter((g) => g.productId !== productId));
      }
      await updateCartCount();
      renderCart(app, params);
    });
  });

  app.querySelector('#checkout-btn').addEventListener('click', () => {
    if (!state.user) {
      location.hash = '#/login?next=checkout';
      return;
    }
    location.hash = '#/checkout';
  });
}

addRoute('/cart', renderCart);
