import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '../Herramientas/UserContext'; // Asegúrate de tener el UserContext
import * as Notifications from 'expo-notifications'; // Importa expo-notifications
import { useFocusEffect } from '@react-navigation/native'; // Hook para usar el foco de la pantalla

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const ResultadosScreen5 = ({ navigation }) => {
  const { user } = useUser(); // Asegúrate de que tienes el contexto de usuario
  const [resultados, setResultados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false); // Estado para verificar si la notificación ya fue enviada

  useFocusEffect(
    React.useCallback(() => {
      const obtenerResultados = async () => {
        try {
          const response = await fetch(`${API_URL}/cardio?usuario_id=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setResultados(data);
          } else {
            const data = await response.json();
            Alert.alert('Error', data.message || 'No se pudieron obtener los resultados');
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'Hubo un problema al obtener los resultados.');
        }
      };

      if (user && user.id) {
        obtenerResultados();
      }
    }, [user])
  );

  // Función para clasificar el riesgo cardiovascular
  const clasificarRiesgo = (riesgo) => {
    if (riesgo === "Muy alto") {
      return { text: "Muy Alto", style: styles.highRiskText };
    } else if (riesgo === "Infarto") {
      // Verificar si ya se ha enviado la notificación
      if (!notificacionEnviada) {
        // Enviar solo una vez la notificación de infarto
        enviarNotificacion("¡Riesgo de Infarto!", "¡Vas a tener un infarto! Corre a un hospital.");
        setNotificacionEnviada(true); // Marcar como enviada
      }
      return { text: "Infarto", style: styles.criticalRiskText };
    }
    return { text: riesgo, style: styles.resultadoText };
  };

  // Función para enviar notificación de infarto
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

  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cardio/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert('Éxito', 'Resultado eliminado correctamente.');
        // Actualizar la lista de resultados después de eliminar
        setResultados(resultados.filter(item => item.id !== id));
      } else {
        Alert.alert('Error', 'No se pudo eliminar el resultado.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Hubo un problema al eliminar el resultado.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.resultadoContainer}>
      <Text style={styles.resultadoText}>Fecha: {item.fecha}</Text>
      <Text style={styles.resultadoText}>Frecuencia Cardíaca: {item.frecuencia_cardiaca} lpm</Text>
      <Text style={styles.resultadoText}>Presión Arterial: {item.presion_arterial} mmHg</Text>
      <Text style={[styles.resultadoText, clasificarRiesgo(item.riesgo_cardiovascular).style]}>
        Riesgo Cardiovascular: {clasificarRiesgo(item.riesgo_cardiovascular).text}
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
      <Text style={styles.header}>Mis Resultados</Text>
      <FlatList
        data={resultados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.goBackButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultadoContainer: {
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  resultadoText: {
    fontSize: 16,
    color: '#00796b',
  },
  highRiskText: {
    color: 'red',
    fontWeight: 'bold',
  },
  criticalRiskText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 18,
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  goBackButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#0288d1',
    borderRadius: 5,
    alignItems: 'center',
  },
  goBackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultadosScreen5;
