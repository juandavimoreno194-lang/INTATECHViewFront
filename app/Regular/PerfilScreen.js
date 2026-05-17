import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useUser } from './Herramientas/UserContext';
import { useTheme } from './Herramientas/theme';
import { Ionicons } from '@expo/vector-icons';

import { getApiUrl } from './Herramientas/apiConfig';
const API_URL = getApiUrl();

const obtenerUrlImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('data:')) return ruta;
  const base = API_URL.replace(/\/$/, '');
  const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
  return `${base}${path}?t=${Date.now()}`;
};

const FIELD_ICONS = {
  genero:      'male-female-outline',
  edad:        'calendar-outline',
  tipo_sangre: 'water-outline',
};

const PerfilScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [perfilData, setPerfilData] = useState(null);

  const fetchPerfilData = async () => {
    try {
      const response = await fetch(`${API_URL}/datos/${user.id}`);
      const data = await response.json();
      if (response.ok) setPerfilData(data.data || null);
    } catch {}
  };

  useEffect(() => { if (user?.id) fetchPerfilData(); }, [user]);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPerfilData);
    return unsubscribe;
  }, [navigation]);

  const handleEdit = () => navigation.navigate('EditarPerfilScreen2', { userId: user.id, perfilData });

  const nombre = perfilData?.nombre || user?.nombre || 'Usuario';
  const inicial = nombre[0].toUpperCase();
  const fotoUrl = perfilData?.foto ? obtenerUrlImagen(perfilData.foto) : null;

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── HEADER ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.photoArea}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.profileImage} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarLetter}>{inicial}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.nombre, { color: colors.headerText }]}>{nombre}</Text>
        <View style={[styles.rolBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
          <Ionicons name="person-outline" size={12} color={colors.headerText} />
          <Text style={[styles.rolText, { color: colors.headerText }]}>Usuario Regular</Text>
        </View>
      </View>

      {/* ── STATS: altura y peso ── */}
      {perfilData && (
        <View style={styles.statsRow}>
          <StatCard
            icon="resize-outline"
            label="Altura"
            value={perfilData.altura ? `${perfilData.altura} m` : '—'}
            colors={colors}
          />
          <StatCard
            icon="barbell-outline"
            label="Peso"
            value={perfilData.peso ? `${perfilData.peso} kg` : '—'}
            colors={colors}
          />
          <StatCard
            icon="water-outline"
            label="Sangre"
            value={perfilData.tipo_sangre || '—'}
            colors={colors}
          />
        </View>
      )}

      {/* ── INFO PERSONAL ── */}
      <View style={styles.sectionHeader}>
        <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INFORMACIÓN PERSONAL</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {perfilData ? (
          <>
            <InfoRow icon="male-female-outline" label="Género"       value={perfilData.genero}                          colors={colors} />
            <InfoRow icon="calendar-outline"    label="Edad"         value={perfilData.edad ? `${perfilData.edad} años` : null} colors={colors} />
            <InfoRow icon="water-outline"       label="Tipo de sangre" value={perfilData.tipo_sangre}                   colors={colors} last />
          </>
        ) : (
          <View style={styles.noDataBox}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
              Aún no tienes información registrada
            </Text>
          </View>
        )}
      </View>

      {/* ── BOTÓN EDITAR ── */}
      <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.primary }]} onPress={handleEdit}>
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editBtnText}>{perfilData ? 'Editar perfil' : 'Crear perfil'}</Text>
      </TouchableOpacity>

    </ScrollView>
    </View>
  );
};

const StatCard = ({ icon, label, value, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.card }]}>
    <View style={[styles.statIconBg, { backgroundColor: colors.primary + '18' }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const InfoRow = ({ icon, label, value, colors, last }) => (
  <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
    <View style={[styles.infoIconBg, { backgroundColor: colors.primary + '18' }]}>
      <Ionicons name={icon} size={17} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value || 'Sin datos'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 50 },

  header: {
    alignItems: 'center', paddingTop: 44, paddingBottom: 32,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  photoArea: { marginBottom: 14 },
  profileImage: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)',
  },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarLetter: { color: '#fff', fontSize: 40, fontWeight: '700' },
  nombre: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  rolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  rolText: { fontSize: 12, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20, gap: 10,
  },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  statIconBg: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 11 },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginTop: 22, marginBottom: 8,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  card: {
    marginHorizontal: 16, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  infoIconBg: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  infoLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 3 },
  infoValue: { fontSize: 15, fontWeight: '600' },

  noDataBox: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  noDataText: { fontSize: 14, textAlign: 'center' },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default PerfilScreen;
