import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

// Pantallas
import InicioScreen from "./InicioScreen";
import UsuariosScreen from "./UsuariosScreen";
import EstadisticasScreen from "./EstadisticasScreen";
import ConfiguracionScreen from "./ConfiguracionScreen";

const Tab = createBottomTabNavigator();

const HomeAdminScreen = () => {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={{
        headerShown: false,

        // 🔥 NUEVO DISEÑO
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#4A90E2",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="home-outline" color={color} size={focused ? 26 : 22} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Usuarios"
        component={UsuariosScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="people-outline" color={color} size={focused ? 26 : 22} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Estadísticas"
        component={EstadisticasScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="bar-chart-outline" color={color} size={focused ? 26 : 22} />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Configuración"
        component={ConfiguracionScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconContainer}>
              <Icon name="settings-outline" color={color} size={focused ? 26 : 22} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    height: 65,

    backgroundColor: "#FFFFFF",
    borderRadius: 20,

    elevation: 10, // Android sombra
    shadowColor: "#000", // iOS sombra
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    borderTopWidth: 0,
  },

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HomeAdminScreen;