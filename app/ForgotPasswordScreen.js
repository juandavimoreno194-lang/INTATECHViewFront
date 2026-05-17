import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';

import { useTheme } from './Regular/Herramientas/theme';
import { showAlert } from './Regular/Herramientas/Toast';
import { Ionicons } from '@expo/vector-icons';

import { getApiUrl } from './Regular/Herramientas/apiConfig';
const API_URL = getApiUrl();

const ForgotPasswordScreen = ({ navigation }) => {
  const colors = useTheme();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRecuperarContraseña = async () => {
    if (newPassword !== confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden.", "error");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Error", "La contraseña debe tener al menos 6 caracteres.", "error");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/recuperacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Éxito", "Contraseña cambiada correctamente", "success");
        navigation.goBack();
      } else {
        showAlert("Error", data.message || "Error al cambiar la contraseña", "error");
      }
    } catch (error) {
      showAlert("Error", "Problema con el servidor", "error");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Recuperar contraseña</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Ingresa tu correo y establece una nueva contraseña
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico</Text>
      <TextInput
        placeholder="Ingresa tu correo"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Nueva contraseña</Text>
      <TextInput
        placeholder="••••••"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar contraseña</Text>
      <TextInput
        placeholder="••••••"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRecuperarContraseña}>
        <Text style={[styles.buttonText, { color: colors.white }]}>Cambiar contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={18} color="#fff" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 30 },
  label: { fontSize: 14, marginBottom: 5 },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1 },
  button: { padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 16 },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  backButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 12,
  },
  backText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default ForgotPasswordScreen;
