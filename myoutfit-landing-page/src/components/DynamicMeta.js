import { useRouter } from 'next/router';
import Head from 'next/head';
import metaConfig from '@/utils/metaConfig';

const DynamicMeta = () => {
  const router = useRouter();
  const currentMeta = metaConfig[router.pathname] || metaConfig.default;
  const isRootPath = router.pathname === '/';

  // Structured Data for the app
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'MyOutfit',
    operatingSystem: 'iOS, Android',
    applicationCategory: 'LifestyleApplication',
    description:
      'Aplicación móvil para organizar tu armario digital, crear outfits únicos y gestionar tu ropa de forma inteligente.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1200',
    },
    screenshot:
      'https://myoutfitapp.com/images/phones/device_15_player_simple2.png',
  };

  return (
    <Head>
      {/* PRIMARY META */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, user-scalable=no"
      />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />

      {/* SEO META */}
      <title>{currentMeta.title}</title>
      <meta name="title" content={currentMeta.title} />
      <meta name="description" content={currentMeta.description} />
      <meta name="keywords" content={currentMeta.keywords} />
      <meta name="author" content="MyOutfit Team" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="es, en, de, fr, it, pt, cs" />
      <meta name="theme-color" content="#8000f7" />

      {/* Canonical URL */}
      <link
        rel="canonical"
        href={`https://myoutfitapp.com${router.pathname}`}
      />

      {/* Alternate language versions */}
      <link
        rel="alternate"
        hrefLang="es"
        href={`https://myoutfitapp.com${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="en"
        href={`https://myoutfitapp.com/en${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="de"
        href={`https://myoutfitapp.com/de${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="fr"
        href={`https://myoutfitapp.com/fr${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="it"
        href={`https://myoutfitapp.com/it${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="pt"
        href={`https://myoutfitapp.com/pt${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="cs"
        href={`https://myoutfitapp.com/cs${router.pathname}`}
      />
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`https://myoutfitapp.com${router.pathname}`}
      />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="MyOutfit" />
      <meta property="og:title" content={currentMeta.title} />
      <meta property="og:description" content={currentMeta.description} />
      <meta property="og:image" content={currentMeta.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="MyOutfit - Organiza tu Armario Digital"
      />
      <meta
        property="og:url"
        content={`https://myoutfitapp.com${router.pathname}`}
      />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="it_IT" />
      <meta property="og:locale:alternate" content="pt_BR" />
      <meta property="og:locale:alternate" content="cs_CZ" />

      {/* Twitter Card */}
      {isRootPath ? (
        // App download Twitter Card
        <>
          <meta name="twitter:card" content="app" />
          <meta name="twitter:site" content="@MyOutfitApp" />
          <meta name="twitter:title" content={currentMeta.title} />
          <meta name="twitter:description" content={currentMeta.description} />
          <meta name="twitter:image" content={currentMeta.image} />
          <meta name="twitter:app:name:iphone" content="MyOutfit" />
          <meta name="twitter:app:id:iphone" content="6443961864" />
          <meta name="twitter:app:name:googleplay" content="MyOutfit" />
          <meta
            name="twitter:app:id:googleplay"
            content="com.onemanstartup.MyOutfit"
          />
          <meta name="twitter:app:url:iphone" content="myoutfit://open" />
          <meta name="twitter:app:url:googleplay" content="myoutfit://open" />
        </>
      ) : (
        <>
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@MyOutfitApp" />
          <meta name="twitter:creator" content="@MyOutfitApp" />
          <meta name="twitter:title" content={currentMeta.title} />
          <meta name="twitter:description" content={currentMeta.description} />
          <meta name="twitter:image" content={currentMeta.image} />
          <meta
            name="twitter:image:alt"
            content="MyOutfit - Organiza tu Armario Digital"
          />
        </>
      )}

      {/* App Store & Google Play meta */}
      <meta name="apple-itunes-app" content="app-id=6443961864" />
      <meta
        name="google-play-app"
        content="app-id=com.onemanstartup.MyOutfit"
      />

      {/* Additional Mobile Meta */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-TileColor" content="#8000f7" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
    </Head>
  );
};

export default DynamicMeta;
