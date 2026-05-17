import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import { showAlert } from './Toast';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#00CEC9";

const ConsejosScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [consejo, setConsejo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [count, setCount] = useState(0);

  const obtenerConsejo = useCallback(async () => {
    if (!user?.id) return;
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/consejo?usuario_id=${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setConsejo(data);
        setCount(c => c + 1);
      } else {
        showAlert('Error', data.message || 'No se pudo obtener el consejo.', 'error');
      }
    } catch {
      showAlert('Error', 'Hubo un problema al obtener el consejo.', 'error');
    } finally {
      setCargando(false);
    }
  }, [user]);

  useEffect(() => { obtenerConsejo(); }, [obtenerConsejo]);

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="bulb-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Consejo del Día</Text>
        <Text style={styles.headerSub}>Toca la tarjeta para ver otro consejo</Text>
      </View>

      {/* CONTADOR */}
      {count > 1 && (
        <View style={styles.countRow}>
          <View style={[styles.countChip, { backgroundColor: HEADER_COLOR + '22' }]}>
            <Ionicons name="refresh-outline" size={13} color={HEADER_COLOR} />
            <Text style={[styles.countChipText, { color: HEADER_COLOR }]}>{count} consejos vistos</Text>
          </View>
        </View>
      )}

      {/* TARJETA DE CONSEJO */}
      <TouchableOpacity
        style={[styles.consejoCard, { backgroundColor: colors.card, borderColor: HEADER_COLOR }]}
        onPress={obtenerConsejo}
        disabled={cargando}
        activeOpacity={0.85}
      >
        {cargando ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={HEADER_COLOR} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Buscando consejo...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.quoteIcon, { backgroundColor: HEADER_COLOR + '18' }]}>
              <Ionicons name="quote" size={24} color={HEADER_COLOR} />
            </View>
            <Text style={[styles.consejoText, { color: colors.text }]}>
              {consejo?.consejo || 'Toca para obtener tu primer consejo'}
            </Text>
            <View style={styles.tapHintRow}>
              <Ionicons name="refresh-circle-outline" size={18} color={HEADER_COLOR} />
              <Text style={[styles.tapHint, { color: HEADER_COLOR }]}>Toca para otro consejo</Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* TIPS */}
      <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.tipsTitle, { color: colors.textSecondary }]}>¿SABÍAS QUE...?</Text>
        <View style={styles.tipRow}>
          <Ionicons name="leaf-outline" size={16} color={HEADER_COLOR} />
          <Text style={[styles.tipText, { color: colors.text }]}>Los consejos están personalizados según tu perfil de salud.</Text>
        </View>
        <View style={styles.tipRow}>
          <Ionicons name="heart-outline" size={16} color={HEADER_COLOR} />
          <Text style={[styles.tipText, { color: colors.text }]}>Puedes consultar nuevos consejos cada vez que los necesites.</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.btnRefresh, { backgroundColor: HEADER_COLOR }]} onPress={obtenerConsejo} disabled={cargando}>
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.btnRefreshText}>Nuevo consejo</Text>
      </TouchableOpacity>

    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },

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
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  countRow: { alignItems: 'center', marginTop: 16 },
  countChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  countChipText: { fontSize: 12, fontWeight: '600' },

  consejoCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 22, padding: 24,
    borderWidth: 2, minHeight: 200, justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5,
  },
  loadingBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 13 },
  quoteIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  consejoText: { fontSize: 17, lineHeight: 26, fontWeight: '500', marginBottom: 20 },
  tapHintRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tapHint: { fontSize: 12, fontWeight: '600' },

  tipsCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  tipsTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },

  btnRefresh: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  btnRefreshText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ConsejosScreen;
