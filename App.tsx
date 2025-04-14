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
import {setLocation} from "./store/slices/weatherSlice";
import {fetchWeather} from "./store/actions/fetchWeather";
import * as Location from 'expo-location';

SplashScreen.preventAutoHideAsync();

const Initializer = () => {
    const dispatch = useAppDispatch();
    const [initFinished, setInitFinished] = useState(false);

    const DEFAULT_COORDINATES = {
        latitude: 53.9,
        longitude: 27.56667,
    };

    useEffect(() => {
        async function initialize() {
            let coords;
            try {
                const {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.warn('Permission to access location was denied. Используем координаты по умолчанию.');
                    coords = DEFAULT_COORDINATES;
                } else {
                    const location = await Location.getCurrentPositionAsync({});
                    coords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                }
                console.log("Текущие координаты:", JSON.stringify(coords, null, 2));
                // Устанавливаем координаты в Redux
                dispatch(setLocation(coords));
                // Запускаем получение данных о погоде по координатам
                await dispatch(fetchWeather()).unwrap();
            } catch (error) {
                console.error("Ошибка при инициализации координат:", error);
            } finally {
                setInitFinished(true);
            }
        }
        initialize();
    }, [dispatch]);

    return null;
}

export default function App() {
    // Правильное использование хука для загрузки шрифтов
    const [fontsLoaded, fontError] = useCustomFonts();
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Дополнительные асинхронные операции при запуске
                await new Promise(resolve => setTimeout(resolve, 100)); // Пример задержки
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
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
                    <HomeScreen/>
                </SafeAreaView>
            </I18nextProvider>
        </Provider>);
}