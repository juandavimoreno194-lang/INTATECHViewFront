import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useUser } from "../Herramientas/UserContext";
import * as Notifications from "expo-notifications"; // Importa expo-notifications
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultadosScreen1 = ({ navigation }) => {
  const { user } = useUser();
  const [resultados, setResultados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false); // Estado para verificar si la notificación ya fue enviada

  // Función para obtener los resultados desde la API
  const obtenerResultados = async () => {
    try {
      const response = await fetch(`${API_URL}/tiroides/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      } else {
        Alert.alert("Error", "No se pudieron obtener los resultados.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al conectar con el servidor.");
    }
  };

  // Función para eliminar un resultado
  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tiroides/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        Alert.alert("Éxito", "Resultado eliminado correctamente.");
        obtenerResultados();
      } else {
        Alert.alert("Error", "No se pudo eliminar el resultado.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al conectar con el servidor.");
    }
  };

  // Función para clasificar el riesgo según el nivel hormonal
  const clasificarRiesgo = (nivel) => {
    if (nivel < 0.5) {
      return "Bajo (leve)";
    } else if (nivel >= 0.5 && nivel < 2.5) {
      return "Normal";
    } else if (nivel >= 2.5 && nivel < 5) {
      return "Alto";
    } else if (nivel >= 5) {
      // Solo enviar notificación si aún no se ha enviado
      if (!notificacionEnviada) {
        enviarNotificacion("¡Riesgo de Tiroides!", "¡Tu nivel hormonal es muy alto! Dirígete al hospital.");
        setNotificacionEnviada(true); // Marcar como enviada
        AsyncStorage.setItem('notificacionTiroidesEnviada', 'true'); // Guardar el estado en AsyncStorage
      }
      return "Muy alto - ¡Dirígete al hospital!";
    } else {
      return "Nivel no válido";
    }
  };

  // Función para enviar notificación de tiroides
  const enviarNotificacion = async (titulo, mensaje) => {
    try {
      // Programar la notificación para que se muestre inmediatamente
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensaje,
        },
        trigger: null, // La notificación será inmediata
      });
      console.log('Notificación enviada: ', titulo, mensaje);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  };

  useEffect(() => {
    // Obtener los resultados cuando la pantalla se carga
    obtenerResultados();

    // Verificar si ya se ha enviado la notificación
    const checkNotificationStatus = async () => {
      const enviado = await AsyncStorage.getItem('notificacionTiroidesEnviada');
      if (enviado === 'true') {
        setNotificacionEnviada(true);
      }
    };

    checkNotificationStatus(); // Llamar a la función para verificar si ya se envió la notificación
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados de Tiroides</Text>
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>Nivel Hormonal: {item.nivel_hormonal}</Text>
            <Text style={styles.resultText}>Fecha: {item.fecha}</Text>
            <Text
              style={[
                styles.resultText,
                clasificarRiesgo(item.nivel_hormonal) === "Muy alto - ¡Dirígete al hospital!" && styles.highRiskText,
              ]}
            >
              Riesgo: {clasificarRiesgo(item.nivel_hormonal)}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarResultado(item.id)}
            >
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <Text style={styles.goBackButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#e0f7fa",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00796b",
    textAlign: "center",
    marginBottom: 20,
  },
  resultItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderColor: "#00796b",
    borderWidth: 1,
  },
  resultText: {
    fontSize: 16,
    color: "#00796b",
  },
  highRiskText: {
    color: "red",
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#d32f2f",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  goBackButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#0288d1",
    borderRadius: 5,
    alignItems: "center",
  },
  goBackButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ResultadosScreen1;
