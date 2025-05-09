import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { Firebase_db as db } from "../FirebaseConfig";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 20;
const cardHeight = cardWidth * 1.5;

const ProductItem = ({ item }: { item: { id: string; name: string; description: string; price: string; image: string } }) => {
  const router = useRouter();

  return (
  <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image
      source={{ uri: item.image }}
      style={styles.productImage}
      resizeMode="cover"
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
    paddingHorizontal: 10,
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
    borderRadius: 8,
    padding: 19,
    width: cardWidth,
    height: cardHeight,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  description: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007BFF",
    marginTop: 5,
  },
});

export default Products;