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

const GlucosaScreen = ({ navigation }) => {
  const { user } = useUser();
  const [nivel, setNivel] = useState("");
  const [rangoRiesgo, setRangoRiesgo] = useState("");

  const evaluarRiesgo = (nivelGlucosa) => {
    if (nivelGlucosa < 70) return "Bajo";
    else if (nivelGlucosa <= 100) return "Normal";
    else if (nivelGlucosa <= 180) return "Moderado";
    else if (nivelGlucosa <= 300) return "Alto";
    else return "Muy alto";
  };

  const handleEnviarResultados = async () => {
    const nivelGlucosa = parseFloat(nivel);

    if (isNaN(nivelGlucosa)) {
      Alert.alert("Error", "Por favor ingresa un valor válido para la glucosa.");
      return;
    }

    const riesgo = evaluarRiesgo(nivelGlucosa);
    setRangoRiesgo(riesgo);

    try {
      const response = await fetch(`${API_URL}/glucosa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nivel: nivelGlucosa,
          usuario_id: user.id,
          rango_riesgo: riesgo,
        }),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Resultado enviado correctamente.");
        navigation.navigate("ResultadosScreen");
      } else {
        Alert.alert("Error", "Hubo un problema al enviar los resultados.");
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al enviar los resultados.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Control de Glucosa</Text>
      <Text style={styles.subtitle}>
        Registra tu nivel de glucosa en sangre
      </Text>

      {/* Input */}
      <Text style={styles.label}>Nivel de glucosa</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 95 mg/dL"
        keyboardType="numeric"
        value={nivel}
        onChangeText={setNivel}
      />

      {/* Resultado */}
      {rangoRiesgo !== "" && (
        <Text style={styles.resultado}>
          Nivel de riesgo: {rangoRiesgo}
        </Text>
      )}

      {/* Botón principal */}
      <TouchableOpacity style={styles.button} onPress={handleEnviarResultados}>
        <Text style={styles.buttonText}>Guardar Resultado</Text>
      </TouchableOpacity>

      {/* Botón secundario */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("ResultadosScreen")}
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
    backgroundColor: '#F5F7FA',
    padding: 20,
    justifyContent: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 5,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 25,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    color: '#4A4A4A',
    marginBottom: 5,
  },

  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  resultado: {
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 10,
    fontWeight: '500',
  },

  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  secondaryButton: {
    alignItems: 'center',
    marginBottom: 10,
  },

  secondaryText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default GlucosaScreen;