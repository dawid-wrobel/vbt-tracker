import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Alert, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { api } from '../api/client';

const W = Dimensions.get('window').width;

export default function SessionDetailScreen({ route, navigation }) {
  const [session, setSession] = useState(route.params.session);

  useEffect(() => {
    if (session._id) {
      api.getSession(session._id).then(r => setSession(r.data)).catch(() => {});
    }
  }, []);

  const exportData = async (format) => {
    try {
      const res = await api.exportSession(session._id, format);
      await Share.share({ message: format === 'csv' ? res.data : JSON.stringify(res.data, null, 2) });
    } catch {
      Alert.alert('Export failed');
    }
  };

  const reps = session.reps || [];
  const velocityData = reps.map(r => parseFloat(r.avgVelocity) || 0);
  const hasChart = velocityData.length > 1;
  const chartWidth = W - 80; // padding 20 each side + card padding 20 each side

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={s.title}>{session.exerciseName}</Text>
      <Text style={s.date}>{new Date(session.startTime).toLocaleString()}</Text>

      {/* Stats — only reps, peak vel, avg vel */}
      <View style={s.grid}>
        {[
          { label: 'REPS',     value: session.summary?.totalReps || reps.length },
          { label: 'PEAK VEL', value: `${(session.summary?.peakVelocity || 0).toFixed(2)} m/s` },
          { label: 'AVG VEL',  value: `${(session.summary?.avgVelocity  || 0).toFixed(2)} m/s` },
        ].map((item, i) => (
          <View key={i} style={s.statCard}>
            <Text style={s.statValue}>{item.value}</Text>
            <Text style={s.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Velocity chart — fixed width */}
      {hasChart && (
        <View style={s.chartCard}>
          <Text style={s.chartTitle}>VELOCITY PER REP</Text>
          <LineChart
            data={{
              labels: reps.map((_, i) => `${i + 1}`),
              datasets: [{ data: velocityData }]
            }}
            width={chartWidth}
            height={180}
            chartConfig={{
              backgroundColor: '#1a1a1a',
              backgroundGradientFrom: '#1a1a1a',
              backgroundGradientTo: '#1a1a1a',
              decimalPlaces: 2,
              color: () => '#00ff88',
              labelColor: () => '#555',
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#00ff88' },
              propsForBackgroundLines: { stroke: '#222' },
            }}
            bezier
            style={{ borderRadius: 8 }}
            withInnerLines={true}
            withOuterLines={false}
            withHorizontalLabels={true}
            withVerticalLabels={true}
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
            <Text style={s.repMeta}>Peak: {parseFloat(r.peakVelocity).toFixed(3)} m/s</Text>
            <Text style={s.repMeta}>Avg: {parseFloat(r.avgVelocity).toFixed(3)} m/s</Text>
          </View>
        </View>
      ))}

      {/* Export */}
      <View style={s.btnRow}>
        <TouchableOpacity style={s.exportBtn} onPress={() => exportData('json')}>
          <Text style={s.exportBtnText}>Export JSON</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.exportBtn} onPress={() => exportData('csv')}>
          <Text style={s.exportBtnText}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation buttons */}
      <TouchableOpacity
        style={s.nextBtn}
        onPress={() => navigation.navigate('Session', {
          exercise: { _id: session.exerciseId, name: session.exerciseName }
        })}
      >
        <Text style={s.nextBtnText}>NEXT SESSION — {session.exerciseName}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Train')}>
        <Text style={s.backBtnText}>BACK TO EXERCISES</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 20 },
  date: { color: '#555', fontSize: 12, marginBottom: 20, letterSpacing: 1 },
  grid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#1a1a1a', borderRadius: 10, padding: 16, alignItems: 'center' },
  statValue: { color: '#00ff88', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#555', fontSize: 9, letterSpacing: 2, marginTop: 4 },
  chartCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 20, marginBottom: 16, overflow: 'hidden' },
  chartTitle: { color: '#555', fontSize: 10, letterSpacing: 3, marginBottom: 12 },
  repCard: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 8 },
  repTitle: { color: '#00ff88', fontWeight: '700', marginBottom: 6, fontSize: 12, letterSpacing: 2 },
  repRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  repMeta: { color: '#888', fontSize: 12 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  exportBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  exportBtnText: { color: '#555', fontWeight: '700', fontSize: 13 },
  nextBtn: { backgroundColor: '#00ff88', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  nextBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  backBtn: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#333' },
  backBtnText: { color: '#555', fontWeight: '700', fontSize: 14 },
});