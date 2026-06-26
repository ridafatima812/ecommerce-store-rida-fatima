/**
 * UI Module
 * Handles themes, modals, drawer status, and custom notification toasts.
 */

// 1. Theme Immediate Setup (No FOUC)
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Theme toggle logic
const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);
  updateThemeIcon(nextTheme);
};

const updateThemeIcon = (theme) => {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
};

// Custom Notifications Toast System
const showToast = (message, type = 'success') => {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `notification notification-${type}`;
  toast.innerHTML = `
    <div class="notification-content">
      <i class="${getToastIcon(type)}"></i>
      <span>${message}</span>
    </div>
    <div class="notification-progress"></div>
  `;
  
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => removeToast(toast), 3000);
};

const getToastIcon = (type) => {
  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
    warning: 'fa-regular fa-bell'
  };
  return icons[type] || icons.info;
};

const removeToast = (toast) => {
  toast.classList.remove('show');
  setTimeout(() => toast.remove(), 450);
};

// Modal handlers
const openModal = (overlayId) => {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeModal = (overlayId) => {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove('active');
  document.body.style.overflow = '';
};

// Setup mobile hamburger and nav items
const toggleMobileMenu = () => {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('mobile-menu-btn');
  if (nav && btn) {
    nav.classList.toggle('active');
    btn.classList.toggle('active');
  }
};

const closeMobileMenu = () => {
  const nav = document.getElementById('main-nav');
  const btn = document.getElementById('mobile-menu-btn');
  if (nav && btn) {
    nav.classList.remove('active');
    btn.classList.remove('active');
  }
};

// Render comparison modal side-by-side
const renderComparisonTable = (compareList) => {
  const container = document.getElementById('compare-grid-container');
  if (!container) return;
  
  // Set comparison grid class based on count
  container.className = `compare-grid cols-${compareList.length}`;
  container.innerHTML = compareList.map(item => `
    <div class="compare-product" data-id="${item.id}">
      <div class="compare-product-image">
        <img src="${item.image}" alt="${item.title}" onerror="handleImgErr(this)">
      </div>
      <h4 class="compare-product-title">${item.title}</h4>
      <div class="compare-product-category">${item.category}</div>
      <div class="compare-product-price">$${item.price.toFixed(2)}</div>
      <div class="compare-product-rating">
        <div class="stars">${getStarIcons(item.rating.rate)}</div>
        <span>(${item.rating.rate})</span>
      </div>
      <p class="compare-product-desc">${item.description}</p>
    </div>
  `).join('');
};

// Helper for rendering rating stars in comparison
const getStarIcons = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  return `${'★'.repeat(fullStars)}${halfStar ? '½' : ''}${'☆'.repeat(emptyStars)}`;
};
