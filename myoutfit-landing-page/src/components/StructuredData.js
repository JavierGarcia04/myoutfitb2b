import Head from 'next/head';

const StructuredData = () => {
  // Datos estructurados para la organización
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyOutfit',
    description:
      'Aplicación móvil para organizar tu armario digital y crear outfits únicos',
    url: 'https://myoutfitapp.com',
    logo: 'https://myoutfitapp.com/images/logo.png',
    foundingDate: '2023',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@myoutfitapp.com',
      contactType: 'customer service',
      availableLanguage: [
        'Spanish',
        'English',
        'German',
        'French',
        'Italian',
        'Czech',
      ],
    },
    sameAs: [
      'https://www.instagram.com/myoutfitapp',
      'https://www.tiktok.com/@myoutfitapp',
      'https://twitter.com/myoutfitapp',
    ],
  };

  // Datos estructurados para el software
  const softwareApplicationData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MyOutfit',
    description:
      'Organiza tu armario digitalmente, crea outfits únicos y gestiona tu ropa de forma inteligente',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: ['iOS', 'Android'],
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
    screenshot: [
      'https://myoutfitapp.com/images/phones/device_15_player_simple2.png',
      'https://myoutfitapp.com/images/phones/device_15_player_full.png',
      'https://myoutfitapp.com/images/phones/device_15_player_nested.png',
    ],
    featureList: [
      'Organización digital del armario',
      'Creación de outfits únicos',
      'Registro de uso de prendas',
      'Gestión inteligente del vestuario',
      'Combinaciones automáticas',
      'Historial de looks',
    ],
    downloadUrl: 'https://apps.apple.com/app/myoutfit/id6443961864',
    installUrl:
      'https://play.google.com/store/apps/details?id=com.onemanstartup.MyOutfit',
  };

  // Datos estructurados para FAQ
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué es MyOutfit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MyOutfit es una aplicación móvil que te permite organizar tu armario digitalmente, crear outfits únicos y gestionar tu ropa de forma inteligente.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Es gratis MyOutfit?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, MyOutfit es completamente gratuita para descargar y usar. Puedes organizar tu armario y crear outfits sin ningún costo.',
        },
      },
      {
        '@type': 'Question',
        name: '¿En qué dispositivos está disponible?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MyOutfit está disponible para dispositivos iOS en App Store y Android en Google Play Store.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Cómo organiza MyOutfit mi ropa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MyOutfit te permite fotografiar y categorizar tu ropa, crear combinaciones, registrar el uso de prendas y nunca repetir el mismo look.',
        },
      },
    ],
  };

  // Datos estructurados para la página web
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyOutfit - Organiza tu Armario Digital',
    url: 'https://myoutfitapp.com',
    description:
      'Descarga MyOutfit y organiza tu armario de forma inteligente. Crea outfits únicos, gestiona tu ropa digital y nunca más repitas looks.',
    inLanguage: ['es', 'en', 'de', 'fr', 'it', 'cs'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://myoutfitapp.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Head>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />

      {/* Software Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationData),
        }}
      />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />

      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
    </Head>
  );
};

export default StructuredData;
