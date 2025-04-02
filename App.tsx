import { StatusBar } from "expo-status-bar";
import { Text, View, Image, SafeAreaView, TouchableOpacity } from "react-native";
import "./global.css";
import {useEffect, useState} from "react";
import * as SplashScreen from 'expo-splash-screen';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import {useCustomFonts} from "./components/loads/fonts";
export default function App() {

    const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
    const [repeatCount, setRepeatCount] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);
    const [isInterrupted, setIsInterrupted] = useState(false);

    const handleAnimationPress = () => {
        setIsInterrupted(true);
        setCurrentAnimationIndex(animations.length - 1); // welcomeCloudy.json
        setRepeatCount(0);
        setAnimationKey(prevKey => prevKey + 1);
    };

    const [fontsLoaded] = useCustomFonts();

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


    const animations = [
        { source: require("./assets/svg-icons/animations/cloudSpeaks.json"), repeats: 1 },
        { source: require("./assets/svg-icons/animations/cloudyStatic.json"), repeats: 2 },
        { source: require("./assets/svg-icons/animations/cloudSpeaks.json"), repeats: 1 },
        { source: require("./assets/svg-icons/animations/cloudyStart.json"), repeats: 1 },
        { source: require("./assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 }
    ];

    return (
        <View className="flex-1 relative flex justify-center items-center">
            <StatusBar style="light" />

            <Image
                blurRadius={10}
                source={require("./assets/bg.png")}
                className="absolute h-full w-full"
            />

            <SafeAreaView className="flex-1 justify-center items-center px-4 w-full relative">
                <View className="absolute top-20 px-10 py-1 rounded-[35px]">
                    <Text className="font-manrope-extrabold text-2xl text-accent">Минск, Беларусь</Text>
                </View>
                <LinearGradient
                    start={{ x: 0.5, y: 0.4 }} // Центр градиента
                    end={{ x: 1.0, y: 1.0 }} // Расширение градиента (создает радиальный эффект)
                    colors={[
                        'rgba(90, 139, 171, 0.2)', // #7FC3AE с прозрачностью 70%
                        'rgb(150,172,186)', // #7FC3AE с прозрачностью 30%
                    ]}
                    className="w-full flex flex-col items-center py-10 overflow-hidden relative rounded-[35px]"
                >
                    <BlurView
                        intensity={34} // Интенсивность размытия (от 0 до 100)
                        tint="light" // Цвет размытия: "light", "dark", "default"
                        className="absolute w-full h-[600px]"
                    />

                    {/* Основной контент */}
                    <View className="absolute w-full h-[600px] bg-[rgba(90,139,171,0.1)]" />
                    <View className="bottom-[40px] left-[10px] border-black h-[130px]">
                        <TouchableOpacity onPress={handleAnimationPress} activeOpacity={1}>
                            <LottieView
                                key={animationKey}
                                source={animations[currentAnimationIndex].source}
                                autoPlay
                                loop={false}
                                style={{ width: 200, height: 200 }}
                                onAnimationFinish={() => {
                                    if (repeatCount < animations[currentAnimationIndex].repeats - 1) {
                                        setRepeatCount(repeatCount + 1);
                                        setAnimationKey(prevKey => prevKey + 1);
                                    } else {
                                        setRepeatCount(0);
                                        if (isInterrupted) {
                                            setIsInterrupted(false);
                                            setCurrentAnimationIndex(0); // Начинаем с cloudSpeaks.json
                                        } else {
                                            setCurrentAnimationIndex((prev) => (prev + 1) % animations.length);
                                        }
                                        setAnimationKey(prevKey => prevKey + 1);
                                    }
                                }}
                                colorFilters={[
                                    { keypath: "mouth", color: "#000000" },  // Чёрный
                                    { keypath: "eye_r", color: "#000000" },  // Чёрный
                                    { keypath: "eye_l", color: "#000000" },  // Чёрный
                                    { keypath: "hand", color: "#FFFFFF" },  // Чёрный
                                    { keypath: "hand Container", color: "#FFFFFF" },  // Чёрный
                                    { keypath: "cloud", color: "#FFFFFF" },  // Белый

                                ]}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-primary font-manrope-semibold text-[20px]">Сегодня</Text>
                    <View className="w-full flex flex-col justify-center items-center relative">
                        <View className="flex-row flex justify-center items-center h-[130px]">
                            <Text className="font-poppins-medium text-primary text-[95px] ml-[25px]">25</Text>
                            <Text className="text-primary font-poppins-bold text-[40px] bottom-[20px]">&#8451;</Text>
                        </View>
                    </View>
                    <Text className="text-primary text-[20px] font-manrope-semibold ">Дождливо</Text>
                    <View className="w-full flex flex-col justify-center items-center gap-[12px] mt-[20px]">
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
