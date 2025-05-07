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
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(Firebase_auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
      Alert.alert("Email Verification", "Please verify your email before logging in.");
      return;
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
      Alert.alert("Login Failed", "User does not exist. Please check your email or sign up.");
      } else if (error.code === 'auth/wrong-password') {
      Alert.alert("Login Failed", "Incorrect password. Please try again.");
      } else {
      Alert.alert("Login Failed", error.message);
      }
      return;
    }

    const userDoc = await getDoc(doc(Firebase_db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data(); // Keeping this for potential future use
        // const userData = userDoc.data(); // Keeping this for potential future use
        await AsyncStorage.setItem('userToken', user.uid); 
        router.pop(); 
      } else {
        Alert.alert("Error", "User data not found.");
      }
    } catch (error) {
      Alert.alert("Login Failed", error.message);
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
  forgotPasswordButton: {
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
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