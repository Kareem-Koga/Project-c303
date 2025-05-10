import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';
import { Firebase_db } from '../../FirebaseConfig';

const EditProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Edit Profile: Starting to fetch user data...');
        
        const userToken = await AsyncStorage.getItem('userToken');
        console.log('Edit Profile: User token from AsyncStorage:', userToken);
        
        if (!userToken) {
          router.push('/(auth)/login');
          return;
        }

        const userDocRef = doc(Firebase_db, 'users', userToken);
        const userDoc = await getDoc(userDocRef);
        console.log('Edit Profile: Document exists?', userDoc.exists());
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Edit Profile: User data retrieved:', JSON.stringify(data));
          setUserData(data);
          setDisplayName(data.displayName || '');
          setPhoneNumber(data.phoneNumber || '');
          setAddress(data.address || '');
          setPhotoURL(data.photoURL || '');
        } else {
          console.log('Edit Profile: No document found, creating default data');
          
          // No data exists, but we're in the edit screen, so create default data
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            const defaultData = {
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              phoneNumber: '',
              address: '',
              userId: userToken,
              createdAt: new Date(),
              updatedAt: new Date(),
              notificationsEnabled: true,
              language: 'English',
              theme: 'System Default'
            };
            
            try {
              // Save default data to Firestore
              await setDoc(userDocRef, defaultData);
              console.log('Edit Profile: Created default user data');
              
              // Set local state
              setUserData(defaultData);
              setDisplayName(defaultData.displayName || '');
              setPhoneNumber(defaultData.phoneNumber || '');
              setAddress(defaultData.address || '');
              setPhotoURL(defaultData.photoURL || '');
            } catch (createError) {
              console.error('Error creating user document:', createError);
              Alert.alert('Error', 'Failed to create profile data');
            }
          } else {
            console.log('Edit Profile: No current user in auth');
            Alert.alert('Error', 'User authentication issue. Please log in again.');
            router.push('/(auth)/login');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'You need to grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const saveChanges = async () => {
    if (!displayName.trim()) {
      Alert.alert('Invalid Input', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        router.push('/(auth)/login');
        return;
      }

      // Update Firestore document
      const userDocRef = doc(Firebase_db, 'users', userToken);
      await updateDoc(userDocRef, {
        displayName,
        phoneNumber,
        address,
        photoURL,
        updatedAt: new Date(),
      });

      // Update Firebase Auth profile if user is logged in
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName,
          photoURL,
        });
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { 
          text: 'OK', 
          onPress: () => router.back() 
        }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#000000" />
            </Pressable>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
              }}
              style={styles.profilePhoto}
            />
            <Pressable style={styles.changePhotoButton} onPress={pickImage}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={userData?.email || ''}
                editable={false}
                placeholder="Your email address"
                placeholderTextColor="#999"
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.saveButton, saving && styles.disabledButton]}
              onPress={saveChanges}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </Pressable>
            
            <Pressable 
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#000000',
  },
  changePhotoButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  changePhotoText: {
    color: '#000000',
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  addressInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfileScreen; 