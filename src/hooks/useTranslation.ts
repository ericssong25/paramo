import { useState, useEffect, useCallback } from 'react';
import { translations, Language } from '../i18n/translations';

// Función helper para obtener traducciones anidadas
const getNestedTranslation = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

// Evento personalizado para notificar cambios de idioma
const LANGUAGE_CHANGE_EVENT = 'app-language-change';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('es');

  // Cargar idioma guardado en localStorage al inicializar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detectar idioma del navegador
      const browserLanguage = navigator.language.split('-')[0];
      setCurrentLanguage(browserLanguage === 'en' ? 'en' : 'es');
    }
  }, []);

  // Escuchar cambios de idioma desde otros componentes
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const newLanguage = event.detail as Language;
      if (newLanguage && (newLanguage === 'en' || newLanguage === 'es')) {
        setCurrentLanguage(newLanguage);
      }
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
    };
  }, []);

  // Función para cambiar idioma
  const changeLanguage = useCallback((language: Language, reloadPage: boolean = false) => {
    setCurrentLanguage(language);
    localStorage.setItem('app-language', language);
    
    // Disparar evento para notificar a otros componentes
    window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: language }));
    
    // Forzar re-render de componentes que no usan el hook
    window.dispatchEvent(new Event('storage'));
    
    // Opción para recargar la página si es necesario
    if (reloadPage) {
      window.location.reload();
    }
  }, []);

  // Función para traducir
  const t = useCallback((key: string): string => {
    return getNestedTranslation(translations[currentLanguage], key);
  }, [currentLanguage]);

  // Función para obtener traducciones de estados de tareas
  const getTaskStatusTranslation = useCallback((status: string): string => {
    // Mapear los status que tienen guiones a las claves correctas
    const statusMapping: Record<string, string> = {
      'todo': 'todo',
      'in-progress': 'inProgress',
      'corrections': 'corrections',
      'review': 'review',
      'done': 'done',
      'archived': 'archived'
    };
    
    const mappedStatus = statusMapping[status] || status;
    const translation = t(`tasks.taskStatus.${mappedStatus}`);
    
    // Si no encuentra la traducción, devolver el status original
    return translation || status;
  }, [t]);

  // Función para obtener traducciones de prioridades
  const getPriorityTranslation = useCallback((priority: string): string => {
    return t(`tasks.priorityLevels.${priority}`) || priority;
  }, [t]);

  return {
    t,
    currentLanguage,
    changeLanguage,
    getTaskStatusTranslation,
    getPriorityTranslation,
    isEnglish: currentLanguage === 'en',
    isSpanish: currentLanguage === 'es',
  };
};
