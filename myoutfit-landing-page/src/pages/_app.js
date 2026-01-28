import 'bootstrap/dist/css/bootstrap.css';
import '@/styles/globals.scss';
import '@/styles/blogs.scss';
import { Montserrat } from 'next/font/google';
import { useEffect } from 'react';
import Head from 'next/head';
import ReactGA from 'react-ga4';
import DynamicMeta from '@/components/DynamicMeta';
import StructuredData from '@/components/StructuredData';
import useDropShadow from '@/hooks/useDropShadow';
import Layout from '@/components/Layout';
import { LanguageProvider } from '@/context/LanguageContext';

const montserrat = Montserrat({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  useDropShadow();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
      // Initialize dropdown functionality after bootstrap is loaded
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      const dropdownList = [...dropdownElementList].map(
        (dropdownToggleEl) => new bootstrap.Dropdown(dropdownToggleEl),
      );
    }
    // Initialize Google Analytics
    ReactGA.initialize(`${process.env.NEXT_PUBLIC_GTAG_ID}`);
  }, []);

  return (
    <>
      <DynamicMeta />
      <StructuredData />
      <main className={montserrat.className}>
        <LanguageProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LanguageProvider>
      </main>
    </>
  );
}
