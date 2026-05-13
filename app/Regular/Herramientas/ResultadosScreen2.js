import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useUser } from "../Herramientas/UserContext";
import * as Notifications from "expo-notifications"; // Importa expo-notifications
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultadosScreen2 = ({ navigation }) => {
  const { user } = useUser();
  const [resultados, setResultados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false); // Estado para verificar si la notificación ya fue enviada

  // Función para obtener los resultados de colesterol desde la API
  const obtenerResultados = async () => {
    try {
      const response = await fetch(`${API_URL}/colesterol/${user.id}`);
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

  // Función para eliminar un resultado de colesterol
  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/colesterol/${id}`, {
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

  // Función para clasificar el riesgo según el nivel de colesterol
  const clasificarRiesgo = (nivel) => {
    if (nivel < 200) {
      return "Bajo";
    } else if (nivel >= 200 && nivel < 240) {
      return "Normal";
    } else if (nivel >= 240 && nivel < 300) {
      return "Alto";
    } else if (nivel >= 300) {
      return "Muy alto - ¡Dirígete al hospital!";
    } else {
      return "Nivel no válido";
    }
  };

  // Función para enviar notificación de colesterol
  const enviarNotificacion = async (titulo, mensaje) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensaje,
        },
        trigger: null, // La notificación será inmediata
      });
      console.log('Notificación de colesterol enviada: ', titulo, mensaje);
    } catch (error) {
      console.error('Error al enviar la notificación de colesterol:', error);
    }
  };

  useEffect(() => {
    obtenerResultados();

    // Verificar si la notificación ya fue enviada
    const checkNotificationStatus = async () => {
      const enviado = await AsyncStorage.getItem('notificacionColesterolEnviada');
      if (enviado === 'true') {
        setNotificacionEnviada(false); // Si la notificación ya fue enviada, evitamos enviarla de nuevo
      } else {
        setNotificacionEnviada(true);
      }
    };

    checkNotificationStatus(); // Verificar el estado de la notificación

  }, [user]);

  useEffect(() => {
    // Verificar si el riesgo de colesterol es muy alto y enviar la notificación solo una vez
    if (!notificacionEnviada) {
      resultados.forEach((item) => {
        if (item.nivel >= 300) {
          // Enviar notificación solo si el nivel es "Muy alto" y la notificación no ha sido enviada
          enviarNotificacion("¡Riesgo de Colesterol Alto!", "¡Tu nivel de colesterol es muy alto! Dirígete al hospital.");
          setNotificacionEnviada(true); // Marcar como enviada
          AsyncStorage.setItem('notificacionColesterolEnviada', 'true'); // Guardar el estado en AsyncStorage
        }
      });
    }
  }, [resultados, notificacionEnviada]);

  const renderItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Text style={styles.resultText}>Nivel de Colesterol: {item.nivel}</Text>
      <Text style={styles.resultText}>Fecha: {item.fecha}</Text>
      <Text
        style={[
          styles.resultText,
          clasificarRiesgo(item.nivel) === "Muy alto - ¡Dirígete al hospital!" && styles.highRiskText,
        ]}
      >
        Riesgo: {clasificarRiesgo(item.nivel)}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => eliminarResultado(item.id)}
      >
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados de Colesterol</Text>
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
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

export default ResultadosScreen2;
