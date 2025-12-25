import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIssues } from '../../../context/IssueContext';
import { Issue } from '../../../types';
import CategoryBadge from '../../../components/CategoryBadge';
import StatusBadge from '../../../components/StatusBadge';
import LoadingSpinner from '../../../components/LoadingSpinner';

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved'];

export default function ManageIssueScreen() {
  const { id } = useLocalSearchParams();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remark, setRemark] = useState('');

  const { fetchIssueById, updateIssue, resolveIssue } = useIssues();
  const router = useRouter();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/issues`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const foundIssue = data.issues.find((i: Issue) => i._id === id);
      
      if (foundIssue) {
        setIssue(foundIssue);
        setSelectedStatus(foundIssue.status);
      } else {
        Alert.alert('Error', 'Issue not found');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issue');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedStatus && !remark) {
      Alert.alert('Error', 'Please select a status or add a remark');
      return;
    }

    try {
      setUpdating(true);
      await updateIssue(
        id as string,
        selectedStatus !== issue?.status ? selectedStatus : undefined,
        remark || undefined
      );
      Alert.alert('Success', 'Issue updated successfully', [
        { text: 'OK', onPress: () => router.replace('/(admin)/dashboard' as any) },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update issue');
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    Alert.alert(
      'Resolve Issue',
      'Are you sure you want to mark this issue as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          style: 'default',
          onPress: async () => {
            try {
              setUpdating(true);
              await resolveIssue(id as string);
              Alert.alert('Success', 'Issue marked as resolved', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resolve issue');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-6">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.replace('/(admin)/dashboard' as any)} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Manage Issue</Text>
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

          {/* Reported By */}
          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Reported By
            </Text>
            <Text className="text-gray-900">{issue.createdBy.name}</Text>
            <Text className="text-gray-600 text-sm">{issue.createdBy.email}</Text>
          </View>

          {/* Update Status */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Update Status
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  className={`px-4 py-2 rounded-lg border-2 ${
                    selectedStatus === status
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text
                    className={`font-medium ${
                      selectedStatus === status ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Remark */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Add Remark
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Add a note or update about this issue"
              value={remark}
              onChangeText={setRemark}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Existing Remarks */}
          {issue.remarks && issue.remarks.length > 0 && (
            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Previous Remarks ({issue.remarks.length})
              </Text>
              {issue.remarks.map((remarkItem) => (
                <View
                  key={remarkItem._id}
                  className="bg-gray-50 rounded-lg p-4 mb-3"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-medium text-gray-900">
                      {remarkItem.addedBy.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatDate(remarkItem.addedAt)}
                    </Text>
                  </View>
                  <Text className="text-gray-600">{remarkItem.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View>
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-4"
              onPress={handleUpdate}
              disabled={updating}
            >
              <Text className="text-white text-center font-semibold text-base">
                {updating ? 'Updating...' : 'Update Issue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
