import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: { name: 'English', code: 'en' },
  am: { name: 'አማርኛ', code: 'am' },
  om: { name: 'Afaan Oromoo', code: 'om' },
  ti: { name: 'ትግርኛ', code: 'ti' },
  so: { name: 'Soomaali', code: 'so' },
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  const changeLanguage = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage, 
      translations,
      setTranslations,
      languages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 