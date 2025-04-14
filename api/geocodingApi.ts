import axios from 'axios';

const geocodingApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_SEARCH_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default geocodingApi;
