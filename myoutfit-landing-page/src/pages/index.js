import styles from '@/styles/Home.module.scss';
import Image from 'next/image';
import NodeOverlay from '@/components/NodeOverlay';
import FaqItem from '@/components/FaqItem';
import Hero from '@/components/Hero';
import AppLinks from '@/components/AppLinks';
import Link from 'next/link';
import SubscribeForm from '@/components/SubscribeForm';
import ScrollToTop from '@/components/ScrollToTop';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/translations/translations';

export default function Home() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      <main className={styles.main}>
        <NodeOverlay />
        <Hero />
        {/* <div style={{ marginBottom: '175px' }} /> Espacio adicional */}

        {/* <SubscribeForm /> */}

        {/* En lugar de los divs de marginBottom, simplemente: */}
        <section className={styles.subscribeSection}>
          <SubscribeForm />
        </section>

        {/* <div className='text-center'>
          <h2 className="h2-lg my-lg my-lg">Watch The Demo</h2>
          
          <iframe 
            className="youtube-video"
            src="https://www.youtube.com/embed/lWvkkkF-pRI?si=VD4ZEuNUhb1YkS5f" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            loading='eager'
          />
        </div> */}

        <div id={styles.section_reviews} />

        {/* <div style={{ marginBottom: '40px' }} /> Espacio adicional */}

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
                  src="/images/phones/device_15_player_nested.png"
                  alt="Captura de MyOutfit app mostrando el armario de ropa."
                  height={400}
                  width={200}
                  className={`${styles.backsplash_image} phone_shadow`}
                />
              </div>
              <div className="col-md-6 col-lg-4 my-auto order-md-first text-center text-md-start">
                <h3>{t.wardrobeControl}</h3>
                <p>{t.wardrobeControlDesc}</p>
              </div>
            </div>

            <div className="row justify-content-md-center">
              <div
                className={`${styles.backsplash_container} col-md-6 col-lg-4 text-center`}
              >
                <div className={`${styles.backsplash} mx-auto`}></div>
                <Image
                  src="/images/phones/device_15_channel_invite.png"
                  alt="Captura de MyOutfit app mostrando una ventana con el registro de ropa."
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
                <div className="col-lg-6 align-self-end">
                  <div className={styles.imageContainer}>
                    <div className={styles.phonesWrapper}>
                      <Image
                        src="/images/phones/device_15_channel_invite.png"
                        alt="MyOutfit app no repitas ropa"
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
