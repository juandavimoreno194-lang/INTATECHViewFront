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

const GrupoScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const { perfilData } = route.params || {};

  const [tipoSangre, setTipoSangre] = useState(perfilData?.tipoSangre || '');

  const handleSave = async () => {
    if (!tipoSangre.trim()) {
      Alert.alert('Error', 'Debes ingresar tu tipo de sangre.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/grupo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          descripcion: tipoSangre,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Grupo sanguíneo guardado.');
        navigation.goBack();
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Grupo Sanguíneo</Text>
      <Text style={styles.subtitle}>
        Registra tu tipo de sangre para tu perfil de salud
      </Text>

      {/* Input */}
      <Text style={styles.label}>Tipo de sangre</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: O+, A-, AB+"
        value={tipoSangre}
        onChangeText={setTipoSangre}
      />

      {/* Botón principal */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>

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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GrupoScreen;