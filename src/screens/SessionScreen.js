import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

export const wsRef = { current: null };

export default function SessionScreen({ route, navigation }) {
  const exercise = route?.params?.exercise;
  const [sessionId, setSessionId] = useState(null);
  const [reps, setReps] = useState([]);
  const [active, setActive] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [todaySessions, setTodaySessions] = useState([]);
  const repsRef = useRef([]);
  const sessionIdRef = useRef(null);

  useEffect(() => { repsRef.current = reps; }, [reps]);

  useFocusEffect(useCallback(() => {
    loadTodaySessions();
  }, []));

  const loadTodaySessions = async () => {
    try {
      const res = await api.getSessions();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = res.data
        .filter(s => new Date(s.startTime) >= today)
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setTodaySessions(filtered);
    } catch {}
  };

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
    try {
      const res = await api.startSession({
        exerciseId: exercise._id,
        exerciseName: exercise.name
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
      navigation.push('SessionDetail', { session: res.data });
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

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>{exercise?.name}</Text>
        {wsConnected && (
          <View style={s.wsbadge}>
            <View style={s.wsdot} />
            <Text style={s.wstext}>Sensor connected</Text>
          </View>
        )}
      </View>

      {!active ? (
        <>
          {/* Today's sessions list */}
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
            {todaySessions.length > 0 && (
              <>
                <Text style={s.sectionTitle}>TODAY</Text>
                {todaySessions.map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={s.sessionCard}
                    onPress={() => navigation.push('SessionDetail', { session: item })}
                  >
                    <View style={s.sessionRow}>
                      <Text style={s.sessionName}>{item.exerciseName}</Text>
                      <Text style={s.sessionTime}>{formatTime(item.startTime)}</Text>
                    </View>
                    <View style={s.sessionRow}>
                      <Text style={s.sessionMeta}>{item.summary?.totalReps || 0} reps</Text>
                      <Text style={s.sessionMeta}>{(item.summary?.avgVelocity || 0).toFixed(2)} m/s avg</Text>
                      <Text style={s.sessionMeta}>{(item.summary?.peakVelocity || 0).toFixed(2)} m/s peak</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {todaySessions.length === 0 && (
              <View style={s.emptyWrap}>
                <Text style={s.emptyText}>No sessions today yet</Text>
              </View>
            )}
          </ScrollView>

          {/* Start button pinned to bottom */}
          <TouchableOpacity style={s.startBtn} onPress={startSession}>
            <Text style={s.startBtnText}>START SESSION</Text>
          </TouchableOpacity>
        </>
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
                <Text style={[s.vel, { color: vc(r.avgVelocity) }]}>
                  {parseFloat(r.avgVelocity).toFixed(2)} m/s
                </Text>
                <Text style={s.phase}>↑{r.concentricDuration}ms ↓{r.eccentricDuration}ms</Text>
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
  wsbadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  wsdot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00ff88', marginRight: 6 },
  wstext: { color: '#00ff88', fontSize: 12 },
  scroll: { flex: 1 },
  sectionTitle: { color: '#555', fontSize: 10, letterSpacing: 3, marginBottom: 12 },
  sessionCard: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 10 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sessionName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sessionTime: { color: '#555', fontSize: 12 },
  sessionMeta: { color: '#888', fontSize: 12 },
  emptyWrap: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#333', fontSize: 14 },
  startBtn: { backgroundColor: '#00ff88', padding: 20, borderRadius: 14, alignItems: 'center', marginTop: 16 },
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
  phase: { color: '#888', fontSize: 11, flex: 1, textAlign: 'right' },
  finishBtn: { backgroundColor: '#ff6b6b', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  finishBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 },
});