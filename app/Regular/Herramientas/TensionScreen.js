import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useUser } from '../Herramientas/UserContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TensionScreen = ({ navigation }) => {
  const { user } = useUser();

  const [sistolica, setSistolica] = useState('');
  const [diastolica, setDiastolica] = useState('');

  const handleSaveTension = async () => {
    const sistolicaValue = sistolica ? parseInt(sistolica, 10) : null;
    const diastolicaValue = diastolica ? parseInt(diastolica, 10) : null;

    if (!user || !user.id) {
      Alert.alert('Error', 'No se ha detectado un usuario autenticado.');
      return;
    }

    if (!sistolicaValue || !diastolicaValue) {
      Alert.alert('Error', 'Ingresa valores válidos.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tension`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sistolica: sistolicaValue,
          diastolica: diastolicaValue,
          usuario_id: user.id,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Datos guardados correctamente.');
        setSistolica('');
        setDiastolica('');
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los datos.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Control de Tensión</Text>
      <Text style={styles.subtitle}>
        Registra tu presión arterial (sistólica y diastólica)
      </Text>

      {/* Sistólica */}
      <Text style={styles.label}>Presión sistólica</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 120 mmHg"
        value={sistolica}
        keyboardType="numeric"
        onChangeText={setSistolica}
      />

      {/* Diastólica */}
      <Text style={styles.label}>Presión diastólica</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 80 mmHg"
        value={diastolica}
        keyboardType="numeric"
        onChangeText={setDiastolica}
      />

      {/* Botón principal */}
      <TouchableOpacity style={styles.button} onPress={handleSaveTension}>
        <Text style={styles.buttonText}>Guardar Datos</Text>
      </TouchableOpacity>

      {/* Botón secundario */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('ResultadosScreen3')}
      >
        <Text style={styles.secondaryText}>Ver mis resultados</Text>
      </TouchableOpacity>

      {/* Volver */}
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

  label: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 5,
  },

  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    alignItems: 'center',
    marginBottom: 10,
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TensionScreen;