import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/Dashboard.module.scss';
import { FiCheck, FiShield, FiZap, FiUsers } from 'react-icons/fi';

export default function Register() {
  const router = useRouter();
  const { session_id, plan } = router.query;
  const paidSuccess = Boolean(session_id);
  const { user, signUp } = useAuth();
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.storeName || formData.storeName.trim().length < 2) {
      setError('El nombre de la tienda debe tener al menos 2 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Por favor, ingresa un email válido');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Registrar usuario
    const { data, error: signUpError } = await signUp(
      formData.email.trim().toLowerCase(),
      formData.password,
      formData.storeName.trim()
    );

    if (signUpError) {
      console.error('Registration error:', signUpError);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al crear la cuenta. Por favor, intenta de nuevo.';
      
      if (signUpError.message?.includes('already registered') || signUpError.message?.includes('User already registered')) {
        errorMessage = 'Este email ya está registrado. Por favor, inicia sesión o usa otro email.';
      } else if (signUpError.message?.includes('invalid')) {
        errorMessage = 'El formato del email no es válido. Por favor, verifica e intenta de nuevo.';
      } else if (signUpError.message) {
        errorMessage = signUpError.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    } else if (data?.user) {
      // Usuario creado exitosamente
      setSuccess(true);
      setLoading(false);
      // No redirigir automáticamente, el usuario debe confirmar su email primero
    } else {
      setError('Error inesperado al crear la cuenta. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  if (user) {
    return null; // Se está redirigiendo
  }

  return (
    <>
      <Head>
        <title>Registro - MyOutfit for Business</title>
        <meta name="description" content="Crea tu cuenta de MyOutfit for Business" />
      </Head>
      <Navigation />
      <main className={styles.dashboardMain}>
        <section className={styles.loginSection}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="row">
                  {/* Columna izquierda - Beneficios */}
                  <div className="col-md-6">
                    <div className={styles.registerBenefits}>
                      <h2>Únete a MyOutfit for Business</h2>
                      <p className={styles.benefitsSubtitle}>
                        Aumenta las ventas de tu tienda con recomendaciones inteligentes de outfits
                      </p>

                      <div className={styles.benefitsList}>
                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>
                            <FiZap />
                          </div>
                          <div>
                            <h4>Configuración en minutos</h4>
                            <p>Integra nuestro widget en tu tienda con solo copiar y pegar un código</p>
                          </div>
                        </div>

                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>
                            <FiUsers />
                          </div>
                          <div>
                            <h4>Aumenta tu ticket medio</h4>
                            <p>Incrementa las ventas hasta un 35% con recomendaciones personalizadas</p>
                          </div>
                        </div>

                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>
                            <FiShield />
                          </div>
                          <div>
                            <h4>14 días de prueba gratis</h4>
                            <p>Prueba todas las funcionalidades sin compromiso ni tarjeta de crédito</p>
                          </div>
                        </div>

                        <div className={styles.benefitItem}>
                          <div className={styles.benefitIcon}>
                            <FiCheck />
                          </div>
                          <div>
                            <h4>Analítica en tiempo real</h4>
                            <p>Visualiza el rendimiento de tus recomendaciones al instante</p>
                          </div>
                        </div>
                      </div>

                      <div className={styles.trustBadges}>
                        <p><strong>Más de 500+ tiendas confían en nosotros</strong></p>
                        <div className={styles.trustLogos}>
                          <span>🛍️</span>
                          <span>👔</span>
                          <span>👗</span>
                          <span>👟</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha - Formulario */}
                  <div className="col-md-6">
                    <div className={styles.loginCard}>
                      <h2>Crea tu cuenta</h2>
                      <p className={styles.loginSubtitle}>
                        {paidSuccess ? (
                          <>Pago completado. Completa tu registro para acceder a tu plan {plan === 'pro' ? 'Pro' : 'Starter'}.</>
                        ) : (
                          <>Comienza tu prueba gratuita de 14 días</>
                        )}
                      </p>

                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="alert alert-success" role="alert">
                          <strong>¡Cuenta creada exitosamente! 🎉</strong>
                          <p className="mb-0 mt-2">
                            <strong>📧 Confirma tu correo electrónico</strong>
                          </p>
                          <p className="mb-0 mt-2">
                            Hemos enviado un email de confirmación a <strong>{formData.email}</strong>. 
                            Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz click en el enlace de confirmación para activar tu cuenta.
                          </p>
                          <p className="mb-0 mt-2">
                            Una vez confirmado, podrás <Link href="/dashboard">iniciar sesión aquí</Link>.
                          </p>
                        </div>
                      )}

                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <label htmlFor="storeName" className="form-label">
                            Nombre de tu tienda *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="storeName"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            placeholder="Ej: Mi Tienda Fashion"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">
                            Email *
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="password" className="form-label">
                            Contraseña *
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            required
                          />
                          <small className="text-muted">
                            Mínimo 6 caracteres
                          </small>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label">
                            Confirmar Contraseña *
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repite tu contraseña"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={loading || success}
                        >
                          {loading ? 'Creando cuenta...' : success ? '¡Cuenta creada!' : 'Crear cuenta gratis'}
                        </button>
                      </form>

                      <div className={styles.loginFooter}>
                        <p className={styles.terms}>
                          Al registrarte, aceptas nuestros{' '}
                          <Link href="#">Términos de Servicio</Link> y{' '}
                          <Link href="#">Política de Privacidad</Link>
                        </p>
                        <p>
                          ¿Ya tienes cuenta?{' '}
                          <Link href="/dashboard">Inicia sesión aquí</Link>
                        </p>
                      </div>
                    </div>
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

