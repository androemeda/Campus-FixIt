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
import api from '../../config/api';
import { Issue } from '../../types';

export default function AdminDashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [allIssues, setAllIssues] = useState<Issue[]>([]); // Store all issues for stats

  const { issues, loading, fetchAdminIssues } = useIssues();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Load all issues for stats on mount
  useEffect(() => {
    loadAllIssuesForStats();
  }, []);

  // Load filtered issues when filters change
  useEffect(() => {
    loadIssues();
  }, [selectedCategory, selectedStatus]);

  // Calculate stats from all issues (not filtered)
  useEffect(() => {
    calculateStats();
  }, [allIssues]);

  const loadAllIssuesForStats = async () => {
    try {
      const response = await api.get('/api/admin/issues');
      setAllIssues(response.data.issues);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadIssues = async () => {
    try {
      const filters: any = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedStatus) filters.status = selectedStatus;
      await fetchAdminIssues(filters);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issues');
    }
  };

  const calculateStats = () => {
    setStats({
      total: allIssues.length,
      open: allIssues.filter((i) => i.status === 'Open').length,
      inProgress: allIssues.filter((i) => i.status === 'In Progress').length,
      resolved: allIssues.filter((i) => i.status === 'Resolved').length,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllIssuesForStats();
    await loadIssues();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedStatus('');
  };

  const handleLogout = async () => {
    console.log('Logout button clicked!');
    try {
      console.log('Logging out...');
      await logout();
      console.log('Navigating to login...');
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
            <Text className="text-white text-xl font-bold">Admin Dashboard</Text>
            <Text className="text-blue-100 text-xs">Welcome, {user?.name}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.7}
            className="bg-blue-700 p-3 rounded-lg"
            style={{ zIndex: 999 }}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Stats - Compressed */}
        <View className="flex-row gap-1.5">
          <View className="flex-1 bg-blue-700 rounded-lg p-2">
            <Text className="text-white text-xl font-bold">{stats.total}</Text>
            <Text className="text-blue-200 text-[10px]">Total</Text>
          </View>
          <View className="flex-1 bg-red-500 rounded-lg p-2">
            <Text className="text-white text-xl font-bold">{stats.open}</Text>
            <Text className="text-red-100 text-[10px]">Open</Text>
          </View>
          <View className="flex-1 bg-orange-500 rounded-lg p-2">
            <Text className="text-white text-xl font-bold">{stats.inProgress}</Text>
            <Text className="text-orange-100 text-[10px]">In Progress</Text>
          </View>
          <View className="flex-1 bg-green-500 rounded-lg p-2">
            <Text className="text-white text-xl font-bold">{stats.resolved}</Text>
            <Text className="text-green-100 text-[10px]">Resolved</Text>
          </View>
        </View>
      </View>

      {/* Filters - Compressed */}
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

      {/* Issues List - More Space */}
      <View className="flex-1 px-4 pt-2">
        {issues.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
            <Text className="text-gray-500 text-lg mt-4">No issues reported</Text>
          </View>
        ) : (
          <FlatList
            data={issues}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <IssueCard
                issue={item}
                onPress={() => router.push(`/(admin)/manage/${item._id}`)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
