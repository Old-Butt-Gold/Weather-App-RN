import React from 'react';
import { Image, View } from 'react-native';

export const AppBackground = () => (
    <View className="absolute top-0 left-0 right-0 bottom-0">
        <Image
            source={require('../assets/bg.png')} // поменяй путь при необходимости
            className="w-full h-full"
            resizeMode="cover"
            blurRadius={6} // если нужен блюр
        />
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/10" />
    </View>
);
