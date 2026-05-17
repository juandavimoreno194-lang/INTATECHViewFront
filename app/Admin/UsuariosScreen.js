import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../Regular/Herramientas/theme';
import { showAlert } from '../Regular/Herramientas/Toast';
import { showConfirm } from '../Regular/Herramientas/confirm';
import { Ionicons } from '@expo/vector-icons';

import { getApiUrl } from '../Regular/Herramientas/apiConfig';
const API_URL = getApiUrl();

const UsuariosScreen = ({ navigation }) => {
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
      const response = await fetch(`${API_URL}/consulta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const responseBody = await response.json();
      if (response.ok && responseBody.success && Array.isArray(responseBody.data)) {
        setUsuarios(responseBody.data);
      } else {
        showAlert('Error', responseBody.message || 'No se pudieron obtener usuarios.', 'error');
      }
    } catch {
      showAlert('Error', 'Problema al obtener usuarios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUsuario = async (userId, estadoActual) => {
    const accion = estadoActual === 1 ? 'desactivar' : 'activar';
    const ok = await showConfirm('Confirmar', `¿Deseas ${accion} este usuario?`);
    if (!ok) return;

    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      const response = await fetch(`${API_URL}/toggle-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, estado: nuevoEstado }),
      });
      const responseBody = await response.json();
      if (response.ok && responseBody.success) {
        showAlert('Éxito', responseBody.message, 'success');
        fetchUsuarios();
      } else {
        showAlert('Error', responseBody.message || 'No se pudo actualizar.', 'error');
      }
    } catch {
      showAlert('Error', 'Problema al actualizar.', 'error');
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUsuarios);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const activo = item.estado_id === 1;
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarLetter}>{(item.nombre || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.nombre, { color: colors.text }]}>{item.nombre}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{item.email}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: (activo ? '#2ECC71' : '#E74C3C') + '22' }]}>
              <Text style={[styles.badgeText, { color: activo ? '#2ECC71' : '#E74C3C' }]}>
                {activo ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>{item.rol}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.boton, { backgroundColor: activo ? '#E74C3C' : '#2ECC71' }]}
          onPress={() => toggleUsuario(item.id, item.estado_id)}
        >
          <Ionicons name={activo ? 'close-circle-outline' : 'checkmark-circle-outline'} size={16} color="#fff" />
          <Text style={styles.botonText}>{activo ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Ionicons name="people-outline" size={40} color={colors.headerText} />
        <Text style={[styles.title, { color: colors.headerText }]}>Usuarios</Text>
        <Text style={[styles.subtitle, { color: colors.headerText + 'CC' }]}>Gestión de usuarios del sistema</Text>
      </View>

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

      {search.trim() ? (
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
        </Text>
      ) : null}

      {loading ? (
        <Text style={[styles.loading, { color: colors.textSecondary }]}>Cargando usuarios...</Text>
      ) : filtrados.length === 0 ? (
        <Text style={[styles.loading, { color: colors.textSecondary }]}>
          {search.trim() ? 'Sin resultados para esa búsqueda.' : 'No hay usuarios registrados.'}
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
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  boton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10,
  },
  botonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 14, marginBottom: 4,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  resultCount: { fontSize: 12, marginLeft: 20, marginBottom: 4 },
});

export default UsuariosScreen;
