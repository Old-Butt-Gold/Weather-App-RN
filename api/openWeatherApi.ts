import axios from 'axios';

const openWeatherApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_OPENWEATHER_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    params: {
        appid: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY
    }
});

export default openWeatherApi;