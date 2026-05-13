import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import 'core-js/stable/atob';
import { useUser } from './Regular/Herramientas/UserContext';

function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const { setUser } = useUser();

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    const iniciarSesion = () => {
        if (email === '' || password === '') {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        .then(res => res.json())
        .then(data => {
            if (data?.token) {
                const decodedToken = jwtDecode(data.token);

                setUser({ id: decodedToken.id, rol: decodedToken.rol });

                if (decodedToken.rol === 'ROL_ADMIN') {
                    navigation.replace('HomeAdminScreen');
                } else if (decodedToken.rol === 'ROL_REG') {
                    navigation.replace('HomeRegularScreen');
                } else {
                    Alert.alert('Error', 'Rol desconocido');
                }
            } else {
                Alert.alert('Error', data.error || 'Error desconocido');
            }
        })
        .catch(() => {
            Alert.alert('Error', 'Error al iniciar sesión');
        });
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Inicio de sesión</Text>
            <Text style={styles.subtitle}>
                Inicia sesión para acceder a tu cuenta
            </Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
                placeholder="Ingresa tu email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />

            {/* Password */}
            <Text style={styles.label}>contraseña</Text>
            <TextInput
                placeholder="••••••"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                style={styles.input}
            />

            {/* Forgot password */}
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón */}
            <TouchableOpacity style={styles.button} onPress={iniciarSesion}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>

        

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 25,
        justifyContent: 'center',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E1E1E',
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 14,
        color: '#7A7A7A',
        marginBottom: 30,
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

    forgot: {
        alignSelf: 'flex-end',
        color: '#4A90E2',
        marginBottom: 20,
        fontSize: 13,
    },

    button: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },

    footerText: {
        color: '#7A7A7A',
    },

    signup: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
});

export default LoginScreen;