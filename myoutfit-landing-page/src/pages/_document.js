import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Charset and compatibility */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />

        {/* Poppins — wordmark logo */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@800&display=swap"
          rel="stylesheet"
        />

        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* Microsoft tiles */}
        <meta
          name="msapplication-TileImage"
          content="/images/ms-tile-144x144.png"
        />
        <meta
          name="msapplication-square70x70logo"
          content="/images/ms-tile-70x70.png"
        />
        <meta
          name="msapplication-square150x150logo"
          content="/images/ms-tile-150x150.png"
        />
        <meta
          name="msapplication-wide310x150logo"
          content="/images/ms-tile-310x150.png"
        />
        <meta
          name="msapplication-square310x310logo"
          content="/images/ms-tile-310x310.png"
        />

        {/* Apple icons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon-180x180.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/images/apple-touch-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/images/apple-touch-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/images/apple-touch-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/images/apple-touch-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/images/apple-touch-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/images/apple-touch-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/images/apple-touch-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/images/apple-touch-icon-57x57.png"
        />

        {/* Favicon variants */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body>
        <div id="main-container">
          <Main />
          <NextScript />
        </div>
      </body>
    </Html>
  );
}
