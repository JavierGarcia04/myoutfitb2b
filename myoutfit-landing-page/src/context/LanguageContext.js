import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const SUPPORTED_LANGUAGES = ['es', 'en', 'de', 'fr', 'it', 'pt', 'cs'];
const STORAGE_KEY = 'myoutfit-language';

function getDefaultLanguage() {
  if (typeof window === 'undefined') return 'en';

  // 1) Preferencia guardada (localStorage o desde ajustes del usuario)
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;

  // 2) Idioma del navegador
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;

  return 'en';
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
      const lang = newLang.toLowerCase();
      setLanguage(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}
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
