import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Локализованные ресурсы

import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            ru: { translation: ruTranslation }
        },
        lng: 'ru', // язык по умолчанию
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false // не экранировать HTML
        },
        react: {
            useSuspense: false // отключить Suspense, если не используется
        }
    });

export default i18n;