import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import { useUser } from "../Herramientas/UserContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TiroidesScreen = ({ navigation }) => {
  const { user } = useUser();
  const [nivelHormonal, setNivelHormonal] = useState("");

  const handleEnviarResultados = async () => {
    const nivel = parseFloat(nivelHormonal);

    if (isNaN(nivel)) {
      Alert.alert("Error", "Ingresa un valor válido.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "No se pudo obtener el usuario.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/tiroides?nivel_hormonal=${nivel}&usuario_id=${user.id}`,
        { method: "GET" }
      );

      if (response.ok) {
        Alert.alert("Éxito", "Resultado enviado correctamente.");
        navigation.navigate("ResultadosScreen1");
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron enviar los datos.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Control de Tiroides</Text>
      <Text style={styles.subtitle}>
        Registra tu nivel hormonal para seguimiento
      </Text>

      {/* Input */}
      <Text style={styles.label}>Nivel hormonal</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 2.5"
        keyboardType="numeric"
        value={nivelHormonal}
        onChangeText={setNivelHormonal}
      />

      {/* Botón principal */}
      <TouchableOpacity style={styles.button} onPress={handleEnviarResultados}>
        <Text style={styles.buttonText}>Guardar Datos</Text>
      </TouchableOpacity>

      {/* Botón secundario */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("ResultadosScreen1")}
      >
        <Text style={styles.secondaryText}>Ver mis resultados</Text>
      </TouchableOpacity>

      {/* Volver */}
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
    backgroundColor: "#F5F7FA",
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: 5,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#7A7A7A",
    marginBottom: 25,
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 5,
  },

  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  button: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  secondaryButton: {
    alignItems: "center",
    marginBottom: 10,
  },

  secondaryText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default TiroidesScreen;