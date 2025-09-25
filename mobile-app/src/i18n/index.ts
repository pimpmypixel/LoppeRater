import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import da from './locales/da.json';

const resources = {
  da: {
    translation: da,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'da', // Default language is Danish
  fallbackLng: 'da',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;