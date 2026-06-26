/**
 * Filters Module
 * Handles search input debouncing, category tags generation, sort logic, clear buttons, and counts.
 */

// Closure-based custom debounce function (no external libraries)
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

// Extract unique categories using only array filter & map
const getUniqueCategories = (products) => {
  return ['all', ...products.map(p => p.category).filter((v, i, s) => s.indexOf(v) === i)];
};

// Generates dynamic category buttons list
const renderCategoryButtons = () => {
  const container = document.getElementById('categories-container');
  if (!container) return;
  const categories = getUniqueCategories(window.appState.products);
  container.innerHTML = categories.map(cat => {
    const active = window.appState.activeCategory === cat ? 'active' : '';
    return `<button class="category-btn ${active}" data-category="${cat}">${cat}</button>`;
  }).join('');
};

// Sorting helper using array sort
const sortProducts = (products, option) => {
  const list = [...products];
  if (option === 'price-asc') return list.sort((a, b) => a.price - b.price);
  if (option === 'price-desc') return list.sort((a, b) => b.price - a.price);
  if (option === 'rating-desc') return list.sort((a, b) => b.rating.rate - a.rating.rate);
  if (option === 'name-asc') return list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
};

// Updates the dynamic text above grid
const updateProductCount = (count) => {
  const display = document.getElementById('product-count-display');
  if (display) {
    display.innerHTML = `Showing <span>${count}</span> products`;
  }
};

// Main processing pipeline applying filters simultaneously
const applyAllFilters = () => {
  let result = [...window.appState.products];
  if (window.appState.activeCategory !== 'all') {
    result = result.filter(p => p.category === window.appState.activeCategory);
  }
  if (window.appState.searchQuery) {
    const query = window.appState.searchQuery.toLowerCase();
    result = result.filter(p => p.title.toLowerCase().includes(query));
  }
  result = sortProducts(result, window.appState.sortOption);
  window.appState.filteredProducts = result;
  updateProductCount(result.length);
  if (result.length === 0) {
    renderEmptyState();
  } else {
    renderProducts(result);
  }
};

// Clear filters back to initial state
const clearAllFilters = () => {
  window.appState.searchQuery = '';
  window.appState.activeCategory = 'all';
  window.appState.sortOption = 'default';
  window.appState.visibleCount = 8;
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  const select = document.getElementById('sort-select');
  if (select) select.value = 'default';
  renderCategoryButtons();
  applyAllFilters();
};
