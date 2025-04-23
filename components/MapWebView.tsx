import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// WebView props
interface MapWebViewProps {
    initialLatitude: number;
    initialLongitude: number;
    translations: any;
    onMessage: (event: any) => void;
}

// Generates HTML for the map
const getWeatherMapHtml = (latitude: number, longitude: number, translations: any) => {
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
          // Отправляем сообщение в React Native вместо консоли WebView
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOG',
            message: message
          }));
        }
        // Initialize map
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([${latitude}, ${longitude}], 8);
        
        // Base light map layer
        const baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
          maxZoom: 19,
          minZoom: 3,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd'
        });
        
        baseLayer.addTo(map);
        log('Base map layer added');
        
        // Weather layer
        let weatherLayer = null;
        
        // Add scale
        L.control.scale({
          position: 'bottomleft',
          imperial: false
        }).addTo(map);
        
        // Function to display legend
        function addLegend(layerType) {
          // Remove existing legend if any
          if (window.legend) {
            map.removeControl(window.legend);
            window.legend = null;
          }
          
          if (layerType === 'none') return;
          
          // Create new legend based on layer type
          window.legend = L.control({position: 'bottomright'});
          
          window.legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'legend');
            let title, gradient, stops;
            
            switch(layerType) {
              case 'temp_new':
                title = '${translations.legend.temperature}';
                gradient = 'linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF9900, #FF0000)';
                stops = ['< -20', '-10', '0', '10', '20', '> 30'];
                break;
              case 'precipitation_new':
                title = '${translations.legend.precipitation}';
                gradient = 'linear-gradient(to right, #FFFFFF, #A4F9FF, #00ECFF, #009BF9, #0059FF, #0400F2)';
                stops = ['0', '0.5', '1', '2', '5', '10'];
                break;
              case 'wind_new':
                title = '${translations.legend.wind}';
                gradient = 'linear-gradient(to right, #FFFFFF, #D9FF00, #33CC33, #00ECFF, #009BF9, #9A00F9)';
                stops = ['0', '2', '5', '10', '15', '20+'];
                break;
              case 'clouds_new':
                title = '${translations.legend.clouds}';
                gradient = 'linear-gradient(to right, #FFFFFF, #DDDDDD, #AAAAAA, #666666, #333333, #000000)';
                stops = ['0', '20', '40', '60', '80', '100'];
                break;
              case 'pressure_new':
                title = '${translations.legend.pressure}';
                gradient = 'linear-gradient(to right, #0000FF, #00FFFF, #00FF00, #FFFF00, #FF9900, #FF0000)';
                stops = ['990', '1000', '1010', '1020', '1030', '1040'];
                break;
              case 'snow_new':
                title = '${translations.legend.snow}';
                gradient = 'linear-gradient(to right, #FFFFFF, #E6F5FF, #CCE5FF, #99CCFF, #66A3FF, #3366FF)';
                stops = ['0', '1', '2', '5', '10', '20+'];
                break;
              default:
                title = '${translations.legend.title}';
                gradient = 'none';
                stops = [];
            }
            
            div.innerHTML = '<h4>' + title + '</h4>';
            
            if (gradient !== 'none') {
              // Add gradient
              div.innerHTML += '<div style="height: 20px; width: 100%; background: ' + gradient + '; margin-bottom: 5px;"></div>';
              
              // Add labels
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
        
        // Function to set weather layer
        function setWeatherLayer(layerType) {
          log('Setting weather layer: ' + layerType);
          
          // Remove current weather layer if any
          if (weatherLayer) {
            map.removeLayer(weatherLayer);
            weatherLayer = null;
            log('Removed previous weather layer');
          }
          
          // If NONE layer selected, exit
          if (layerType === 'none') {
            log('No weather layer selected');
            addLegend('none');
            return;
          }
          
          // Create URL for OpenWeatherMap layer
          const weatherLayerUrl = '${process.env.EXPO_PUBLIC_OPENWEATHER_API_URL}/' + layerType + '/{z}/{x}/{y}.png?appid=${process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY}';
          log('Weather layer URL template: ' + weatherLayerUrl);
          
          // Create new layer
          weatherLayer = L.tileLayer(weatherLayerUrl, {
            maxZoom: 19,
            opacity: 0.85,
            tileSize: 512,
            zoomOffset: -1
          });
          
          weatherLayer.on('tileerror', function(error, tile) {
            log('Error loading tile: ' + tile._url);
          });
          
          // Add layer to map
          weatherLayer.addTo(map);
          log('Weather layer added to map');
          
          // Add legend
          addLegend(layerType);
        }
        
        // Function to display weather data
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
            // Get weather description by code
            const weatherDesc = getWeatherDescription(data.current.weather_code);
            
            html += '<div style="display: flex; align-items: center; margin-bottom: 3px;">';
            html += '<div style="font-size: 20px; margin-right: 8px;">' + getWeatherIcon(data.current.weather_code, data.current.is_day) + '</div>';
            html += '<div>' + weatherDesc + '</div>';
            html += '</div>';
            
            html += '<div>${translations.weatherData.temperature}: ' + Math.round(data.current.temperature_2m) + '°C</div>';
            html += '<div>${translations.weatherData.wind}: ' + data.current.wind_speed_10m.toFixed(1) + ' m/s</div>';
            html += '<div>${translations.weatherData.humidity}: ' + data.current.relative_humidity_2m + '%</div>';
            
            if (data.current.pressure_msl) {
              html += '<div>${translations.weatherData.pressure}: ' + Math.round(data.current.pressure_msl) + ' hPa</div>';
            }
            
            if (data.current.precipitation !== undefined) {
              html += '<div>${translations.weatherData.precipitation}: ' + data.current.precipitation.toFixed(1) + ' mm</div>';
            }
            
            if (data.current.cloudcover !== undefined) {
              html += '<div>${translations.weatherData.cloudCover}: ' + data.current.cloudcover + '%</div>';
            }
            
            if (data.daily && data.daily.precipitation_probability_max && data.daily.precipitation_probability_max[0] !== undefined) {
              html += '<div>${translations.weatherData.precipitationProbability}: ' + data.daily.precipitation_probability_max[0] + '%</div>';
            }
          }
          
          weatherDataDiv.innerHTML = html;
          weatherDataDiv.style.display = 'block';
        }
        
        // Get weather icon by code
        function getWeatherIcon(code, isDay) {
          isDay = isDay === 1;
          
          switch(code) {
            case 0: // Clear
              return isDay ? '☀️' : '🌙';
            case 1: // Mainly clear
            case 2: // Partly cloudy  
              return isDay ? '🌤️' : '🌙';
            case 3: // Cloudy
              return '☁️';
            case 45: // Fog
            case 48: // Freezing fog
              return '🌫️';
            case 51: // Light drizzle
            case 53: // Moderate drizzle  
            case 55: // Heavy drizzle
              return '🌦️';
            case 56: // Light freezing drizzle
            case 57: // Heavy freezing drizzle
              return '❄️';
            case 61: // Light rain
            case 63: // Moderate rain
              return '🌧️';
            case 65: // Heavy rain
              return '⛈️';
            case 66: // Light freezing rain
            case 67: // Heavy freezing rain
              return '🌨️';
            case 71: // Light snow
            case 73: // Moderate snow
            case 75: // Heavy snow
              return '❄️';
            case 77: // Snow grains
              return '❄️';
            case 80: // Light showers
            case 81: // Moderate showers
            case 82: // Heavy showers
              return '🌧️';
            case 85: // Light snow showers
            case 86: // Heavy snow showers
              return '❄️';
            case 95: // Thunderstorm
              return '⚡';
            case 96: // Thunderstorm with light hail
            case 99: // Thunderstorm with heavy hail
              return '⛈️';
            default:
              return '❓';
          }
        }
        
        // Get weather description by code
        function getWeatherDescription(code) {
          switch(code) {
            case 0:
              return '${translations.weatherDescription.clear}';
            case 1:
              return '${translations.weatherDescription.mainlyClear}';
            case 2:
              return '${translations.weatherDescription.partlyCloudy}';
            case 3:
              return '${translations.weatherDescription.cloudy}';
            case 45:
            case 48:
              return '${translations.weatherDescription.fog}';
            case 51:
              return '${translations.weatherDescription.lightDrizzle}';
            case 53:
              return '${translations.weatherDescription.moderateDrizzle}';
            case 55:
              return '${translations.weatherDescription.heavyDrizzle}';
            case 56:
            case 57:
              return '${translations.weatherDescription.freezingDrizzle}';
            case 61:
              return '${translations.weatherDescription.lightRain}';
            case 63:
              return '${translations.weatherDescription.moderateRain}';
            case 65:
              return '${translations.weatherDescription.heavyRain}';
            case 66:
            case 67:
              return '${translations.weatherDescription.freezingRain}';
            case 71:
              return '${translations.weatherDescription.lightSnow}';
            case 73:
              return '${translations.weatherDescription.moderateSnow}';
            case 75:
              return '${translations.weatherDescription.heavySnow}';
            case 77:
              return '${translations.weatherDescription.snowGrains}';
            case 80:
              return '${translations.weatherDescription.lightShowers}';
            case 81:
              return '${translations.weatherDescription.moderateShowers}';
            case 82:
              return '${translations.weatherDescription.heavyShowers}';
            case 85:
              return '${translations.weatherDescription.lightSnowfall}';
            case 86:
              return '${translations.weatherDescription.heavySnowfall}';
            case 95:
              return '${translations.weatherDescription.thunderstorm}';
            case 96:
            case 99:
              return '${translations.weatherDescription.thunderstormWithHail}';
            default:
              return '${translations.weatherDescription.unknown}';
          }
        }
        
        // Map click handler
        map.on('click', function(e) {
          log('Map clicked at coordinates: ' + e.latlng.lat + ', ' + e.latlng.lng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FETCH_WEATHER',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });
        
        // Tell React Native that map is loaded
        map.whenReady(function() {
          log('Map ready');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'MAP_LOADED'
          }));
        });
        
        // Message handler from React Native
        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            log('Received message: ' + JSON.stringify(data));
            
            if (data.type === 'SET_LAYER') {
              setWeatherLayer(data.layerType);
            } else if (data.type === 'SET_WEATHER_DATA') {
              displayWeatherData(data.weatherData);
            } else if (data.type === 'SET_CENTER') {
              map.setView([data.latitude, data.longitude], data.zoom || 10);
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

// MapWebView component with forwardRef to allow parent to access the WebView ref
const MapWebView = forwardRef<WebView, MapWebViewProps>(
    (
        {
            initialLatitude,
            initialLongitude,
            translations,
            onMessage,
        }, ref
    ) => {
    return (
        <WebView
            ref={ref}
            style={styles.webView}
            source={{
                html: getWeatherMapHtml(
                    initialLatitude,
                    initialLongitude,
                    translations
                )
            }}
            onMessage={onMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            incognito={true}
            cacheEnabled={false}
        />
    );
});

const styles = StyleSheet.create({
    webView: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapWebView;