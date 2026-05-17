// app/App.js

import React, { useEffect } from "react";
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "expo-notifications functionality is not fully supported",
]);
import { enableScreens } from "react-native-screens";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Importa el proveedor del contexto
import { UserProvider, useUser } from "./app/Regular/Herramientas/UserContext";
import { initApiUrl } from "./app/Regular/Herramientas/apiConfig";

// Importar el componente de notificaciones
import NotificationHandler from './app/Regular/Herramientas/NotificationHandler';
import Toast from './app/Regular/Herramientas/Toast';
import ConfirmModal from './app/Regular/Herramientas/confirm';
import GlobalAlarmModal from './app/Regular/Herramientas/GlobalAlarmModal';

// Importar las vistas
import RegistroUserScreen from "./app/RegistroUserScreen";
import LoginScreen from "./app/LoginScreen";
import ForgotPasswordScreen from "./app/ForgotPasswordScreen";
import HomeAdminScreen from "./app/Admin/HomeAdminScreen";
import HomeRegularScreen from "./app/Regular/HomeRegularScreen";
import InicioScreen from "./app/Regular/InicioScreen";
import RecordatoriosScreen from "./app/Regular/Herramientas/RecordatoriosScreen";
import RecordatoriosGuardadosScreen from "./app/Regular/Herramientas/RecordatoriosGuardadosScreen";

import CambiarContraseñaScreen from "./app/Regular/CambiarContraseñaScreen"; 
import GlucosaScreen from "./app/Regular/Herramientas/GlucosaScreen";
import ResultadosScreen from "./app/Regular/Herramientas/ResultadosScreen";
import ResultadosScreen4 from "./app/Regular/Herramientas/ResultadosScreen4";
import ResultadosScreen5 from "./app/Regular/Herramientas/ResultadosScreen5";



import GrupoScreen from "./app/Regular/Herramientas/GrupoScreen"; 

import ObesidadScreen from "./app/Regular/Herramientas/ObesidadScreen"; 
import CardioScreen from "./app/Regular/Herramientas/CardioScreen"; 
import ConsejoScreen from "./app/Regular/Herramientas/ConsejoScreen"; 
import EditarPerfilScreen2 from "./app/Regular/EditarPerfilScreen2"; 
import ActividadScreen from "./app/Regular/ActividadScreen";
import NostasScreen from "./app/Regular/Herramientas/NostasScreen"; 
import MisNotasScreen from "./app/Regular/Herramientas/MisNotasScreen";
import OnboardingScreen from "./app/OnboardingScreen";

enableScreens();

const Stack = createStackNavigator();

function AppContent() {
  const { darkMode } = useUser();
  useEffect(() => { initApiUrl(); }, []);

  const navTheme = darkMode ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: '#121212', card: '#1E1E1E' },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#F5F7FA' },
  };

  return (
    <>
      <NotificationHandler />
      <Toast />
      <ConfirmModal />
      <GlobalAlarmModal />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
            initialRouteName="LoginScreen"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
            {/* Pantallas de Autenticación */}
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegistroUserScreen" component={RegistroUserScreen} />
            <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />

            {/* Pantallas de Administración */}
            <Stack.Screen name="HomeAdminScreen" component={HomeAdminScreen} />

            {/* Pantallas para Usuarios Regulares */}
            <Stack.Screen name="HomeRegularScreen" component={HomeRegularScreen} />
            <Stack.Screen name="Inicio" component={InicioScreen} />
            <Stack.Screen name="Recordatorios" component={RecordatoriosScreen} />
            <Stack.Screen name="RecordatoriosGuardados" component={RecordatoriosGuardadosScreen} />
            <Stack.Screen name="CambiarContrasenaScreen" component={CambiarContraseñaScreen} />
            <Stack.Screen name="ActividadScreen" component={ActividadScreen} />
            <Stack.Screen name="GlucosaScreen" component={GlucosaScreen} />
            <Stack.Screen name="ResultadosScreen" component={ResultadosScreen} />
            <Stack.Screen name="ResultadosScreen4" component={ResultadosScreen4} />
            <Stack.Screen name="ResultadosScreen5" component={ResultadosScreen5} />
            
            <Stack.Screen name="GrupoScreen" component={GrupoScreen} />
           
            <Stack.Screen name="ObesidadScreen" component={ObesidadScreen} />
            <Stack.Screen name="CardioScreen" component={CardioScreen} />
            <Stack.Screen name="ConsejoScreen" component={ConsejoScreen} />
            <Stack.Screen name="NostasScreen" component={NostasScreen} />
            <Stack.Screen name="MisNotasScreen" component={MisNotasScreen} />
    

            {/* Pantalla de Edición de Perfil */}
            <Stack.Screen name="EditarPerfilScreen2" component={EditarPerfilScreen2} />

          </Stack.Navigator>
        </NavigationContainer>
      </>
    );
  }

export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </UserProvider>
  );
}
