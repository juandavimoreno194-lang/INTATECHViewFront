import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRecuperarContraseña = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/recuperacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Contraseña cambiada correctamente");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      Alert.alert("Error", "Problema con el servidor");
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Recuperar contraseña</Text>
      <Text style={styles.subtitle}>
        Ingresa tu correo y establece una nueva contraseña
      </Text>

      {/* Email */}
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        placeholder="Ingresa tu correo"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* Nueva contraseña */}
      <Text style={styles.label}>Nueva contraseña</Text>
      <TextInput
        placeholder="••••••"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />

      {/* Confirmar contraseña */}
      <Text style={styles.label}>Confirmar contraseña</Text>
      <TextInput
        placeholder="••••••"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      {/* Botón */}
      <TouchableOpacity style={styles.button} onPress={handleRecuperarContraseña}>
        <Text style={styles.buttonText}>Cambiar contraseña</Text>
      </TouchableOpacity>

      {/* Volver */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>Volver al inicio de sesión</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 25,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 30,
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
    marginBottom: 20,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  back: {
    textAlign: 'center',
    color: '#4A90E2',
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;