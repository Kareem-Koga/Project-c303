import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  useWindowDimensions,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Firebase_db } from "../../FirebaseConfig";

const PersonalInfoScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const auth = getAuth();
  
  const isTablet = width > 768;

  const createUserDataIfNeeded = async (userToken) => {
    try {
      console.log('Creating initial user data for ID:', userToken);
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No current user in auth');
        return false;
      }
      
      // Create default user data
      const defaultUserData = {
        email: currentUser.email || 'No email',
        displayName: currentUser.displayName || 'User',
        photoURL: currentUser.photoURL || null,
        phoneNumber: currentUser.phoneNumber || '',
        address: '',
        userId: userToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        notificationsEnabled: true,
        language: 'English',
        theme: 'System Default'
      };
      
      // Save to Firestore
      await setDoc(doc(Firebase_db, "users", userToken), defaultUserData);
      console.log('Created default user data:', defaultUserData);
      
      return defaultUserData;
    } catch (error) {
      console.error('Error creating user data:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Starting to fetch user data...');
        
        // Check for user token
        const userToken = await AsyncStorage.getItem('userToken');
        console.log('User token from AsyncStorage:', userToken);
        
        if (!userToken) {
          console.log('No user token found, redirecting to login');
          router.push('/(auth)/login');
          return;
        }
        
        // Get user document from Firestore
        console.log('Fetching user document from Firestore with ID:', userToken);
        const userDocRef = doc(Firebase_db, "users", userToken);
        const userDoc = await getDoc(userDocRef);
        
        console.log('Document exists?', userDoc.exists());
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User data retrieved:', JSON.stringify(data));
          setUserData(data);
        } else {
          console.log('No document found with ID:', userToken);
          
          // Try to create user data
          const createdData = await createUserDataIfNeeded(userToken);
          
          if (createdData) {
            console.log('Created and using new user data');
            setUserData(createdData);
          } else {
            setError('User document not found and could not be created');
            
            // Create a minimal user object to avoid errors
            setUserData({
              displayName: 'User',
              email: 'No email found',
              photoURL: null
            });
            
            Alert.alert(
              'Data Error',
              'Could not find your user data. Your profile might not be properly set up.',
              [
                {text: 'OK'},
                {
                  text: 'Try Again',
                  onPress: () => fetchUserData()
                }
              ]
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message);
        Alert.alert('Error', `Failed to load profile data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not available';
    
    try {
      let date;
      if (timestamp.toDate) {
        // Handle Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        // Handle string or number timestamp
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const InfoSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const InfoItem = ({ icon, label, value }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={20} color="#000000" />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load user information</Text>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </Pressable>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <Pressable 
          style={styles.editButton}
          onPress={() => router.push('../Screen/editProfile')}
        >
          <MaterialIcons name="edit" size={20} color="#000000" />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          isTablet && styles.tabletContentContainer
        ]}
      >
        <View style={styles.profileCard}>
          <Image
            source={{ 
              uri: userData.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' 
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{userData.email || 'No email'}</Text>
          </View>
        </View>
        
        <InfoSection title="Contact Information">
          <InfoItem 
            icon="mail-outline" 
            label="Email" 
            value={userData.email} 
          />
          <InfoItem 
            icon="call-outline" 
            label="Phone Number" 
            value={userData.phoneNumber} 
          />
          <InfoItem 
            icon="location-outline" 
            label="Address" 
            value={userData.address} 
          />
        </InfoSection>
        
        <InfoSection title="Account Details">
          <InfoItem 
            icon="calendar-outline" 
            label="Account Created" 
            value={formatDate(userData.createdAt)} 
          />
          <InfoItem 
            icon="time-outline" 
            label="Last Updated" 
            value={formatDate(userData.updatedAt)} 
          />
          <InfoItem 
            icon="shield-checkmark-outline" 
            label="Account Status" 
            value="Active" 
          />
        </InfoSection>
        
        <InfoSection title="Personal Preferences">
          <InfoItem 
            icon="notifications-outline" 
            label="Notifications" 
            value={userData.notificationsEnabled ? 'Enabled' : 'Disabled'} 
          />
          <InfoItem 
            icon="language-outline" 
            label="Language" 
            value={userData.language || 'English'} 
          />
          <InfoItem 
            icon="moon-outline" 
            label="Theme" 
            value={userData.theme || 'System Default'} 
          />
        </InfoSection>
        
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.editProfileButton}
            onPress={() => router.push('../Screen/editProfile')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  tabletContentContainer: {
    paddingHorizontal: 40,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerBackButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
    marginTop: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#000000',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  sectionContent: {
    
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#777',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  editProfileButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PersonalInfoScreen; 