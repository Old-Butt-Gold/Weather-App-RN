import {createAppAsyncThunk} from "../hooks";
import moonPhaseApi from "../../api/moonPhaseApi";

export const fetchMoonPhase = createAppAsyncThunk<number>(
    'weather/fetchMoonPhase',
    async (_, {getState, rejectWithValue}) => {
        try {
            const location = getState().weather.location;
            if (!location?.latitude || !location?.longitude) {
                return rejectWithValue({message: 'Location not set'});
            }

            const response = await moonPhaseApi.get('', {
                params: {
                    unitGroup: 'us',
                    key: process.env.EXPO_PUBLIC_CROSSING_API_KEY,
                    include: 'days',
                    elements: 'datetime,moonphase'
                }
            });

            return response.data.days[0].moonphase;
        } catch (error: any) {
            return rejectWithValue({message: error.message});
        }
    }
);