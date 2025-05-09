// app/product.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface CartItem extends Product {
  size: string;
  quantity: number;
}

const products: Product[] = [
  { id: "1", name: "T-shirt", description: "A stylish cotton T-shirt", price: "$300", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSckVwuCvCzd4fqCdYLi8RjuzyEFPo7BZaKig&s" },
  { id: "2", name: "Jeans", description: "Classic blue jeans", price: "$300", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy_N7RW_kORKB7roASGX9FfLOuIdhXxgR_aA&s" },
  { id: "3", name: "Sweater", description: "Warm wool sweater", price: "$400", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQySF06BuvuS4hAQSUD8ArPAHJeYmlqca2iOA&s" },
  { id: "4", name: "Coat", description: "Elegant winter coat", price: "$500", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR34eXouaySm-ptP06EEpVmfqMyS-NYihFPlw&s" },
  { id: "5", name: "Socks", description: "Comfortable cotton socks", price: "$50", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIPPV4mm5fM8agRyZgTUluuQ3gxpTzrUWsbA&s" },
  { id: "6", name: "Hat", description: "Stylish winter hat", price: "$100", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUSMs77L6U6Sf1iybQw_mdMuTz6MdW4WSzrw&s" },
];

const ProductScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSize, setSelectedSize] = useState('S');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const product = products.find(p => p.id === id);

  // Load reviews from AsyncStorage when component mounts
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const storedReviews = await AsyncStorage.getItem(`reviews_${id}`);
        if (storedReviews) {
          setReviews(JSON.parse(storedReviews));
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    loadReviews();
  }, [id]);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Product not found</Text>
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
        quantity: 1
      };

      const existingItemIndex = cart.findIndex(
        item => item.id === product.id && item.size === selectedSize
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

  const handleAddReview = async () => {
    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Please enter a review comment');
      return;
    }

    const review: Review = {
      id: Date.now().toString(),
      userId: 'anonymous', // TODO: Replace with auth.currentUser?.uid when auth is implemented
      userName: ' You', // TODO: Replace with auth.currentUser?.displayName when auth is implemented
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    
    try {
      await AsyncStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      Alert.alert('Success', 'Review added successfully');
    } catch (error) {
      console.error('Error saving review:', error);
      Alert.alert('Error', 'Failed to save review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFD700"
          />
        ))}
      </View>
    );
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

      {/* Reviews Section */}
      <View style={styles.reviewsContainer}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.reviewsTitle}>Reviews</Text>
          <TouchableOpacity 
            style={styles.addReviewButton}
            onPress={() => setShowReviewForm(!showReviewForm)}
          >
            <Ionicons name="add-circle-outline" size={24} color="black" />
            <Text style={styles.addReviewText}>Add Review</Text>
          </TouchableOpacity>
        </View>

        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.formLabel}>Rating:</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setNewReview({ ...newReview, rating: star })}
                >
                  <Ionicons
                    name={star <= newReview.rating ? 'star' : 'star-outline'}
                    size={24}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.formLabel}>Your Review:</Text>
            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              value={newReview.comment}
              onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
              placeholder="Write your review here..."
            />
            <View style={styles.reviewFormButtons}>
              <TouchableOpacity 
                style={[styles.reviewButton, styles.cancelButton]}
                onPress={() => setShowReviewForm(false)}
              >
                <Text style={styles.reviewButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.reviewButton, styles.submitButton]}
                onPress={handleAddReview}
              >
                <Text style={[styles.reviewButtonText, styles.submitButtonText]}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            {renderStars(review.rating)}
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
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
    height: 300, 
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
  reviewsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReviewText: {
    marginLeft: 5,
    color: '#000',
  },
  reviewForm: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reviewFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  reviewButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#000',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButtonText: {
    color: '#fff',
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  reviewDate: {
    color: '#666',
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default ProductScreen;
