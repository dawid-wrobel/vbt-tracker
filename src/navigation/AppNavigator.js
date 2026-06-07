import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SessionScreen, { wsRef } from '../screens/SessionScreen';
import SensorTestScreen from '../screens/SensorTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '900' },
      }}
    >
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Session Details' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#00ff88',
          tabBarInactiveTintColor: '#555',
          tabBarStyle: { backgroundColor: '#111', borderTopColor: '#222' },
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 11, letterSpacing: 1 },
        }}
      >
        <Tab.Screen name="Train"   component={HomeScreen}       options={{ tabBarLabel: 'TRAIN' }} />
        <Tab.Screen name="Session" component={SessionScreen}    options={{ tabBarLabel: 'SESSION' }} />
        <Tab.Screen name="Test"    component={SensorTestScreen} options={{ tabBarLabel: 'TEST' }} />
        <Tab.Screen name="History" component={HistoryStack}     options={{ tabBarLabel: 'HISTORY' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}