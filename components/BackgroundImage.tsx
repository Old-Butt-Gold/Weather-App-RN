import React from 'react';
import { View, Image, StyleProp, ImageStyle, ViewStyle } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { getWeatherCodeForHour } from '../store/utils/weatherUtils';
import bgImages from "../utils/bgConverter";

type BackgroundImageProps = {
    blurRadius?: number;
    overlayColor?: string;
    imageStyle?: StyleProp<ImageStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};

const BackgroundImage: React.FC<BackgroundImageProps> = ({
                                                             blurRadius = 6,
                                                             overlayColor = 'rgba(0, 0, 0, 0.1)',
                                                             imageStyle,
                                                             containerStyle,
                                                             resizeMode = 'cover',
                                                         }) => {
    const weatherState = useAppSelector(x => x.weather);
    const weatherCode = getWeatherCodeForHour(weatherState, 0);

    // По умолчанию — просто обычный фон
    const source = bgImages[weatherCode] ?? require('../assets/1.png');
    return (
        <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, containerStyle]}>
            <Image
                source={source}
                style={[{ flex: 1, width: '100%', height: '100%' }, imageStyle]}
                blurRadius={blurRadius}
                resizeMode={resizeMode}
            />
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: overlayColor,
                }}
            />
        </View>
    );
};

export default BackgroundImage;
