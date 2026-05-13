import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Switch
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from './Herramientas/UserContext';

const ConfiguracionScreen = () => {
  const navigation = useNavigation();
  const { user, darkMode, toggleDarkMode } = useUser(); // 🔥 nuevo

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          onPress: () => navigation.navigate("LoginScreen"),
        },
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate("CambiarContraseñaScreen");
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Eliminar cuenta",
      "Esta acción no se puede deshacer",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/delete-account`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
              });

              const data = await response.json();

              if (response.ok && data.success) {
                Alert.alert("Cuenta eliminada");
                navigation.navigate("LoginScreen");
              } else {
                Alert.alert("Error", data.message);
              }
            } catch {
              Alert.alert("Error", "No se pudo eliminar la cuenta");
            }
          },
        },
      ]
    );
  };

  const handleViewActivityHistory = () => {
    navigation.navigate("ActividadScreen");
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>

      {/* Header */}
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Ionicons name="settings-outline" size={70} color="#fff" />
        <Text style={styles.title}>Configuración</Text>
      </View>

      {/* Opciones */}
      <View style={[styles.card, darkMode && styles.darkCard]}>

        <Option
          icon="lock-closed-outline"
          text="Cambiar contraseña"
          onPress={handleChangePassword}
          darkMode={darkMode}
        />

        <Option
          icon="time-outline"
          text="Historial de actividad"
          onPress={handleViewActivityHistory}
          darkMode={darkMode}
        />

        {/* 🔥 NUEVO: MODO OSCURO */}
        <View style={styles.option}>
          <Ionicons name="moon-outline" size={22} color="#4A90E2" />
          <Text style={[styles.optionText, darkMode && styles.darkText]}>
            Modo oscuro
          </Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>

        <Option
          icon="trash-outline"
          text="Eliminar cuenta"
          onPress={handleDeleteAccount}
          danger
          darkMode={darkMode}
        />

      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

// 🔹 Componente reutilizable
const Option = ({ icon, text, onPress, danger, darkMode }) => (
  <TouchableOpacity style={styles.option} onPress={onPress}>
    <Ionicons name={icon} size={22} color={danger ? "#E74C3C" : "#4A90E2"} />
    <Text style={[
      styles.optionText,
      danger && { color: "#E74C3C" },
      darkMode && styles.darkText
    ]}>
      {text}
    </Text>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  darkContainer: {
    backgroundColor: "#121212",
  },

  header: {
    backgroundColor: "#4A90E2",
    paddingVertical: 40,
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  darkHeader: {
    backgroundColor: "#1E1E1E",
  },

  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 15,
    padding: 10,
    elevation: 4,
  },

  darkCard: {
    backgroundColor: "#1E1E1E",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  optionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1E1E1E",
  },

  darkText: {
    color: "#fff",
  },

  logout: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#E74C3C",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ConfiguracionScreen;