import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { useUser } from './Herramientas/UserContext';
import { MaterialIcons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const PerfilScreen = ({ navigation }) => {
  const { user } = useUser();
  const [perfilData, setPerfilData] = useState(null);

  const fetchPerfilData = async () => {
    try {
      const response = await fetch(`${API_URL}/datos/${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setPerfilData(data.data || null);
      } else {
        setPerfilData(null);
        Alert.alert('Error', 'Perfil no encontrado.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar perfil');
    }
  };

  useEffect(() => {
    if (user?.id) fetchPerfilData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchPerfilData);
    return unsubscribe;
  }, [navigation]);

  const handleEdit = () => {
    navigation.navigate('EditarPerfilScreen2', { userId: user.id, perfilData });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No hay usuario</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="person" size={80} color="#fff" />
        <Text style={styles.name}>
          {perfilData?.nombre || "Usuario"}
        </Text>
      </View>

      {/* Tarjeta */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Información personal</Text>

        {perfilData ? (
          <>
            <Item label="Género" value={perfilData.genero} />
            <Item label="Altura" value={perfilData.altura ? `${perfilData.altura} m` : null} />
            <Item label="Peso" value={perfilData.peso ? `${perfilData.peso} kg` : null} />
            <Item label="Edad" value={perfilData.edad ? `${perfilData.edad} años` : null} />
            <Item label="Tipo de sangre" value={perfilData.tipo_sangre} />

            <TouchableOpacity style={styles.button} onPress={handleEdit}>
              <Text style={styles.buttonText}>Editar perfil</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.noData}>No tienes información registrada</Text>

            <TouchableOpacity style={styles.button} onPress={handleEdit}>
              <Text style={styles.buttonText}>Crear perfil</Text>
            </TouchableOpacity>
          </>
        )}

      </View>

    </ScrollView>
  );
};

// 🔹 Componente reutilizable
const Item = ({ label, value }) => (
  <View style={styles.item}>
    <Text style={styles.itemLabel}>{label}</Text>
    <Text style={styles.itemValue}>{value || "Sin datos"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },

  card: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1E1E1E',
  },

  item: {
    marginBottom: 12,
  },

  itemLabel: {
    fontSize: 13,
    color: '#7A7A7A',
  },

  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
  },

  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  noData: {
    textAlign: 'center',
    color: '#7A7A7A',
    marginBottom: 10,
  },

  error: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
  },
});

export default PerfilScreen;