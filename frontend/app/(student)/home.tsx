import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import IssueCard from '../../components/IssueCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function StudentHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const { issues, loading, fetchMyIssues } = useIssues();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      await fetchMyIssues();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issues');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIssues();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedStatus('');
  };

  // Filter issues client-side
  const filteredIssues = issues.filter((issue) => {
    if (selectedCategory && issue.category !== selectedCategory) return false;
    if (selectedStatus && issue.status !== selectedStatus) return false;
    return true;
  });

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login' as any);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Compressed */}
      <View className="bg-blue-600 pt-10 pb-3 px-4">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-white text-xl font-bold">My Issues</Text>
            <Text className="text-blue-100 text-xs">
              Welcome, {user?.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-blue-700 p-2 rounded-lg"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View className="bg-blue-700 rounded-lg p-2">
          <Text className="text-white text-2xl font-bold">
            {issues.length}
          </Text>
          <Text className="text-blue-200 text-[10px]">Total Issues Reported</Text>
        </View>
      </View>

      {/* Filters - Compact */}
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xs font-semibold text-gray-700">Filters</Text>
          {(selectedCategory || selectedStatus) && (
            <TouchableOpacity onPress={clearFilters}>
              <Text className="text-blue-600 text-xs font-medium">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter */}
        <View className="mb-2">
          <Text className="text-[10px] text-gray-600 mb-1">Category</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {['Electrical', 'Water', 'Internet', 'Infrastructure'].map((cat) => (
              <TouchableOpacity
                key={cat}
                className={`px-2.5 py-1 rounded-full border ${
                  selectedCategory === cat
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-gray-50 border-gray-300'
                }`}
                onPress={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
              >
                <Text
                  className={`text-[10px] font-medium ${
                    selectedCategory === cat ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status Filter */}
        <View className="mb-1">
          <Text className="text-[10px] text-gray-600 mb-1">Status</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {['Open', 'In Progress', 'Resolved'].map((status) => (
              <TouchableOpacity
                key={status}
                className={`px-2.5 py-1 rounded-full border ${
                  selectedStatus === status
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-gray-50 border-gray-300'
                }`}
                onPress={() => setSelectedStatus(selectedStatus === status ? '' : status)}
              >
                <Text
                  className={`text-[10px] font-medium ${
                    selectedStatus === status ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Issues List */}
      <View className="flex-1 px-4 pt-2">
        {filteredIssues.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-lg mt-4">No issues yet</Text>
            <Text className="text-gray-400 text-sm mt-1">
              Tap the + button to report an issue
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredIssues}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <IssueCard
                issue={item}
                onPress={() => router.push(`/(student)/issue/${item._id}`)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/(student)/create')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
