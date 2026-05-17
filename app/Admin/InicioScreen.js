import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Regular/Herramientas/theme';
import { showAlert } from '../Regular/Herramientas/Toast';
import { showConfirm } from '../Regular/Herramientas/confirm';

import { getApiUrl } from '../Regular/Herramientas/apiConfig';
const API_URL = getApiUrl();

const ROL_LABELS = {
  ROL_ADMIN: 'Administrador',
  ROL_REG: 'Regular',
};

const InicioScreen = ({ navigation }) => {
  const colors = useTheme();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const filtrados = search.trim()
    ? usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()))
    : usuarios;

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/consulta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await res.json();
      if (res.ok && body.success && Array.isArray(body.data)) {
        setUsuarios(body.data);
      } else {
        showAlert('Error', body.message || 'No se pudieron obtener usuarios.', 'error');
      }
    } catch {
      showAlert('Error', 'Problema al obtener usuarios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cambiarRol = async (userId, rolActual) => {
    const nuevoRol = rolActual === 'ROL_ADMIN' ? 'ROL_REG' : 'ROL_ADMIN';
    const nuevoLabel = ROL_LABELS[nuevoRol];
    const ok = await showConfirm('Cambiar rol', `¿Cambiar este usuario a ${nuevoLabel}?`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/cambiar-rol`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rol: nuevoRol }),
      });
      const body = await res.json();
      if (res.ok && body.success) {
        showAlert('Éxito', body.message, 'success');
        fetchUsuarios();
      } else {
        showAlert('Error', body.message || 'No se pudo actualizar el rol.', 'error');
      }
    } catch {
      showAlert('Error', 'Problema al actualizar el rol.', 'error');
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);
  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchUsuarios);
    return unsub;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const esAdmin = item.rol === 'ROL_ADMIN';
    const activo = item.estado_id === 1;
    const rolColor = esAdmin ? colors.primary : '#2ECC71';

    return (
      <View style={[styles.card, { backgroundColor: colors.card, opacity: activo ? 1 : 0.5 }]}>
        <View style={[styles.avatar, { backgroundColor: activo ? colors.primary : colors.textSecondary }]}>
          <Text style={styles.avatarLetter}>{(item.nombre || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.nombre, { color: colors.text }]}>{item.nombre}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: rolColor + '22' }]}>
              <Text style={[styles.badgeText, { color: rolColor }]}>{ROL_LABELS[item.rol] || item.rol}</Text>
            </View>
            {!activo && (
              <View style={[styles.badge, { backgroundColor: '#E74C3C22' }]}>
                <Text style={[styles.badgeText, { color: '#E74C3C' }]}>Inactivo</Text>
              </View>
            )}
          </View>
        </View>
        {activo ? (
          <TouchableOpacity
            style={[styles.boton, { backgroundColor: esAdmin ? '#2ECC71' : colors.primary }]}
            onPress={() => cambiarRol(item.id, item.rol)}
          >
            <Ionicons name={esAdmin ? 'person-outline' : 'shield-outline'} size={15} color="#fff" />
            <Text style={styles.botonText}>{esAdmin ? 'Regular' : 'Admin'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.boton, { backgroundColor: colors.border }]}>
            <Ionicons name="ban-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.botonText, { color: colors.textSecondary }]}>Inactivo</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Ionicons name="shield-checkmark-outline" size={40} color={colors.headerText} />
        <Text style={[styles.title, { color: colors.headerText }]}>Gestionar Roles</Text>
        <Text style={[styles.subtitle, { color: colors.headerText + 'CC' }]}>
          Cambia el rol de los usuarios
        </Text>
      </View>

      {!loading && usuarios.length > 0 && (
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          {[
            { label: 'Total', value: usuarios.length, color: colors.primary },
            { label: 'Activos', value: usuarios.filter(u => u.estado_id === 1).length, color: '#2ECC71' },
            { label: 'Admins', value: usuarios.filter(u => u.rol === 'ROL_ADMIN').length, color: '#F39C12' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar por nombre o email..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <Text style={[styles.loading, { color: colors.textSecondary }]}>Cargando usuarios...</Text>
      ) : filtrados.length === 0 ? (
        <Text style={[styles.loading, { color: colors.textSecondary }]}>
          {search.trim() ? 'Sin resultados.' : 'No hay usuarios registrados.'}
        </Text>
      ) : (
        <FlatList
          data={filtrados}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 130 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 40, paddingBottom: 24, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  subtitle: { fontSize: 13, marginTop: 4 },
  loading: { textAlign: 'center', marginTop: 40, fontSize: 14 },

  card: {
    borderRadius: 14, padding: 14, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarLetter: { color: '#fff', fontSize: 20, fontWeight: '700' },
  nombre: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  email: { fontSize: 12, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  boton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10,
  },
  botonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: 16, marginTop: 14, borderRadius: 14, paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 10, marginBottom: 4,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
});

export default InicioScreen;
