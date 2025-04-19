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
import {fetchWeather} from "./store/actions/fetchWeather";
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ChatScreen} from "./screens/ChatScreen";
import { SettingsScreen } from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

import {fetchMoonPhase} from "./store/actions/fetchMoonPhase";
import {fetchAirQuality} from "./store/actions/fetchAirQuality";
import {fetchLocationByIP} from "./store/actions/fetchLocationByIp";
import {setLanguage} from "./store/slices/appSettingsSlice";
import SearchScreen from "./screens/SearchScreen";

SplashScreen.preventAutoHideAsync();

const Initializer = () => {
    const dispatch = useAppDispatch();
    const [initFinished, setInitFinished] = useState(false);

    useEffect(() => {
        async function initialize() {
            try {
                dispatch(setLanguage('ru'));

                await dispatch(fetchLocationByIP(i18n.language));

                await Promise.all([
                    dispatch(fetchWeather()),
                    dispatch(fetchMoonPhase()),
                    dispatch(fetchAirQuality())
                ]);
            } catch (error) {
                console.error("Ошибка при инициализации координат:", error);
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
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
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
                <View className="flex-1"> {/* Больше не SafeAreaView */}
                    <Initializer />
                </View>
            </I18nextProvider>
        </Provider>
    );
}