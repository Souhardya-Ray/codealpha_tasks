async function renderHome(app, params) {
  app.innerHTML = `
    <div class="page-header">
      <h1>Shop Collection</h1>
    </div>
    <div class="filters">
      <input id="search-input" type="text" placeholder="Search products..." aria-label="Search products">
      <select id="category-select" aria-label="Filter by category">
        <option value="">All categories</option>
      </select>
    </div>
    <div id="product-grid" class="loading-state">Loading products...</div>
  `;

  const searchInput = app.querySelector('#search-input');
  const categorySelect = app.querySelector('#category-select');

  const params0 = new URLSearchParams(location.hash.split('?')[1] || '');
  searchInput.value = params0.get('search') || '';

  try {
    const { categories } = await api('/products/categories');
    categories.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      if (c === params0.get('category')) opt.selected = true;
      categorySelect.appendChild(opt);
    });
  } catch (_) { /* categories are optional */ }

  async function loadProducts() {
    const grid = app.querySelector('#product-grid');
    grid.className = 'loading-state';
    grid.textContent = 'Loading products...';
    const qs = new URLSearchParams();
    if (searchInput.value) qs.set('search', searchInput.value);
    if (categorySelect.value) qs.set('category', categorySelect.value);

    try {
      const { products } = await api(`/products?${qs.toString()}`);
      if (products.length === 0) {
        grid.className = 'empty-state';
        grid.textContent = 'No products match your search.';
        return;
      }
      grid.className = 'product-grid';
      grid.innerHTML = products.map(productCardHtml).join('');
    } catch (err) {
      grid.className = 'empty-state';
      grid.textContent = err.message;
    }
  }

  function getProductImage(p) {
    if (p.images && p.images.length > 0 && p.images[0]) return p.images[0];
    if (p.imageUrl) return p.imageUrl;
    if (p.image) return p.image;
    // Default fallback stock image if reseeded or missing
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';
  }

  function productCardHtml(p) {
    const imgUrl = getProductImage(p);
    return `
      <a class="product-card" href="#/products/${p._id}" aria-label="${escapeHtml(p.name)}">
        <div class="product-card-img">
          <img src="${imgUrl}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80';">
        </div>
        <div class="product-card-body">
          <div class="product-card-title">${escapeHtml(p.name)}</div>
          <div class="product-card-price">$${p.price.toFixed(2)}</div>
          <div class="product-card-desc">${escapeHtml(p.description)}</div>
        </div>
      </a>
    `;
  }

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadProducts, 300);
  });
  categorySelect.addEventListener('change', loadProducts);

  await loadProducts();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

addRoute('/', renderHome);
