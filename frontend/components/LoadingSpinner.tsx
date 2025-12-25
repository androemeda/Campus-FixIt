import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large' }) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color="#3b82f6" />
    </View>
  );
};

export default LoadingSpinner;
