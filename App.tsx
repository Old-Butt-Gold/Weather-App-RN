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
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ChatScreen} from "./components/ChatScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

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
                    coords = DEFAULT_COORDINATES;
                } else {
                    const location = await Location.getCurrentPositionAsync();
                    coords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    }
                }

                console.log(coords);
                dispatch(setLocation(coords));

                const geocode = await Location.reverseGeocodeAsync(coords);
                if (geocode?.[0]) {
                    const cityName = geocode[0].city || geocode[0].region || geocode[0].country;
                    console.log(cityName);
                    dispatch(setCurrentCity(cityName));
                }

                await dispatch(fetchWeather()).unwrap();
                await dispatch(fetchMoonPhase()).unwrap();
                await dispatch(fetchAirQuality()).unwrap();
            } catch (error) {
                console.error("Ошибка при инициализации координат:", error);
                dispatch(setLocation(DEFAULT_COORDINATES));
                await dispatch(fetchWeather()).unwrap();
            } finally {
                setInitFinished(true);
            }
        }
        initialize();
    }, [dispatch]);

    if (!initFinished) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Chat" component={ChatScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
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
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    return (
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <SafeAreaView className="flex-1" style={{paddingTop: Platform.OS === 'ios' ? 0 : 0}}>
                    <Initializer />
                </SafeAreaView>
            </I18nextProvider>
        </Provider>
    );
}