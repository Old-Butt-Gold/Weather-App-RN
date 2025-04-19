import React from 'react';
import { View, Image, ImageSourcePropType, ImageStyle, StyleProp, ViewStyle } from 'react-native';

type BackgroundImageProps = {
  source: ImageSourcePropType;
  blurRadius?: number;
  overlayColor?: string;
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
};

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  source = require("../assets/bg.png"),
  blurRadius = 6,
  overlayColor = 'rgba(0, 0, 0, 0.1)',
  imageStyle,
  containerStyle,
  resizeMode = 'cover',
}) => {
  return (
    <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, containerStyle]}>
      <Image
        source={source}
        style={[{ flex: 1, width: '100%', height: '100%' }, imageStyle]}
        blurRadius={blurRadius}
        resizeMode={resizeMode}
      />
      <View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
          { backgroundColor: overlayColor }
        ]}
      />
    </View>
  );
};

export default BackgroundImage;