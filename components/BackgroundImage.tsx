import {Image, View} from "react-native";
import React from "react";

export const BackgroundImage = () => (
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