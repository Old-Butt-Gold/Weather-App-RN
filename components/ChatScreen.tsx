import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  ListRenderItemInfo,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, resetMessages } from '../store/slices/chatSlice';
import TypingIndicator from './TypingIndicator';
import { RootState } from '../store/store';
import { StackNavigationProp } from '@react-navigation/stack';

// Типы для навигации
type RootStackParamList = {
  Home: undefined;
  WeatherChat: undefined;
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WeatherChat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
}

// Интерфейс для сообщения
interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  isError?: boolean;
}

// Предустановленные вопросы о погоде
const weatherQuestions = [
  'Какая погода сегодня?',
  'Будет ли дождь завтра?',
  'Какая температура ожидается на выходных?',
  'Прогноз погоды на неделю',
  'Ожидаются ли штормовые предупреждения?',
];

// Компонент фонового изображения
const BackgroundImage: React.FC = () => (
  <View style={StyleSheet.absoluteFill}>
    <Image
      source={require("../assets/bg.png")}
      style={{ flex: 1, width: '100%', height: '100%' }}
      blurRadius={6}
      resizeMode="cover"
    />
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
  </View>
);

// Компонент размытого фона для карточек
const BlurBackground: React.FC = () => (
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

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state: RootState) => state.chat);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Анимационные значения для сообщений
  const [messageAnimations] = useState<{[key: string]: Animated.Value}>({});
  
  useEffect(() => {
    // Сброс чата при загрузке компонента
    dispatch(resetMessages());
  }, [dispatch]);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Обработчик нажатия на предустановленный вопрос
  const handleQuestionPress = (question: string) => {
    dispatch(sendMessage(question));
  };
  
  // Получаем анимацию для сообщения
  const getMessageAnimation = (messageId: string): Animated.Value => {
    if (!messageAnimations[messageId]) {
      messageAnimations[messageId] = new Animated.Value(0);
      
      // Запуск анимации появления
      Animated.timing(messageAnimations[messageId], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    
    return messageAnimations[messageId];
  };

  // Рендер каждого сообщения
  const renderMessage = ({ item, index }: ListRenderItemInfo<Message>) => {
    const isUserMessage = item.sender === 'user';
    const messageId = `message-${index}`;
    const animation = getMessageAnimation(messageId);
    
    // Анимации для сообщений
    const animatedStyle = {
      opacity: animation,
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };
    
    return (
      <Animated.View style={[
        styles.messageContainer,
        isUserMessage ? styles.userMessageContainer : styles.botMessageContainer,
        animatedStyle
      ]}>
        <View style={[
          styles.messageBubble,
          isUserMessage ? styles.userMessageBubble : styles.botMessageBubble,
          item.isError && styles.errorMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUserMessage ? styles.userMessageText : styles.botMessageText,
            item.isError && styles.errorMessageText
          ]}>
            {item.text}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <BackgroundImage />
      
      {/* Верхняя панель с кнопкой возврата */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Чат с облачком</Text>
        <View style={{width: 40}} /> {/* Пустое место для симметрии */}
      </View>

      <View style={styles.chatContainer}>
        {/* Область сообщений */}
        <View style={styles.messagesWrapper}>
          <BlurBackground />
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => `message-${index}`}
            contentContainerStyle={styles.messagesContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <FontAwesome6 name="cloud-sun" size={50} color="white" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>Спроси меня о погоде!</Text>
              </View>
            )}
          />

          {/* Индикатор печатания */}
          {loading && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <TypingIndicator />
              </View>
            </View>
          )}
        </View>

        {/* Панель с предустановленными вопросами */}
        <View style={styles.questionPanelContainer}>
          <BlurBackground />
          <View style={styles.questionPanel}>
            <FlatList
              data={weatherQuestions}
              horizontal={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.questionButton}
                  onPress={() => handleQuestionPress(item)}
                  disabled={loading}
                >
                  <FontAwesome6 name="cloud" size={16} color="#007AFF" style={styles.questionIcon} />
                  <Text style={styles.questionButtonText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `question-${index}`}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 16,
  },
  messagesWrapper: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 16,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    width: width - 64, // Учитываем отступы
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  userMessageBubble: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomLeftRadius: 4,
  },
  errorMessageBubble: {
    backgroundColor: 'rgba(255, 229, 229, 0.8)',
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#000000',
  },
  errorMessageText: {
    color: '#D32F2F',
  },
  typingContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  typingBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  questionPanelContainer: {
    marginBottom: 16,
    borderRadius: 25,
    overflow: 'hidden',
  },
  questionPanel: {
    padding: 16,
  },
  questionButton: {
    backgroundColor: 'rgba(242, 247, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(223, 236, 255, 0.3)',
    elevation: 1,
    shadowColor: '#8EB3FF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  questionIcon: {
    marginRight: 10,
  },
  questionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ChatScreen;