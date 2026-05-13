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

const NostasScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const { perfilData } = route.params || {};

  const [nota, setNota] = useState(perfilData?.nota || '');

  const handleSave = async () => {
    if (!nota.trim()) {
      Alert.alert('Error', 'Debes escribir una nota.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          descripcion: nota,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Nota guardada correctamente');
        navigation.navigate('MisNotasScreen');
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la nota');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Notas</Text>
      <Text style={styles.subtitle}>
        Guarda información importante para ti
      </Text>

      {/* Input */}
      <Text style={styles.label}>Tu nota</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe aquí..."
        value={nota}
        onChangeText={setNota}
        multiline
      />

      {/* Botón principal */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar Nota</Text>
      </TouchableOpacity>

      {/* Botón secundario */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('MisNotasScreen')}
      >
        <Text style={styles.secondaryText}>Ver mis notas</Text>
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
    textAlign: 'center',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 25,
  },

  label: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 5,
  },

  input: {
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
  },

  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
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

export default NostasScreen;