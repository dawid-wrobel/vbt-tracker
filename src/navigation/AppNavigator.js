import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SessionScreen from '../screens/SessionScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Session Details' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#00ff88', tabBarStyle: { backgroundColor: '#111' }, headerShown: false }}>
        <Tab.Screen name="Train" component={HomeScreen} options={{ tabBarIcon: () => <Text>🏋️</Text> }} />
        <Tab.Screen name="Session" component={SessionScreen} options={{ tabBarIcon: () => <Text>📡</Text> }} />
        <Tab.Screen name="History" component={HistoryStack} options={{ tabBarIcon: () => <Text>📊</Text> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}