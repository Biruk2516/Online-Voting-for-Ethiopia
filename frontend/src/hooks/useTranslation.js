import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../services/translationService';

export const useTranslation = (text) => {
  const { currentLanguage, translations, setTranslations } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translate = async () => {
      if (currentLanguage === 'en') {
        setTranslatedText(text);
        return;
      }

      // Check if translation exists in cache
      const cacheKey = `${text}_${currentLanguage}`;
      if (translations[cacheKey]) {
        setTranslatedText(translations[cacheKey]);
        return;
      }

      // Translate and cache
      const translated = await translateText(text, currentLanguage);
      setTranslatedText(translated);
      setTranslations(prev => ({
        ...prev,
        [cacheKey]: translated
      }));
    };

    translate();
  }, [text, currentLanguage, translations, setTranslations]);

  return translatedText;
}; 