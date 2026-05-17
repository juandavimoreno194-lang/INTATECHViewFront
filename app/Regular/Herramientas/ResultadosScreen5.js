import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useUser } from '../Herramientas/UserContext';
import { useTheme } from './theme';
import { useFocusEffect } from '@react-navigation/native';
import { mostrarNotif } from './NotificationHandler';
import AlertModal from './AlertModal';
import { Ionicons } from '@expo/vector-icons';
import MiniChart from './MiniChart';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#D63031";

function clasificarRiesgoCardio(riesgo) {
  if (!riesgo)           return { label: 'Sin datos', color: '#95A5A6', icon: 'help-circle' };
  const r = riesgo.toLowerCase();
  if (r.includes('infarto')) return { label: riesgo, color: '#C0392B', icon: 'close-circle' };
  if (r.includes('muy alto')) return { label: riesgo, color: '#E74C3C', icon: 'warning' };
  if (r.includes('alto'))     return { label: riesgo, color: '#E67E22', icon: 'alert-circle' };
  if (r.includes('normal'))   return { label: riesgo, color: '#2ECC71', icon: 'checkmark-circle' };
  return                       { label: riesgo, color: '#F39C12', icon: 'alert-circle' };
}

function clasificarBPM(bpm) {
  if (!bpm)       return { color: '#95A5A6' };
  if (bpm < 60)   return { color: '#E67E22' };
  if (bpm <= 100) return { color: '#2ECC71' };
  if (bpm <= 150) return { color: '#E74C3C' };
  return           { color: '#C0392B' };
}

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ResultadosScreen5 = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [resultados, setResultados] = useState([]);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'success' });

  useFocusEffect(
    React.useCallback(() => {
      const obtenerResultados = async () => {
        try {
          const response = await fetch(`${API_URL}/cardio?usuario_id=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setResultados(Array.isArray(data) ? data : []);
          }
        } catch {}
      };
      if (user?.id) obtenerResultados();
    }, [user])
  );

  useEffect(() => {
    if (!notificacionEnviada && resultados.some(r => r.riesgo_cardiovascular === "Infarto")) {
      mostrarNotif("¡Riesgo de Infarto!", "¡Necesitas atención médica urgente!");
      setNotificacionEnviada(true);
    }
  }, [resultados, notificacionEnviada]);

  const generarExcel = () => {
    const C = '#D63031';
    const date = new Date().toLocaleDateString('es-ES');
    const bpms = resultados.map(r => r.frecuencia_cardiaca ?? r.bpm).filter(v => v != null);
    const minV = bpms.length ? Math.min(...bpms) : '—', maxV = bpms.length ? Math.max(...bpms) : '—';
    const avgV = bpms.length ? Math.round(bpms.reduce((s, v) => s + v, 0) / bpms.length) : '—';
    const th = t => '<td style="background:' + C + ';color:#FFF;font-weight:bold;padding:9pt 12pt;text-align:center;border:1pt solid ' + C + '">' + t + '</td>';
    const riesgoBg = (v) => { if (!v) return '#F4F6F7'; if (v.includes('Infarto')) return '#FADBD8'; if (v.includes('alto') || v.includes('Alto')) return '#FDEDEC'; if (v.includes('Normal')) return '#D5F5E3'; return '#FEF9E7'; };
    const riesgoFg = (v) => { if (!v) return '#555'; if (v.includes('Infarto')) return '#7B241C'; if (v.includes('alto') || v.includes('Alto')) return '#C0392B'; if (v.includes('Normal')) return '#1E8449'; return '#9A7D0A'; };
    const filas = resultados.map((r, i) => {
      const d = new Date(r.fecha);
      const bpm = r.frecuencia_cardiaca ?? r.bpm;
      const cls = clasificarBPM(bpm);
      const rb = i % 2 === 0 ? '#FFFFFF' : '#FDEDEC55';
      const alerta = r.riesgo_cardiovascular === 'Infarto' || r.riesgo_cardiovascular === 'Muy alto';
      const td = (v, s) => '<td style="padding:7pt 10pt;border:0.5pt solid #E0E0E0;' + (s||'') + '">' + v + '</td>';
      return '<tr style="background:' + rb + '">'
        + td(i+1, 'text-align:center;color:#AAA')
        + td(d.toLocaleDateString('es-ES'), '')
        + td(d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}), 'color:#888')
        + td(bpm ?? '—', 'text-align:center;font-size:15pt;font-weight:bold;color:' + cls.color)
        + td(r.presion_arterial ?? '—', 'text-align:center')
        + td(r.riesgo_cardiovascular ?? '—', 'text-align:center;font-weight:bold;background:' + riesgoBg(r.riesgo_cardiovascular) + ';color:' + riesgoFg(r.riesgo_cardiovascular))
        + td(alerta ? 'SI' : 'NO', 'text-align:center;font-weight:bold;background:' + (alerta?'#FADBD8':'#D5F5E3') + ';color:' + (alerta?'#922B21':'#1E8449'))
        + '</tr>';
    }).join('');
    return '<html><head><meta charset="UTF-8"></head><body>'
      + '<table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt">'
      + '<tr><td colspan="7" style="background:' + C + ';color:#FFF;font-size:18pt;font-weight:bold;padding:16pt 18pt">InstaTech &middot; Monitor Cardiaco</td></tr>'
      + '<tr><td colspan="7" style="background:' + C + 'BB;color:#FFF;font-size:10pt;padding:5pt 18pt">Exportado el ' + date + '&nbsp;&nbsp;|&nbsp;&nbsp;' + resultados.length + ' registros</td></tr>'
      + '<tr><td colspan="7" style="padding:5pt;background:#F8F9FA"></td></tr>'
      + '<tr>'
        + '<td style="background:#FADBD8;color:#7B241C;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F1948A">BPM minimo</td>'
        + '<td style="background:#FADBD8;color:#7B241C;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F1948A">' + minV + ' lpm</td>'
        + '<td style="background:#FADBD8;color:#7B241C;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F1948A">BPM maximo</td>'
        + '<td style="background:#FADBD8;color:#7B241C;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F1948A">' + maxV + ' lpm</td>'
        + '<td style="background:#FADBD8;color:#7B241C;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F1948A">Promedio</td>'
        + '<td colspan="2" style="background:#FADBD8;color:#7B241C;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F1948A">' + avgV + ' lpm</td>'
      + '</tr>'
      + '<tr><td colspan="7" style="padding:4pt;background:#F8F9FA"></td></tr>'
      + '<tr>' + th('#') + th('Fecha') + th('Hora') + th('BPM') + th('Presion (mmHg)') + th('Riesgo') + th('Alerta') + '</tr>'
      + filas
      + '<tr><td colspan="7" style="padding:4pt;background:#F8F9FA"></td></tr>'
      + '<tr><td colspan="7" style="color:#AAA;font-size:9pt;padding:5pt 12pt;border-top:1pt solid #E0E0E0">InstaTech &middot; Reporte Cardiaco &middot; ' + date + '</td></tr>'
      + '</table></body></html>';
  };

  const compartirCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) { setModal({ visible: true, title: 'No disponible', message: 'Compartir no está disponible.', type: 'error' }); return; }
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      const path = dir + 'cardio_' + Date.now() + '.xls';
      await FileSystem.writeAsStringAsync(path, generarExcel(), { encoding: 'utf8' });
      await Sharing.shareAsync(path, { mimeType: 'application/vnd.ms-excel', dialogTitle: 'Compartir reporte Cardiaco' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo compartir: ${err?.message || ''}`, type: 'error' });
    }
  };

  const descargarCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const filename = 'cardio_' + Date.now() + '.xls';
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

  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cardio/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setResultados(prev => prev.filter(item => item.id !== id));
        setModal({ visible: true, title: 'Eliminado', message: 'Resultado eliminado.', type: 'success' });
      } else {
        setModal({ visible: true, title: 'Error', message: 'No se pudo eliminar.', type: 'error' });
      }
    } catch {
      setModal({ visible: true, title: 'Error', message: 'Problema al eliminar.', type: 'error' });
    }
  };

  return (
    <>
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="heart-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Resultados Cardíacos</Text>
        <Text style={styles.headerSub}>Historial de tu monitor cardíaco</Text>
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
        data={[...resultados].reverse().map(r => ({ value: r.frecuencia_cardiaca ?? r.bpm, fecha: r.fecha }))}
        getColor={(v) => clasificarBPM(v).color}
        title="EVOLUCIÓN CARDÍACA"
        colors={colors}
      />

      {resultados.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="heart-outline" size={52} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no hay registros</Text>
        </View>
      ) : (
        resultados.map((item) => {
          const clsRiesgo = clasificarRiesgoCardio(item.riesgo_cardiovascular);
          const clsBPM = clasificarBPM(item.frecuencia_cardiaca);
          return (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
              {/* BPM principal */}
              <View style={[styles.valueRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: clsBPM.color + '20' }]}>
                  <Ionicons name="heart" size={22} color={clsBPM.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>FRECUENCIA CARDÍACA</Text>
                  <View style={styles.valueLine}>
                    <Text style={[styles.bigValue, { color: clsBPM.color }]}>{item.frecuencia_cardiaca ?? '--'}</Text>
                    <Text style={[styles.unit, { color: colors.textSecondary }]}>lpm</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: clsRiesgo.color + '18' }]}>
                  <Ionicons name={clsRiesgo.icon} size={12} color={clsRiesgo.color} />
                  <Text style={[styles.badgeText, { color: clsRiesgo.color }]}>{clsRiesgo.label}</Text>
                </View>
              </View>
              {/* Presión arterial */}
              {item.presion_arterial && (
                <View style={[styles.subRow, { borderBottomColor: colors.border }]}>
                  <Ionicons name="pulse-outline" size={15} color={colors.textSecondary} />
                  <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Presión arterial:</Text>
                  <Text style={[styles.subValue, { color: colors.text }]}>{item.presion_arterial} mmHg</Text>
                </View>
              )}
              <View style={styles.cardFooter}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatearFecha(item.fecha)}</Text>
                </View>
                {(item.riesgo_cardiovascular === "Infarto" || item.riesgo_cardiovascular === "Muy alto") && (
                  <View style={styles.alertRow}>
                    <Ionicons name="warning-outline" size={13} color="#C0392B" />
                    <Text style={styles.alertText}>Atención médica urgente</Text>
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
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  subRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  subLabel: { fontSize: 12 },
  subValue: { fontSize: 13, fontWeight: '700' },
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

export default ResultadosScreen5;
