import React, { useState }  from 'react';
import { StyleSheet, Text, View, ImageBackground ,TextInput, TouchableOpacity } from 'react-native';
import { useRouter, SearchParams } from 'expo-router';
import Products from "../../components/ProductItem";
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
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search for ${username ? username : ''}`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
          <Text style={styles.cartIcon}></Text>
          <Text style={styles.cartButtonText}>View Cart</Text>
        </TouchableOpacity>
      </View>

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 50,
    marginBottom: 20,
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
    width: '65%',
    borderRadius: 10,
    fontSize: 18,
    color: 'black',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginLeft: 10,
  },
  cartIcon: {
    fontFamily: 'ionicons',
    fontSize: 20,
    color: 'white',
    marginRight: 5,
  },
  cartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Home;