import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import styles from '@/styles/B2B.module.scss';
import { 
  FiTrendingUp, 
  FiPackage, 
  FiBarChart2, 
  FiZap, 
  FiShield, 
  FiUsers,
  FiClock,
  FiCode,
  FiGlobe,
  FiLock,
  FiServer,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiTarget,
  FiAward,
  FiRefreshCw
} from 'react-icons/fi';

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <button 
        className={styles.faqQuestion}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && (
        <div className={styles.faqAnswer}>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function B2BHome() {
  return (
    <>
      <Head>
        <title>MyOutfit for Business - Recomendaciones de Outfits para Tu Tienda Online</title>
        <meta
          name="description"
          content="Lleva recomendaciones inteligentes de outfits a tu tienda online. Aumenta el valor medio por cliente y reduce devoluciones con IA."
        />
      </Head>
      <Navigation />
      <main className={styles.b2bMain}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className="container">
            <div className="row align-items-center min-vh-75">
              <div className="col-lg-6">
                <div className={styles.heroContent}>
                  <div className={styles.heroBadge}>
                    <FiZap size={16} /> Potenciado por IA
                  </div>
                  <h1 className={styles.heroTitle}>MyOutfit for Business</h1>
                  <p className={styles.heroSubtitle}>
                    Recomendaciones inteligentes de outfits que aumentan tus ventas automáticamente
                  </p>
                  <div className={styles.heroDescriptionWrap}>
                    <p className={styles.heroDescription}>
                      Integra nuestro motor de IA avanzado en tu tienda online para ofrecer recomendaciones 
                      personalizadas de outfits completos. Aumenta el valor medio por pedido hasta un 30%, 
                      reduce devoluciones y mejora la satisfacción de tus clientes.
                    </p>
                  </div>
                  <div className={styles.heroStats}>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatNumber}>+30%</span>
                      <span className={styles.heroStatLabel}>Incremento AOV</span>
                    </div>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatNumber}>-25%</span>
                      <span className={styles.heroStatLabel}>Devoluciones</span>
                    </div>
                    <div className={styles.heroStat}>
                      <span className={styles.heroStatNumber}>5 min</span>
                      <span className={styles.heroStatLabel}>Integración</span>
                    </div>
                  </div>
                  <div className={styles.ctaButtons}>
                    <Link href="/b2b/demo" className="btn btn-light btn-lg me-3">
                      <FiZap size={20} className="me-2" />
                      Ver Demo Interactiva
                    </Link>
                    <Link href="/dashboard" className="btn btn-outline-light btn-lg">
                      Comenzar Gratis
                    </Link>
                  </div>
                  <div className={styles.heroTrust}>
                    <FiCheckCircle size={18} /> <span>14 días de prueba gratuita · Sin tarjeta de crédito</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 mt-5 mt-lg-0">
                <div className={styles.widgetMockup}>
                  <Image
                    src="/images/b2b-complete-look.png"
                    alt="Widget Completa tu look - Recomendaciones de outfit con IA"
                    width={600}
                    height={360}
                    className={styles.widgetImage}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefits}>
          <div className="container">
            <div className="text-center mb-5">
              <span className={styles.sectionBadge}>Beneficios</span>
              <h2 className={`${styles.sectionTitle} mt-3`}>Por qué elegir MyOutfit for Business</h2>
              <p className={styles.sectionSubtitle}>
                Resultados comprobados que transformarán tu tienda online
              </p>
            </div>
            <div className="row mt-5">
              <div className="col-md-6 col-lg-4 mb-4">
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrapper}>
                    <FiTrendingUp className={styles.benefitIcon} />
                  </div>
                  <h3>Aumenta Ventas hasta un 30%</h3>
                  <p>
                    Nuestras tiendas asociadas registran un incremento promedio del 30% en el 
                    valor medio del pedido. Los clientes compran más artículos cuando ven 
                    combinaciones completas y coherentes.
                  </p>
                  <div className={styles.benefitMetric}>
                    <span className={styles.metricLabel}>AOV Promedio:</span>
                    <span className={styles.metricValue}>+30% 📈</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mb-4">
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrapper}>
                    <FiZap className={styles.benefitIcon} />
                  </div>
                  <h3>IA Avanzada y Precisa</h3>
                  <p>
                    Algoritmos de machine learning que analizan estilo, color, temporada, ocasión 
                    y tendencias actuales. Aprende de las preferencias de tus clientes para mejorar 
                    constantemente las recomendaciones.
                  </p>
                  <div className={styles.benefitMetric}>
                    <span className={styles.metricLabel}>Precisión:</span>
                    <span className={styles.metricValue}>92% ⭐</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mb-4">
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrapper}>
                    <FiPackage className={styles.benefitIcon} />
                  </div>
                  <h3>Reduce Devoluciones -25%</h3>
                  <p>
                    Los clientes que compran outfits completos tienen un 25% menos de devoluciones. 
                    Compran con más confianza al ver cómo combinar cada prenda desde el primer momento.
                  </p>
                  <div className={styles.benefitMetric}>
                    <span className={styles.metricLabel}>Ahorro estimado:</span>
                    <span className={styles.metricValue}>€5K-15K/año 💰</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mb-4">
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrapper}>
                    <FiClock className={styles.benefitIcon} />
                  </div>
                  <h3>Integración en 5 Minutos</h3>
                  <p>
                    Setup ultra-rápido sin necesidad de desarrolladores. Copia un snippet de código, 
                    pégalo en tu tienda y listo. Compatible con Shopify, WooCommerce, PrestaShop, 
                    Magento y cualquier plataforma web.
                  </p>
                  <div className={styles.benefitMetric}>
                    <span className={styles.metricLabel}>Tiempo setup:</span>
                    <span className={styles.metricValue}>5 minutos ⚡</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mb-4">
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrapper}>
                    <FiBarChart2 className={styles.benefitIcon} />
                  </div>
                  <h3>Dashboard Analítico Completo</h3>
                  <p>
                    Métricas en tiempo real: conversión de recomendaciones, productos más combinados, 
                    ROI detallado, análisis de tendencias y comportamiento de usuarios. Todo en un 
                    dashboard intuitivo y potente.
                  </p>
                  <div className={styles.benefitMetric}>
                    <span className={styles.metricLabel}>Métricas disponibles:</span>
                    <span className={styles.metricValue}>+25 KPIs 📊</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4 mb-4">
                <div className={styles.benefitCard}>
                  <div className={styles.benefitIconWrapper}>
                    <FiShield className={styles.benefitIcon} />
                  </div>
                  <h3>Seguridad y Privacidad</h3>
                  <p>
                    Cumplimiento GDPR y protección de datos. Encriptación SSL/TLS, infraestructura 
                    redundante en múltiples regiones, backups automáticos y disponibilidad del 99.9%. 
                    Tus datos y los de tus clientes están seguros.
                  </p>
                  <div className={styles.benefitMetric}>
                    <span className={styles.metricLabel}>Uptime garantizado:</span>
                    <span className={styles.metricValue}>99.9% 🔒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className={styles.howItWorks}>
          <div className="container">
            <div className="text-center mb-5">
              <span className={styles.sectionBadge}>Proceso</span>
              <h2 className={`${styles.sectionTitle} mt-3`}>Cómo funciona MyOutfit</h2>
              <p className={styles.sectionSubtitle}>
                De la integración a resultados en menos de 30 minutos
              </p>
            </div>
            <div className="row mt-5">
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepIcon}><FiServer /></div>
                  <h4>Sincroniza tu Catálogo</h4>
                  <p>
                    Conecta tu tienda mediante API REST, webhook o sube un archivo CSV/Excel. 
                    Sincronización automática cada hora para mantener el inventario actualizado.
                  </p>
                  <ul className={styles.stepFeatures}>
                    <li><FiCheckCircle /> API REST disponible</li>
                    <li><FiCheckCircle /> Importación CSV/Excel</li>
                    <li><FiCheckCircle /> Sync automático</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepIcon}><FiZap /></div>
                  <h4>IA Procesa Datos</h4>
                  <p>
                    Nuestro motor analiza cada producto: categoría, color dominante, estilo, 
                    temporada, ocasión de uso y precio. Crea un grafo de relaciones entre prendas.
                  </p>
                  <ul className={styles.stepFeatures}>
                    <li><FiCheckCircle /> Análisis de imágenes</li>
                    <li><FiCheckCircle /> Detección de colores</li>
                    <li><FiCheckCircle /> Clasificación por estilo</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepIcon}><FiTarget /></div>
                  <h4>Genera Recomendaciones</h4>
                  <p>
                    El sistema crea combinaciones inteligentes en milisegundos. Aprende del 
                    comportamiento de usuarios para optimizar sugerencias continuamente.
                  </p>
                  <ul className={styles.stepFeatures}>
                    <li><FiCheckCircle /> Respuesta &lt;100ms</li>
                    <li><FiCheckCircle /> Machine Learning</li>
                    <li><FiCheckCircle /> A/B testing automático</li>
                  </ul>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>4</div>
                  <div className={styles.stepIcon}><FiCode /></div>
                  <h4>Integra el Widget</h4>
                  <p>
                    Copia un snippet de JavaScript en tu página de producto. Personaliza colores, 
                    posición y comportamiento desde el dashboard. Sin impacto en rendimiento.
                  </p>
                  <ul className={styles.stepFeatures}>
                    <li><FiCheckCircle /> 1 línea de código</li>
                    <li><FiCheckCircle /> Totalmente customizable</li>
                    <li><FiCheckCircle /> Mobile-responsive</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className={styles.useCases}>
          <div className="container">
            <div className="text-center mb-5">
              <span className={styles.sectionBadge}>Casos de Uso</span>
              <h2 className={`${styles.sectionTitle} mt-3`}>Ideal para cualquier tienda de moda</h2>
              <p className={styles.sectionSubtitle}>
                MyOutfit se adapta a tu modelo de negocio y catálogo
              </p>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>👔</div>
                  <h4>Moda Formal</h4>
                  <p>Combina trajes, camisas, corbatas y zapatos de vestir para eventos profesionales.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>👟</div>
                  <h4>Streetwear</h4>
                  <p>Crea looks urbanos con sneakers, hoodies, jeans y accesorios trendy.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>🏃</div>
                  <h4>Deportiva</h4>
                  <p>Outfits de entrenamiento, yoga, running y actividades outdoor completos.</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.useCaseCard}>
                  <div className={styles.useCaseIcon}>👗</div>
                  <h4>Moda Mujer</h4>
                  <p>Vestidos, blusas, faldas y complementos para cualquier ocasión.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Features Section */}
        <section className={styles.technicalFeatures}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <span className={styles.sectionBadge}>Tecnología</span>
                <h2 className={`${styles.sectionTitle} mt-3`}>Potencia técnica empresarial</h2>
                <p className={styles.sectionDescription}>
                  Infraestructura robusta y escalable diseñada para tiendas de alto tráfico
                </p>
                <div className={styles.featureList}>
                  <div className={styles.featureListItem}>
                    <FiServer className={styles.featureListIcon} />
                    <div>
                      <h4>API RESTful Completa</h4>
                      <p>Documentación detallada, ejemplos de código y SDKs para JavaScript, Python y PHP.</p>
                    </div>
                  </div>
                  <div className={styles.featureListItem}>
                    <FiGlobe className={styles.featureListIcon} />
                    <div>
                      <h4>CDN Global Multi-región</h4>
                      <p>Servidores en Europa, América y Asia para latencias &lt;50ms en todo el mundo.</p>
                    </div>
                  </div>
                  <div className={styles.featureListItem}>
                    <FiLock className={styles.featureListIcon} />
                    <div>
                      <h4>Seguridad de Nivel Enterprise</h4>
                      <p>Encriptación SSL/TLS, autenticación con API keys, rate limiting y protección DDoS.</p>
                    </div>
                  </div>
                  <div className={styles.featureListItem}>
                    <FiBarChart2 className={styles.featureListIcon} />
                    <div>
                      <h4>Webhooks en Tiempo Real</h4>
                      <p>Notificaciones instantáneas de eventos: clicks, conversiones, cambios de inventario.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className={styles.techShowcase}>
                  <div className={styles.codeBlock}>
                    <div className={styles.codeHeader}>
                      <span className={styles.codeLang}>JavaScript</span>
                      <span className={styles.codeTitle}>widget-integration.js</span>
                    </div>
                    <pre className={styles.codeContent}>
{`// Integración simple en 3 líneas
<script src="https://cdn.myoutfit.com/widget.js">
</script>

<div id="myoutfit-recommendations"
     data-product-id="12345"
     data-api-key="tu_api_key">
</div>

// ¡Listo! El widget se carga automáticamente`}
                    </pre>
                  </div>
                  <div className={styles.techBadges}>
                    <span className={styles.techBadge}><FiCheckCircle /> Shopify</span>
                    <span className={styles.techBadge}><FiCheckCircle /> WooCommerce</span>
                    <span className={styles.techBadge}><FiCheckCircle /> Magento</span>
                    <span className={styles.techBadge}><FiCheckCircle /> PrestaShop</span>
                    <span className={styles.techBadge}><FiCheckCircle /> Custom</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={styles.testimonials}>
          <div className="container">
            <div className="text-center mb-5">
              <span className={styles.sectionBadge}>Testimonios</span>
              <h2 className={`${styles.sectionTitle} mt-3`}>Lo que dicen nuestros clientes</h2>
            </div>
            <div className="row">
              <div className="col-lg-4 mb-4">
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
                  <p className={styles.testimonialText}>
                    "Implementamos MyOutfit hace 3 meses y los resultados son impresionantes. 
                    El AOV aumentó un 28% y las devoluciones bajaron un 22%. Lo mejor es que 
                    nuestros clientes están más satisfechos."
                  </p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>LM</div>
                    <div>
                      <div className={styles.testimonialName}>Laura Martínez</div>
                      <div className={styles.testimonialRole}>CEO, StyleHub</div>
                    </div>
                  </div>
                  <div className={styles.testimonialMetrics}>
                    <div className={styles.testimonialMetric}>
                      <span className={styles.testimonialMetricValue}>+28%</span>
                      <span className={styles.testimonialMetricLabel}>AOV</span>
                    </div>
                    <div className={styles.testimonialMetric}>
                      <span className={styles.testimonialMetricValue}>-22%</span>
                      <span className={styles.testimonialMetricLabel}>Devoluciones</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mb-4">
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
                  <p className={styles.testimonialText}>
                    "La integración fue súper fácil. En menos de 10 minutos estaba funcionando 
                    en nuestra tienda Shopify. El soporte técnico es excelente y las 
                    recomendaciones son muy precisas."
                  </p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>CP</div>
                    <div>
                      <div className={styles.testimonialName}>Carlos Pérez</div>
                      <div className={styles.testimonialRole}>CTO, UrbanFit</div>
                    </div>
                  </div>
                  <div className={styles.testimonialMetrics}>
                    <div className={styles.testimonialMetric}>
                      <span className={styles.testimonialMetricValue}>+35%</span>
                      <span className={styles.testimonialMetricLabel}>Conversión</span>
                    </div>
                    <div className={styles.testimonialMetric}>
                      <span className={styles.testimonialMetricValue}>10 min</span>
                      <span className={styles.testimonialMetricLabel}>Setup</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mb-4">
                <div className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
                  <p className={styles.testimonialText}>
                    "MyOutfit ha revolucionado nuestra estrategia de cross-selling. Los clientes 
                    compran más artículos por pedido y el feedback es muy positivo. La inversión 
                    se pagó sola en el primer mes."
                  </p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.testimonialAvatar}>AS</div>
                    <div>
                      <div className={styles.testimonialName}>Ana Silva</div>
                      <div className={styles.testimonialRole}>Marketing Director, ModaPlus</div>
                    </div>
                  </div>
                  <div className={styles.testimonialMetrics}>
                    <div className={styles.testimonialMetric}>
                      <span className={styles.testimonialMetricValue}>2.8x</span>
                      <span className={styles.testimonialMetricLabel}>ROI</span>
                    </div>
                    <div className={styles.testimonialMetric}>
                      <span className={styles.testimonialMetricValue}>+42%</span>
                      <span className={styles.testimonialMetricLabel}>Items/pedido</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className="container">
            <div className="text-center mb-5">
              <span className={styles.sectionBadge}>FAQ</span>
              <h2 className={`${styles.sectionTitle} mt-3`}>Preguntas frecuentes</h2>
              <p className={styles.sectionSubtitle}>
                Respuestas a las dudas más comunes de nuestros clientes
              </p>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <FAQItem 
                  question="¿Cuánto tiempo tarda la integración?"
                  answer="La integración básica toma entre 5-10 minutos. Solo necesitas copiar un snippet de código en tu página de producto. Para integraciones más avanzadas con sincronización automática vía API, el proceso puede tomar 1-2 horas con nuestro equipo de soporte."
                />
                <FAQItem 
                  question="¿Funciona con mi plataforma de ecommerce?"
                  answer="Sí, MyOutfit es compatible con todas las plataformas principales: Shopify, WooCommerce, Magento, PrestaShop, BigCommerce y cualquier tienda personalizada. Ofrecemos plugins específicos para las plataformas más populares y una API REST para integraciones custom."
                />
                <FAQItem 
                  question="¿Cómo se calculan las recomendaciones?"
                  answer="Utilizamos algoritmos de machine learning que analizan múltiples factores: color dominante y paleta, categoría y subcategoría, estilo (casual, formal, deportivo, etc.), temporada, rango de precio, historial de combinaciones exitosas y comportamiento de usuarios. El sistema aprende y mejora continuamente."
                />
                <FAQItem 
                  question="¿Qué pasa si mi catálogo cambia frecuentemente?"
                  answer="No hay problema. Ofrecemos sincronización automática cada hora vía API o webhooks. Cuando añades, modificas o eliminas productos, las recomendaciones se actualizan automáticamente. También puedes forzar una sincronización manual desde el dashboard cuando lo necesites."
                />
                <FAQItem 
                  question="¿Puedo personalizar el diseño del widget?"
                  answer="Absolutamente. Desde el dashboard puedes personalizar: colores primarios y secundarios, fuentes, tamaño del widget, posición en la página, número de recomendaciones, textos y traducciones, animaciones y efectos. Todo sin necesidad de código."
                />
                <FAQItem 
                  question="¿Ofrecen período de prueba?"
                  answer="Sí, ofrecemos 14 días de prueba gratuita en todos los planes sin necesidad de tarjeta de crédito. Tendrás acceso completo a todas las funcionalidades para que puedas evaluar el impacto en tu tienda antes de comprometerte."
                />
                <FAQItem 
                  question="¿Cómo afecta el widget al rendimiento de mi tienda?"
                  answer="El widget está optimizado para no impactar el rendimiento. Se carga de forma asíncrona después de que tu página esté lista, usa CDN global para minimizar latencia (< 50ms), tiene un peso de solo 12KB gzipped y está completamente cacheado. El impacto en PageSpeed es menor al 1%."
                />
                <FAQItem 
                  question="¿Qué tipo de soporte ofrecen?"
                  answer="Ofrecemos soporte por email en todos los planes (respuesta en 24h), chat en vivo para planes Pro y Enterprise (respuesta en 2h), videollamadas de onboarding personalizadas, documentación técnica completa y ejemplos de código, y un Slack channel dedicado para clientes Enterprise."
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaCard}>
              <div className={styles.ctaIconGroup}>
                <FiTrendingUp size={40} />
                <FiZap size={40} />
                <FiAward size={40} />
              </div>
              <h2>¿Listo para transformar tu tienda online?</h2>
              <p className={styles.ctaDescription}>
                Únete a más de 500 tiendas que ya están aumentando sus ventas con MyOutfit
              </p>
              <div className={styles.ctaBenefits}>
                <div className={styles.ctaBenefit}>
                  <FiCheckCircle /> 14 días gratis sin tarjeta
                </div>
                <div className={styles.ctaBenefit}>
                  <FiCheckCircle /> Setup en 5 minutos
                </div>
                <div className={styles.ctaBenefit}>
                  <FiCheckCircle /> Soporte técnico incluido
                </div>
                <div className={styles.ctaBenefit}>
                  <FiCheckCircle /> Cancela cuando quieras
                </div>
              </div>
              <div className={styles.ctaButtons}>
                <Link href="/dashboard" className="btn btn-light btn-lg me-3">
                  <FiZap size={20} className="me-2" />
                  Comenzar Prueba Gratuita
                </Link>
                <Link href="/b2b/demo" className="btn btn-outline-light btn-lg">
                  <FiBarChart2 size={20} className="me-2" />
                  Ver Demo en Vivo
                </Link>
              </div>
              <p className={styles.ctaFootnote}>
                ¿Tienes preguntas? <Link href="mailto:business@myoutfitapp.com" className={styles.ctaLink}>Contacta con nuestro equipo</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


