import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useTheme } from './theme';

let _showConfirm = null;

export const showConfirm = (title, message) => {
  return new Promise((resolve) => {
    if (_showConfirm) _showConfirm(title, message, resolve);
    else resolve(false);
  });
};

const ConfirmModal = () => {
  const colors = useTheme();
  const [state, setState] = useState({ visible: false, title: '', message: '', resolve: null });

  _showConfirm = useCallback((title, message, resolve) => {
    setState({ visible: true, title, message, resolve });
  }, []);

  const handle = (result) => {
    const r = state.resolve;
    setState(s => ({ ...s, visible: false, resolve: null }));
    if (r) r(result);
  };

  const cardContent = (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconCircle, { backgroundColor: '#3498DB20' }]}>
        <Text style={[styles.icon, { color: '#3498DB' }]}>?</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{state.title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{state.message}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.btnCancel, { borderColor: colors.border }]} onPress={() => handle(false)}>
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAccept, { backgroundColor: colors.primary }]} onPress={() => handle(true)}>
          <Text style={[styles.acceptText, { color: colors.white }]}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    if (!state.visible) return null;
    return (
      <View style={styles.webOverlay}>
        {cardContent}
      </View>
    );
  }

  return (
    <Modal visible={state.visible} transparent animationType="fade" onRequestClose={() => handle(false)}>
      <View style={styles.overlay}>
        {cardContent}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  webOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
    zIndex: 9999,
  },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  card: {
    width: '100%', borderRadius: 20, padding: 28,
    alignItems: 'center', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  icon: { fontSize: 32, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  buttons: { flexDirection: 'row', gap: 12, width: '100%' },
  btnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    alignItems: 'center', borderWidth: 1.5,
  },
  btnAccept: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600' },
  acceptText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default ConfirmModal;
