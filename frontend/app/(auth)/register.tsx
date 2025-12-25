import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, role);
      // Navigate based on role
      if (role === 'student') {
        router.replace('/(student)/home' as any);
      } else if (role === 'admin') {
        router.replace('/(admin)/dashboard' as any);
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
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
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 justify-center px-6">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </Text>
            <Text className="text-gray-600">
              Sign up to get started with Campus FixIt
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Full Name
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Email
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Password
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              I am a
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg border-2 ${
                  role === 'student'
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-gray-50 border-gray-300'
                }`}
                onPress={() => setRole('student')}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === 'student' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Student
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg border-2 ${
                  role === 'admin'
                    ? 'bg-blue-50 border-blue-600'
                    : 'bg-gray-50 border-gray-300'
                }`}
                onPress={() => setRole('admin')}
              >
                <Text
                  className={`text-center font-semibold ${
                    role === 'admin' ? 'text-blue-600' : 'text-gray-600'
                  }`}
                >
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 mb-4"
            onPress={handleRegister}
          >
            <Text className="text-white text-center font-semibold text-base">
              Create Account
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
