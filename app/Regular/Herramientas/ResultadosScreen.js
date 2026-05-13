import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../Herramientas/UserContext";
import * as Notifications from "expo-notifications";
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultadosScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [resultados, setResultados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);

  const obtenerResultados = async () => {
    try {
      const response = await fetch(`${API_URL}/glucosa/${user.id}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setResultados(data);
      } else {
        Alert.alert("Error", "No se pudieron cargar los resultados.");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al obtener los resultados.");
    }
  };

  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/glucosa/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultados(prev => prev.filter(item => item.id !== id));
        Alert.alert("Éxito", "Resultado eliminado correctamente.");
      } else {
        Alert.alert("Error", "No se pudo eliminar.");
      }
    } catch {
      Alert.alert("Error", "Problema al eliminar.");
    }
  };

  const evaluarRiesgo = (nivel) => {
    if (nivel < 70) return "Bajo";
    else if (nivel <= 100) return "Normal";
    else if (nivel <= 180) return "Moderado";
    else if (nivel <= 300) return "Alto";
    else return "Muy alto";
  };

  const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  };

  const enviarNotificacion = async (titulo, mensaje) => {
    await Notifications.scheduleNotificationAsync({
      content: { title: titulo, body: mensaje },
      trigger: 5,
    });
  };

  useEffect(() => {
    obtenerResultados();

    const interval = setInterval(() => {
      resultados.forEach(item => {
        if (evaluarRiesgo(item.nivel) === "Muy alto" && !notificacionEnviada) {
          enviarNotificacion(
            "⚠️ Glucosa peligrosa",
            "Tu nivel es muy alto, ve al hospital"
          );
          setNotificacionEnviada(true);
          AsyncStorage.setItem('notificacionGlucosaEnviada', 'true');
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [resultados]);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Mis Resultados</Text>
      <Text style={styles.subtitle}>
        Historial de tus niveles de glucosa
      </Text>

      {resultados.map((item) => {
        const riesgo = evaluarRiesgo(item.nivel);

        return (
          <View key={item.id} style={styles.card}>

            <Text style={styles.fecha}>
              {formatearFecha(item.fecha)}
            </Text>

            <Text style={styles.valor}>
              {item.nivel} mg/dL
            </Text>

            <Text style={styles.riesgo}>
              Riesgo: {riesgo}
            </Text>

            {riesgo === "Muy alto" && (
              <Text style={styles.alerta}>
                ⚠️ Atención inmediata
              </Text>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarResultado(item.id)}
            >
              <Text style={styles.deleteText}>Eliminar</Text>
            </TouchableOpacity>

          </View>
        );
      })}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryText}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E1E1E',
    textAlign: 'center',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    textAlign: 'center',
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  fecha: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },

  valor: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4A90E2",
  },

  riesgo: {
    fontSize: 14,
    color: "#4A4A4A",
    marginTop: 5,
  },

  alerta: {
    color: "#E74C3C",
    fontWeight: "bold",
    marginTop: 5,
  },

  deleteButton: {
    marginTop: 10,
    backgroundColor: "#E74C3C",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "bold",
  },

  secondaryButton: {
    alignItems: 'center',
    marginTop: 10,
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },

});

export default ResultadosScreen;