import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { useUser } from './Herramientas/UserContext';
import { useTheme } from './Herramientas/theme';
import { Ionicons } from '@expo/vector-icons';
import AlertModal from './Herramientas/AlertModal';

import { getApiUrl } from './Herramientas/apiConfig';
const API_URL = getApiUrl();
const HEADER_COLOR = '#4A90E2';

const FRECUENCIAS = [
  { label: 'Cada hora',   value: 'hourly',   ms: 3600000 },
  { label: 'Cada 6h',     value: 'every6h',  ms: 21600000 },
  { label: 'Cada día',    value: 'daily',    ms: 86400000 },
  { label: 'Cada semana', value: 'weekly',   ms: 604800000 },
  { label: 'Cada mes',    value: 'monthly',  ms: 2592000000 },
];

function clsGlucosa(n) {
  if (n == null) return { label: '—', color: '#95A5A6', alert: false };
  if (n < 70)   return { label: 'Bajo',         color: '#E67E22', alert: true };
  if (n <= 100) return { label: 'Normal',        color: '#2ECC71', alert: false };
  if (n <= 125) return { label: 'Pre-Diabetes',  color: '#F39C12', alert: true };
  if (n <= 180) return { label: 'Alto',          color: '#E74C3C', alert: true };
  return              { label: 'Muy alto',       color: '#C0392B', alert: true };
}
function clsIMC(v) {
  if (v == null) return { label: '—', color: '#95A5A6', alert: false };
  if (v < 18.5)  return { label: 'Bajo peso', color: '#74B9FF', alert: true };
  if (v < 25)    return { label: 'Normal',    color: '#2ECC71', alert: false };
  if (v < 30)    return { label: 'Sobrepeso', color: '#F39C12', alert: true };
  return               { label: 'Obesidad',   color: '#E74C3C', alert: true };
}
function clsBPM(v) {
  if (v == null) return { label: '—', color: '#95A5A6', alert: false };
  if (v < 60)    return { label: 'Bradicardia', color: '#E67E22', alert: true };
  if (v <= 100)  return { label: 'Normal',      color: '#2ECC71', alert: false };
  if (v <= 150)  return { label: 'Taquicardia', color: '#E74C3C', alert: true };
  return               { label: 'Crítico',      color: '#C0392B', alert: true };
}

function formatoFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function generarHTML(reporte) {
  const u = reporte.user;
  const glucosa = reporte.glucosa || [];
  const obesidad = reporte.obesidad || [];
  const cardio = reporte.cardio || [];
  const ultGlu = glucosa[glucosa.length - 1] || {};
  const ultObe = obesidad[obesidad.length - 1] || {};
  const ultCar = cardio[cardio.length - 1] || {};

  const maxGlu = Math.max(...glucosa.map(g => g.nivel), 100);
  const maxImc = Math.max(...obesidad.map(o => o.imc), 30);
  const maxBpm = Math.max(...cardio.map(c => c.bpm || 0), 60);

  const barrasGlu = glucosa.slice(-10).map(g => ({
    date: formatoFecha(g.fecha), val: g.nivel,
    pct: (g.nivel / maxGlu) * 100,
    color: g.rango_riesgo === 'Muy alto' || g.rango_riesgo === 'Alto' ? '#E74C3C' : g.rango_riesgo === 'Moderado' ? '#F39C12' : '#2ECC71'
  })).reverse();

  const barrasImc = obesidad.slice(-10).map(o => ({
    date: formatoFecha(o.fecha), val: o.imc.toFixed(1),
    pct: (o.imc / maxImc) * 100,
  })).reverse();

  const barrasBpm = cardio.filter(c => c.bpm).slice(-10).map(c => ({
    date: formatoFecha(c.fecha), val: c.bpm,
    pct: (c.bpm / maxBpm) * 100,
    color: c.bpm > 100 ? '#E74C3C' : c.bpm < 60 ? '#F39C12' : '#2ECC71'
  })).reverse();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0f2f5; color: #1a1a2e; padding: 20px; }
    .header { background: linear-gradient(135deg, #4A90E2, #357ABD); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 15px rgba(74,144,226,0.3); }
    .header h1 { font-size: 24px; margin-bottom: 4px; }
    .header p { font-size: 15px; color: #fff; }
    .header .date { font-size: 12px; margin-top: 8px; color: #dce6f5; }
    .grid { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; }
    .card { flex: 1 1 180px; background: white; border-radius: 14px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .card .label { font-size: 11px; text-transform: uppercase; color: #555; letter-spacing: 1px; margin-bottom: 6px; }
    .card .value { font-size: 26px; font-weight: 800; }
    .card .sub { font-size: 12px; color: #444; margin-top: 4px; font-weight: 500; }
    .danger { color: #E74C3C; font-weight: 700; }
    .warning { color: #D4880F; font-weight: 700; }
    .success { color: #1E9A4A; font-weight: 700; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 16px; margin-bottom: 14px; color: #222; border-left: 4px solid #4A90E2; padding-left: 10px; }
    .chart-container { background: white; border-radius: 14px; padding: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 14px; }
    .chart-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; color: #333; }
    .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 140px; padding-top: 10px; }
    .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .bar { width: 100%; border-radius: 4px 4px 0 0; min-height: 4px; }
    .bar-label { font-size: 8px; color: #555; margin-top: 4px; text-align: center; font-weight: 500; }
    .bar-value { font-size: 8px; font-weight: 700; margin-bottom: 2px; color: #222; }
    .table { width: 100%; border-collapse: collapse; background: white; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .table th { background: #4A90E2; color: white; padding: 10px 12px; text-align: left; font-size: 12px; }
    .table td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; font-size: 12px; color: #222; }
    .table tr:last-child td { border-bottom: none; }
    .footer { text-align: center; color: #666; font-size: 11px; margin-top: 30px; padding-top: 16px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reporte de Salud</h1>
    <p>${u.nombre} · ${u.email}</p>
    <div class="date">Generado el ${new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
  </div>
  <div class="grid">
    <div class="card">
      <div class="label">Glucosa</div>
      <div class="value ${ultGlu.rango_riesgo === 'Muy alto' || ultGlu.rango_riesgo === 'Alto' ? 'danger' : ultGlu.rango_riesgo === 'Moderado' ? 'warning' : 'success'}">${ultGlu.nivel || '—'}</div>
      <div class="sub">${ultGlu.rango_riesgo || 'Sin datos'} · mg/dL</div>
    </div>
    <div class="card">
      <div class="label">IMC</div>
      <div class="value ${(ultObe.imc || 0) >= 30 ? 'danger' : (ultObe.imc || 0) >= 25 ? 'warning' : 'success'}">${ultObe.imc ? ultObe.imc.toFixed(1) : '—'}</div>
      <div class="sub">${ultObe.imc ? (ultObe.imc >= 30 ? 'Obesidad' : ultObe.imc >= 25 ? 'Sobrepeso' : 'Normal') : 'Sin datos'}</div>
    </div>
    <div class="card">
      <div class="label">Cardiovascular</div>
      <div class="value ${ultCar.riesgo_cardiovascular === 'Infarto' || ultCar.riesgo_cardiovascular === 'Alto' ? 'danger' : 'success'}">${ultCar.riesgo_cardiovascular || '—'}</div>
      <div class="sub">BPM: ${ultCar.bpm || '—'}</div>
    </div>
  </div>
  ${glucosa.length > 1 ? `<div class="section"><h2>Tendencia de Glucosa</h2><div class="chart-container"><div class="chart-title">Últimos ${Math.min(glucosa.length, 10)} registros (mg/dL)</div><div class="bar-chart">${barrasGlu.map(b => `<div class="bar-wrapper"><div class="bar-value">${b.val}</div><div class="bar" style="height:${b.pct}%;background:${b.color};"></div><div class="bar-label">${b.date}</div></div>`).join('')}</div></div></div>` : ''}
  ${obesidad.length > 1 ? `<div class="section"><h2>Tendencia de IMC</h2><div class="chart-container"><div class="chart-title">Últimos ${Math.min(obesidad.length, 10)} registros</div><div class="bar-chart">${barrasImc.map(b => `<div class="bar-wrapper"><div class="bar-value">${b.val}</div><div class="bar" style="height:${b.pct}%;background:#4A90E2;"></div><div class="bar-label">${b.date}</div></div>`).join('')}</div></div></div>` : ''}
  ${barrasBpm.length > 1 ? `<div class="section"><h2>Tendencia de BPM</h2><div class="chart-container"><div class="chart-title">Últimos ${Math.min(barrasBpm.length, 10)} registros</div><div class="bar-chart">${barrasBpm.map(b => `<div class="bar-wrapper"><div class="bar-value">${b.val}</div><div class="bar" style="height:${b.pct}%;background:${b.color};"></div><div class="bar-label">${b.date}</div></div>`).join('')}</div></div></div>` : ''}
  ${glucosa.length > 0 ? `<div class="section"><h2>Historial de Glucosa</h2><table class="table"><tr><th>Fecha</th><th>Nivel</th><th>Riesgo</th></tr>${glucosa.slice().reverse().map(g => `<tr><td>${formatoFecha(g.fecha)}</td><td>${g.nivel}</td><td>${g.rango_riesgo || '—'}</td></tr>`).join('')}</table></div>` : ''}
  <div class="footer">InstaTech · Reporte automatizado de salud · ${new Date().toLocaleDateString('es-CO')}</div>
</body>
</html>`;
}

const ActividadScreen = ({ navigation }) => {
  const { user } = useUser();
  const colors = useTheme();
  const [actividad, setActividad] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [frecuencia, setFrecuencia] = useState('daily');
  const [autoActivo, setAutoActivo] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: '', message: '', type: 'success' });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (user?.id) { obtenerActividad(); cargarConfig(); }
  }, [user]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const obtenerActividad = async () => {
    try {
      const res = await fetch(`${API_URL}/actividad?usuario_id=${user.id}`);
      const data = await res.json();
      if (res.ok) setActividad(data);
    } catch {} finally { setLoading(false); }
  };

  const cargarConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/actividad/config?usuario_id=${user.id}`);
      const data = await res.json();
      if (data?.frecuencia) { setFrecuencia(data.frecuencia); setAutoActivo(data.activo === 1); }
    } catch {}
  };

  const guardarConfig = async (freq, activo) => {
    try {
      await fetch(`${API_URL}/actividad/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id, frecuencia: freq, activo }),
      });
    } catch {}
  };

  const toggleAuto = () => {
    const nuevoActivo = !autoActivo;
    setAutoActivo(nuevoActivo);
    guardarConfig(frecuencia, nuevoActivo);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (nuevoActivo) {
      const freqMs = FRECUENCIAS.find(f => f.value === frecuencia)?.ms || 86400000;
      intervalRef.current = setInterval(() => { generarYCompartir(false); }, freqMs);
    }
  };

  const cambiarFrecuencia = (freq) => {
    setFrecuencia(freq);
    if (autoActivo) {
      guardarConfig(freq, true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      const freqMs = FRECUENCIAS.find(f => f.value === freq)?.ms || 86400000;
      intervalRef.current = setInterval(() => { generarYCompartir(false); }, freqMs);
    }
  };

  const obtenerReporte = async () => {
    const res = await fetch(`${API_URL}/actividad/reporte?usuario_id=${user.id}&dias=90`);
    const data = await res.json();
    setReporte(data);
    return data;
  };

  const generarYCompartir = async (mostrarAlerta = true) => {
    setGenerando(true);
    try {
      const data = reporte || await obtenerReporte();
      const html = generarHTML(data);
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch {
      if (mostrarAlerta) setModal({ visible: true, title: 'Error', message: 'No se pudo generar el PDF.', type: 'error' });
      return null;
    } finally { setGenerando(false); }
  };

  const handleGenerarPDF = async () => {
    setGenerando(true);
    try {
      const data = await obtenerReporte();
      const html = generarHTML(data);
      const { uri } = await Print.printToFileAsync({ html });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setModal({ visible: true, title: 'No disponible', message: 'Compartir no está disponible en este dispositivo.', type: 'error' });
        return;
      }
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Compartir reporte de salud' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo generar el PDF: ${err?.message || ''}`, type: 'error' });
    } finally { setGenerando(false); }
  };

  const generarCSV = async () => {
    const data = await obtenerReporte();
    const glucosa = data.glucosa || [];
    const obesidad = data.obesidad || [];
    const cardio = data.cardio || [];
    const bom = '﻿';
    const header = 'Tipo,N,Fecha,Hora,Valor,Unidad,Clasificacion,Alerta';
    const gRows = glucosa.map((r, i) => {
      const d = new Date(r.fecha);
      const alerta = r.rango_riesgo === 'Muy alto' || r.rango_riesgo === 'Alto' ? 'Sí' : 'No';
      return `"Glucosa",${i + 1},"${d.toLocaleDateString('es-ES')}","${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}",${r.nivel},"mg/dL","${r.rango_riesgo ?? ''}","${alerta}"`;
    });
    const oRows = obesidad.map((r, i) => {
      const d = new Date(r.fecha);
      const cls = r.imc >= 30 ? 'Obesidad' : r.imc >= 25 ? 'Sobrepeso' : 'Normal';
      return `"IMC",${i + 1},"${d.toLocaleDateString('es-ES')}","${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}",${parseFloat(r.imc).toFixed(2)},"kg/m2","${cls}","${r.imc >= 25 ? 'Sí' : 'No'}"`;
    });
    const cRows = cardio.map((r, i) => {
      const d = new Date(r.fecha);
      const alerta = r.riesgo_cardiovascular === 'Infarto' || r.riesgo_cardiovascular === 'Muy alto' ? 'Sí' : 'No';
      return `"Cardio",${i + 1},"${d.toLocaleDateString('es-ES')}","${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}",${r.bpm ?? ''},"lpm","${r.riesgo_cardiovascular ?? ''}","${alerta}"`;
    });
    return `${bom}${header}\n${[...gRows, ...oRows, ...cRows].join('\n')}`;
  };

  const exportarCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) { setModal({ visible: true, title: 'No disponible', message: 'Compartir no está disponible.', type: 'error' }); return; }
      setGenerando(true);
      const csv = await generarCSV();
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      const path = dir + 'salud_' + Date.now() + '.csv';
      await FileSystem.writeAsStringAsync(path, csv, { encoding: 'utf8' });
      await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Compartir historial de salud', UTI: 'public.comma-separated-values-text' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo compartir: ${err?.message || ''}`, type: 'error' });
    } finally { setGenerando(false); }
  };

  const descargarCSV = async () => {
    if (Platform.OS === 'web') { setModal({ visible: true, title: 'No disponible', message: 'No disponible en web.', type: 'error' }); return; }
    try {
      setGenerando(true);
      const csv = await generarCSV();
      const filename = 'salud_' + Date.now() + '.csv';
      if (Platform.OS === 'android') {
        const perms = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perms.granted) { setGenerando(false); return; }
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(perms.directoryUri, filename, 'text/csv');
        await FileSystem.writeAsStringAsync(uri, csv, { encoding: 'utf8' });
      } else {
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + filename, csv, { encoding: 'utf8' });
      }
      setModal({ visible: true, title: '¡Guardado!', message: Platform.OS === 'ios' ? 'Archivo guardado. Ábrelo desde la app Archivos.' : 'Archivo guardado en la carpeta seleccionada.', type: 'success' });
    } catch (err) {
      setModal({ visible: true, title: 'Error', message: `No se pudo guardar: ${err?.message || ''}`, type: 'error' });
    } finally { setGenerando(false); }
  };

  const freqActual = FRECUENCIAS.find(f => f.value === frecuencia) || FRECUENCIAS[2];

  const glu = actividad?.glucosa_level != null ? Number(actividad.glucosa_level) : null;
  const imc = actividad?.obesidad_imc != null ? Number(actividad.obesidad_imc) : null;
  const bpm = actividad?.bpm != null ? Number(actividad.bpm) : null;

  const METRICS = [
    { key: 'glu', label: 'Glucosa', unit: 'mg/dL', value: glu,       icon: 'pulse',  color: '#0984E3', cls: clsGlucosa(glu) },
    { key: 'imc', label: 'IMC',     unit: 'kg/m²', value: imc,       icon: 'body',   color: '#E17055', cls: clsIMC(imc) },
    { key: 'bpm', label: 'Cardio',  unit: 'lpm',   value: bpm,       icon: 'heart',  color: '#D63031', cls: clsBPM(bpm) },
  ];

  return (
    <>
    <View style={{ flex: 1, overflow: 'hidden' }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { backgroundColor: colors.background }]}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerIcon}>
          <Ionicons name="stats-chart-outline" size={36} color="#fff" />
        </View>
        <Text style={styles.headerTitle}>Historial de Salud</Text>
        <Text style={styles.headerSub}>Resumen, reportes y exportación</Text>
        {actividad && (
          <View style={styles.userChip}>
            <Ionicons name="person-outline" size={13} color="#fff" />
            <Text style={styles.userChipText}>{actividad.user_name}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={HEADER_COLOR} style={{ marginTop: 50 }} />
      ) : (
        <>
          {/* ── MÉTRICAS ── */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Último registro</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.metricsRow}>
            {METRICS.map(m => (
              <View key={m.key} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <View style={[styles.metricIcon, { backgroundColor: m.color + '20' }]}>
                  <Ionicons name={`${m.icon}-outline`} size={20} color={m.color} />
                  {m.cls.alert && m.value != null && (
                    <View style={styles.alertDot}><Ionicons name="warning" size={8} color="#fff" /></View>
                  )}
                </View>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{m.label}</Text>
                <Text style={[styles.metricValue, { color: m.value != null ? m.cls.color : colors.textSecondary }]}>
                  {m.value != null ? m.value : '—'}
                </Text>
                {m.value != null && <Text style={[styles.metricUnit, { color: colors.textSecondary }]}>{m.unit}</Text>}
                <View style={[styles.metricBadge, { backgroundColor: m.cls.color + '18' }]}>
                  <Text style={[styles.metricBadgeText, { color: m.cls.color }]}>{m.cls.label}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Riesgo cardiovascular si existe */}
          {actividad?.riesgo_cardiovascular && (
            <View style={[styles.riskBanner, { backgroundColor: colors.card, borderColor: '#D63031' }]}>
              <Ionicons name="heart-outline" size={18} color="#D63031" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.riskLabel, { color: colors.textSecondary }]}>Riesgo cardiovascular</Text>
                <Text style={[styles.riskValue, { color: '#D63031' }]}>{actividad.riesgo_cardiovascular}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          )}
        </>
      )}

      {/* ── EXPORTAR ── */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBox, { backgroundColor: HEADER_COLOR + '20' }]}>
            <Ionicons name="download-outline" size={18} color={HEADER_COLOR} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Exportar datos</Text>
        </View>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: '#27AE60' }]}
          onPress={exportarCSV}
          disabled={generando}
          activeOpacity={0.82}
        >
          <View style={styles.exportBtnIcon}>
            <Ionicons name="document-text-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.exportBtnTitle}>Compartir CSV</Text>
            <Text style={styles.exportBtnSub}>Enviar a otra app · Excel / Google Sheets</Text>
          </View>
          {generando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-forward-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: '#16A085' }]}
          onPress={descargarCSV}
          disabled={generando}
          activeOpacity={0.82}
        >
          <View style={styles.exportBtnIcon}>
            <Ionicons name="save-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.exportBtnTitle}>Guardar CSV en teléfono</Text>
            <Text style={styles.exportBtnSub}>Guarda directo en tu almacenamiento</Text>
          </View>
          {generando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-forward-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: HEADER_COLOR }]}
          onPress={handleGenerarPDF}
          disabled={generando}
          activeOpacity={0.82}
        >
          <View style={styles.exportBtnIcon}>
            <Ionicons name="document-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.exportBtnTitle}>Generar PDF</Text>
            <Text style={styles.exportBtnSub}>Reporte con gráficas y resumen</Text>
          </View>
          {generando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-forward-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: '#25D366' }]}
          onPress={handleGenerarPDF}
          disabled={generando}
          activeOpacity={0.82}
        >
          <View style={styles.exportBtnIcon}>
            <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.exportBtnTitle}>Compartir por WhatsApp</Text>
            <Text style={styles.exportBtnSub}>Enviar PDF directamente</Text>
          </View>
          <Ionicons name="arrow-forward-circle-outline" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>

      {/* ── REPORTES AUTOMÁTICOS ── */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBox, { backgroundColor: (autoActivo ? '#2ECC71' : HEADER_COLOR) + '20' }]}>
            <Ionicons name="timer-outline" size={18} color={autoActivo ? '#2ECC71' : HEADER_COLOR} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reportes automáticos</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              {autoActivo ? `Activo · se envía ${freqActual.label.toLowerCase()}` : 'Programa tu reporte periódico'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: autoActivo ? '#2ECC7120' : colors.background }]}>
            <Text style={[styles.statusBadgeText, { color: autoActivo ? '#27AE60' : colors.textSecondary }]}>
              {autoActivo ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>

        <Text style={[styles.freqTitle, { color: colors.textSecondary }]}>Frecuencia:</Text>
        <View style={styles.freqGrid}>
          {FRECUENCIAS.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[
                styles.freqBtn,
                { borderColor: colors.border, backgroundColor: colors.background },
                frecuencia === f.value && { backgroundColor: HEADER_COLOR, borderColor: HEADER_COLOR },
              ]}
              onPress={() => cambiarFrecuencia(f.value)}
            >
              <Text style={[styles.freqText, { color: frecuencia === f.value ? '#fff' : colors.textSecondary }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: autoActivo ? '#E74C3C' : '#2ECC71' }]}
          onPress={toggleAuto}
          activeOpacity={0.85}
        >
          <Ionicons name={autoActivo ? 'stop-circle-outline' : 'play-circle-outline'} size={20} color="#fff" />
          <Text style={styles.toggleBtnText}>
            {autoActivo ? 'Desactivar automático' : 'Activar automático'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.backBtn, { borderColor: HEADER_COLOR }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={18} color={HEADER_COLOR} />
        <Text style={[styles.backBtnText, { color: HEADER_COLOR }]}>Volver</Text>
      </TouchableOpacity>

    </ScrollView>
    </View>
    <AlertModal
      visible={modal.visible}
      title={modal.title}
      message={modal.message}
      type={modal.type}
      onClose={() => setModal({ ...modal, visible: false })}
    />
    </>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },

  /* Header */
  header: {
    backgroundColor: HEADER_COLOR, paddingTop: 50, paddingBottom: 30,
    alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  backArrow: { position: 'absolute', top: 50, left: 18, padding: 6 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  userChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  userChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  /* Metrics */
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginHorizontal: 20, marginTop: 22, marginBottom: 10 },
  metricsRow: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  metricCard: {
    width: 120, borderRadius: 18, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  metricIcon: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8, position: 'relative',
  },
  alertDot: {
    position: 'absolute', top: -3, right: -3,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center',
  },
  metricLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: '900', lineHeight: 26 },
  metricUnit: { fontSize: 10, marginBottom: 6 },
  metricBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, alignSelf: 'flex-start' },
  metricBadgeText: { fontSize: 9, fontWeight: '700' },

  /* Risk banner */
  riskBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginTop: 14, padding: 14,
    borderRadius: 14, borderWidth: 1.5,
  },
  riskLabel: { fontSize: 11, fontWeight: '600' },
  riskValue: { fontSize: 15, fontWeight: '800' },

  /* Section card */
  section: {
    marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIconBox: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  sectionDesc: { fontSize: 11, marginTop: 1 },

  /* Export buttons */
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, padding: 14, marginBottom: 10,
  },
  exportBtnIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  exportBtnTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  exportBtnSub: { color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 2 },

  /* Status badge */
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '800' },

  /* Frequency */
  freqTitle: { fontSize: 11, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  freqBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5 },
  freqText: { fontSize: 12, fontWeight: '600' },

  /* Toggle */
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 14,
  },
  toggleBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  /* Back */
  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 8, padding: 14, borderRadius: 16, borderWidth: 1.5,
  },
  backBtnText: { fontSize: 15, fontWeight: '700' },
});

export default ActividadScreen;
