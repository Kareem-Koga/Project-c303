
import React from 'react';
import { StyleSheet, Text, View, ImageBackground } from 'react-native';

const App = () => {
  return (
    <ImageBackground 
    source={{ uri: 'https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg' }} 

      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Elegance Store</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
   
    
  },
  
  title: {
    fontSize: 24,
    
    fontStyle: 'italic',
    color: 'grey',
    textAlign: 'center',
  },
});

export default App;