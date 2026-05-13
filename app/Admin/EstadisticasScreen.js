import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, Alert, Dimensions, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const EstadisticasScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/estadisticas-enfermedades`);
      const responseBody = await response.json();

      if (response.ok && responseBody.success) {
        if (!Array.isArray(responseBody.data) || responseBody.data.length === 0) {
          throw new Error("Datos vacíos.");
        }

        const enfermedades = responseBody.data.map((item) => item.enfermedad);
        const riesgos = responseBody.data.map((item) => {
          const riesgo = parseFloat(item.riesgo_promedio);
          return isNaN(riesgo) ? 0 : riesgo;
        });

        setData({ labels: enfermedades, values: riesgos });
      } else {
        Alert.alert("Error", responseBody.message || "No se pudieron obtener las estadísticas.");
      }
    } catch (error) {
      Alert.alert("Error", "Problema al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEstadisticas();
    }, [])
  );

  const renderBars = () => {
    if (!data || data.values.length === 0) {
      return <Text style={styles.empty}>No hay datos para mostrar.</Text>;
    }

    const maxRiesgo = Math.max(...data.values);

    return data.values.map((value, index) => {
      const barHeight = maxRiesgo > 0 ? (value / maxRiesgo) * 180 : 0;

      return (
        <View key={index} style={styles.barContainer}>
          <View style={[styles.bar, { height: barHeight }]} />
          <Text numberOfLines={1} style={styles.barLabel}>
            {data.labels[index]}
          </Text>
          <Text style={styles.barValue}>{value}</Text>
        </View>
      );
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>Estadísticas</Text>
      <Text style={styles.subtitle}>
        Riesgo promedio por enfermedad
      </Text>

      {loading ? (
        <Text style={styles.loading}>Cargando estadísticas...</Text>
      ) : (
        <View style={styles.chart}>
          {renderBars()}
        </View>
      )}

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

  loading: {
    textAlign: 'center',
    color: '#7A7A7A',
  },

  empty: {
    textAlign: 'center',
    color: '#7A7A7A',
  },

  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 220,
  },

  barContainer: {
    alignItems: "center",
    marginHorizontal: 6,
  },

  bar: {
    width: 30,
    backgroundColor: "#4A90E2",
    borderRadius: 8,
  },

  barLabel: {
    marginTop: 5,
    fontSize: 11,
    color: '#4A4A4A',
    maxWidth: 60,
    textAlign: 'center',
  },

  barValue: {
    fontSize: 12,
    color: '#1E1E1E',
    fontWeight: 'bold',
  },
});

export default EstadisticasScreen;