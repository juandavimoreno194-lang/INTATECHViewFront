import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useUser } from "../Herramientas/UserContext";
import { useTheme } from './theme';
import AlertModal from './AlertModal';
import { Ionicons } from '@expo/vector-icons';
import MiniChart from './MiniChart';

import { getApiUrl } from './apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = "#E17055";

function clasificarIMC(imc) {
  if (imc < 18.5) return { label: 'Bajo peso',         color: '#74B9FF', icon: 'arrow-down-circle' };
  if (imc < 25)   return { label: 'Normal',            color: '#2ECC71', icon: 'checkmark-circle' };
  if (imc < 30)   return { label: 'Sobrepeso',         color: '#F39C12', icon: 'alert-circle' };
  if (imc < 35)   return { label: 'Obesidad grado I',  color: '#E67E22', icon: 'warning' };
  if (imc < 40)   return { label: 'Obesidad grado II', color: '#E74C3C', icon: 'warning' };
  return           { label: 'Obesidad grado III',      color: '#C0392B', icon: 'close-circle' };
}

const formatearFecha = (fecha) => {
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ResultadosScreen4 = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [resultados, setResultados] = useState([]);
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'success' });

  const generarExcel = () => {
    const C = '#E17055';
    const date = new Date().toLocaleDateString('es-ES');
    const vals = resultados.map(r => parseFloat(r.imc));
    const minV = Math.min(...vals).toFixed(1), maxV = Math.max(...vals).toFixed(1);
    const avgV = (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1);
    const BG = { 'Bajo peso':'#EBF5FB', Normal:'#D5F5E3', Sobrepeso:'#FEF9E7', 'Obesidad grado I':'#FDEDEC', 'Obesidad grado II':'#FADBD8', 'Obesidad grado III':'#F1948A' };
    const FG = { 'Bajo peso':'#1A5276', Normal:'#1E8449', Sobrepeso:'#9A7D0A', 'Obesidad grado I':'#C0392B', 'Obesidad grado II':'#922B21', 'Obesidad grado III':'#7B241C' };
    const th = t => '<td style="background:' + C + ';color:#FFF;font-weight:bold;padding:9pt 12pt;text-align:center;border:1pt solid ' + C + '">' + t + '</td>';
    const filas = resultados.map((r, i) => {
      const d = new Date(r.fecha);
      const cls = clasificarIMC(r.imc);
      const bg = BG[cls.label] || '#F4F6F7', fg = FG[cls.label] || '#555';
      const rb = i % 2 === 0 ? '#FFFFFF' : '#FDF2EE';
      const ab = cls.alert ? '#FDEDEC' : '#D5F5E3', af = cls.alert ? '#C0392B' : '#1E8449';
      const td = (v, s) => '<td style="padding:7pt 10pt;border:0.5pt solid #E0E0E0;' + (s||'') + '">' + v + '</td>';
      return '<tr style="background:' + rb + '">'
        + td(i+1, 'text-align:center;color:#AAA')
        + td(d.toLocaleDateString('es-ES'), '')
        + td(d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}), 'color:#888')
        + td(parseFloat(r.imc).toFixed(2), 'text-align:center;font-size:15pt;font-weight:bold;color:' + cls.color)
        + td(r.peso ?? '—', 'text-align:center')
        + td(r.altura ?? '—', 'text-align:center')
        + td(cls.label, 'text-align:center;font-weight:bold;background:' + bg + ';color:' + fg)
        + td(cls.alert ? 'SI' : 'NO', 'text-align:center;font-weight:bold;background:' + ab + ';color:' + af)
        + '</tr>';
    }).join('');
    return '<html><head><meta charset="UTF-8"></head><body>'
      + '<table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt">'
      + '<tr><td colspan="8" style="background:' + C + ';color:#FFF;font-size:18pt;font-weight:bold;padding:16pt 18pt">InstaTech &middot; Indice de Masa Corporal</td></tr>'
      + '<tr><td colspan="8" style="background:' + C + 'BB;color:#FFF;font-size:10pt;padding:5pt 18pt">Exportado el ' + date + '&nbsp;&nbsp;|&nbsp;&nbsp;' + resultados.length + ' registros</td></tr>'
      + '<tr><td colspan="8" style="padding:5pt;background:#F8F9FA"></td></tr>'
      + '<tr>'
        + '<td style="background:#FDEBD0;color:#784212;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F0B27A">Minimo</td>'
        + '<td style="background:#FDEBD0;color:#784212;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F0B27A">' + minV + '</td>'
        + '<td style="background:#FDEBD0;color:#784212;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F0B27A">Maximo</td>'
        + '<td style="background:#FDEBD0;color:#784212;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F0B27A">' + maxV + '</td>'
        + '<td style="background:#FDEBD0;color:#784212;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F0B27A">Promedio</td>'
        + '<td colspan="3" style="background:#FDEBD0;color:#784212;font-size:14pt;font-weight:bold;padding:8pt 12pt;border:0.5pt solid #F0B27A">' + avgV + ' kg/m²</td>'
      + '</tr>'
      + '<tr><td colspan="8" style="padding:4pt;background:#F8F9FA"></td></tr>'
      + '<tr>' + th('#') + th('Fecha') + th('Hora') + th('IMC') + th('Peso (kg)') + th('Altura (m)') + th('Clasificacion') + th('Alerta') + '</tr>'
      + filas
      + '<tr><td colspan="8" style="padding:4pt;background:#F8F9FA"></td></tr>'
      + '<tr><td colspan="8" style="color:#AAA;font-size:9pt;padding:5pt 12pt;border-top:1pt solid #E0E0E0">InstaTech &middot; Reporte de IMC &middot; ' + date + '</td></tr>'
      + '</table></body></html>';
  };

  const compartirCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) { setModal({ visible: true, title: 'No disponible', message: 'Compartir no está disponible.', type: 'error' }); return; }
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      const path = dir + 'imc_' + Date.now() + '.xls';
      await FileSystem.writeAsStringAsync(path, generarExcel(), { encoding: 'utf8' });
      await Sharing.shareAsync(path, { mimeType: 'application/vnd.ms-excel', dialogTitle: 'Compartir reporte de IMC' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo compartir: ${err?.message || ''}`, type: 'error' });
    }
  };

  const descargarCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const filename = 'imc_' + Date.now() + '.xls';
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
      const response = await fetch(`${API_URL}/obesidad?usuario_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setResultados(data);
      }
    } catch {}
  };

  const eliminarResultado = async (id) => {
    try {
      const response = await fetch(`${API_URL}/obesidad/${id}`, { method: "DELETE" });
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

  useEffect(() => { obtenerResultados(); }, []);

  return (
    <>
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="body-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Resultados de IMC</Text>
        <Text style={styles.headerSub}>Historial de tu índice de masa corporal</Text>
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
        data={[...resultados].reverse().map(r => ({ value: r.imc, fecha: r.fecha }))}
        getColor={(v) => clasificarIMC(v).color}
        title="EVOLUCIÓN DEL IMC"
        colors={colors}
      />

      {resultados.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="body-outline" size={52} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aún no hay registros</Text>
        </View>
      ) : (
        resultados.map((item) => {
          const cls = clasificarIMC(item.imc);
          return (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={[styles.valueRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.iconBox, { backgroundColor: cls.color + '20' }]}>
                  <Ionicons name={cls.icon} size={22} color={cls.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>ÍNDICE DE MASA CORPORAL</Text>
                  <View style={styles.valueLine}>
                    <Text style={[styles.bigValue, { color: cls.color }]}>{item.imc}</Text>
                    <Text style={[styles.unit, { color: colors.textSecondary }]}>IMC</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: cls.color + '18' }]}>
                  <Text style={[styles.badgeText, { color: cls.color }]}>{cls.label}</Text>
                </View>
              </View>
              {item.peso && item.altura && (
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Peso</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{item.peso} <Text style={{ fontSize: 11 }}>kg</Text></Text>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Altura</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{item.altura} <Text style={{ fontSize: 11 }}>m</Text></Text>
                  </View>
                </View>
              )}
              <View style={styles.cardFooter}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                  <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatearFecha(item.fecha)}</Text>
                </View>
                {(cls.label === 'Obesidad grado II' || cls.label === 'Obesidad grado III') && (
                  <View style={styles.alertRow}>
                    <Ionicons name="warning-outline" size={13} color="#C0392B" />
                    <Text style={styles.alertText}>Consulta un especialista</Text>
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
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 3 },
  detailValue: { fontSize: 18, fontWeight: '800' },
  detailDivider: { width: 1, height: 30, marginHorizontal: 8 },
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

export default ResultadosScreen4;
