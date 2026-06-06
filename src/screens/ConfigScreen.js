import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULTS = {
  gyroMotion: 55.0,
  gyroStatic: 18.0,
  accelMotion: 16.0,
  minConc: 250,
  debounce: 800,
  staticConfirm: 250,
};

const PARAMS = [
  { key: 'gyroMotion',    label: 'Gyro motion threshold',   unit: '°/s',  min: 20,  max: 200, step: 1  },
  { key: 'gyroStatic',    label: 'Gyro static threshold',   unit: '°/s',  min: 5,   max: 50,  step: 1  },
  { key: 'accelMotion',   label: 'Accel motion threshold',  unit: 'm/s²', min: 10,  max: 30,  step: 0.5},
  { key: 'minConc',       label: 'Min concentric duration', unit: 'ms',   min: 100, max: 1000,step: 50 },
  { key: 'debounce',      label: 'Rep debounce',            unit: 'ms',   min: 200, max: 2000,step: 50 },
  { key: 'staticConfirm', label: 'Static confirm duration', unit: 'ms',   min: 100, max: 1000,step: 50 },
];

export default function ConfigScreen({ wsRef }) {
  const [cfg, setCfg] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('vbt_config').then(v => {
      if (v) setCfg(JSON.parse(v));
    });
  }, []);

  const update = (key, delta) => {
    const param = PARAMS.find(p => p.key === key);
    setCfg(prev => {
      const val = Math.min(param.max, Math.max(param.min,
        parseFloat((prev[key] + delta).toFixed(2))
      ));
      return { ...prev, [key]: val };
    });
    setSaved(false);
  };

  const apply = async () => {
    await AsyncStorage.setItem('vbt_config', JSON.stringify(cfg));
    if (wsRef?.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ cmd: 'config', ...cfg }));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const reset = async () => {
    setCfg(DEFAULTS);
    await AsyncStorage.setItem('vbt_config', JSON.stringify(DEFAULTS));
    setSaved(false);
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.title}>Sensor Config</Text>
      <Text style={s.sub}>Tune rep detection parameters</Text>

      {PARAMS.map(p => (
        <View key={p.key} style={s.row}>
          <View style={s.rowLeft}>
            <Text style={s.label}>{p.label}</Text>
            <Text style={s.unit}>{p.unit}</Text>
          </View>
          <View style={s.controls}>
            <TouchableOpacity style={s.btn} onPress={() => update(p.key, -p.step)}>
              <Text style={s.btnText}>−</Text>
            </TouchableOpacity>
            <Text style={s.val}>{cfg[p.key]}</Text>
            <TouchableOpacity style={s.btn} onPress={() => update(p.key, p.step)}>
              <Text style={s.btnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={s.codeBox}>
        <Text style={s.codeTitle}>Generated .ino config</Text>
        <Text style={s.code}>
          {`#define GYRO_MOTION_THRESHOLD  ${cfg.gyroMotion.toFixed(1)}f\n`}
          {`#define GYRO_STATIC_THRESHOLD  ${cfg.gyroStatic.toFixed(1)}f\n`}
          {`#define ACCEL_MOTION_THRESHOLD ${cfg.accelMotion.toFixed(1)}f\n`}
          {`#define MIN_CONCENTRIC_MS      ${cfg.minConc}\n`}
          {`#define REP_DEBOUNCE_MS        ${cfg.debounce}\n`}
          {`#define STATIC_CONFIRM_MS      ${cfg.staticConfirm}`}
        </Text>
      </View>

      <View style={s.btnRow}>
        <TouchableOpacity style={s.applyBtn} onPress={apply}>
          <Text style={s.applyText}>{saved ? 'APPLIED ✓' : 'APPLY TO SENSOR'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.resetBtn} onPress={reset}>
          <Text style={s.resetText}>RESET</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  sub: { color: '#555', fontSize: 13, marginBottom: 24, letterSpacing: 1 },
  row: { backgroundColor: '#1a1a1a', borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flex: 1 },
  label: { color: '#fff', fontSize: 13, fontWeight: '600' },
  unit: { color: '#555', fontSize: 11, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: { backgroundColor: '#2a2a2a', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#00ff88', fontSize: 20, fontWeight: '700', lineHeight: 22 },
  val: { color: '#00ff88', fontSize: 16, fontWeight: '900', minWidth: 52, textAlign: 'center' },
  codeBox: { backgroundColor: '#111', borderRadius: 10, padding: 16, marginTop: 16, marginBottom: 16 },
  codeTitle: { color: '#555', fontSize: 10, letterSpacing: 2, marginBottom: 10 },
  code: { color: '#00ff88', fontFamily: 'monospace', fontSize: 11, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 10 },
  applyBtn: { flex: 2, backgroundColor: '#00ff88', padding: 16, borderRadius: 10, alignItems: 'center' },
  applyText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  resetBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 16, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  resetText: { color: '#555', fontWeight: '700', fontSize: 14 },
});