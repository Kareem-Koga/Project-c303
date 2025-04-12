import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useNavigation } from "@react-navigation/native"; // Import navigation hook
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firebase, Firebase_auth, Firebase_db } from "../../FirebaseConfig";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    checkLoggedInStatus();
  }, []);

  const checkLoggedInStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error('Error reading user token from AsyncStorage:', error);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(Firebase_auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("Please verify your email before logging in.");
        return;
      }

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(Firebase_db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        navigation.navigate("Home", { username: userData.username }); // Pass username to Home
      } else {
        alert("User data not found.");
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#4CAF50" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          placeholder="Email"
          placeholderTextColor="#888"
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#4CAF50" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <Pressable style={styles.submitButton} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.submitText}>Login</Text>
        )}
      </Pressable>
      <Text style={styles.signupText}>Don't have an account?</Text>
      <Link href="/signup" style={styles.signupLink}>Sign Up</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginVertical: 10,
    width: "90%",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "black",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupText: {
    marginTop: 20,
    fontSize: 14,
    color: "#888",
  },
  signupLink: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default Login;