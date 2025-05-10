import { useState } from 'react'; // React is used for JSX
import { View, TextInput, StyleSheet, Pressable, Text, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // MaterialIcons is used in the input fields
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Firebase_auth, Firebase_db } from "../../FirebaseConfig";

const Login = () => {
  const [email, setEmail] = useState(''); // setEmail is used in onChangeText
  const [password, setPassword] = useState(''); // setPassword is used in onChangeText
  const [loading, setLoading] = useState(false); // loading is used in the ActivityIndicator
  const router = useRouter();

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Input Required", "Please enter both email and password");
      return;
    }
    
    setLoading(true);
    console.log('Login attempt started:', email);
    
    try {
      // Attempt to sign in
      console.log('Attempting Firebase sign in');
      const userCredential = await signInWithEmailAndPassword(Firebase_auth, email, password);
      const user = userCredential.user;
      console.log('Sign in successful, user:', user.uid);

      // Check email verification
      if (!user.emailVerified) {
        console.log('Email not verified');
        Alert.alert("Email Verification", "Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      // Fetch user data
      console.log('Fetching user data from Firestore');
      const userDoc = await getDoc(doc(Firebase_db, "users", user.uid));
      
      if (userDoc.exists()) {
        console.log('User data found in Firestore');
        // Store user token
        await AsyncStorage.setItem('userToken', user.uid);
        console.log('User token stored in AsyncStorage');
        
        // Reset loading state before navigation
        setLoading(false);
        
        // Navigate to tabs instead of using pop()
        console.log('Navigating to home screen');
        router.replace('/(tabs)');
      } else {
        console.log('User document not found in Firestore');
        setLoading(false);
        Alert.alert("Error", "User data not found in database.");
      }
    } catch (error) {
      console.log('Login error:', error.code, error.message);
      setLoading(false);
      // Handle specific error cases
      if (error.code === 'auth/user-not-found') {
        Alert.alert("Login Failed", "User does not exist. Please check your email or sign up.");
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert("Login Failed", "Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert("Login Failed", "The email address is not valid.");
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert("Login Failed", "Too many unsuccessful login attempts. Please try again later.");
      } else {
        Alert.alert("Login Failed", error.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={20} color="#000000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          placeholder="Email"
          placeholderTextColor="#888888"
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="emailInput"
        />
      </View>
      <View style={styles.inputContainer}>
        <MaterialIcons name="lock" size={20} color="#000000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Password"
          placeholderTextColor="#888888"
          secureTextEntry={true}
          onChangeText={(text) => setPassword(text)}
          testID="passwordInput"
        />
      </View>
      <Pressable 
        style={styles.submitButton} 
        onPress={handleLogin}
        testID="loginButton"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>Login</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/forgot')} style={styles.forgotPasswordButton}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </Pressable>

      <Text style={styles.signupText}>Don't have an account?</Text>
      <Pressable onPress={() => router.push('/signup')}>
        <Text style={styles.signupLink}>Sign Up</Text>
      </Pressable>
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
    color: "#000000",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginVertical: 10,
    width: "90%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#000000",
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    width: "90%",
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  signupText: {
    marginTop: 20,
    fontSize: 14,
    color: "#888888",
  },
  signupLink: {
    color: "#000000",
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default Login;