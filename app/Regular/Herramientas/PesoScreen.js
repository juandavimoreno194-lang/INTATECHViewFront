import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PesoScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [pesoData, setPesoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPesoData = async () => {
      try {
        const response = await fetch(`${API_URL}/peso/${userId}`);
        const data = await response.json();
        setPesoData(data);
      } catch (error) {
        console.error('Error fetching peso data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPesoData();
  }, [userId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Registro de Peso</Text>
      <Text style={styles.subtitle}>
        Consulta tu historial de peso corporal
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : pesoData.length === 0 ? (
        <Text style={styles.infoText}>No hay registros disponibles</Text>
      ) : (
        <FlatList
          data={pesoData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.itemText}>Fecha: {item.fecha}</Text>
              <Text style={styles.itemText}>Peso: {item.peso_kg} kg</Text>
            </View>
          )}
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

  itemText: {
    fontSize: 16,
    color: '#1E1E1E',
    marginBottom: 5,
  },

  secondaryButton: {
    alignItems: 'center',
    marginTop: 10,
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PesoScreen;