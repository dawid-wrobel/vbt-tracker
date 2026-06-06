import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();

  const handle = async () => {
    try {
      await register(name, email, password);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Create Account</Text>
      <TextInput style={s.input} placeholder="Name" placeholderTextColor="#555" value={name} onChangeText={setName} />
      <TextInput style={s.input} placeholder="Email" placeholderTextColor="#555" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={s.input} placeholder="Password" placeholderTextColor="#555" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={s.btn} onPress={handle}><Text style={s.btnText}>REGISTER</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={s.link}>Already have an account? Login</Text></TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, color: '#00ff88', fontWeight: '900', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#1a1a1a', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
  btn: { backgroundColor: '#00ff88', padding: 16, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#000', fontWeight: '900', textAlign: 'center', fontSize: 16, letterSpacing: 2 },
  link: { color: '#555', textAlign: 'center', marginTop: 20 }
});