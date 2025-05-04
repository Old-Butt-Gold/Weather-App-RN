import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
        lng: 'ru',
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

store.subscribe(async () => {
    const { language } = store.getState().appSettings;
    if (i18n.language !== language) {
        await i18n.changeLanguage(language);
    }
});

export default i18n;