import axios from 'axios';


const moonPhaseApi = axios.create({
    baseURL: process.env.EXPO_PUBLIC_CROSSING_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default moonPhaseApi;
