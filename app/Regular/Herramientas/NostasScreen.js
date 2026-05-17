import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from './Toast';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#00B894";

const NostasScreen = ({ route, navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const { perfilData } = route.params || {};
  const [nota, setNota] = useState(perfilData?.nota || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nota.trim()) {
      showAlert('Error', 'Debes escribir una nota.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, descripcion: nota }),
      });
      if (res.ok) {
        showAlert('Éxito', 'Nota guardada correctamente', 'success');
        setNota('');
        navigation.navigate('MisNotasScreen');
      } else throw new Error();
    } catch {
      showAlert('Error', 'No se pudo guardar la nota', 'error');
    } finally {
      setSaving(false);
    }
  };

  const wordCount = nota.trim() ? nota.trim().split(/\s+/).length : 0;
  const charCount = nota.length;

  return (
    <KeyboardAvoidingView style={{ flex: 1, overflow: 'hidden' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="book-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Nueva Nota</Text>
        <Text style={styles.headerSub}>Guarda información importante para ti</Text>
      </View>

      {/* EDITOR */}
      <View style={[styles.editorCard, { backgroundColor: colors.card }]}>
        <View style={styles.editorHeader}>
          <Ionicons name="create-outline" size={18} color={HEADER_COLOR} />
          <Text style={[styles.editorLabel, { color: colors.textSecondary }]}>Tu nota</Text>
          <View style={[styles.countBadge, { backgroundColor: HEADER_COLOR + '18' }]}>
            <Text style={[styles.countText, { color: HEADER_COLOR }]}>{charCount} caracteres</Text>
          </View>
        </View>
        <TextInput
          style={[styles.editor, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
          placeholder="Escribe aquí tu nota... puede ser un recordatorio, síntoma, observación..."
          placeholderTextColor={colors.textSecondary}
          value={nota}
          onChangeText={setNota}
          multiline
          textAlignVertical="top"
        />
        <Text style={[styles.wordCount, { color: colors.textSecondary }]}>{wordCount} palabras</Text>
      </View>

      {/* BOTONES */}
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: HEADER_COLOR, opacity: saving ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Ionicons name={saving ? 'hourglass-outline' : 'save-outline'} size={20} color="#fff" />
        <Text style={styles.btnPrimaryText}>{saving ? 'Guardando...' : 'Guardar nota'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSecondary, { borderColor: HEADER_COLOR }]} onPress={() => navigation.navigate('MisNotasScreen')}>
        <Ionicons name="documents-outline" size={18} color={HEADER_COLOR} />
        <Text style={[styles.btnSecondaryText, { color: HEADER_COLOR }]}>Ver mis notas</Text>
      </TouchableOpacity>

    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },

  header: {
    backgroundColor: HEADER_COLOR, paddingTop: 50, paddingBottom: 30,
    alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  backArrow: { position: 'absolute', top: 50, left: 18, padding: 6 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  editorCard: {
    marginHorizontal: 20, marginTop: 20, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  editorHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  editorLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '600' },
  editor: {
    minHeight: 180, borderRadius: 12, padding: 14,
    borderWidth: 1, fontSize: 15, lineHeight: 22,
  },
  wordCount: { fontSize: 11, marginTop: 8, textAlign: 'right' },

  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 20, padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1.5,
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600' },
});

export default NostasScreen;
