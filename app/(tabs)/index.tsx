import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Products from "../../components/ProductItem";
import { Ionicons } from '@expo/vector-icons';



const defaultProducts = [
  'jeans', 'جينز',
  't-shirt', 'تي شيرت',
  'socks', 'جوارب',
  'sweater', 'سويت شيرت',
  'jacket', 'جاكيت',
  'hat', 'قبعة',
  'coat', 'معطف'
];

const SCREEN_WIDTH = Dimensions.get('window').width;

const Home: React.FC = () => {
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  const username = searchParams.username as string | undefined;
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filteredSuggestions = defaultProducts.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.storeTitle}>Elegance Store</Text>
            <TouchableOpacity
              style={styles.cartButtonTop}
              onPress={() => router.push('/cart')}
              accessibilityLabel="Review Cart"
            >
              <Ionicons name="cart-outline" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search for ${username ?? 'products'}`}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowSuggestions(text.length > 0);
            }}
            onFocus={() => setShowSuggestions(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onSubmitEditing={() => setShowSuggestions(false)}
            autoCapitalize="none"
            placeholderTextColor="gray"
          />
        </View>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <ScrollView style={styles.dropdown}>
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.productsContainer}>
          <Products searchQuery={searchQuery} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  searchContainer: {
    width: '90%',
    zIndex: 10,
    paddingTop: 30,
    paddingBottom: 10,
  },
  storeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 25,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdown: {
    marginTop: 5,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionItem: {
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },
  suggestionText: {
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  productsContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    marginTop: 10,
    zIndex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  cartButtonTop: {
    marginLeft: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Home;
