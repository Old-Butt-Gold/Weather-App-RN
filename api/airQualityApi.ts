import axios from 'axios';

const airQualityApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_AIR_QUALITY_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default airQualityApi;