// app/App.js

import React, { useEffect } from "react";
import { enableScreens } from "react-native-screens";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Importa el proveedor del contexto
import { UserProvider } from "./app/Regular/Herramientas/UserContext";

// Importar el componente de notificaciones
import NotificationHandler from './app/Regular/Herramientas/NotificationHandler'; // Ruta correcta del archivo

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
import ResultadosScreen1 from "./app/Regular/Herramientas/ResultadosScreen1";
import ResultadosScreen2 from "./app/Regular/Herramientas/ResultadosScreen2";
import ResultadosScreen3 from "./app/Regular/Herramientas/ResultadosScreen3";
import ResultadosScreen4 from "./app/Regular/Herramientas/ResultadosScreen4";
import ResultadosScreen5 from "./app/Regular/Herramientas/ResultadosScreen5";

import PesoScreen from "./app/Regular/Herramientas/PesoScreen";
import TensionScreen from "./app/Regular/Herramientas/TensionScreen";
import TiroidesScreen from "./app/Regular/Herramientas/TiroidesScreen";
import AlergiasScreen from "./app/Regular/Herramientas/AlergiasScreen"; 
import GrupoScreen from "./app/Regular/Herramientas/GrupoScreen"; 
import ColesterolScreen from "./app/Regular/Herramientas/ColesterolScreen"; 
import ObesidadScreen from "./app/Regular/Herramientas/ObesidadScreen"; 
import CardioScreen from "./app/Regular/Herramientas/CardioScreen"; 
import ConsejoScreen from "./app/Regular/Herramientas/ConsejoScreen"; 
import EditarPerfilScreen2 from "./app/Regular/EditarPerfilScreen2"; 
import ActividadScreen from "./app/Regular/ActividadScreen";
import NostasScreen from "./app/Regular/Herramientas/NostasScreen"; 
import MisNotasScreen from "./app/Regular/Herramientas/MisNotasScreen"; 

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        {/* Agregar el componente de manejo de notificaciones */}
        <NotificationHandler /> 
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="LoginScreen"
            screenOptions={{ headerShown: false }}
          >
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
            <Stack.Screen name="CambiarContraseñaScreen" component={CambiarContraseñaScreen} />
            <Stack.Screen name="ActividadScreen" component={ActividadScreen} />
            <Stack.Screen name="GlucosaScreen" component={GlucosaScreen} />
            <Stack.Screen name="TiroidesScreen" component={TiroidesScreen} />
            <Stack.Screen name="ResultadosScreen" component={ResultadosScreen} />
            <Stack.Screen name="ResultadosScreen1" component={ResultadosScreen1} />
            <Stack.Screen name="ResultadosScreen2" component={ResultadosScreen2} />
            <Stack.Screen name="ResultadosScreen3" component={ResultadosScreen3} />
            <Stack.Screen name="ResultadosScreen4" component={ResultadosScreen4} />
            <Stack.Screen name="ResultadosScreen5" component={ResultadosScreen5} />
            <Stack.Screen name="PesoScreen" component={PesoScreen} />
            <Stack.Screen name="TensionScreen" component={TensionScreen} />
            <Stack.Screen name="AlergiasScreen" component={AlergiasScreen} />
            <Stack.Screen name="GrupoScreen" component={GrupoScreen} />
            <Stack.Screen name="ColesterolScreen" component={ColesterolScreen} />
            <Stack.Screen name="ObesidadScreen" component={ObesidadScreen} />
            <Stack.Screen name="CardioScreen" component={CardioScreen} />
            <Stack.Screen name="ConsejoScreen" component={ConsejoScreen} />
            <Stack.Screen name="NostasScreen" component={NostasScreen} />
            <Stack.Screen name="MisNotasScreen" component={MisNotasScreen} />
    

            {/* Pantalla de Edición de Perfil */}
            <Stack.Screen name="EditarPerfilScreen2" component={EditarPerfilScreen2} />

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}
