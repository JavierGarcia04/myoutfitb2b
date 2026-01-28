import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '@/styles/Hero.module.scss';
import Link from 'next/link';
import AppLinks from '@/components/AppLinks';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations/translations';

export default function Hero() {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const [currentPhoneIndex, setCurrentPhoneIndex] = useState(1); // Iniciar con la imagen central
  const [isMobile, setIsMobile] = useState(false);

  // Array de imágenes de teléfonos - ahora todas con el mismo tamaño que la del medio
  const phoneImages = [
    {
      src: '/images/phones/device_15_home_feed2.png',
      alt: 'Screenshot of MyOutfit app showing the main feed.',
      width: 250, // Igualado al tamaño de la imagen del medio
      height: 500, // Igualado al tamaño de la imagen del medio
      className: 'phone_shadow mx-4', // Mismas clases que la imagen del medio
    },
    {
      src: '/images/phones/device_15_player_full.png',
      alt: 'Screenshot of MyOutfit app showing the main player with several comments.',
      width: 250,
      height: 500,
      className: 'phone_shadow mx-4',
    },
    {
      src: '/images/phones/device_15_player_response.png',
      alt: 'Screenshot of MyOutfit app showing player response.',
      width: 250, // Igualado al tamaño de la imagen del medio
      height: 500, // Igualado al tamaño de la imagen del medio
      className: 'phone_shadow mx-4', // Mismas clases que la imagen del medio
    },
  ];

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar inicialmente
    checkIfMobile();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', checkIfMobile);

    // Limpiar
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <>
      <div id={styles.section_headline_container}>
        <div id={styles.section_headline}>
          <div id={styles.qr_code} className={`d-none d-lg-block`}>
            <Image
              src="/images/MyOutfitAppLogo.png"
              alt="MyOutfit Logo"
              height={100}
              width={100}
              className="pr-3"
            />
          </div>
          <span className={styles.vLine1}>
            <Image
              src="/images/node-bright.svg"
              width={15}
              height={15}
              alt="Circle used for background style"
              className={`${styles.node_sm1} d-none d-md-block`}
            />
          </span>
          <span className={`${styles.vLine2} d-none d-md-block`}></span>
          <span className={styles.vLine3}></span>
          <span className={`${styles.vLine4} d-none d-md-block`}></span>
          <span className={`${styles.vLine5} d-none d-md-block`}></span>
          <span className={styles.vLine6}>
            <Image
              src="/images/node-bright.svg"
              width={15}
              height={15}
              alt="Circle used for background style"
              className={styles.node_sm2}
            />
          </span>

          <nav
            className="navbar text-center text-md-left d-flex align-items-center justify-content-between px-3"
            style={{ position: 'relative', zIndex: 10 }}
          >
            <Link
              className="navbar-brand m-0 position-absolute start-50 translate-middle-x d-md-none"
              href="/"
            >
              <Image
                src="/images/MyOutfitTextWhite.png"
                alt="MyOutfit Logo"
                height={50}
                width={125}
                className=""
              />
            </Link>
            <Link
              className="navbar-brand mx-auto mx-md-0 d-none d-md-block"
              href="/"
            >
              <Image
                src="/images/MyOutfitTextWhite.png"
                alt="MyOutfit Logo"
                height={50}
                width={125}
                className=""
              />
            </Link>
            <div className="dropdown ms-auto">
              <button
                className="btn btn-outline-light dropdown-toggle me-0 me-md-3"
                style={{ fontSize: '0.9rem', padding: '0.375rem 0.75rem' }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {language.toUpperCase()}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className={`dropdown-item ${
                      language === 'es' ? 'active' : ''
                    }`}
                    onClick={() => language !== 'es' && toggleLanguage('es')}
                  >
                    ES
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${
                      language === 'fr' ? 'active' : ''
                    }`}
                    onClick={() => language !== 'fr' && toggleLanguage('fr')}
                  >
                    FR
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${
                      language === 'en' ? 'active' : ''
                    }`}
                    onClick={() => language !== 'en' && toggleLanguage('en')}
                  >
                    EN
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${
                      language === 'de' ? 'active' : ''
                    }`}
                    onClick={() => language !== 'de' && toggleLanguage('de')}
                  >
                    DE
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${
                      language === 'it' ? 'active' : ''
                    }`}
                    onClick={() => language !== 'it' && toggleLanguage('it')}
                  >
                    IT
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${
                      language === 'cs' ? 'active' : ''
                    }`}
                    onClick={() => language !== 'cs' && toggleLanguage('cs')}
                  >
                    CS
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          <div className="text-center text-light">
            <h1 className="pt-1 px-3 pb-3">{t.title}</h1>
            <div className="row justify-content-center px-3">
              <p className="col-md-10 col-lg-6">{t.subtitle}</p>
            </div>
            <AppLinks />
          </div>

          {/* Versión escritorio - todos los teléfonos - mantenemos tamaños originales para desktop */}
          <div
            className={`${styles.cover_imgs_container} text-center d-none d-md-flex justify-content-center animate-slide-up`}
          >
            <Image
              src="/images/phones/device_15_home_feed2.png"
              alt="Screenshot of MyOutfit app showing the main player with several comments."
              height={400}
              width={200}
              className="phone_shadow mt-5"
            />
            <Image
              src="/images/phones/device_15_player_full.png"
              alt="Screenshot of MyOutfit app showing the main player with several comments."
              height={500}
              width={250}
              className="phone_shadow mx-4"
            />
            <Image
              src="/images/phones/device_15_player_response.png"
              alt="Screenshot of MyOutfit app showing the main player with several comments."
              height={400}
              width={200}
              className="phone_shadow mt-5"
            />
          </div>

          {/* Versión móvil - carousel */}
          <div className="d-flex d-md-none justify-content-center align-items-center mt-4">
            <div className="text-center">
              <Image
                src={phoneImages[currentPhoneIndex].src}
                alt={phoneImages[currentPhoneIndex].alt}
                height={phoneImages[currentPhoneIndex].height}
                width={phoneImages[currentPhoneIndex].width}
                className={phoneImages[currentPhoneIndex].className}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
