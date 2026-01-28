import React, { useEffect, useState } from 'react';

/**
 * Widget embebible de MyOutfit para recomendaciones de outfits
 * 
 * Uso:
 * <div id="myoutfit-recommendations" 
 *      data-product-id="PROD-123" 
 *      data-api-key="TU_API_KEY"
 *      data-theme="light"
 *      data-count="3">
 * </div>
 */
export default function MyOutfitWidget() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Buscar todos los elementos con el ID del widget
    const widgetElements = document.querySelectorAll('[id="myoutfit-recommendations"]');
    
    widgetElements.forEach((element) => {
      const productId = element.getAttribute('data-product-id');
      const apiKey = element.getAttribute('data-api-key');
      const theme = element.getAttribute('data-theme') || 'light';
      const count = parseInt(element.getAttribute('data-count') || '3');

      if (!productId || !apiKey) {
        console.error('MyOutfit Widget: data-product-id y data-api-key son requeridos');
        return;
      }

      // Cargar recomendaciones
      loadRecommendations(productId, apiKey, count, theme, element);
    });
  }, []);

  const loadRecommendations = async (productId, apiKey, count, theme, container) => {
    try {
      setLoading(true);
      
      // En producción, esto llamaría a tu API real
      // const response = await fetch(
      //   `https://api.myoutfitapp.com/v1/api/b2b/recommendations?product_id=${productId}&count=${count}`,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${apiKey}`
      //     }
      //   }
      // );
      // const data = await response.json();

      // Simulación de datos para demo
      const mockRecommendations = [
        {
          product_id: 'PROD-456',
          name: 'Pantalón Negro Slim',
          price: 49.99,
          image_url: '👖',
          match_score: 0.92,
        },
        {
          product_id: 'PROD-789',
          name: 'Zapatillas Blancas',
          price: 79.99,
          image_url: '👟',
          match_score: 0.88,
        },
        {
          product_id: 'PROD-101',
          name: 'Chaqueta Azul',
          price: 89.99,
          image_url: '🧥',
          match_score: 0.85,
        },
      ].slice(0, count);

      // Renderizar widget en el contenedor
      renderWidget(container, mockRecommendations, theme);
      
      setLoading(false);
    } catch (err) {
      console.error('Error cargando recomendaciones:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const renderWidget = (container, recommendations, theme) => {
    const isDark = theme === 'dark';
    const widgetHTML = `
      <div class="myoutfit-widget ${isDark ? 'myoutfit-widget-dark' : 'myoutfit-widget-light'}" style="
        padding: 2rem;
        border-radius: 12px;
        margin-top: 2rem;
        border: 2px solid ${isDark ? '#495057' : '#e9ecef'};
        background: ${isDark ? '#212529' : 'white'};
      ">
        <h4 style="
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #8000f7ff;
        ">Combínalo con...</h4>
        <div class="myoutfit-recommendations" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        ">
          ${recommendations
            .map(
              (rec) => `
            <div class="myoutfit-recommendation-item" style="
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 1rem;
              background: ${isDark ? '#343a40' : '#f8f9fa'};
              border-radius: 8px;
              cursor: pointer;
              transition: transform 0.2s, box-shadow 0.2s;
            " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 4px 12px rgba(128, 0, 247, 0.2)'" onmouseout="this.style.transform=''; this.style.boxShadow=''">
              <div style="
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #8000f7ff 0%, #9b51e0 100%);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                flex-shrink: 0;
              ">${rec.image_url}</div>
              <div style="flex: 1;">
                <h5 style="
                  font-size: 1rem;
                  font-weight: 600;
                  margin: 0 0 0.25rem 0;
                  color: ${isDark ? 'white' : '#212529'};
                ">${rec.name}</h5>
                <p style="
                  font-size: 0.9rem;
                  color: #8000f7ff;
                  margin: 0;
                  font-weight: 600;
                ">€${rec.price.toFixed(2)}</p>
              </div>
              <button style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 2px solid #8000f7ff;
                background: transparent;
                color: #8000f7ff;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0;
              " onclick="console.log('Añadir al carrito:', '${rec.product_id}')">+</button>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;

    container.innerHTML = widgetHTML;
  };

  return null; // Este componente no renderiza nada directamente, modifica el DOM
}

// Auto-inicialización cuando se carga el script
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // El widget se inicializará cuando se monte el componente React
    });
  }
}


