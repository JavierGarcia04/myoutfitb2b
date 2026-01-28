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
        <title>Documentación - MyOutfit for Business</title>
        <meta
          name="description"
          content="Documentación técnica completa para integrar MyOutfit for Business en tu tienda online."
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
                      className={`${styles.navItem} ${
                        activeTab === 'getting-started' ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab('getting-started')}
                    >
                      Empezar
                    </button>
                    <button
                      className={`${styles.navItem} ${
                        activeTab === 'api-keys' ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab('api-keys')}
                    >
                      API Keys
                    </button>
                    <button
                      className={`${styles.navItem} ${
                        activeTab === 'widget' ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab('widget')}
                    >
                      Widget
                    </button>
                    <button
                      className={`${styles.navItem} ${
                        activeTab === 'api-endpoints' ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab('api-endpoints')}
                    >
                      API Endpoints
                    </button>
                    <button
                      className={`${styles.navItem} ${
                        activeTab === 'catalog-sync' ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab('catalog-sync')}
                    >
                      Sincronización
                    </button>
                    <button
                      className={`${styles.navItem} ${
                        activeTab === 'best-practices' ? styles.active : ''
                      }`}
                      onClick={() => setActiveTab('best-practices')}
                    >
                      Mejores Prácticas
                    </button>
                    <button
                      className={`${styles.navItem} ${
                        activeTab === 'limits' ? styles.active : ''
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
                        Bienvenido a la documentación de MyOutfit for Business. Esta guía te ayudará
                        a integrar nuestro widget de recomendaciones de outfits en tu tienda online.
                      </p>

                      <h3>Requisitos previos</h3>
                      <ul>
                        <li>Una cuenta de MyOutfit for Business (puedes crearla en el dashboard)</li>
                        <li>Acceso a tu tienda online (Shopify, WooCommerce, o plataforma custom)</li>
                        <li>Conocimientos básicos de HTML/JavaScript</li>
                      </ul>

                      <h3>Flujo de integración</h3>
                      <ol>
                        <li>Crea una cuenta y obtén tu API Key</li>
                        <li>Sincroniza tu catálogo de productos</li>
                        <li>Añade el widget a tus páginas de producto</li>
                        <li>Configura el widget desde tu dashboard</li>
                        <li>Monitorea métricas y optimiza</li>
                      </ol>

                      <div className={styles.nextStep}>
                        <h4>Siguiente paso</h4>
                        <p>
                          <Link href="#api-keys">Obtén tu API Key →</Link>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* API Keys */}
                  {activeTab === 'api-keys' && (
                    <div>
                      <h2>API Keys</h2>
                      <p>
                        Tu API Key es única para tu tienda y se usa para autenticar todas las
                        peticiones a nuestra API.
                      </p>

                      <h3>Obtener tu API Key</h3>
                      <ol>
                        <li>Inicia sesión en tu <Link href="/dashboard">dashboard</Link></li>
                        <li>Ve a la sección "Configuración" → "API Keys"</li>
                        <li>Copia tu API Key (se muestra solo una vez por seguridad)</li>
                      </ol>

                      <h3>Usar tu API Key</h3>
                      <p>
                        Incluye tu API Key en todas las peticiones a nuestra API usando el header
                        de autorización:
                      </p>
                      <pre className={styles.codeBlock}>
                        <code>{`Authorization: Bearer TU_API_KEY_AQUI`}</code>
                      </pre>

                      <h3>Seguridad</h3>
                      <div className={styles.warningBox}>
                        <strong>⚠️ Importante:</strong>
                        <ul>
                          <li>Nunca expongas tu API Key en código del lado del cliente</li>
                          <li>Usa variables de entorno para almacenar tu API Key</li>
                          <li>Si tu API Key se compromete, revócala inmediatamente desde el dashboard</li>
                          <li>El widget embebible usa un método seguro que no expone tu API Key</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Widget */}
                  {activeTab === 'widget' && (
                    <div>
                      <h2>Integración del Widget</h2>
                      <p>
                        El widget de MyOutfit se integra fácilmente en cualquier página de producto
                        con solo unas líneas de código.
                      </p>

                      <h3>Instalación básica</h3>
                      <p>Añade este código antes del cierre de la etiqueta {'</body>'} en tu página de producto:</p>
                      <pre className={styles.codeBlock}>
                        <code>{`<!-- Widget MyOutfit -->
<script src="https://myoutfitapp.com/widget.js"></script>
<div 
  id="myoutfit-recommendations" 
  data-product-id="12345" 
  data-api-key="TU_API_KEY"
  data-theme="light"
  data-count="3"
></div>`}</code>
                      </pre>

                      <h3>Atributos del widget</h3>
                      <table className={styles.attributesTable}>
                        <thead>
                          <tr>
                            <th>Atributo</th>
                            <th>Requerido</th>
                            <th>Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><code>data-product-id</code></td>
                            <td>Sí</td>
                            <td>ID del producto actual en tu tienda</td>
                          </tr>
                          <tr>
                            <td><code>data-api-key</code></td>
                            <td>Sí</td>
                            <td>Tu API Key de MyOutfit</td>
                          </tr>
                          <tr>
                            <td><code>data-theme</code></td>
                            <td>No</td>
                            <td>Tema: "light" o "dark" (default: "light")</td>
                          </tr>
                          <tr>
                            <td><code>data-count</code></td>
                            <td>No</td>
                            <td>Número de recomendaciones (1-5, default: 3)</td>
                          </tr>
                          <tr>
                            <td><code>data-position</code></td>
                            <td>No</td>
                            <td>Posición: "below" o "sidebar" (default: "below")</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3>Ejemplo completo</h3>
                      <pre className={styles.codeBlock}>
                        <code>{`<!DOCTYPE html>
<html>
<head>
  <title>Producto - Mi Tienda</title>
</head>
<body>
  <h1>Camiseta Básica</h1>
  <p>Precio: €29.99</p>
  
  <!-- Widget MyOutfit -->
  <script src="https://myoutfitapp.com/widget.js"></script>
  <div 
    id="myoutfit-recommendations" 
    data-product-id="PROD-123" 
    data-api-key="sk_live_..."
    data-theme="light"
    data-count="3"
  ></div>
</body>
</html>`}</code>
                      </pre>

                      <h3>Personalización CSS</h3>
                      <p>
                        El widget incluye estilos por defecto, pero puedes personalizarlos con CSS:
                      </p>
                      <pre className={styles.codeBlock}>
                        <code>{`#myoutfit-recommendations {
  margin-top: 2rem;
  padding: 1.5rem;
  border-top: 2px solid #8000f7;
}

#myoutfit-recommendations .recommendation-item {
  /* Personaliza los items de recomendación */
}`}</code>
                      </pre>
                    </div>
                  )}

                  {/* API Endpoints */}
                  {activeTab === 'api-endpoints' && (
                    <div>
                      <h2>API Endpoints</h2>
                      <p>
                        Nuestra API REST te permite sincronizar tu catálogo, obtener recomendaciones
                        y acceder a analítica.
                      </p>

                      <h3>Base URL</h3>
                      <pre className={styles.codeBlock}>
                        <code>{`https://api.myoutfitapp.com/v1`}</code>
                      </pre>

                      <h3>Autenticación</h3>
                      <p>
                        Todas las peticiones requieren autenticación usando tu API Key en el header:
                      </p>
                      <pre className={styles.codeBlock}>
                        <code>{`Authorization: Bearer TU_API_KEY`}</code>
                      </pre>

                      <h3>Endpoints principales</h3>

                      <div className={styles.endpointCard}>
                        <h4>
                          <span className={styles.method}>POST</span> /api/b2b/sync-catalog
                        </h4>
                        <p>Sincroniza tu catálogo de productos</p>
                        <pre className={styles.codeBlock}>
                          <code>{`// Request
{
  "products": [
    {
      "id": "PROD-123",
      "name": "Camiseta Básica",
      "price": 29.99,
      "category": "Tops",
      "color": "white",
      "style": "casual",
      "image_url": "https://..."
    }
  ]
}

// Response
{
  "success": true,
  "synced": 150,
  "message": "Catálogo sincronizado correctamente"
}`}</code>
                        </pre>
                      </div>

                      <div className={styles.endpointCard}>
                        <h4>
                          <span className={styles.method}>GET</span> /api/b2b/recommendations
                        </h4>
                        <p>Obtiene recomendaciones para un producto</p>
                        <pre className={styles.codeBlock}>
                          <code>{`// Request
GET /api/b2b/recommendations?product_id=PROD-123&count=3

// Response
{
  "product_id": "PROD-123",
  "recommendations": [
    {
      "product_id": "PROD-456",
      "name": "Pantalón Negro",
      "price": 49.99,
      "match_score": 0.92,
      "reason": "Combinación de color y estilo"
    }
  ]
}`}</code>
                        </pre>
                      </div>

                      <div className={styles.endpointCard}>
                        <h4>
                          <span className={styles.method}>GET</span> /api/b2b/analytics
                        </h4>
                        <p>Obtiene métricas y analítica</p>
                        <pre className={styles.codeBlock}>
                          <code>{`// Request
GET /api/b2b/analytics?start_date=2024-01-01&end_date=2024-01-31

// Response
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "metrics": {
    "total_clicks": 1250,
    "conversions": 89,
    "aov_increase": 18.5,
    "top_combinations": [...]
  }
}`}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Catalog Sync */}
                  {activeTab === 'catalog-sync' && (
                    <div>
                      <h2>Sincronización de Catálogo</h2>
                      <p>
                        Hay dos formas de sincronizar tu catálogo: mediante CSV o usando Webhooks
                        automáticos.
                      </p>

                      <h3>Método 1: Sincronización CSV</h3>
                      <ol>
                        <li>Exporta tu catálogo a CSV con las siguientes columnas:</li>
                      </ol>
                      <pre className={styles.codeBlock}>
                        <code>{`id,name,price,category,color,style,image_url,description
PROD-123,Camiseta Básica,29.99,Tops,white,casual,https://...,...
PROD-456,Pantalón Negro,49.99,Bottoms,black,casual,https://...,...`}</code>
                      </pre>
                      <ol start={2}>
                        <li>Sube el CSV desde tu dashboard en "Catálogo" → "Sincronizar"</li>
                        <li>El sistema procesará tu catálogo automáticamente</li>
                      </ol>

                      <h3>Método 2: Webhooks automáticos</h3>
                      <p>
                        Para tiendas con catálogos que cambian frecuentemente, puedes configurar
                        webhooks que notifiquen a MyOutfit cuando se añaden, modifican o eliminan
                        productos.
                      </p>
                      <pre className={styles.codeBlock}>
                        <code>{`// Webhook endpoint que debes configurar en tu tienda
POST https://api.myoutfitapp.com/v1/webhooks/catalog-update

// Payload que recibimos
{
  "event": "product.created", // o "product.updated", "product.deleted"
  "product": {
    "id": "PROD-123",
    "name": "Camiseta Básica",
    ...
  }
}`}</code>
                      </pre>

                      <h3>Campos requeridos</h3>
                      <ul>
                        <li><strong>id</strong>: Identificador único del producto</li>
                        <li><strong>name</strong>: Nombre del producto</li>
                        <li><strong>price</strong>: Precio numérico</li>
                        <li><strong>category</strong>: Categoría (Tops, Bottoms, Shoes, etc.)</li>
                        <li><strong>color</strong>: Color principal</li>
                        <li><strong>style</strong>: Estilo (casual, formal, sporty, etc.)</li>
                      </ul>
                    </div>
                  )}

                  {/* Best Practices */}
                  {activeTab === 'best-practices' && (
                    <div>
                      <h2>Mejores Prácticas</h2>

                      <h3>Posicionamiento del widget</h3>
                      <ul>
                        <li>
                          Coloca el widget <strong>después</strong> de la información principal del
                          producto
                        </li>
                        <li>Evita colocarlo demasiado abajo donde los usuarios no lo verán</li>
                        <li>Considera usar la posición "sidebar" en escritorio para mejor visibilidad</li>
                      </ul>

                      <h3>Número de recomendaciones</h3>
                      <ul>
                        <li>3-4 recomendaciones es el número óptimo para la mayoría de tiendas</li>
                        <li>Demasiadas recomendaciones pueden abrumar al usuario</li>
                        <li>Puedes A/B testear diferentes números desde tu dashboard</li>
                      </ul>

                      <h3>Rendimiento</h3>
                      <ul>
                        <li>El widget carga de forma asíncrona y no bloquea la página</li>
                        <li>Las recomendaciones se cachean para mejorar la velocidad</li>
                        <li>Usa lazy loading si tienes muchos productos en la misma página</li>
                      </ul>

                      <h3>Personalización</h3>
                      <ul>
                        <li>Adapta el tema del widget a tu diseño de marca</li>
                        <li>Usa el texto personalizable "Combínalo con..." para tu idioma</li>
                        <li>Considera añadir un CTA adicional después del widget</li>
                      </ul>
                    </div>
                  )}

                  {/* Limits */}
                  {activeTab === 'limits' && (
                    <div>
                      <h2>Límites y Cuotas</h2>
                      <p>
                        Los límites varían según tu plan. Aquí están los límites por defecto:
                      </p>

                      <table className={styles.limitsTable}>
                        <thead>
                          <tr>
                            <th>Plan</th>
                            <th>Productos</th>
                            <th>Peticiones/mes</th>
                            <th>Rate Limit</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Starter</td>
                            <td>500</td>
                            <td>10,000</td>
                            <td>100/min</td>
                          </tr>
                          <tr>
                            <td>Pro</td>
                            <td>5,000</td>
                            <td>100,000</td>
                            <td>500/min</td>
                          </tr>
                          <tr>
                            <td>Enterprise</td>
                            <td>Ilimitado</td>
                            <td>Ilimitado</td>
                            <td>Custom</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3>Rate Limiting</h3>
                      <p>
                        Si superas el rate limit, recibirás un error 429. Espera unos minutos antes
                        de reintentar.
                      </p>

                      <h3>Superar límites</h3>
                      <p>
                        Si necesitas más capacidad, puedes actualizar tu plan desde el dashboard o
                        contactarnos para Enterprise.
                      </p>
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


