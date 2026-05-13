import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity
} from 'react-native';
import { useUser } from '../Herramientas/UserContext';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const CardioScreen = ({ navigation }) => {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ❤️ Animación corazón
  const latido = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // 🟢 Enviar usuario activo
  const enviarUsuarioActivo = async () => {
    if (!user?.id) return;

    try {
      await fetch(`${API_URL}/usuario-activo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 📊 Obtener BPM en tiempo real
  const fetchCardio = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `${API_URL}/cardio?usuario_id=${user.id}`
      );

      const result = await response.json();

      console.log("📊 DATA:", result);

      // 🔥 CORRECCIÓN FINAL
      if (result && result.bpm) {
        setData(result);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    latido();
    enviarUsuarioActivo();
    fetchCardio();

    // ⚡ TIEMPO REAL (1 segundo)
    const interval = setInterval(fetchCardio, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  // 🔥 COLOR DINÁMICO SEGÚN BPM
  const getColor = () => {
    if (!data) return '#E74C3C';
    if (data.bpm > 100) return 'red';
    if (data.bpm > 80) return 'orange';
    if (data.bpm > 60) return 'green';
    return 'blue';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitor Cardíaco</Text>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name="heart" size={150} color={getColor()} />
      </Animated.View>

      <Text style={styles.valor}>
        {data ? `${data.bpm} BPM` : '--'}
      </Text>

      <Text style={styles.subtext}>
        {data ? data.riesgo_cardiovascular : 'Esperando datos...'}
      </Text>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CardioScreen;

// 🎨 ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C2C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  valor: {
    fontSize: 45,
    color: '#fff',
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    marginTop: 40,
    backgroundColor: '#1F3A5F',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
});