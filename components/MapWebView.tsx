import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import LoadingOverlay from "./LoadingOverlay";

// WebView props
interface MapWebViewProps {
    initialLatitude: number;
    initialLongitude: number;
    translations: any;
    onMessage: (event: any) => void;
}

// Generates HTML for the map
const getWeatherMapHtml = (latitude: number, longitude: number, translations: Record<string, any>) => {
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
          /* стили для карты */
        }
        .legend {
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          width: 100%;
          font-family: -apple-system, sans-serif;
        }
        .legend h4 {
          margin: 0 0 6px;
          font-size: 14px;
          text-align: center;
        }
        .legend .gradient {
          height: 12px;
          width: 100%;
          margin-bottom: 4px;
          border-radius: 4px;
        }
        .legend .labels {
          display: flex;
          justify-content: space-between;
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
        .close-btn {
          position: absolute;
          top: 5px;
          right: 5px;
          cursor: pointer;
          font-size: 18px;
          color: #666;
          padding: 2px;
        }
        
        .close-btn:hover {
          color: #333;
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
        const map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([${latitude}, ${longitude}], 12);
        
        let lastMarker = null;
        const arrowIcon = L.icon({
          iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="%23ff0000"><circle cx="16" cy="16" r="12" stroke="%23ff4040" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="%23ffffff"/></svg>',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        
        // Функция скрытия данных
        function hideWeatherData() {
          document.getElementById('weather-data').style.display = 'none';
          if (lastMarker) {
            map.removeLayer(lastMarker);
            lastMarker = null;
          }
        }
        
        // Base light map layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          minZoom: 3,
          attribution: 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, ' +
            'AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(map);
        
        L.tileLayer('https://{s}.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
          maxZoom: 19,
          minZoom: 3,
          subdomains:['mt0','mt1','mt2','mt3'],
          attribution: 'Google Maps'
        }).addTo(map);
        
        // Add scale
        L.control.scale({
          position: 'bottomleft',
          imperial: false
        }).addTo(map);
        
        let weatherLayer = null;        
        
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
                gradient = 'linear-gradient(to right, ' +
                  'rgba(130,22,146,1) 0%, ' +      // -65°C
                  'rgba(130,22,146,1) 9%, ' +       // -55°C
                  'rgba(130,22,146,1) 18%, ' +      // -45°C
                  'rgba(130,22,146,1) 27%, ' +      // -40°C
                  'rgba(130,87,219,1) 36%, ' +      // -30°C
                  'rgba(32,140,236,1) 45%, ' +      // -20°C
                  'rgba(32,196,232,1) 55%, ' +      // -10°C
                  'rgba(35,221,221,1) 64%, ' +      // 0°C
                  'rgba(194,255,40,1) 73%, ' +      // 10°C
                  'rgba(255,240,40,1) 82%, ' +      // 20°C
                  'rgba(255,194,40,1) 91%, ' +     // 25°C
                  'rgba(252,128,20,1) 100%)';      // 30°C
                stops = ['-65', '-40', '-20', '0', '10', '20', '30'];
                break;
            
              case 'precipitation_new':
                title = '${translations.legend.precipitation}';
                gradient = 'linear-gradient(to right, ' +
                  'rgba(225,200,100,0) 0%, ' +     // 0mm
                  'rgba(200,150,150,0) 10%, ' +    // 0.1mm
                  'rgba(150,150,170,0) 20%, ' +    // 0.2mm
                  'rgba(120,120,190,0) 30%, ' +     // 0.5mm
                  'rgba(110,110,205,0.3) 40%, ' +  // 1mm
                  'rgba(80,80,225,0.7) 60%, ' +    // 10mm
                  'rgba(20,20,255,0.9) 100%)';     // 140mm
                stops = ['0', '0.5', '1', '10', '140'];
                break;
            
              case 'wind_new':
                title = '${translations.legend.wind}';
                gradient = 'linear-gradient(to right, ' +
                  'rgba(255,255,255,0) 0%, ' +     // 1 m/s
                  'rgba(238,206,206,0.4) 20%, ' +  // 5 m/s
                  'rgba(179,100,188,0.7) 40%, ' + // 15 m/s
                  'rgba(63,33,59,0.8) 60%, ' +    // 25 m/s
                  'rgba(116,76,172,0.9) 80%, ' +  // 50 m/s
                  'rgba(13,17,38,1) 100%)';        // 200 m/s
                stops = ['1', '5', '15', '25', '50', '200'];
                break;
            
              case 'clouds_new':
                title = '${translations.legend.clouds}';
                gradient = 'linear-gradient(to right, ' +
                  'rgba(255,255,255,0) 0%, ' +
                  'rgba(253,253,255,0.1) 10%, ' +
                  'rgba(252,251,255,0.2) 20%, ' +
                  'rgba(250,250,255,0.3) 30%, ' +
                  'rgba(249,248,255,0.4) 40%, ' +
                  'rgba(247,247,255,0.5) 50%, ' +
                  'rgba(246,245,255,0.75) 60%, ' +
                  'rgba(244,244,255,1) 70%, ' +
                  'rgba(243,242,255,1) 80%, ' +
                  'rgba(242,241,255,1) 90%, ' +
                  'rgba(240,240,255,1) 100%)';
                stops = ['0', '20', '40', '60', '80', '100'];
                break;
            
              case 'pressure_new':
                title = '${translations.legend.pressure}';
                gradient = 'linear-gradient(to right, ' +
                  'rgba(0,115,255,1) 0%, ' +      // 94000 Pa
                  'rgba(0,170,255,1) 14%, ' +     // 96000 Pa
                  'rgba(75,208,214,1) 28%, ' +    // 98000 Pa
                  'rgba(141,231,199,1) 42%, ' +   // 100000 Pa
                  'rgba(176,247,32,1) 56%, ' +    // 101000 Pa
                  'rgba(240,184,0,1) 70%, ' +     // 102000 Pa
                  'rgba(251,85,21,1) 84%, ' +     // 104000 Pa
                  'rgba(198,0,0,1) 100%)';        // 108000 Pa
                stops = ['940', '980', '1010', '1020', '1040', '1080'];
                break;
            
              case 'snow_new':
                title = '${translations.legend.snow}';
                gradient = 'linear-gradient(to right, ' +
                  'transparent 0%, ' +           // 0mm
                  '#00d8ff 20%, ' +             // 5mm
                  '#00b6ff 40%, ' +            // 10mm
                  '#9549ff 100%)';             // 25mm
                stops = ['0', '5', '10', '25'];
                break;
            
              default:
                title = '${translations.legend.title}';
                gradient = 'none';
                stops = [];
             }
            
            div.innerHTML = '<h4>' + title + '</h4>';
            
            if (gradient !== 'none') {
              // Add gradient
              div.innerHTML += '<div style="height: 30px; background: ' + gradient + '; margin-bottom: 5px;"></div>';
              
              // Add labels
              let stopsHtml = '<div class="labels">';
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
            minZoom: 3,
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
          const weatherDataDiv = document.getElementById('weather-data');
  
          if (!data) {
            hideWeatherData();
            return;
          }
          
          if (lastMarker) {
            map.removeLayer(lastMarker);
          }
          
          lastMarker = L.marker({lat: data.latitude, lng: data.longitude}, { 
            icon: arrowIcon,
            title: 'Selected Location'
          }).addTo(map);

          let html = '<div class="close-btn" onclick="hideWeatherData()">×</div>'
            + '<h3>' + data.name + '</h3>'
          ;
          
          if (data.current) {
            // Get weather description by code
            const weatherDesc = getWeatherDescription(data.current.weather_code);
            
            html += '<div style="display: flex; align-items: center; margin-bottom: 3px;">';
            html += '<div style="font-size: 20px; margin-right: 8px;">' + getWeatherIcon(data.current.weather_code, data.current.is_day) + '</div>';
            html += '<div>' + weatherDesc + '</div>';
            html += '</div>';
            
            const tempUnit = data.temperatureUnit;
            const windUnit = data.windSpeedUnit;
            
            log(tempUnit);
            log(windUnit);
            
            let translationWindUnit = "";
            
            if (windUnit === 'km/h') {
                translationWindUnit = '${translations.weatherDescription.kilometersHour}';
            }
            if (windUnit === 'm/s') {
                translationWindUnit = '${translations.weatherDescription.metersSeconds}';
            }
            if (windUnit === 'mph') {
                translationWindUnit = '${translations.weatherDescription.mph}';
            }
            
            html += '<div>${translations.weatherData.temperature}: ' + Math.round(data.current.temperature_2m) + ' ' + tempUnit + '</div>';
            html += '<div>${translations.weatherData.wind}: ' + data.current.wind_speed_10m.toFixed(1) + ' ' + translationWindUnit + '</div>';
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
            
            if (data.latitude) {
                html += '<div>${translations.weatherData.latitude}: ' + data.latitude.toFixed(4) + '</div>';
            }
            
            if (data.longitude) {
                html += '<div>${translations.weatherData.longitude}: ' + data.longitude.toFixed(4) + '</div>';
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
          
          // Отправляем запрос на получение данных
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
            
            if (data.type === 'SET_LAYER') {
              setWeatherLayer(data.layerType);
            } else if (data.type === 'SET_WEATHER_DATA') {
              displayWeatherData(data.weatherData);
            } else if (data.type === 'SET_CENTER') {
              const zoom = Math.min(Math.max(data.zoom || 10, 3), 18); // Ограничение зума
              map.setView([data.latitude, data.longitude], zoom);
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
                startInLoadingState={true}
            />
        );
    });

const styles = StyleSheet.create({
    webView: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapWebView;