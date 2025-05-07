import React from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';
import { useRouter, SearchParams } from 'expo-router'; // Use expo-router for navigation
import Products from "../../components/ProductItem"; // Import Products component
import { useSearchParams } from 'expo-router/build/hooks';
import { ScrollView } from 'react-native-gesture-handler';

interface RouteParams {
  username?: string;
}

const Home: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const username = searchParams.get('username'); 

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg' }}
      style={styles.backgroundImage}
    >
    
      <Text style={{ color: 'black', fontSize: 24, marginBottom: 20 }}>
        Search bar {username ? username : 'Guest'}
      </Text>
      <ScrollView style={styles.overlay}>
      <Products />
      </ScrollView>
      

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
    width: "100%",
    borderRadius: 10,
  }
});

export default Home;