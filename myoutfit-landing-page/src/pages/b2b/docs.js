import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Docs.module.scss';

export default function Docs() {
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <>
      <Head>
        <title>Documentación Técnica - MyOutfit for Business</title>
        <meta
          name="description"
          content="Guía completa de integración de MyOutfit: widget de recomendaciones, app de Shopify, API REST y más."
        />
      </Head>
      <Navigation />
      <main className={styles.docsMain}>
        <section className={styles.hero}>
          <div className="container">
            <div className="text-center">
              <h1 className={styles.heroTitle}>Documentación Técnica</h1>
              <p className={styles.heroSubtitle}>
                Guía completa para desarrolladores e integradores
              </p>
            </div>
          </div>
        </section>

        <section className={styles.docsSection}>
          <div className="container">
            <div className="row">
              {/* Sidebar */}
              <div className="col-lg-3 mb-4">
                <div className={styles.sidebar}>
                  <nav className={styles.sidebarNav}>
                    <button
                      className={`${styles.navItem} ${activeTab === 'getting-started' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('getting-started')}
                    >
                      Empezar
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'shopify-app' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('shopify-app')}
                    >
                      App Shopify
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'api-keys' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('api-keys')}
                    >
                      API Keys
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'widget' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('widget')}
                    >
                      Widget
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'api-endpoints' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('api-endpoints')}
                    >
                      API Endpoints
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'catalog-sync' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('catalog-sync')}
                    >
                      Sincronización
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('dashboard')}
                    >
                      Dashboard
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'best-practices' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('best-practices')}
                    >
                      Mejores Prácticas
                    </button>
                    <button
                      className={`${styles.navItem} ${activeTab === 'limits' ? styles.active : ''
                        }`}
                      onClick={() => setActiveTab('limits')}
                    >
                      Límites
                    </button>
                  </nav>
                </div>
              </div>

              {/* Content */}
              <div className="col-lg-9">
                <div className={styles.content}>
                  {/* Getting Started */}
                  {activeTab === 'getting-started' && (
                    <div>
                      <h2>Empezar con MyOutfit for Business</h2>
                      <p>
                        MyOutfit for Business es una solución de IA que genera recomendaciones
                        de outfits inteligentes para tu tienda online. Nuestro sistema analiza
                        tu catálogo y sugiere combinaciones de productos que aumentan el valor
                        medio del carrito (AOV) y las conversiones.
                      </p>

                      <h3>¿Qué es MyOutfit?</h3>
                      <p>
                        MyOutfit utiliza inteligencia artificial para crear outfits completos
                        basados en el producto que está viendo el cliente. Por ejemplo, si un
                        cliente ve una camiseta, el widget mostrará pantalones, zapatos y
                        accesorios complementarios que combinan perfectamente.
                      </p>

                      <h3>Opciones de Integración</h3>
                      <p>Ofrecemos dos métodos de integración según tu plataforma:</p>

                      <div className={styles.integrationCards}>
                        <div className={styles.integrationCard}>
                          <h4>🛒 App de Shopify (Recomendado)</h4>
                          <p>
                            Instalación en un clic desde la tienda de Shopify. Sincronización
                            automática de catálogo, widget nativo en tu tema, y analytics integrado.
                          </p>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setActiveTab('shopify-app')}
                          >
                            Ver Guía Shopify →
                          </button>
                        </div>
                        <div className={styles.integrationCard}>
                          <h4>🌐 Widget JavaScript</h4>
                          <p>
                            Para WooCommerce, Magento, PrestaShop u otras plataformas.
                            Integración manual con unas líneas de código JavaScript.
                          </p>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setActiveTab('widget')}
                          >
                            Ver Guía Widget →
                          </button>
                        </div>
                      </div>

                      <h3>Requisitos Previos</h3>
                      <ul>
                        <li><strong>Cuenta de MyOutfit:</strong> Regístrate en <Link href="/b2b/register">myoutfitapp.com/b2b/register</Link></li>
                        <li><strong>Catálogo de moda:</strong> Al menos 20 productos de ropa, calzado o accesorios</li>
                        <li><strong>Tienda online activa:</strong> Shopify, WooCommerce o cualquier plataforma con acceso al código</li>
                      </ul>

                      <h3>Flujo de Integración</h3>
                      <ol>
                        <li><strong>Registra tu cuenta</strong> → Obtén acceso al Dashboard y tu API Key</li>
                        <li><strong>Conecta tu tienda</strong> → Instala la app de Shopify o configura el widget manual</li>
                        <li><strong>Sincroniza productos</strong> → Nuestro sistema indexa y analiza tu catálogo</li>
                        <li><strong>Activa el widget</strong> → Las recomendaciones aparecen en tus páginas de producto</li>
                        <li><strong>Monitorea resultados</strong> → Analiza métricas en el Dashboard</li>
                      </ol>

                      <div className={styles.nextStep}>
                        <h4>🚀 Siguiente Paso</h4>
                        <p>
                          Si usas Shopify, te recomendamos empezar con la{' '}
                          <button className={styles.linkButton} onClick={() => setActiveTab('shopify-app')}>
                            App de Shopify
                          </button>.
                          Para otras plataformas, ve directamente a la sección{' '}
                          <button className={styles.linkButton} onClick={() => setActiveTab('widget')}>
                            Widget
                          </button>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shopify App */}
                  {activeTab === 'shopify-app' && (
                    <div>
                      <h2>App de Shopify - Outfit Completer</h2>
                      <p>
                        La app <strong>Outfit Completer</strong> es la forma más sencilla de integrar
                        MyOutfit en tu tienda Shopify. Instalación en un clic, sincronización
                        automática y widget nativo.
                      </p>

                      <h3>Instalación</h3>
                      <ol>
                        <li>Accede a la <a href="https://apps.shopify.com" target="_blank" rel="noopener noreferrer">Shopify App Store</a></li>
                        <li>Busca "Outfit Completer" o "MyOutfit"</li>
                        <li>Haz clic en "Añadir app" e inicia sesión en tu tienda</li>
                        <li>Acepta los permisos requeridos</li>
                        <li>La app sincronizará tu catálogo automáticamente</li>
                      </ol>

                      <h3>Configuración del Widget</h3>
                      <p>Una vez instalada la app, añade el widget a tus páginas de producto:</p>
                      <ol>
                        <li>Ve a <strong>Tienda Online → Temas → Personalizar</strong></li>
                        <li>Abre cualquier página de producto</li>
                        <li>En la columna izquierda, busca "Apps" o "Bloques de app"</li>
                        <li>Añade el bloque <strong>"Complete Your Look"</strong></li>
                        <li>Arrastra el bloque a la posición deseada (debajo del botón de comprar recomendado)</li>
                        <li>Guarda los cambios</li>
                      </ol>

                      <h3>Opciones de Personalización</h3>
                      <p>El widget tiene múltiples opciones configurables desde el editor de temas:</p>
                      <table className={styles.attributesTable}>
                        <thead>
                          <tr>
                            <th>Opción</th>
                            <th>Descripción</th>
                            <th>Valor por Defecto</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Título del Widget</strong></td>
                            <td>Texto principal del encabezado</td>
                            <td>"Completa tu Look"</td>
                          </tr>
                          <tr>
                            <td><strong>Mostrar Subtítulo</strong></td>
                            <td>Activa/desactiva texto descriptivo</td>
                            <td>Activado</td>
                          </tr>
                          <tr>
                            <td><strong>Texto del Subtítulo</strong></td>
                            <td>Descripción bajo el título</td>
                            <td>"Productos recomendados por IA"</td>
                          </tr>
                          <tr>
                            <td><strong>Máx. Recomendaciones</strong></td>
                            <td>Número de productos a mostrar</td>
                            <td>3</td>
                          </tr>
                          <tr>
                            <td><strong>Mostrar Precios</strong></td>
                            <td>Muestra precio de cada producto</td>
                            <td>Activado</td>
                          </tr>
                          <tr>
                            <td><strong>Etiqueta Producto Actual</strong></td>
                            <td>Texto sobre la imagen principal</td>
                            <td>"Tu selección"</td>
                          </tr>
                          <tr>
                            <td><strong>Etiqueta Total</strong></td>
                            <td>Texto antes del precio total</td>
                            <td>"Total del outfit:"</td>
                          </tr>
                          <tr>
                            <td><strong>Texto Botón Añadir</strong></td>
                            <td>Texto del botón principal</td>
                            <td>"Añadir outfit al carrito"</td>
                          </tr>
                          <tr>
                            <td><strong>Color Principal</strong></td>
                            <td>Color de acentos y botones</td>
                            <td>#8000f7</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3>Funcionamiento del Widget</h3>
                      <p>El widget de Shopify funciona así:</p>
                      <ol>
                        <li><strong>Carga:</strong> Al abrir una página de producto, el widget obtiene el ID del producto actual</li>
                        <li><strong>Consulta:</strong> Hace una petición a <code>/api/recommendations?shop=tutienda.myshopify.com&product_id=123</code></li>
                        <li><strong>Muestra:</strong> Renderiza el producto actual + las recomendaciones con iconos "+"</li>
                        <li><strong>Interacción:</strong> El cliente puede eliminar productos o hacer clic en ellos para ver detalles</li>
                        <li><strong>Añadir al Carrito:</strong> El botón "Añadir outfit" añade todos los productos seleccionados de una vez</li>
                      </ol>

                      <h3>Conectar con tu Dashboard</h3>
                      <p>Para sincronizar estadísticas con tu Dashboard de MyOutfit:</p>
                      <ol>
                        <li>Abre la app Outfit Completer en tu admin de Shopify</li>
                        <li>Ve a <strong>Configuración</strong></li>
                        <li>Copia tu API Key del Dashboard de MyOutfit</li>
                        <li>Pégala en el campo "API Key de MyOutfit"</li>
                        <li>Guarda los cambios</li>
                      </ol>
                      <p>Una vez conectado, tus estadísticas (clics, conversiones, AOV) aparecerán en el Dashboard.</p>

                      <div className={styles.warningBox}>
                        <strong>💡 Consejo:</strong> Después de la instalación inicial, la IA necesita
                        unos minutos para analizar tu catálogo y generar las primeras recomendaciones.
                        Si el widget muestra "Sin recomendaciones", espera unos minutos y recarga la página.
                      </div>
                    </div>
                  )}

                  {/* API Keys */}
                  {activeTab === 'api-keys' && (
                    <div>
                      <h2>API Keys</h2>
                      <p>
                        Tu API Key es el identificador único de tu tienda. Se utiliza para autenticar
                        todas las peticiones a la API de MyOutfit y para conectar la app de Shopify
                        con tu Dashboard.
                      </p>

                      <h3>Obtener tu API Key</h3>
                      <ol>
                        <li>Inicia sesión en tu <Link href="/dashboard">Dashboard</Link></li>
                        <li>Ve a la pestaña <strong>"Widget"</strong></li>
                        <li>Tu API Key aparece en la sección "Tu API Key"</li>
                        <li>Usa los botones para mostrar/ocultar y copiar la clave</li>
                      </ol>

                      <h3>Formato de la API Key</h3>
                      <p>Las API Keys de MyOutfit tienen el siguiente formato:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`mo_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

Partes:
- mo_      → Prefijo de MyOutfit
- live_    → Tipo de clave (live = producción)
- xxxx...  → 32 caracteres alfanuméricos únicos`}</code>
                      </pre>

                      <h3>Uso de la API Key</h3>
                      <p>
                        Incluye tu API Key en el header <code>Authorization</code> de todas las
                        peticiones a la API:
                      </p>
                      <pre className={styles.codeBlock}>
                        <code>{`// Header de autorización
Authorization: Bearer mo_live_xxxxxxxxxxxxxxxxxxxx

// Ejemplo con fetch
fetch('https://api.myoutfitapp.com/v1/recommendations', {
  headers: {
    'Authorization': 'Bearer mo_live_xxxxxxxxxxxxxxxxxxxx',
    'Content-Type': 'application/json'
  }
});

// Ejemplo con cURL
curl -H "Authorization: Bearer mo_live_xxxxxxxxxxxxxxxxxxxx" \\
     https://api.myoutfitapp.com/v1/recommendations?product_id=123`}</code>
                      </pre>

                      <h3>Seguridad</h3>
                      <div className={styles.warningBox}>
                        <strong>⚠️ Importante - Mantén tu API Key segura:</strong>
                        <ul>
                          <li><strong>Nunca expongas tu API Key en código del cliente</strong> (JavaScript del navegador)</li>
                          <li><strong>Usa variables de entorno</strong> para almacenar la clave en tu servidor</li>
                          <li><strong>No subas la clave a repositorios públicos</strong> (GitHub, GitLab, etc.)</li>
                          <li><strong>Regenera la clave</strong> si sospechas que ha sido comprometida</li>
                        </ul>
                      </div>

                      <h3>Regenerar API Key</h3>
                      <p>
                        Si necesitas regenerar tu API Key (por seguridad o cualquier otro motivo):
                      </p>
                      <ol>
                        <li>Ve a tu Dashboard → Widget</li>
                        <li>Haz clic en "Regenerar API Key"</li>
                        <li>La clave antigua dejará de funcionar inmediatamente</li>
                        <li>Actualiza la clave en todas tus integraciones</li>
                      </ol>
                    </div>
                  )}

                  {/* Widget */}
                  {activeTab === 'widget' && (
                    <div>
                      <h2>Widget JavaScript (Plataformas Custom)</h2>
                      <p>
                        Para tiendas que no usan Shopify (WooCommerce, Magento, PrestaShop, o custom),
                        puedes integrar el widget de MyOutfit mediante JavaScript.
                      </p>

                      <h3>Instalación Básica</h3>
                      <p>Añade este código en tus páginas de producto, preferiblemente antes de <code>{'</body>'}</code>:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`<!-- Widget MyOutfit -->
<script src="https://cdn.myoutfitapp.com/widget.js" async></script>

<!-- Contenedor del widget -->
<div 
  id="myoutfit-recommendations" 
  data-product-id="TU_PRODUCT_ID" 
  data-api-key="TU_API_KEY"
  data-theme="light"
  data-count="3"
></div>`}</code>
                      </pre>

                      <h3>Atributos del Widget</h3>
                      <table className={styles.attributesTable}>
                        <thead>
                          <tr>
                            <th>Atributo</th>
                            <th>Requerido</th>
                            <th>Descripción</th>
                            <th>Valores</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>data-product-id</code></td>
                            <td>✅ Sí</td>
                            <td>ID único del producto actual en tu sistema</td>
                            <td>String o número</td>
                          </tr>
                          <tr>
                            <td><code>data-api-key</code></td>
                            <td>✅ Sí</td>
                            <td>Tu API Key de MyOutfit</td>
                            <td>mo_live_xxx...</td>
                          </tr>
                          <tr>
                            <td><code>data-theme</code></td>
                            <td>No</td>
                            <td>Esquema de colores</td>
                            <td>"light" (defecto) o "dark"</td>
                          </tr>
                          <tr>
                            <td><code>data-count</code></td>
                            <td>No</td>
                            <td>Número de recomendaciones</td>
                            <td>1-5 (defecto: 3)</td>
                          </tr>
                          <tr>
                            <td><code>data-title</code></td>
                            <td>No</td>
                            <td>Título personalizado</td>
                            <td>"Combínalo con..."</td>
                          </tr>
                          <tr>
                            <td><code>data-lang</code></td>
                            <td>No</td>
                            <td>Idioma del widget</td>
                            <td>"es", "en", "pt" (defecto: "es")</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3>Integración Dinámica (SPAs)</h3>
                      <p>Si tu tienda es una Single Page Application (React, Vue, etc.), inicializa el widget manualmente:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`// Después de que el componente de producto se monte
window.MyOutfitWidget.init({
  container: '#myoutfit-recommendations',
  productId: '12345',
  apiKey: 'mo_live_xxxxxxxxxxxxxxxxxxxx',
  theme: 'light',
  count: 3,
  onReady: function() {
    console.log('Widget cargado');
  },
  onAddToCart: function(products) {
    // Implementa tu lógica de añadir al carrito
    products.forEach(p => addToCart(p.id, 1));
  }
});`}</code>
                      </pre>

                      <h3>Ejemplo WooCommerce</h3>
                      <pre className={styles.codeBlock}>
                        <code>{`<!-- En tu single-product.php o template de producto -->
<?php
  global $product;
  $product_id = $product->get_id();
?>

<div 
  id="myoutfit-recommendations" 
  data-product-id="<?php echo $product_id; ?>" 
  data-api-key="mo_live_xxxxxxxxxxxxxxxxxxxx"
  data-theme="light"
  data-count="3"
></div>

<script src="https://cdn.myoutfitapp.com/widget.js" async></script>`}</code>
                      </pre>

                      <h3>Personalización CSS</h3>
                      <p>Puedes sobrescribir los estilos del widget con CSS:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`/* Personalizar contenedor principal */
#myoutfit-recommendations {
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f8f9fa;
}

/* Personalizar título */
#myoutfit-recommendations .myoutfit-title {
  font-size: 1.5rem;
  color: #8000f7;
}

/* Personalizar items de recomendación */
#myoutfit-recommendations .myoutfit-item {
  border-radius: 8px;
  transition: transform 0.2s;
}

#myoutfit-recommendations .myoutfit-item:hover {
  transform: translateY(-4px);
}`}</code>
                      </pre>
                    </div>
                  )}

                  {/* API Endpoints */}
                  {activeTab === 'api-endpoints' && (
                    <div>
                      <h2>API REST</h2>
                      <p>
                        La API de MyOutfit permite sincronizar tu catálogo, obtener recomendaciones
                        y acceder a analítica. Todas las peticiones requieren autenticación.
                      </p>

                      <h3>Base URL</h3>
                      <pre className={styles.codeBlock}>
                        <code>{`https://api.myoutfitapp.com/v1`}</code>
                      </pre>

                      <h3>Autenticación</h3>
                      <pre className={styles.codeBlock}>
                        <code>{`Authorization: Bearer TU_API_KEY`}</code>
                      </pre>

                      <h3>Endpoints</h3>

                      <div className={styles.endpointCard}>
                        <h4>
                          <span className={styles.methodGet}>GET</span> /api/recommendations
                        </h4>
                        <p>Obtiene recomendaciones de outfit para un producto específico.</p>
                        <h5>Parámetros de Query:</h5>
                        <ul>
                          <li><code>shop</code> (requerido): Dominio de tu tienda (ej: mitienda.myshopify.com)</li>
                          <li><code>product_id</code> (requerido): ID del producto para el que quieres recomendaciones</li>
                          <li><code>session_id</code> (opcional): ID de sesión para tracking</li>
                          <li><code>track</code> (opcional): "false" para desactivar tracking</li>
                        </ul>
                        <pre className={styles.codeBlock}>
                          <code>{`// Request
GET /api/recommendations?shop=mitienda.myshopify.com&product_id=7890123456

// Response 200 OK
{
  "success": true,
  "data": {
    "id": "rec_abc123",
    "outfit_name": "Look Casual de Verano",
    "outfit_description": "Combinación perfecta para días cálidos",
    "products": [
      {
        "id": "prod_456",
        "shopify_product_id": "7890123457",
        "variant_id": "41234567890",
        "title": "Pantalón Chino Beige",
        "handle": "pantalon-chino-beige",
        "image_url": "https://cdn.shopify.com/...",
        "price": "49.99",
        "match_reason": "Combina con el estilo casual"
      },
      {
        "id": "prod_789",
        "shopify_product_id": "7890123458",
        "variant_id": "41234567891",
        "title": "Zapatillas Blancas",
        "handle": "zapatillas-blancas",
        "image_url": "https://cdn.shopify.com/...",
        "price": "79.99",
        "match_reason": "Complemento ideal de colores neutros"
      }
    ]
  }
}`}</code>
                        </pre>
                      </div>

                      <div className={styles.endpointCard}>
                        <h4>
                          <span className={styles.methodPost}>POST</span> /api/catalog/sync
                        </h4>
                        <p>Sincroniza tu catálogo de productos con MyOutfit.</p>
                        <pre className={styles.codeBlock}>
                          <code>{`// Request
POST /api/catalog/sync
Content-Type: application/json

{
  "products": [
    {
      "id": "PROD-001",
      "name": "Camiseta Básica Blanca",
      "price": 29.99,
      "category": "tops",
      "subcategory": "camisetas",
      "color": "white",
      "style": "casual",
      "gender": "unisex",
      "image_url": "https://tutienda.com/images/camiseta.jpg",
      "product_url": "https://tutienda.com/camiseta-basica",
      "in_stock": true,
      "variants": [
        { "id": "VAR-001-S", "size": "S", "stock": 10 },
        { "id": "VAR-001-M", "size": "M", "stock": 15 }
      ]
    }
  ]
}

// Response 200 OK
{
  "success": true,
  "synced": 150,
  "updated": 12,
  "errors": [],
  "message": "Catálogo sincronizado correctamente"
}`}</code>
                        </pre>
                      </div>

                      <div className={styles.endpointCard}>
                        <h4>
                          <span className={styles.methodGet}>GET</span> /api/analytics
                        </h4>
                        <p>Obtiene métricas de rendimiento de tus recomendaciones.</p>
                        <pre className={styles.codeBlock}>
                          <code>{`// Request
GET /api/analytics?start_date=2024-01-01&end_date=2024-01-31

// Response 200 OK
{
  "success": true,
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": {
    "total_impressions": 15420,
    "total_clicks": 1856,
    "total_conversions": 234,
    "conversion_rate": 12.6,
    "revenue_attributed": 8945.50,
    "aov_increase_percent": 18.5,
    "top_products": [
      { 
        "product_id": "123", 
        "name": "Pantalón Negro", 
        "recommendations": 450 
      }
    ],
    "top_combinations": [
      {
        "source": "Camiseta Blanca",
        "target": "Pantalón Negro",
        "count": 89
      }
    ]
  }
}`}</code>
                        </pre>
                      </div>

                      <h3>Códigos de Error</h3>
                      <table className={styles.attributesTable}>
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Solución</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>400</td>
                            <td>Parámetros faltantes o inválidos</td>
                            <td>Revisa los parámetros requeridos</td>
                          </tr>
                          <tr>
                            <td>401</td>
                            <td>API Key inválida o faltante</td>
                            <td>Verifica tu API Key en el Dashboard</td>
                          </tr>
                          <tr>
                            <td>404</td>
                            <td>Producto no encontrado</td>
                            <td>Sincroniza tu catálogo primero</td>
                          </tr>
                          <tr>
                            <td>429</td>
                            <td>Rate limit excedido</td>
                            <td>Espera un minuto y reintenta</td>
                          </tr>
                          <tr>
                            <td>500</td>
                            <td>Error interno del servidor</td>
                            <td>Contacta a soporte</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Catalog Sync */}
                  {activeTab === 'catalog-sync' && (
                    <div>
                      <h2>Sincronización de Catálogo</h2>
                      <p>
                        Para que MyOutfit genere recomendaciones precisas, necesita conocer tu
                        catálogo de productos. Hay varias formas de sincronizar según tu plataforma.
                      </p>

                      <h3>Método 1: App de Shopify (Automático)</h3>
                      <p>
                        Si usas la app de Shopify, la sincronización es automática:
                      </p>
                      <ul>
                        <li>Los productos se sincronizan al instalar la app</li>
                        <li>Los cambios se detectan mediante webhooks de Shopify</li>
                        <li>Nuevos productos, actualizaciones y eliminaciones son procesados automáticamente</li>
                        <li>El inventario (stock) se actualiza en tiempo real</li>
                      </ul>

                      <h3>Método 2: API REST</h3>
                      <p>Para otras plataformas, usa la API de sincronización:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`POST https://api.myoutfitapp.com/v1/catalog/sync
Authorization: Bearer TU_API_KEY
Content-Type: application/json

{
  "products": [
    {
      "id": "SKU-001",
      "name": "Vestido Floral Verano",
      "price": 59.99,
      "compare_at_price": 79.99,  // Precio tachado (opcional)
      "category": "dresses",
      "color": "blue",
      "style": "casual",
      "gender": "women",
      "season": "summer",
      "image_url": "https://...",
      "product_url": "https://...",
      "in_stock": true
    }
  ]
}`}</code>
                      </pre>

                      <h3>Método 3: Importación CSV</h3>
                      <p>Próximamente podrás subir un archivo CSV desde el Dashboard con el siguiente formato:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`id,name,price,category,color,style,gender,image_url,in_stock
SKU-001,Vestido Floral,59.99,dresses,blue,casual,women,https://...,true
SKU-002,Pantalón Slim,49.99,pants,black,casual,men,https://...,true
SKU-003,Zapatillas Running,89.99,shoes,white,sporty,unisex,https://...,false`}</code>
                      </pre>

                      <h3>Campos del Producto</h3>
                      <table className={styles.attributesTable}>
                        <thead>
                          <tr>
                            <th>Campo</th>
                            <th>Requerido</th>
                            <th>Descripción</th>
                            <th>Ejemplos</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>id</code></td>
                            <td>✅</td>
                            <td>Identificador único</td>
                            <td>SKU-001, 12345</td>
                          </tr>
                          <tr>
                            <td><code>name</code></td>
                            <td>✅</td>
                            <td>Nombre del producto</td>
                            <td>Camiseta Básica</td>
                          </tr>
                          <tr>
                            <td><code>price</code></td>
                            <td>✅</td>
                            <td>Precio numérico</td>
                            <td>29.99</td>
                          </tr>
                          <tr>
                            <td><code>category</code></td>
                            <td>✅</td>
                            <td>Categoría principal</td>
                            <td>tops, pants, shoes, accessories</td>
                          </tr>
                          <tr>
                            <td><code>color</code></td>
                            <td>Recomendado</td>
                            <td>Color principal</td>
                            <td>white, black, blue, red</td>
                          </tr>
                          <tr>
                            <td><code>style</code></td>
                            <td>Recomendado</td>
                            <td>Estilo del producto</td>
                            <td>casual, formal, sporty, boho</td>
                          </tr>
                          <tr>
                            <td><code>gender</code></td>
                            <td>Opcional</td>
                            <td>Género objetivo</td>
                            <td>men, women, unisex</td>
                          </tr>
                          <tr>
                            <td><code>image_url</code></td>
                            <td>✅</td>
                            <td>URL de la imagen</td>
                            <td>https://...</td>
                          </tr>
                          <tr>
                            <td><code>in_stock</code></td>
                            <td>Opcional</td>
                            <td>Disponibilidad</td>
                            <td>true, false</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className={styles.warningBox}>
                        <strong>💡 Consejo:</strong> Cuanta más información proporciones (color, estilo, temporada),
                        mejores serán las recomendaciones. La IA usa estos atributos para encontrar
                        combinaciones que realmente tienen sentido estilístico.
                      </div>
                    </div>
                  )}

                  {/* Dashboard */}
                  {activeTab === 'dashboard' && (
                    <div>
                      <h2>Dashboard de MyOutfit</h2>
                      <p>
                        El Dashboard es tu centro de control para gestionar productos, ver
                        estadísticas y configurar el widget.
                      </p>

                      <h3>Acceso al Dashboard</h3>
                      <ol>
                        <li>Ve a <Link href="/dashboard">myoutfitapp.com/dashboard</Link></li>
                        <li>Inicia sesión con tu email y contraseña</li>
                        <li>Si es tu primera vez, regístrate en <Link href="/b2b/register">/b2b/register</Link></li>
                      </ol>

                      <h3>Secciones del Dashboard</h3>

                      <h4>📊 Visión General</h4>
                      <p>Métricas principales de rendimiento:</p>
                      <ul>
                        <li><strong>Clics en Recomendaciones:</strong> Veces que los clientes han hecho clic en productos recomendados</li>
                        <li><strong>Conversiones:</strong> Compras que incluyeron productos recomendados</li>
                        <li><strong>AOV Promedio:</strong> Valor medio del carrito con recomendaciones</li>
                        <li><strong>Productos Sincronizados:</strong> Total de productos en tu catálogo</li>
                      </ul>

                      <h4>📦 Catálogo</h4>
                      <p>Gestión de productos:</p>
                      <ul>
                        <li>Ver todos los productos sincronizados</li>
                        <li>Estado de sincronización y última actualización</li>
                        <li>Botón para forzar sincronización manual</li>
                      </ul>

                      <h4>⚙️ Widget</h4>
                      <p>Configuración del widget:</p>
                      <ul>
                        <li>Tu API Key (copiar, mostrar/ocultar)</li>
                        <li>Código de integración para plataformas custom</li>
                        <li>Instrucciones para Shopify</li>
                        <li>Personalización visual (tema, colores, textos)</li>
                      </ul>

                      <h4>📈 Analítica</h4>
                      <p>Estadísticas detalladas:</p>
                      <ul>
                        <li>Gráficos de rendimiento por período</li>
                        <li>Top combinaciones de productos</li>
                        <li>Tasa de conversión por producto</li>
                        <li>Ingresos atribuidos a recomendaciones</li>
                      </ul>

                      <h4>💳 Facturación</h4>
                      <p>Gestión de suscripción:</p>
                      <ul>
                        <li>Plan actual y características</li>
                        <li>Uso del mes (productos, peticiones API)</li>
                        <li>Cambiar de plan</li>
                        <li>Método de pago</li>
                      </ul>

                      <h3>Perfil de Usuario</h3>
                      <p>
                        Haz clic en tu perfil (esquina inferior izquierda del sidebar) para abrir
                        la configuración de cuenta:
                      </p>
                      <ul>
                        <li>Cambiar nombre de la tienda</li>
                        <li>Configurar preferencias de idioma</li>
                        <li>Activar/desactivar notificaciones por email</li>
                      </ul>

                      <h3>Notificaciones</h3>
                      <p>
                        El icono de campana en la barra superior muestra notificaciones del sistema:
                      </p>
                      <ul>
                        <li>Sincronizaciones completadas</li>
                        <li>Alertas de uso cerca del límite</li>
                        <li>Nuevas características disponibles</li>
                      </ul>
                    </div>
                  )}

                  {/* Best Practices */}
                  {activeTab === 'best-practices' && (
                    <div>
                      <h2>Mejores Prácticas</h2>

                      <h3>Posicionamiento del Widget</h3>
                      <ul>
                        <li>
                          <strong>Debajo del botón "Añadir al carrito"</strong> - Es la posición más
                          efectiva. El cliente ya está considerando la compra.
                        </li>
                        <li>
                          <strong>Visible sin hacer scroll</strong> - Intenta que al menos el título
                          del widget sea visible sin bajar.
                        </li>
                        <li>
                          <strong>Evita ponerlo al final de la página</strong> - La mayoría de usuarios
                          no llegan tan abajo.
                        </li>
                      </ul>

                      <h3>Número de Recomendaciones</h3>
                      <ul>
                        <li><strong>2-3 productos es óptimo</strong> para la mayoría de tiendas</li>
                        <li><strong>4-5 productos</strong> solo si tienes un catálogo muy amplio y variado</li>
                        <li>Menos opciones = decisión más fácil = más conversiones</li>
                      </ul>

                      <h3>Calidad del Catálogo</h3>
                      <ul>
                        <li><strong>Imágenes de alta calidad:</strong> El widget muestra miniaturas, asegúrate de que se vean bien</li>
                        <li><strong>Categorías correctas:</strong> Una camiseta categorizada como "pantalón" romperá las recomendaciones</li>
                        <li><strong>Colores precisos:</strong> El color es uno de los principales criterios de matching</li>
                        <li><strong>Estilos consistentes:</strong> Usa términos consistentes (casual, formal, sporty)</li>
                      </ul>

                      <h3>Textos y Traducciones</h3>
                      <ul>
                        <li>Usa textos en el idioma de tu tienda</li>
                        <li>Prueba diferentes CTAs: "Completa tu look", "Combínalo con...", "Te puede gustar también"</li>
                        <li>Evita textos genéricos como "Productos relacionados"</li>
                      </ul>

                      <h3>Rendimiento</h3>
                      <ul>
                        <li>El widget carga de forma asíncrona y no bloquea tu página</li>
                        <li>Las recomendaciones se cachean 5 minutos en CDN</li>
                        <li>Si tienes problemas de velocidad, contacta a soporte</li>
                      </ul>

                      <h3>Testing y Optimización</h3>
                      <ul>
                        <li>Prueba el widget en diferentes dispositivos (móvil, tablet, desktop)</li>
                        <li>Revisa el Dashboard semanalmente para ver tendencias</li>
                        <li>Las combinaciones más populares te indican qué productos promocionar juntos</li>
                      </ul>
                    </div>
                  )}

                  {/* Limits */}
                  {activeTab === 'limits' && (
                    <div>
                      <h2>Límites y Planes</h2>
                      <p>
                        Los límites varían según tu plan de suscripción. Puedes ver tu uso actual
                        en el Dashboard → Facturación.
                      </p>

                      <h3>Comparativa de Planes</h3>
                      <table className={styles.limitsTable}>
                        <thead>
                          <tr>
                            <th>Característica</th>
                            <th>Starter</th>
                            <th>Pro</th>
                            <th>Enterprise</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Precio</strong></td>
                            <td>€29/mes</td>
                            <td>€149/mes</td>
                            <td>Contactar</td>
                          </tr>
                          <tr>
                            <td><strong>Productos</strong></td>
                            <td>Hasta 100</td>
                            <td>Hasta 5,000</td>
                            <td>Ilimitado</td>
                          </tr>
                          <tr>
                            <td><strong>Peticiones API/mes</strong></td>
                            <td>1,000</td>
                            <td>50,000</td>
                            <td>Ilimitado</td>
                          </tr>
                          <tr>
                            <td><strong>Rate Limit</strong></td>
                            <td>60/min</td>
                            <td>300/min</td>
                            <td>Personalizado</td>
                          </tr>
                          <tr>
                            <td><strong>Soporte</strong></td>
                            <td>Email</td>
                            <td>Email prioritario</td>
                            <td>Dedicado</td>
                          </tr>
                          <tr>
                            <td><strong>Analítica</strong></td>
                            <td>30 días</td>
                            <td>12 meses</td>
                            <td>Histórico completo</td>
                          </tr>
                          <tr>
                            <td><strong>Widget personalizable</strong></td>
                            <td>Básico</td>
                            <td>Avanzado</td>
                            <td>Totalmente custom</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3>Rate Limiting</h3>
                      <p>
                        Si superas el límite de peticiones por minuto, recibirás un error <code>429 Too Many Requests</code>:
                      </p>
                      <pre className={styles.codeBlock}>
                        <code>{`{
  "error": "Rate limit exceeded",
  "retry_after": 60
}`}</code>
                      </pre>
                      <p>Espera el tiempo indicado en <code>retry_after</code> (segundos) antes de reintentar.</p>

                      <h3>¿Qué pasa si supero el límite de productos?</h3>
                      <ul>
                        <li>No podrás sincronizar nuevos productos</li>
                        <li>Los productos existentes seguirán funcionando</li>
                        <li>Recibirás un email de aviso</li>
                        <li>Puedes actualizar tu plan en cualquier momento</li>
                      </ul>

                      <h3>¿Qué pasa si supero las peticiones API?</h3>
                      <ul>
                        <li>Las recomendaciones pueden mostrar resultados cacheados</li>
                        <li>Las peticiones adicionales devolverán error 429</li>
                        <li>El contador se reinicia el día 1 de cada mes</li>
                      </ul>

                      <h3>Actualizar tu Plan</h3>
                      <ol>
                        <li>Ve a Dashboard → Facturación</li>
                        <li>Haz clic en "Cambiar Plan"</li>
                        <li>Selecciona el nuevo plan</li>
                        <li>El cambio es inmediato y se prorratea</li>
                      </ol>

                      <div className={styles.warningBox}>
                        <strong>🎁 Prueba gratuita:</strong> Todas las cuentas nuevas incluyen 14 días
                        de prueba del plan Pro. No necesitas tarjeta de crédito para empezar.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
