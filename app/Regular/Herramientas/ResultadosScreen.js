import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../Herramientas/UserContext";
import { useTheme } from './theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mostrarNotif } from './NotificationHandler';
import AlertModal from './AlertModal';
import { Ionicons } from '@expo/vector-icons';
import MiniChart from './MiniChart';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#0984E3";

function clasificarGlucosa(nivel) {
  if (nivel < 70)   return { label: 'Bajo',     color: '#F39C12', icon: 'arrow-down-circle' };
  if (nivel <= 100) return { label: 'Normal',   color: '#2ECC71', icon: 'checkmark-circle' };
  if (nivel <= 180) return { label: 'Moderado', color: '#F39C12', icon: 'alert-circle' };
  if (nivel <= 300) return { label: 'Alto',     color: '#E74C3C', icon: 'warning' };
  return             { label: 'Muy alto',       color: '#C0392B', icon: 'close-circle' };
}

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ResultadosScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const colors = useTheme();
  const [resultados, setResultados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'success' });

  const generarExcel = () => {
    const C = '#0984E3';
    const date = new Date().toLocaleDateString('es-ES');
    const vals = resultados.map(r => r.nivel);
    const minV = Math.min(...vals), maxV = Math.max(...vals);
    const avgV = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
    const BG = { Normal:'#D5F5E3', Bajo:'#FEF9E7', Moderado:'#FEF9E7', 'Pre-Diabetes':'#FEF9E7', Alto:'#FDEDEC', 'Muy alto':'#FADBD8' };
    const FG = { Normal:'#1E8449', Bajo:'#9A7D0A', Moderado:'#9A7D0A', 'Pre-Diabetes':'#9A7D0A', Alto:'#C0392B', 'Muy alto':'#922B21' };
    const th = t => '<td style="background:' + C + ';color:#FFF;font-weight:bold;padding:9pt 12pt;text-align:center;border:1pt solid ' + C + '">' + t + '</td>';
    const filas = resultados.map((r, i) => {
      const d = new Date(r.fecha);
      const cls = clasificarGlucosa(r.nivel);
      const bg = BG[cls.label] || '#F4F6F7', fg = FG[cls.label] || '#555';
      const rb = i % 2 === 0 ? '#FFFFFF' : '#EBF5FB';
      const ab = cls.alert ? '#FDEDEC' : '#D5F5E3', af = cls.alert ? '#C0392B' : '#1E8449';
      const td = (v, s) => '<td style="padding:7pt 10pt;border:0.5pt solid #E0E0E0;' + (s||'') + '">' + v + '</td>';
      return '<tr style="background:' + rb + '">'
        + td(i+1, 'text-align:center;color:#AAA')
        + td(d.toLocaleDateString('es-ES'), '')
        + td(d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}), 'color:#888')
        + td(r.nivel, 'text-align:center;font-size:15pt;font-weight:bold;color:' + cls.color)
        + td(cls.label, 'text-align:center;font-weight:bold;background:' + bg + ';color:' + fg)
        + td(cls.alert ? 'SI' : 'NO', 'text-align:center;font-weight:bold;background:' + ab + ';color:' + af)
        + '</tr>';
    }).join('');
    return '<html><head><meta charset="UTF-8"></head><body>'
      + '<table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt">'
      + '<tr><td colspan="6" style="background:' + C + ';color:#FFF;font-size:18pt;font-weight:bold;padding:16pt 18pt">InstaTech &middot; Historial de Glucosa</td></tr>'
      + '<tr><td colspan="6" style="background:' + C + 'BB;color:#FFF;font-size:10pt;padding:5pt 18pt">Exportado el ' + date + '&nbsp;&nbsp;|&nbsp;&nbsp;' + resultados.length + ' registros</td></tr>'
      + '<tr><td colspan="6" style="padding:5pt;background:#F8F9FA"></td></tr>'
      + '<tr>'
        + '<td style="background:#EBF5FB;color:#154360;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #AED6F1">Minimo</td>'
        + '<td style="background:#EBF5FB;color:#1A5276;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #AED6F1">' + minV + ' mg/dL</td>'
        + '<td style="background:#EBF5FB;color:#154360;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #AED6F1">Maximo</td>'
        + '<td style="background:#EBF5FB;color:#1A5276;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #AED6F1">' + maxV + ' mg/dL</td>'
        + '<td style="background:#EBF5FB;color:#154360;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #AED6F1">Promedio</td>'
        + '<td style="background:#EBF5FB;color:#1A5276;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #AED6F1">' + avgV + ' mg/dL</td>'
      + '</tr>'
      + '<tr><td colspan="6" style="padding:4pt;background:#F8F9FA"></td></tr>'
      + '<tr>' + th('#') + th('Fecha') + th('Hora') + th('Nivel (mg/dL)') + th('Clasificacion') + th('Alerta') + '</tr>'
      + filas
      + '<tr><td colspan="6" style="padding:4pt;background:#F8F9FA"></td></tr>'
      + '<tr><td colspan="6" style="color:#AAA;font-size:9pt;padding:5pt 12pt;border-top:1pt solid #E0E0E0">InstaTech &middot; Reporte de Glucosa &middot; ' + date + '</td></tr>'
      + '</table></body></html>';
  };

  const compartirCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) { setModal({ visible: true, title: 'No disponible', message: 'Compartir no está disponible.', type: 'error' }); return; }
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      const path = dir + 'glucosa_' + Date.now() + '.xls';
      await FileSystem.writeAsStringAsync(path, generarExcel(), { encoding: 'utf8' });
      await Sharing.shareAsync(path, { mimeType: 'application/vnd.ms-excel', dialogTitle: 'Compartir reporte de Glucosa' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo compartir: ${err?.message || ''}`, type: 'error' });
    }
  };

  const descargarCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const filename = 'glucosa_' + Date.now() + '.xls';
      const content = generarExcel();
      if (Platform.OS === 'android') {
        const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perms.granted) return;
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(perms.directoryUri, filename, 'application/vnd.ms-excel');
        await FileSystem.writeAsStringAsync(uri, content, { encoding: 'utf8' });
      } else {
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + filename, content, { encoding: 'utf8' });
      }
      setModal({ visible: true, title: '¡Guardado!', message: Platform.OS === 'ios' ? 'Abre el archivo desde la app Archivos.' : 'Archivo guardado en la carpeta seleccionada.', type: 'success' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo guardar: ${err?.message || ''}`, type: 'error' });
    }
  };

  const obtenerResultados = async () => {
    try {
      const response = await fetch(`${API_URL}/glucosa/${user.id}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) setResultados(data);
    } catch {}
  };

  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/glucosa/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (response.ok && data.success) {
        setResultados(prev => prev.filter(item => item.id !== id));
        setModal({ visible: true, title: 'Eliminado', message: 'Resultado eliminado.', type: 'success' });
      } else {
        setModal({ visible: true, title: 'Error', message: 'No se pudo eliminar.', type: 'error' });
      }
    } catch {
      setModal({ visible: true, title: 'Error', message: 'Problema al eliminar.', type: 'error' });
    }
  };

  useEffect(() => {
    obtenerResultados();
    const interval = setInterval(() => {
      resultados.forEach(item => {
        if (clasificarGlucosa(item.nivel).label === "Muy alto" && !notificacionEnviada) {
          mostrarNotif("Glucosa peligrosa", "Tu nivel es muy alto, ve al hospital");
          setNotificacionEnviada(true);
          AsyncStorage.setItem('notificacionGlucosaEnviada', 'true');
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [resultados]);

  return (
    <>
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="pulse-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Resultados de Glucosa</Text>
        <Text style={styles.headerSub}>Historial de tus niveles</Text>
        {resultados.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.countChip}>
              <Ionicons name="list-outline" size={13} color="#fff" />
              <Text style={styles.countChipText}>{resultados.length} registros</Text>
            </View>
            <TouchableOpacity style={styles.countChip} onPress={compartirCSV}>
              <Ionicons name="share-outline" size={13} color="#fff" />
              <Text style={styles.countChipText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.countChip} onPress={descargarCSV}>
              <Ionicons name="save-outline" size={13} color="#fff" />
              <Text style={styles.countChipText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <MiniChart
        data={[...resultados].reverse().map(r => ({ value: r.nivel, fecha: r.fecha }))}
        getColor={(v) => clasificarGlucosa(v).color}
        title="EVOLUCIÓN DE GLUCOSA"
        colors={colors}
      />

      {resultados.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="pulse-outline" size={52} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no hay registros</Text>
        </View>
      ) : (
        resultados.map((item) => {
          const cls = clasificarGlucosa(item.nivel);
          return (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={[styles.valueRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: cls.color + '20' }]}>
                  <Ionicons name={cls.icon} size={22} color={cls.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>NIVEL DE GLUCOSA</Text>
                  <View style={styles.valueLine}>
                    <Text style={[styles.bigValue, { color: cls.color }]}>{item.nivel}</Text>
                    <Text style={[styles.unit, { color: colors.textSecondary }]}>mg/dL</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: cls.color + '18' }]}>
                  <Text style={[styles.badgeText, { color: cls.color }]}>{cls.label}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatearFecha(item.fecha)}</Text>
                </View>
                {cls.label === "Muy alto" && (
                  <View style={styles.alertRow}>
                    <Ionicons name="warning-outline" size={13} color="#C0392B" />
                    <Text style={styles.alertText}>Atención inmediata</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.deleteBtn} onPress={() => eliminarResultado(item.id)}>
                  <Ionicons name="trash-outline" size={15} color="#E74C3C" />
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      <TouchableOpacity style={[styles.backBtn, { borderColor: HEADER_COLOR }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={18} color={HEADER_COLOR} />
        <Text style={[styles.backBtnText, { color: HEADER_COLOR }]}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
    </View>
    <AlertModal visible={modal.visible} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, visible: false })} />
    </>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    backgroundColor: HEADER_COLOR, paddingTop: 50, paddingBottom: 30,
    alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  backArrow: { position: 'absolute', top: 50, left: 18, padding: 6 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  countChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  countChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  card: {
    marginHorizontal: 20, marginTop: 14, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  valueLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  valueLine: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 2 },
  bigValue: { fontSize: 36, fontWeight: '900', lineHeight: 40 },
  unit: { fontSize: 13, marginBottom: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  cardFooter: { padding: 12, gap: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontSize: 12 },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  alertText: { fontSize: 12, fontWeight: '700', color: '#C0392B' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5, borderColor: '#E74C3C',
  },
  deleteText: { fontSize: 13, fontWeight: '700', color: '#E74C3C' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 20, padding: 14, borderRadius: 16, borderWidth: 1.5,
  },
  backBtnText: { fontSize: 15, fontWeight: '700' },
});

export default ResultadosScreen;
