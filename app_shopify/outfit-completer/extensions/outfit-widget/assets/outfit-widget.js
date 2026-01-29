/**
 * Outfit Completer Widget
 * Complete Your Look - Shows current product + recommendations with + signs
 */

(function () {
  'use strict';

  // Configuration
  const CONFIG = {
    appUrl: document.querySelector('meta[name="outfit-completer-app-url"]')?.content || '',
    get apiEndpoint() {
      return this.appUrl ? `${this.appUrl}/api/recommendations` : '/apps/outfit-completer/api/recommendations';
    },
    get trackEndpoint() {
      return this.appUrl ? `${this.appUrl}/api/track` : '/apps/outfit-completer/api/track';
    },
    currency: window.Shopify?.currency?.active || 'USD',
    moneyFormat: window.Shopify?.locale || 'en-US',
    shopDomain: window.Shopify?.shop || window.location.hostname,
  };

  // State
  let state = {
    currentProduct: null,
    recommendations: [],
    selectedProducts: [],
    isLoading: true,
    initialized: false,
  };

  /**
   * Initialize the widget
   */
  function init() {
    const widget = document.getElementById('outfit-completer-widget');
    if (!widget) return;

    // Reset state for new page
    state = {
      currentProduct: null,
      recommendations: [],
      selectedProducts: [],
      isLoading: true,
      initialized: false,
    };

    // Get current product data from widget attributes
    // Shopify prices in Liquid are in cents (e.g., 4500 = $45.00)
    const priceInCents = parseInt(widget.dataset.productPrice) || 0;

    state.currentProduct = {
      id: widget.dataset.productId,
      handle: widget.dataset.productHandle,
      title: widget.dataset.productTitle,
      image: widget.dataset.productImage,
      price: priceInCents, // Already in cents from Liquid
      variantId: widget.dataset.productVariantId,
    };

    console.log('[Outfit Widget] Current product:', state.currentProduct);

    // Get configuration
    const config = {
      productId: widget.dataset.productId,
      productType: widget.dataset.productType,
      productTags: widget.dataset.productTags,
      productVendor: widget.dataset.productVendor,
      maxRecommendations: parseInt(widget.dataset.maxRecommendations) || 3,
      showPrices: widget.dataset.showPrices === 'true',
    };

    // Fetch recommendations
    fetchRecommendations(widget, config);

    // Track widget impression
    trackEvent('widget_impression', {
      productId: config.productId,
    });

    state.initialized = true;
  }

  /**
   * Fetch product recommendations from the API
   */
  async function fetchRecommendations(widget, config) {
    showLoading(widget);

    try {
      const sessionId = getOrCreateSessionId();

      // Try our app API first
      let response = await fetch(`${CONFIG.apiEndpoint}?` + new URLSearchParams({
        shop: CONFIG.shopDomain,
        product_id: config.productId,
        product_type: config.productType,
        product_tags: config.productTags,
        vendor: config.productVendor,
        limit: config.maxRecommendations.toString(),
        session_id: sessionId,
      }));

      if (response.ok) {
        const data = await response.json();
        console.log('[Outfit Widget] App API response:', data);

        if (data.success && data.data?.products) {
          state.recommendations = data.data.products.map(p => {
            // Our API returns prices in DOLLARS (e.g., 20.00), convert to cents
            const priceInDollars = parseFloat(p.price) || 0;
            const priceInCents = Math.round(priceInDollars * 100);

            // Be resilient with variant ID property names
            const vId = p.variant_id || p.variantId || p.shopify_variant_id;

            console.log('[Outfit Widget] App API product conversion:', {
              title: p.title,
              variantId: vId
            });

            return {
              id: p.shopify_product_id || p.id,
              handle: p.handle,
              title: p.title,
              url: `/products/${p.handle}`,
              image: p.image_url || p.featuredImageUrl,
              price: priceInCents,
              variantId: vId ? String(vId) : null,
            };
          }).slice(0, config.maxRecommendations);
        }
      }

      // Fallback to Shopify's native recommendations
      if (!state.recommendations.length) {
        console.log('[Outfit Widget] Falling back to Shopify native API');
        const shopifyRecsUrl = `/recommendations/products.json?product_id=${config.productId}&limit=${config.maxRecommendations}&intent=related`;
        response = await fetch(shopifyRecsUrl);

        if (response.ok) {
          const data = await response.json();
          console.log('[Outfit Widget] Shopify API response:', data);

          state.recommendations = (data.products || [])
            .slice(0, config.maxRecommendations)
            .map(p => {
              // Shopify native API returns prices as strings in dollars (e.g., "20.00")
              // We need to convert to cents
              const variant = p.variants?.[0];
              let priceInCents = 0;

              if (variant?.price) {
                // Price is like "20.00" or "20" - convert to cents
                priceInCents = Math.round(parseFloat(variant.price) * 100);
              } else if (p.price) {
                priceInCents = Math.round(parseFloat(p.price) * 100);
              }

              console.log('[Outfit Widget] Product price conversion:', {
                title: p.title,
                originalPrice: variant?.price || p.price,
                priceInCents: priceInCents
              });

              return {
                id: String(p.id),
                handle: p.handle,
                title: p.title,
                url: `/products/${p.handle}`,
                image: p.featured_image || p.images?.[0],
                price: priceInCents,
                variantId: variant?.id ? String(variant.id) : null,
              };
            });
        }
      }

      console.log('[Outfit Widget] Final recommendations:', state.recommendations);

      if (state.recommendations.length > 0) {
        // Initialize selected products with all recommendations
        state.selectedProducts = [...state.recommendations];
        renderRecommendations(widget, config);
        setupEventListeners(widget, config);
        updateTotalPrice(widget);
        showContent(widget);
      } else {
        showEmpty(widget);
      }
    } catch (error) {
      console.error('[Outfit Widget] Error fetching recommendations:', error);
      showError(widget);
    }
  }

  /**
   * Render recommendations with + signs between them
   */
  function renderRecommendations(widget, config) {
    const container = widget.querySelector('.oc-outfit__recommendations');
    const template = document.getElementById('oc-recommendation-template');

    if (!container || !template) {
      console.error('[Outfit Widget] Container or template not found');
      return;
    }

    container.innerHTML = '';

    state.recommendations.forEach((product, index) => {
      // Add plus sign BEFORE each recommendation
      const plusDiv = document.createElement('div');
      plusDiv.className = 'oc-outfit__plus';
      plusDiv.dataset.forProduct = product.id;
      plusDiv.innerHTML = '<span>+</span>';
      container.appendChild(plusDiv);

      // Clone template content
      const fragment = template.content.cloneNode(true);

      // Get elements
      const item = fragment.querySelector('.oc-outfit__item');
      const link = fragment.querySelector('.oc-outfit__link');
      const img = fragment.querySelector('.oc-outfit__image');
      const title = fragment.querySelector('.oc-outfit__title');
      const price = fragment.querySelector('.oc-outfit__price');
      const removeBtn = fragment.querySelector('.oc-outfit__remove-btn');

      // Set data
      item.dataset.productId = product.id;
      item.dataset.variantId = product.variantId || '';
      item.dataset.price = product.price;
      link.href = product.url;
      img.src = product.image || 'https://via.placeholder.com/400x400?text=No+Image';
      img.alt = product.title;
      title.textContent = product.title;

      if (config.showPrices && product.price > 0) {
        price.textContent = formatMoney(product.price);
      } else {
        price.style.display = 'none';
      }

      // Remove button handler - prevent navigation
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromOutfit(widget, product);
      });

      // Track click on link only
      link.addEventListener('click', (e) => {
        // Don't navigate if clicking remove button
        if (e.target.closest('.oc-outfit__remove-btn')) {
          e.preventDefault();
          return;
        }
        trackEvent('product_click', {
          productId: product.id,
          position: index,
        });
      });

      container.appendChild(fragment);
    });
  }

  /**
   * Remove a product from the outfit
   */
  function removeFromOutfit(widget, product) {
    console.log('[Outfit Widget] Removing product:', product.id);

    // Remove from selected products
    state.selectedProducts = state.selectedProducts.filter(p => p.id !== product.id);

    // Find and hide the item in DOM
    const item = widget.querySelector(`.oc-outfit__item[data-product-id="${product.id}"]`);
    if (item) {
      item.style.display = 'none';
    }

    // Hide the corresponding plus sign
    const plusSign = widget.querySelector(`.oc-outfit__plus[data-for-product="${product.id}"]`);
    if (plusSign) {
      plusSign.style.display = 'none';
    }

    // Update total price
    updateTotalPrice(widget);

    // Update button state
    const addAllBtn = widget.querySelector('[data-add-all-btn]');
    if (addAllBtn && state.selectedProducts.length === 0) {
      // Still can add current product alone
    }
  }

  /**
   * Update the total price display
   */
  function updateTotalPrice(widget) {
    const totalPriceEl = widget.querySelector('[data-total-price]');
    if (!totalPriceEl) return;

    // Sum current product + selected recommendations (all in cents)
    const currentPrice = state.currentProduct?.price || 0;
    const recommendationsTotal = state.selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
    const total = currentPrice + recommendationsTotal;

    console.log('[Outfit Widget] Price calculation:', {
      currentPrice,
      recommendationsTotal,
      total,
      selectedCount: state.selectedProducts.length
    });

    totalPriceEl.textContent = formatMoney(total);
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners(widget, config) {
    // Add All to Cart button
    const addAllBtn = widget.querySelector('[data-add-all-btn]');
    if (addAllBtn) {
      // Remove any existing listeners
      const newBtn = addAllBtn.cloneNode(true);
      addAllBtn.parentNode.replaceChild(newBtn, addAllBtn);

      newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await addAllToCart(widget);
      });
    }

    // Retry button
    const retryBtn = widget.querySelector('.oc-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => fetchRecommendations(widget, config));
    }
  }

  /**
   * Add all products (current + selected recommendations) to cart
   */
  async function addAllToCart(widget) {
    const button = widget.querySelector('[data-add-all-btn]');
    if (!button || button.disabled) return;

    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <svg class="oc-spinner" width="20" height="20" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4"></circle>
      </svg>
      <span>Añadiendo...</span>
    `;

    try {
      // Helper to extract numeric ID from Shopify GID
      const getNumericId = (id) => {
        if (!id) return null;
        if (typeof id === 'number') return id;
        const idString = String(id);
        if (idString.includes('gid://')) {
          const parts = idString.split('/');
          return parseInt(parts[parts.length - 1]);
        }
        return parseInt(idString);
      };

      // Prepare items to add - Read from DOM for maximum reliability
      const items = [];

      // 1. Current product
      const currentItem = widget.querySelector('.oc-outfit__item--current');
      if (currentItem) {
        const vId = getNumericId(currentItem.dataset.variantId);
        if (vId && !isNaN(vId)) {
          items.push({ id: vId, quantity: 1 });
          console.log('[Outfit Widget] Adding current (from DOM):', vId);
        }
      }

      // 2. Recommendations (only if visible/selected)
      const recItems = widget.querySelectorAll('.oc-outfit__item--recommendation');
      recItems.forEach(item => {
        if (item.style.display !== 'none') {
          const vId = getNumericId(item.dataset.variantId);
          if (vId && !isNaN(vId)) {
            items.push({ id: vId, quantity: 1 });
            console.log('[Outfit Widget] Adding recommendation (from DOM):', vId);
          }
        }
      });

      console.log('[Outfit Widget] Final items to add:', items);

      if (items.length === 0) {
        throw new Error('No hay productos válidos para añadir');
      }

      // Track event
      trackEvent('add_outfit_to_cart', {
        productId: state.currentProduct?.id,
        itemCount: items.length
      });

      // Update UI
      button.style.background = '#27ae60';
      button.innerHTML = `<span>¡Añadiendo outfit...!</span>`;

      // Use Shopify AJAX API - it's the most compatible for multiple items
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items })
      });

      if (response.ok) {
        // Track success
        console.log('[Outfit Widget] Successfully added', items.length, 'items');

        // Reload current page to update cart drawer/count but keep user here
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('[Outfit Widget] Add to cart failed:', errorText);
        throw new Error(`No se pudo añadir al carrito. Inténtalo de nuevo.`);
      }

    } catch (error) {
      console.error('[Outfit Widget] Error adding to cart:', error);

      // Revert button state
      button.disabled = false;
      button.style.background = '#e74c3c';
      // Show actual error message to help debug if it's a "sold out" issue etc
      button.innerHTML = `<span style="font-size: 0.8em">Error: ${error.message.substring(0, 20)}...</span>`;

      setTimeout(() => {
        button.style.background = '';
        button.innerHTML = originalContent;
      }, 3000);
    }
  }

  /**
   * Update cart counter in the header
   */
  async function updateCartCounter() {
    try {
      const response = await fetch('/cart.js');
      if (response.ok) {
        const cart = await response.json();
        console.log('[Outfit Widget] Cart updated:', cart.item_count, 'items');

        // Common cart counter selectors
        const selectors = [
          '.cart-count',
          '.cart-item-count',
          '#cart-count',
          '[data-cart-count]',
          '.header__cart-count',
          '.site-header__cart-count',
          '.cart-count-bubble span',
          '.cart-count-bubble',
          '#CartCount',
          '.js-cart-count',
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.textContent = cart.item_count;
            el.setAttribute('data-cart-count', cart.item_count);
          });
        });

        // Dispatch custom events that themes might listen to
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
        document.dispatchEvent(new CustomEvent('cart:refresh'));

        // Try to trigger theme-specific cart updates
        if (window.theme?.Cart?.updateCounts) {
          window.theme.Cart.updateCounts();
        }
      }
    } catch (error) {
      console.log('[Outfit Widget] Could not update cart counter');
    }
  }

  /**
   * Track analytics event
   */
  async function trackEvent(eventType, data) {
    try {
      await fetch(CONFIG.trackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          shop: CONFIG.shopDomain,
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Format money - converts cents to display currency
   */
  function formatMoney(cents) {
    if (typeof cents === 'string') {
      cents = parseInt(cents);
    }

    if (isNaN(cents) || cents === 0) {
      return formatCurrency(0);
    }

    // Convert cents to dollars/euros
    const amount = cents / 100;

    return formatCurrency(amount);
  }

  /**
   * Format currency with proper locale
   */
  function formatCurrency(amount) {
    try {
      return new Intl.NumberFormat(CONFIG.moneyFormat, {
        style: 'currency',
        currency: CONFIG.currency,
      }).format(amount);
    } catch (e) {
      // Fallback formatting
      return `$${amount.toFixed(2)}`;
    }
  }

  /**
   * Get or create session ID
   */
  function getOrCreateSessionId() {
    const storageKey = 'outfit_completer_session';
    let sessionId = sessionStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = 'oc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  }

  // State display functions
  function showLoading(widget) {
    const loading = widget.querySelector('.oc-loading');
    const content = widget.querySelector('.oc-content');
    const empty = widget.querySelector('.oc-empty');
    const error = widget.querySelector('.oc-error');

    if (loading) loading.style.display = 'flex';
    if (content) content.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (error) error.style.display = 'none';
  }

  function showContent(widget) {
    const loading = widget.querySelector('.oc-loading');
    const content = widget.querySelector('.oc-content');
    const empty = widget.querySelector('.oc-empty');
    const error = widget.querySelector('.oc-error');

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'block';
    if (empty) empty.style.display = 'none';
    if (error) error.style.display = 'none';
  }

  function showEmpty(widget) {
    const loading = widget.querySelector('.oc-loading');
    const content = widget.querySelector('.oc-content');
    const empty = widget.querySelector('.oc-empty');
    const error = widget.querySelector('.oc-error');

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    if (error) error.style.display = 'none';
  }

  function showError(widget) {
    const loading = widget.querySelector('.oc-loading');
    const content = widget.querySelector('.oc-content');
    const empty = widget.querySelector('.oc-empty');
    const error = widget.querySelector('.oc-error');

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'none';
    if (empty) empty.style.display = 'none';
    if (error) error.style.display = 'flex';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize for Shopify theme navigation (AJAX navigation)
  document.addEventListener('shopify:section:load', init);
  document.addEventListener('theme:loaded', init);
  document.addEventListener('page:loaded', init);
  document.addEventListener('turbolinks:load', init);
  document.addEventListener('turbo:load', init);

  // Watch for URL changes (single page apps)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('[Outfit Widget] URL changed, reinitializing...');
      setTimeout(init, 100);
    }
  }).observe(document.body, { subtree: true, childList: true });

})();
