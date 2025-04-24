import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// Import components
import MapWebView from '../components/MapWebView';
import LayerButtons from '../components/LayerButtons';
import WeatherHeader from '../components/WeatherHeader';
import LoadingOverlay from '../components/LoadingOverlay';
import ActionButton from '../components/ActionButton';

// Import actions
import { fetchMapWeather } from '../store/actions/fetchMapWeather';
import { setLocation, setCurrentCity } from '../store/slices/weatherSlice';
import { fetchWeather } from '../store/actions/fetchWeather';
import { fetchMoonPhase } from '../store/actions/fetchMoonPhase';
import { fetchAirQuality } from '../store/actions/fetchAirQuality';

// Import types
import { MapLayerType, WeatherMapData } from '../store/types/types';
import { t } from 'i18next';
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {fetchCurrentLocation} from "../store/actions/fetchCurrentLocation";

// Type for screen props
type WeatherMapScreenProps = {
    navigation: any;
};

// Initial map coordinates (Minsk)
const DEFAULT_LATITUDE = 53.9;
const DEFAULT_LONGITUDE = 27.6;

export const WeatherMapScreen = ({ navigation }: WeatherMapScreenProps) => {
    const dispatch = useAppDispatch();

    const webViewRef = useRef<WebView>(null);

    const [mapLoaded, setMapLoaded] = useState(false);
    const [activeLayer, setActiveLayer] = useState<MapLayerType>(MapLayerType.TEMPERATURE);
    const [isLoading, setIsLoading] = useState(true);
    const [weatherData, setWeatherData] = useState<WeatherMapData | null>(null);

    const currentWeatherLocation = useAppSelector(x => x.weather.location);
    const {latitude, longitude} = currentWeatherLocation!;

    // Create translations object for the WebView
    const weatherMapTranslations = {
        weatherDescription: {
            clear: t('weatherMap.weatherDescription.clear'),
            mainlyClear: t('weatherMap.weatherDescription.mainlyClear'),
            partlyCloudy: t('weatherMap.weatherDescription.partlyCloudy'),
            cloudy: t('weatherMap.weatherDescription.cloudy'),
            fog: t('weatherMap.weatherDescription.fog'),
            lightDrizzle: t('weatherMap.weatherDescription.lightDrizzle'),
            moderateDrizzle: t('weatherMap.weatherDescription.moderateDrizzle'),
            heavyDrizzle: t('weatherMap.weatherDescription.heavyDrizzle'),
            freezingDrizzle: t('weatherMap.weatherDescription.freezingDrizzle'),
            lightRain: t('weatherMap.weatherDescription.lightRain'),
            moderateRain: t('weatherMap.weatherDescription.moderateRain'),
            heavyRain: t('weatherMap.weatherDescription.heavyRain'),
            freezingRain: t('weatherMap.weatherDescription.freezingRain'),
            lightSnow: t('weatherMap.weatherDescription.lightSnow'),
            moderateSnow: t('weatherMap.weatherDescription.moderateSnow'),
            heavySnow: t('weatherMap.weatherDescription.heavySnow'),
            snowGrains: t('weatherMap.weatherDescription.snowGrains'),
            lightShowers: t('weatherMap.weatherDescription.lightShowers'),
            moderateShowers: t('weatherMap.weatherDescription.moderateShowers'),
            heavyShowers: t('weatherMap.weatherDescription.heavyShowers'),
            lightSnowfall: t('weatherMap.weatherDescription.lightSnowfall'),
            heavySnowfall: t('weatherMap.weatherDescription.heavySnowfall'),
            thunderstorm: t('weatherMap.weatherDescription.thunderstorm'),
            thunderstormWithHail: t('weatherMap.weatherDescription.thunderstormWithHail'),
            unknown: t('weatherMap.weatherDescription.unknown')
        },
        weatherData: {
            temperature: t('weatherMap.weatherData.temperature'),
            wind: t('weatherMap.weatherData.wind'),
            humidity: t('weatherMap.weatherData.humidity'),
            pressure: t('weatherMap.weatherData.pressure'),
            precipitation: t('weatherMap.weatherData.precipitation'),
            cloudCover: t('weatherMap.weatherData.cloudCover'),
            precipitationProbability: t('weatherMap.weatherData.precipitationProbability'),
            latitude: t('weatherMap.weatherData.latitude'),
            longitude: t('weatherMap.weatherData.longitude'),
        },
        legend: {
            title: t('weatherMap.legend.title'),
            temperature: t('weatherMap.legend.temperature'),
            precipitation: t('weatherMap.legend.precipitation'),
            wind: t('weatherMap.legend.wind'),
            clouds: t('weatherMap.legend.clouds'),
            pressure: t('weatherMap.legend.pressure'),
            snow: t('weatherMap.legend.snow')
        }
    };

    // Handle button press - Apply the selected location
    const handleApplyLocation = async () => {
        if (!weatherData) return;

        try {
            setIsLoading(true);

            dispatch(setLocation({longitude: weatherData.longitude, latitude: weatherData.latitude}));

            dispatch(setCurrentCity(weatherData.name));

            await Promise.all([
                dispatch(fetchWeather()),
                dispatch(fetchMoonPhase()),
                dispatch(fetchAirQuality())
            ]);

            navigation.navigate('Home');
        } catch (error) {
            Alert.alert(t('weatherMap.error'), t('weatherMap.locationApplyError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Change map layer type
    const handleLayerChange = (type: MapLayerType) => {
        console.log(`Changing map layer to: ${type}`);
        setActiveLayer(type);

        // Update layer in WebView
        if (webViewRef.current) {
            const script = `
                try {
                  window.postMessage(JSON.stringify({
                    type: 'SET_LAYER',
                    layerType: '${type}'
                  }), '*');
                } catch(e) {
                  console.error('Error in script:', e);
                }
                true;
              `;

            webViewRef.current.injectJavaScript(script);
        }
    };

    // Get current location and weather data
    const handleLocationRequest = async () => {
        try {
            setIsLoading(true);

            // Здесь при rejectWithValue и unwrap() генерируется catch, и error можем обработать
            const result = await dispatch(fetchCurrentLocation()).unwrap();

            const {latitude, longitude} = result;

            centerMap(latitude, longitude, 15);

            const weatherResult = await dispatch(fetchMapWeather({latitude, longitude})).unwrap();

            setWeatherData(weatherResult);
            updateWeatherDataInWebView(weatherResult);
        } catch (error) {
            Alert.alert(t('weatherMap.error'), t('weatherMap.locationError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Center map on coordinates
    const centerMap = (latitude: number, longitude: number, zoom = 10) => {
        if (webViewRef.current) {
            const script = `
                try {
                  window.postMessage(JSON.stringify({
                    type: 'SET_CENTER',
                    latitude: ${latitude},
                    longitude: ${longitude},
                    zoom: ${zoom}
                  }), '*');
                } catch(e) {
                  console.error('Error centering map:', e);
                }
                true;
              `;

            webViewRef.current.injectJavaScript(script);
        }
    };

    // Update weather data in the WebView
    const updateWeatherDataInWebView = (weatherData: WeatherMapData) => {
        if (webViewRef.current) {
            const script = `
                try {
                  window.postMessage(JSON.stringify({
                    type: 'SET_WEATHER_DATA',
                    weatherData: ${JSON.stringify(weatherData)}
                  }), '*');
                } catch(e) {
                  console.error('Error sending weather data:', e);
                }
                true;
              `;

            webViewRef.current.injectJavaScript(script);
        }
    };

    // Set initial layer after map load
    useEffect(() => {
        if (mapLoaded) {
            // Set active layer after map load
            handleLayerChange(activeLayer);
        }
    }, [mapLoaded]);

    // WebView message handler
    const handleWebViewMessage = async (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            switch (message.type) {
                case 'MAP_LOADED':
                    setMapLoaded(true);
                    setIsLoading(false);
                    console.log('Map loaded in WebView');
                    break;
                case 'LOG':
                    console.log('WebView Log:', message.message);
                    break;
                case 'FETCH_WEATHER':
                    setIsLoading(true);
                    try {
                        const normalizedLng = ((message.longitude % 360) + 540) % 360 - 180;
                        // Внутри также спрашивается за геолокацию, здесь выскакивает ошибка геолокации
                        // и идет в catch с rejectWithValue!
                        const result = await dispatch(fetchMapWeather({
                            latitude: message.latitude,
                            longitude: normalizedLng
                        })).unwrap();

                        setWeatherData(result);
                        updateWeatherDataInWebView(result);
                    } catch (error) {
                        Alert.alert(t('weatherMap.error'), t('weatherMap.weatherFetchError'));
                    } finally {
                        setIsLoading(false);
                    }
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Map WebView Component */}
            <MapWebView
                ref={webViewRef}
                initialLatitude={latitude}
                initialLongitude={longitude}
                translations={weatherMapTranslations}
                onMessage={handleWebViewMessage}
            />

            {/* Layer Buttons Component */}
            <LayerButtons
                activeLayer={activeLayer}
                onLayerChange={handleLayerChange}
                onLocationRequest={handleLocationRequest}
            />

            {/* Header Component */}
            <WeatherHeader
                title={t('weatherMap.title')}
                onBack={() => navigation.goBack()}
            />

            {/* Action Button - only visible when weather data is available */}
            <ActionButton
                title={t('weatherMap.actionButton')}
                visible={!!weatherData}
                onPress={handleApplyLocation}
            />

            {/* Loading Overlay Component */}
            <LoadingOverlay isVisible={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
});

export default WeatherMapScreen;