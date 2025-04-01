import { StatusBar } from "expo-status-bar";
import { Text, View, Image, SafeAreaView } from "react-native";
import "./global.css";
import {useFonts} from "expo-font";
import {useEffect} from "react";
import * as SplashScreen from 'expo-splash-screen';
import RainyIcon from "./assets/svg-icons/сomponents/RainyIcon";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
export default function App() {
    const [fontsLoaded] = useFonts({
        "Poppins-Black": require("./assets/fonts/Poppins/Poppins-Black.ttf"),
        "Poppins-BlackItalic": require("./assets/fonts/Poppins/Poppins-BlackItalic.ttf"),
        "Poppins-Bold": require("./assets/fonts/Poppins/Poppins-Bold.ttf"),
        "Poppins-BoldItalic": require("./assets/fonts/Poppins/Poppins-BoldItalic.ttf"),
        "Poppins-ExtraBold": require("./assets/fonts/Poppins/Poppins-ExtraBold.ttf"),
        "Poppins-ExtraBoldItalic": require("./assets/fonts/Poppins/Poppins-ExtraBoldItalic.ttf"),
        "Poppins-ExtraLight": require("./assets/fonts/Poppins/Poppins-ExtraLight.ttf"),
        "Poppins-ExtraLightItalic": require("./assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf"),
        "Poppins-Italic": require("./assets/fonts/Poppins/Poppins-Italic.ttf"),
        "Poppins-Light": require("./assets/fonts/Poppins/Poppins-Light.ttf"),
        "Poppins-LightItalic": require("./assets/fonts/Poppins/Poppins-LightItalic.ttf"),
        "Poppins-Medium": require("./assets/fonts/Poppins/Poppins-Medium.ttf"),
        "Poppins-MediumItalic": require("./assets/fonts/Poppins/Poppins-MediumItalic.ttf"),
        "Poppins-Regular": require("./assets/fonts/Poppins/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("./assets/fonts/Poppins/Poppins-SemiBold.ttf"),
        "Poppins-SemiBoldItalic": require("./assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf"),
        "Poppins-Thin": require("./assets/fonts/Poppins/Poppins-Thin.ttf"),
        "Poppins-ThinItalic": require("./assets/fonts/Poppins/Poppins-ThinItalic.ttf"),

        "Manrope-Bold": require("./assets/fonts/Manrope/Manrope-Bold.ttf"),
        "Manrope-ExtraBold": require("./assets/fonts/Manrope/Manrope-ExtraBold.ttf"),
        "Manrope-ExtraLight": require("./assets/fonts/Manrope/Manrope-ExtraLight.ttf"),
        "Manrope-Light": require("./assets/fonts/Manrope/Manrope-Light.ttf"),
        "Manrope-Medium": require("./assets/fonts/Manrope/Manrope-Medium.ttf"),
        "Manrope-Regular": require("./assets/fonts/Manrope/Manrope-Regular.ttf"),
        "Manrope-SemiBold": require("./assets/fonts/Manrope/Manrope-SemiBold.ttf"),
    });

    useEffect(() => {
        const hideSplash = async () => {
            if (fontsLoaded) {
                await SplashScreen.hideAsync();
                console.log("Splash loaded");
            }
        };
        hideSplash();

    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null; // Пока шрифты не загрузились, показывается Splash Screen
    }

    return (
        <View className="flex-1 relative">
            <StatusBar style="light" />

            {/* Фоновое изображение */}
            <Image
                blurRadius={10}
                source={require("./assets/bg.png")}
                className="absolute h-full w-full"
            />

            {/* SafeAreaView, чтобы контент не залезал под статус-бар */}
            <SafeAreaView className="flex-1 justify-center items-center px-4">

                <LinearGradient
                    // Радиальный градиент
                    start={{ x: 0.5, y: 0.1 }} // Центр градиента
                    end={{ x: 1.0, y: 1.0 }} // Расширение градиента (создает радиальный эффект)
                    colors={[
                        'rgba(90, 139, 171, 0.2)', // #7FC3AE с прозрачностью 70%
                        'rgb(150,172,186)', // #7FC3AE с прозрачностью 30%
                    ]}
                    className="w-full flex flex-col items-center py-10 overflow-hidden relative rounded-[35px]"
                >
                    <BlurView
                        intensity={10} // Интенсивность размытия (от 0 до 100)
                        tint="default" // Цвет размытия: "light", "dark", "default"
                        className="absolute w-full h-[450px]"
                    />

                    {/* Основной контент */}
                    <View className="absolute w-full h-[500px] bg-[rgba(90,139,171,0.1)]" />
                    <Text className="text-primary font-manrope-semibold text-[20px]">Сегодня</Text>
                    <View className="w-full flex flex-row justify-center h-[140px] items-center relative">
                        <View className="top-[10px]">
                            <RainyIcon height={90} width={90} fill={"#f7fcff"} />
                        </View>
                        <Text className="font-poppins-medium text-primary text-[95px] ml-[15px]">25</Text>
                        <Text className="text-primary text-[70px] bottom-[20px]">&deg;</Text>
                    </View>
                    <Text className="text-primary text-[20px] font-manrope-semibold mt-[20px]">Дождливо</Text>
                    <View className="w-full flex flex-col justify-center items-center gap-[12px] mt-[20px]">
                        <Text className="text-[14px] font-manrope-medium text-primary text-center">California, Los Angeles</Text>
                        <Text className="text-[14px] font-manrope-medium text-primary text-center">21 Oct 2019</Text>
                        <View className="w-full flex flex-row justify-center gap-[10px]">
                            <Text className="text-[14px] font-manrope-medium text-primary text-center">Feels like 8</Text>
                            <Text className="text-[14px] font-manrope-medium text-primary text-center">|</Text>
                            <Text className="text-[14px] font-manrope-medium text-primary text-center">Sunset 18:20</Text>
                        </View>
                    </View>
                </LinearGradient>

            </SafeAreaView>
        </View>
    );
}
