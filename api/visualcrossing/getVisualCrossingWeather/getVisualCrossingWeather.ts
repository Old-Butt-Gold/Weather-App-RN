import visualCrossingApi from "../api-instance/api-instance";

export const getVisualCrossingWeather = async () => {
    try {
        const response = await visualCrossingApi.get('');
        return response.data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};