import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { t } from 'i18next';

// Компонент для фонового изображения
const BackgroundImage = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0">
        <Image
            source={require("../assets/bg.png")}
            style={{ flex: 1, width: '100%', height: '100%' }}
            blurRadius={6}
            resizeMode="cover"
        />
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/10" />
    </View>
);

// Компонент размытого фона
const BlurBackground = () => (
    <BlurView
        intensity={44}
        tint="light"
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 25,
            overflow: 'hidden',
            zIndex: 0,
        }}
    />
);

// Компонент для предлагаемых вопросов
const SuggestedQuestion = ({ 
    icon, 
    question, 
    onPress 
}: { 
    icon: React.ReactNode, 
    question: string, 
    onPress: () => void 
}) => (
    <TouchableOpacity 
        onPress={onPress}
        className="flex-row items-center bg-white/20 rounded-[15] p-4 mb-3"
    >
        <View className="bg-white/30 rounded-full p-2 mr-3">
            {icon}
        </View>
        <Text className="flex-1 font-manrope-semibold text-accent text-[14px]">
            {question}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="white" />
    </TouchableOpacity>
);

type ChatScreenProps = {
    navigation: any; 
};

export const ChatScreen = ({ navigation }: ChatScreenProps) => {
    // Функция для обработки нажатия на предлагаемый вопрос
    const handleQuestionPress = (question: string) => {
        // Здесь будет логика обработки выбранного вопроса
        console.log('Selected question:', question);
        // В будущем можно добавить логику отправки вопроса в чат
    };

    return (
        <>
            <StatusBar style="light" />
            <BackgroundImage />
            
            <SafeAreaView className="flex-1">
                <View className="flex-1">
                    {/* Header с кнопкой назад */}
                    <View className="flex-row items-center mb-6 mt-10 px-4 pt-10">
                        <TouchableOpacity 
                            onPress={() => navigation.goBack()} 
                            className="p-3 rounded-[15] bg-white/20 mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="font-manrope-extrabold text-2xl text-accent">
                            {t('chat.title')}
                        </Text>
                    </View>
                    
                    {/* Основной контент */}
                    <View className="flex-1 px-4">
                        {/* Контейнер чата */}
                        <View className="flex-1 rounded-[25] overflow-hidden relative mb-4">
                            <BlurBackground />
                            <ScrollView className="p-4">
                                <View className="flex-1 justify-center items-center min-h-[200]">
                                    <Text className="text-accent font-manrope-medium text-lg text-center">
                                        {t('chat.emptyStateMessage')}
                                    </Text>
                                </View>
                            </ScrollView>
                        </View>
                        
                        {/* Раздел предлагаемых вопросов */}
                        <View className="mb-6">
                            <Text className="font-manrope-bold text-accent text-[16px] mb-3 px-1">
                                {t('chat.suggestedQuestions')}
                            </Text>
                            
                            <SuggestedQuestion 
                                icon={<MaterialCommunityIcons name="hanger" size={22} color="white" />}
                                question={t('chat.questions.whatToWear')}
                                onPress={() => handleQuestionPress(t('chat.questions.whatToWear'))}
                            />
                            
                            <SuggestedQuestion 
                                icon={<Ionicons name="musical-notes" size={22} color="white" />}
                                question={t('chat.questions.suggestMusic')}
                                onPress={() => handleQuestionPress(t('chat.questions.suggestMusic'))}
                            />
                            
                            <SuggestedQuestion 
                                icon={<Feather name="info" size={22} color="white" />}
                                question={t('chat.questions.interestingFact')}
                                onPress={() => handleQuestionPress(t('chat.questions.interestingFact'))}
                            />
                            
                            <SuggestedQuestion 
                                icon={<FontAwesome5 name="running" size={22} color="white" />}
                                question={t('chat.questions.outdoorActivities')}
                                onPress={() => handleQuestionPress(t('chat.questions.outdoorActivities'))}
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
};