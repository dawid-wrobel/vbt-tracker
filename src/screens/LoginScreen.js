import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';

export default function HistoryScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    api.getSessions().then(r => { setSessions(r.data); setLoading(false); });
  }, []));

  return (
    <View style={s.container}>
      <Text style={s.title}>History</Text>
      {loading ? <ActivityIndicator color="#00ff88" /> : (
        <FlatList
          data={sessions}
          keyExtractor={i => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('SessionDetail', { session: item })}>
              <View style={s.row}>
                <Text style={s.exName}>{item.exerciseName}</Text>
                <Text style={s.date}>{new Date(item.startTime).toLocaleDateString()}</Text>
              </View>
              <View style={s.row}>
                <Text style={s.meta}>{item.summary?.totalReps || 0} reps</Text>
                <Text style={s.meta}>{item.summary?.avgVelocity?.toFixed(2) || '—'} m/s avg</Text>
                <Text style={s.meta}>{item.summary?.peakVelocity?.toFixed(2) || '—'} m/s peak</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={s.empty}>No sessions yet. Start training!</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 24 },
  card: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  exName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  date: { color: '#555', fontSize: 11 },
  meta: { color: '#888', fontSize: 12 },
  empty: { color: '#555', textAlign: 'center', marginTop: 60, fontSize: 16 }
});