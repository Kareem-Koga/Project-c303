import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Product = {
  id: string;
  name: string;
  price: number; // Ensure price is a number
  image: string;
  size: string; // Added size field
  quantity?: number;
};

const AddToCart: React.FC<{ product: Product }> = ({ product }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const addToCart = async () => {
    setLoading(true);
    try {
      const cartData = await AsyncStorage.getItem('cart');
      let cart: Product[] = cartData ? JSON.parse(cartData) : [];

      const existingItemIndex = cart.findIndex(
        (item) => item.id === product.id && item.size === product.size
      );

      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('✅ Success', 'Item added to cart 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('❌ Error', 'Failed to add item to cart');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price.toFixed(2)} USD</Text> {/* Fixed price formatting */}
      <Text style={styles.size}>Size: {product.size}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Button title="Add to Cart" onPress={addToCart} />
      )}
    </View>
  );
};

export default AddToCart;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    color: 'green',
    marginVertical: 10,
  },
  size: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
});