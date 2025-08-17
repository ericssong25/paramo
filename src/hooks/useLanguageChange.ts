import { useEffect, useState } from 'react';
import { Language } from '../i18n/translations';

// Evento personalizado para notificar cambios de idioma
const LANGUAGE_CHANGE_EVENT = 'app-language-change';

export const useLanguageChange = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es');

  useEffect(() => {
    // Cargar idioma inicial
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setCurrentLanguage(savedLanguage);
    } else {
      const browserLanguage = navigator.language.split('-')[0];
      setCurrentLanguage(browserLanguage === 'en' ? 'en' : 'es');
    }

    // Escuchar cambios de idioma
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail as Language;
      if (newLanguage && (newLanguage === 'en' || newLanguage === 'es')) {
        setCurrentLanguage(newLanguage);
      }
    };

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      const savedLanguage = localStorage.getItem('app-language') as Language;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        setCurrentLanguage(savedLanguage);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    currentLanguage,
    isEnglish: currentLanguage === 'en',
    isSpanish: currentLanguage === 'es',
  };
};
