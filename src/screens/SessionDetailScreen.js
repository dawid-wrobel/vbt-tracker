import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { api } from '../api/client';

const W = Dimensions.get('window').width;

export default function SessionDetailScreen({ route }) {
  const [session, setSession] = useState(route.params.session);

  useEffect(() => {
    if (session._id) {
      api.getSession(session._id).then(r => setSession(r.data));
    }
  }, []);

  const exportData = async (format) => {
    try {
      const res = await api.exportSession(session._id, format);
      await Share.share({ message: format === 'csv' ? res.data : JSON.stringify(res.data, null, 2) });
    } catch (e) {
      Alert.alert('Export failed');
    }
  };

  const reps = session.reps || [];
  const velocityData = reps.map(r => r.avgVelocity || 0);
  //const fatigueIndex = session.summary?.fatigueIndex || 0;
  //const fatigueColor = fatigueIndex < 30 ? '#00ff88' : fatigueIndex < 60 ? '#ffe66d' : '#ff6b6b';

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>{session.exerciseName}</Text>
      <Text style={s.date}>{new Date(session.startTime).toLocaleString()}</Text>

      {/* Summary cards */}
      <View style={s.grid}>
        {[
          { label: 'REPS', value: session.summary?.totalReps || reps.length },
          { label: 'PEAK VEL', value: `${(session.summary?.peakVelocity || 0).toFixed(2)} m/s` },
          { label: 'AVG VEL', value: `${(session.summary?.avgVelocity || 0).toFixed(2)} m/s` },
          { label: 'VEL LOSS', value: `${(session.summary?.velocityLoss || 0).toFixed(1)}%` },
        ].map((item, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statValue}>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Velocity chart */}
      {velocityData.length > 0 && (
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>VELOCITY PER REP</Text>
          <LineChart
            data={{ labels: reps.map((_, i) => `${i + 1}`), datasets: [{ data: velocityData }] }}
            width={W - 40}
            height={200}
            chartConfig={{
              backgroundColor: '#1a1a1a', backgroundGradientFrom: '#1a1a1a', backgroundGradientTo: '#1a1a1a',
              decimalPlaces: 2, color: () => '#00ff88', labelColor: () => '#555',
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#00ff88' }
            }}
            bezier
            style={{ borderRadius: 8 }}
          />
        </View>
      )}

      {/* Rep breakdown */}
      {reps.map((r, i) => (
        <View key={i} style={s.repCard}>
          <Text style={s.repTitle}>REP {r.repNumber}</Text>
          <View style={s.repRow}>
            <Text style={s.repMeta}>↑ Concentric: {r.concentricDuration}ms</Text>
            <Text style={s.repMeta}>↓ Eccentric: {r.eccentricDuration}ms</Text>
          </View>
          <View style={s.repRow}>
            <Text style={s.repMeta}>Peak: {r.peakVelocity?.toFixed(2)} m/s</Text>
            <Text style={s.repMeta}>Avg: {r.avgVelocity?.toFixed(2)} m/s</Text>
          </View>
        </View>
      ))}

      {/* Export buttons */}
      <View style={s.exportRow}>
        <TouchableOpacity style={s.exportBtn} onPress={() => exportData('json')}>
          <Text style={s.exportBtnText}>Export JSON</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.exportBtn} onPress={() => exportData('csv')}>
          <Text style={s.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 20 },
  date: { color: '#555', fontSize: 12, marginBottom: 20, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 16, width: (W - 60) / 2, alignItems: 'center' },
  statValue: { color: '#00ff88', fontSize: 24, fontWeight: '900' },
  statLabel: { color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 4 },
  bar: { height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, marginTop: 8 },
  barFill: { height: 8, borderRadius: 4 },
  chartCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  chartTitle: { color: '#555', fontSize: 10, letterSpacing: 3, marginBottom: 12 },
  repCard: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 8 },
  repTitle: { color: '#00ff88', fontWeight: '700', marginBottom: 6, fontSize: 12, letterSpacing: 2 },
  repRow: { flexDirection: 'row', justifyContent: 'space-between' },
  repMeta: { color: '#888', fontSize: 12 },
  exportRow: { flexDirection: 'row', gap: 12, marginVertical: 20 },
  exportBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  exportBtnText: { color: '#fff', fontWeight: '700' }
});