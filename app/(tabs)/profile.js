import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // State to track loading

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken'); // Check if user token exists
        if (!userToken) {
          router.replace('/login'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Error checking user authentication:', error);
      } finally {
        setLoading(false); // Stop loading once the check is complete
      }
    };

    checkUserAuthentication();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to your Profile!</Text>
      {/* TODO: Add user profile details here */}
    </View>
  );
};

export default ProfileScreen;
