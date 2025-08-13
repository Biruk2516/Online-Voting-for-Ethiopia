import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2';

export const translateText = async (text, targetLanguage) => {
  try {
    const response = await axios.post(`${BASE_URL}?key=${API_KEY}`, {
      q: text,
      target: targetLanguage,
    });

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

export const translateBatch = async (texts, targetLanguage) => {
  try {
    const response = await axios.post(`${BASE_URL}?key=${API_KEY}`, {
      q: texts,
      target: targetLanguage,
    });

    return response.data.data.translations.map(t => t.translatedText);
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts; // Return original texts if translation fails
  }
}; 