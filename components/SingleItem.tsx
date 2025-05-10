// app/product.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!id) return;
    // Listen for reviews for this product
    const q = query(collection(db, 'reviews'), where('productId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [id]);

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

  const handleSubmitReview = async () => {
    if (!reviewName || !reviewRating || !reviewComment) {
      Alert.alert('Error', 'Please fill all review fields');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date(),
      });
      setReviewName('');
      setReviewRating(0);
      setReviewComment('');
      Alert.alert('Success', 'Review submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
    setSubmitting(false);
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

        {/* Review Section (moved here) */}
        <View style={styles.reviewSection}>
          <Text style={styles.detailsTitle}>Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={{ color: '#888', marginBottom: 10 }}>No reviews yet.</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <Text style={styles.reviewName}>{rev.name} <Text style={styles.reviewRating}>({rev.rating}/5)</Text></Text>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          )}
          <Text style={[styles.detailsTitle, { marginTop: 20 }]}>Add a Review</Text>
          <View style={styles.reviewForm}>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              value={reviewName}
              onChangeText={setReviewName}
            />
            {/* Star Rating Row */}
            <View style={styles.starRow}>
              {[1,2,3,4,5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= reviewRating ? '#f5a623' : '#ccc'}
                    style={{ marginHorizontal: 2 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Comment"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.cartButton, { marginTop: 10, backgroundColor: submitting ? '#888' : 'black' }]}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              <Text style={styles.cartButtonText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  reviewSection: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reviewItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  reviewName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  reviewRating: {
    color: '#f5a623',
    fontWeight: 'bold',
  },
  reviewComment: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  reviewForm: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
    fontSize: 14,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
});

export default ProductScreen;