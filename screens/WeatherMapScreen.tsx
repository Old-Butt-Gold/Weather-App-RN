import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';

// Import components
import MapWebView from '../components/MapWebView';
import LayerButtons from '../components/LayerButtons';
import WeatherHeader from '../components/WeatherHeader';
import LoadingOverlay from '../components/LoadingOverlay';

// Import actions
import { fetchMapWeather } from '../store/actions/fetchMapWeather';
import { getCurrentLocation } from '../store/actions/getCurrentLocation';

// Import types
import { MapLayerType, WeatherMapData } from '../store/types/types';

// Type for screen props
type WeatherMapScreenProps = {
  navigation: any;
};

// Initial map coordinates (Minsk)
const DEFAULT_LATITUDE = 53.9;
const DEFAULT_LONGITUDE = 27.6;

export const WeatherMapScreen = ({ navigation }: WeatherMapScreenProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Refs
  const webViewRef = useRef<WebView>(null);
  
  // Local state for managing map and layer
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>(MapLayerType.TEMPERATURE);
  const [isLoading, setIsLoading] = useState(true);
  
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
      precipitationProbability: t('weatherMap.weatherData.precipitationProbability')
    },
    legend: {
      title: t('weatherMap.legend.title'),
      temperature: t('weatherMap.legend.temperature'),
      precipitation: t('weatherMap.legend.precipitation'),
      rain: t('weatherMap.legend.rain'),
      wind: t('weatherMap.legend.wind'),
      clouds: t('weatherMap.legend.clouds'),
      pressure: t('weatherMap.legend.pressure'),
      snow: t('weatherMap.legend.snow')
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
      
      // Dispatch action to get current location
      const resultAction: any = await dispatch(getCurrentLocation());
      
      if (resultAction.payload) {
        const coords = resultAction.payload;
        
        // Center map on current location
        centerMap(coords.latitude, coords.longitude);
        
        // Fetch weather data for the location
        const weatherAction: any = await dispatch(fetchMapWeather({ 
          latitude: coords.latitude, 
          longitude: coords.longitude 
        }));
        
        if (weatherAction.payload) {
          updateWeatherDataInWebView(weatherAction.payload);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
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
  const updateWeatherDataInWebView = (data: WeatherMapData) => {
    if (webViewRef.current) {
      const script = `
        try {
          window.postMessage(JSON.stringify({
            type: 'SET_WEATHER_DATA',
            weatherData: ${JSON.stringify(data)}
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
        case 'FETCH_WEATHER':
          setIsLoading(true);
          try {
            const weatherAction: any = await dispatch(fetchMapWeather({ 
              latitude: message.latitude, 
              longitude: message.longitude 
            }));
            
            if (weatherAction.payload) {
              updateWeatherDataInWebView(weatherAction.payload);
            }
          } catch (error) {
            console.error('Error fetching weather data:', error);
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
        initialLatitude={DEFAULT_LATITUDE}
        initialLongitude={DEFAULT_LONGITUDE}
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