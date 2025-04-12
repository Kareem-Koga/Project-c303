import React from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { useRoute } from "@react-navigation/native"; // Import route hook

const Home = () => {
  const route = useRoute(); // Get route parameters
  const { username } = route.params || {}; // Extract username from route params

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg' }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to Elegance Store</Text>
        {username && <Text style={styles.username}>Hello, {username}!</Text>}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  username: {
    fontSize: 20,
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Home;