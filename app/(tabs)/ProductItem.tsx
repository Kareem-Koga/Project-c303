import React from "react";
import { View, Text, Image, FlatList, StyleSheet } from "react-native";


const products = [
  { id: "1", name: "T-shirt", description: "A stylish cotton T-shirt", price: "$300", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSckVwuCvCzd4fqCdYLi8RjuzyEFPo7BZaKig&s" },
  { id: "2", name: "Jeans", description: "Classic blue jeans", price: "$300", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy_N7RW_kORKB7roASGX9FfLOuIdhXxgR_aA&s" },
  { id: "3", name: "Sweater", description: "Warm wool sweater", price: "$400", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQySF06BuvuS4hAQSUD8ArPAHJeYmlqca2iOA&s" },
  { id: "4", name: "Coat", description: "Elegant winter coat", price: "$500", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR34eXouaySm-ptP06EEpVmfqMyS-NYihFPlw&s" },
  { id: "5", name: "Socks", description: "Comfortable cotton socks", price: "$50", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIPPV4mm5fM8agRyZgTUluuQ3gxpTzrUWsbA&s" },
  { id: "6", name: "Hat", description: "Stylish winter hat", price: "$100", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUSMs77L6U6Sf1iybQw_mdMuTz6MdW4WSzrw&s" },
];

const cardWidth = 200;
const cardHeight = 300;
const cardMarginHorizontal = 5;

const ProductItem = ({ item }: { item: { id: string; name: string; description: string; price: string; image: string } }) => {
  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage} 
        resizeMode="cover" // Or other resizeMode values
      />
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
      numColumns={2}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
    />
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", 
  },
  list: {
    paddingHorizontal: 10, 
    paddingTop: 20,
    backgroundColor: "#F5F5F5",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
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
  productImage: {
    width: '100%',
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
