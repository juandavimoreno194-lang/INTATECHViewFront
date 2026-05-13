import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useUser } from '../Herramientas/UserContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const MisNotasScreen = ({ navigation }) => {
  const { user } = useUser();
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
          Alert.alert('Error', 'No se pudieron cargar las notas');
        }
      } catch (error) {
        Alert.alert('Error', 'Problema al cargar notas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotas();
  }, [user.id]);

  const deleteNota = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notas/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotas(notas.filter(nota => nota.id !== id));
        Alert.alert('Éxito', 'Nota eliminada');
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  const renderNota = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.notaText}>{item.descripcion}</Text>
      <Text style={styles.fechaText}>
        {new Date(item.fecha).toLocaleDateString()}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNota(item.id)}
      >
        <Text style={styles.deleteText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Mis Notas</Text>
      <Text style={styles.subtitle}>
        Consulta y administra tus notas guardadas
      </Text>

      {isLoading ? (
        <Text style={styles.infoText}>Cargando notas...</Text>
      ) : notas.length === 0 ? (
        <Text style={styles.infoText}>No tienes notas registradas</Text>
      ) : (
        <FlatList
          data={notas}
          renderItem={renderNota}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}

      {/* Botón volver */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryText}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 25,
  },

  infoText: {
    textAlign: 'center',
    color: '#7A7A7A',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  notaText: {
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 5,
  },

  fechaText: {
    fontSize: 12,
    color: '#7A7A7A',
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  secondaryButton: {
    alignItems: 'center',
    marginTop: 15,
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MisNotasScreen;