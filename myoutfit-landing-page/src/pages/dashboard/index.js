import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '@/styles/Dashboard.module.scss';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { dashboardTranslations } from '@/translations/dashboardTranslations';
import UserConfigModal from '@/components/UserConfigModal';

function WidgetPreviewSample({ count, theme, title, subtitle, styles, storeProducts = [], t }) {
  const displayData = useMemo(() => {
    if (!storeProducts || storeProducts.length === 0) return { current: null, recs: [] };
    const shuffled = [...storeProducts].sort(() => Math.random() - 0.5);
    const current = shuffled[0];
    const recs = shuffled.slice(1, Math.min(count, storeProducts.length));
    return { current, recs };
  }, [storeProducts, count]);

  const total = displayData.current
    ? parseFloat(displayData.current.price || 0) + displayData.recs.reduce((s, p) => s + parseFloat(p.price || 0), 0)
    : 0;

  return (
    <div className={`${styles.widgetPreview} ${styles.widgetPreviewShopify} ${theme === 'dark' ? styles.widgetPreviewDark : ''}`}>
      <h3 className={styles.widgetPreviewMainTitle}>{title}</h3>
      <p className={styles.widgetPreviewSubtitle}>{subtitle || (t?.combineForPerfectOutfit ?? 'Combina estas prendas para un outfit perfecto')}</p>
      {!displayData.current ? (
        <p className={styles.widgetPreviewEmpty}>
          {t?.addProductsToCatalog ?? 'Añade productos al catálogo para ver las recomendaciones aquí.'}
        </p>
      ) : (
        <>
          <div className={styles.widgetPreviewProducts}>
            <div className={`${styles.widgetPreviewCard} ${styles.widgetPreviewCardSelected}`}>
              <div className={styles.widgetPreviewImgWrap}>
                <img src={displayData.current.image_url || ''} alt={displayData.current.name} className={styles.widgetPreviewImg} />
                <span className={styles.widgetPreviewBadge}>{t?.yourSelection ?? 'TU SELECCIÓN'}</span>
              </div>
              <div className={styles.widgetPreviewCardInfo}>
                <span>{displayData.current.name}</span>
                <span className={styles.widgetPreviewPrice}>€{parseFloat(displayData.current.price || 0).toFixed(2)}</span>
              </div>
            </div>
            {displayData.recs.map((p, i) => (
              <React.Fragment key={p.id || i}>
                <span className={styles.widgetPreviewPlus}>+</span>
                <div className={styles.widgetPreviewCard}>
                  <div className={styles.widgetPreviewImgWrap}>
                    <img src={p.image_url || ''} alt={p.name} className={styles.widgetPreviewImg} />
                  </div>
                  <div className={styles.widgetPreviewCardInfo}>
                    <span>{p.name}</span>
                    <span className={styles.widgetPreviewPrice}>€{parseFloat(p.price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className={styles.widgetPreviewFooter}>
            <span className={styles.widgetPreviewTotal}>{t?.outfitTotal ?? 'Total del outfit:'} <strong>€{total.toFixed(2)}</strong></span>
            <button type="button" className={styles.widgetPreviewBtn}>
              <FiShoppingCart style={{ width: 18, height: 18 }} /> {t?.addOutfitToCart ?? 'Añadir outfit al carrito'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
import NotificationsPanel from '@/components/NotificationsPanel';
import CsvUploadModal from '@/components/CsvUploadModal';
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
  const { user, store, loading: authLoading, signIn, signOut, refreshStore } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;

  // Sincronizar idioma con preferencia guardada del usuario al cargar
  useEffect(() => {
    if (user?.user_metadata?.language && user.user_metadata.language !== language) {
      toggleLanguage(user.user_metadata.language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo sincronizar cuando cambie metadata del usuario
  }, [user?.user_metadata?.language]);
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
  const [showCsvUpload, setShowCsvUpload] = useState(false);

  // Widget settings (cargados desde store.widget_settings)
  const defaultWidgetSettings = {
    theme: 'light',
    title: 'Complete Your Look',
    subtitle: t.combineForPerfectOutfit,
    num_suggestions: 3,
    position: 'below',
  };
  const [widgetSettings, setWidgetSettings] = useState(defaultWidgetSettings);
  const [savingWidget, setSavingWidget] = useState(false);

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

  // Cargar widget settings cuando el store cambie
  useEffect(() => {
    if (store?.widget_settings && typeof store.widget_settings === 'object') {
      setWidgetSettings((prev) => ({
        theme: store.widget_settings.theme ?? 'light',
        title: store.widget_settings.title ?? 'Complete Your Look',
        subtitle: store.widget_settings.subtitle ?? t.combineForPerfectOutfit,
        num_suggestions: store.widget_settings.num_suggestions ?? 3,
        position: store.widget_settings.position ?? 'below',
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- language/t.combineForPerfectOutfit used for default subtitle
  }, [store?.id, store?.widget_settings, language]);

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
      t.syncStarted,
      t.syncStartedDesc,
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
          const delta = Math.abs(newCount - prevCount);
          const msg = newCount > prevCount
            ? t.inventoryAdded.replace('{count}', delta).replace('{total}', newCount)
            : t.inventoryRemoved.replace('{count}', delta).replace('{total}', newCount);
          addNotification(t.inventoryUpdated, msg, 'inventory_update');
        } else {
          addNotification(
            t.syncCompleted,
            `${newCount} ${t.productsUpdated}`,
            'success'
          );
        }
      } else if (productsError) {
        addNotification(t.syncError, t.syncErrorDesc, 'warning');
      }
    } catch (error) {
      console.error('Error syncing catalog:', error);
      addNotification(t.syncError, t.unexpectedError, 'warning');
    } finally {
      setLoadingData(false);
    }
  };

  // Guardar configuración del widget
  const handleSaveWidgetConfig = async (e) => {
    e?.preventDefault();
    if (!store?.id) return;
    setSavingWidget(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          widget_settings: widgetSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id);

      if (error) throw error;
      await refreshStore?.();
      addNotification(t.configSaved, t.configSavedDesc, 'success');
    } catch (err) {
      console.error('Error saving widget config:', err);
      addNotification(t.error, t.couldNotSave, 'warning');
    } finally {
      setSavingWidget(false);
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
      let errorMessage = t.loginError;

      // Mensajes específicos según el tipo de error
      if (signInError.message?.includes('Email not confirmed')) {
        errorMessage = '📧 ' + t.emailNotConfirmed;
      } else if (signInError.message?.includes('Invalid login credentials')) {
        errorMessage = t.invalidCredentials;
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
    try {
      if (store?.id) {
        const { error: storeError } = await supabase
          .from('stores')
          .update({ name: formData.storeName })
          .eq('id', store.id);

        if (storeError) throw storeError;
      }

      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          language: formData.language,
          notifications: formData.notifications,
        },
      });

      if (userError) throw userError;

      // Actualizar idioma en la UI de inmediato (sin esperar refresh)
      toggleLanguage(formData.language);

      // Refrescar store en segundo plano (no bloquear el cierre del modal)
      refreshStore?.();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(t.saveError);
      throw error;
    }
  };

  if (authLoading) {
    return (
      <>
        <Head>
          <title>{t.pageTitle}</title>
        </Head>
        <main className={styles.dashboardMain}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>{t.loading}</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>{t.pageTitle}</title>
        </Head>
        <main className={styles.dashboardMain}>
          <section className={styles.loginSection}>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-5">
                  <div className={styles.loginCard}>
                    <h2>{t.loginTitle}</h2>
                    <p className={styles.loginSubtitle}>
                      {t.loginSubtitle}
                    </p>
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleLogin}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          {t.email}
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.emailPlaceholder}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          {t.password}
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t.passwordPlaceholder}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? t.signingIn : t.signIn}
                      </button>
                    </form>
                    <div className={styles.loginFooter}>
                      <p className={styles.demoInfo}>
                        <strong>🎯 {t.demoMode}</strong>
                      </p>
                      <p>
                        {t.noAccount}{' '}
                        <Link href="/b2b/register">{t.registerHere}</Link>
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
        <title>{t.pageTitle}</title>
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
                  <p className={styles.storeName}>{t.dashboard}</p>
                </div>
              </div>
            </div>
            <nav className={styles.sidebarNav}>
              <button
                className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <FiBarChart2 /> <span>{t.overviewNav}</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'catalog' ? styles.active : ''}`}
                onClick={() => setActiveTab('catalog')}
              >
                <FiPackage /> <span>{t.catalogNav}</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'widget' ? styles.active : ''}`}
                onClick={() => setActiveTab('widget')}
              >
                <FiSettings /> <span>{t.widgetNav}</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <FiTrendingUp /> <span>{t.analyticsNav}</span>
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'billing' ? styles.active : ''}`}
                onClick={() => setActiveTab('billing')}
              >
                <FiDollarSign /> <span>{t.billingNav}</span>
              </button>
            </nav>
            <div className={styles.sidebarFooter}>
              <div
                className={styles.userProfile}
                onClick={() => setShowUserConfig(true)}
                title={t.configureProfile}
              >
                <div className={styles.userAvatar}>
                  {store?.name?.charAt(0)?.toUpperCase() || <FiUser />}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{store?.name || t.myStore}</div>
                  <div className={styles.userEmail}>{user?.email || t.storeEmail}</div>
                  <div className={styles.userPlan}>
                    {t.plan} {store?.plan?.charAt(0)?.toUpperCase() + store?.plan?.slice(1) || 'Starter'}
                  </div>
                </div>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>
                <FiLogOut /> <span>{t.logout}</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className={styles.contentWrapper}>
            {/* Top Header */}
            <header className={styles.topHeader}>
              <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>
                  {activeTab === 'overview' && t.overview}
                  {activeTab === 'catalog' && t.catalogProducts}
                  {activeTab === 'widget' && t.widgetConfig}
                  {activeTab === 'analytics' && t.detailedAnalytics}
                  {activeTab === 'billing' && t.billingPlans}
                </h1>
              </div>
              <div className={styles.headerRight}>
                <div className={styles.searchBar}>
                  <FiSearch />
                  <input type="text" placeholder={t.search} />
                </div>
                <div className={styles.headerActions}>
                  <button
                    className={styles.headerButton}
                    title={t.notifications}
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
                      <option value="7days">{t.last7Days}</option>
                      <option value="30days">{t.last30Days}</option>
                      <option value="90days">{t.last90Days}</option>
                      <option value="year">{t.thisYear}</option>
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
                      <h2>{t.welcomeTitle}</h2>
                      <p>{t.welcomeMessage}</p>

                      <div className={styles.onboardingSteps}>
                        <div className={styles.onboardingStep}>
                          <div className={styles.stepNumber}>1</div>
                          <div className={styles.stepContent}>
                            <h4>{t.syncCatalog}</h4>
                            <p>{t.syncCatalogDesc}</p>
                            <button className={styles.stepButton} onClick={() => setActiveTab('catalog')}>
                              <FiPackage /> {t.goToCatalog}
                            </button>
                          </div>
                        </div>

                        <div className={styles.onboardingStep}>
                          <div className={styles.stepNumber}>2</div>
                          <div className={styles.stepContent}>
                            <h4>{t.configureWidget}</h4>
                            <p>{t.configureWidgetDesc}</p>
                            <button className={styles.stepButton} onClick={() => setActiveTab('widget')}>
                              <FiCode /> {t.viewDocs}
                            </button>
                          </div>
                        </div>

                        <div className={styles.onboardingStep}>
                          <div className={styles.stepNumber}>3</div>
                          <div className={styles.stepContent}>
                            <h4>{t.startSelling}</h4>
                            <p>{t.startSellingDesc}</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.welcomeFooter}>
                        <p>📚 {t.needHelp} <a href="/b2b/docs" target="_blank">{t.readDocs}</a></p>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions Bar - Solo mostrar si hay productos */}
                  {store && store.catalog_size > 0 && (
                    <div className={styles.quickActions}>
                      <button className={styles.quickActionBtn} onClick={handleSyncCatalog}>
                        <FiRefreshCw /> {t.syncCatalogBtn}
                      </button>
                      <button className={styles.quickActionBtn}>
                        <FiDownload /> {t.exportData}
                      </button>
                      <button className={styles.quickActionBtn}>
                        <FiSettings /> {t.configureWidgetBtn}
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
                            <div className={styles.metricLabel}>{t.clicksOnRecommendations}</div>
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
                            <div className={styles.metricLabel}>{t.conversions}</div>
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
                            <div className={styles.metricLabel}>{t.avgAov}</div>
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
                            <div className={styles.metricLabel}>{t.syncedProducts}</div>
                            <div className={styles.metricFooter}>
                              <FiClock size={14} />
                              <span>{store?.last_sync_at ? new Date(store.last_sync_at).toLocaleString() : t.notSynced}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Overview */}
                      <div className="row mt-4">
                        <div className="col-lg-8 mb-4">
                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>{t.recommendationPerformance}</h3>
                              <div className={styles.cardActions}>
                                <button className={styles.cardActionBtn}>
                                  <FiDownload /> {t.export}
                                </button>
                              </div>
                            </div>
                            <div className={styles.performanceChart}>
                              <div className={styles.chartLegend}>
                                <div className={styles.legendItem}>
                                  <span className={`${styles.legendDot} ${styles.dotPrimary}`}></span>
                                  {t.clicks}
                                </div>
                                <div className={styles.legendItem}>
                                  <span className={`${styles.legendDot} ${styles.dotSuccess}`}></span>
                                  {t.conversions}
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
                              <h3>{t.conversionRate}</h3>
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
                                  <span className={styles.rateLabel}>{t.conversionLabel}</span>
                                </div>
                              </div>
                              <div className={styles.rateStats}>
                                <div className={styles.rateStat}>
                                  <FiEye />
                                  <div>
                                    <div className={styles.rateStatValue}>{analytics.totalViews.toLocaleString()}</div>
                                    <div className={styles.rateStatLabel}>{t.impressions}</div>
                                  </div>
                                </div>
                                <div className={styles.rateStat}>
                                  <FiShoppingCart />
                                  <div>
                                    <div className={styles.rateStatValue}>{analytics.totalConversions.toLocaleString()}</div>
                                    <div className={styles.rateStatLabel}>{t.conversions}</div>
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
                              <h3>{t.mostRecommended}</h3>
                              <div className={styles.cardActions}>
                                <button className={styles.cardActionBtn}>
                                  <FiFilter /> {t.filter}
                                </button>
                              </div>
                            </div>
                            <div className={styles.tableContainer}>
                              {products.length === 0 ? (
                                <p className="text-muted text-center py-4">{t.noProductsSynced}</p>
                              ) : (
                                <table className={styles.modernTable}>
                                  <thead>
                                    <tr>
                                      <th>{t.product}</th>
                                      <th>{t.category}</th>
                                      <th>{t.price}</th>
                                      <th>{t.stock}</th>
                                      <th>{t.status}</th>
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
                                        <td><span className={styles.badge}>{product.category || t.noCategory}</span></td>
                                        <td>€{parseFloat(product.price || 0).toFixed(2)}</td>
                                        <td><strong>{product.stock_quantity || 0}</strong></td>
                                        <td>
                                          <span className={product.is_active ? styles.roiPositive : styles.roiNegative}>
                                            {product.is_active ? t.active : t.inactive}
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
                              <h3>{t.recentActivity}</h3>
                              <FiActivity className={styles.cardHeaderIcon} />
                            </div>
                            <div className={styles.activityTimeline}>
                              {store?.last_sync_at && (
                                <div className={styles.timelineItem}>
                                  <div className={`${styles.timelineDot} ${styles.dotSuccess}`}></div>
                                  <div className={styles.timelineContent}>
                                    <div className={styles.timelineTitle}>
                                      <FiCheckCircle /> {t.catalogSynced}
                                    </div>
                                    <div className={styles.timelineTime}>{new Date(store.last_sync_at).toLocaleString()}</div>
                                    <div className={styles.timelineDesc}>{store.catalog_size || 0} {t.productsUpdated}</div>
                                  </div>
                                </div>
                              )}
                              {store?.shopify_domain && (
                                <div className={styles.timelineItem}>
                                  <div className={`${styles.timelineDot} ${styles.dotPrimary}`}></div>
                                  <div className={styles.timelineContent}>
                                    <div className={styles.timelineTitle}>
                                      <FiLink /> {t.shopifyConnected}
                                    </div>
                                    <div className={styles.timelineTime}>{store.shopify_domain}</div>
                                    <div className={styles.timelineDesc}>{t.autoSyncActive}</div>
                                  </div>
                                </div>
                              )}
                              <div className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${styles.dotWarning}`}></div>
                                <div className={styles.timelineContent}>
                                  <div className={styles.timelineTitle}>
                                    <FiZap /> Plan {store?.plan?.charAt(0).toUpperCase() + store?.plan?.slice(1) || 'Starter'}
                                  </div>
                                  <div className={styles.timelineTime}>{store?.subscription_status === 'trial' ? t.freeTrial : t.activeSubscription}</div>
                                  <div className={styles.timelineDesc}>
                                    {store?.trial_ends_at && store?.subscription_status === 'trial'
                                      ? `${t.expires}: ${new Date(store.trial_ends_at).toLocaleDateString()}`
                                      : t.subscriptionActive}
                                  </div>
                                </div>
                              </div>
                              <div className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${styles.dotInfo}`}></div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineTitle}>
                                      <FiAward /> {t.monthlyStats}
                                    </div>
                                    <div className={styles.timelineTime}>{analytics.totalViews} {t.impressions}</div>
                                    <div className={styles.timelineDesc}>{analytics.totalConversions} {t.conversions}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={styles.card}>
                            <div className={styles.cardHeader}>
                              <h3>{t.quickLinks}</h3>
                              <FiExternalLink className={styles.cardHeaderIcon} />
                            </div>
                            <div className={styles.quickLinks}>
                              <a href="#" className={styles.quickLink}>
                                <FiPackage />
                                <span>{t.apiDocs}</span>
                              </a>
                              <a href="#" className={styles.quickLink}>
                                <FiZap />
                                <span>{t.integrationGuide}</span>
                              </a>
                              <Link href="/b2b/demo" className={styles.quickLink}>
                                <FiEye />
                                <span>{t.viewLiveDemo}</span>
                              </Link>
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
                      <h2>{t.noProductsInCatalog}</h2>
                      <p>{t.catalogEmptyDesc}</p>

                      <div className={styles.emptyStateActions}>
                        <h3>{t.howToAddProducts}</h3>

                        <div className={styles.integrationOptions}>
                          <div className={styles.integrationCard}>
                            <FiCode />
                            <h4>{t.apiIntegration}</h4>
                            <p>{t.apiIntegrationDesc}</p>
                            <button className="btn btn-outline-primary" onClick={() => setActiveTab('widget')}>
                              {t.viewDocumentation}
                            </button>
                          </div>

                          <div className={styles.integrationCard}>
                            <FiUpload />
                            <h4>{t.csvImport}</h4>
                            <p>{t.csvImportDesc}</p>
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => setShowCsvUpload(true)}
                            >
                              {t.uploadCsv}
                            </button>
                          </div>

                          <div className={styles.integrationCard}>
                            <FiLink />
                            <h4>{t.shopifyWooCommerce}</h4>
                            <p>{t.shopifyWooCommerceDesc}</p>
                            <button className="btn btn-outline-primary" disabled>
                              {t.comingSoon}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className={styles.pageTitle}>{t.catalog}</h1>
                      <div className="row mt-4">
                        <div className="col-12 mb-4">
                          <div className={styles.card}>
                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                              <h3>{t.syncStatus}</h3>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => setShowCsvUpload(true)}
                                >
                                  <FiUpload className="me-2" />
                                  {t.importCsv}
                                </button>
                                <button className="btn btn-primary" onClick={handleSyncCatalog}>
                                  {t.syncNow}
                                </button>
                              </div>
                            </div>
                            <div className={styles.syncStatus}>
                              <div className={styles.syncItem}>
                                <span>{t.totalProducts}</span>
                                <strong>{store?.catalog_size || products.length}</strong>
                              </div>
                              <div className={styles.syncItem}>
                                <span>{t.lastSync}</span>
                                <strong>{store?.last_sync_at ? new Date(store.last_sync_at).toLocaleString() : t.notSynced}</strong>
                              </div>
                              <div className={styles.syncItem}>
                                <span>{t.status}:</span>
                                <strong className={styles.statusSuccess}>{store?.shopify_domain ? t.connectedToShopify : t.synced}</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 mb-4">
                          <div className={styles.card}>
                            <h3>{t.syncedProductsTitle}</h3>
                            <div className={styles.tableContainer}>
                              {loadingData ? (
                                <div className={styles.loadingContainer}>
                                  <div className={styles.spinner}></div>
                                  <p>{t.loadingProducts}</p>
                                </div>
                              ) : products.length === 0 ? (
                                <p className="text-muted">{t.noProductsSynced}</p>
                              ) : (
                                <table className={styles.dataTable}>
                                  <thead>
                                    <tr>
                                      <th>{t.image}</th>
                                      <th>{t.name}</th>
                                      <th>{t.category}</th>
                                      <th>{t.price}</th>
                                      <th>{t.stock}</th>
                                      <th>{t.status}</th>
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
                                            {product.is_active ? t.active : t.inactive}
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
                  <h1 className={styles.pageTitle}>{t.widgetConfigTitle}</h1>
                  <div className="row mt-4">
                    <div className="col-lg-7 mb-4">
                      <div className={`${styles.card} ${styles.widgetConfigCard}`}>
                        <h3 className={styles.widgetConfigTitle}>{t.customization}</h3>
                        <p className={styles.widgetConfigDesc}>
                          {t.customizationDesc}
                        </p>
                        <form onSubmit={handleSaveWidgetConfig}>
                          <div className={styles.widgetConfigField}>
                            <label className={styles.widgetConfigLabel}>{t.widgetTheme}</label>
                            <div className={styles.widgetConfigRadioGroup}>
                              <label className={styles.widgetConfigRadio}>
                                <input
                                  type="radio"
                                  name="theme"
                                  value="light"
                                  checked={widgetSettings.theme === 'light'}
                                  onChange={(e) => setWidgetSettings((s) => ({ ...s, theme: e.target.value }))}
                                />
                                <span>{t.light}</span>
                              </label>
                              <label className={styles.widgetConfigRadio}>
                                <input
                                  type="radio"
                                  name="theme"
                                  value="dark"
                                  checked={widgetSettings.theme === 'dark'}
                                  onChange={(e) => setWidgetSettings((s) => ({ ...s, theme: e.target.value }))}
                                />
                                <span>{t.dark}</span>
                              </label>
                            </div>
                          </div>
                          <div className={styles.widgetConfigField}>
                            <label className={styles.widgetConfigLabel}>{t.widgetTitle}</label>
                            <input
                              type="text"
                              className={`form-control ${styles.widgetConfigInput}`}
                              value={widgetSettings.title}
                              onChange={(e) => setWidgetSettings((s) => ({ ...s, title: e.target.value }))}
                              placeholder="Complete Your Look"
                            />
                          </div>
                          <div className={styles.widgetConfigField}>
                            <label className={styles.widgetConfigLabel}>{t.subtitle}</label>
                            <input
                              type="text"
                              className={`form-control ${styles.widgetConfigInput}`}
                              value={widgetSettings.subtitle || ''}
                              onChange={(e) => setWidgetSettings((s) => ({ ...s, subtitle: e.target.value }))}
                              placeholder="Combina estas prendas para un outfit perfecto"
                            />
                          </div>
                          <div className={styles.widgetConfigField}>
                            <label className={styles.widgetConfigLabel}>
                              {t.numSuggestions}
                              <span className={styles.widgetConfigValue}>{widgetSettings.num_suggestions}</span>
                            </label>
                            <input
                              type="range"
                              className="form-range"
                              min="1"
                              max="5"
                              value={widgetSettings.num_suggestions}
                              onChange={(e) => setWidgetSettings((s) => ({ ...s, num_suggestions: parseInt(e.target.value) }))}
                            />
                          </div>
                          <div className={styles.widgetConfigField}>
                            <label className={styles.widgetConfigLabel}>{t.position}</label>
                            <select
                              className={`form-select ${styles.widgetConfigInput}`}
                              value={widgetSettings.position}
                              onChange={(e) => setWidgetSettings((s) => ({ ...s, position: e.target.value }))}
                            >
                              <option value="below">{t.belowProduct}</option>
                              <option value="sidebar">{t.sidebar}</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            className={`btn btn-primary ${styles.widgetConfigSaveBtn}`}
                            disabled={savingWidget}
                          >
                            {savingWidget ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                {t.saving}
                              </>
                            ) : (
                              t.saveChanges
                            )}
                          </button>
                        </form>

                        {/* Vista previa del widget */}
                        <WidgetPreviewSample count={widgetSettings.num_suggestions} theme={widgetSettings.theme} title={widgetSettings.title} subtitle={widgetSettings.subtitle} styles={styles} storeProducts={products} t={t} />
                      </div>
                    </div>
                    <div className="col-lg-5 mb-4">
                      <div className={`${styles.card} ${styles.widgetConfigCard}`}>
                        <h3 className={styles.widgetConfigTitle}>🔑 {t.yourApiKey}</h3>
                        <p className={styles.codeHelp}>
                          {t.apiKeyHelp}
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
                              title={showApiKey ? t.hide : t.show}
                            >
                              <FiEye />
                            </button>
                            <button
                              className={`btn ${apiKeyCopied ? 'btn-success' : 'btn-primary'}`}
                              type="button"
                              onClick={copyApiKey}
                              disabled={!store?.api_key}
                            >
                              {apiKeyCopied ? <><FiCheckCircle /> {t.copied}</> : <><FiCopy /> {t.copy}</>}
                            </button>
                          </div>
                          <small className="text-muted d-block mb-3">
                            ⚠️ {t.keepApiKey}
                          </small>
                        </div>

                        <hr />

                        <h4 className={`mt-3 ${styles.widgetConfigTitle}`}>📱 {t.shopifyIntegration}</h4>
                        <ol className={styles.integrationSteps}>
                          {t.shopifySteps?.map((step, i) => <li key={i}>{step}</li>)}
                        </ol>

                        <hr />

                        <h4 className={`mt-3 ${styles.widgetConfigTitle}`}>🌐 {t.widgetOtherPlatforms}</h4>
                        <p className={styles.codeHelp}>
                          {t.copyCode}
                        </p>
                        <pre className={styles.codeBlock}>
                          <code>{`<script src="https://myoutfitapp.com/widget.js"></script>
<div 
  id="myoutfit-recommendations" 
  data-product-id="PROD_ID" 
  data-api-key="${store?.api_key ? getMaskedApiKey() : 'TU_API_KEY'}"
  data-theme="${widgetSettings.theme}"
  data-title="${widgetSettings.title}"
  data-subtitle="${(widgetSettings.subtitle || '').replace(/"/g, '&quot;')}"
  data-count="${widgetSettings.num_suggestions}"
></div>`}</code>
                        </pre>
                        <button
                          className="btn btn-outline-primary w-100 mt-2"
                          title={t.copyIntegrationCode}
                          onClick={() => {
                            const code = `<script src="https://myoutfitapp.com/widget.js"></script>
<div 
  id="myoutfit-recommendations" 
  data-product-id="PROD_ID" 
  data-api-key="${store?.api_key || 'TU_API_KEY'}"
  data-theme="${widgetSettings.theme}"
  data-title="${widgetSettings.title}"
  data-subtitle="${(widgetSettings.subtitle || '').replace(/"/g, '&quot;')}"
  data-count="${widgetSettings.num_suggestions}"
