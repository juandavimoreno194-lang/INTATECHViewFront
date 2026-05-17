import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from './theme';

const AlertModal = ({ visible, title, message, type = 'success', onClose }) => {
  const colors = useTheme();

  const icon = type === 'success' ? '✓' : '✕';
  const iconColor = type === 'success' ? '#2ECC71' : '#E74C3C';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
            <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onClose}>
            <Text style={[styles.buttonText, { color: colors.white }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  card: {
    width: '100%', borderRadius: 20, padding: 28,
    alignItems: 'center', elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
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

export default AlertModal;
