import React, { useState, useEffect } from "react";
import {
  StyleSheet, Text, View, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from './Herramientas/UserContext';
import { useTheme } from './Herramientas/theme';

import { getApiUrl } from './Herramientas/apiConfig';
const API_URL = getApiUrl();

const TOOLS = [
  { key: "Recordatorios", icon: "calendar",       color: "#FF6B6B", desc: "Gestiona tus citas" },
  { key: "Notas",         icon: "book",            color: "#00B894", desc: "Tus apuntes" },
  { key: "Glucosa",       icon: "pulse",           color: "#0984E3", desc: "Control de glucosa" },
  { key: "Obesidad",      icon: "body",            color: "#E17055", desc: "Índice de masa" },
  { key: "Cardio",        icon: "heart",           color: "#D63031", desc: "Monitor cardíaco" },
  { key: "Consejos",      icon: "bulb",            color: "#00CEC9", desc: "Tips de salud" },
];

const clsGlucosa = (n) => {
  if (n == null) return { label: '—', color: '#95A5A6', alert: false };
  if (n < 70)    return { label: 'Bajo', color: '#E67E22', alert: true };
  if (n <= 100)  return { label: 'Normal', color: '#2ECC71', alert: false };
  if (n <= 125)  return { label: 'Pre-Diabetes', color: '#F39C12', alert: true };
  if (n <= 180)  return { label: 'Alto', color: '#E74C3C', alert: true };
  return               { label: 'Muy alto', color: '#C0392B', alert: true };
};
const clsIMC = (v) => {
  if (v == null) return { label: '—', color: '#95A5A6', alert: false };
  if (v < 18.5)  return { label: 'Bajo peso', color: '#74B9FF', alert: true };
  if (v < 25)    return { label: 'Normal', color: '#2ECC71', alert: false };
  if (v < 30)    return { label: 'Sobrepeso', color: '#F39C12', alert: true };
  return               { label: 'Obesidad', color: '#E74C3C', alert: true };
};
const clsBPM = (v) => {
  if (v == null) return { label: '—', color: '#95A5A6', alert: false };
  if (v < 60)    return { label: 'Bradicardia', color: '#E67E22', alert: true };
  if (v <= 100)  return { label: 'Normal', color: '#2ECC71', alert: false };
  if (v <= 150)  return { label: 'Taquicardia', color: '#E74C3C', alert: true };
  return               { label: 'Crítico', color: '#C0392B', alert: true };
};

const InicioScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [tipoSangre, setTipoSangre] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(true);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dash, setDash] = useState({ glucosa: null, imc: null, bpm: null });
  const [guideVisible, setGuideVisible] = useState(false);
  const [perfilIncompleto, setPerfilIncompleto] = useState([]);

  useEffect(() => {
    const today = new Date();
    const opts = { weekday: 'long', day: 'numeric', month: 'long' };
    const f = today.toLocaleDateString('es-ES', opts);
    setFecha(f.charAt(0).toUpperCase() + f.slice(1));
    setTimeout(() => setLoading(false), 600);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_URL}/datos/${user.id}`)
        .then(r => r.json())
        .then(data => {
          const rows = data?.data;
          const perfil = Array.isArray(rows) ? (rows[0] ?? null) : (rows ?? null);
          setTipoSangre(perfil?.tipo_sangre || null);
          setNombreUsuario(perfil?.nombre || user?.nombre || '');

          const CAMPOS = [
            { field: 'Peso',           icon: 'fitness-outline', key: 'peso' },
            { field: 'Altura',         icon: 'resize-outline',  key: 'altura' },
            { field: 'Tipo de sangre', icon: 'water-outline',   key: 'tipo_sangre' },
            { field: 'Edad',           icon: 'person-outline',  key: 'edad' },
          ];
          const faltantes = !perfil
            ? CAMPOS
            : CAMPOS.filter(c => perfil[c.key] == null || perfil[c.key] === '');
          if (faltantes.length > 0) {
            setPerfilIncompleto(faltantes);
            setGuideVisible(true);
          }
        })
        .catch(() => setNombreUsuario(user?.nombre || ''));

      fetchDashboard(user.id);
    }
  }, [user]);

  const fetchDashboard = async (uid) => {
    const safe = async (fn) => { try { return await fn(); } catch { return null; } };
    const [gRes, oRes, cRes] = await Promise.all([
      safe(() => fetch(`${API_URL}/glucosa/${uid}`).then(r => r.ok ? r.json() : null)),
      safe(() => fetch(`${API_URL}/obesidad?usuario_id=${uid}`).then(r => r.ok ? r.json() : null)),
      safe(() => fetch(`${API_URL}/cardio?usuario_id=${uid}`).then(r => r.ok ? r.json() : null)),
    ]);
    setDash({
      glucosa: Array.isArray(gRes) && gRes[0] ? gRes[0].nivel ?? null : null,
      imc: Array.isArray(oRes) && oRes[0]?.imc != null ? Math.round(oRes[0].imc * 10) / 10 : null,
      bpm: cRes && !Array.isArray(cRes) ? cRes.bpm ?? null : (Array.isArray(cRes) && cRes[0] ? cRes[0].bpm ?? null : null),
    });
  };

  const handleNav = (key) => {
    const routes = {
      Recordatorios: 'Recordatorios',
      Notas:         'NostasScreen',
      Glucosa:       'GlucosaScreen',
      Obesidad:      'ObesidadScreen',
      Cardio:        'CardioScreen',
      Consejos:      'ConsejoScreen',
    };
    if (routes[key]) navigation.navigate(routes[key]);
  };

  const navResults = (route) => { try { navigation.navigate(route); } catch {} };

  const primerNombre = nombreUsuario?.split(' ')[0] || 'Usuario';

  if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />;
  }

  const METRICS = [
    { key: 'glucosa', label: 'Glucosa', unit: 'mg/dL', value: dash.glucosa, icon: 'pulse', color: '#0984E3', cls: clsGlucosa(dash.glucosa), route: 'ResultadosScreen' },
    { key: 'imc',     label: 'IMC',     unit: 'kg/m²', value: dash.imc,     icon: 'body',  color: '#E17055', cls: clsIMC(dash.imc),         route: 'ResultadosScreen4' },
    { key: 'bpm',     label: 'Cardio',  unit: 'lpm',   value: dash.bpm,     icon: 'heart', color: '#D63031', cls: clsBPM(dash.bpm),         route: 'ResultadosScreen5' },
  ];
  const hasAlerts = METRICS.some(m => m.cls.alert && m.value != null);

  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: colors.background }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.brandRow}>
          <Ionicons name="heart-circle" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.brandText}>InstaTech</Text>
        </View>
        <Text style={styles.greeting}>Hola, {primerNombre} </Text>
        <Text style={styles.headerDate}>{fecha}</Text>
        <View style={styles.chipRow}>
          {tipoSangre && (
            <View style={styles.chip}>
              <Ionicons name="water" size={13} color="#fff" />
              <Text style={styles.chipText}>Tipo {tipoSangre}</Text>
            </View>
          )}
          <TouchableOpacity style={[styles.chip, styles.chipBtn]} onPress={() => setCalendarVisible(true)}>
            <Ionicons name="calendar-outline" size={13} color="#fff" />
            <Text style={styles.chipText}>Ver calendario</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── RESUMEN DE SALUD ── */}
      <View style={styles.sectionRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumen de salud</Text>
          {hasAlerts && (
            <View style={styles.alertDot}>
              <Text style={styles.alertDotText}>!</Text>
            </View>
          )}
        </View>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Últimos registros</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dashRow}>
        {METRICS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.metricCard, { backgroundColor: colors.card }]}
            onPress={() => navResults(m.route)}
            activeOpacity={0.8}
          >
            <View style={[styles.metricIconBox, { backgroundColor: m.color + '20' }]}>
              <Ionicons name={`${m.icon}-outline`} size={20} color={m.color} />
              {m.cls.alert && m.value != null && (
                <View style={styles.alertBadge}>
                  <Ionicons name="warning" size={9} color="#fff" />
                </View>
              )}
            </View>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{m.label}</Text>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, { color: m.value != null ? m.cls.color : colors.textSecondary }]}>
                {m.value != null ? m.value : '—'}
              </Text>
              {m.value != null && (
                <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>{m.unit}</Text>
              )}
            </View>
            <View style={[styles.metricBadge, { backgroundColor: m.cls.color + '18' }]}>
              <Text style={[styles.metricBadgeText, { color: m.cls.color }]}>{m.cls.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── SECCIÓN HERRAMIENTAS ── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tus herramientas</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>{TOOLS.length} disponibles</Text>
      </View>

      {/* ── GRID 2 COLUMNAS ── */}
      <View style={styles.grid}>
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.key}
            style={[styles.toolCard, { backgroundColor: tool.color }]}
            onPress={() => handleNav(tool.key)}
            activeOpacity={0.85}
          >
            <View style={styles.toolIconBg}>
              <Ionicons name={`${tool.icon}-outline`} size={30} color="#fff" />
            </View>
            <Text style={styles.toolName}>{tool.key}</Text>
            <Text style={styles.toolDesc}>{tool.desc}</Text>
            <View style={styles.toolArrow}>
              <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.7)" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── GUIDE MODAL ── */}
      <Modal visible={guideVisible} transparent animationType="slide">
        <View style={styles.guideOverlay}>
          <View style={[styles.guideBox, { backgroundColor: colors.card }]}>
            <View style={styles.guideHeader}>
              <View style={styles.guideIconCircle}>
                <Ionicons name="person-circle-outline" size={50} color="#fff" />
              </View>
              <Text style={styles.guideTitle}>¡Completa tu perfil!</Text>
              <Text style={styles.guideSub}>Con estos datos las alertas de salud serán mucho más precisas</Text>
            </View>
            <View style={styles.guideContent}>
              <Text style={[styles.guideMissingTitle, { color: colors.textSecondary }]}>Datos que te faltan:</Text>
              {perfilIncompleto.map((f, i) => (
                <View key={i} style={[styles.guideMissingRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.guideMissingIcon}>
                    <Ionicons name={f.icon} size={18} color="#6C5CE7" />
                  </View>
                  <Text style={[styles.guideMissingText, { color: colors.text }]}>{f.field}</Text>
                  <Ionicons name="close-circle" size={18} color="#E74C3C" />
                </View>
              ))}
            </View>
            <View style={styles.guideBtnRow}>
              <TouchableOpacity style={styles.guideBtnSkip} onPress={() => setGuideVisible(false)}>
                <Text style={[styles.guideBtnSkipText, { color: colors.textSecondary }]}>Después</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guideBtnPrimary}
                onPress={() => { setGuideVisible(false); navigation.navigate('EditarPerfilScreen2'); }}
              >
                <Ionicons name="create-outline" size={17} color="#fff" />
                <Text style={styles.guideBtnPrimaryText}>Completar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── CALENDAR MODAL ── */}
      <Modal visible={calendarVisible} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Calendario</Text>
            <Calendar
              theme={{
                selectedDayBackgroundColor: colors.primary,
                todayTextColor: colors.primary,
                arrowColor: colors.primary,
                backgroundColor: colors.card,
                calendarBackground: colors.card,
                dayTextColor: colors.text,
                textDisabledColor: colors.textLight,
                monthTextColor: colors.text,
              }}
            />
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.primary }]}
              onPress={() => setCalendarVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  /* Header */
  header: {
    paddingTop: 50, paddingBottom: 28, paddingHorizontal: 22,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  brandText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5, opacity: 0.9 },
  greeting: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 4 },
  headerDate: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 18 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  chipBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  /* Section */
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 20, marginTop: 24, marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSub: { fontSize: 12 },

  /* Dashboard */
  dashRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  metricCard: {
    width: 130, borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  metricIconBox: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, position: 'relative',
  },
  alertBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center',
  },
  metricLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  metricValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 8 },
  metricValue: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  metricUnit: { fontSize: 10, marginBottom: 3 },
  metricBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  metricBadgeText: { fontSize: 10, fontWeight: '700' },
  alertDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center',
  },
  alertDotText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  /* Grid */
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 14, gap: 12,
  },
  toolCard: {
    width: '47%', borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    position: 'relative', minHeight: 140,
  },
  toolIconBg: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  toolName: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 3 },
  toolDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 11, lineHeight: 15 },
  toolArrow: {
    position: 'absolute', bottom: 14, right: 14,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  /* Guide Modal */
  guideOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  guideBox: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  guideHeader: {
    backgroundColor: '#6C5CE7', paddingTop: 30, paddingBottom: 24,
    alignItems: 'center', paddingHorizontal: 24,
  },
  guideIconCircle: {
    width: 82, height: 82, borderRadius: 41,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  guideTitle: { color: '#fff', fontSize: 21, fontWeight: '800', marginBottom: 6 },
  guideSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  guideContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 4 },
  guideMissingTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },
  guideMissingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, borderBottomWidth: 1,
  },
  guideMissingIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#6C5CE720', justifyContent: 'center', alignItems: 'center',
  },
  guideMissingText: { flex: 1, fontSize: 15, fontWeight: '600' },
  guideBtnRow: { flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 36 },
  guideBtnSkip: { flex: 1, padding: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  guideBtnSkipText: { fontSize: 14, fontWeight: '600' },
  guideBtnPrimary: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 15, borderRadius: 14, backgroundColor: '#6C5CE7',
  },
  guideBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  /* Modal */
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '100%', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  closeBtn: { marginTop: 14, padding: 13, borderRadius: 12 },
  closeBtnText: { color: '#fff', fontWeight: '700', textAlign: 'center', fontSize: 15 },
});

export default InicioScreen;
