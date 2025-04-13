import axios from 'axios';


const visualCrossingApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_CROSSING_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default visualCrossingApi;
