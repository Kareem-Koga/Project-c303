import React from 'react'
import { Text } from 'react-native'
import {router} from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';


export default function lyout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        
        <Drawer.Screen
          name="login" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'Home',
            title: 'overview',
          }}
        />
        <Drawer.Screen
          name="home" // This is the name of the page and must match the url from root
          options={{
            drawerLabel: 'User',
            title: 'overview',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}