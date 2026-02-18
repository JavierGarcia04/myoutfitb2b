import React, { useEffect, useCallback } from 'react';

const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
  : '';

/**
 * Widget embebible de MyOutfit - estilo "Complete Your Look" (Shopify).
 * Muestra producto actual + recomendaciones con total y botón añadir al carrito.
 *
 * Uso:
 * <div id="myoutfit-recommendations"
 *      data-product-id="PROD-123"
 *      data-api-key="TU_API_KEY"
 *      data-theme="light"
 *      data-count="2"
 *      data-title="Complete Your Look"
 *      data-subtitle="Combina estas prendas para un outfit perfecto">
 * </div>
 */
export default function MyOutfitWidget() {
  const loadRecommendations = useCallback(async (productId, apiKey, count, theme, title, subtitle, container) => {
    container.innerHTML = '<div class="myoutfit-widget-loading"><span class="myoutfit-spinner"></span><span>Cargando recomendaciones...</span></div>';

    try {
      const url = `${API_BASE}/api/recommendations?api_key=${encodeURIComponent(apiKey)}&product_id=${encodeURIComponent(productId)}&count=${count}`;
      const res = await fetch(url);
      const data = await res.json();
      const recommendations = data?.recommendations || [];
      const currentProduct = data?.current_product || null;

      const allProducts = [];
      if (currentProduct) allProducts.push({ ...currentProduct, isCurrent: true });
      const recLimit = currentProduct ? count - 1 : count;
      allProducts.push(...recommendations.slice(0, recLimit).map((p) => ({ ...p, isCurrent: false })));

      if (allProducts.length === 0) {
        renderEmptyState(container, theme, title);
        return;
      }

      renderWidget(container, allProducts, theme, title, subtitle);
    } catch (err) {
      console.error('MyOutfit Widget: Error cargando recomendaciones', err);
      renderErrorState(container, theme);
    }
  }, []);

  useEffect(() => {
    const widgetElements = document.querySelectorAll('[id="myoutfit-recommendations"]');

    widgetElements.forEach((element) => {
      const productId = element.getAttribute('data-product-id');
      const apiKey = element.getAttribute('data-api-key');
      const theme = element.getAttribute('data-theme') || 'light';
      const count = parseInt(element.getAttribute('data-count') || '2', 10);
      const title = element.getAttribute('data-title') || 'Complete Your Look';
      const subtitle = element.getAttribute('data-subtitle') || 'Combina estas prendas para un outfit perfecto';

      if (!productId || !apiKey) {
        element.innerHTML = '<p class="myoutfit-widget-error">MyOutfit: data-product-id y data-api-key son requeridos.</p>';
        return;
      }

      loadRecommendations(productId, apiKey, count, theme, title, subtitle, element);
    });
  }, [loadRecommendations]);

  return null;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderEmptyState(container, theme, title) {
  container.innerHTML = `
    <div class="myoutfit-widget myoutfit-widget--${theme}" data-theme="${theme}">
      <h3 class="myoutfit-widget__main-title">${escapeHtml(title)}</h3>
      <p class="myoutfit-widget__empty">No hay recomendaciones disponibles para este producto.</p>
    </div>
  `;
}

function renderErrorState(container, theme) {
  container.innerHTML = `
    <div class="myoutfit-widget myoutfit-widget--${theme}" data-theme="${theme}">
      <p class="myoutfit-widget__error">No se pudieron cargar las recomendaciones.</p>
    </div>
  `;
}

function renderWidget(container, allProducts, theme, title, subtitle) {
  const total = allProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

  const productCards = allProducts.map((p, i) => {
    const isCurrent = p.isCurrent;
    const cardClass = isCurrent ? 'myoutfit-widget__card myoutfit-widget__card--selected' : 'myoutfit-widget__card';
    const badge = isCurrent ? '<span class="myoutfit-widget__badge">TU SELECCIÓN</span>' : '';
    return `
      <a href="${escapeHtml(p.product_url || '#')}" class="${cardClass}" target="_blank" rel="noopener noreferrer">
        <div class="myoutfit-widget__img-wrap">
          <img src="${escapeHtml(p.image_url || '')}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.display='none'" />
          ${badge}
        </div>
        <div class="myoutfit-widget__card-info">
          <span class="myoutfit-widget__card-name">${escapeHtml(p.name)}</span>
          <span class="myoutfit-widget__card-price">€${(p.price || 0).toFixed(2)}</span>
        </div>
      </a>
    `;
  });

  const plusSigns = allProducts.length > 1 ? Array(allProducts.length - 1).fill('<span class="myoutfit-widget__plus">+</span>').join('') : '';
  const itemsHtml = productCards.reduce((acc, card, i) => {
    const plus = i < productCards.length - 1 ? '<span class="myoutfit-widget__plus">+</span>' : '';
    return acc + card + plus;
  }, '');

  container.innerHTML = `
    <div class="myoutfit-widget myoutfit-widget--${theme}" data-theme="${theme}">
      <h3 class="myoutfit-widget__main-title">${escapeHtml(title)}</h3>
      <p class="myoutfit-widget__subtitle">${escapeHtml(subtitle)}</p>
      <div class="myoutfit-widget__products">
        ${itemsHtml}
      </div>
      <div class="myoutfit-widget__footer">
        <span class="myoutfit-widget__total">Total del outfit: <strong>€${total.toFixed(2)}</strong></span>
        <button type="button" class="myoutfit-widget__btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          Añadir outfit al carrito
        </button>
      </div>
    </div>
  `;

  const btn = container.querySelector('.myoutfit-widget__btn');
  if (btn) {
    btn.addEventListener('click', () => {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('myoutfit-add-outfit', {
          detail: { products: allProducts },
        }));
      }
    });
  }
}
