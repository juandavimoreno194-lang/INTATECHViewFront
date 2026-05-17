import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { showAlert } from './Herramientas/Toast';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "./Herramientas/UserContext";
import { useTheme } from './Herramientas/theme';
import { Ionicons } from '@expo/vector-icons';

import { getApiUrl } from './Herramientas/apiConfig';
const API_URL = getApiUrl();

const GENEROS = ['Masculino', 'Femenino', 'Otro'];
const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const GenderSelector = ({ value, onSelect, colors }) => (
  <View style={styles.genderRow}>
    {GENEROS.map((opt) => {
      const active = value === opt;
      return (
        <TouchableOpacity
          key={opt}
          style={[styles.genderBtn, { backgroundColor: active ? colors.primary : colors.inputBg, borderColor: active ? colors.primary : colors.border }]}
          onPress={() => onSelect(opt)}
        >
          <Text style={[styles.genderText, { color: active ? '#fff' : colors.textSecondary }]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const SelectDropdown = ({ options, value, onSelect, placeholder, colors }) => {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={[styles.selectBtn, { backgroundColor: colors.inputBg, borderColor: open ? colors.primary : colors.border }]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectBtnText, { color: value ? colors.text : colors.textSecondary }]}>
          {value || placeholder}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {open && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options.map((opt) => {
            const active = value === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.dropdownItem, { backgroundColor: active ? colors.primary + '22' : 'transparent' }]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[styles.dropdownItemText, { color: active ? colors.primary : colors.text, fontWeight: active ? '700' : '400' }]}>
                  {opt}
                </Text>
                {active && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const FieldRow = ({ icon, label, children, colors }) => (
  <View style={[styles.fieldRow, { borderBottomColor: colors.border }]}>
    <View style={[styles.fieldIcon, { backgroundColor: colors.primary + '18' }]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  </View>
);

const EditarPerfilScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();

  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [edad, setEdad] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [foto, setFoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const obtenerUrlImagen = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('data:')) return ruta;
    const base = API_URL.replace(/\/$/, '');
    const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
    return `${base}${path}?t=${Date.now()}`;
  };

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/datos/${user.id}`);
      const data = await response.json();
      const perfil = data?.data?.[0] || data?.data || data;
      if (perfil) {
        setNombre(perfil.nombre || '');
        setGenero(perfil.genero || '');
        setAltura(perfil.altura?.toString() || '');
        setPeso(perfil.peso?.toString() || '');
        setEdad(perfil.edad?.toString() || '');
        setTipoSangre(perfil.tipo_sangre || '');
        setFoto(perfil.foto ? obtenerUrlImagen(perfil.foto) : null);
      }
    } catch {
      // silently fail on load
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { if (user?.id) cargarPerfil(); }, [user]));

  const seleccionarImagen = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        showAlert('Permiso requerido', 'Debes permitir acceso a galer\u00eda', 'error');
        return;
      }
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (resultado.canceled) return;

      const uri = resultado.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fotoBase64 = `data:image/jpeg;base64,${base64}`;
      setFoto(fotoBase64);

      const response = await fetch(`${API_URL}/upload-photo-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, foto: fotoBase64 }),
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('\u00c9xito', 'Foto actualizada', 'success');
        await cargarPerfil();
      } else {
        showAlert('Error', data.message || 'No se pudo actualizar la foto', 'error');
      }
    } catch {
      showAlert('Error', 'No se pudo actualizar la foto', 'error');
    }
  };

  const guardarCambios = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/datos/saveProfileData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, nombre, genero, altura, peso, edad, tipoSangre }),
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('Éxito', 'Perfil actualizado correctamente', 'success');
      } else {
        showAlert('Error', data.message, 'error');
      }
    } catch {
      showAlert('Error', 'No se pudo guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 14 }}>Cargando perfil...</Text>
      </View>
    );
  }

  const inicialNombre = nombre ? nombre[0].toUpperCase() : '?';

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: colors.background }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ backgroundColor: colors.background, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar perfil</Text>

          {/* Foto */}
          <View style={styles.photoWrapper}>
            <TouchableOpacity onPress={seleccionarImagen} activeOpacity={0.85}>
              {foto ? (
                <Image source={{ uri: foto }} style={styles.profileImage} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarLetter}>{inicialNombre}</Text>
                </View>
              )}
              <View style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={15} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerName}>{nombre || 'Tu nombre'}</Text>
          <Text style={styles.headerSub}>Toca la foto para cambiarla</Text>
        </View>

        {/* ── SECCIÓN: INFORMACIÓN PERSONAL ── */}
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INFORMACIÓN PERSONAL</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <FieldRow icon="text-outline" label="Nombre completo" colors={colors}>
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor={colors.textSecondary}
            />
          </FieldRow>

          <FieldRow icon="male-female-outline" label="Género" colors={colors}>
            <GenderSelector value={genero} onSelect={setGenero} colors={colors} />
          </FieldRow>

          <FieldRow icon="calendar-outline" label="Edad" colors={colors} last>
            <TextInput
              style={[styles.fieldInput, { color: colors.text }]}
              value={edad}
              onChangeText={setEdad}
              keyboardType="numeric"
              placeholder="Años"
              placeholderTextColor={colors.textSecondary}
            />
          </FieldRow>
        </View>

        {/* ── SECCIÓN: DATOS DE SALUD ── */}
        <View style={styles.sectionHeader}>
          <Ionicons name="fitness-outline" size={18} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATOS DE SALUD</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Altura y Peso en fila */}
          <View style={[styles.doubleRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.halfField, { borderRightColor: colors.border }]}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="resize-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Altura (m)</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                value={altura}
                onChangeText={setAltura}
                keyboardType="decimal-pad"
                placeholder="ej: 1.70"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.halfField}>
              <View style={[styles.fieldIcon, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="barbell-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Peso (kg)</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
                placeholder="ej: 70"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <FieldRow icon="water-outline" label="Tipo de sangre / RH" colors={colors} last>
            <SelectDropdown
              options={TIPOS_SANGRE}
              value={tipoSangre}
              onSelect={setTipoSangre}
              placeholder="Selecciona tu tipo de sangre"
              colors={colors}
            />
          </FieldRow>
        </View>

        {/* ── BOTONES ── */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
          onPress={guardarCambios}
          disabled={saving}
        >
          <Ionicons name={saving ? 'hourglass-outline' : 'checkmark-circle-outline'} size={22} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={18} color={colors.text} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Header */
  header: {
    paddingTop: 50, paddingBottom: 30, alignItems: 'center',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  backArrow: { position: 'absolute', top: 50, left: 18, padding: 6 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 20, opacity: 0.9 },

  photoWrapper: { position: 'relative', marginBottom: 14 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.8)' },
  avatarFallback: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarLetter: { color: '#fff', fontSize: 40, fontWeight: '700' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  headerName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 },

  /* Sections */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 20, marginTop: 22, marginBottom: 8,
  },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  card: {
    marginHorizontal: 16, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },

  /* Field row */
  fieldRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, gap: 12,
  },
  fieldIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginTop: 2,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 6 },
  fieldInput: { fontSize: 15, paddingVertical: 0, marginTop: 2 },

  /* Double row (altura + peso) */
  doubleRow: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  halfField: {
    flex: 1, paddingHorizontal: 16, paddingVertical: 14,
    borderRightWidth: 1,
  },

  /* Gender */
  genderRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  genderBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center',
  },
  genderText: { fontSize: 12, fontWeight: '600' },

  /* Dropdown */
  selectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 42, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, marginTop: 4,
  },
  selectBtnText: { fontSize: 14 },
  dropdown: {
    borderWidth: 1, borderRadius: 12, marginTop: 6, overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16,
  },
  dropdownItemText: { fontSize: 14 },

  /* Save button */
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12, marginBottom: 10, padding: 14, borderRadius: 16,
    borderWidth: 1.5,
  },
  backBtnText: { fontSize: 15, fontWeight: '600' },
});

export default EditarPerfilScreen;
