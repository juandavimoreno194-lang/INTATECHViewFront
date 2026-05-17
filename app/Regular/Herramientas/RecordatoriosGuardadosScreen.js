import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import { showAlert } from './Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

let Notifications = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#FF6B6B";

const formatearFecha = (fecha) => {
  if (!fecha) return '';
  const str = fecha instanceof Date ? fecha.toISOString().slice(0, 10) : String(fecha).slice(0, 10);
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? str : date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatearHora = (hora) => {
  if (!hora) return '';
  const [h, m] = hora.split(':');
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
};

const RecordatoriosGuardadosScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [recordatorios, setRecordatorios] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchRecordatorios();
    }, [user])
  );

  const fetchRecordatorios = async () => {
    try {
      const response = await fetch(`${API_URL}/recordatorios/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecordatorios(data);
      }
    } catch {
      showAlert('Error', 'No se pudieron cargar los recordatorios', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/recordatorios/${id}`, { method: 'DELETE' });
      if (response.ok) {
        if (Notifications) try { await Notifications.cancelScheduledNotificationAsync(`REMINDER-${id}`); } catch {}
        const raw = await AsyncStorage.getItem('@recordatorios');
        const list = (raw && raw.trim()) ? JSON.parse(raw).filter(r => r.id !== id) : [];
        await AsyncStorage.setItem('@recordatorios', JSON.stringify(list));
        setRecordatorios(prev => prev.filter(r => r.id !== id));
        showAlert('Eliminado', 'Recordatorio eliminado correctamente', 'success');
      }
    } catch {
      showAlert('Error', 'No se pudo eliminar', 'error');
    }
  };

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No hay usuario</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="alarm-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Mis Recordatorios</Text>
        <Text style={styles.headerSub}>Tus citas y eventos programados</Text>
        {recordatorios.length > 0 && (
          <View style={styles.countChip}>
            <Ionicons name="list-outline" size={13} color="#fff" />
            <Text style={styles.countChipText}>{recordatorios.length} recordatorios</Text>
          </View>
        )}
      </View>

      {recordatorios.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="alarm-outline" size={52} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes recordatorios guardados</Text>
          <TouchableOpacity
            style={[styles.emptyAction, { backgroundColor: HEADER_COLOR }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="add-outline" size={18} color="#fff" />
            <Text style={styles.emptyActionText}>Crear recordatorio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recordatorios.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.cardTop, { borderBottomColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: HEADER_COLOR + '18' }]}>
                <Ionicons name="notifications-outline" size={22} color={HEADER_COLOR} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.titleText, { color: colors.text }]}>{item.titulo}</Text>
              </View>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <View style={[styles.infoChip, { backgroundColor: colors.background }]}>
                  <Ionicons name="calendar-outline" size={14} color={HEADER_COLOR} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{formatearFecha(item.fecha)}</Text>
                </View>
                <View style={[styles.infoChip, { backgroundColor: colors.background }]}>
                  <Ionicons name="time-outline" size={14} color={HEADER_COLOR} />
                  <Text style={[styles.infoText, { color: colors.text }]}>{formatearHora(item.hora)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={15} color="#E74C3C" />
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={[styles.backBtn, { borderColor: HEADER_COLOR }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={18} color={HEADER_COLOR} />
        <Text style={[styles.backBtnText, { color: HEADER_COLOR }]}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },
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
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  countChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  countChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  emptyAction: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14,
  },
  emptyActionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  card: {
    marginHorizontal: 20, marginTop: 14, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  titleText: { fontSize: 16, fontWeight: '700' },
  cardBody: { paddingHorizontal: 16, paddingTop: 12 },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12,
  },
  infoText: { fontSize: 13, fontWeight: '600' },
  cardFooter: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 10 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: '#E74C3C',
  },
  deleteText: { fontSize: 13, fontWeight: '700', color: '#E74C3C' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 16, borderWidth: 1.5,
  },
  backBtnText: { fontSize: 15, fontWeight: '700' },
});

export default RecordatoriosGuardadosScreen;
