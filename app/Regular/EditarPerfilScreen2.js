import React, {
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import { useUser } from "./Herramientas/UserContext";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL;

const EditarPerfilScreen = ({
  navigation,
}) => {
  const { user } = useUser();

  const [nombre, setNombre] =
    useState("");
  const [genero, setGenero] =
    useState("");
  const [altura, setAltura] =
    useState("");
  const [peso, setPeso] =
    useState("");
  const [edad, setEdad] =
    useState("");
  const [tipoSangre, setTipoSangre] =
    useState("");

  const [foto, setFoto] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  /* ==========================
     ARMAR URL FOTO
  ========================== */
  const obtenerUrlImagen = (
    ruta
  ) => {
    if (!ruta) return null;

    let base =
      API_URL.replace(
        /\/$/,
        ""
      );

    let path = ruta.startsWith(
      "/"
    )
      ? ruta
      : `/${ruta}`;

    return `${base}${path}?t=${Date.now()}`;
  };

  /* ==========================
     CONSULTAR PERFIL
  ========================== */
  const cargarPerfil = async () => {
    try {
      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/datos/${user.id}`
        );

      const data =
        await response.json();

      const perfil =
        data?.data?.[0] ||
        data?.data ||
        data;

      if (perfil) {
        setNombre(
          perfil.nombre || ""
        );

        setGenero(
          perfil.genero || ""
        );

        setAltura(
          perfil.altura
            ?.toString() || ""
        );

        setPeso(
          perfil.peso
            ?.toString() || ""
        );

        setEdad(
          perfil.edad
            ?.toString() || ""
        );

        setTipoSangre(
          perfil.tipo_sangre ||
            ""
        );

        if (perfil.foto) {
          setFoto(
            obtenerUrlImagen(
              perfil.foto
            )
          );
        } else {
          setFoto(null);
        }
      }
    } catch (error) {
      console.log(
        "ERROR PERFIL:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        cargarPerfil();
      }
    }, [user])
  );

  /* ==========================
     ACTUALIZAR FOTO
  ========================== */
  const seleccionarImagen =
    async () => {
      try {
        const permiso =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permiso.granted) {
          Alert.alert(
            "Permiso requerido",
            "Debes permitir acceso a galería"
          );
          return;
        }

        const resultado =
          await ImagePicker.launchImageLibraryAsync(
            {
              mediaTypes:
                ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            }
          );

        if (
          resultado.canceled
        )
          return;

        const uri =
          resultado.assets[0]
            .uri;

        // vista previa inmediata
        setFoto(uri);

        const formData =
          new FormData();

        formData.append(
          "foto",
          {
            uri,
            name:
              "perfil.jpg",
            type: "image/jpeg",
          }
        );

        formData.append(
          "userId",
          user.id
        );

        const response =
          await fetch(
            `${API_URL}/upload-photo`,
            {
              method:
                "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (response.ok) {
          Alert.alert(
            "Éxito",
            "Foto actualizada correctamente"
          );

          // recargar foto nueva desde BD
          await cargarPerfil();
        } else {
          Alert.alert(
            "Error",
            data.message ||
              "No se pudo actualizar la foto"
          );
        }
      } catch (error) {
        console.log(
          "ERROR FOTO:",
          error
        );

        Alert.alert(
          "Error",
          "No se pudo actualizar la foto"
        );
      }
    };

  /* ==========================
     GUARDAR DATOS
  ========================== */
  const guardarCambios =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/api/datos/saveProfileData`,
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify(
                {
                  userId:
                    user.id,
                  nombre,
                  genero,
                  altura,
                  peso,
                  edad,
                  tipoSangre,
                }
              ),
            }
          );

        const data =
          await response.json();

        if (response.ok) {
          Alert.alert(
            "Éxito",
            "Perfil actualizado"
          );
        } else {
          Alert.alert(
            "Error",
            data.message
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "No se pudo guardar"
        );
      }
    };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#4A90E2"
        style={{
          flex: 1,
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={
        Platform.OS ===
        "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            onPress={
              seleccionarImagen
            }
          >
            {foto ? (
              <Image
                source={{
                  uri: foto,
                }}
                style={
                  styles.profileImage
                }
              />
            ) : (
              <View
                style={
                  styles.placeholder
                }
              >
                <Text
                  style={{
                    fontSize: 45,
                  }}
                >
                  👤
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text
            style={
              styles.name
            }
          >
            {nombre ||
              "Usuario"}
          </Text>

          <Text
            style={
              styles.photoText
            }
          >
            Toca para cambiar
            foto
          </Text>
        </View>

        {/* FORMULARIO */}
        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Nombre
          </Text>
          <TextInput
            style={
              styles.input
            }
            value={nombre}
            onChangeText={
              setNombre
            }
          />

          <Text
            style={
              styles.label
            }
          >
            Género
          </Text>
          <TextInput
            style={
              styles.input
            }
            value={genero}
            onChangeText={
              setGenero
            }
          />

          <Text
            style={
              styles.label
            }
          >
            Altura
          </Text>
          <TextInput
            style={
              styles.input
            }
            value={altura}
            onChangeText={
              setAltura
            }
          />

          <Text
            style={
              styles.label
            }
          >
            Peso
          </Text>
          <TextInput
            style={
              styles.input
            }
            value={peso}
            onChangeText={
              setPeso
            }
          />

          <Text
            style={
              styles.label
            }
          >
            Edad
          </Text>
          <TextInput
            style={
              styles.input
            }
            value={edad}
            onChangeText={
              setEdad
            }
          />

          <Text
            style={
              styles.label
            }
          >
            Tipo sangre
          </Text>
          <TextInput
            style={
              styles.input
            }
            value={
              tipoSangre
            }
            onChangeText={
              setTipoSangre
            }
          />

          {/* BOTONES */}
          <TouchableOpacity
            style={
              styles.button
            }
            onPress={
              guardarCambios
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Guardar cambios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >
            <Text
              style={
                styles.backText
              }
            >
              Volver
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F5F7FA",
    },

    header: {
      backgroundColor:
        "#4A90E2",
      alignItems:
        "center",
      paddingTop: 45,
      paddingBottom: 35,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },

    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 4,
      borderColor:
        "#fff",
    },

    placeholder: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor:
        "#ffffff55",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    name: {
      color: "#fff",
      fontSize: 24,
      fontWeight:
        "bold",
      marginTop: 15,
    },

    photoText: {
      color: "#EAF3FF",
      marginTop: 5,
    },

    card: {
      backgroundColor:
        "#fff",
      margin: 18,
      padding: 20,
      borderRadius: 18,
    },

    label: {
      marginTop: 10,
      marginBottom: 5,
      color: "#555",
    },

    input: {
      backgroundColor:
        "#F8F8F8",
      borderRadius: 12,
      height: 48,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor:
        "#E0E0E0",
    },

    button: {
      backgroundColor:
        "#4A90E2",
      padding: 15,
      borderRadius: 12,
      marginTop: 20,
      alignItems:
        "center",
    },

    buttonText: {
      color: "#fff",
      fontWeight:
        "bold",
      fontSize: 16,
    },

    backButton: {
      marginTop: 15,
      alignItems:
        "center",
    },

    backText: {
      color: "#4A90E2",
      fontWeight:
        "bold",
    },
  });

export default EditarPerfilScreen;