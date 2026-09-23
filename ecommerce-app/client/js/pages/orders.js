function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function renderOrders(app) {
  if (!state.user) { location.hash = '#/login'; return; }
  app.innerHTML = `
    <div class="page-header"><h1>Order history</h1></div>
    <div class="loading-state">Loading orders...</div>
  `;

  try {
    const { orders } = await api('/orders');
    if (orders.length === 0) {
      app.innerHTML = `
        <div class="page-header"><h1>Order history</h1></div>
        <div class="empty-state">
          <p>You haven't placed any orders yet.</p>
          <a class="btn" href="#/">Browse products</a>
        </div>
      `;
      return;
    }

    app.innerHTML = `
      <div class="page-header"><h1>Order history</h1></div>
      <div class="orders-list">
        ${orders.map((o) => `
          <a class="order-card" href="#/orders/${o._id}">
            <div class="order-card-head">
              <span class="order-card-id">Order #${o._id.slice(-6).toUpperCase()}</span>
              <span class="status-badge ${o.status}">${statusLabel(o.status)}</span>
            </div>
            <p class="order-card-meta">
              ${o.items.length} item${o.items.length !== 1 ? 's' : ''}
              &middot;
              $${o.totalAmount.toFixed(2)}
              &middot;
              ${new Date(o.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </a>
        `).join('')}
      </div>
    `;
  } catch (err) {
    app.innerHTML = `
      <div class="page-header"><h1>Order history</h1></div>
      <div class="empty-state"><p>${err.message}</p></div>
    `;
  }
}

async function renderOrderDetail(app, params) {
  if (!state.user) { location.hash = '#/login'; return; }
  app.innerHTML = '<div class="loading-state">Loading order...</div>';

  try {
    const { order } = await api(`/orders/${params.id}`);

    app.innerHTML = `
      <div class="page-header">
        <h1>Order #${order._id.slice(-6).toUpperCase()}</h1>
        <span class="status-badge ${order.status}">${statusLabel(order.status)}</span>
      </div>

      <h2>Items</h2>
      <div class="cart-items" style="margin-bottom: var(--space-8)">
        ${order.items.map((i) => `
          <div class="cart-item" style="grid-template-columns: 1fr auto auto">
            <div>
              <div class="cart-item-name">${escapeHtml(i.name)}</div>
              <div class="cart-item-price">$${i.price.toFixed(2)} each &middot; qty ${i.quantity}</div>
            </div>
            <div class="cart-item-total">$${(i.price * i.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      <div class="cart-summary" style="max-width:320px">
        <div class="cart-summary-row cart-summary-total"><span>Total</span><span>$${order.totalAmount.toFixed(2)}</span></div>
      </div>

      <h2 style="margin-top: var(--space-10)">Shipping to</h2>
      <p style="line-height:1.9">
        <strong>${escapeHtml(order.shippingAddress?.fullName || '')}</strong><br>
        ${escapeHtml(order.shippingAddress?.line1 || '')}<br>
        ${escapeHtml(order.shippingAddress?.city || '')}, ${escapeHtml(order.shippingAddress?.state || '')} ${escapeHtml(order.shippingAddress?.postalCode || '')}<br>
        ${escapeHtml(order.shippingAddress?.country || '')}
      </p>

      <a class="btn btn-outline" href="#/orders" style="margin-top: var(--space-6)">Back to orders</a>
    `;
  } catch (err) {
    app.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

addRoute('/orders', renderOrders);
addRoute('/orders/:id', renderOrderDetail);
