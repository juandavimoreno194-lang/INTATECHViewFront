import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useUser } from './Herramientas/UserContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ActividadScreen = ({ navigation }) => {
  const { user } = useUser();
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerActividad = async () => {
      try {
        console.log("Usuario:", user);

        const response = await fetch(
          `${API_URL}/actividad?usuario_id=${user.id}`
        );

        const data = await response.json();

        console.log("Respuesta backend:", data);

        if (response.ok) {
          setActividad(data);
        } else {
          Alert.alert('Error', data.message);
        }
      } catch (error) {
        console.log(error);
        Alert.alert('Error', 'No se pudo conectar al servidor');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      obtenerActividad();
    }
  }, [user]);

  // 🔥 GENERAR PDF
  const generarPDF = async () => {
    try {
      const html = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            
            <h1 style="color:#4A90E2;">Reporte de Actividad</h1>

            <h2>Datos del Usuario</h2>
            <p><b>Nombre:</b> ${actividad.user_name}</p>
            <p><b>Email:</b> ${actividad.user_email}</p>

            <h2>Salud</h2>
            <p><b>BPM:</b> ${actividad.bpm ?? 'Sin datos'}</p>
            <p><b>Riesgo cardiovascular:</b> ${actividad.riesgo_cardiovascular ?? 'Sin datos'}</p>
            <p><b>Glucosa:</b> ${actividad.glucosa_level}</p>
            <p><b>Riesgo glucosa:</b> ${actividad.glucosa_riesgo}</p>
            <p><b>IMC:</b> ${actividad.obesidad_imc}</p>

            <h2>Otros</h2>
            <p><b>Nota:</b> ${actividad.nota}</p>
            <p><b>Recordatorio:</b> ${actividad.recordatorio}</p>
            <p><b>Fecha:</b> ${actividad.fecha_recordatorio}</p>
            <p><b>Hora:</b> ${actividad.hora_recordatorio}</p>

            <br/><br/>
            <p style="color:gray;">Generado automáticamente</p>

          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      console.log("PDF creado en:", uri);

      await Sharing.shareAsync(uri);

    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo generar el PDF");
    }
  };

  return (
    <ScrollView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Actividad del usuario</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 30 }} />
      ) : !actividad ? (
        <Text style={styles.noData}>No hay datos</Text>
      ) : (
        <View style={styles.card}>

          <Item label="Nombre" value={actividad.user_name} />
          <Item label="Email" value={actividad.user_email} />

          <Item label="Riesgo cardiovascular" value={actividad.riesgo_cardiovascular} />
          <Item label="BPM" value={actividad.bpm} />

          <Item label="Glucosa" value={actividad.glucosa_level} />
          <Item label="Riesgo glucosa" value={actividad.glucosa_riesgo} />

          <Item label="IMC" value={actividad.obesidad_imc} />

          <Item label="Nota" value={actividad.nota} />

          <Item label="Recordatorio" value={actividad.recordatorio} />
          <Item label="Fecha" value={actividad.fecha_recordatorio} />
          <Item label="Hora" value={actividad.hora_recordatorio} />

        </View>
      )}

      {/* 🔥 BOTÓN PDF */}
      {actividad && (
        <TouchableOpacity style={styles.button} onPress={generarPDF}>
          <Text style={styles.buttonText}>Descargar PDF</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

// 🔹 ITEM
const Item = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>
      {value !== null && value !== undefined ? value.toString() : "Sin datos"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  header: {
    backgroundColor: '#4A90E2',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
  },

  item: { marginBottom: 12 },

  label: { fontSize: 13, color: '#7A7A7A' },

  value: { fontSize: 16, fontWeight: 'bold', color: '#1E1E1E' },

  noData: { textAlign: 'center', marginTop: 30, color: '#7A7A7A' },

  button: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },

  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ActividadScreen;