import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useUser } from "../Herramientas/UserContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultadosScreen3 = ({ navigation }) => {
  const { user } = useUser();
  const [resultados, setResultados] = useState([]);

  // Función para obtener los resultados de tensión arterial desde la API
  const obtenerResultados = async () => {
    try {
      const response = await fetch(`${API_URL}/tension/${user.id}`);
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

  // Función para eliminar un resultado de tensión arterial
  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tension/${id}`, {
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

  // Función para clasificar el riesgo según el nivel de tensión
  const clasificarRiesgo = (sistolica, diastolica) => {
    if (sistolica < 120 && diastolica < 80) {
      return "Normal";
    } else if ((sistolica >= 120 && sistolica < 130) && diastolica < 80) {
      return "Elevada";
    } else if ((sistolica >= 130 && sistolica < 140) || (diastolica >= 80 && diastolica < 90)) {
      return "Hipertensión Etapa 1";
    } else if (sistolica >= 140 || diastolica >= 90) {
      return "Hipertensión Etapa 2 - ¡Consulta a un médico!";
    } else {
      return "Nivel no válido";
    }
  };

  useEffect(() => {
    obtenerResultados();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados de Tensión Arterial</Text>
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>Sistólica: {item.sistolica} mmHg</Text>
            <Text style={styles.resultText}>Diastólica: {item.diastolica} mmHg</Text>
            <Text style={styles.resultText}>Fecha: {item.fecha}</Text>
            <Text
              style={[
                styles.resultText,
                clasificarRiesgo(item.sistolica, item.diastolica) === "Hipertensión Etapa 2 - ¡Consulta a un médico!" && styles.highRiskText,
              ]}
            >
              Riesgo: {clasificarRiesgo(item.sistolica, item.diastolica)}
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

export default ResultadosScreen3;
