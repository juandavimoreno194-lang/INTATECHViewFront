import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import AlertModal from './AlertModal';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#E17055";

function clasificarIMC(imc) {
  if (imc < 18.5) return { label: 'Bajo peso',        color: '#74B9FF', icon: 'arrow-down-circle' };
  if (imc < 25)   return { label: 'Normal',           color: '#2ECC71', icon: 'checkmark-circle' };
  if (imc < 30)   return { label: 'Sobrepeso',        color: '#F39C12', icon: 'alert-circle' };
  if (imc < 35)   return { label: 'Obesidad grado I', color: '#E67E22', icon: 'warning' };
  if (imc < 40)   return { label: 'Obesidad grado II',color: '#E74C3C', icon: 'warning' };
  return           { label: 'Obesidad grado III',     color: '#C0392B', icon: 'close-circle' };
}

const ObesidadScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [unidad, setUnidad] = useState('m');
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'success' });

  const alturaEnMetros = useMemo(() => {
    const val = parseFloat(altura);
    if (isNaN(val) || val <= 0) return null;
    return unidad === 'cm' ? val / 100 : val;
  }, [altura, unidad]);

  const imc = useMemo(() => {
    const p = parseFloat(peso);
    const h = alturaEnMetros;
    if (isNaN(p) || !h || p <= 0) return null;
    return p / (h * h);
  }, [peso, alturaEnMetros]);

  const cls = imc ? clasificarIMC(imc) : null;

  const handleGuardar = async () => {
    const pesoVal = parseFloat(peso);
    if (!user?.id) { setModal({ visible: true, title: 'Error', message: 'No se detectó usuario.', type: 'error' }); return; }
    if (isNaN(pesoVal) || pesoVal <= 0) { setModal({ visible: true, title: 'Error', message: 'Ingresa un peso válido.', type: 'error' }); return; }
    if (!alturaEnMetros) { setModal({ visible: true, title: 'Error', message: 'Ingresa una altura válida.', type: 'error' }); return; }

    try {
      const res = await fetch(`${API_URL}/obesidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso: pesoVal, altura: alturaEnMetros, usuario_id: user.id }),
      });
      if (res.ok) {
        setModal({ visible: true, title: '¡Guardado!', message: `IMC: ${imc.toFixed(1)} — ${cls.label}`, type: 'success' });
        setPeso(''); setAltura('');
      } else throw new Error();
    } catch {
      setModal({ visible: true, title: 'Error', message: 'No se pudieron guardar los datos.', type: 'error' });
    }
  };

  const decimalMode = unidad === 'm' ? 'decimal' : 'numeric';

  const handleNumInput = (text, setter) => {
    if (unidad === 'm') {
      const clean = text.replace(/[^0-9.]/g, '');
      if (clean.split('.').length > 2) return;
      setter(clean);
    } else setter(text.replace(/[^0-9]/g, ''));
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
          <Ionicons name="body-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Control de Obesidad</Text>
        <Text style={styles.headerSub}>Calcula tu Índice de Masa Corporal</Text>
      </View>

      {/* PREVIEW IMC */}
      {cls ? (
        <View style={[styles.previewCard, { backgroundColor: cls.color }]}>
          <Ionicons name={cls.icon} size={28} color="#fff" style={{ marginBottom: 6 }} />
          <Text style={styles.previewValue}>{imc.toFixed(1)} <Text style={styles.previewUnit}>IMC</Text></Text>
          <Text style={styles.previewLabel}>{cls.label}</Text>
          <Text style={styles.previewFormula}>{peso} kg / ({alturaEnMetros?.toFixed(2)} m)²</Text>
        </View>
      ) : (
        <View style={[styles.previewEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="calculator-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.previewEmptyText, { color: colors.textSecondary }]}>Completa los campos para calcular tu IMC</Text>
        </View>
      )}

      {/* UNIDAD */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>UNIDAD DE ALTURA</Text>
        <View style={styles.unidadRow}>
          {['m', 'cm'].map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unidadBtn, { borderColor: colors.border, backgroundColor: colors.inputBg },
                unidad === u && { backgroundColor: HEADER_COLOR, borderColor: HEADER_COLOR }]}
              onPress={() => { setUnidad(u); setAltura(''); }}
            >
              <Text style={[styles.unidadText, { color: colors.textSecondary }, unidad === u && { color: '#fff' }]}>
                {u === 'm' ? 'Metros (m)' : 'Centímetros (cm)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* INPUTS */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.inputRow}>
          <View style={[styles.inputIcon, { backgroundColor: HEADER_COLOR + '18' }]}>
            <Ionicons name="barbell-outline" size={20} color={HEADER_COLOR} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder="Ej: 70"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={peso}
              onChangeText={(t) => setPeso(t.replace(/[^0-9.]/g, ''))}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.inputRow}>
          <View style={[styles.inputIcon, { backgroundColor: HEADER_COLOR + '18' }]}>
            <Ionicons name="resize-outline" size={20} color={HEADER_COLOR} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Altura ({unidad})</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder={unidad === 'm' ? 'Ej: 1.75' : 'Ej: 175'}
              placeholderTextColor={colors.textSecondary}
              keyboardType={decimalMode}
              value={altura}
              onChangeText={(t) => handleNumInput(t, setAltura)}
            />
          </View>
        </View>
      </View>

      {/* BOTONES */}
      <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: HEADER_COLOR }]} onPress={handleGuardar}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.btnPrimaryText}>Guardar datos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSecondary, { borderColor: HEADER_COLOR }]} onPress={() => navigation.navigate('ResultadosScreen4')}>
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
  previewFormula: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 6 },
  previewEmpty: {
    marginHorizontal: 20, marginTop: 20, borderRadius: 20, paddingVertical: 28,
    alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed', gap: 8,
  },
  previewEmptyText: { fontSize: 13, textAlign: 'center' },

  card: {
    marginHorizontal: 20, marginTop: 14, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  unidadRow: { flexDirection: 'row', gap: 10 },
  unidadBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 },
  unidadText: { fontSize: 13, fontWeight: '600' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  inputIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  input: { fontSize: 22, fontWeight: '700', paddingBottom: 4, borderBottomWidth: 1.5 },
  divider: { height: 1, marginVertical: 12 },

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

export default ObesidadScreen;
