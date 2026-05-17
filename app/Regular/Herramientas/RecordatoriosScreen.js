import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import { showAlert } from './Toast';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHANNEL_ID, mostrarNotif, agendarRecordatorio, crearCanal } from './NotificationHandler';

let Notifications = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
}

async function ensureCanalYAviso(titulo, body) {
  if (!Notifications) return;
  await crearCanal();
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      await mostrarNotif(titulo, body);
      try { Vibration.vibrate([0, 500, 200, 500]); } catch {}
    }
  } catch {}
}

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#FF6B6B";

const RecordatoriosScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const [saving, setSaving] = useState(false);

  const to24h = (h, m, ap) => {
    let hh = parseInt(h, 10) || 0;
    if (ap === 'PM' && hh < 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
    return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
  };

  const handleSave = async () => {
    if (!selectedDate || !reminderTitle.trim()) {
      showAlert('Error', 'Debes seleccionar una fecha y escribir un título.', 'error');
      return;
    }
    if (!user) { showAlert('Error', 'No se detectó usuario.', 'error'); return; }

    setSaving(true);
    try {
      const hora24 = to24h(hour, minute, ampm);
      const fecha = selectedDate;
      const res = await fetch(`${API_URL}/recordatorios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, fecha, hora: hora24, titulo: reminderTitle }),
      });

      if (res.ok) {
        const result = await res.json();
        if (Platform.OS !== 'web') {
          await ensureCanalYAviso('Recordatorio', reminderTitle);
          await agendarRecordatorio(result.id, reminderTitle, selectedDate, hora24);
        }
        const raw = await AsyncStorage.getItem('@recordatorios');
        const list = (raw && raw.trim()) ? JSON.parse(raw) : [];
        list.push({ id: result.id, titulo: reminderTitle, fecha: selectedDate, hora: hora24 });
        await AsyncStorage.setItem('@recordatorios', JSON.stringify(list));

        showAlert('Éxito', `Recordatorio guardado: ${selectedDate} a las ${hour}:${minute} ${ampm}`, 'success');
        setReminderTitle('');
        setSelectedDate('');
      } else {
        const text = await res.text();
        showAlert('Error', `Error ${res.status}: ${text}`, 'error');
      }
    } catch (e) {
      showAlert('Error', `Error: ${e.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>No hay usuario registrado</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="calendar-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Recordatorios</Text>
        <Text style={styles.headerSub}>Organiza tus citas y eventos de salud</Text>
        {selectedDate ? (
          <View style={styles.dateChip}>
            <Ionicons name="calendar" size={13} color="#fff" />
            <Text style={styles.dateChipText}>{selectedDate}</Text>
          </View>
        ) : null}
      </View>

      {/* CALENDARIO */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar-number-outline" size={18} color={HEADER_COLOR} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Selecciona una fecha</Text>
        </View>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{ [selectedDate]: { selected: true, selectedColor: HEADER_COLOR } }}
          theme={{
            backgroundColor: colors.card, calendarBackground: colors.card,
            dayTextColor: colors.text, textDisabledColor: colors.textLight,
            monthTextColor: colors.text, todayTextColor: HEADER_COLOR,
            arrowColor: HEADER_COLOR, selectedDayBackgroundColor: HEADER_COLOR,
          }}
        />
      </View>

      {/* TÍTULO */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.inputRow}>
          <View style={[styles.inputIcon, { backgroundColor: HEADER_COLOR + '18' }]}>
            <Ionicons name="text-outline" size={20} color={HEADER_COLOR} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Título del recordatorio</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
              placeholder="Ej: Tomar medicamento"
              placeholderTextColor={colors.textSecondary}
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />
          </View>
        </View>
      </View>

      {/* HORA */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="time-outline" size={18} color={HEADER_COLOR} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Hora del recordatorio</Text>
        </View>
        <View style={styles.timeRow}>
          <View style={[styles.timeBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TextInput
              style={[styles.timeInput, { color: colors.text }]}
              placeholder="12"
              placeholderTextColor={colors.textSecondary}
              value={hour}
              onChangeText={setHour}
              keyboardType="numeric"
              maxLength={2}
              textAlign="center"
            />
          </View>
          <Text style={[styles.timeSep, { color: colors.text }]}>:</Text>
          <View style={[styles.timeBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <TextInput
              style={[styles.timeInput, { color: colors.text }]}
              placeholder="00"
              placeholderTextColor={colors.textSecondary}
              value={minute}
              onChangeText={setMinute}
              keyboardType="numeric"
              maxLength={2}
              textAlign="center"
            />
          </View>
          <View style={styles.ampmGroup}>
            {['AM', 'PM'].map(ap => (
              <TouchableOpacity
                key={ap}
                style={[styles.ampmBtn, { borderColor: colors.border, backgroundColor: colors.inputBg },
                  ampm === ap && { backgroundColor: HEADER_COLOR, borderColor: HEADER_COLOR }]}
                onPress={() => setAmpm(ap)}
              >
                <Text style={[styles.ampmText, { color: colors.textSecondary }, ampm === ap && { color: '#fff' }]}>{ap}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* BOTONES */}
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: HEADER_COLOR, opacity: saving ? 0.7 : 1 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Ionicons name={saving ? 'hourglass-outline' : 'alarm-outline'} size={20} color="#fff" />
        <Text style={styles.btnPrimaryText}>{saving ? 'Guardando...' : 'Guardar recordatorio'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btnSecondary, { borderColor: HEADER_COLOR }]} onPress={() => navigation.navigate('RecordatoriosGuardados')}>
        <Ionicons name="list-outline" size={18} color={HEADER_COLOR} />
        <Text style={[styles.btnSecondaryText, { color: HEADER_COLOR }]}>Ver recordatorios guardados</Text>
      </TouchableOpacity>

    </ScrollView>
    </KeyboardAvoidingView>
    </View>
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
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  dateChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  dateChipText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  card: {
    marginHorizontal: 20, marginTop: 14, borderRadius: 18, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700' },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  inputIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginBottom: 4 },
  input: { fontSize: 16, fontWeight: '600', paddingBottom: 6, borderBottomWidth: 1.5 },

  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBox: { borderRadius: 12, borderWidth: 1, width: 64, height: 52, justifyContent: 'center', alignItems: 'center' },
  timeInput: { fontSize: 22, fontWeight: '700', width: '100%' },
  timeSep: { fontSize: 26, fontWeight: '800' },
  ampmGroup: { flexDirection: 'row', gap: 6, marginLeft: 6 },
  ampmBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1.5 },
  ampmText: { fontSize: 14, fontWeight: '700' },

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

export default RecordatoriosScreen;
