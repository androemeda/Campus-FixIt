import './global.css';
import { Slot, Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { IssueProvider } from '../context/IssueContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <IssueProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(student)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </IssueProvider>
    </AuthProvider>
  );
}
