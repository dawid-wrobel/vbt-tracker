import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={s.container}>
      <View style={s.avatar}><Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text></View>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.email}>{user?.email}</Text>
      <TouchableOpacity style={s.logoutBtn} onPress={logout}>
        <Text style={s.logoutText}>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#00ff88', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 48, fontWeight: '900', color: '#000' },
  name: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 4 },
  email: { color: '#555', fontSize: 14, marginBottom: 40 },
  logoutBtn: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 8, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  logoutText: { color: '#ff6b6b', fontWeight: '900', letterSpacing: 2 }
});