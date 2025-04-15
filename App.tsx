import React, {useEffect, useState} from 'react';
import "./global.css";
import {ActivityIndicator, Platform, SafeAreaView, View} from 'react-native';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n/i18n';
import {HomeScreen} from "./screens/HomeScreen";
import {useCustomFonts} from "./utils/loads/fonts";
import * as SplashScreen from 'expo-splash-screen';
import {Provider} from "react-redux";
import {store} from "./store/store";
import {useAppDispatch} from "./store/hooks";
import {setCurrentCity, setLocation} from "./store/slices/weatherSlice";
import {fetchWeather} from "./store/actions/fetchWeather";
import * as Location from 'expo-location';
import {fetchMoonPhase} from "./store/actions/fetchMoonPhase";
import {fetchAirQuality} from "./store/actions/fetchAirQuality";

SplashScreen.preventAutoHideAsync();

const DEFAULT_COORDINATES = { latitude: 53.9, longitude: 27.56667 };

const Initializer = () => {
    const dispatch = useAppDispatch();
    const [initFinished, setInitFinished] = useState(false);

    useEffect(() => {
        async function initialize() {
            let coords;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.warn('Разрешение на доступ к геолокации не получено. Используем координаты по умолчанию.');
                    coords = DEFAULT_COORDINATES;
                } else {
                    const location = await Location.getCurrentPositionAsync({});
                    coords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                }
                console.log("Текущие координаты:", JSON.stringify(coords, null, 2));
                // Сохраняем координаты в Redux
                dispatch(setLocation(coords));

                // Пытаемся выполнить обратное геокодирование для получения названия города
                try {
                    const geocode = await Location.reverseGeocodeAsync(coords);
                    if (geocode?.[0]) {
                        const cityName = geocode[0].city || geocode[0].region || geocode[0].country;
                        console.log(cityName);
                        dispatch(setCurrentCity(cityName));
                    }
                } catch (geoError) {
                    console.error("Ошибка при обратном геокодировании:", geoError);
                }
                // Выполняем запрос данных о погоде по координатам
                await dispatch(fetchWeather()).unwrap();
                await dispatch(fetchMoonPhase()).unwrap().then(x => {
                    console.log(x);
                });
                await dispatch(fetchAirQuality()).unwrap().then(x => {
                    console.log(x);
                })
            } catch (error) {
                console.error("Ошибка при инициализации координат:", error);
                // Если произошла ошибка — задаём дефолтные координаты
                dispatch(setLocation(DEFAULT_COORDINATES));
                await dispatch(fetchWeather()).unwrap();
            } finally {
                setInitFinished(true);
            }
        }
        initialize();
    }, [dispatch]);

    // Пока данные не инициализированы, рендерим спиннер
    if (!initFinished) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    return <HomeScreen/>;
};

export default function App() {
    // Правильное использование хука для загрузки шрифтов
    const [fontsLoaded] = useCustomFonts();
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            setAppIsReady(true);
            await SplashScreen.hideAsync();
        }

        if (fontsLoaded) {
            prepare();
        }
    }, [fontsLoaded]);

    if (!appIsReady || !fontsLoaded) {
        return (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
            </View>);
    }

    return (<Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <SafeAreaView className="flex-1" style={{paddingTop: Platform.OS === 'ios' ? 0 : 0}}>
                    <Initializer />
                </SafeAreaView>
            </I18nextProvider>
        </Provider>);
}