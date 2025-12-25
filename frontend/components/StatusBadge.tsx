import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Resolved';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColorClasses = () => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className={`px-2 py-1 rounded-full ${getColorClasses()}`}>
      <Text className={`text-xs font-semibold ${getColorClasses()}`}>
        {status}
      </Text>
    </View>
  );
};

export default StatusBadge;
