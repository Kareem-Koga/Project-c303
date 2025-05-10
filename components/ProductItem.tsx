import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { Firebase_db as db } from "../FirebaseConfig";

const { width: screenWidth } = Dimensions.get('window');
const estimatedCardWidth = 180;
const numColumns = 2;
const cardMarginHorizontal = 10;
const cardWidth = (screenWidth - (cardMarginHorizontal * 2) - (10 * (numColumns - 1))) / numColumns;
const cardHeight = cardWidth * 1.6;


const ProductItem = ({ item }: { item: { id: string; name: string; description: string; price: string; image: string } }) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth, height: cardHeight }]}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage} 
        resizeMode="cover" // Or other resizeMode values
      />
      <View style={styles.textContainer}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Products = ({ searchQuery }: { searchQuery: string }) => {
  const [products, setProducts] = useState<{ id: string; name: string; description: string; price: string; image: string }[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productSnapshot = await getDocs(collection(db, "products"));
        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().title, // Map Firestore's title to name
          description: doc.data().description,
          price: String(doc.data().price), // Ensure price is a string
          image: doc.data().image,
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchQuery?.toLowerCase() || "")
  );

  return (
    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductItem item={item} />}
      numColumns={2}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: cardMarginHorizontal / 2,
    paddingTop: 20,
    backgroundColor: "#F5F5F5",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 40,
    width: cardWidth,
    height: cardHeight,
    marginBottom: 1,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 9,
    flexGrow: 1,
  },
  productImage: {
    width: "100%",
    height: '55%',
    marginBottom: 20,
    marginTop: 1,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8",
  },
  description: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8",
    marginTop: 5,
  },
});

export default Products;