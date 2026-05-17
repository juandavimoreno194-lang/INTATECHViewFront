import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Image, Modal, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from './Herramientas/UserContext';
import { useTheme } from './Herramientas/theme';
import { showConfirm } from './Herramientas/confirm';
import { showAlert } from './Herramientas/Toast';

import { getApiUrl, setApiUrl } from './Herramientas/apiConfig';
const API_URL = getApiUrl();

const getPhotoUrl = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith('data:')) return ruta;
  const base = API_URL.replace(/\/$/, '');
  const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
  return `${base}${path}?t=${Date.now()}`;
};

const SDK_VERSION = "SDK 54";
const APP_VERSION = "beta 1.0.0";
const CREADORES = ["Juan Sebastián Lozano", "Andrés Felipe Prisco", "Juan David Moreno"];

const ConfiguracionScreen = () => {
  const navigation = useNavigation();
  const { user, darkMode, toggleDarkMode, logout } = useUser();
  const colors = useTheme();
  const [showAbout, setShowAbout] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [userData, setUserData] = useState(null);
  const [fotoUrl, setFotoUrl] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`${getApiUrl()}/usuarios/${user.id}`)
        .then(r => r.json())
        .then(d => { if (d.nombre) setUserData(d); })
        .catch(() => {});

      fetch(`${API_URL}/datos/${user.id}`)
        .then(r => r.json())
        .then(data => {
          const perfil = data?.data?.[0] || data?.data || data;
          setFotoUrl(perfil?.foto ? getPhotoUrl(perfil.foto) : null);
        })
        .catch(() => {});
    }
  }, [user]);

  const nombreReal = userData?.nombre || user?.nombre || "Usuario";
  const emailReal  = userData?.email  || user?.email  || "";
  const inicial    = nombreReal[0].toUpperCase();

  const handleLogout = async () => {
    const ok = await showConfirm("Cerrar sesión", "¿Seguro que deseas salir?");
    if (!ok) return;
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
  };

  const handleDeleteAccount = async () => {
    const ok = await showConfirm("Eliminar cuenta", "Esta acción no se puede deshacer");
    if (!ok) return;
    try {
      const response = await fetch(`${getApiUrl()}/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showAlert("Cuenta eliminada", "Tu cuenta ha sido eliminada.", "success");
        navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
      } else {
        showAlert("Error", data.message, "error");
      }
    } catch {
      showAlert("Error", "No se pudo eliminar la cuenta", "error");
    }
  };

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── HEADER ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={styles.avatarPhoto} />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{inicial}</Text>
          </View>
        )}
        <Text style={styles.headerName}>{nombreReal}</Text>
        {emailReal ? <Text style={styles.headerEmail}>{emailReal}</Text> : null}
        <View style={styles.rolBadge}>
          <Ionicons name="person-outline" size={11} color="rgba(255,255,255,0.9)" />
          <Text style={styles.rolText}>Usuario Regular</Text>
        </View>
      </View>

      {/* ── CUENTA ── */}
      <SectionLabel text="CUENTA" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Option icon="lock-closed-outline" text="Cambiar contraseña"    onPress={() => navigation.navigate('CambiarContrasenaScreen')} colors={colors} />
        <Option icon="time-outline"        text="Historial de actividad" onPress={() => navigation.navigate('ActividadScreen')}         colors={colors} last />
      </View>

      {/* ── PREFERENCIAS ── */}
      <SectionLabel text="PREFERENCIAS" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.option, styles.optionBorder, { borderBottomColor: colors.border }]}>
          <View style={[styles.optionIcon, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="moon-outline" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.optionText, { color: colors.text }]}>Modo oscuro</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
        <Option icon="trash-outline" text="Eliminar cuenta" onPress={handleDeleteAccount} danger colors={colors} last />
      </View>

      {/* ── SERVIDOR ── */}
      <SectionLabel text="SERVIDOR" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Option icon="server-outline" text="URL del servidor" onPress={() => { setUrlInput(getApiUrl()); setShowUrlModal(true); }} colors={colors} last />
      </View>

      {/* ── INFORMACIÓN ── */}
      <SectionLabel text="INFORMACIÓN" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.option, showAbout && styles.optionBorder, { borderBottomColor: colors.border }]}
          onPress={() => setShowAbout(!showAbout)}
        >
          <View style={[styles.optionIcon, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name="information-circle-outline" size={19} color={colors.primary} />
          </View>
          <Text style={[styles.optionText, { color: colors.text }]}>Acerca de</Text>
          <Ionicons name={showAbout ? "chevron-up" : "chevron-forward"} size={20} color={colors.textLight} />
        </TouchableOpacity>

        {showAbout && (
          <View style={[styles.aboutBox, { borderTopColor: colors.border }]}>
            <View style={[styles.appIconBg, { backgroundColor: colors.primary + '18' }]}>
              <Ionicons name="apps-outline" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>InstaTech</Text>
            <Text style={[styles.appVersion, { color: colors.textSecondary }]}>v{APP_VERSION} · {SDK_VERSION}</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.creatorsTitle, { color: colors.textSecondary }]}>Desarrollado por</Text>
            {CREADORES.map((n, i) => (
              <View key={i} style={styles.creatorRow}>
                <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.creatorName, { color: colors.text }]}>{n}</Text>
              </View>
            ))}
            <Text style={[styles.appDesc, { color: colors.textSecondary }]}>
              Aplicación para el monitoreo y control de salud con reportes automatizados.
            </Text>
          </View>
        )}
      </View>

      {/* ── CERRAR SESIÓN ── */}
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.danger }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 120 }} />
    </ScrollView>

      {/* ── MODAL URL ── */}
      <Modal visible={showUrlModal} transparent animationType="fade" onRequestClose={() => setShowUrlModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>URL del Servidor</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>Ingresa la dirección del servidor (ej: http://192.168.1.10:4000)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="http://192.168.1.10:4000"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.danger }]} onPress={() => setShowUrlModal(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={async () => {
                await setApiUrl(urlInput.trim());
                setShowUrlModal(false);
                showAlert('Servidor', 'URL actualizada. Reinicia la app para aplicar cambios.', 'success');
              }}>
                <Text style={styles.modalBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const SectionLabel = ({ text, colors }) => (
  <View style={styles.sectionRow}>
    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

const Option = ({ icon, text, onPress, danger, colors, last }) => (
  <TouchableOpacity
    style={[styles.option, !last && styles.optionBorder, !last && { borderBottomColor: colors.border }]}
    onPress={onPress}
  >
    <View style={[styles.optionIcon, { backgroundColor: (danger ? colors.danger : colors.primary) + '18' }]}>
      <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.primary} />
    </View>
    <Text style={[styles.optionText, { color: danger ? colors.danger : colors.text }]}>{text}</Text>
    <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1 },

  header: {
    alignItems: 'center', paddingTop: 48, paddingBottom: 32,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  avatarLetter: { color: '#fff', fontSize: 36, fontWeight: '700' },
  avatarPhoto: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  headerName:  { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 },
  headerEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 10 },
  rolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  rolText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },

  sectionRow: { marginHorizontal: 24, marginTop: 24, marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  card: {
    marginHorizontal: 16, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 12,
  },
  optionBorder: { borderBottomWidth: 1 },
  optionIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  optionText: { flex: 1, fontSize: 15 },

  aboutBox: { borderTopWidth: 1, alignItems: 'center', padding: 24, gap: 6 },
  appIconBg: { width: 64, height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  appName: { fontSize: 20, fontWeight: '700' },
  appVersion: { fontSize: 12, marginBottom: 4 },
  divider: { width: '60%', height: 1, marginVertical: 12 },
  creatorsTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  creatorName: { fontSize: 14 },
  appDesc: { fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 18 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 24, padding: 15, borderRadius: 16,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  modalCard: {
    width: '100%', borderRadius: 20, padding: 28,
    alignItems: 'center', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  modalDesc: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  modalInput: {
    width: '100%', height: 48, borderRadius: 12, paddingHorizontal: 15,
    borderWidth: 1, fontSize: 15, marginBottom: 20,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtn: { paddingVertical: 12, paddingHorizontal: 28, borderRadius: 12 },
  modalBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default ConfiguracionScreen;
