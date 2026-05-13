import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';

const AlergiasScreen = ({ route }) => {
  const { userId } = route.params;
  const [alergiasData, setAlergiasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlergiasData = async () => {
      try {
        const response = await fetch(`${API_URL}/alergias/${userId}`);
        const data = await response.json();
        setAlergiasData(data);
      } catch (error) {
        console.error('Error fetching alergias data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlergiasData();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#00796b" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alergias</Text>
      <FlatList
        data={alergiasData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Fecha: {item.fecha}</Text>
            <Text>Alergia: {item.descripcion}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AlergiasScreen;
