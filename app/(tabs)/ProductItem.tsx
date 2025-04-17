import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";

const products = [
  { id: "1", name: "T-shirt", description: "A stylish cotton T-shirt", price: "$300", image: require("../../assets/images/T-shirt.jpg") },
  { id: "2", name: "Jeans", description: "Classic blue jeans", price: "$800", image: require("../../assets/images/jeans.jpg") },
  { id: "3", name: "Sweater", description: "Warm wool sweater", price: "$700", image: require("../../assets/images/Sweater.jpg") },
  { id: "4", name: "Coat", description: "Elegant winter coat", price: "$1000", image: require("../../assets/images/Coat.jpg") },
];

const ProductItem = ({ item }: { item: { id: string; name: string; description: string; price: string; image: any } }) => {
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name || "Unnamed Product"}</Text>
        <Text style={styles.description}>
          {item.description?.length > 50 ? item.description.slice(0, 50) + "..." : item.description || "No description available"}
        </Text>
        <Text style={styles.price}>{item.price || "Price not available"}</Text>
      </View>
    </View>
  );
};

const Products = () => {
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", 
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 10,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
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
