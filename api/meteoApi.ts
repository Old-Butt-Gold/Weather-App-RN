import axios from 'axios';

const meteoApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_FORECAST_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default meteoApi;