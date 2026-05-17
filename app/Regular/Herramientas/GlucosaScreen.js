import React, { useState, useMemo } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../Herramientas/UserContext";
import { useTheme } from './theme';
import AlertModal from './AlertModal';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#0984E3";

function clasificarGlucosa(nivel) {
  if (nivel < 70)  return { label: 'Hipoglucemia',  color: '#F39C12', icon: 'arrow-down-circle' };
  if (nivel <= 100) return { label: 'Normal',        color: '#2ECC71', icon: 'checkmark-circle' };
  if (nivel <= 180) return { label: 'Moderado',      color: '#F39C12', icon: 'alert-circle' };
  if (nivel <= 300) return { label: 'Alto',          color: '#E74C3C', icon: 'warning' };
  return             { label: 'Muy alto',            color: '#C0392B', icon: 'close-circle' };
}

const GlucosaScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [nivel, setNivel] = useState("");
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'success' });

  const nivelNum = useMemo(() => parseFloat(nivel), [nivel]);
  const cls = nivelNum && !isNaN(nivelNum) ? clasificarGlucosa(nivelNum) : null;

  const handleGuardar = async () => {
    if (!nivelNum || isNaN(nivelNum) || nivelNum <= 0) {
      setModal({ visible: true, title: 'Error', message: 'Ingresa un valor válido de glucosa.', type: 'error' });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/glucosa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nivel: nivelNum, usuario_id: user.id, rango_riesgo: cls.label }),
      });
      if (res.ok) {
        setModal({ visible: true, title: '¡Guardado!', message: `Glucosa: ${nivelNum} mg/dL — ${cls.label}`, type: 'success' });
        setNivel("");
      } else {
        throw new Error();
      }
    } catch {
      setModal({ visible: true, title: 'Error', message: 'No se pudieron guardar los datos.', type: 'error' });
    }
  };

  return (
    <>
    <KeyboardAvoidingView style={{ flex: 1, overflow: 'hidden' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="pulse-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Control de Glucosa</Text>
        <Text style={styles.headerSub}>Registra tu nivel en sangre</Text>
      </View>

      {/* PREVIEW */}
      {cls ? (
        <View style={[styles.previewCard, { backgroundColor: cls.color }]}>
          <Ionicons name={cls.icon} size={32} color="#fff" style={{ marginBottom: 6 }} />
          <Text style={styles.previewValue}>{nivelNum} <Text style={styles.previewUnit}>mg/dL</Text></Text>
          <Text style={styles.previewLabel}>{cls.label}</Text>
        </View>
      ) : (
        <View style={[styles.previewEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="analytics-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.previewEmptyText, { color: colors.textSecondary }]}>Ingresa un valor para ver la clasificación</Text>
        </View>
      )}

      {/* FORMULARIO */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.inputRow}>
          <View style={[styles.inputIcon, { backgroundColor: HEADER_COLOR + '18' }]}>
            <Ionicons name="water-outline" size={20} color={HEADER_COLOR} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nivel de glucosa (mg/dL)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder="Ej: 95"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={nivel}
              onChangeText={(t) => setNivel(t.replace(/[^0-9]/g, ''))}
            />
          </View>
        </View>
      </View>

      {/* ESCALA REFERENCIA */}
      <View style={[styles.scaleCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.scaleTitle, { color: colors.textSecondary }]}>ESCALA DE REFERENCIA</Text>
        {[
          { r: '< 70', l: 'Hipoglucemia', c: '#F39C12' },
          { r: '70–100', l: 'Normal', c: '#2ECC71' },
          { r: '101–180', l: 'Moderado', c: '#F39C12' },
          { r: '181–300', l: 'Alto', c: '#E74C3C' },
          { r: '> 300', l: 'Muy alto', c: '#C0392B' },
        ].map((s) => (
          <View key={s.l} style={styles.scaleRow}>
            <View style={[styles.scaleDot, { backgroundColor: s.c }]} />
            <Text style={[styles.scaleRange, { color: colors.textSecondary }]}>{s.r}</Text>
            <Text style={[styles.scaleLabel, { color: colors.text }]}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* BOTONES */}
      <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: HEADER_COLOR }]} onPress={handleGuardar}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.btnPrimaryText}>Guardar resultado</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSecondary, { borderColor: HEADER_COLOR }]} onPress={() => navigation.navigate("ResultadosScreen")}>
        <Ionicons name="bar-chart-outline" size={18} color={HEADER_COLOR} />
        <Text style={[styles.btnSecondaryText, { color: HEADER_COLOR }]}>Ver mis resultados</Text>
      </TouchableOpacity>

    </ScrollView>
    </KeyboardAvoidingView>

    <AlertModal visible={modal.visible} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, visible: false })} />
    </>
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

  previewCard: {
    marginHorizontal: 20, marginTop: 20, borderRadius: 20, paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  previewValue: { color: '#fff', fontSize: 48, fontWeight: '900' },
  previewUnit: { fontSize: 20, fontWeight: '400' },
  previewLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '700', marginTop: 4 },
  previewEmpty: {
    marginHorizontal: 20, marginTop: 20, borderRadius: 20, paddingVertical: 28,
    alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', gap: 8,
  },
  previewEmptyText: { fontSize: 13, textAlign: 'center' },

  card: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  input: { fontSize: 22, fontWeight: '700', paddingBottom: 4, borderBottomWidth: 1.5 },

  scaleCard: {
    marginHorizontal: 20, marginTop: 14, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  scaleTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  scaleDot: { width: 10, height: 10, borderRadius: 5 },
  scaleRange: { width: 70, fontSize: 12 },
  scaleLabel: { fontSize: 13, fontWeight: '600' },

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

export default GlucosaScreen;
