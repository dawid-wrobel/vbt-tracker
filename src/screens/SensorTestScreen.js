import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const WS_URL = 'wss://vbt-backend-production.up.railway.app'; // ← update this

export default function SensorTestScreen() {
  const [running, setRunning] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [reps, setReps] = useState([]);
  const [lastReading, setLastReading] = useState(null);
  const wsRef = useRef(null);
  const repsRef = useRef([]);

  const start = () => {
    setReps([]);
    setLastReading(null);
    setHasData(false);
    repsRef.current = [];
    setRunning(true);

    const socket = new WebSocket(WS_URL);
    wsRef.current = socket;

    socket.onopen = () => setWsConnected(true);

    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'imu') {
          setHasData(true);
          setLastReading({
            accelMag: parseFloat(data.accelMag || 0).toFixed(3),
            gyroMag:  parseFloat(data.gyroMag  || 0).toFixed(1),
            velocity: parseFloat(data.velocity  || 0).toFixed(4),
            peak:     parseFloat(data.peakVelocity || 0).toFixed(4),
          });
        }
        if (data.type === 'rep') {
          const r = data.rep;
          const newRep = {
            num: repsRef.current.length + 1,
            avg: parseFloat(r.avgVelocity).toFixed(3),
            peak: parseFloat(r.peakVelocity).toFixed(3),
            conc: r.concentricDuration,
          };
          repsRef.current = [...repsRef.current, newRep];
          setReps([...repsRef.current]);
        }
      } catch {}
    };

    socket.onerror = () => { setWsConnected(false); setHasData(false); };
    socket.onclose = () => { setWsConnected(false); setHasData(false); };
  };

  const stop = () => {
    if (wsRef.current) wsRef.current.close();
    setRunning(false);
    setWsConnected(false);
    setHasData(false);
    setReps([]);
    setLastReading(null);
    repsRef.current = [];
  };

  const sensorActive = wsConnected && hasData;
  const vc = (v) => parseFloat(v) > 0.7 ? '#00ff88' : parseFloat(v) > 0.5 ? '#ffe66d' : '#ff6b6b';

  return (
    <View style={s.container}>
      <Text style={s.title}>Sensor Test</Text>
      <Text style={s.sub}>Temporary — data clears on stop</Text>

      <View style={s.statusRow}>
        <View style={[s.dot, { backgroundColor: sensorActive ? '#00ff88' : '#555' }]} />
        <Text style={s.statusText}>
          {sensorActive ? 'Sensor connected' : running ? 'Waiting for sensor...' : 'Press START TEST'}
        </Text>
      </View>

      {sensorActive && lastReading && (
        <View style={s.grid}>
          <View style={s.cell}>
            <Text style={s.cellVal}>{lastReading.accelMag}</Text>
            <Text style={s.cellLbl}>ACCEL MAG</Text>
          </View>
          <View style={s.cell}>
            <Text style={s.cellVal}>{lastReading.gyroMag}</Text>
            <Text style={s.cellLbl}>GYRO MAG</Text>
          </View>
          <View style={s.cell}>
            <Text style={s.cellVal}>{lastReading.velocity}</Text>
            <Text style={s.cellLbl}>VELOCITY</Text>
          </View>
          <View style={s.cell}>
            <Text style={s.cellVal}>{lastReading.peak}</Text>
            <Text style={s.cellLbl}>PEAK VEL</Text>
          </View>
        </View>
      )}

      <View style={s.repHeader}>
        <Text style={s.repHeaderText}>REPS: {reps.length}</Text>
      </View>

      <ScrollView style={s.repList}>
        {reps.slice().reverse().map((r, i) => (
          <View key={i} style={s.repRow}>
            <Text style={s.repNum}>REP {r.num}</Text>
            <Text style={[s.repVal, { color: vc(r.avg) }]}>{r.avg} m/s</Text>
            <Text style={s.repMeta}>↑{r.conc}ms</Text>
            <Text style={s.repPeak}>peak {r.peak}</Text>
          </View>
        ))}
      </ScrollView>

      {!running ? (
        <TouchableOpacity style={s.startBtn} onPress={start}>
          <Text style={s.startText}>START TEST</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.stopBtn} onPress={stop}>
          <Text style={s.stopText}>STOP & CLEAR</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  sub: { color: '#555', fontSize: 12, marginBottom: 16, letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, color: '#888' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  cell: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, width: '47%', alignItems: 'center' },
  cellVal: { color: '#00ff88', fontSize: 22, fontWeight: '900', fontFamily: 'monospace' },
  cellLbl: { color: '#555', fontSize: 10, letterSpacing: 2, marginTop: 4 },
  repHeader: { marginBottom: 10 },
  repHeaderText: { color: '#555', fontSize: 11, letterSpacing: 3 },
  repList: { flex: 1, marginBottom: 16 },
  repRow: { backgroundColor: '#1a1a1a', padding: 14, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  repNum: { color: '#555', fontSize: 12, fontWeight: '700', width: 50 },
  repVal: { fontSize: 16, fontWeight: '900', width: 72 },
  repMeta: { color: '#888', fontSize: 12, flex: 1, textAlign: 'center' },
  repPeak: { color: '#444', fontSize: 11 },
  startBtn: { backgroundColor: '#00ff88', padding: 18, borderRadius: 12, alignItems: 'center' },
  startText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
  stopBtn: { backgroundColor: '#ff6b6b', padding: 18, borderRadius: 12, alignItems: 'center' },
  stopText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
});