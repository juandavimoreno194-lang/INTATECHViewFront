import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from './Herramientas/theme';

import InicioScreen from "./InicioScreen";
import PerfilScreen from "./PerfilScreen";
import ConfiguracionScreen from "./ConfiguracionScreen";

const Tab = createBottomTabNavigator();

const HomeRegularScreen = () => {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          elevation: 10,
          height: 60 + (Platform.OS === 'android' ? insets.bottom : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Inicio") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Configuración") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={InicioScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
      <Tab.Screen name="Configuración" component={ConfiguracionScreen} />
    </Tab.Navigator>
  );
};

export default HomeRegularScreen;
