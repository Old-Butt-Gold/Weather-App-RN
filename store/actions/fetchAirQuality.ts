import {AirQuality} from "../types/types";
import {createAppAsyncThunk} from "../hooks";
import airQualityApi from "../../api/airQualityApi";

export const fetchAirQuality = createAppAsyncThunk<AirQuality>(
    'weather/fetchAirQuality',
    async (_, {getState, rejectWithValue}) => {
        try {
            const location = getState().weather.location;
            if (!location?.latitude || !location?.longitude) {
                return rejectWithValue({message: 'Location not set'});
            }

            const response = await airQualityApi.get('', {
                params: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    hourly: 'us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_carbon_monoxide,us_aqi_ozone,us_aqi_sulphur_dioxide',
                    timezone: 'auto',
                    forecast_days: 1
                }
            });

            return response.data.hourly as AirQuality;
        } catch (error: any) {
            return rejectWithValue({message: error.message});
        }
    }
);