/**
 * Cart Module
 * Manages shopping cart array state, localStorage syncing, quantities, checkout, and drawer rendering.
 */

// Saves current cart to localStorage
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(window.appState.cart));
};

// Calculates total of all items in cart
const calculateSubtotal = () => {
  return window.appState.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
};

// Syncs header badge counter state
const updateCartBadge = () => {
  const badge = document.getElementById('cart-badge-count');
  if (!badge) return;
  const count = window.appState.cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
};

// Adds items to shopping cart
const addToCart = (productId, qty = 1) => {
  const product = window.appState.products.find(p => p.id === productId);
  if (!product) return;
  const existing = window.appState.cart.find(item => item.product.id === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    window.appState.cart.push({ product, quantity: qty });
  }
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast(`${product.title.slice(0, 20)}... added!`, 'success');
};

// Removes items completely from shopping cart
const removeFromCart = (productId) => {
  window.appState.cart = window.appState.cart.filter(item => item.product.id !== productId);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast('Item removed from cart', 'info');
};

// Adjust quantity with +/- checks
const changeCartQuantity = (productId, delta) => {
  const item = window.appState.cart.find(i => i.product.id === productId);
  if (!item) return;
  const nextQty = item.quantity + delta;
  if (nextQty < 1) return;
  item.quantity = nextQty;
  saveCart();
  updateCartBadge();
  renderCartDrawer();
};

// Cart Item templates generator
const createCartItemHTML = (item) => `
  <div class="cart-item">
    <div class="cart-item-image">
      <img src="${item.product.image}" alt="${item.product.title}" onerror="handleImgErr(this)">
    </div>
    <div class="cart-item-info">
      <h4 class="cart-item-title">${item.product.title}</h4>
      <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn btn-qty-minus" data-id="${item.product.id}"><i class="fa-solid fa-minus"></i></button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="cart-qty-btn btn-qty-plus" data-id="${item.product.id}"><i class="fa-solid fa-plus"></i></button>
      </div>
    </div>
    <button class="cart-item-remove" data-id="${item.product.id}"><i class="fa-solid fa-xmark"></i></button>
  </div>
`;

// Render main sidebar drawer container
const renderCartDrawer = () => {
  const container = document.getElementById('cart-items-container');
  const footer = document.getElementById('cart-drawer-footer');
  if (!container || !footer) return;
  if (window.appState.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-basket-shopping cart-empty-icon"></i>
        <h3 class="cart-empty-text">Your cart is empty</h3>
        <p class="cart-empty-subtext">Add items from the store to begin shopping.</p>
        <button class="continue-shopping-btn" id="cart-continue-btn">Continue Shopping</button>
      </div>
    `;
    footer.classList.add('hidden');
    return;
  }
  container.innerHTML = window.appState.cart.map(createCartItemHTML).join('');
  footer.classList.remove('hidden');
  document.getElementById('cart-subtotal-display').textContent = `$${calculateSubtotal().toFixed(2)}`;
};

// Inner list order confirmation item template
const getOrderItemHTML = (item) => `
  <div class="order-item">
    <div class="order-item-image">
      <img src="${item.product.image}" alt="${item.product.title}" onerror="handleImgErr(this)">
    </div>
    <div class="order-item-details">
      <h4 class="order-item-title">${item.product.title}</h4>
      <span class="order-item-qty">Qty: ${item.quantity}</span>
    </div>
    <div class="order-item-price">$${(item.product.price * item.quantity).toFixed(2)}</div>
  </div>
`;

// Wrapper order template injector
const createOrderSummaryHTML = () => {
  const listHTML = window.appState.cart.map(getOrderItemHTML).join('');
  return `
    <div class="order-success-icon"><i class="fa-solid fa-circle-check"></i></div>
    <h3 class="order-title">Order Confirmed!</h3>
    <div class="order-items">${listHTML}</div>
    <div class="order-total">
      <span>Total Paid:</span>
      <span class="total-amount">$${calculateSubtotal().toFixed(2)}</span>
    </div>
    <button class="order-close-btn" id="order-confirm-ok-btn">OK</button>
  `;
};

// Checkout flow triggers confirmation modal
const handleCheckout = () => {
  const container = document.getElementById('checkout-summary-container');
  if (!container) return;
  container.innerHTML = createOrderSummaryHTML();
  openModal('checkout-modal-overlay');
  window.appState.cart = [];
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  closeModal('cart-drawer-overlay');
  document.getElementById('cart-drawer').classList.remove('active');
};
