import React from 'react';
import { useRouter } from 'next/router';
import useDropShadow from '@/hooks/useDropShadow';
import Footer from '@/components/Footer';

const Layout = ({ children }) => {
  useDropShadow();
  const router = useRouter();
  
  // No mostrar footer en el dashboard
  const showFooter = !router.pathname.startsWith('/dashboard');

  return (
    <div>
      {children}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
