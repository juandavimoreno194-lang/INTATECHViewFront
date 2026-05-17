import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../Regular/Herramientas/theme";
import { Ionicons } from "@expo/vector-icons";

import { getApiUrl } from '../Regular/Herramientas/apiConfig';
const API_URL = getApiUrl();

const ENFERMEDADES = [
  { key: "Glucosa",        icon: "🍎", color: "#0984E3" },
  { key: "Obesidad",       icon: "💪", color: "#E17055" },
  { key: "Cardiovascular", icon: "💓", color: "#D63031" },
];

const CATEGORY_COLORS = {
  "Bajo": "#00B894",    "Bajo peso": "#74B9FF",
  "Normal": "#2ECC71",
  "Moderado": "#F39C12", "Sobrepeso": "#F39C12",
  "Alto": "#E17055",    "Obesidad I": "#E17055",
  "Muy alto": "#D63031", "Obesity II+": "#D63031", "Obesidad II+": "#C0392B",
  "Muy Alto": "#C0392B",
  "Peligroso": "#9B59B6",
  "Infarto": "#6C0000",
};

const getColor = (valor) => {
  if (valor >= 2.5) return "#D63031";
  if (valor >= 1.5) return "#E17055";
  return "#00B894";
};

const getNivel = (valor) => {
  if (valor >= 2.5) return "Crítico";
  if (valor >= 1.5) return "Moderado";
  return "Bajo";
};

