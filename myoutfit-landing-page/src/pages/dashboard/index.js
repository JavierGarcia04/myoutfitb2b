import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.scss';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import UserConfigModal from '@/components/UserConfigModal';
import NotificationsPanel from '@/components/NotificationsPanel';
import {
  FiBarChart2,
  FiPackage,
  FiSettings,
  FiDollarSign,
  FiTrendingUp,
  FiMousePointer,
  FiShoppingCart,
  FiLogOut,
  FiSearch,
  FiBell,
  FiUser,
  FiChevronDown,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEye,
  FiArrowUp,
  FiArrowDown,
  FiCalendar,
  FiFilter,
  FiCopy,
  FiExternalLink,
  FiZap,
  FiTarget,
  FiAward,
  FiActivity,
  FiCode,
  FiLink
} from 'react-icons/fi';

export default function Dashboard() {
  const { user, store, loading: authLoading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('30days');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showUserConfig, setShowUserConfig] = useState(false);

  // Datos reales de Supabase
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    totalViews: 0,
    totalConversions: 0,
    revenue: 0,
    conversionRate: 0,
  });
  const [loadingData, setLoadingData] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Cargar productos y analytics cuando el store cambie
  useEffect(() => {
    async function loadDashboardData() {
      if (!store?.id) return;

      setLoadingData(true);
      try {
        // Cargar productos
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!productsError && productsData) {
          setProducts(productsData);
        }

        // Cargar analytics (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: analyticsData, error: analyticsError } = await supabase
          .from('daily_analytics')
          .select('*')
          .eq('store_id', store.id)
          .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

        if (!analyticsError && analyticsData) {
          // Sumar totales
          const totals = analyticsData.reduce((acc, day) => ({
            totalClicks: acc.totalClicks + (day.total_clicks || 0),
            totalViews: acc.totalViews + (day.total_views || 0),
            totalConversions: acc.totalConversions + (day.total_conversions || 0),
            revenue: acc.revenue + parseFloat(day.revenue || 0),
          }), { totalClicks: 0, totalViews: 0, totalConversions: 0, revenue: 0 });

          totals.conversionRate = totals.totalClicks > 0
            ? ((totals.totalConversions / totals.totalClicks) * 100).toFixed(1)
            : 0;

          setAnalytics(totals);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboardData();
  }, [store?.id]);

  // Agregar notificación helper
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Marcar notificación como leída
  const markAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
  };

  // Limpiar todas las notificaciones
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Función para sincronizar catálogo con notificación
  const handleSyncCatalog = async () => {
    if (!store?.id) return;

    addNotification(
      'Sincronización iniciada',
      'Actualizando inventario de productos...',
      'sync'
    );

    setLoadingData(true);
    try {
      // Cargar productos actualizados
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!productsError && productsData) {
        const prevCount = products.length;
        const newCount = productsData.length;
        setProducts(productsData);

        // Notificación de éxito con detalles
        if (newCount !== prevCount) {
          addNotification(
            'Inventario actualizado',
            `Se ${newCount > prevCount ? 'añadieron' : 'eliminaron'} ${Math.abs(newCount - prevCount)} productos. Total: ${newCount}`,
            'inventory_update'
          );
        } else {
          addNotification(
            'Sincronización completada',
            `${newCount} productos sincronizados correctamente`,
            'success'
          );
        }
      } else if (productsError) {
        addNotification(
          'Error de sincronización',
          'No se pudo actualizar el inventario. Inténtalo de nuevo.',
          'warning'
        );
      }
    } catch (error) {
      console.error('Error syncing catalog:', error);
      addNotification(
        'Error de sincronización',
        'Ocurrió un error inesperado.',
        'warning'
      );
    } finally {
      setLoadingData(false);
    }
  };

  // Función para copiar API Key al portapapeles
  const copyApiKey = async () => {
    if (store?.api_key) {
      try {
        await navigator.clipboard.writeText(store.api_key);
        setApiKeyCopied(true);
        setTimeout(() => setApiKeyCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar:', err);
      }
    }
  };

  // Función para mostrar API Key parcial
  const getMaskedApiKey = () => {
    if (!store?.api_key) return 'No disponible';
    if (showApiKey) return store.api_key;
    const key = store.api_key;
    return key.substring(0, 12) + '...' + key.substring(key.length - 4);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await signIn(email, password);

    if (signInError) {
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';

      // Mensajes específicos según el tipo de error
      if (signInError.message?.includes('Email not confirmed')) {
        errorMessage = '📧 Por favor, confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y haz click en el enlace de confirmación.';
      } else if (signInError.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos. Por favor, verifica tus credenciales.';
      } else if (signInError.message) {
        errorMessage = signInError.message;
      }

      setError(errorMessage);
      setLoading(false);
    } else {
      setLoading(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setEmail('');
    setPassword('');
  };

  const handleSaveUserConfig = async (formData) => {
    // Aquí implementamos la lógica de actualización en Supabase
    // Por ahora solo actualizamos el estado local para reflejar cambios inmediatos en la UI si es necesario
    console.log('Guardando configuración:', formData);

    try {
      if (store?.id) {
        // Actualizar nombre de la tienda
        const { error: storeError } = await supabase
          .from('stores')
          .update({ name: formData.storeName })
          .eq('id', store.id);

        if (storeError) throw storeError;
      }

      // Actualizar metadatos del usuario
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          language: formData.language,
          notifications: formData.notifications
        }
      });

      if (userError) throw userError;

      // Recargar la página para ver cambios (o actualizar estado global si tuviéramos un context más complejo)
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar los cambios. Por favor intenta de nuevo.');
      throw error; // Re-lanzar para que el modal sepa que hubo error
    }
  };

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Dashboard - MyOutfit for Business</title>
        </Head>
        <main className={styles.dashboardMain}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Dashboard - MyOutfit for Business</title>
        </Head>
        <main className={styles.dashboardMain}>
          <section className={styles.loginSection}>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-5">
                  <div className={styles.loginCard}>
                    <h2>Iniciar Sesión</h2>
                    <p className={styles.loginSubtitle}>
                      Accede a tu panel de MyOutfit for Business
                    </p>
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleLogin}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="demo@mitienda.com"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          Contraseña
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                      </button>
                    </form>
                    <div className={styles.loginFooter}>
                      <p className={styles.demoInfo}>
                        <strong>🎯 Modo Demo:</strong> Usa cualquier email/contraseña para acceder al dashboard demo
                      </p>
                      <p>
                        ¿No tienes cuenta?{' '}
                        <Link href="/b2b/register">Regístrate aquí</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  // Dashboard content
  return (
    <>
      <Head>
        <title>Dashboard - MyOutfit for Business</title>
      </Head>
      <main className={styles.dashboardMain}>
        <div className={styles.dashboardContainer}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.logoContainer}>
                <div className={styles.logoIcon}>MO</div>
                <div>
                  <h3>MyOutfit</h3>
                  <p className={styles.storeName}>Dashboard</p>
                </div>
              </div>
            </div>
            <nav className={styles.sidebarNav}>
              <button
                className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FiBarChart2 /> <span>Visión General</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'catalog' ? styles.active : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <FiPackage /> <span>Catálogo</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'widget' ? styles.active : ''}`}
                onClick={() => setActiveTab('widget')}
              >
                <FiSettings /> <span>Widget</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <FiTrendingUp /> <span>Analítica</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'billing' ? styles.active : ''}`}
                onClick={() => setActiveTab('billing')}
              >
                <FiDollarSign /> <span>Facturación</span>
              </button>
            </nav>
            <div className={styles.sidebarFooter}>
              <div
                className={styles.userProfile}
                onClick={() => setShowUserConfig(true)}
                title="Configurar Perfil"
              >
                <div className={styles.userAvatar}>
                  {store?.name?.charAt(0)?.toUpperCase() || <FiUser />}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{store?.name || 'Mi Tienda'}</div>
                  <div className={styles.userEmail}>{user?.email || 'tienda@email.com'}</div>
                  <div className={styles.userPlan}>
                    Plan {store?.plan?.charAt(0)?.toUpperCase() + store?.plan?.slice(1) || 'Starter'}
                  </div>
                </div>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>
                <FiLogOut /> <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className={styles.contentWrapper}>
            {/* Top Header */}
            <header className={styles.topHeader}>
              <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>
                  {activeTab === 'overview' && 'Visión General'}
                  {activeTab === 'catalog' && 'Catálogo de Productos'}
                  {activeTab === 'widget' && 'Configuración del Widget'}
                  {activeTab === 'analytics' && 'Analítica Detallada'}
                  {activeTab === 'billing' && 'Facturación y Planes'}
                </h1>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.searchBar}>
                  <FiSearch />
                  <input type="text" placeholder="Buscar..." />
                </div>
                <div className={styles.headerActions}>
                  <button
                    className={styles.headerButton}
                    title="Notificaciones"
                    onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                  >
                    <FiBell />
                    {unreadCount > 0 && (
                      <span className={styles.notificationBadge}>{unreadCount}</span>
                    )}
                  </button>
                  <NotificationsPanel
                    isOpen={showNotificationsPanel}
                    onClose={() => setShowNotificationsPanel(false)}
                    notifications={notifications}
                    onMarkAsRead={markAsRead}
                    onClearAll={clearAllNotifications}
                  />
                  <div className={styles.dateSelector}>
                    <FiCalendar />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className={styles.dateSelect}
                    >
                      <option value="7days">Últimos 7 días</option>
                      <option value="30days">Últimos 30 días</option>
                      <option value="90days">Últimos 90 días</option>
                      <option value="year">Este año</option>
                    </select>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <div className={styles.mainContent}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {/* Welcome Message for New Stores */}
                  {store && store.catalog_size === 0 && (
                    <div className={styles.welcomeCard}>
                      <div className={styles.welcomeIcon}>🎉</div>
                      <h2>¡Bienvenido a MyOutfit for Business!</h2>
                      <p>Tu cuenta ha sido creada exitosamente. Para comenzar a aumentar tus ventas con recomendaciones inteligentes, sigue estos pasos:</p>

                      <div className={styles.onboardingSteps}>
                        <div className={styles.onboardingStep}>
                          <div className={styles.stepNumber}>1</div>
                          <div className={styles.stepContent}>
                            <h4>Sincroniza tu catálogo</h4>
                            <p>Conecta tu tienda o sube tus productos manualmente</p>
                            <button className={styles.stepButton} onClick={() => setActiveTab('catalog')}>
                              <FiPackage /> Ir al Catálogo
                            </button>
                          </div>
                        </div>

                        <div className={styles.onboardingStep}>
                          <div className={styles.stepNumber}>2</div>
                          <div className={styles.stepContent}>
                            <h4>Configura el widget</h4>
                            <p>Integra las recomendaciones en tu tienda online</p>
                            <button className={styles.stepButton} onClick={() => setActiveTab('widget')}>
                              <FiCode /> Ver Documentación
                            </button>
                          </div>
                        </div>

                        <div className={styles.onboardingStep}>
                          <div className={styles.stepNumber}>3</div>
                          <div className={styles.stepContent}>
                            <h4>Comienza a vender más</h4>
                            <p>Visualiza tus estadísticas y optimiza tus resultados</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.welcomeFooter}>
                        <p>📚 ¿Necesitas ayuda? <a href="/b2b/docs" target="_blank">Lee nuestra documentación</a></p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions Bar - Solo mostrar si hay productos */}
                  {store && store.catalog_size > 0 && (
                    <div className={styles.quickActions}>
                      <button className={styles.quickActionBtn} onClick={handleSyncCatalog}>
                        <FiRefreshCw /> Sincronizar Catálogo
                      </button>
                      <button className={styles.quickActionBtn}>
                        <FiDownload /> Exportar Datos
                      </button>
                      <button className={styles.quickActionBtn}>
                        <FiSettings /> Configurar Widget
                      </button>
                    </div>
                  )}

                  {/* Main Metrics Cards - Solo mostrar si hay datos */}
                  {store && store.catalog_size > 0 && (
                    <>
                      <div className="row mt-4">
                        <div className="col-lg-3 col-md-6 mb-4">
                          <div className={`${styles.metricCard} ${styles.metricPrimary}`}>
                            <div className={styles.metricHeader}>
                              <div className={styles.metricIconWrapper}>
                                <FiMousePointer />
                              </div>
                              <div className={styles.metricTrend}>
                                <FiArrowUp className={styles.trendUp} />
                                <span>+12%</span>
                              </div>
                            </div>
                            <div className={styles.metricValue}>{analytics.totalClicks.toLocaleString()}</div>
                            <div className={styles.metricLabel}>Clics en Recomendaciones</div>
                            <div className={styles.metricMini}>
                              <div className={styles.miniChart}>
                                <div className={styles.miniBar} style={{ height: '40%' }}></div>
                                <div className={styles.miniBar} style={{ height: '55%' }}></div>
                                <div className={styles.miniBar} style={{ height: '35%' }}></div>
                                <div className={styles.miniBar} style={{ height: '70%' }}></div>
                                <div className={styles.miniBar} style={{ height: '60%' }}></div>
                                <div className={styles.miniBar} style={{ height: '85%' }}></div>
                                <div className={styles.miniBar} style={{ height: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                          <div className={`${styles.metricCard} ${styles.metricSuccess}`}>
                            <div className={styles.metricHeader}>
                              <div className={styles.metricIconWrapper}>
                                <FiShoppingCart />
                              </div>
                              <div className={styles.metricTrend}>
                                <FiArrowUp className={styles.trendUp} />
                                <span>+18%</span>
                              </div>
                            </div>
                            <div className={styles.metricValue}>{analytics.totalConversions.toLocaleString()}</div>
                            <div className={styles.metricLabel}>Conversiones</div>
                            <div className={styles.metricMini}>
                              <div className={styles.miniChart}>
                                <div className={styles.miniBar} style={{ height: '30%' }}></div>
                                <div className={styles.miniBar} style={{ height: '45%' }}></div>
                                <div className={styles.miniBar} style={{ height: '60%' }}></div>
                                <div className={styles.miniBar} style={{ height: '50%' }}></div>
                                <div className={styles.miniBar} style={{ height: '75%' }}></div>
                                <div className={styles.miniBar} style={{ height: '90%' }}></div>
                                <div className={styles.miniBar} style={{ height: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                          <div className={`${styles.metricCard} ${styles.metricWarning}`}>
                            <div className={styles.metricHeader}>
                              <div className={styles.metricIconWrapper}>
                                <FiTrendingUp />
                              </div>
                              <div className={styles.metricTrend}>
                                <FiArrowUp className={styles.trendUp} />
                                <span>+15%</span>
                              </div>
                            </div>
                            <div className={styles.metricValue}>€{analytics.totalConversions > 0 ? (analytics.revenue / analytics.totalConversions).toFixed(0) : 0}</div>
                            <div className={styles.metricLabel}>AOV Promedio</div>
                            <div className={styles.metricMini}>
                              <div className={styles.miniChart}>
                                <div className={styles.miniBar} style={{ height: '50%' }}></div>
                                <div className={styles.miniBar} style={{ height: '60%' }}></div>
                                <div className={styles.miniBar} style={{ height: '55%' }}></div>
                                <div className={styles.miniBar} style={{ height: '75%' }}></div>
                                <div className={styles.miniBar} style={{ height: '80%' }}></div>
                                <div className={styles.miniBar} style={{ height: '95%' }}></div>
                                <div className={styles.miniBar} style={{ height: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-4">
                          <div className={`${styles.metricCard} ${styles.metricInfo}`}>
                            <div className={styles.metricHeader}>
                              <div className={styles.metricIconWrapper}>
                                <FiPackage />
                              </div>
                              <div className={styles.metricStatus}>
                                <FiCheckCircle className={styles.statusSuccess} />
                              </div>
                            </div>
                            <div className={styles.metricValue}>{store?.catalog_size || products.length}</div>
                            <div className={styles.metricLabel}>Productos Sincronizados</div>
                            <div className={styles.metricFooter}>
                              <FiClock size={14} />
                              <span>{store?.last_sync_at ? new Date(store.last_sync_at).toLocaleString('es-ES') : 'No sincronizado'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Overview */}
                      <div className="row mt-4">
                        <div className="col-lg-8 mb-4">
                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>Rendimiento de Recomendaciones</h3>
                              <div className={styles.cardActions}>
                                <button className={styles.cardActionBtn}>
                                  <FiDownload /> Exportar
                                </button>
                              </div>
                            </div>
                            <div className={styles.performanceChart}>
                              <div className={styles.chartLegend}>
                                <div className={styles.legendItem}>
                                  <span className={`${styles.legendDot} ${styles.dotPrimary}`}></span>
                                  Clics
                                </div>
                                <div className={styles.legendItem}>
                                  <span className={`${styles.legendDot} ${styles.dotSuccess}`}></span>
                                  Conversiones
                                </div>
                              </div>
                              <div className={styles.chartArea}>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Lun</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '60%' }} title="120 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '15%' }} title="8 conversiones"></div>
                                  </div>
                                </div>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Mar</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '75%' }} title="150 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '20%' }} title="12 conversiones"></div>
                                  </div>
                                </div>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Mié</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '55%' }} title="110 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '12%' }} title="7 conversiones"></div>
                                  </div>
                                </div>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Jue</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '85%' }} title="170 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '25%' }} title="15 conversiones"></div>
                                  </div>
                                </div>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Vie</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '90%' }} title="180 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '28%' }} title="17 conversiones"></div>
                                  </div>
                                </div>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Sáb</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '100%' }} title="200 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '32%' }} title="19 conversiones"></div>
                                  </div>
                                </div>
                                <div className={styles.chartBar}>
                                  <div className={styles.barLabel}>Dom</div>
                                  <div className={styles.barGroup}>
                                    <div className={`${styles.barItem} ${styles.barPrimary}`} style={{ height: '70%' }} title="140 clics"></div>
                                    <div className={`${styles.barItem} ${styles.barSuccess}`} style={{ height: '18%' }} title="11 conversiones"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4 mb-4">
                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>Tasa de Conversión</h3>
                              <FiTarget className={styles.cardHeaderIcon} />
                            </div>
                            <div className={styles.conversionRate}>
                              <div className={styles.rateCircle}>
                                <svg viewBox="0 0 100 100" className={styles.rateCircleSvg}>
                                  <circle cx="50" cy="50" r="45" className={styles.rateCircleBg} />
                                  <circle cx="50" cy="50" r="45" className={styles.rateCircleProgress} style={{ strokeDasharray: '282.7', strokeDashoffset: `${282.7 - (282.7 * (analytics.conversionRate || 0) / 100)}` }} />
                                </svg>
                                <div className={styles.rateValue}>
                                  <span className={styles.rateNumber}>{analytics.conversionRate || 0}%</span>
                                  <span className={styles.rateLabel}>Conversión</span>
                                </div>
                              </div>
                              <div className={styles.rateStats}>
                                <div className={styles.rateStat}>
                                  <FiEye />
                                  <div>
                                    <div className={styles.rateStatValue}>{analytics.totalViews.toLocaleString()}</div>
                                    <div className={styles.rateStatLabel}>Impresiones</div>
                                  </div>
                                </div>
                                <div className={styles.rateStat}>
                                  <FiShoppingCart />
                                  <div>
                                    <div className={styles.rateStatValue}>{analytics.totalConversions.toLocaleString()}</div>
                                    <div className={styles.rateStatLabel}>Conversiones</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Top Products and Activity */}
                      <div className="row mt-4">
                        <div className="col-lg-8 mb-4">
                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>Productos Más Recomendados</h3>
                              <div className={styles.cardActions}>
                                <button className={styles.cardActionBtn}>
                                  <FiFilter /> Filtrar
                                </button>
                              </div>
                            </div>
                            <div className={styles.tableContainer}>
                              {products.length === 0 ? (
                                <p className="text-muted text-center py-4">No hay productos sincronizados aún</p>
                              ) : (
                                <table className={styles.modernTable}>
                                  <thead>
                                    <tr>
                                      <th>Producto</th>
                                      <th>Categoría</th>
                                      <th>Precio</th>
                                      <th>Stock</th>
                                      <th>Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {products.slice(0, 5).map((product) => (
                                      <tr key={product.id}>
                                        <td>
                                          <div className={styles.productCell}>
                                            {product.image_url ? (
                                              <img src={product.image_url} alt={product.name} className={styles.productImage} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                                            ) : (
                                              <div className={styles.productImage}>📦</div>
                                            )}
                                            <span>{product.name}</span>
                                          </div>
                                        </td>
                                        <td><span className={styles.badge}>{product.category || 'Sin categoría'}</span></td>
                                        <td>€{parseFloat(product.price || 0).toFixed(2)}</td>
                                        <td><strong>{product.stock_quantity || 0}</strong></td>
                                        <td>
                                          <span className={product.is_active ? styles.roiPositive : styles.roiNegative}>
                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4 mb-4">
                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>Actividad Reciente</h3>
                              <FiActivity className={styles.cardHeaderIcon} />
                            </div>
                            <div className={styles.activityTimeline}>
                              {store?.last_sync_at && (
                                <div className={styles.timelineItem}>
                                  <div className={`${styles.timelineDot} ${styles.dotSuccess}`}></div>
                                  <div className={styles.timelineContent}>
                                    <div className={styles.timelineTitle}>
                                      <FiCheckCircle /> Catálogo sincronizado
                                    </div>
                                    <div className={styles.timelineTime}>{new Date(store.last_sync_at).toLocaleString('es-ES')}</div>
                                    <div className={styles.timelineDesc}>{store.catalog_size || 0} productos actualizados</div>
                                  </div>
                                </div>
                              )}
                              {store?.shopify_domain && (
                                <div className={styles.timelineItem}>
                                  <div className={`${styles.timelineDot} ${styles.dotPrimary}`}></div>
                                  <div className={styles.timelineContent}>
                                    <div className={styles.timelineTitle}>
                                      <FiLink /> Shopify conectado
                                    </div>
                                    <div className={styles.timelineTime}>{store.shopify_domain}</div>
                                    <div className={styles.timelineDesc}>Sincronización automática activa</div>
                                  </div>
                                </div>
                              )}
                              <div className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${styles.dotWarning}`}></div>
                                <div className={styles.timelineContent}>
                                  <div className={styles.timelineTitle}>
                                    <FiZap /> Plan {store?.plan?.charAt(0).toUpperCase() + store?.plan?.slice(1) || 'Starter'}
                                  </div>
                                  <div className={styles.timelineTime}>{store?.subscription_status === 'trial' ? 'Prueba gratuita' : 'Activo'}</div>
                                  <div className={styles.timelineDesc}>
                                    {store?.trial_ends_at && store?.subscription_status === 'trial'
                                      ? `Expira: ${new Date(store.trial_ends_at).toLocaleDateString('es-ES')}`
                                      : 'Suscripción activa'}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${styles.dotInfo}`}></div>
                                <div className={styles.timelineContent}>
                                  <div className={styles.timelineTitle}>
                                    <FiAward /> Estadísticas del mes
                                  </div>
                                  <div className={styles.timelineTime}>{analytics.totalViews} impresiones</div>
                                  <div className={styles.timelineDesc}>{analytics.totalConversions} conversiones</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>Enlaces Rápidos</h3>
                              <FiExternalLink className={styles.cardHeaderIcon} />
                            </div>
                            <div className={styles.quickLinks}>
                              <a href="#" className={styles.quickLink}>
                                <FiPackage />
                                <span>Documentación API</span>
                              </a>
                              <a href="#" className={styles.quickLink}>
                                <FiZap />
                                <span>Guía de Integración</span>
                              </a>
                              <a href="/b2b/demo" className={styles.quickLink}>
                                <FiEye />
                                <span>Ver Demo en Vivo</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Catalog Tab */}
              {activeTab === 'catalog' && (
                <div>
                  {/* Empty State para Catálogo */}
                  {store && store.catalog_size === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>📦</div>
                      <h2>No tienes productos en tu catálogo</h2>
                      <p>Para comenzar a generar recomendaciones inteligentes, necesitas sincronizar tus productos.</p>

                      <div className={styles.emptyStateActions}>
                        <h3>¿Cómo agregar productos?</h3>

                        <div className={styles.integrationOptions}>
                          <div className={styles.integrationCard}>
                            <FiCode />
                            <h4>Integración API</h4>
                            <p>Conecta tu tienda usando nuestra API REST</p>
                            <button className="btn btn-outline-primary" onClick={() => setActiveTab('widget')}>
                              Ver Documentación
                            </button>
                          </div>

                          <div className={styles.integrationCard}>
                            <FiUpload />
                            <h4>Importación CSV</h4>
                            <p>Sube un archivo CSV con tus productos</p>
                            <button className="btn btn-outline-primary" disabled>
                              Próximamente
                            </button>
                          </div>

                          <div className={styles.integrationCard}>
                            <FiLink />
                            <h4>Shopify / WooCommerce</h4>
                            <p>Conecta directamente tu plataforma</p>
                            <button className="btn btn-outline-primary" disabled>
                              Próximamente
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className={styles.pageTitle}>Catálogo</h1>
                      <div className="row mt-4">
                        <div className="col-12 mb-4">
                          <div className={styles.card}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h3>Estado de Sincronización</h3>
                              <button className="btn btn-primary">Sincronizar Ahora</button>
                            </div>
                            <div className={styles.syncStatus}>
                              <div className={styles.syncItem}>
                                <span>Total productos:</span>
                                <strong>{store?.catalog_size || products.length}</strong>
                              </div>
                              <div className={styles.syncItem}>
                                <span>Última sincronización:</span>
                                <strong>{store?.last_sync_at ? new Date(store.last_sync_at).toLocaleString('es-ES') : 'No sincronizado'}</strong>
                              </div>
                              <div className={styles.syncItem}>
                                <span>Estado:</span>
                                <strong className={styles.statusSuccess}>{store?.shopify_domain ? 'Conectado a Shopify' : 'Sincronizado'}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 mb-4">
                          <div className={styles.card}>
                            <h3>Productos Sincronizados</h3>
                            <div className={styles.tableContainer}>
                              {loadingData ? (
                                <div className={styles.loadingContainer}>
                                  <div className={styles.spinner}></div>
                                  <p>Cargando productos...</p>
                                </div>
                              ) : products.length === 0 ? (
                                <p className="text-muted">No hay productos sincronizados aún.</p>
                              ) : (
                                <table className={styles.dataTable}>
                                  <thead>
                                    <tr>
                                      <th>Imagen</th>
                                      <th>Nombre</th>
                                      <th>Categoría</th>
                                      <th>Precio</th>
                                      <th>Stock</th>
                                      <th>Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {products.map((product) => (
                                      <tr key={product.id}>
                                        <td>
                                          {product.image_url ? (
                                            <img
                                              src={product.image_url}
                                              alt={product.name}
                                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                                            />
                                          ) : (
                                            <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              <FiPackage />
                                            </div>
                                          )}
                                        </td>
                                        <td>{product.name}</td>
                                        <td>{product.category || '-'}</td>
                                        <td>€{parseFloat(product.price || 0).toFixed(2)}</td>
                                        <td>{product.stock_quantity || 0}</td>
                                        <td>
                                          <span className={product.is_active ? styles.badgeSuccess : styles.badgeWarning}>
                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Widget Config Tab */}
              {activeTab === 'widget' && (
                <div>
                  <h1 className={styles.pageTitle}>Configuración del Widget</h1>
                  <div className="row mt-4">
                    <div className="col-md-8 mb-4">
                      <div className={styles.card}>
                        <h3>Personalización</h3>
                        <form>
                          <div className="mb-3">
                            <label className="form-label">Tema del Widget</label>
                            <select className="form-select">
                              <option>Claro</option>
                              <option>Oscuro</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Texto del Widget</label>
                            <input
                              type="text"
                              className="form-control"
                              defaultValue="Combínalo con..."
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Número de Sugerencias</label>
                            <input
                              type="number"
                              className="form-control"
                              min="1"
                              max="5"
                              defaultValue="3"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Posición</label>
                            <select className="form-select">
                              <option>Debajo del producto</option>
                              <option>Barra lateral</option>
                            </select>
                          </div>
                          <button type="submit" className="btn btn-primary">
                            Guardar Cambios
                          </button>
                        </form>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className={styles.card}>
                        <h3>🔑 Tu API Key</h3>
                        <p className={styles.codeHelp}>
                          Usa esta API Key para conectar tu app de Shopify o integrar el widget en tu tienda:
                        </p>

                        <div className={styles.apiKeySection}>
                          <div className="input-group mb-3">
                            <input
                              type={showApiKey ? "text" : "password"}
                              className="form-control"
                              value={store?.api_key || 'Cargando...'}
                              readOnly
                              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              title={showApiKey ? "Ocultar" : "Mostrar"}
                            >
                              <FiEye />
                            </button>
                            <button
                              className={`btn ${apiKeyCopied ? 'btn-success' : 'btn-primary'}`}
                              type="button"
                              onClick={copyApiKey}
                              disabled={!store?.api_key}
                            >
                              {apiKeyCopied ? <><FiCheckCircle /> Copiado!</> : <><FiCopy /> Copiar</>}
                            </button>
                          </div>
                          <small className="text-muted d-block mb-3">
                            ⚠️ Mantén tu API Key segura. No la compartas públicamente.
                          </small>
                        </div>

                        <hr />

                        <h4 className="mt-3">📱 Integración con Shopify</h4>
                        <ol className={styles.integrationSteps}>
                          <li>Instala la app "MyOutfit" desde la tienda de Shopify</li>
                          <li>Ve a Configuración en la app</li>
                          <li>Pega tu API Key en el campo "API Key de MyOutfit"</li>
                          <li>¡Listo! Tu inventario y estadísticas se sincronizarán automáticamente</li>
                        </ol>

                        <hr />

                        <h4 className="mt-3">🌐 Widget para otras plataformas</h4>
                        <p className={styles.codeHelp}>
                          Copia este código y pégalo en tus páginas de producto:
                        </p>
                        <pre className={styles.codeBlock}>
                          <code>{`<script src="https://myoutfitapp.com/widget.js"></script>
<div 
  id="myoutfit-recommendations" 
  data-product-id="PROD_ID" 
  data-api-key="${store?.api_key ? getMaskedApiKey() : 'TU_API_KEY'}"
></div>`}</code>
                        </pre>
                        <button
                          className="btn btn-outline-primary w-100 mt-2"
                          onClick={() => {
                            const code = `<script src="https://myoutfitapp.com/widget.js"></script>\n<div \n  id="myoutfit-recommendations" \n  data-product-id="PROD_ID" \n  data-api-key="${store?.api_key || 'TU_API_KEY'}"\n></div>`;
                            navigator.clipboard.writeText(code);
                          }}
                        >
                          <FiCopy /> Copiar Código de Integración
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h1 className={styles.pageTitle}>Analítica</h1>
                  <div className="row mt-4">
                    <div className="col-12 mb-4">
                      <div className={styles.card}>
                        <h3>Métricas de Rendimiento</h3>
                        <div className={styles.chartPlaceholder}>
                          <p>Gráfico de clics y conversiones (últimos 30 días)</p>
                          <div className={styles.chartMock}>
                            <div className={styles.bar} style={{ height: '60%' }}></div>
                            <div className={styles.bar} style={{ height: '80%' }}></div>
                            <div className={styles.bar} style={{ height: '45%' }}></div>
                            <div className={styles.bar} style={{ height: '90%' }}></div>
                            <div className={styles.bar} style={{ height: '70%' }}></div>
                            <div className={styles.bar} style={{ height: '85%' }}></div>
                            <div className={styles.bar} style={{ height: '95%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className={styles.card}>
                        <h3>Top Combinaciones</h3>
                        <div className={styles.combinationsList}>
                          <div className={styles.combinationItem}>
                            <span>Camiseta Blanca + Pantalón Negro</span>
                            <strong>245 veces</strong>
                          </div>
                          <div className={styles.combinationItem}>
                            <span>Vestido Floral + Bolso Cuero</span>
                            <strong>189 veces</strong>
                          </div>
                          <div className={styles.combinationItem}>
                            <span>Pantalón Vaquero + Cazadora</span>
                            <strong>156 veces</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className={styles.card}>
                        <h3>Resumen del Período</h3>
                        <div className={styles.roiMetrics}>
                          <div className={styles.roiItem}>
                            <span>Total Views:</span>
                            <strong>{analytics.totalViews.toLocaleString()}</strong>
                          </div>
                          <div className={styles.roiItem}>
                            <span>Ingresos Atribuidos:</span>
                            <strong>€{analytics.revenue.toLocaleString()}</strong>
                          </div>
                          <div className={styles.roiItem}>
                            <span>Tasa de Conversión:</span>
                            <strong>{analytics.conversionRate}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div>
                  <h1 className={styles.pageTitle}>Facturación</h1>
                  <div className="row mt-4">
                    <div className="col-md-8 mb-4">
                      <div className={styles.card}>
                        <h3>Plan Actual</h3>
                        <div className={styles.planInfo}>
                          <div className={styles.planName}>Plan {store?.plan?.charAt(0).toUpperCase() + store?.plan?.slice(1) || 'Starter'}</div>
                          <div className={styles.planPrice}>
                            {store?.subscription_status === 'trial' ? 'Prueba Gratuita' :
                              store?.plan === 'starter' ? '€29/mes' :
                                store?.plan === 'pro' ? '€149/mes' :
                                  store?.plan === 'enterprise' ? 'Contactar' : '€29/mes'}
                          </div>
                          <div className={styles.planFeatures}>
                            <ul>
                              <li>Hasta {store?.max_products?.toLocaleString() || '100'} productos</li>
                              <li>{store?.max_api_requests?.toLocaleString() || '1,000'} peticiones API/mes</li>
                              <li>Dashboard de analítica</li>
                              <li>{store?.plan === 'enterprise' ? 'Soporte dedicado' : 'Soporte por email'}</li>
                            </ul>
                          </div>
                          <button className="btn btn-outline-primary">Cambiar Plan</button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className={styles.card}>
                        <h3>Uso del Mes</h3>
                        <div className={styles.usageStats}>
                          <div className={styles.usageItem}>
                            <span>Productos:</span>
                            <strong>{store?.catalog_size || 0} / {store?.max_products?.toLocaleString() || '100'}</strong>
                          </div>
                          <div className={styles.usageItem}>
                            <span>Peticiones API:</span>
                            <strong>{store?.api_requests_this_month?.toLocaleString() || 0} / {store?.max_api_requests?.toLocaleString() || '1,000'}</strong>
                          </div>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${store?.max_api_requests ? ((store?.api_requests_this_month || 0) / store.max_api_requests) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.card}>
                        <h3>Método de Pago</h3>
                        <p>Visa •••• 4242</p>
                        <button className="btn btn-outline-primary w-100">Actualizar Pago</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <UserConfigModal
        isOpen={showUserConfig}
        onClose={() => setShowUserConfig(false)}
        user={user}
        store={store}
        onSave={handleSaveUserConfig}
      />
    </>
  );
}


