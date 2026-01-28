import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Demo.module.scss';

const demoProducts = [
  {
    id: 1,
    name: 'Camiseta Básica Blanca',
    price: '€29.99',
    image: '👕',
    recommendations: [
      { name: 'Pantalón Negro Slim', price: '€49.99', image: '👖' },
      { name: 'Zapatillas Blancas', price: '€79.99', image: '👟' },
      { name: 'Chaqueta Azul', price: '€89.99', image: '🧥' },
    ],
  },
  {
    id: 2,
    name: 'Vestido Floral',
    price: '€59.99',
    image: '👗',
    recommendations: [
      { name: 'Bolso de Cuero', price: '€39.99', image: '👜' },
      { name: 'Sandalias Beige', price: '€45.99', image: '👡' },
      { name: 'Collar Dorado', price: '€24.99', image: '💍' },
    ],
  },
  {
    id: 3,
    name: 'Pantalón Vaquero',
    price: '€69.99',
    image: '👖',
    recommendations: [
      { name: 'Camiseta Rayas', price: '€34.99', image: '👕' },
      { name: 'Cazadora Negra', price: '€99.99', image: '🧥' },
      { name: 'Botas Marrones', price: '€119.99', image: '👢' },
    ],
  },
];

export default function Demo() {
  const [selectedProduct, setSelectedProduct] = useState(demoProducts[0]);
  const [theme, setTheme] = useState('light');
  const [numSuggestions, setNumSuggestions] = useState(3);

  return (
    <>
      <Head>
        <title>Demo - MyOutfit for Business</title>
        <meta
          name="description"
          content="Prueba nuestro widget de recomendaciones de outfits en acción. Ve cómo se verá en tu tienda online."
        />
      </Head>
      <Navigation />
      <main className={styles.demoMain}>
        <section className={styles.hero}>
          <div className="container">
            <div className="text-center">
              <h1 className={styles.heroTitle}>Demo Interactiva del Widget</h1>
              <p className={styles.heroSubtitle}>
                Esta demo te muestra cómo MyOutfit recomienda outfits en tu tienda para mejorar la
                experiencia de usuario y las ventas.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.demoSection}>
          <div className="container">
            <div className="row">
              {/* Controls */}
              <div className="col-lg-4 mb-4 mb-lg-0">
                <div className={styles.controlsPanel}>
                  <h3>Personaliza el Widget</h3>

                  <div className={styles.controlGroup}>
                    <label>Producto de ejemplo:</label>
                    <select
                      className="form-select"
                      value={selectedProduct.id}
                      onChange={(e) => {
                        const product = demoProducts.find((p) => p.id === parseInt(e.target.value));
                        setSelectedProduct(product);
                      }}
                    >
                      {demoProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.controlGroup}>
                    <label>Tema del widget:</label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="theme"
                        id="theme-light"
                        checked={theme === 'light'}
                        onChange={() => setTheme('light')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="theme-light">
                        Claro
                      </label>
                      <input
                        type="radio"
                        className="btn-check"
                        name="theme"
                        id="theme-dark"
                        checked={theme === 'dark'}
                        onChange={() => setTheme('dark')}
                      />
                      <label className="btn btn-outline-primary" htmlFor="theme-dark">
                        Oscuro
                      </label>
                    </div>
                  </div>

                  <div className={styles.controlGroup}>
                    <label>Número de sugerencias: {numSuggestions}</label>
                    <input
                      type="range"
                      className="form-range"
                      min="1"
                      max="5"
                      value={numSuggestions}
                      onChange={(e) => setNumSuggestions(parseInt(e.target.value))}
                    />
                  </div>

                  <div className={styles.controlGroup}>
                    <Link href="/b2b/pricing" className="btn btn-primary w-100">
                      Ver Planes y Precios
                    </Link>
                    <Link href="/b2b/docs" className="btn btn-outline-primary w-100 mt-2">
                      Ver Documentación
                    </Link>
                  </div>
                </div>
              </div>

              {/* Demo Preview */}
              <div className="col-lg-8">
                <div className={styles.demoPreview}>
                  <div className={styles.productPage}>
                    <div className={styles.productImage}>
                      <div className={styles.imagePlaceholder}>{selectedProduct.image}</div>
                    </div>
                    <div className={styles.productInfo}>
                      <h2>{selectedProduct.name}</h2>
                      <p className={styles.price}>{selectedProduct.price}</p>
                      <p className={styles.description}>
                        Producto de ejemplo para demostrar el widget de recomendaciones de MyOutfit.
                        Este es el tipo de contenido que verán tus clientes en tu tienda.
                      </p>
                      <button className="btn btn-primary btn-lg">Añadir al Carrito</button>
                    </div>

                    {/* Widget Demo */}
                    <div
                      className={`${styles.widgetContainer} ${
                        theme === 'dark' ? styles.widgetDark : styles.widgetLight
                      }`}
                    >
                      <h4 className={styles.widgetTitle}>Combínalo con...</h4>
                      <div className={styles.recommendationsGrid}>
                        {selectedProduct.recommendations
                          .slice(0, numSuggestions)
                          .map((rec, index) => (
                            <div key={index} className={styles.recommendationCard}>
                              <div className={styles.recImage}>{rec.image}</div>
                              <div className={styles.recInfo}>
                                <h5>{rec.name}</h5>
                                <p className={styles.recPrice}>{rec.price}</p>
                              </div>
                              <button className={styles.addButton}>+</button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className="container">
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className={styles.infoCard}>
                  <h3>💡 Cómo funciona</h3>
                  <p>
                    El widget se integra automáticamente en tus páginas de producto. Analiza el
                    producto actual y muestra recomendaciones basadas en color, estilo y
                    compatibilidad.
                  </p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className={styles.infoCard}>
                  <h3>🎨 Personalización</h3>
                  <p>
                    Puedes personalizar el tema, número de sugerencias, posición y texto del widget
                    desde tu dashboard. Todo sin tocar código.
                  </p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className={styles.infoCard}>
                  <h3>📊 Analítica</h3>
                  <p>
                    Accede a métricas detalladas sobre qué productos se combinan más, clics en
                    recomendaciones y conversiones atribuibles al widget.
                  </p>
                </div>
              </div>
              <div className="col-md-6 mb-4">
                <div className={styles.infoCard}>
                  <h3>🚀 Integración rápida</h3>
                  <p>
                    Añade el widget a tu tienda en minutos. Solo necesitas copiar un script y
                    configurar tu API key. Compatible con cualquier plataforma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2>¿Te gusta lo que ves?</h2>
              <p>Empieza a usar MyOutfit for Business en tu tienda hoy mismo</p>
              <div className={styles.ctaButtons}>
                <Link href="/dashboard" className="btn btn-light btn-lg me-3">
                  Crear Cuenta Gratis
                </Link>
                <Link href="/b2b" className="btn btn-outline-light btn-lg">
                  Más Información
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


