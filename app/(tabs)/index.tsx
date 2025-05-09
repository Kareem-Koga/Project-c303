import React, { useState }  from 'react';
import { StyleSheet, Text, View, ImageBackground ,TextInput} from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ImageBackground
      source={{ uri: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg' }}
      style={styles.backgroundImage}
    >
    <TextInput
          style={styles.searchInput}
          placeholder={`Search for ${username ? username : ''}`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
        />
      <ScrollView style={styles.overlay}>
      <Products searchQuery={searchQuery} />
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
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    width: '80%',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    color: 'black',
  },
});

export default Home;