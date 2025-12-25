import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIssues } from '../../../context/IssueContext';
import { Issue } from '../../../types';
import CategoryBadge from '../../../components/CategoryBadge';
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function IssueDetailScreen() {
  const { id } = useLocalSearchParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  const { fetchIssueById } = useIssues();
  const router = useRouter();

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const data = await fetchIssueById(id as string);
      setIssue(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issue');
      router.replace('/(student)/home' as any);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!issue) {
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/(student)/home' as any)} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Issue Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-6">
          {/* Status and Category */}
          <View className="flex-row justify-between items-center mb-4">
            <CategoryBadge category={issue.category} />
            <StatusBadge status={issue.status} />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {issue.title}
          </Text>

          {/* Date */}
          <Text className="text-sm text-gray-500 mb-4">
            Reported on {formatDate(issue.createdAt)}
          </Text>

          {/* Image */}
          {issue.imageUrl && (
            <View className="mb-4">
              <Image
                source={{ uri: issue.imageUrl }}
                className="w-full h-64 rounded-lg"
                resizeMode="cover"
              />
            </View>
          )}

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Description
            </Text>
            <Text className="text-gray-600 leading-6">{issue.description}</Text>
          </View>

          {/* Remarks */}
          {issue.remarks && issue.remarks.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Remarks ({issue.remarks.length})
              </Text>
              {issue.remarks.map((remark) => (
                <View
                  key={remark._id}
                  className="bg-gray-50 rounded-lg p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-medium text-gray-900">
                      {remark.addedBy.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(remark.addedAt)}
                    </Text>
                  </View>
                  <Text className="text-gray-600">{remark.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Created By */}
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Reported By
            </Text>
            <Text className="text-gray-900">{issue.createdBy.name}</Text>
            <Text className="text-gray-600 text-sm">{issue.createdBy.email}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
