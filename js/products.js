/**
 * Products Module
 * Handles loading skeletons, product cards rendering, modal content, and wishlist/comparison states.
 */

// Fallback SVG data URL placeholder for broken images
window.handleImgErr = (img) => {
  img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
};

// Generates stars HTML from average rating
const getStarIconsHTML = (rate) => {
  const rounded = Math.round(rate);
  return Array(5).fill(0).map((_, i) => 
    i < rounded ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>'
  ).join('');
};

// Card Image sub-component (keeps main function under 20 lines)
const getCardImageHTML = (p, isWish, isComp) => {
  const wishIcon = isWish ? 'fa-solid' : 'fa-regular';
  return `
    <div class="product-card-image">
      <img src="${p.image}" alt="${p.title}" onerror="handleImgErr(this)">
      <div class="product-card-actions">
        <button class="wishlist-btn ${isWish ? 'active' : ''}" data-id="${p.id}">
          <i class="${wishIcon} fa-heart"></i>
        </button>
        <button class="compare-checkbox ${isComp ? 'active' : ''}" data-id="${p.id}">
          <i class="fa-solid fa-scale-balanced"></i>
        </button>
      </div>
    </div>
  `;
};

// Card Body sub-component (keeps main function under 20 lines)
const getCardBodyHTML = (p) => `
  <div class="product-card-body">
    <div class="product-card-category">${p.category}</div>
    <h3 class="product-card-title">${p.title}</h3>
    <div class="product-card-rating">
      <div class="stars">${getStarIconsHTML(p.rating.rate)}</div>
      <span class="rating-value">${p.rating.rate}</span>
    </div>
  </div>
`;

// Creates product card HTML template
const createProductCardHTML = (p) => {
  const isWish = window.appState.wishlist.includes(p.id);
  const isComp = window.appState.compareList.some(item => item.id === p.id);
  return `
    <div class="product-card" data-id="${p.id}">
      ${getCardImageHTML(p, isWish, isComp)}
      ${getCardBodyHTML(p)}
      <div class="product-card-footer">
        <div class="product-card-price">$${p.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" data-id="${p.id}">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  `;
};

// Render skeletons with shimmer pulse
const renderSkeletons = (count = 8) => {
  const container = document.getElementById('product-grid-container');
  if (!container) return;
  container.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-image shimmer"></div>
      <div class="skeleton-body">
        <div class="skeleton-category shimmer"></div>
        <div class="skeleton-title shimmer"></div>
        <div class="skeleton-title-short shimmer"></div>
        <div class="skeleton-rating shimmer"></div>
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-price shimmer"></div>
        <div class="skeleton-button shimmer"></div>
      </div>
    </div>
  `).join('');
};

// Render active product grid
const renderProducts = (products) => {
  const container = document.getElementById('product-grid-container');
  if (!container) return;
  const total = products.length;
  const sliced = products.slice(0, window.appState.visibleCount);
  container.innerHTML = sliced.map(createProductCardHTML).join('');
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.classList.toggle('hidden', window.appState.visibleCount >= total);
  }
};

// Empty search or filter results
const renderEmptyState = () => {
  const container = document.getElementById('product-grid-container');
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <i class="fa-regular fa-face-frown empty-state-icon"></i>
      <h3 class="empty-state-title">No products found</h3>
      <p class="empty-state-text">We couldn't find anything matching your filters. Try search adjustments or clear filters.</p>
    </div>
  `;
  const btn = document.getElementById('load-more-btn');
  if (btn) btn.classList.add('hidden');
};

// API load error view
const renderErrorState = (msg) => {
  const container = document.getElementById('product-grid-container');
  if (!container) return;
  container.innerHTML = `
    <div class="error-state">
      <i class="fa-solid fa-triangle-exclamation error-state-icon"></i>
      <h3 class="error-state-title">Failed to load products</h3>
      <p class="error-state-text">${msg || 'Please check your connection and try again.'}</p>
      <button class="retry-btn" id="api-retry-btn">
        <i class="fa-solid fa-arrows-rotate"></i> Try Again
      </button>
    </div>
  `;
  const btn = document.getElementById('load-more-btn');
  if (btn) btn.classList.add('hidden');
};

// Detail Modal product body
const getModalInfoHTML = (p) => `
  <div class="modal-info">
    <div class="modal-category">${p.category}</div>
    <h2 class="modal-title">${p.title}</h2>
    <div class="modal-rating">
      <div class="stars">${getStarIconsHTML(p.rating.rate)}</div>
      <span class="rating-text">${p.rating.rate} stars · ${p.rating.count} reviews</span>
    </div>
    <div class="modal-price">$${p.price.toFixed(2)}</div>
    <p class="modal-description">${p.description}</p>
    <div class="quantity-selector">
      <button class="qty-btn" id="modal-qty-minus"><i class="fa-solid fa-minus"></i></button>
      <div class="qty-value" id="modal-qty-val">1</div>
      <button class="qty-btn" id="modal-qty-plus"><i class="fa-solid fa-plus"></i></button>
    </div>
    <button class="modal-add-to-cart" id="modal-add-btn" data-id="${p.id}">
      <i class="fa-solid fa-cart-shopping"></i> Add to Cart
    </button>
  </div>
`;

// Detail Modal parent layout
const renderModalDetails = (p) => {
  const container = document.getElementById('product-modal-content');
  if (!container) return;
  container.innerHTML = `
    <div class="modal-grid" data-id="${p.id}">
      <div class="modal-image">
        <img src="${p.image}" alt="${p.title}" onerror="handleImgErr(this)">
      </div>
      ${getModalInfoHTML(p)}
    </div>
  `;
};

// Render Wishlist grid view
const renderWishlistGrid = () => {
  const container = document.getElementById('wishlist-grid-container');
  if (!container) return;
  const items = window.appState.products.filter(p => 
    window.appState.wishlist.includes(p.id)
  );
  if (items.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <i class="fa-regular fa-heart wishlist-empty-icon"></i>
        <h3 class="wishlist-empty-text">Your wishlist is empty</h3>
        <p class="wishlist-empty-subtext">Click the heart icon on products to save them here.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = items.map(createProductCardHTML).join('');
};
