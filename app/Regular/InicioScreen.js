import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

const tools = [
  { name: "Recordatorios", icon: "calendar-outline", color: "#FF6B6B" },
  { name: "RH", icon: "water-outline", color: "#6C5CE7" },
  { name: "Notas", icon: "book-outline", color: "#00B894" },
  { name: "Glucosa", icon: "pulse-outline", color: "#0984E3" },
  { name: "Obesidad", icon: "body-outline", color: "#E17055" },
  { name: "Cardio", icon: "heart-outline", color: "#D63031" },
  { name: "Consejos", icon: "bulb-outline", color: "#00CEC9" },
];

const InicioScreen = ({ navigation }) => {
  const [state, setState] = useState({
    fecha: "",
    modalVisible: false,
    loading: true,
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const obtenerFecha = () => {
    const today = new Date();
    const options = { weekday: "long", day: "numeric", month: "long" };

    let fechaFormateada = today.toLocaleDateString("es-ES", options);

    setState((prev) => ({
      ...prev,
      fecha:
        fechaFormateada.charAt(0).toUpperCase() +
        fechaFormateada.slice(1),
      loading: false,
    }));
  };

  useEffect(() => {
    setTimeout(obtenerFecha, 800);
  }, []);

  const toggleModal = () => {
    setState((prev) => ({
      ...prev,
      modalVisible: !prev.modalVisible,
    }));
  };

  const handleNavigation = (item) => {
    switch (item) {
      case "Recordatorios":
        navigation.navigate("Recordatorios");
        break;
      case "RH":
        navigation.navigate("GrupoScreen");
        break;
      case "Notas":
        navigation.navigate("NostasScreen");
        break;
      case "Glucosa":
        navigation.navigate("GlucosaScreen");
        break;
      case "Obesidad":
        navigation.navigate("ObesidadScreen");
        break;
      case "Cardio":
        navigation.navigate("CardioScreen");
        break;
      case "Consejos":
        navigation.navigate("ConsejoScreen");
        break;
    }
  };

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  if (state.loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#4A90E2"
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Bienvenido 👋</Text>
        <Text style={styles.date}>{state.fecha}</Text>
      </View>

      {/* BOTÓN CALENDARIO */}
      <TouchableOpacity
        onPress={toggleModal}
        style={styles.calendarButton}
      >
        <Ionicons name="calendar" size={20} color="#fff" />
        <Text style={styles.calendarText}> Ver calendario</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal visible={state.modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Calendar
              theme={{
                selectedDayBackgroundColor: "#4A90E2",
                todayTextColor: "#4A90E2",
                arrowColor: "#4A90E2",
              }}
            />

            <TouchableOpacity
              onPress={toggleModal}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* TITULO */}
      <Text style={styles.sectionTitle}>Tus herramientas</Text>

      {/* LISTA VERTICAL */}
      <FlatList
        data={tools}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
            }}
          >
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: item.color },
              ]}
              onPress={() => handleNavigation(item.name)}
              onPressIn={pressIn}
              onPressOut={pressOut}
            >
              <View style={styles.row}>
                <Ionicons
                  name={item.icon}
                  size={28}
                  color="#fff"
                />

                <Text style={styles.cardText}>
                  {item.name}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    marginTop: 30,
    marginBottom: 20,
  },

  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E1E1E",
  },

  date: {
    fontSize: 14,
    color: "#7A7A7A",
    marginTop: 3,
  },

  calendarButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4A90E2",
    padding: 13,
    borderRadius: 12,
    marginBottom: 20,
  },

  calendarText: {
    color: "#fff",
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E1E1E",
    marginBottom: 15,
  },

  card: {
    width: "100%",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 15,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },

  closeButton: {
    marginTop: 12,
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 10,
  },

  closeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
});

export default InicioScreen;