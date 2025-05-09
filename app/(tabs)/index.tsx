import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Products from "../../components/ProductItem";

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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.storeTitle}>Elegance Store</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={`Search for ${username ?? ''}`}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onSubmitEditing={() => setShowSuggestions(false)}
          autoCapitalize="words"
          placeholderTextColor="gray"
        />
      </View>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ScrollView style={styles.dropdown}>
          {filteredSuggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
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

      <ScrollView style={styles.overlay}>
        <Products searchQuery={searchQuery} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  searchContainer: {
    width: '80%',
    zIndex: 10,
  },
  storeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontFamily: 'Dancing Script',
    color: 'Black',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    color: 'black',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdown: {
    marginTop: 10,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 20,
  },
  suggestionText: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    width: SCREEN_WIDTH,
    borderRadius: 10,
    flex: 1,
    marginTop: 20,
    zIndex: 1,
  },
});

export default Home;
