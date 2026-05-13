import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useUser } from '../Herramientas/UserContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ConsejosScreen = ({ navigation }) => {
  const { user } = useUser();
  const [consejo, setConsejo] = useState(null);

  useEffect(() => {
    const obtenerConsejo = async () => {
      try {
        const response = await fetch(`${API_URL}/consejo?usuario_id=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setConsejo(data);
        } else {
          const data = await response.json();
          Alert.alert('Error', data.message || 'No se pudo obtener el consejo.');
        }
      } catch (error) {
        Alert.alert('Error', 'Hubo un problema al obtener el consejo.');
      }
    };

    if (user && user.id) {
      obtenerConsejo();
    }
  }, [user]);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Consejo del Día</Text>
      <Text style={styles.subtitle}>
        Recomendación personalizada para tu salud
      </Text>

      {/* Card */}
      <View style={styles.card}>
        {!consejo ? (
          <Text style={styles.loadingText}>Cargando consejo...</Text>
        ) : (
          <Text style={styles.consejoText}>
            {consejo.consejo}
          </Text>
        )}
      </View>

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
    marginBottom: 5,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 25,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },

  consejoText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },

  loadingText: {
    fontSize: 16,
    color: '#7A7A7A',
    textAlign: 'center',
  },

  secondaryButton: {
    alignItems: 'center',
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ConsejosScreen;