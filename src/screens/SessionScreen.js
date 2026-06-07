import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

export const wsRef = { current: null };

export default function SessionScreen({ route, navigation }) {
  const [sessionId, setSessionId] = useState(null);
  const [reps, setReps] = useState([]);
  const [active, setActive] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const repsRef = useRef([]);
  const sessionIdRef = useRef(null);

  useEffect(() => { repsRef.current = reps; }, [reps]);

  const connectWebSocket = async (sid) => {
    if (wsRef.current) wsRef.current.close();
    const saved = await AsyncStorage.getItem('vbt_config');
    const cfg = saved ? JSON.parse(saved) : null;
    const socket = new WebSocket('wss://vbt-backend-production.up.railway.app');
    wsRef.current = socket;

    socket.onopen = () => {
      setWsConnected(true);
      if (cfg) socket.send(JSON.stringify({ cmd: 'config', ...cfg }));
    };
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'rep') {
          const rep = { ...data.rep, repNumber: repsRef.current.length + 1 };
          setReps(prev => [...prev, rep]);
          api.addRep({ sessionId: sid, rep }).catch(console.error);
        }
      } catch {}
    };
    socket.onerror = () => setWsConnected(false);
    socket.onclose = () => setWsConnected(false);
  };

  const startSession = async () => {
    if (!route?.params?.exercise) {
      Alert.alert('No exercise', 'Select an exercise from Train tab first');
      return;
    }
    try {
      const res = await api.startSession({
        exerciseId: route.params.exercise._id,
        exerciseName: route.params.exercise.name
      });
      const sid = res.data._id;
      setSessionId(sid);
      sessionIdRef.current = sid;
      setReps([]);
      setActive(true);
      connectWebSocket(sid);
    } catch {
      Alert.alert('Error', 'Could not start session');
    }
  };

  const finishSession = async () => {
    if (wsRef.current) wsRef.current.close();
    try {
      const res = await api.finishSession(sessionId);
      setActive(false);
      setSessionId(null);
      setWsConnected(false);
      navigation.navigate('History', {
        screen: 'SessionDetail',
        params: { session: res.data }
      });
    } catch {
      Alert.alert('Error', 'Could not finish session');
    }
  };

  const simulateRep = () => {
    const rep = {
      repNumber: reps.length + 1,
      concentricDuration: Math.round(500 + Math.random() * 300),
      eccentricDuration: Math.round(700 + Math.random() * 300),
      peakVelocity: parseFloat((0.9 - reps.length * 0.03).toFixed(3)),
      avgVelocity: parseFloat((0.7 - reps.length * 0.02).toFixed(3)),
      velocityLoss: parseFloat((reps.length * 3).toFixed(1))
    };
    setReps(prev => [...prev, rep]);
    if (sessionId) api.addRep({ sessionId, rep }).catch(console.error);
  };

  const vc = (v) => v > 0.7 ? '#00ff88' : v > 0.5 ? '#ffe66d' : '#ff6b6b';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>{route?.params?.exercise?.name || 'Select exercise in Train tab'}</Text>
        {wsConnected && (
          <View style={s.wsbadge}>
            <View style={s.wsdot} />
            <Text style={s.wstext}>Sensor connected</Text>
          </View>
        )}
      </View>

      {!active ? (
        <TouchableOpacity style={s.startBtn} onPress={startSession}>
          <Text style={s.startBtnText}>START SESSION</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={s.repCount}>
            <Text style={s.repNum}>{reps.length}</Text>
            <Text style={s.repLabel}>REPS</Text>
          </View>
          <TouchableOpacity style={s.simBtn} onPress={simulateRep}>
            <Text style={s.simBtnText}>+ SIMULATE REP (test)</Text>
          </TouchableOpacity>
          <ScrollView style={s.repList}>
            {reps.slice().reverse().map((r, i) => (
              <View key={i} style={s.repRow}>
                <Text style={s.repRowNum}>REP {r.repNumber}</Text>
                <Text style={[s.vel, { color: vc(r.avgVelocity) }]}>{parseFloat(r.avgVelocity).toFixed(2)} m/s</Text>
                <Text style={s.phase}>↑{r.concentricDuration}ms ↓{r.eccentricDuration}ms</Text>
                <Text style={s.loss}>-{parseFloat(r.velocityLoss).toFixed(1)}%</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.finishBtn} onPress={finishSession}>
            <Text style={s.finishBtnText}>FINISH SESSION</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  title: { color: '#00ff88', fontSize: 22, fontWeight: '900' },
  wsbage: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  wsbadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  wsdot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00ff88', marginRight: 6 },
  wstext: { color: '#00ff88', fontSize: 12 },
  startBtn: { backgroundColor: '#00ff88', padding: 20, borderRadius: 12, alignItems: 'center' },
  startBtnText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 2 },
  repCount: { alignItems: 'center', marginVertical: 16 },
  repNum: { color: '#00ff88', fontSize: 80, fontWeight: '900' },
  repLabel: { color: '#555', letterSpacing: 4, fontSize: 12 },
  simBtn: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  simBtnText: { color: '#555', fontSize: 12 },
  repList: { flex: 1 },
  repRow: { backgroundColor: '#1a1a1a', padding: 14, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  repRowNum: { color: '#555', fontSize: 12, fontWeight: '700', width: 50 },
  vel: { fontSize: 18, fontWeight: '900', width: 70 },
  phase: { color: '#888', fontSize: 11, flex: 1, textAlign: 'center' },
  loss: { color: '#ff6b6b', fontSize: 12, fontWeight: '700' },
  finishBtn: { backgroundColor: '#ff6b6b', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  finishBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 }
});