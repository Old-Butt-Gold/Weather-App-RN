import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from './store';

import { HomeScreen } from './screens/HomeScreen';
import ChatScreen from './components/ChatScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Provider store={store}>
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
    </Provider>
  );
};

export default AppNavigator;