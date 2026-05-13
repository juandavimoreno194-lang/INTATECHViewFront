import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useUser } from '../Herramientas/UserContext';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const RecordatoriosScreen = ({ navigation }) => {
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');

  const handleSaveReminder = async () => {
    if (!selectedDate || !reminderTitle.trim()) {
      Alert.alert("Error", "Debes completar todos los campos.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "No se ha detectado un usuario autenticado.");
      return;
    }

    const formattedDate = moment(
      `${selectedDate} ${selectedTime}`,
      'YYYY-MM-DD HH:mm'
    ).format('YYYY-MM-DDTHH:mm:ss');

    try {
      const response = await fetch(`${API_URL}/recordatorios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          fecha: formattedDate.substring(0, 10),
          hora: formattedDate.substring(11, 19),
          titulo: reminderTitle,
        }),
      });

      if (response.ok) {
        Alert.alert("Éxito", `Recordatorio guardado para el ${selectedDate} a las ${selectedTime}`);
        setReminderTitle('');
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al guardar el recordatorio.");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No hay usuario registrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.title}>Recordatorios</Text>
      <Text style={styles.subtitle}>Organiza tus tareas y eventos</Text>

      {/* Calendario */}
      <View style={styles.card}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#4A90E2",
            },
          }}
          theme={{
            todayTextColor: "#4A90E2",
            arrowColor: "#4A90E2",
          }}
        />
      </View>

      {/* Inputs */}
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Tomar medicamento"
        value={reminderTitle}
        onChangeText={setReminderTitle}
      />

      <Text style={styles.label}>Hora</Text>
      <TextInput
        style={styles.input}
        placeholder="HH:MM"
        value={selectedTime}
        onChangeText={setSelectedTime}
      />

      {/* Botones */}
      <TouchableOpacity style={styles.button} onPress={handleSaveReminder}>
        <Text style={styles.buttonText}>Guardar Recordatorio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate('RecordatoriosGuardados')}
      >
        <Text style={styles.secondaryText}>Ver Recordatorios Guardados</Text>
      </TouchableOpacity>

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
    marginBottom: 20,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    elevation: 3,
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

  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
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

export default RecordatoriosScreen;