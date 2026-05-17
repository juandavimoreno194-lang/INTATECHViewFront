import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();

const GrupoScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [tipoSangre, setTipoSangre] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRH = async () => {
      try {
        const response = await fetch(`${API_URL}/datos/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const perfil = data?.data?.[0] || data?.data || data;
          setTipoSangre(perfil?.tipo_sangre || null);
        }
      } catch {
        setTipoSangre(null);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchRH();
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Grupo Sanguíneo</Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Tu tipo de sangre</Text>
        <Text style={[styles.bloodType, { color: colors.primary }]}>{tipoSangre || 'No registrado'}</Text>
        <Text style={[styles.hint, { color: colors.textLight }]}>
          {tipoSangre
            ? 'Para modificar tu tipo de sangre, ve a Editar Perfil'
            : 'Ve a Editar Perfil para registrar tu tipo de sangre'}
        </Text>
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={18} color="#fff" />
        <Text style={[styles.buttonText, { color: colors.white }]}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
  },
  bloodType: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 12, marginTop: 30,
  },
  buttonText: { fontSize: 15, fontWeight: '600' },
});

export default GrupoScreen;
