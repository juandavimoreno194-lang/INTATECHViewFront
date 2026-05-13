import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";

const InicioScreen = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rol, setRol] = useState('');
    const [estadoId, setEstadoId] = useState(1);

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;

    function notificar(titulo, msg) {
        Alert.alert(titulo, msg);
    }

    const handleRegistro = () => {
        if (!nombre || !email || !password || !confirmPassword || !rol) {
            notificar('Error', "Todos los campos son obligatorios");
            return;
        }

        if (password !== confirmPassword) {
            notificar('Error', 'Las contraseñas no coinciden');
            return;
        }

        const requestBody = {
            nombre,
            email,
            password,
            rol,
            estado_id: estadoId,
        };

        fetch(`${apiUrl}/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        })
        .then(res => res.json())
        .then(data => {
            if (data.msg === 'Usuario registrado correctamente') {
                notificar('Éxito', 'Usuario registrado correctamente');
            } else {
                notificar('Error', data.msg || 'Error al registrar');
            }
        })
        .catch(error => {
            notificar('Error', 'Error: ' + error.message);
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <Text style={styles.title}>Registrar Usuario</Text>
            <Text style={styles.subtitle}>Completa los datos del nuevo usuario</Text>

            {/* Inputs */}
            <TextInput
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
                style={styles.input}
            />

            <TextInput
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
            />

            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />

            <TextInput
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />

            {/* Roles */}
            <Text style={styles.label}>Selecciona el rol</Text>

            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[
                        styles.roleButton,
                        rol === 'ROL_ADMIN' && styles.roleSelected
                    ]}
                    onPress={() => setRol('ROL_ADMIN')}
                >
                    <Text style={[
                        styles.roleText,
                        rol === 'ROL_ADMIN' && styles.roleTextSelected
                    ]}>
                        Administrador
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.roleButton,
                        rol === 'ROL_REG' && styles.roleSelected
                    ]}
                    onPress={() => setRol('ROL_REG')}
                >
                    <Text style={[
                        styles.roleText,
                        rol === 'ROL_REG' && styles.roleTextSelected
                    ]}>
                        Regular
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Botón */}
            <TouchableOpacity style={styles.button} onPress={handleRegistro}>
                <Text style={styles.buttonText}>Registrar Usuario</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
        justifyContent: 'center',
    },

    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1E1E1E',
        textAlign: 'center',
        marginBottom: 5,
    },

    subtitle: {
        fontSize: 14,
        color: '#7A7A7A',
        textAlign: 'center',
        marginBottom: 25,
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

    label: {
        fontSize: 14,
        color: '#4A4A4A',
        marginBottom: 10,
    },

    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    roleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginHorizontal: 5,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },

    roleSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },

    roleText: {
        color: '#4A4A4A',
        fontWeight: '500',
    },

    roleTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    button: {
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },

    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default InicioScreen;