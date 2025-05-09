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

// نوع المنتج
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
};

// منتج تجريبي

const TestProduct: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const addToCart = async (product: Product) => {
    setLoading(true);
    try {
      const cartData = await AsyncStorage.getItem('cart');
      let cart: Product[] = cartData ? JSON.parse(cartData) : [];

      const index = cart.findIndex((item) => item.id === product.id);
      if (index >= 0) {
        cart[index].quantity = (cart[index].quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('✅ تمت الإضافة', 'تمت إضافة المنتج إلى العربة 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('❌ خطأ', 'حدث خطأ أثناء الإضافة');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: dummyProduct.image }} style={styles.image} />
      <Text style={styles.name}>{dummyProduct.name}</Text>
      <Text style={styles.price}>{dummyProduct.price} جنيه</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <Button title="أضف إلى العربة" onPress={() => addToCart(dummyProduct)} />
      )}
    </View>
  );
};

export default TestProduct;

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
});
