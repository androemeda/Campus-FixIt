import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Issue } from '../types';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';

interface IssueCardProps {
  issue: Issue;
  onPress: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">
          {issue.title}
        </Text>
        <StatusBadge status={issue.status} />
      </View>

      <Text className="text-gray-600 mb-3" numberOfLines={2}>
        {issue.description}
      </Text>

      <View className="flex-row items-center justify-between">
        <CategoryBadge category={issue.category} />
        
        <View className="flex-row items-center">
          {issue.imageUrl && (
            <View className="w-10 h-10 rounded-md overflow-hidden mr-2">
              <Image
                source={{ uri: issue.imageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          )}
          <Text className="text-xs text-gray-500">
            {formatDate(issue.createdAt)}
          </Text>
        </View>
      </View>

      {issue.remarks && issue.remarks.length > 0 && (
        <View className="mt-2 pt-2 border-t border-gray-100">
          <Text className="text-xs text-gray-500">
            {issue.remarks.length} remark{issue.remarks.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default IssueCard;
