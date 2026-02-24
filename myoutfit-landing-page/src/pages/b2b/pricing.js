import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Pricing.module.scss';
import { 
  FiCheck, 
  FiX, 
  FiZap, 
  FiTrendingUp, 
  FiShield, 
  FiUsers,
  FiStar,
  FiAward,
  FiBarChart2,
  FiClock,
  FiHelpCircle
} from 'react-icons/fi';

const plans = [
  {
    name: 'Starter',
    stripePlan: 'starter',
    price: 49,
    annualPrice: 39,
    period: '/mes',
    description: 'Perfecto para tiendas pequeñas que empiezan',
    icon: FiZap,
    badge: 'Ideal para empezar',
    highlight: 'Ahorra 20% anualmente',
    features: [
      { text: 'Hasta 500 productos', included: true },
      { text: '10,000 peticiones API/mes', included: true },
      { text: 'Analítica básica', included: true },
      { text: 'Widget personalizable', included: true },
      { text: 'Soporte por email (48h)', included: true },
      { text: 'Sincronización manual (CSV)', included: true },
      { text: '14 días prueba gratuita', included: true },
      { text: 'Webhooks automáticos', included: false },
      { text: 'Analítica avanzada', included: false },
      { text: 'Soporte prioritario', included: false },
      { text: 'Re-ranking por margen', included: false },
      { text: 'A/B Testing', included: false },
    ],
    cta: 'Empezar ahora',
    popular: false,
    savings: 120,
  },
  {
    name: 'Pro',
    stripePlan: 'pro',
    price: 149,
    annualPrice: 119,
    period: '/mes',
    description: 'Para tiendas en crecimiento con ambición',
    icon: FiTrendingUp,
    badge: 'Más elegido',
    highlight: 'Ahorra €360/año',
    features: [
      { text: 'Hasta 5,000 productos', included: true },
      { text: '100,000 peticiones API/mes', included: true },
      { text: 'Analítica avanzada completa', included: true },
      { text: 'Widget totalmente personalizable', included: true },
      { text: 'Soporte prioritario (4h)', included: true },
      { text: 'Webhooks automáticos', included: true },
      { text: 'Reglas de recomendación personalizadas', included: true },
      { text: 'Dashboard completo', included: true },
      { text: 'A/B Testing integrado', included: true },
      { text: '14 días prueba gratuita', included: true },
      { text: 'Re-ranking por margen', included: false },
      { text: 'Account manager dedicado', included: false },
    ],
    cta: 'Empezar ahora',
    popular: true,
    savings: 360,
  },
  {
    name: 'Enterprise',
    stripePlan: null,
    price: 'Custom',
    annualPrice: 'Custom',
    period: '',
    description: 'Solución a medida para grandes operaciones',
    icon: FiAward,
    badge: 'Máxima potencia',
    highlight: 'Precio personalizado',
    features: [
      { text: 'Productos ilimitados', included: true },
      { text: 'Peticiones API ilimitadas', included: true },
      { text: 'Analítica avanzada + custom reports', included: true },
      { text: 'White-label disponible', included: true },
      { text: 'Soporte dedicado 24/7', included: true },
      { text: 'Webhooks + eventos personalizados', included: true },
      { text: 'Reglas de IA avanzadas', included: true },
      { text: 'Re-ranking por margen y stock', included: true },
      { text: 'Integración personalizada', included: true },
      { text: 'Account manager dedicado', included: true },
      { text: 'SLA garantizado 99.9%', included: true },
      { text: 'Onboarding personalizado', included: true },
    ],
    cta: 'Contactar ventas',
    popular: false,
    savings: null,
  },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const isAnnual = billingPeriod === 'annual';

  const handleCheckout = async (plan) => {
    if (!plan.stripePlan) return;
    setLoadingPlan(plan.name);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.stripePlan,
          interval: isAnnual ? 'annual' : 'monthly',
        }),
      });
      const contentType = res.headers.get('content-type');
      const text = await res.text();
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON:', text?.slice(0, 200));
        throw new Error('Error de servidor. ¿Reiniciaste el servidor después de añadir .env.local?');
      }
      const data = JSON.parse(text);
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error?.includes('precio anual') && isAnnual) {
        setLoadingPlan(null);
        window.location.href = '/b2b#contact';
      } else {
        throw new Error(data.error || 'Error al iniciar el pago');
      }
    } catch (err) {
      alert(err.message || 'Error al procesar el pago. Intenta de nuevo.');
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Head>
        <title>Precios - MyOutfit for Business</title>
        <meta
          name="description"
          content="Planes y precios para MyOutfit for Business. Elige el plan perfecto para tu tienda online."
        />
      </Head>
      <Navigation />
      <main className={styles.pricingMain}>
        <section className={styles.hero}>
          <div className="container">
            <div className="text-center">
              <div className={styles.heroBadge}>
                <FiStar /> Transparencia total, sin costes ocultos
              </div>
              <h1 className={styles.heroTitle}>Planes y Precios Simples</h1>
              <p className={styles.heroSubtitle}>
                Elige el plan perfecto para tu tienda. Todos los planes incluyen 14 días de prueba gratuita, sin tarjeta de crédito.
              </p>
              
              {/* Billing Toggle */}
              <div className={styles.billingToggle}>
                <button
                  className={`${styles.toggleButton} ${!isAnnual ? styles.toggleActive : ''}`}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Mensual
                </button>
                <button
                  className={`${styles.toggleButton} ${isAnnual ? styles.toggleActive : ''}`}
                  onClick={() => setBillingPeriod('annual')}
                >
                  Anual
                  <span className={styles.savingsBadge}>Ahorra 20%</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.pricingSection}>
          <div className="container">
            <div className="row">
              {plans.map((plan, index) => {
                const PlanIcon = plan.icon;
                const displayPrice = typeof plan.price === 'number' 
                  ? (isAnnual ? plan.annualPrice : plan.price) 
                  : plan.price;
                const monthlyPrice = plan.price;
                const showSavings = isAnnual && plan.savings;

                return (
                  <div key={index} className="col-lg-4 mb-4">
                    <div
                      className={`${styles.pricingCard} ${
                        plan.popular ? styles.pricingCardPopular : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className={styles.popularBadge}>
                          <FiStar size={14} /> {plan.badge}
                        </div>
                      )}
                      
                      <div className={styles.planHeader}>
                        <div className={styles.planIcon}>
                          <PlanIcon />
                        </div>
                        <h3>{plan.name}</h3>
                        <p className={styles.planDescription}>{plan.description}</p>
                      </div>

                      <div className={styles.priceSection}>
                        <div className={styles.priceContainer}>
                          {typeof displayPrice === 'number' && (
                            <>
                              <span className={styles.currency}>€</span>
                              <span className={styles.price}>{displayPrice}</span>
                              {plan.period && <span className={styles.period}>{plan.period}</span>}
                            </>
                          )}
                          {typeof displayPrice === 'string' && (
                            <span className={styles.priceCustom}>{displayPrice}</span>
                          )}
                        </div>
                        
                        {showSavings && (
                          <div className={styles.savingsText}>
                            Ahorras €{plan.savings}/año vs mensual
                          </div>
                        )}
                        
                        {!isAnnual && plan.savings && (
                          <div className={styles.annualOffer}>
                            O €{plan.annualPrice}/mes pagando anualmente
                          </div>
                        )}
                      </div>

                      {plan.stripePlan ? (
                        <button
                          type="button"
                          onClick={() => handleCheckout(plan)}
                          disabled={loadingPlan === plan.name}
                          className={`${styles.ctaButton} ${plan.popular ? styles.ctaButtonPrimary : styles.ctaButtonOutline}`}
                        >
                          {loadingPlan === plan.name ? 'Redirigiendo...' : plan.cta}
                        </button>
                      ) : (
                        <Link
                          href="/b2b#contact"
                          className={`${styles.ctaButton} ${plan.popular ? styles.ctaButtonPrimary : styles.ctaButtonOutline}`}
                        >
                          {plan.cta}
                        </Link>
                      )}

                      <div className={styles.featuresSection}>
                        <div className={styles.featuresHeader}>
                          <FiCheck /> Lo que incluye:
                        </div>
                        <ul className={styles.featuresList}>
                          {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className={styles.featureItem}>
                              {feature.included ? (
                                <FiCheck className={styles.checkIcon} />
                              ) : (
                                <FiX className={styles.xIcon} />
                              )}
                              <span
                                className={feature.included ? '' : styles.featureDisabled}
                              >
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className={styles.trustSection}>
          <div className="container">
            <div className="text-center mb-5">
              <h2 className={styles.sectionTitle}>Todo lo que necesitas para crecer</h2>
              <p className={styles.sectionSubtitle}>
                Características incluidas en todos los planes
              </p>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.trustCard}>
                  <div className={styles.trustIcon}>
                    <FiZap />
                  </div>
                  <h4>Setup en 5 minutos</h4>
                  <p>Integración super rápida sin necesidad de desarrolladores</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.trustCard}>
                  <div className={styles.trustIcon}>
                    <FiShield />
                  </div>
                  <h4>99.9% Uptime</h4>
                  <p>Infraestructura enterprise con alta disponibilidad</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.trustCard}>
                  <div className={styles.trustIcon}>
                    <FiUsers />
                  </div>
                  <h4>Soporte experto</h4>
                  <p>Equipo dedicado que te ayuda a tener éxito</p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3 mb-4">
                <div className={styles.trustCard}>
                  <div className={styles.trustIcon}>
                    <FiBarChart2 />
                  </div>
                  <h4>Analítica en tiempo real</h4>
                  <p>Dashboards con métricas accionables y ROI claro</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className={styles.comparisonSection}>
          <div className="container">
            <div className="text-center mb-5">
              <h2 className={styles.sectionTitle}>Comparación detallada de planes</h2>
              <p className={styles.sectionSubtitle}>
                Encuentra el plan perfecto comparando todas las características
              </p>
            </div>
            <div className={styles.comparisonTable}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.featureColumn}>Características</th>
                      <th>Starter</th>
                      <th className={styles.popularColumn}>Pro</th>
                      <th>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>Productos en catálogo</strong>
                      </td>
                      <td>Hasta 500</td>
                      <td className={styles.popularColumn}>Hasta 5,000</td>
                      <td>Ilimitados</td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>Peticiones API/mes</strong>
                      </td>
                      <td>10,000</td>
                      <td className={styles.popularColumn}>100,000</td>
                      <td>Ilimitadas</td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>Tiempo de respuesta soporte</strong>
                      </td>
                      <td>48 horas</td>
                      <td className={styles.popularColumn}>4 horas</td>
                      <td>24/7 dedicado</td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>Webhooks automáticos</strong>
                      </td>
                      <td><FiX className={styles.iconNo} /></td>
                      <td className={styles.popularColumn}><FiCheck className={styles.iconYes} /></td>
                      <td><FiCheck className={styles.iconYes} /></td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>A/B Testing</strong>
                      </td>
                      <td><FiX className={styles.iconNo} /></td>
                      <td className={styles.popularColumn}><FiCheck className={styles.iconYes} /></td>
                      <td><FiCheck className={styles.iconYes} /></td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>Re-ranking por margen</strong>
                      </td>
                      <td><FiX className={styles.iconNo} /></td>
                      <td className={styles.popularColumn}><FiX className={styles.iconNo} /></td>
                      <td><FiCheck className={styles.iconYes} /></td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>White-label</strong>
                      </td>
                      <td><FiX className={styles.iconNo} /></td>
                      <td className={styles.popularColumn}><FiX className={styles.iconNo} /></td>
                      <td><FiCheck className={styles.iconYes} /></td>
                    </tr>
                    <tr>
                      <td className={styles.featureColumn}>
                        <strong>Account Manager</strong>
                      </td>
                      <td><FiX className={styles.iconNo} /></td>
                      <td className={styles.popularColumn}><FiX className={styles.iconNo} /></td>
                      <td><FiCheck className={styles.iconYes} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.roiSection}>
          <div className="container">
            <div className="text-center mb-5">
              <h2 className={styles.sectionTitle}>ROI comprobado en tiendas reales</h2>
              <p className={styles.sectionSubtitle}>
                Más de 500 tiendas ya están viendo resultados increíbles
              </p>
            </div>
            <div className={styles.roiGrid}>
              <div className={styles.roiCard}>
                <div className={styles.roiIconWrapper}>
                  <FiTrendingUp />
                </div>
                <div className={styles.roiNumber}>+30%</div>
                <div className={styles.roiLabel}>Incremento en AOV</div>
                <div className={styles.roiDesc}>
                  Los clientes compran más artículos cuando ven combinaciones completas
                </div>
              </div>
              <div className={styles.roiCard}>
                <div className={styles.roiIconWrapper}>
                  <FiShield />
                </div>
                <div className={styles.roiNumber}>-25%</div>
                <div className={styles.roiLabel}>Menos devoluciones</div>
                <div className={styles.roiDesc}>
                  Compras más seguras al ver outfits completos desde el inicio
                </div>
              </div>
              <div className={styles.roiCard}>
                <div className={styles.roiIconWrapper}>
                  <FiBarChart2 />
                </div>
                <div className={styles.roiNumber}>2.8x</div>
                <div className={styles.roiLabel}>ROI promedio</div>
                <div className={styles.roiDesc}>
                  La inversión se paga sola en menos de 2 meses de media
                </div>
              </div>
              <div className={styles.roiCard}>
                <div className={styles.roiIconWrapper}>
                  <FiUsers />
                </div>
                <div className={styles.roiNumber}>+45%</div>
                <div className={styles.roiLabel}>Satisfacción cliente</div>
                <div className={styles.roiDesc}>
                  Mejor experiencia de compra con recomendaciones personalizadas
                </div>
              </div>
            </div>
            <div className={styles.roiNote}>
              <FiHelpCircle /> Resultados basados en datos agregados de +500 tiendas durante 6 meses. 
              Los resultados pueden variar según categoría y catálogo.
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className="container">
            <h2 className={`text-center ${styles.sectionTitle}`}>Preguntas Frecuentes</h2>
            <div className="row justify-content-center mt-4">
              <div className="col-lg-8">
                <div className={styles.faqItem}>
                  <h4>¿Puedo cambiar de plan más tarde?</h4>
                  <p>
                    Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu dashboard.
                    Los cambios se aplicarán en el siguiente ciclo de facturación.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h4>¿Qué pasa si supero los límites de mi plan?</h4>
                  <p>
                    Te notificaremos cuando te acerques a los límites. Puedes actualizar tu plan o
                    contactarnos para una solución personalizada.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h4>¿Hay descuentos por pago anual?</h4>
                  <p>
                    Sí, ofrecemos un 20% de descuento en planes Pro y Starter si pagas anualmente.
                    Contacta con nuestro equipo para más información.
                  </p>
                </div>
                <div className={styles.faqItem}>
                  <h4>¿Incluye soporte técnico?</h4>
                  <p>
                    Todos los planes incluyen soporte. Los planes Pro y Enterprise incluyen soporte
                    prioritario con tiempos de respuesta más rápidos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2>¿Tienes preguntas?</h2>
              <p>Nuestro equipo está aquí para ayudarte a elegir el plan perfecto</p>
              <div className={styles.ctaButtons}>
                <Link href="/b2b/demo" className="btn btn-light btn-lg me-3">
                  Ver Demo
                </Link>
                <Link href="/b2b/docs" className="btn btn-outline-light btn-lg">
                  Ver Documentación
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


