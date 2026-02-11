import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = ['es', 'en', 'de', 'fr', 'it', 'pt', 'cs'];

function getDefaultLanguage() {
  // Default to 'en' for initial SSR
  if (typeof window === 'undefined') {
    return 'en';
  }

  // Get browser language (e.g. 'en-US' -> 'en')
  const browserLang = navigator.language.split('-')[0].toLowerCase();

  // Check if browser language is supported
  if (SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang;
  }

  return 'en'; // Fallback to English
}

export function LanguageProvider({ children }) {
  // Start with 'en' for SSR
  const [language, setLanguage] = useState('en');

  // Update language based on browser preference after mount
  useEffect(() => {
    setLanguage(getDefaultLanguage());
  }, []);

  const toggleLanguage = (newLang) => {
    if (newLang && SUPPORTED_LANGUAGES.includes(newLang.toLowerCase())) {
      setLanguage(newLang.toLowerCase());
    }
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
