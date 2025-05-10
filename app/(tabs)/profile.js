import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Firebase_db } from "../../FirebaseConfig";
const uploadToCloudinary = async (imageUri) => {
  const fileType = imageUri.split(".").pop();
  const data = new FormData();
  data.append("file", {
    uri: imageUri,
    type: `image/${fileType}`,
    name: `profile.${fileType}`,
  });
  data.append("upload_preset", "unsigned_preset");

  return fetch("https://api.cloudinary.com/v1_1/dc3ts6rcq/image/upload", {
    method: "POST",
    body: data,
  })
    .then((res) => res.json())
    .then((file) => {
      console.log("Cloudinary response:", file);
      return file.secure_url;
    })
    .catch((err) => {
      console.log("Cloudinary upload error:", err);
      return null;
    });
};

const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const auth = getAuth();

  const isTablet = width > 768;
  const isLandscape = width > height;

  const createUserDataIfNeeded = async (userToken) => {
    try {
      console.log("Creating initial user data for ID:", userToken);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log("No current user in auth");
        return false;
      }

      // Create default user data
      const defaultUserData = {
        email: currentUser.email || "No email",
        displayName: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || null,
        phoneNumber: currentUser.phoneNumber || "",
        address: "",
        userId: userToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        notificationsEnabled: true,
        language: "English",
        theme: "System Default",
      };

      // Save to Firestore
      await setDoc(doc(Firebase_db, "users", userToken), defaultUserData);
      console.log("Created default user data:", defaultUserData);

      return defaultUserData;
    } catch (error) {
      console.error("Error creating user data:", error);
      return false;
    }
  };
  const handleWebImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "unsigned_preset");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dc3ts6rcq/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const result = await res.json();
    console.log("Cloudinary response:", result);

    if (result.secure_url) {
      const userToken = await AsyncStorage.getItem("userToken");
      await setDoc(doc(Firebase_db, "users", userToken), {
        ...userData,
        photoURL: result.secure_url,
        updatedAt: new Date(),
      });
      setUserData({ ...userData, photoURL: result.secure_url });
    } else {
      Alert.alert("Upload Error", "حدث خطأ أثناء رفع الصورة. حاول مرة أخرى.");
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Profile: Starting to fetch user data...");

        const userToken = await AsyncStorage.getItem("userToken");
        console.log("Profile: User token from AsyncStorage:", userToken);

        if (!userToken) {
          // If no user token, redirect to login
          console.log("Profile: No user token found, redirecting to login");
          router.push("/(auth)/login");
          return;
        }

        const userDocRef = doc(Firebase_db, "users", userToken);
        const userDoc = await getDoc(userDocRef);
        console.log("Profile: Document exists?", userDoc.exists());

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Profile: User data retrieved:", JSON.stringify(data));
          setUserData(data);
        } else {
          console.log("Profile: No document found with ID:", userToken);

          // Try to create user data
          const createdData = await createUserDataIfNeeded(userToken);

          if (createdData) {
            console.log("Profile: Created and using new user data");
            setUserData(createdData);
          } else {
            console.warn("Profile: Could not create user data");
            Alert.alert(
              "Profile Setup",
              "Your profile data needs to be set up. Would you like to go to edit your profile now?",
              [
                {
                  text: "Yes",
                  onPress: () => router.push("/(tabs)/editProfile"),
                },
                {
                  text: "No",
                  style: "cancel",
                },
              ]
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("userToken");
      router.push("/(auth)/login");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  const handleEditProfile = () => {
    // Navigate to a new edit profile screen
    router.push("../Screen/editProfile");
  };

  const handlePersonalInfo = () => {
    // Navigate to the personal information screen
    router.push("../Screen/personalInfo");
  };
  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to allow access to your photos!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // ارفع الصورة إلى Cloudinary
      const imageUrl = await uploadToCloudinary(result.assets[0].uri);
      console.log("Cloudinary image URL:", imageUrl);
      if (!imageUrl) {
        Alert.alert("Upload Error", "حدث خطأ أثناء رفع الصورة. حاول مرة أخرى.");
        return;
      }

      // احفظ الرابط في Firestore
      const userToken = await AsyncStorage.getItem("userToken");
      await setDoc(doc(Firebase_db, "users", userToken), {
        ...userData,
        photoURL: imageUrl,
        updatedAt: new Date(),
      });

      // حدث الصورة في الواجهة
      setUserData({ ...userData, photoURL: imageUrl });
    } else {
      Alert.alert("No Image Selected", "لم يتم اختيار صورة.");
    }
  };
  const ProfileHeader = () => (
    <View
      style={[
        styles.profileHeader,
        isTablet && styles.tabletProfileHeader,
        isLandscape && styles.landscapeProfileHeader,
      ]}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri:
              userData?.photoURL ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
          }}
          style={styles.avatar}
        />
        {Platform.OS === "web" ? (
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: "none" }}
            id="profile-image-upload"
            onChange={handleWebImageUpload}
          />
        ) : null}
        <Pressable
          style={styles.editAvatarButton}
          onPress={() => {
            if (Platform.OS === "web") {
              document.getElementById("profile-image-upload").click();
            } else {
              handlePickImage();
            }
          }}
        >
          <MaterialIcons name="edit" size={16} color="#FFF" />
        </Pressable>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{userData?.displayName || "User"}</Text>
        <Text style={styles.userEmail}>{userData?.email || "No email"}</Text>
      </View>
    </View>
  );

  const SettingsOption = ({
    icon,
    title,
    subtitle,
    onPress,
    showEditButton = false,
  }) => (
    <Pressable
      style={styles.settingsOption}
      onPress={onPress}
      android_ripple={{ color: "#f0f0f0" }}
    >
      <View style={styles.settingsIconContainer}>
        <Ionicons name={icon} size={24} color="#4CAF50" />
      </View>
      <View style={styles.settingsTextContainer}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {showEditButton ? (
        <Pressable
          style={styles.settingsEditButton}
          onPress={() => router.push("../Screen/editProfile")}
        >
          <Text style={styles.settingsEditText}>Edit</Text>
        </Pressable>
      ) : (
        <MaterialIcons name="chevron-right" size={24} color="#888" />
      )}
    </Pressable>
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
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <Pressable
          style={styles.loginButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          isTablet && styles.tabletContentContainer,
        ]}
      >
        <ProfileHeader />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingsOption
            icon="person-outline"
            title="Personal Information"
            subtitle="View and update your personal details"
            showEditButton={true}
            onPress={handlePersonalInfo}
          />
          <SettingsOption
            icon="lock-closed-outline"
            title="Security"
            subtitle="Password and authentication"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
          <SettingsOption
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <SettingsOption
            icon="notifications-outline"
            title="Notifications"
            subtitle="Manage your notification settings"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
          <SettingsOption
            icon="moon-outline"
            title="Appearance"
            subtitle="Dark mode and theme options"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
          <SettingsOption
            icon="language-outline"
            title="Language"
            subtitle="Change your preferred language"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingsOption
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Get help with your account"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
          <SettingsOption
            icon="chatbubble-ellipses-outline"
            title="Contact Us"
            subtitle="Reach our support team"
            onPress={() =>
              Alert.alert("Coming Soon", "This feature will be available soon!")
            }
          />
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  contentContainer: {
    paddingBottom: 30,
    paddingTop: 10,
  },
  tabletContentContainer: {
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  profileHeader: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabletProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 40,
  },
  landscapeProfileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    alignItems: "center",
    marginLeft: Platform.OS === "web" ? 20 : 0,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#777",
    marginBottom: 15,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  settingsSubtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
  settingsEditButton: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  settingsEditText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  versionText: {
    color: "#888",
    fontSize: 14,
  },
  errorText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
