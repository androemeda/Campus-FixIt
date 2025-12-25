import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useIssues } from '../../context/IssueContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const CATEGORIES = ['Electrical', 'Water', 'Internet', 'Infrastructure'];

export default function CreateIssueScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { createIssue } = useIssues();
  const router = useRouter();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
  if (!title || !description || !category) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  try {
    setLoading(true);

    await createIssue(title, description, category, imageUri || undefined);

    // 🔥 Immediately redirect after success
    router.replace('/(student)/home');

  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to create issue');
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-blue-600 pt-12 pb-6 px-6">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Report Issue</Text>
          </View>
        </View>

        <View className="px-6 py-6">
          {/* Title */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Title <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Brief description of the issue"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Provide detailed information about the issue"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Category <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  className={`px-4 py-2 rounded-lg border-2 ${
                    category === cat
                      ? 'bg-blue-50 border-blue-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    className={`font-medium ${
                      category === cat ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image Upload */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Photo (Optional)
            </Text>
            {imageUri ? (
              <View className="relative">
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-red-500 w-8 h-8 rounded-full items-center justify-center"
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-8 items-center"
                onPress={pickImage}
              >
                <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-500 mt-2">Tap to upload photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-semibold text-base">
              Submit Issue
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
