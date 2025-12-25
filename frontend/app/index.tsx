import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, go to login
        router.replace('/(auth)/login');
      } else if (user.role === 'student') {
        // Student user, go to student home
        router.replace('/(student)/home');
      } else if (user.role === 'admin') {
        // Admin user, go to admin dashboard
        router.replace('/(admin)/dashboard');
      }
    }
  }, [user, loading]);

  return <LoadingSpinner />;
}