const EstadisticasScreen = () => {
  const colors = useTheme();
  const [resumen, setResumen] = useState(null);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  const fetchResumen = async () => {
    try {
      setLoadingResumen(true);
      const r = await fetch(`${API_URL}/estadisticas-enfermedades`);
      const body = await r.json();
      if (r.ok && body.success && Array.isArray(body.data)) {
        setResumen(body.data);
      } else {
        setResumen([]);
      }
    } catch {
      setResumen([]);
    } finally {
      setLoadingResumen(false);
    }
  };

  const fetchDetalle = async (enfermedad) => {
    try {
      setLoadingDetalle(true);
      setDetalle(null);
      const r = await fetch(`${API_URL}/estadisticas-detalle/${enfermedad}`);
      const body = await r.json();
      if (r.ok && body.success && Array.isArray(body.data)) {
        setDetalle(body.data);
      } else {
        setDetalle([]);
      }
    } catch {
      setDetalle([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleSelect = (key) => {
    if (selected === key) {
      setSelected(null);
      setDetalle(null);
    } else {
      setSelected(key);
      fetchDetalle(key);
    }
  };

  useFocusEffect(useCallback(() => { fetchResumen(); }, []));

  const getResumen = (key) => resumen?.find(d => d.enfermedad === key) || null;

  const maxCantidad = detalle?.length ? Math.max(...detalle.map(d => Number(d.cantidad) || 0), 1) : 1;

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <Ionicons name="bar-chart-outline" size={40} color={colors.headerText} />
        <Text style={[styles.title, { color: colors.headerText }]}>Estadísticas</Text>
        <Text style={[styles.subtitle, { color: colors.headerText + 'CC' }]}>
          Usuarios afectados y en riesgo
        </Text>
      </View>

      {/* Selector de enfermedades */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SELECCIONA UNA ENFERMEDAD</Text>
      <View style={styles.selectorRow}>
        {ENFERMEDADES.map(({ key, icon, color }) => {
          const isActive = selected === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.selectorBtn,
                { backgroundColor: isActive ? color : colors.card, borderColor: isActive ? color : colors.border },
              ]}
              onPress={() => handleSelect(key)}
            >
              <Text style={styles.selectorIcon}>{icon}</Text>
              <Text style={[styles.selectorText, { color: isActive ? '#fff' : colors.text }]}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Gráfica de barras de detalle */}
      {selected && (
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {ENFERMEDADES.find(e => e.key === selected)?.icon} Detalle — {selected}
          </Text>

          {loadingDetalle ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : !detalle || detalle.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Sin datos registrados.</Text>
          ) : (
            detalle.map((item, i) => {
              const cantidad = Number(item.cantidad) || 0;
              const pct = (cantidad / maxCantidad) * 100;
              const barColor = CATEGORY_COLORS[item.categoria] || colors.primary;
              return (
                <View key={i} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.categoria}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                  </View>
                  <Text style={[styles.barValue, { color: barColor }]}>{cantidad}</Text>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Resumen general */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>RESUMEN GENERAL</Text>

      {loadingResumen ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : !resumen || resumen.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay datos.</Text>
      ) : (
        resumen.map((item, index) => {
          const valor = parseFloat(item.riesgo_promedio) || 0;
          const color = getColor(valor);
          const nivel = getNivel(valor);
          const barWidth = Math.min((valor / 3) * 100, 100);
          const meta = ENFERMEDADES.find(e => e.key === item.enfermedad);

          return (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: colors.card }, selected === item.enfermedad && { borderWidth: 2, borderColor: meta?.color || colors.primary }]}
              onPress={() => handleSelect(item.enfermedad)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{meta?.icon || ""}</Text>
                <Text style={[styles.enfermedad, { color: colors.text }]}>{item.enfermedad}</Text>
                <View style={[styles.riskBadge, { backgroundColor: color + "22" }]}>
                  <Text style={[styles.riskText, { color }]}>{nivel}</Text>
                </View>
              </View>

              <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                <View style={[styles.bar, { width: `${barWidth}%`, backgroundColor: color }]} />
              </View>

              <View style={styles.statsRow}>
                <StatBox value={item.usuarios_afectados} label="Afectados" color={colors.text} secondaryColor={colors.textSecondary} />
                <StatBox value={item.usuarios_en_riesgo} label="En riesgo" color={item.usuarios_en_riesgo > 0 ? "#D63031" : colors.text} secondaryColor={colors.textSecondary} />
                <StatBox value={item.total} label="Registros" color={colors.text} secondaryColor={colors.textSecondary} />
              </View>

              <View style={[styles.avgRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.avgLabel, { color: colors.textSecondary }]}>Riesgo promedio</Text>
                <Text style={[styles.avgValue, { color }]}>{valor.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

    </ScrollView>
    </View>
  );
};

const StatBox = ({ value, label, color, secondaryColor }) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color }]}>{value ?? 0}</Text>
    <Text style={[styles.statLabel, { color: secondaryColor }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 130 },

  header: {
    paddingTop: 40, paddingBottom: 24, alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  subtitle: { fontSize: 13, marginTop: 4 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    marginLeft: 20, marginTop: 16, marginBottom: 10,
  },

  selectorRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 4 },
  selectorBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5,
  },
  selectorIcon: { fontSize: 22, marginBottom: 4 },
  selectorText: { fontSize: 12, fontWeight: '700' },

  chartCard: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 18 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  barLabel: { width: 90, fontSize: 12, marginRight: 8 },
  barTrack: { flex: 1, height: 20, borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10, minWidth: 4 },
  barValue: { width: 36, fontSize: 13, fontWeight: '700', textAlign: 'right', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginVertical: 20, fontSize: 13 },

  card: {
    marginHorizontal: 16, borderRadius: 16, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIcon: { fontSize: 20, marginRight: 8 },
  enfermedad: { flex: 1, fontSize: 17, fontWeight: '700' },
  riskBadge: { paddingHorizontal: 14, paddingVertical: 3, borderRadius: 14 },
  riskText: { fontSize: 12, fontWeight: '700' },

  barBg: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 16 },
  bar: { height: '100%', borderRadius: 5 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 2 },

  avgRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, paddingTop: 12,
  },
  avgLabel: { fontSize: 13 },
  avgValue: { fontSize: 16, fontWeight: '700' },
});

export default EstadisticasScreen;
