import { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from './Regular/Herramientas/theme';
import { getApiUrl } from './Regular/Herramientas/apiConfig';
import { showAlert } from './Regular/Herramientas/Toast';

function RegistroUserScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const colors = useTheme();
    const apiUrl = getApiUrl();

  const handleRegistro = async () => {
    if (!nombre || !email || !password || !confirmPassword) {
      showAlert('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, rol: 'ROL_REG', estado_id: 1 }),
      });
      const data = await res.json();
      if (res.ok && data.msg === 'Usuario registrado correctamente') {
        showAlert('Éxito', 'Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
        navigation.navigate('LoginScreen');
      } else {
        showAlert('Error', data.msg || 'Error al registrar', 'error');
      }
    } catch {
      showAlert('Error', 'Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Crear cuenta</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Completa los datos para registrarte
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
      <TextInput
        placeholder="Ingresa tu nombre"
        value={nombre}
        onChangeText={setNombre}
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electrónico</Text>
      <TextInput
        placeholder="Ingresa tu correo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
      <TextInput
        placeholder="Crea una contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar contraseña</Text>
      <TextInput
        placeholder="Repite la contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleRegistro}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: colors.white }]}>
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={[styles.link, { color: colors.primary }]}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 25, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 30 },
  label: { fontSize: 14, marginBottom: 5 },
  input: {
    height: 50, borderRadius: 12, paddingHorizontal: 15,
    marginBottom: 15, borderWidth: 1,
  },
  button: {
    padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 16,
  },
  buttonText: { fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', fontSize: 14 },
});

export default RegistroUserScreen;
