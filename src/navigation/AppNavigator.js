import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import SessionScreen, { wsRef } from '../screens/SessionScreen';
import SensorTestScreen from '../screens/SensorTestScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Empty icon — this is the ONLY way to remove triangles in React Navigation
const EmptyIcon = () => <View />;

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '900' },
      }}
    >
      <Stack.Screen name="HomeMain"      component={HomeScreen}          options={{ headerShown: false }} />
      <Stack.Screen name="Session"       component={SessionScreen}       options={{ headerShown: false }} />
      <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Session Details' }} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0a0a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '900' },
      }}
    >
      <Stack.Screen name="HistoryMain" component={HistoryScreen} options={{ headerShown: false }} />
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
          tabBarLabelStyle: { fontSize: 11, letterSpacing: 1, marginBottom: 6 },
          tabBarIcon: EmptyIcon,
          tabBarIconStyle: { display: 'none', height: 0 },
          tabBarItemStyle: { paddingTop: 8 },
        }}
      >
        <Tab.Screen
          name="Train"
          component={HomeStack}
          options={{ tabBarLabel: 'TRAIN', tabBarIcon: EmptyIcon }}
        />
        <Tab.Screen
          name="Test"
          component={SensorTestScreen}
          options={{ tabBarLabel: 'TEST', tabBarIcon: EmptyIcon }}
        />
        <Tab.Screen
          name="History"
          component={HistoryStack}
          options={{ tabBarLabel: 'HISTORY', tabBarIcon: EmptyIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}