import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const UsuariosScreen = ({ navigation }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/consulta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const responseBody = await response.json();

      if (response.ok && responseBody.success) {
        if (Array.isArray(responseBody.data)) {
          setUsuarios(responseBody.data);
        } else {
          Alert.alert('Error', 'Formato incorrecto.');
        }
      } else {
        Alert.alert('Error', responseBody.message || 'No se pudieron obtener usuarios.');
      }
    } catch (error) {
      Alert.alert('Error', 'Problema al obtener usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUsuario = async (userId, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;

      const response = await fetch(`${API_URL}/toggle-usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, estado: nuevoEstado }),
      });

      const responseBody = await response.json();

      if (response.ok && responseBody.success) {
        Alert.alert('Éxito', responseBody.message);
        fetchUsuarios();
      } else {
        Alert.alert('Error', responseBody.message || 'No se pudo actualizar.');
      }
    } catch (error) {
      Alert.alert('Error', 'Problema al actualizar.');
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUsuarios);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const activo = item.estado_id === 1;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.email}>{item.email}</Text>

          <Text style={[
            styles.estado,
            { color: activo ? '#4CAF50' : '#E53935' }
          ]}>
            {activo ? 'Activo' : 'Inactivo'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.boton,
            { backgroundColor: activo ? '#E53935' : '#4CAF50' }
          ]}
          onPress={() => toggleUsuario(item.id, item.estado_id)}
        >
          <Text style={styles.botonText}>
            {activo ? 'Desactivar' : 'Activar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Usuarios</Text>
      <Text style={styles.subtitle}>Gestiona los usuarios del sistema</Text>

      {loading ? (
        <Text style={styles.loading}>Cargando usuarios...</Text>
      ) : (
        <FlatList
          data={usuarios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 20,
  },

  loading: {
    textAlign: 'center',
    color: '#7A7A7A',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  nombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  email: {
    fontSize: 13,
    color: '#7A7A7A',
    marginBottom: 5,
  },

  estado: {
    fontSize: 13,
    fontWeight: '600',
  },

  boton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  botonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UsuariosScreen;