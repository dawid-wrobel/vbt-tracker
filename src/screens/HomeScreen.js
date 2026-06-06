import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { api } from '../api/client';

export default function HomeScreen({ navigation }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExercises().then(r => { setExercises(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categoryColor = { push: '#ff6b6b', pull: '#4ecdc4', squat: '#ffe66d', hinge: '#a8e6cf' };

  return (
    <View style={s.container}>
      <Text style={s.title}>Select Exercise</Text>
      {loading ? <ActivityIndicator color="#00ff88" /> : (
        <FlatList
          data={exercises}
          keyExtractor={i => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[s.card, { borderLeftColor: categoryColor[item.category] || '#00ff88' }]}
              onPress={() => navigation.navigate('Session', { exercise: item })}
            >
              <Text style={s.exerciseName}>{item.name}</Text>
              <Text style={s.category}>{item.category?.toUpperCase()}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No exercises found. Check backend connection.</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 24 },
  card: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4 },
  exerciseName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  category: { color: '#555', fontSize: 11, marginTop: 4, letterSpacing: 2 },
  empty: { color: '#555', textAlign: 'center', marginTop: 60 }
});