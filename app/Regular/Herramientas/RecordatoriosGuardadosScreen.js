import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useUser } from '../Herramientas/UserContext';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RecordatoriosGuardadosScreen = ({ navigation }) => {
  const { user } = useUser();
  const [recordatorios, setRecordatorios] = useState([]);

  useEffect(() => {
    if (user) fetchRecordatorios();
  }, [user]);

  const fetchRecordatorios = async () => {
    try {
      const response = await fetch(`${API_URL}/recordatorios/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setRecordatorios(data);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los recordatorios');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/recordatorios/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Eliminado', 'Recordatorio eliminado');
        fetchRecordatorios();
      }
    } catch {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>

      <View style={styles.row}>
        <Ionicons name="notifications-outline" size={20} color="#4A90E2" />
        <Text style={styles.title}>{item.titulo}</Text>
      </View>

      <Text style={styles.info}>📅 {item.fecha}</Text>
      <Text style={styles.info}>⏰ {item.hora}</Text>

      <TouchableOpacity
        style={styles.delete}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>

    </View>
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>No hay usuario</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recordatorios</Text>
      </View>

      {recordatorios.length === 0 ? (
        <Text style={styles.empty}>
          No tienes recordatorios guardados
        </Text>
      ) : (
        <FlatList
          data={recordatorios}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      {/* Botón volver */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#4A90E2',
    paddingVertical: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  title: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  info: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 3,
  },

  delete: {
    marginTop: 10,
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  empty: {
    textAlign: 'center',
    marginTop: 30,
    color: '#7A7A7A',
  },

  button: {
    backgroundColor: '#4A90E2',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RecordatoriosGuardadosScreen;