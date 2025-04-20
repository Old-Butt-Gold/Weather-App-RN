// screens/WeatherMapScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { fetchLocation } from '../store/actions/fetchLocation';

// Типы для карты погоды
enum MapLayerType {
  TEMPERATURE = 'temp_new',
  PRECIPITATION = 'precipitation_new',
  RAIN = 'rain_new',
  CLOUDS = 'clouds_new',
  PRESSURE = 'pressure_new',
  WIND = 'wind_new',
  SNOW = 'snow_new',
  NONE = 'none'
}

// Типы для погоды
interface WeatherData {
  name: string;
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
    is_day: number;
    pressure_msl?: number;
    precipitation?: number;
    cloudcover?: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
  };
}

// Тип для props экрана
type WeatherMapScreenProps = {
  navigation: any;
};

// Замените на ваш API ключ OpenWeatherMap
const WEATHER_API_KEY = 'b19b9ba226c4299dc884a81eb3784788';

// HTML для карты с данными о погоде
// HTML для карты с данными о погоде
const getWeatherMapHtml = (latitude: number, longitude: number) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weather Map</title>
        
        <!-- Leaflet CSS -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
        
        <style>
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
            width: 100vw;
            background-color: #fff;
            color: black;
            font-family: Arial, sans-serif;
          }
          #map {
            height: 100%;
            width: 100%;
          }
          .leaflet-tile-pane {
            filter: brightness(1.05) contrast(1.1);
          }
          .legend {
            padding: 6px 8px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            border-radius: 5px;
            line-height: 18px;
            color: #000;
          }
          .weather-data {
            position: absolute;
            top: 100px;
            right: 20px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.9);
            color: black;
            padding: 10px;
            border-radius: 8px;
            max-width: 210px;
            font-size: 13px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .weather-data h3 {
            margin-top: 0;
            margin-bottom: 6px;
            font-size: 16px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
          }
          .weather-data div {
            margin-bottom: 3px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div id="weather-data" class="weather-data" style="display: none;"></div>
        
        <!-- Leaflet JS -->
        <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
        
        <script>
          function log(message) {
            console.log(message);
          }
  
          // Инициализация карты
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${latitude}, ${longitude}], 8);
          
          // Базовый светлый слой карты
          const baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
            maxZoom: 19,
            minZoom: 3,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd'
          });
          
          baseLayer.addTo(map);
          log('Base map layer added');
          
          // Слой погоды
          let weatherLayer = null;
          
          // Добавляем масштаб
          L.control.scale({
            position: 'bottomleft',
            imperial: false
          }).addTo(map);
          
          // Функция для отображения легенды
          function addLegend(layerType) {
            // Удаляем существующую легенду если есть
            if (window.legend) {
              map.removeControl(window.legend);
              window.legend = null;
            }
            
            if (layerType === 'none') return;
            
            // Создаем новую легенду в зависимости от типа слоя
            window.legend = L.control({position: 'bottomright'});
            
            window.legend.onAdd = function(map) {
              const div = L.DomUtil.create('div', 'legend');
              let title, gradient, stops;
              
              switch(layerType) {
                case 'temp_new':
                  title = 'Температура (°C)';
                  gradient = 'linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF9900, #FF0000)';
                  stops = ['< -20', '-10', '0', '10', '20', '> 30'];
                  break;
                case 'precipitation_new':
                  title = 'Осадки (мм)';
                  gradient = 'linear-gradient(to right, #FFFFFF, #A4F9FF, #00ECFF, #009BF9, #0059FF, #0400F2)';
                  stops = ['0', '0.5', '1', '2', '5', '10'];
                  break;
                case 'rain_new':
                  title = 'Дождь (мм)';
                  gradient = 'linear-gradient(to right, #FFFFFF, #A4F9C4, #00EC99, #009BA2, #00599F, #040088)';
                  stops = ['0', '0.5', '1', '2', '5', '10'];
                  break;
                case 'wind_new':
                  title = 'Ветер (м/с)';
                  gradient = 'linear-gradient(to right, #FFFFFF, #D9FF00, #33CC33, #00ECFF, #009BF9, #9A00F9)';
                  stops = ['0', '2', '5', '10', '15', '20+'];
                  break;
                case 'clouds_new':
                  title = 'Облачность (%)';
                  gradient = 'linear-gradient(to right, #FFFFFF, #DDDDDD, #AAAAAA, #666666, #333333, #000000)';
                  stops = ['0', '20', '40', '60', '80', '100'];
                  break;
                case 'pressure_new':
                  title = 'Давление (hPa)';
                  gradient = 'linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF9900, #FF0000)';
                  stops = ['990', '1000', '1010', '1020', '1030', '1040'];
                  break;
                case 'snow_new':
                  title = 'Снег (мм)';
                  gradient = 'linear-gradient(to right, #FFFFFF, #E6F5FF, #CCE5FF, #99CCFF, #66A3FF, #3366FF)';
                  stops = ['0', '1', '2', '5', '10', '20+'];
                  break;
                default:
                  title = 'Легенда';
                  gradient = 'none';
                  stops = [];
              }
              
              div.innerHTML = '<h4>' + title + '</h4>';
              
              if (gradient !== 'none') {
                // Добавляем градиент
                div.innerHTML += '<div style="height: 20px; width: 100%; background: ' + gradient + '; margin-bottom: 5px;"></div>';
                
                // Добавляем метки
                let stopsHtml = '<div style="display: flex; justify-content: space-between; font-size: 12px;">';
                for (let i = 0; i < stops.length; i++) {
                  stopsHtml += '<span>' + stops[i] + '</span>';
                }
                stopsHtml += '</div>';
                div.innerHTML += stopsHtml;
              }
              
              return div;
            };
            
            window.legend.addTo(map);
            log('Added legend for ' + layerType);
          }
          
          // Функция для установки слоя погоды
          function setWeatherLayer(layerType) {
            log('Setting weather layer: ' + layerType);
            
            // Удаляем текущий слой погоды, если есть
            if (weatherLayer) {
              map.removeLayer(weatherLayer);
              weatherLayer = null;
              log('Removed previous weather layer');
            }
            
            // Если выбран слой NONE, выходим
            if (layerType === 'none') {
              log('No weather layer selected');
              addLegend('none');
              return;
            }
            
          // Формируем URL для слоя OpenWeatherMap
            const weatherLayerUrl = 'https://tile.openweathermap.org/map/' + layerType + '/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}';
            log('Weather layer URL template: ' + weatherLayerUrl);
            
            // Создаем новый слой
            weatherLayer = L.tileLayer(weatherLayerUrl, {
              maxZoom: 19,
              opacity: 0.85,
              tileSize: 512,
              zoomOffset: -1
            });
            
            weatherLayer.on('tileerror', function(error, tile) {
              log('Error loading tile: ' + tile._url);
            });
            
            // Добавляем слой на карту
            weatherLayer.addTo(map);
            log('Weather layer added to map');
            
            // Добавляем легенду
            addLegend(layerType);
          }
          
          // Функция для отображения данных о погоде
          function displayWeatherData(data) {
            log('Displaying weather data');
            
            if (!data) {
              log('No weather data to display');
              document.getElementById('weather-data').style.display = 'none';
              return;
            }
            
            const weatherDataDiv = document.getElementById('weather-data');
            let html = '<h3>' + data.name + '</h3>';
            
            if (data.current) {
              // Получаем описание погоды по коду
              const weatherDesc = getWeatherDescription(data.current.weather_code);
              
              html += '<div style="display: flex; align-items: center; margin-bottom: 3px;">';
              html += '<div style="font-size: 20px; margin-right: 8px;">' + getWeatherIcon(data.current.weather_code, data.current.is_day) + '</div>';
              html += '<div>' + weatherDesc + '</div>';
              html += '</div>';
              
              html += '<div>Температура: ' + Math.round(data.current.temperature_2m) + '°C</div>';
              html += '<div>Ветер: ' + data.current.wind_speed_10m.toFixed(1) + ' м/с</div>';
              html += '<div>Влажность: ' + data.current.relative_humidity_2m + '%</div>';
              
              if (data.current.pressure_msl) {
                html += '<div>Давление: ' + Math.round(data.current.pressure_msl) + ' гПа</div>';
              }
              
              if (data.current.precipitation !== undefined) {
                html += '<div>Осадки: ' + data.current.precipitation.toFixed(1) + ' мм</div>';
              }
              
              if (data.current.cloudcover !== undefined) {
                html += '<div>Облачность: ' + data.current.cloudcover + '%</div>';
              }
              
              if (data.daily && data.daily.precipitation_probability_max && data.daily.precipitation_probability_max[0] !== undefined) {
                html += '<div>Вер. осадков: ' + data.daily.precipitation_probability_max[0] + '%</div>';
              }
            }
            
            weatherDataDiv.innerHTML = html;
            weatherDataDiv.style.display = 'block';
          }
          
          // Получение иконки погоды по коду
          function getWeatherIcon(code, isDay) {
            isDay = isDay === 1;
            
            switch(code) {
              case 0: // Ясно
                return isDay ? '☀️' : '🌙';
              case 1: // В основном ясно
              case 2: // Переменная облачность  
                return isDay ? '🌤️' : '🌙';
              case 3: // Облачно
                return '☁️';
              case 45: // Туман
              case 48: // Туман с инеем
                return '🌫️';
              case 51: // Легкая морось
              case 53: // Умеренная морось  
              case 55: // Сильная морось
                return '🌦️';
              case 56: // Легкая ледяная морось
              case 57: // Сильная ледяная морось
                return '❄️';
              case 61: // Легкий дождь
              case 63: // Умеренный дождь
                return '🌧️';
              case 65: // Сильный дождь
                return '⛈️';
              case 66: // Легкий ледяной дождь
              case 67: // Сильный ледяной дождь
                return '🌨️';
              case 71: // Легкий снег
              case 73: // Умеренный снег
              case 75: // Сильный снег
                return '❄️';
              case 77: // Снежная крупа
                return '❄️';
              case 80: // Легкий ливень
              case 81: // Умеренный ливень
              case 82: // Сильный ливень
                return '🌧️';
              case 85: // Легкий снегопад
              case 86: // Сильный снегопад
                return '❄️';
              case 95: // Гроза
                return '⚡';
              case 96: // Гроза с легким градом
              case 99: // Гроза с сильным градом
                return '⛈️';
              default:
                return '❓';
            }
          }
          
          // Получение описания погоды по коду
          function getWeatherDescription(code) {
            switch(code) {
              case 0:
                return 'Ясно';
              case 1:
                return 'В основном ясно';
              case 2:
                return 'Переменная облачность';
              case 3:
                return 'Облачно';
              case 45:
              case 48:
                return 'Туман';
              case 51:
                return 'Легкая морось';
              case 53:
                return 'Умеренная морось';
              case 55:
                return 'Сильная морось';
              case 56:
              case 57:
                return 'Ледяная морось';
              case 61:
                return 'Легкий дождь';
              case 63:
                return 'Умеренный дождь';
              case 65:
                return 'Сильный дождь';
              case 66:
              case 67:
                return 'Ледяной дождь';
              case 71:
                return 'Легкий снег';
              case 73:
                return 'Умеренный снег';
              case 75:
                return 'Сильный снег';
              case 77:
                return 'Снежная крупа';
              case 80:
                return 'Легкий ливень';
              case 81:
                return 'Умеренный ливень';
              case 82:
                return 'Сильный ливень';
              case 85:
                return 'Легкий снегопад';
              case 86:
                return 'Сильный снегопад';
              case 95:
                return 'Гроза';
              case 96:
              case 99:
                return 'Гроза с градом';
              default:
                return 'Неизвестно';
            }
          }
          
          // Обработчик клика по карте
          map.on('click', function(e) {
            log('Map clicked at coordinates: ' + e.latlng.lat + ', ' + e.latlng.lng);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'FETCH_WEATHER',
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            }));
          });
          
          // Сообщаем React Native, что карта загружена
          map.whenReady(function() {
            log('Map ready');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_LOADED'
            }));
          });
          
          // Обработчик сообщений от React Native
          window.addEventListener('message', function(event) {
            try {
              const data = JSON.parse(event.data);
              log('Received message: ' + JSON.stringify(data));
              
              if (data.type === 'SET_LAYER') {
                setWeatherLayer(data.layerType);
              } else if (data.type === 'SET_WEATHER_DATA') {
                displayWeatherData(data.weatherData);
              }
            } catch (error) {
              log('Error processing message: ' + error.message);
            }
          });
        </script>
      </body>
      </html>
    `;
  };

// Главный компонент экрана карты погоды
export const WeatherMapScreen = ({ navigation }: WeatherMapScreenProps) => {
  const [loading, setLoading] = useState(true);
  const [mapLayerType, setMapLayerType] = useState<MapLayerType>(MapLayerType.TEMPERATURE);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  const webViewRef = useRef<WebView>(null);
  const dispatch = useDispatch();

  // Изменение типа слоя на карте
  const changeMapLayerType = (type: MapLayerType) => {
    console.log(`Changing map layer to: ${type}`);
    setMapLayerType(type);
    
    // Обновляем слой в WebView
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

  // Получение имени локации по координатам
  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Используем reverse geocoding для получения названия локации
      const location = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (location && location.length > 0) {
        const { city, district, street, region, country } = location[0];
        
        if (city) return city;
        if (district) return district;
        if (street) return street;
        if (region) return region;
        if (country) return country;
      }
      
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting location name:', error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // Получение текущей геолокации
  const getCurrentLocation = async () => {
    try {
      // Запрос разрешения на использование геолокации
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Разрешение на использование геолокации не получено');
        return;
      }

      // Показываем индикатор загрузки
      setLoading(true);

      // Получаем текущую позицию
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      console.log(`Current location: ${latitude}, ${longitude}`);
      
      // Центрируем карту на текущей позиции
      if (webViewRef.current) {
        const script = `
          try {
            map.setView([${latitude}, ${longitude}], 10);
          } catch(e) {
            console.error('Error centering map:', e);
          }
          true;
        `;
        
        webViewRef.current.injectJavaScript(script);
      }
      
      // Загружаем данные о погоде для текущей локации
      await fetchWeatherData(latitude, longitude);
    } catch (error) {
      console.error('Error getting location', error);
      Alert.alert('Ошибка', 'Не удалось определить местоположение');
    } finally {
      // Скрываем индикатор загрузки
      setLoading(false);
    }
  };

  // Загрузка данных о погоде с использованием Open-Meteo API
  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      console.log(`Fetching weather data for: ${latitude}, ${longitude}`);
      
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,wind_speed_10m,relative_humidity_2m,is_day,weather_code,pressure_msl,precipitation,cloudcover',
          daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,precipitation_probability_max',
          timezone: 'auto',
          temperature_unit: 'celsius',
          wind_speed_unit: 'ms'
        }
      });
      
      // Получаем название локации
      const locationName = await getLocationName(latitude, longitude);
      
      // Создаем объект с данными о погоде
      const weatherData: WeatherData = {
        name: locationName,
        latitude,
        longitude,
        current: response.data.current,
        daily: response.data.daily
      };
      
      setWeatherData(weatherData);
      
      // Отправляем данные в WebView
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          try {
            window.postMessage(JSON.stringify({
              type: 'SET_WEATHER_DATA',
              weatherData: ${JSON.stringify(weatherData)}
            }), '*');
          } catch(e) {
            console.error('Error sending weather data:', e);
          }
          true;
        `);
      }
      
      console.log('Weather data fetched successfully');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить погодные данные');
    }
  };

  // Установка начального слоя после загрузки карты
  useEffect(() => {
    if (!loading && webViewRef.current) {
      // Таймаут для гарантии, что карта полностью загружена
      setTimeout(() => {
        changeMapLayerType(mapLayerType);
      }, 1000);
    }
  }, [loading]);

  // Обработчик сообщений от WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'MAP_LOADED') {
        setLoading(false);
        console.log('Map loaded in WebView');
      } else if (message.type === 'FETCH_WEATHER') {
        fetchWeatherData(message.latitude, message.longitude);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Leaflet WebView */}
      <WebView
        ref={webViewRef}
        style={styles.webView}
        source={{ html: getWeatherMapHtml(53.9, 27.6) }} // Координаты Минска
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        incognito={true}
        cacheEnabled={false}
      />
      
      {/* Боковая панель слоёв и GPS */}
      <View style={styles.sidePanel}>
        {/* Кнопки для слоев погоды */}
        <View style={styles.layerButtons}>
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.TEMPERATURE ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.TEMPERATURE)}
          >
            <Text style={styles.layerButtonText}>🌡️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.PRECIPITATION ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.PRECIPITATION)}
          >
            <Text style={styles.layerButtonText}>🌧️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.RAIN ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.RAIN)}
          >
            <Text style={styles.layerButtonText}>💦</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.WIND ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.WIND)}
          >
            <Text style={styles.layerButtonText}>💨</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.CLOUDS ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.CLOUDS)}
          >
            <Text style={styles.layerButtonText}>☁️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.PRESSURE ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.PRESSURE)}
          >
            <Text style={styles.layerButtonText}>📊</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.SNOW ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.SNOW)}
          >
            <Text style={styles.layerButtonText}>❄️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.layerButton, mapLayerType === MapLayerType.NONE ? styles.activeLayerButton : null]}
            onPress={() => changeMapLayerType(MapLayerType.NONE)}
          >
            <Text style={styles.layerButtonText}>🗺️</Text>
          </TouchableOpacity>
          
          {/* Кнопка GPS размещена под слоями */}
          <TouchableOpacity 
            style={[styles.layerButton, styles.gpsButton]}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Верхняя панель с кнопкой возврата */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Карта погоды</Text>
      </View>
      
      {/* Индикатор загрузки */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
  webView: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sidePanel: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 100 : 80,
    zIndex: 10,
  },
  layerButtons: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  layerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeLayerButton: {
    backgroundColor: 'rgba(0, 120, 255, 0.9)',
  },
  layerButtonText: {
    fontSize: 16,
  },
  gpsButton: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 150, 136, 0.9)',
  }
});

export default WeatherMapScreen;