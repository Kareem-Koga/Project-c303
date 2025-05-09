import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: string; 
  image: string;
  size: string;
  quantity: number;
}

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData).map((item: CartItem) => ({
          ...item,
          price: parseFloat(item.price), 
        }));
        setCartItems(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const updateQuantity = async (itemId: string, size: string, change: number) => {
    try {
      const updatedItems = cartItems
        .map((item) => {
          if (item.id === itemId && item.size === size) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      setCartItems(updatedItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleDeleteItem = async (itemId: string, size: string) => {
    try {
      const updatedItems = cartItems.filter(
        (item) => !(item.id === itemId && item.size === size)
      );
      await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
      setCartItems(updatedItems);
      Alert.alert('Item removed from cart');
    } catch (error) {
      console.error('Error deleting item:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={{ width: 28 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.subText}>Add items to your cart to see them here</Text>
        </View>
      ) : (
        <View style={styles.cartContent}>
          {cartItems.map((item) => (
            <View key={`${item.id}-${item.size}`} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id, item.size)}
                  >
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemSize}>Size: {item.size}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.size, -1)}
                  >
                    <Ionicons name="remove" size={20} color="black" />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.size, 1)}
                  >
                    <Ionicons name="add" size={20} color="black" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${calculateTotal().toFixed(2)}</Text>
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF1DE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: '#666',
  },
  cartContent: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  itemSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 20,
  },
  quantity: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  checkoutButton: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
