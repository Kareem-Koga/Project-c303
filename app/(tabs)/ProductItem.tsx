import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";

const products = [
  { id: "1", name: "T-shirt", description: "A stylish cotton T-shirt", price: "$300" },
  { id: "2", name: "Jeans", description: "Classic blue jeans", price: "$800" },
  { id: "3", name: "Sweater", description: "Warm wool sweater", price: "$700" },
  { id: "4", name: "Coat", description: "Elegant winter coat", price: "$1000" },
];

const ProductItem = ({ item }: { item: { id: string; name: string; description: string; price: string } }) => {
  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </View>
  );
};

const Products = () => {
  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductItem item={item} />}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 20,
    backgroundColor: "#F5F5F5",
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
