import React from 'react';
import { View, Text } from 'react-native';

interface CategoryBadgeProps {
  category: 'Electrical' | 'Water' | 'Internet' | 'Infrastructure';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const getColorClasses = () => {
    switch (category) {
      case 'Electrical':
        return 'bg-yellow-100 text-yellow-800';
      case 'Water':
        return 'bg-blue-100 text-blue-800';
      case 'Internet':
        return 'bg-purple-100 text-purple-800';
      case 'Infrastructure':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <View className={`px-2 py-1 rounded-full ${getColorClasses()}`}>
      <Text className={`text-xs font-medium ${getColorClasses()}`}>
        {category}
      </Text>
    </View>
  );
};

export default CategoryBadge;
