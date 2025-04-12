import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable, Text, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Firebase_auth, Firebase_db } from "../../FirebaseConfig"; // Import the correct Firebase exports
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router"; // Import useRouter

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize router

  const registerUser = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    } else if (!email || !password || !phone || !username) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(""); // Clear the error before attempting registration

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(Firebase_auth, email, password);

      // Send email verification
      await sendEmailVerification(userCredential.user, {
        handleCodeInApp: true,
        url: "https://store-a7193.firebaseapp.com",
      });

      // Save user data to Firestore
      await setDoc(doc(Firebase_db, "users", userCredential.user.uid), {
        email,
        phone,
        username,
      });

      alert("A verification email has been sent. Please verify your account.");
      router.push("/login"); // Redirect to the login page
    } catch (error) {
      const errorCode = error.code;
      switch (errorCode) {
        case "auth/weak-password":
          setError("The password is too weak.");
          break;
        case "auth/email-already-in-use":
          setError("The email address is already in use.");
          break;
        case "auth/invalid-email":
          setError("The email address is invalid.");
          break;
        default:
          setError("An error occurred. Please try again.");
          console.log(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear the error when the user starts typing
  const handleInputChange = (setter) => (text) => {
    setError(""); // Clear the error
    setter(text); // Update the corresponding state
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Create an Account</Text>
          <View style={styles.inputContainer}>
            <AntDesign name="user" style={styles.icon} size={24} color="#4CAF50" />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888"
              onChangeText={handleInputChange(setUsername)}
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
              onChangeText={handleInputChange(setPassword)}
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#4CAF50" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              secureTextEntry={true}
              onChangeText={handleInputChange(setConfirmPassword)}
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#4CAF50" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={email}
              placeholder="Email"
              placeholderTextColor="#888"
              onChangeText={handleInputChange(setEmail)}
            />
          </View>
          <View style={styles.inputContainer}>
            <AntDesign name="phone" style={styles.icon} size={24} color="#4CAF50" />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              placeholderTextColor="#888"
              onChangeText={handleInputChange(setPhone)}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable style={styles.submitButton} onPress={registerUser}>
            <Text style={styles.submitText}>Sign Up</Text>
          </Pressable>
        </>
      )}
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
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4CAF50",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Signup;