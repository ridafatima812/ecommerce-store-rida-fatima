/**
 * Main Application Module
 * Initializes global state, wires up handlers, registers event listeners, and manages routing.
 */

// Initialize standard responsive states
const initGlobalState = () => {
  window.appState = {
    products: [],
    filteredProducts: [],
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    compareList: [],
    searchQuery: '',
    activeCategory: 'all',
    sortOption: 'default',
    visibleCount: 8
  };
};

// Toggle navigation tabs
const switchTab = (tab) => {
  closeMobileMenu();
  const isShop = tab === 'shop';
  document.getElementById('shop-view')?.classList.toggle('hidden', !isShop);
  document.getElementById('wishlist-view')?.classList.toggle('hidden', isShop);
  document.getElementById('nav-shop')?.classList.toggle('active', isShop);
  document.getElementById('nav-wishlist')?.classList.toggle('active', !isShop);
  if (!isShop) renderWishlistGrid();
};

// Setup Header buttons and settings
const setupHeaderListeners = () => {
  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
  document.getElementById('cart-drawer-btn')?.addEventListener('click', () => {
    openModal('cart-drawer-overlay');
    document.getElementById('cart-drawer')?.classList.add('active');
  });
  document.getElementById('cart-close-btn')?.addEventListener('click', () => {
    closeModal('cart-drawer-overlay');
    document.getElementById('cart-drawer')?.classList.remove('active');
  });
  document.getElementById('mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);
  document.getElementById('logo-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('shop');
  });
  updateThemeIcon(localStorage.getItem('theme') || 'light');
};

// Handle category tags select
const handleCategoryClick = (e) => {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;
  window.appState.activeCategory = btn.dataset.category;
  window.appState.visibleCount = 8;
  renderCategoryButtons();
  applyAllFilters();
};

// Bind filters, searches and sorting selects
const setupFilterListeners = () => {
  const debounced = debounce((e) => {
    window.appState.searchQuery = e.target.value;
    window.appState.visibleCount = 8;
    applyAllFilters();
  }, 300);
  document.getElementById('search-input')?.addEventListener('input', debounced);
  document.getElementById('categories-container')?.addEventListener('click', handleCategoryClick);
  document.getElementById('sort-select')?.addEventListener('change', (e) => {
    window.appState.sortOption = e.target.value;
    applyAllFilters();
  });
  document.getElementById('clear-filters-btn')?.addEventListener('click', clearAllFilters);
};

// Wishlist trigger state toggle
const toggleWishlist = (id) => {
  const isWish = window.appState.wishlist.includes(id);
  if (isWish) {
    window.appState.wishlist = window.appState.wishlist.filter(item => item !== id);
    showToast('Removed from wishlist', 'info');
  } else {
    window.appState.wishlist.push(id);
    showToast('Added to wishlist', 'success');
  }
  localStorage.setItem('wishlist', JSON.stringify(window.appState.wishlist));
  applyAllFilters();
  renderWishlistGrid();
};

// Add / Remove from active comparisons list
const toggleComparison = (id) => {
  const idx = window.appState.compareList.findIndex(item => item.id === id);
  if (idx > -1) {
    window.appState.compareList.splice(idx, 1);
  } else {
    if (window.appState.compareList.length >= 3) {
      showToast('You can compare a maximum of 3 products.', 'warning');
      return;
    }
    const prod = window.appState.products.find(p => p.id === id);
    if (prod) window.appState.compareList.push(prod);
  }
  applyAllFilters();
  renderWishlistGrid();
  syncCompareFloatingBar();
};

// Updates comparison bar state
const syncCompareFloatingBar = () => {
  const bar = document.getElementById('compare-floating-bar');
  const count = document.getElementById('compare-count-badge');
  const btn = document.getElementById('compare-trigger-btn');
  if (!bar || !count || !btn) return;
  const len = window.appState.compareList.length;
  count.textContent = len;
  btn.disabled = len < 2;
  bar.classList.toggle('hidden', len === 0);
};

// Display product detail popup
const openDetailModal = (id) => {
  const product = window.appState.products.find(p => p.id === id);
  if (!product) return;
  renderModalDetails(product);
  openModal('product-modal-overlay');
};

// Route event clicks in grid wrapper
const handleGridClick = (e) => {
  const card = e.target.closest('.product-card');
  if (!card) return;
  const id = parseInt(card.dataset.id, 10);
  if (e.target.closest('.add-to-cart-btn')) {
    addToCart(id, 1);
  } else if (e.target.closest('.wishlist-btn')) {
    toggleWishlist(id);
  } else if (e.target.closest('.compare-checkbox')) {
    toggleComparison(id);
  } else {
    openDetailModal(id);
  }
};

// Setup delegation click bounds
const setupGridListeners = () => {
  document.getElementById('product-grid-container')?.addEventListener('click', handleGridClick);
  document.getElementById('wishlist-grid-container')?.addEventListener('click', handleGridClick);
  document.getElementById('product-modal-content')?.addEventListener('click', handleModalContentClick);
};

