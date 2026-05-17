import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import { showAlert } from './Toast';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#00B894";

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const MisNotasScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [notas, setNotas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const response = await fetch(`${API_URL}/notas/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setNotas(data);
        } else {
          showAlert('Error', 'No se pudieron cargar las notas', 'error');
        }
      } catch {
        showAlert('Error', 'Problema al cargar notas', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotas();
  }, [user.id]);

  const deleteNota = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotas(notas.filter(nota => nota.id !== id));
        showAlert('Éxito', 'Nota eliminada correctamente', 'success');
      } else {
        throw new Error();
      }
    } catch {
      showAlert('Error', 'No se pudo eliminar', 'error');
    }
  };

  const wordCount = (text) => text?.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="documents-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Mis Notas</Text>
        <Text style={styles.headerSub}>Consulta y administra tus apuntes</Text>
        {notas.length > 0 && (
          <View style={styles.countChip}>
            <Ionicons name="list-outline" size={13} color="#fff" />
            <Text style={styles.countChipText}>{notas.length} notas</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.emptyBox}>
          <Ionicons name="hourglass-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Cargando notas...</Text>
        </View>
      ) : notas.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="document-outline" size={52} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tienes notas guardadas</Text>
          <TouchableOpacity
            style={[styles.emptyAction, { backgroundColor: HEADER_COLOR }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="add-outline" size={18} color="#fff" />
            <Text style={styles.emptyActionText}>Crear primera nota</Text>
          </TouchableOpacity>
        </View>
      ) : (
        notas.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.cardTop, { borderBottomColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: HEADER_COLOR + '18' }]}>
                <Ionicons name="document-text-outline" size={20} color={HEADER_COLOR} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.metaRow}>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatearFecha(item.fecha)}</Text>
                  </View>
                  <View style={[styles.wordBadge, { backgroundColor: HEADER_COLOR + '18' }]}>
                    <Text style={[styles.wordBadgeText, { color: HEADER_COLOR }]}>{wordCount(item.descripcion)} palabras</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.notaText, { color: colors.text }]}>{item.descripcion}</Text>
            </View>
            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNota(item.id)}>
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
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 12 },
  wordBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  wordBadgeText: { fontSize: 11, fontWeight: '600' },
  cardBody: { padding: 16 },
  notaText: { fontSize: 15, lineHeight: 22 },
  cardFooter: { paddingHorizontal: 16, paddingBottom: 12 },
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

export default MisNotasScreen;
