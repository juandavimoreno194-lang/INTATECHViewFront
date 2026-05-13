import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function RegistroUserScreen() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();

    function notificar(titulo, msg) {
        Alert.alert(titulo, msg);
    }

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    console.log('API URL:', apiUrl); // Debería imprimir: http://192.168.20.30:4000
    // Agrega el punto y coma al final


    const handleRegistro = () => {
        if (!nombre || !email || !password || !confirmPassword) {
            notificar('Error', "Todos los campos son obligatorios");
            return false;
        }
        
        if (password !== confirmPassword) {
            notificar('Error', 'Las contraseñas no coinciden');
            return;
        }

        const requestBody = {
            nombre,
            email,
            password
        };

        fetch(`${apiUrl}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
           
        })
        .catch(error => {
            console.error('Error al enviar la solicitud:', error.message);
            notificar('Error', 'Error al enviar la solicitud' + error.message);
        });
    }

    const verLogin = () => { 
        navigation.navigate('LoginScreen');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Registro de Usuario</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Ingresa tu nombre'
                    keyboardType='default'
                    value={nombre}
                    onChangeText={(text) => setNombre(text)}
                    style={styles.textInput}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Ingresa tu correo'
                    keyboardType='email-address'
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    style={styles.textInput}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Ingresa tu contraseña'
                    keyboardType='default'
                    value={password}
                    secureTextEntry
                    onChangeText={(text) => setPassword(text)}
                    style={styles.textInput}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Confirma tu contraseña'
                    keyboardType='default'
                    value={confirmPassword}
                    secureTextEntry
                    onChangeText={(text) => setConfirmPassword(text)}
                    style={styles.textInput}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegistro}>
                <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonLogin} onPress={verLogin}>
                <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e0f7fa', // Fondo azul claro
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#00796b', // Texto en color verde oscuro
        textAlign: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#00796b', // Botón verde oscuro
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonLogin: {
        backgroundColor: '#004d40', // Botón verde más oscuro
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    textInput: {
        height: 50,
        fontSize: 16,
        color: '#333',
    },
});

export default RegistroUserScreen;