// Close modal overlays checks
const handleModalBackdropClick = (overlayId, e) => {
  if (e.target.id === overlayId) closeModal(overlayId);
};

// Register triggers for closing overlays
const setupModalListeners = () => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('product-modal-overlay');
      closeModal('checkout-modal-overlay');
      closeModal('compare-modal-overlay');
    }
  });
  document.getElementById('product-modal-overlay')?.addEventListener('click', (e) => handleModalBackdropClick('product-modal-overlay', e));
  document.getElementById('checkout-modal-overlay')?.addEventListener('click', (e) => handleModalBackdropClick('checkout-modal-overlay', e));
  document.getElementById('compare-modal-overlay')?.addEventListener('click', (e) => handleModalBackdropClick('compare-modal-overlay', e));
  document.getElementById('product-modal-close-btn')?.addEventListener('click', () => closeModal('product-modal-overlay'));
  document.getElementById('checkout-modal-close-btn')?.addEventListener('click', () => closeModal('checkout-modal-overlay'));
  document.getElementById('compare-modal-close-btn')?.addEventListener('click', () => closeModal('compare-modal-overlay'));
};

// Quantity selectors details modal listener
const handleModalContentClick = (e) => {
  const minus = e.target.closest('#modal-qty-minus');
  const plus = e.target.closest('#modal-qty-plus');
  const add = e.target.closest('#modal-add-btn');
  const valEl = document.getElementById('modal-qty-val');
  if (minus && valEl) {
    const val = parseInt(valEl.textContent, 10);
    if (val > 1) valEl.textContent = val - 1;
  } else if (plus && valEl) {
    valEl.textContent = parseInt(valEl.textContent, 10) + 1;
  } else if (add) {
    addToCart(parseInt(add.dataset.id, 10), valEl ? parseInt(valEl.textContent, 10) : 1);
    closeModal('product-modal-overlay');
  }
};

// Route clicks inside cart panel
const handleCartContentClick = (e) => {
  const minus = e.target.closest('.btn-qty-minus');
  const plus = e.target.closest('.btn-qty-plus');
  const remove = e.target.closest('.cart-item-remove');
  const cont = e.target.closest('#cart-continue-btn');
  if (minus) changeCartQuantity(parseInt(minus.dataset.id, 10), -1);
  if (plus) changeCartQuantity(parseInt(plus.dataset.id, 10), 1);
  if (remove) removeFromCart(parseInt(remove.dataset.id, 10));
  if (cont) {
    closeModal('cart-drawer-overlay');
    document.getElementById('cart-drawer')?.classList.remove('active');
  }
};

// Wires cart and confirmation dialog interactions
const setupCartListeners = () => {
  document.getElementById('cart-items-container')?.addEventListener('click', handleCartContentClick);
  document.getElementById('checkout-btn')?.addEventListener('click', handleCheckout);
  document.getElementById('checkout-summary-container')?.addEventListener('click', (e) => {
    if (e.target.closest('#order-confirm-ok-btn')) {
      closeModal('checkout-modal-overlay');
    }
  });
};

// Product comparison toolbar listener hooks
const setupCompareListeners = () => {
  document.getElementById('compare-trigger-btn')?.addEventListener('click', () => {
    renderComparisonTable(window.appState.compareList);
    openModal('compare-modal-overlay');
  });
  document.getElementById('compare-clear-btn')?.addEventListener('click', () => {
    window.appState.compareList = [];
    applyAllFilters();
    renderWishlistGrid();
    syncCompareFloatingBar();
    showToast('Comparison cleared', 'info');
  });
};

// General UI elements listener hooks
const setupGeneralListeners = () => {
  document.getElementById('load-more-btn')?.addEventListener('click', () => {
    window.appState.visibleCount += 8;
    applyAllFilters();
  });
  document.getElementById('nav-shop')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('shop');
  });
  document.getElementById('nav-wishlist')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('wishlist');
  });
};

// Fetch data pipeline with retry handlers
const loadProducts = async () => {
  renderSkeletons(8);
  try {
    const data = await fetchAllProducts();
    window.appState.products = data;
    window.appState.filteredProducts = [...data];
    renderCategoryButtons();
    applyAllFilters();
  } catch (err) {
    renderErrorState(err.message);
    document.getElementById('api-retry-btn')?.addEventListener('click', loadProducts);
  }
};

// Main bootloader
const initApp = () => {
  initGlobalState();
  setupHeaderListeners();
  setupFilterListeners();
  setupGridListeners();
  setupModalListeners();
  setupCartListeners();
  setupCompareListeners();
  setupGeneralListeners();
  updateCartBadge();
  renderCartDrawer();
  loadProducts();
};

document.addEventListener('DOMContentLoaded', initApp);
