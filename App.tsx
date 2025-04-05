import { StatusBar } from "expo-status-bar";
import { Text, View, Image, SafeAreaView, TouchableOpacity, ScrollView, Platform } from "react-native";
import "./global.css";
import React, { useEffect, useState } from "react";
import * as SplashScreen from 'expo-splash-screen';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useCustomFonts } from "./components/loads/fonts";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ClockComponent } from "./components/ClockComponent";
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function App() {
    const [currentAnimationIndex, setCurrentAnimationIndex] = useState(0);
    const [repeatCount, setRepeatCount] = useState(0);
    const [animationKey, setAnimationKey] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [clickAnimation, setClickAnimation] = useState<{ source: any; repeats: number } | null>(null);
    const [temperature, setTemperature] = useState(5);

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
        const incomingTime = "2022-01-01T12:00";
        setCurrentTime(new Date(incomingTime));
    }, []);

    if (!fontsLoaded) {
        return null;
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
        <SafeAreaView className="flex-1 " style={{ paddingTop: Platform.OS === 'ios' ? 0 : 0 }}>
            <StatusBar style="light" />
            <Image
                blurRadius={4}
                source={require("./assets/bg.png")}
                className="absolute h-full w-full"
            />
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                <View className="flex-1 justify-center items-center px-4 w-full relative pb-5">
                    {/* Header */}
                    <View className="w-full flex-row justify-between items-center mt-4 px-4 pt-10">
                        <View className="p-3 rounded-[15] bg-white/20">
                            <Ionicons name="settings" size={24} color="white" />
                        </View>
                        <View className="flex-col items-center">
                            <Text className="font-manrope-extrabold text-2xl text-accent">Минск</Text>
                            <View className="w-20 h-2 bg-white/20 rounded-2xl"></View>
                        </View>
                        <View className="p-3 rounded-[15] bg-white/20">
                            <FontAwesome name="search" size={24} color="white" />
                        </View>
                    </View>

                    {/* Main Content */}
                    <LinearGradient
                        colors={['rgba(90, 139, 171, 0.2)', 'rgb(18,144,216)']}
                        className="w-full mt-6 p-6 relative overflow-hidden rounded-[35]"
                    >
                        <BlurView
                            intensity={44}
                            tint="light"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: 35, // Совпадает с rounded-[35]
                                overflow: 'hidden', // Обрезает содержимое по границам
                                zIndex: 0,
                            }}
                        />
                        <View className="w-full z-10">
                            {/* Date and Weather Info */}
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <View className="flex-row items-center gap-1">
                                        <Entypo name="calendar" size={20} color="white" />
                                        <Text className="text-primary font-manrope-semibold text-[14px]"> чт. 3 апр. 2025</Text>
                                    </View>
                                </View>
                                <TouchableOpacity className="p-2 rounded-[15] bg-white/20">
                                    <Ionicons name="reload-circle-sharp" size={24} color="white" />
                                </TouchableOpacity>
                            </View>

                            {/* Temperature and Animation */}
                            <View className="flex-row justify-between mt-4 border-2">
                                <View className="flex-row items-start border-2">
                                    <View className="flex-col flex border-2 border-accent">
                                        <Text className="text-accent text-[20px] font-manrope-extrabold">Дождливо</Text>
                                        <Text className="font-poppins-medium text-primary text-[90px] border-2 h-[90] leading-[100px]">25</Text>
                                        <View className="flex-row justify-center mt-2">
                                            <View className="flex-row px-4 py-2 gap-3 bg-white/20 rounded-[35]">
                                                <View className="flex-row items-center">
                                                    <AntDesign name="arrowup" size={18} color="white" />
                                                    <Text className="font-poppins-medium text-accent text-[13px] ml-1">25&deg;</Text>
                                                </View>
                                                <View className="flex-row items-center">
                                                    <AntDesign name="arrowdown" size={18} color="white" />
                                                    <Text className="font-poppins-medium text-accent text-[13px] ml-1">9&deg;</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <Text className="text-primary font-poppins-bold text-[25px] mt-8">&deg;C</Text>

                                </View>

                                <TouchableOpacity onPress={handleAnimationPress} activeOpacity={1}  className='border-2'>
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
                                        style={{ width: 170, height: 170 }}
                                        onAnimationFinish={() => {
                                            if (clickAnimation) {
                                                setClickAnimation(null);
                                            } else if (isNightTime) {
                                                setAnimationKey(prevKey => prevKey + 1);
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
                                            { keypath: "mouth", color: "#2B3F56" },
                                            { keypath: "eye_r", color: "#2B3F56" },
                                            { keypath: "eye_l", color: "#2B3F56" },
                                            { keypath: "hand", color: "#FFFFFF" },
                                            { keypath: "hand Container", color: "#FFFFFF" },
                                            { keypath: "cloud", color: "#FFFFFF" },
                                        ]}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Weather Details */}
                            <View className="flex-row flex-wrap justify-between mt-6 gap-3">
                                {[
                                    { icon: <FontAwesome6 name="temperature-three-quarters" size={24} color="white" />, value: "12", unit: "°C", label: "Ощущается как" },
                                    { icon: <FontAwesome6 name="wind" size={24} color="white" />, value: "5", unit: "м/c", label: "Скорость ветра" },
                                    { icon: <Ionicons name="rainy-sharp" size={24} color="white" />, value: "68", unit: "%", label: "Вероятность дождя" },
                                    { icon: <MaterialIcons name="water-drop" size={24} color="white" />, value: "4", unit: "%", label: "Влажность" }
                                ].map((item, index) => (
                                    <View key={index} className="w-[48%] bg-white/20 rounded-[20px] px-5 py-4">
                                        <View className="absolute top-2 right-3">{item.icon}</View>
                                        <View className="flex-row items-end h-[50px]">
                                            <Text className="font-manrope-bold text-accent text-[36px]">{item.value}</Text>
                                            <Text className="text-accent font-manrope-bold text-[15px] mb-1 ml-1">{item.unit}</Text>
                                        </View>
                                        <Text className="font-manrope-medium text-white/60 text-[12px]">{item.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Clock Component */}
                    <ClockComponent />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}