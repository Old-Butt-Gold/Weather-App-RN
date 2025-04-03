import { StatusBar } from "expo-status-bar";
import {Text, View, Image, SafeAreaView, TouchableOpacity, ScrollView} from "react-native";
import "./global.css";
import {useEffect, useState} from "react";
import * as SplashScreen from 'expo-splash-screen';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import {useCustomFonts} from "./components/loads/fonts";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {ClockComponent} from "./assets/svg-icons/сomponents/ClockComponent";
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function App() {

    const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
    const [repeatCount, setRepeatCount] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [clickAnimation, setClickAnimation] = useState<{ source: any; repeats: number } | null>(null);
    const [temperature, setTemperature] = useState(5); // Измени число для теста



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

    useEffect(() => {
        // Пример входящих данных о времени
        const incomingTime = "2022-01-01T00:00"; // Замените на реальные данные
        setCurrentTime(new Date(incomingTime));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    if (!fontsLoaded) {
        return null; // Пока шрифты не загрузились, показывается Splash Screen
    }

    const isNightTime = currentTime.getHours() >= 0 && currentTime.getHours() < 6;

    const animations = [
        { source: require("./assets/svg-icons/animations/cloudSpeaks.json"), repeats: 3 },
        { source: require("./assets/svg-icons/animations/cloudyStatic.json"), repeats: 2 },
        { source: require("./assets/svg-icons/animations/cloudSpeaks.json"), repeats: 1 },
        { source: require("./assets/svg-icons/animations/cloudyStart.json"), repeats: 1 },
        { source: require("./assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 }
    ];

    const nightAnimation = { source: require("./assets/svg-icons/animations/sleepingCloudNew.json"), repeats: 1 };
    const clickAnimations = {
        day: { source: require("./assets/svg-icons/animations/welcomeCloudy.json"), repeats: 1 },
        night: { source: require("./assets/svg-icons/animations/angryCloud.json"), repeats: 1 }
    };
    const handleAnimationPress = () => {
        setClickAnimation(isNightTime ? clickAnimations.night : clickAnimations.day);
        setAnimationKey(prevKey => prevKey + 1);
    };
    return (
        <ScrollView className="flex-1 ">
        <View className="flex-1">
            <StatusBar style="light" />

            <Image
                blurRadius={10}
                source={require("./assets/bg.png")}
                className="absolute h-full w-full"
            />

            <SafeAreaView className="flex-1 justify-center items-center px-4 w-full relative">
                <View className="absolute top-20 px-10 py-1 rounded-[35px] flex-col items-center">
                    <Text className="font-manrope-extrabold text-2xl text-accent">Минск</Text>
                    <View className="w-20 h-2 bg-white/20 rounded-2xl"></View>
                </View>
                <View
                    className="absolute p-3 top-20 right-5  flex justify-center items-center overflow-hidden rounded-[15px] bg-white/20"
                    style={{
                        borderRadius: 15,
                        overflow: 'hidden',
                        elevation: 0,
                    }}
                >
                    <FontAwesome name="search" size={24} color="white" />
                </View>

                <View
                    className="absolute p-3 top-20 left-5 flex justify-center items-center overflow-hidden rounded-[15px] bg-white/20"
                    style={{
                        borderRadius: 15,
                        overflow: 'hidden',
                        elevation: 0,
                    }}
                >
                    <Ionicons name="settings" size={24} color="white" />
                </View>

                <LinearGradient
                    start={{ x: 0.5, y: 0.4 }} // Центр градиента
                    end={{ x: 1.0, y: 1.0 }} // Расширение градиента (создает радиальный эффект)
                    colors={[
                        'rgba(90, 139, 171, 0.2)', // #7FC3AE с прозрачностью 70%
                        'rgb(18,144,216)', // #7FC3AE с прозрачностью 30%
                    ]}
                    className="w-full flex flex-col items-center py-10 overflow-hidden relative rounded-[35px] mt-40"
                >
                    <BlurView
                        intensity={44} // Интенсивность размытия (от 0 до 100)
                        tint="light" // Цвет размытия: "light", "dark", "default"
                        className="absolute w-full h-[600px] z-0"
                    />

                    {/* Основной контент */}
                    <View className="absolute w-full h-[600px] bg-[rgba(90,139,171,0.1)]" />
                    <View className="absolute top-5 left-5">
                        <View className="flex flex-row items-center gap-1">
                            <Entypo name="calendar" size={20} color="white" />
                            <Text className=" text-primary font-manrope-semibold text-[14px]"> чт. 3 апр. 2025</Text>
                        </View>
                        <Text className="text-accent text-[20px] font-manrope-extrabold mt-6">Дождливо</Text>
                    </View>

                    <View className="flex-row w-full px-3 flex items-end mt-4 justify-between">
                        <View className="flex-row flex justify-center items-start h-[130px] pr-7 relative">
                            <Text className="font-poppins-medium text-primary text-[90px] text-center ">25</Text>
                            <Text className="text-primary font-poppins-bold text-[25px] mt-8 text-right">&deg;</Text>
                            <Text className="text-primary font-poppins-bold text-[25px] self-end mt-8 text-right">C</Text>

                        </View>
                        <View className="mt-5 border-black h-[130px]">
                            <TouchableOpacity onPress={handleAnimationPress} activeOpacity={1}>
                                <LottieView
                                    key={animationKey}
                                    source={
                                        clickAnimation
                                            ? clickAnimation.source
                                            : isNightTime
                                                ? nightAnimation.source
                                                : animations[currentAnimationIndex].source
                                    }
                                    autoPlay
                                    loop={false}
                                    style={{ width: 150, height: 150 }}
                                    onAnimationFinish={() => {
                                        if (clickAnimation) {
                                            setClickAnimation(null); // После кликовой анимации вернуть обычную
                                        } else if (isNightTime) {
                                            setAnimationKey(prevKey => prevKey + 1); // Перезапустить ночную анимацию
                                        } else {
                                            if (repeatCount < animations[currentAnimationIndex].repeats - 1) {
                                                setRepeatCount(repeatCount + 1);
                                                setAnimationKey(prevKey => prevKey + 1);
                                            } else {
                                                setRepeatCount(0);
                                                setCurrentAnimationIndex((prev) => (prev + 1) % animations.length);
                                                setAnimationKey(prevKey => prevKey + 1);
                                            }
                                        }
                                    }}

                                    colorFilters={[
                                        { keypath: "mouth", color: "#2B3F56" },  // Чёрный
                                        { keypath: "eye_r", color: "#2B3F56" },  // Чёрный
                                        { keypath: "eye_l", color: "#2B3F56" },  // Чёрный
                                        { keypath: "hand", color: "#FFFFFF" },  // Чёрный
                                        { keypath: "hand Container", color: "#FFFFFF" },  // Чёрный
                                        { keypath: "cloud", color: "#FFFFFF" },  // Белый

                                    ]}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="flex w-full px-4 z-1">
                        <View className="flex flex-row px-4 py-2 gap-3 bg-white/20 w-[120px] justify-center items-center rounded-[35px]">
                            <View className="flex-row flex justify-center items-center ">
                                <AntDesign name="arrowup" size={18} color="white" className=""/>
                                <Text className="font-poppins-medium text-accent text-[13px]">25&deg;</Text>
                            </View>
                            <View className="flex-row flex justify-center items-center ">
                                <AntDesign name="arrowdown" size={18} color="white" />
                                <Text className="font-poppins-medium text-accent  text-[13px]">9&deg;</Text>
                            </View>
                        </View>

                        <View className="flex mt-4 w-full flex-row justify-center flex-wrap gap-3">
                            <View className="flex py-2 px-4 flex-col bg-white/20 w-[48%] justify-center items-start rounded-[20px] relative">
                                <FontAwesome6 name="temperature-three-quarters" size={24} color="white" className="absolute top-2 right-3"/>
                                <View className="flex-row flex justify-center items-center h-[65px]">
                                    <Text className="font-manrope-semibold text-accent text-[36px] py-2">12</Text>
                                    <Text className="text-accent font-manrope-medium text-[28px]">&deg;</Text>
                                    <Text className="text-accent font-manrope-bold text-[15px] mt-[28px]">C</Text>
                                </View>
                                <Text className="font-manrope-medium text-white/60 text-[12px]">Ощущается как</Text>
                            </View>
                            <View className="flex py-2 px-4 flex-col bg-white/20 w-[48%] justify-center items-start rounded-[20px] relative">
                                <FontAwesome6 name="temperature-three-quarters" size={24} color="white" className="absolute top-2 right-3"/>
                                <View className="flex-row flex justify-center items-center h-[65px]">
                                    <Text className="font-manrope-semibold text-accent text-[36px] py-2">12</Text>
                                    <Text className="text-accent font-manrope-medium text-[28px]">&deg;</Text>
                                    <Text className="text-accent font-manrope-bold text-[15px] mt-[28px]">C</Text>
                                </View>
                                <Text className="font-manrope-medium text-white/60 text-[12px]">Ощущается как</Text>
                            </View><View className="flex py-2 px-4 flex-col bg-white/20 w-[48%] justify-center items-start rounded-[20px] relative">
                            <FontAwesome6 name="temperature-three-quarters" size={24} color="white" className="absolute top-2 right-3"/>
                            <View className="flex-row flex justify-center items-center h-[65px]">
                                <Text className="font-manrope-medium text-accent text-[36px] py-2">12</Text>
                                <Text className="text-accent font-manrope-medium text-[28px]">&deg;</Text>
                                <Text className="text-accent font-manrope-bold text-[15px] mt-[28px]">C</Text>
                            </View>
                            <Text className="font-manrope-medium text-white/60 text-[12px]">Ощущается как</Text>
                        </View>
                            <View className="flex py-2 px-4 flex-col bg-white/20 w-[48%] justify-center items-start rounded-[20px] relative">
                            <FontAwesome6 name="temperature-three-quarters" size={24} color="white" className="absolute top-2 right-3"/>
                            <View className="flex-row flex justify-center items-center h-[65px]">
                                <Text className="font-manrope-medium text-accent text-[36px] py-2">12</Text>
                                <Text className="text-accent font-manrope-medium text-[28px]">&deg;</Text>
                                <Text className="text-accent font-manrope-bold text-[15px] mt-[28px]">C</Text>
                            </View>
                            <Text className="font-manrope-medium text-white/60 text-[12px]">Ощущается как</Text>
                        </View>
                        </View>
                    </View>


                </LinearGradient>
                <ClockComponent />
            </SafeAreaView>
        </View>
        </ScrollView>
    );
}
