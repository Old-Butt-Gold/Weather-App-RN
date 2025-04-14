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
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from './components/ChatScreen';

SplashScreen.preventAutoHideAsync();

// Создаем навигатор Stack
const Stack = createStackNavigator();

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
                    <NavigationContainer>
                        <Stack.Navigator
                            screenOptions={{
                                headerShown: false,
                                cardStyle: { backgroundColor: 'transparent' },
                                cardOverlayEnabled: true,
                                cardStyleInterpolator: ({ current: { progress } }) => ({
                                    cardStyle: {
                                        opacity: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 1],
                                        }),
                                    },
                                    overlayStyle: {
                                        opacity: progress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 0.5],
                                            extrapolate: 'clamp',
                                        }),
                                    },
                                }),
                            }}
                        >
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen name="WeatherChat" component={ChatScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </SafeAreaView>
            </I18nextProvider>
        </Provider>
    );
}