import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import { useUser } from "../Herramientas/UserContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultadosScreen4 = ({ navigation }) => {
  const { user } = useUser();
  const [resultados, setResultados] = useState([]);

  const obtenerResultados = async () => {
    try {
      const response = await fetch(`${API_URL}/obesidad?usuario_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      } else {
        Alert.alert("Error", "No se pudieron obtener los resultados.");
      }
    } catch {
      Alert.alert("Error", "Problema al conectar con el servidor.");
    }
  };

  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/obesidad/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResultados(prev => prev.filter(item => item.id !== id));
        Alert.alert("Éxito", "Resultado eliminado.");
      } else {
        Alert.alert("Error", "No se pudo eliminar.");
      }
    } catch {
      Alert.alert("Error", "Problema al eliminar.");
    }
  };

  const clasificarRiesgo = (imc) => {
    if (imc < 18.5) return "Bajo peso";
    else if (imc < 24.9) return "Peso normal";
    else if (imc < 29.9) return "Sobrepeso";
    else return "Obesidad";
  };

  const formatearFecha = (fecha) => {
    const d = new Date(fecha);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  };

  useEffect(() => {
    obtenerResultados();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Resultados de Obesidad</Text>
      <Text style={styles.subtitle}>
        Historial de tu índice de masa corporal (IMC)
      </Text>

      {resultados.map((item) => {
        const riesgo = clasificarRiesgo(item.imc);

        return (
          <View key={item.id} style={styles.card}>

            <Text style={styles.fecha}>
              {formatearFecha(item.fecha)}
            </Text>

            <Text style={styles.valor}>
              IMC: {item.imc}
            </Text>

            <Text style={styles.riesgo}>
              Riesgo: {riesgo}
            </Text>

            {riesgo === "Obesidad" && (
              <Text style={styles.alerta}>
                ⚠️ Riesgo alto, consulta un especialista
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

export default ResultadosScreen4;