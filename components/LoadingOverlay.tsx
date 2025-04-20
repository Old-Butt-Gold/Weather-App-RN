import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  isVisible: boolean;
  color?: string;
  size?: 'small' | 'large' | number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  color = '#2196F3', 
  size = 'large' 
}) => {
  if (!isVisible) return null;
  
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
});

export default LoadingOverlay;