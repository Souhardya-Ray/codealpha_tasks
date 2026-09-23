async function renderProduct(app, params) {
  app.innerHTML = '<div class="loading-state">Loading product...</div>';
  let product;
  try {
    const data = await api(`/products/${params.id}`);
    product = data.product;
  } catch (err) {
    app.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
    return;
  }

  const lowStock   = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock === 0;

  const stockClass = outOfStock ? 'out' : lowStock ? 'low' : '';
  const stockLabel = outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : 'In stock';

  function getProductImage(p) {
    if (p.images && p.images.length > 0 && p.images[0]) return p.images[0];
    if (p.imageUrl) return p.imageUrl;
    if (p.image) return p.image;
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }

  const imgUrl = getProductImage(product);

  app.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-img">
        <img src="${imgUrl}" alt="${escapeHtml(product.name)}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';">
      </div>
      <div class="product-detail-info">
        <h1>${escapeHtml(product.name)}</h1>
        <div class="product-price-tag">$${product.price.toFixed(2)}</div>
        <p>${escapeHtml(product.description)}</p>
        <span class="stock-badge ${stockClass}">${stockLabel}</span>
        <div class="qty-row">
          <label for="qty-input">Qty</label>
          <input id="qty-input" type="number" min="1" max="${product.stock}" value="1" ${outOfStock ? 'disabled' : ''}>
        </div>
        <button id="add-to-cart-btn" class="btn btn-lg" ${outOfStock ? 'disabled' : ''}>Add to cart</button>
        <p id="add-msg" class="help-text" hidden></p>
      </div>
    </div>
  `;

  const qtyInput = app.querySelector('#qty-input');
  const msg = app.querySelector('#add-msg');

  app.querySelector('#add-to-cart-btn').addEventListener('click', async () => {
    const quantity = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    if (state.user) {
      try {
        await api('/cart', { method: 'POST', body: { productId: product._id, quantity } });
        await updateCartCount();
        msg.hidden = false;
        msg.className = 'success-text';
        msg.textContent = 'Added to cart.';
      } catch (err) {
        msg.hidden = false;
        msg.className = 'error-text';
        msg.textContent = err.message;
      }
    } else {
      addToGuestCart(product._id, quantity);
      await updateCartCount();
      msg.hidden = false;
      msg.className = 'success-text';
      msg.textContent = 'Added to cart.';
    }
  });
}

addRoute('/products/:id', renderProduct);
