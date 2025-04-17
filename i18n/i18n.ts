import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Локализованные ресурсы

import enTranslation from './locales/en.json';
import ruTranslation from './locales/ru.json';
import {store} from "../store/store";

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

store.subscribe(async () => {
    const { language } = store.getState().appSettings;
    if (i18n.language !== language) {
        await i18n.changeLanguage(language);
    }
});

export default i18n;