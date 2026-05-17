import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Platform,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import 'core-js/stable/atob';
import { useUser } from './Regular/Herramientas/UserContext';
import { useTheme } from './Regular/Herramientas/theme';
import { showAlert } from './Regular/Herramientas/Toast';
import { getApiUrl } from './Regular/Herramientas/apiConfig';

function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigation = useNavigation();
    const { setUser } = useUser();
    const colors = useTheme();

    const apiUrl = getApiUrl();

    const iniciarSesion = () => {
        setErrorMsg('');
        if (email === '' || password === '') {
            const msg = 'Todos los campos son obligatorios';
            if (Platform.OS === 'web') setErrorMsg(msg);
            else showAlert('Error', msg, 'error');
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
                setUser({ id: decodedToken.id, nombre: decodedToken.nombre, rol: decodedToken.rol, dark_mode: data.dark_mode });

                if (decodedToken.rol === 'ROL_ADMIN') {
                    navigation.replace('HomeAdminScreen');
                } else if (decodedToken.rol === 'ROL_REG') {
                    navigation.replace('HomeRegularScreen');
                } else {
                    const msg = 'Rol desconocido';
                    if (Platform.OS === 'web') setErrorMsg(msg);
                    else showAlert('Error', msg, 'error');
                }
            } else {
                const msg = data.error || 'Credenciales inválidas';
                if (Platform.OS === 'web') setErrorMsg(msg);
                else showAlert('Error', msg, 'error');
            }
        })
        .catch(() => {
            const msg = 'Error al conectar con el servidor';
            if (Platform.OS === 'web') setErrorMsg(msg);
            else showAlert('Error', msg, 'error');
        });
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Inicio de sesión</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Inicia sesión para acceder a tu cuenta
            </Text>

            {errorMsg !== '' && (
                <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: colors.danger }]}>
                    <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
                </View>
            )}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
                placeholder="Ingresa tu email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={(t) => { setEmail(t); setErrorMsg(''); }}
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
            <TextInput
                placeholder="••••••"
                placeholderTextColor={colors.textSecondary}
                value={password}
                secureTextEntry
                onChangeText={(t) => { setPassword(t); setErrorMsg(''); }}
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                <Text style={[styles.forgot, { color: colors.primary }]}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={iniciarSesion}>
                <Text style={[styles.buttonText, { color: colors.white }]}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('RegistroUserScreen')}>
                <Text style={[styles.register, { color: colors.primary }]}>
                    ¿No tienes cuenta? Regístrate
                </Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 30,
    },
    errorBox: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
    },
    forgot: {
        alignSelf: 'flex-end',
        marginBottom: 20,
        fontSize: 13,
    },
    register: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 4,
    },
    button: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