></div>`;
                            navigator.clipboard.writeText(code);
                          }}
                        >
                          <FiCopy /> {t.copyIntegrationCode}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h1 className={styles.pageTitle}>{t.analyticsTitle}</h1>
                  <div className="row mt-4">
                    <div className="col-12 mb-4">
                      <div className={styles.card}>
                        <h3>{t.performanceMetrics}</h3>
                        <div className={styles.chartPlaceholder}>
                          <p>{t.clicksConversionsChart}</p>
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
                        <h3>{t.topCombinations}</h3>
                        <div className={styles.combinationsList}>
                          <div className={styles.combinationItem}>
                            <span>Camiseta Blanca + Pantalón Negro</span>
                            <strong>245 {t.times}</strong>
                          </div>
                          <div className={styles.combinationItem}>
                            <span>Vestido Floral + Bolso Cuero</span>
                            <strong>189 {t.times}</strong>
                          </div>
                          <div className={styles.combinationItem}>
                            <span>Pantalón Vaquero + Cazadora</span>
                            <strong>156 {t.times}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className={styles.card}>
                        <h3>{t.periodSummary}</h3>
                        <div className={styles.roiMetrics}>
                          <div className={styles.roiItem}>
                            <span>{t.totalViews}</span>
                            <strong>{analytics.totalViews.toLocaleString()}</strong>
                          </div>
                          <div className={styles.roiItem}>
                            <span>{t.attributedRevenue}</span>
                            <strong>€{analytics.revenue.toLocaleString()}</strong>
                          </div>
                          <div className={styles.roiItem}>
                            <span>{t.conversionRateLabel}</span>
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
                  <h1 className={styles.pageTitle}>{t.billingTitle}</h1>
                  <div className="row mt-4">
                    <div className="col-md-8 mb-4">
                      <div className={styles.card}>
                        <h3>{t.currentPlan}</h3>
                        <div className={styles.planInfo}>
                          <div className={styles.planName}>{t.plan} {store?.plan?.charAt(0).toUpperCase() + store?.plan?.slice(1) || 'Starter'}</div>
                          <div className={styles.planPrice}>
                            {store?.subscription_status === 'trial' ? t.freeTrialPlan :
                              store?.plan === 'starter' ? '€29/mes' :
                                store?.plan === 'pro' ? '€149/mes' :
                                  store?.plan === 'enterprise' ? 'Contactar' : '€29/mes'}
                          </div>
                          <div className={styles.planFeatures}>
                            <ul>
                              <li>{t.upTo} {store?.max_products?.toLocaleString() || '100'} {t.productsLabel}</li>
                              <li>{store?.max_api_requests?.toLocaleString() || '1,000'} {t.apiRequestsMonth}</li>
                              <li>{t.analyticsDashboard}</li>
                              <li>{store?.plan === 'enterprise' ? t.dedicatedSupport : t.emailSupport}</li>
                            </ul>
                          </div>
                          <button className="btn btn-outline-primary">{t.changePlan}</button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 mb-4">
                      <div className={styles.card}>
                        <h3>{t.monthlyUsage}</h3>
                        <div className={styles.usageStats}>
                          <div className={styles.usageItem}>
                            <span>{t.productsUsage}</span>
                            <strong>{store?.catalog_size || 0} / {store?.max_products?.toLocaleString() || '100'}</strong>
                          </div>
                          <div className={styles.usageItem}>
                            <span>{t.apiRequests}</span>
                            <strong>{store?.api_requests_this_month?.toLocaleString() || 0} / {store?.max_api_requests?.toLocaleString() || '1,000'}</strong>
                          </div>
                          <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${store?.max_api_requests ? ((store?.api_requests_this_month || 0) / store.max_api_requests) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.card}>
                        <h3>{t.paymentMethod}</h3>
                        <p>Visa •••• 4242</p>
                        <button className="btn btn-outline-primary w-100">{t.updatePayment}</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CsvUploadModal
        isOpen={showCsvUpload}
        onClose={() => setShowCsvUpload(false)}
        store={store}
        onSuccess={async () => {
          await handleSyncCatalog();
          await refreshStore?.();
        }}
      />

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


