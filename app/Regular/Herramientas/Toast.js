import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useTheme } from './theme';

let showAlertFn = null;

export const showAlert = (title, message, type = 'success') => {
  if (showAlertFn) showAlertFn(title, message, type);
};

const Toast = () => {
  const colors = useTheme();
  const [state, setState] = useState({ visible: false, title: '', message: '', type: 'success' });

  showAlertFn = useCallback((title, message, type) => {
    setState({ visible: true, title, message, type });
  }, []);

  const close = () => setState(s => ({ ...s, visible: false }));

  const icon = state.type === 'success' ? '\u2713' : '\u2715';
  const iconColor = state.type === 'success' ? '#2ECC71' : '#E74C3C';

  const cardContent = (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
        <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{state.title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{state.message}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={close}>
        <Text style={[styles.buttonText, { color: colors.white }]}>OK</Text>
      </TouchableOpacity>
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
    <Modal visible={state.visible} transparent animationType="fade" onRequestClose={close}>
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
  button: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});

export default Toast;
