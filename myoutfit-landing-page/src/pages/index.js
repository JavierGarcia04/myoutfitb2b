import styles from '@/styles/Home.module.scss';
import Image from 'next/image';
import Head from 'next/head';
import NodeOverlay from '@/components/NodeOverlay';
import FaqItem from '@/components/FaqItem';
import Hero from '@/components/Hero';
import AppLinks from '@/components/AppLinks';
import SubscribeForm from '@/components/SubscribeForm';
import ScrollToTop from '@/components/ScrollToTop';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations/translations';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];
  const isSpanish = language === 'es';

  const pageCopy = isSpanish
    ? {
        seoTitle:
          'MyOutfit App | Organiza tu armario, crea outfits y recibe recomendaciones con IA',
        seoDescription:
          'Descarga MyOutfit y crea looks en segundos con tu ropa real. Organiza tu armario, planifica viajes con maletas inteligentes y evita repetir outfits.',
        badge1: 'Armario digital',
        badge2: 'Estilismo con IA',
        badge3: 'Planifica viajes',
        sectionTitle:
          'Tu asistente personal para vestir mejor con menos esfuerzo',
        sectionSubtitle:
          'MyOutfit convierte tu ropa real en decisiones rápidas: qué ponerte hoy, qué llevar de viaje y cómo sacarle más partido a tu armario.',
        benefitsTitle: 'Beneficios que notarás desde el primer día',
        benefits: [
          'Ahorra tiempo cada mañana con combinaciones listas para usar.',
          'Evita compras innecesarias al redescubrir prendas que ya tienes.',
          'Recibe ideas personalizadas según tu estilo y ocasión.',
          'Mantén controlado tu historial de outfits para no repetir.',
        ],
        stepsTitle: 'Empieza en 3 pasos',
        step1Title: '📸 Sube tu ropa',
        step1Desc:
          'Haz una foto o elige imágenes de tu galería para digitalizar tu armario.',
        step2Title: '✨ Crea o pide recomendaciones',
        step2Desc:
          'Combina prendas manualmente o deja que la IA te sugiera opciones.',
        step3Title: '📲 Guarda, planifica y comparte',
        step3Desc:
          'Organiza tus outfits del día, prepara maletas y comparte tus looks.',
        finalCtaTitle: 'Descarga MyOutfit y viste con claridad cada día',
        finalCtaSubtitle:
          'Menos dudas al vestirte, más estilo con lo que ya tienes.',
      }
    : {
        seoTitle:
          'MyOutfit App | Organize your wardrobe, create outfits and get AI recommendations',
        seoDescription:
          'Download MyOutfit to build looks in seconds using your real wardrobe. Organize clothes, plan trips with smart packing and avoid repeating outfits.',
        badge1: 'Digital wardrobe',
        badge2: 'AI stylist',
        badge3: 'Trip planner',
        sectionTitle: 'Your personal stylist to dress better, faster',
        sectionSubtitle:
          'MyOutfit turns your real clothes into fast decisions: what to wear today, what to pack and how to use your wardrobe better.',
        benefitsTitle: 'Benefits you feel from day one',
        benefits: [
          'Save time every morning with ready-to-wear combinations.',
          'Avoid unnecessary shopping by rediscovering what you already own.',
          'Get personalized outfit ideas based on your style and occasion.',
          'Track outfit history to avoid repeating looks.',
        ],
        stepsTitle: 'Get started in 3 steps',
        step1Title: '📸 Upload your clothes',
        step1Desc:
          'Take a photo or choose images from your gallery to digitize your wardrobe.',
        step2Title: '✨ Create or ask for recommendations',
        step2Desc:
          'Build outfits manually or let AI suggest combinations for you.',
        step3Title: '📲 Save, plan and share',
        step3Desc:
          'Organize daily outfits, prepare suitcases and share your looks.',
        finalCtaTitle: 'Download MyOutfit and dress with confidence',
        finalCtaSubtitle:
          'Less decision fatigue, more style with what you already own.',
      };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'MyOutfit',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'iOS, Android',
    description: pageCopy.seoDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
  };

  return (
    <>
      <Head>
        <title>{pageCopy.seoTitle}</title>
        <meta name="description" content={pageCopy.seoDescription} />
        <meta
          name="keywords"
          content="app de outfits, armario digital, planificador de outfits, app de moda, outfit planner, wardrobe app"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageCopy.seoTitle} />
        <meta property="og:description" content={pageCopy.seoDescription} />
        <meta property="og:image" content="/images/MyOutfitAppLogo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageCopy.seoTitle} />
        <meta name="twitter:description" content={pageCopy.seoDescription} />
        <meta name="twitter:image" content="/images/MyOutfitAppLogo.png" />
        <link rel="canonical" href="https://myoutfitapp.com/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <main className={styles.main}>
        <NodeOverlay />
        <Hero />

        <section className={styles.subscribeSection}>
          <SubscribeForm />
        </section>

        <div className={styles.badgeStrip}>
          <span className={styles.badge}>👔 {pageCopy.badge1}</span>
          <span className={styles.badge}>✨ {pageCopy.badge2}</span>
          <span className={styles.badge}>✈️ {pageCopy.badge3}</span>
        </div>

        <section className={styles.valueSection}>
          <h2>{pageCopy.sectionTitle}</h2>
          <p>{pageCopy.sectionSubtitle}</p>
        </section>

        <div id={styles.section_features}>
          <div className="container">
            <div className="row justify-content-md-center">
              <div
                className={`${styles.backsplash_container} col-md-6 col-lg-4 text-center`}
              >
                <div className={`${styles.backsplash} mx-auto`}></div>
                <Image
                  src="/images/phones/device_15_player_simple2.png"
                  alt="Captura de la ventana principal de MyOutfit app donde puedes hacer combinaciones de ropa."
                  height={400}
                  width={200}
                  className={`${styles.backsplash_image} phone_shadow`}
                />
              </div>

              <div className="col-md-6 col-lg-4 offset-lg-1 my-auto text-center text-md-start">
                <h3>{t.createOutfits}</h3>
                <p>{t.createOutfitsDesc}</p>
              </div>
            </div>

            <div className="row my-5 justify-content-md-center">
              <div
                className={`${styles.backsplash_container} col-md-6 col-lg-4 offset-lg-1 text-center`}
              >
                <div className={`${styles.backsplash} mx-auto`}></div>
                <Image
                  src="/images/phones/device_15_tu_outfit.png"
                  alt="Captura de MyOutfit app mostrando el Fashion Assistant con chatbot de IA."
                  height={400}
                  width={200}
                  className={`${styles.backsplash_image} phone_shadow`}
                />
              </div>
              <div className="col-md-6 col-lg-4 my-auto order-md-first text-center text-md-start">
                <h3>{t.aiRecommendations}</h3>
                <p>{t.aiRecommendationsDesc}</p>
              </div>
            </div>

            <div className="row my-5 justify-content-md-center">
              <div
                className={`${styles.backsplash_container} col-md-6 col-lg-4 text-center`}
              >
                <div className={`${styles.backsplash} mx-auto`}></div>
                <Image
                  src="/images/phones/device_15_player_nested.png"
                  alt="Captura de MyOutfit app mostrando el armario de ropa."
                  height={400}
                  width={200}
                  className={`${styles.backsplash_image} phone_shadow`}
                />
              </div>
              <div className="col-md-6 col-lg-4 offset-lg-1 my-auto text-center text-md-start">
                <h3>{t.wardrobeControl}</h3>
                <p>{t.wardrobeControlDesc}</p>
              </div>
            </div>

            <div className="row my-5 justify-content-md-center">
              <div
                className={`${styles.backsplash_container} col-md-6 col-lg-4 offset-lg-1 text-center`}
              >
                <div className={`${styles.backsplash} mx-auto`}></div>
                <Image
                  src="/images/phones/device_15_suitcase.png"
                  alt="Captura de MyOutfit app mostrando la gestión de maletas y checklist de viaje."
                  height={400}
                  width={200}
                  className={`${styles.backsplash_image} phone_shadow`}
                />
              </div>
              <div className="col-md-6 col-lg-4 my-auto order-md-first text-center text-md-start">
                <h3>{t.suitcaseControl}</h3>
                <p>{t.suitcaseControlDesc}</p>
              </div>
            </div>

            <div className="row my-5 justify-content-md-center">
              <div
                className={`${styles.backsplash_container} col-md-6 col-lg-4 text-center`}
              >
                <div className={`${styles.backsplash} mx-auto`}></div>
                <Image
                  src="/images/phones/device_15_dont_repeat.png"
                  alt="Captura de MyOutfit app mostrando los últimos outfits y panel de control."
                  height={400}
                  width={200}
                  className={`${styles.backsplash_image} phone_shadow`}
                />
              </div>
              <div className="col-md-6 col-lg-4 offset-lg-1 my-auto text-center text-md-start">
                <h3>{t.dontRepeat}</h3>
                <p>{t.dontRepeatDesc}</p>
              </div>
            </div>
          </div>
        </div>

        <section className={`container ${styles.stepsSection}`}>
          <h2>{pageCopy.stepsTitle}</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineNode}>1</div>
              <div className={styles.timelineContent}>
                <h3>{pageCopy.step1Title}</h3>
                <p>{pageCopy.step1Desc}</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineNode}>2</div>
              <div className={styles.timelineContent}>
                <h3>{pageCopy.step2Title}</h3>
                <p>{pageCopy.step2Desc}</p>
              </div>
            </div>
            <div className={styles.timelineItem}>
              <div className={styles.timelineNode}>3</div>
              <div className={styles.timelineContent}>
                <h3>{pageCopy.step3Title}</h3>
                <p>{pageCopy.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <div id={styles.section_faq}>
          <h2 className="h2-lg my-lg text-center">{t.faq}</h2>
          <div className="row justify-content-center">
            <div className="col-10 col-md-8 col-lg-6">
              <div className="accordion" id="faq_accordion">
                {t.faqQuestions.map((faq, index) => (
                  <FaqItem
                    key={index}
                    itemNum={`item${index + 1}`}
                    faqItem={faq}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className={styles.newsletterArea}>
          <div className="container">
            <div className={styles.newsletterInner}>
              <div className={styles.overlay}></div>
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className={styles.content}>
                    <h2 className={styles.title}>{t.ctaTitle}</h2>
                    <div className={styles.contentText}>
                      <p className={styles.text}>{t.ctaSubtitle}</p>
                      <p className={styles.text}>{t.ctaHashtag}</p>
                    </div>
                    <div className={styles.btnGroups}>
                      <AppLinks />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 align-self-center">
                  <div className={styles.imageContainer}>
                    <div className={styles.phonesWrapper}>
                      <Image
                        src="/images/phones/device_15_channel_invite.png"
                        alt="MyOutfit app panel con últimos outfits"
                        width={200}
                        height={400}
                        className={styles.phoneImage}
                      />
                      <Image
                        src="/images/phones/device_15_player_simple2.png"
                        alt="MyOutfit app combinaciones"
                        width={200}
                        height={400}
                        className={styles.phoneImage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <ScrollToTop />
    </>
  );
}
