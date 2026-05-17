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
import { useUser } from './Herramientas/UserContext';
import { useTheme } from './Herramientas/theme';
import { showAlert } from './Herramientas/Toast';
import { Ionicons } from '@expo/vector-icons';

import { getApiUrl } from './Herramientas/apiConfig';
const API_URL = getApiUrl();

const CambiarContraseñaScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCambiar = async () => {
    if (!currentPassword) {
      showAlert('Error', 'Ingresa tu contraseña actual.', 'error');
      return;
    }
    if (!newPassword || !confirmPassword) {
      showAlert('Error', 'Completa todos los campos.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Las contraseñas nuevas no coinciden.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/cambiarcontrasena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showAlert('Listo', 'Contraseña actualizada correctamente.', 'success');
      } else {
        showAlert('Error', data.message || 'Error al actualizar.', 'error');
      }
    } catch {
      showAlert('Error', 'Problema con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.headerIcon, { backgroundColor: colors.primary + '18' }]}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Cambiar contraseña</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Verifica tu contraseña actual antes de establecer una nueva
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña actual</Text>
      <TextInput
        placeholder="••••••"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Nueva contraseña</Text>
      <TextInput
        placeholder="••••••"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar nueva contraseña</Text>
      <TextInput
        placeholder="••••••"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? colors.primary + '80' : colors.primary }]}
        onPress={handleCambiar}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: colors.white }]}>
          {loading ? 'Verificando...' : 'Cambiar contraseña'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={18} color="#fff" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, justifyContent: 'center' },
  headerIcon: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 20,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, marginBottom: 28, textAlign: 'center', lineHeight: 20 },
  divider: { height: 1, marginVertical: 16, borderRadius: 1 },
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

export default CambiarContraseñaScreen;
