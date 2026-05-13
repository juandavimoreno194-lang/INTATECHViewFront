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

const ColesterolScreen = ({ navigation }) => {
  const { user } = useUser();
  const [nivel, setNivel] = useState("");

  const handleEnviarResultados = async () => {
    const nivelColesterol = parseFloat(nivel);

    if (isNaN(nivelColesterol)) {
      Alert.alert("Error", "Ingresa un valor válido.");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "No se pudo obtener el usuario.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/colesterol`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nivel: nivelColesterol,
          usuario_id: user.id,
        }),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Resultado enviado correctamente.");
        navigation.navigate("ResultadosScreen2");
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el resultado.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Control de Colesterol</Text>
      <Text style={styles.subtitle}>
        Registra tu nivel de colesterol
      </Text>

      {/* Input */}
      <Text style={styles.label}>Nivel de colesterol</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 180 mg/dL"
        keyboardType="numeric"
        value={nivel}
        onChangeText={setNivel}
      />

      {/* Botón principal */}
      <TouchableOpacity style={styles.button} onPress={handleEnviarResultados}>
        <Text style={styles.buttonText}>Enviar Resultados</Text>
      </TouchableOpacity>

      {/* Botón secundario */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("ResultadosScreen2")}
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  button: {
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
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

export default ColesterolScreen;