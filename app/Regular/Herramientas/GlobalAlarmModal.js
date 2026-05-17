import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './theme';

let _showAlarm = null;

export const showAlarm = (id, titulo, onSnooze) => {
  if (_showAlarm) _showAlarm(id, titulo, onSnooze);
};

const GlobalAlarmModal = () => {
  const colors = useTheme();
  const [state, setState] = useState({
    visible: false,
    id: null,
    titulo: '',
    onSnooze: null,
  });

  _showAlarm = useCallback((id, titulo, onSnooze) => {
    setState({ visible: true, id, titulo, onSnooze });
    try { Vibration.vibrate([0, 600, 200, 600, 200, 600, 200, 600]); } catch {}
  }, []);

  const handleStop = () => {
    setState(s => ({ ...s, visible: false }));
    try { Vibration.cancel(); } catch {}
  };

  const handleSnooze = async () => {
    const fn = state.onSnooze;
    setState(s => ({ ...s, visible: false }));
    try { Vibration.cancel(); } catch {}
    if (fn) await fn();
  };

  return (
    <Modal visible={state.visible} transparent animationType="fade" onRequestClose={handleStop}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#F39C1225' }]}>
            <Ionicons name="alarm-outline" size={36} color="#F39C12" />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>¡Recordatorio!</Text>
          <Text style={[styles.titulo, { color: colors.text }]}>{state.titulo}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btnSnooze, { borderColor: colors.primary }]}
              onPress={handleSnooze}
            >
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.snoozeText, { color: colors.primary }]}>Posponer 5 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnStop, { backgroundColor: colors.danger || '#E74C3C' }]}
              onPress={handleStop}
            >
              <Ionicons name="stop-circle-outline" size={16} color="#fff" />
              <Text style={styles.stopText}>Parar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  card: {
    width: '100%',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 26,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnSnooze: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  btnStop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  snoozeText: { fontSize: 13, fontWeight: '700' },
  stopText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

export default GlobalAlarmModal;
