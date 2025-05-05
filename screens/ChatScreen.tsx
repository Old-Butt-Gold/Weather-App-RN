import React, { useRef } from 'react';
import {View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {Ionicons, MaterialCommunityIcons, Feather, FontAwesome5} from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { t } from 'i18next';
import {addMessage, sendQuestion} from '../store/slices/chatSlice';
import { ChatMessage } from '../api/openai';
import {useAppDispatch, useAppSelector} from "../store/hooks";
import BackgroundImage from "../components/BackgroundImage";


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

const SuggestedQuestion = ({
  icon, 
  question,
  questionType,
  onPress 
}: { 
  icon: React.ReactNode, 
  question: string,
  questionType: string,
  onPress: (type: string, text: string) => void 
}) => (
  <TouchableOpacity 
    onPress={() => onPress(questionType, question)}
    className="flex-row items-center bg-white/20 rounded-[12] p-3 mb-2"
  >
    <View className="bg-white/30 rounded-full p-1.5 mr-2">
      {icon}
    </View>
    <Text className="flex-1 font-manrope-semibold text-accent text-[13px]">
      {question}
    </Text>
    <Ionicons name="chevron-forward" size={18} color="white" />
  </TouchableOpacity>
);

// Компонент сообщения чата
const ChatMessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  
  return (
    <View className={`mb-4 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}>
      <View 
        className={`p-3 rounded-[15] ${isUser ? 'bg-white/30' : 'bg-white/20'}`}
      >
        <Text className="font-manrope-medium text-accent text-[14px]">
          {message.content}
        </Text>
      </View>
    </View>
  );
};

type ChatScreenProps = {
  navigation: any; 
};

export const ChatScreen = ({ navigation }: ChatScreenProps) => {
  const dispatch = useAppDispatch();
  const { messages, isLoading, error } = useAppSelector(state => state.chat);

  const weatherState = useAppSelector(state => state.weather);

  const appSettings = useAppSelector(state => state.appSettings);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const handleQuestionPress = (questionType: string, questionText: string) => {
    const chatMessage : ChatMessage = {
      role: 'user',
      content: questionText,
    }

    dispatch(addMessage(chatMessage));
    
    dispatch(sendQuestion({
      questionType,
      questionText,
      weatherState,
      appSettings
    }));
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  React.useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  return (
    <>
      <StatusBar style="light" />
      <BackgroundImage
          blurRadius={5}
          overlayColor="rgba(25, 50, 75, 0.2)"
          isPage={true}
      />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          <View className="flex-row items-center mb-4 mt-10 px-4 pt-10">
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
          
          <View className="flex-1 px-4">
            <View className="flex-1 rounded-[25] overflow-hidden relative mb-3">
              <BlurBackground />
              
              <ScrollView 
                ref={scrollViewRef}
                className="p-4 mb-2"
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {messages.map((message, index) => (
                    <ChatMessageBubble key={index} message={message} />
                ))}

                {isLoading && (
                    <View className={`p-3 rounded-[15] bg-white/20 mb-4 ${
                        messages.length === 0 ? 'self-center mt-20' : 'self-start'
                    }`}>
                      <ActivityIndicator color="white" size="small" />
                    </View>
                )}

                {messages.length === 0 && !isLoading && (
                    <View className="flex-1 justify-center items-center mt-20">
                      <Text className="text-accent font-manrope-medium text-lg text-center">
                        {t('chat.emptyStateMessage')}
                      </Text>
                    </View>
                )}
              </ScrollView>
            </View>
            
            <View className="mb-4">
              <Text className="font-manrope-bold text-accent text-[15px] mb-2 px-1">
                {t('chat.suggestedQuestions')}
              </Text>
              
              <View className="space-y-1.5">
                <SuggestedQuestion 
                  icon={<MaterialCommunityIcons name="hanger" size={20} color="white" />}
                  question={t('chat.questions.whatToWear')}
                  questionType="whatToWear"
                  onPress={handleQuestionPress}
                />
                
                <SuggestedQuestion 
                  icon={<Ionicons name="musical-notes" size={20} color="white" />}
                  question={t('chat.questions.suggestMusic')}
                  questionType="suggestMusic"
                  onPress={handleQuestionPress}
                />
                
                <SuggestedQuestion 
                  icon={<Feather name="info" size={20} color="white" />}
                  question={t('chat.questions.interestingFact')}
                  questionType="interestingFact"
                  onPress={handleQuestionPress}
                />
                
                <SuggestedQuestion 
                  icon={<FontAwesome5 name="running" size={20} color="white" />}
                  question={t('chat.questions.outdoorActivities')}
                  questionType="outdoorActivities"
                  onPress={handleQuestionPress}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};