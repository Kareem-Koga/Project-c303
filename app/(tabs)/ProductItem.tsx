import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";

const products = [
    { id: "1", name: "T-shirt", description: "A stylish cotton T-shirt", price: "$300", image: require("../../assets/images/T-shirt.jpg") },
  { id: "2", name: "Jeans", description: "Classic blue jeans", price: "$800", image: require("../../assets/images/jeans.jpg") },
  { id: "3", name: "Sweater", description: "Warm wool sweater", price: "$700", image: require("../../assets/images/Sweater.jpg") },
  { id: "4", name: "Coat", description: "Elegant winter coat", price: "$1000", image: require("../../assets/images/Coat.jpg") },
];

const ProductItem = ({ item }: { item: { id: string; name: string; description: string; price: string; image: any } }) => {
    console.log(item);
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
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductItem item={item} />}
    />
  );
};

const styles = StyleSheet.create({
    card: {
      flexDirection: "row", 
      alignItems: "center",
      padding: 15,
      marginVertical: 10,
      marginHorizontal: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
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
    },
    description: {
      fontSize: 14,
      color: "gray",
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
