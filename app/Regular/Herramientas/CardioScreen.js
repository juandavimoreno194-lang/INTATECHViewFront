import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import { Ionicons } from '@expo/vector-icons';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#D63031";

function clasificarBPM(bpm) {
  if (!bpm)       return { label: 'Sin datos',          color: '#95A5A6', icon: 'help-circle' };
  if (bpm < 40)   return { label: 'Bradicardia severa', color: '#C0392B', icon: 'arrow-down-circle' };
  if (bpm < 60)   return { label: 'Bradicardia',        color: '#E67E22', icon: 'arrow-down-circle' };
  if (bpm <= 100) return { label: 'Normal',             color: '#2ECC71', icon: 'checkmark-circle' };
  if (bpm <= 120) return { label: 'Taquicardia leve',   color: '#F39C12', icon: 'alert-circle' };
  if (bpm <= 150) return { label: 'Taquicardia',        color: '#E74C3C', icon: 'warning' };
  return           { label: 'Taquicardia severa',       color: '#C0392B', icon: 'close-circle' };
}

const RANGOS = [
  { label: 'Bradicardia severa', rango: '< 40 lpm',      color: '#C0392B' },
  { label: 'Bradicardia',        rango: '40 – 59 lpm',   color: '#E67E22' },
  { label: 'Normal',             rango: '60 – 100 lpm',  color: '#2ECC71' },
  { label: 'Taquicardia leve',   rango: '101 – 120 lpm', color: '#F39C12' },
  { label: 'Taquicardia',        rango: '121 – 150 lpm', color: '#E74C3C' },
  { label: 'Taquicardia severa', rango: '> 150 lpm',     color: '#C0392B' },
];

const CardioScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  const latido = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim,   { toValue: 1.3,  duration: 300, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(opacityAnim, { toValue: 1,    duration: 300, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim,   { toValue: 1,    duration: 400, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(opacityAnim, { toValue: 0.7,  duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ])
    ).start();
  };

  const enviarUsuarioActivo = async () => {
    if (!user?.id) return;
    try {
      await fetch(`${API_URL}/usuario-activo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id }),
      });
    } catch {}
  };

  const fetchCardio = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_URL}/cardio?usuario_id=${user.id}`);
      const result = await res.json();
      if (result?.bpm) setData(result);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    latido();
    enviarUsuarioActivo();
    fetchCardio();
    const interval = setInterval(fetchCardio, 1000);
    return () => clearInterval(interval);
  }, []);

  const cls = clasificarBPM(data?.bpm);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={HEADER_COLOR} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Conectando con el sensor...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="heart-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Monitor Cardíaco</Text>
        <Text style={styles.headerSub}>Frecuencia en tiempo real</Text>

        {/* Live chip */}
        <View style={styles.liveChip}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      </View>

      {/* ── BPM PRINCIPAL ── */}
      <View style={[styles.bpmCard, { backgroundColor: colors.card }]}>

        {/* Corazón animado */}
        <Animated.View style={[
          styles.heartBg,
          { backgroundColor: cls.color + '18', transform: [{ scale: scaleAnim }], opacity: opacityAnim }
        ]}>
          <Ionicons name="heart" size={96} color={cls.color} />
        </Animated.View>

        {/* Valor BPM */}
        <Text style={[styles.bpmValue, { color: cls.color }]}>
          {data ? data.bpm : '--'}
        </Text>
        <Text style={[styles.bpmUnit, { color: colors.textSecondary }]}>latidos por minuto</Text>

        {/* Badge de clasificación */}
        <View style={[styles.clsBadge, { backgroundColor: cls.color + '20' }]}>
          <Ionicons name={cls.icon} size={16} color={cls.color} />
          <Text style={[styles.clsText, { color: cls.color }]}>{cls.label}</Text>
        </View>

        {/* Riesgo cardiovascular */}
        {data?.riesgo_cardiovascular && (
          <View style={[styles.riesgoBadge, { backgroundColor: colors.background }]}>
            <Ionicons name="shield-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.riesgoText, { color: colors.textSecondary }]}>
              Riesgo cardiovascular: <Text style={{ fontWeight: '700', color: colors.text }}>{data.riesgo_cardiovascular}</Text>
            </Text>
          </View>
        )}

        {/* Indicador live */}
        <View style={[styles.liveRow, { borderTopColor: colors.border }]}>
          <Ionicons name="pulse-outline" size={15} color={HEADER_COLOR} />
          <Text style={[styles.liveRowText, { color: colors.textSecondary }]}>Actualización automática cada segundo</Text>
        </View>
      </View>

      {/* ── ESTADÍSTICAS RÁPIDAS ── */}
      {data && (
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <Ionicons name="time-outline" size={20} color={HEADER_COLOR} />
            <Text style={[styles.statVal, { color: colors.text }]}>{data.bpm}</Text>
            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>BPM actual</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <Ionicons name="fitness-outline" size={20} color={HEADER_COLOR} />
            <Text style={[styles.statVal, { color: colors.text }]}>
              {data.bpm >= 60 && data.bpm <= 100 ? '✓' : '⚠'}
            </Text>
            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Estado</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <Ionicons name="heart-half-outline" size={20} color={HEADER_COLOR} />
            <Text style={[styles.statVal, { color: colors.text }]}>60-100</Text>
            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Rango normal</Text>
          </View>
        </View>
      )}

      {/* ── RANGOS DE REFERENCIA ── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="list-outline" size={16} color={HEADER_COLOR} />
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RANGOS DE REFERENCIA</Text>
      </View>

      <View style={[styles.rangesCard, { backgroundColor: colors.card }]}>
        {RANGOS.map((r, i) => {
          const isActive = data?.bpm && clasificarBPM(data.bpm).label === r.label;
          return (
            <View
              key={i}
              style={[
                styles.rangeRow,
                i < RANGOS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                isActive && { backgroundColor: r.color + '12' },
              ]}
            >
              <View style={[styles.rangeDot, { backgroundColor: r.color }]} />
              <Text style={[styles.rangeLabel, { color: colors.text }, isActive && { fontWeight: '800' }]}>{r.label}</Text>
              <Text style={[styles.rangeVal, { color: colors.textSecondary }]}>{r.rango}</Text>
              {isActive && <Ionicons name="arrow-back" size={14} color={r.color} style={{ transform: [{ rotate: '180deg' }] }} />}
            </View>
          );
        })}
      </View>

    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: HEADER_COLOR, paddingTop: 50, paddingBottom: 30,
    alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  backArrow: { position: 'absolute', top: 50, left: 18, padding: 6 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 14 },
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },

  bpmCard: {
    marginHorizontal: 20, marginTop: 20, borderRadius: 24, padding: 28,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  heartBg: {
    width: 150, height: 150, borderRadius: 75,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  bpmValue: { fontSize: 72, fontWeight: '900', lineHeight: 78 },
  bpmUnit: { fontSize: 14, marginBottom: 16, marginTop: 4 },
  clsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 12,
  },
  clsText: { fontSize: 15, fontWeight: '700' },
  riesgoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginBottom: 10,
  },
  riesgoText: { fontSize: 13 },
  liveRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 16, paddingTop: 14, borderTopWidth: 1, width: '100%', justifyContent: 'center',
  },
  liveRowText: { fontSize: 12 },

  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 14, gap: 10 },
  statBox: {
    flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 16, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLbl: { fontSize: 10, textAlign: 'center' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 24, marginTop: 20, marginBottom: 8,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  rangesCard: {
    marginHorizontal: 20, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  rangeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 16, gap: 10,
  },
  rangeDot: { width: 10, height: 10, borderRadius: 5 },
  rangeLabel: { flex: 1, fontSize: 14 },
  rangeVal: { fontSize: 12 },
});

export default CardioScreen;
