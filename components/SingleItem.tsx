// app/product.tsx
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import React, { useState } from 'react';
>>>>>>> e71ecc02360a42a2f65bdd87d77adee204f0ed6e
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { Firebase_db as db } from '../FirebaseConfig'; // Import Firestore

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface CartItem extends Product {
  size: string;
  quantity: number;
}

const ProductScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the product ID from the route
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('S');
<<<<<<< HEAD

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          Alert.alert('Error', 'Product ID is missing');
          router.back();
          return;
        }

        const productDoc = await getDoc(doc(db, 'products', id as string));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
        } else {
          Alert.alert('Error', 'Product not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to fetch product details');
        router.back();
      }
    };

    fetchProduct();
  }, [id]);
=======
  const product = products.find(p => p.id === id);
>>>>>>> e71ecc02360a42a2f65bdd87d77adee204f0ed6e

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      let cart: CartItem[] = cartData ? JSON.parse(cartData) : [];

      const cartItem: CartItem = {
        ...product,
        size: selectedSize,
        quantity: 1,
      };

      const existingItemIndex = cart.findIndex(
        (item) => item.id === product.id && item.size === selectedSize
      );

      if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += 1;
      } else {
        cart.push(cartItem);
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Success', 'Item added to cart');
      router.push('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{product.name}</Text>

        {/* Product Description */}
        <Text style={styles.detailsTitle}>Product Details</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Sizes */}
        <View style={styles.sizeContainer}>
          {sizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                selectedSize === size && styles.selectedSizeButton,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text
                style={[
                  styles.sizeText,
                  selectedSize === size && styles.selectedSizeText,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price and Add to Cart */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Total price:</Text>
            <Text style={styles.price}>{product.price}</Text>
          </View>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={styles.cartButtonText}>Add to cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FAF1DE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 300, // مساحة مخصصة ثابتة لعرض الصورة
    marginBottom: 20,
  },
  
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  
  infoContainer: {
    backgroundColor: '#FAF1DE',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedSizeButton: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  sizeText: {
    fontSize: 14,
    color: '#000',
  },
  selectedSizeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#555',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  cartButton: {
    flexDirection: 'row',
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  cartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProductScreen;