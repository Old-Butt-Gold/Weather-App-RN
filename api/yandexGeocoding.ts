import axios from 'axios';

const yandexGeocoding = axios.create({
    baseURL: process.env.EXPO_PUBLIC_YANDEX_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default yandexGeocoding;