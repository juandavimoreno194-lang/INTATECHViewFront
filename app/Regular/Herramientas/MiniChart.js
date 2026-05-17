import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const fmtDate = (fecha) => {
  if (!fecha) return '';
  const d = fecha instanceof Date ? fecha : new Date(String(fecha).slice(0, 10) + 'T00:00:00');
  return isNaN(d.getTime()) ? '' : `${d.getDate()}/${d.getMonth() + 1}`;
};

const MiniChart = ({ data, getColor, title, colors }) => {
  if (!data || data.length < 2) return null;
  const items = [...data].slice(-8);
  const values = items.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = (max - min) || max || 1;
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10;
  const MAX_H = 70;

  return (
    <View style={{ marginHorizontal: 20, marginTop: 14 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textSecondary, marginBottom: 8 }}>
        {title || 'EVOLUCIÓN RECIENTE'}
      </Text>
      <View style={{
        backgroundColor: colors.card, borderRadius: 18, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingBottom: 2 }}>
            {items.map((item, i) => {
              const v = parseFloat(item.value);
              if (isNaN(v)) return null;
              const clr = getColor(v);
              const pct = range > 0 ? (v - min) / range : 0.5;
              const barH = Math.round(pct * MAX_H * 0.65 + MAX_H * 0.3);
              return (
                <View key={i} style={{ alignItems: 'center', minWidth: 38 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: clr, marginBottom: 3 }}>{v}</Text>
                  <View style={{ height: barH, width: 24, backgroundColor: clr, borderRadius: 6, opacity: 0.85 }} />
                  <Text style={{ fontSize: 8, color: colors.textSecondary, marginTop: 5, textAlign: 'center' }}>
                    {fmtDate(item.fecha)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View style={{
          flexDirection: 'row', justifyContent: 'space-around',
          marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: colors.textSecondary }}>Mín</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: getColor(min) }}>{min}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: colors.textSecondary }}>Prom</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: getColor(avg) }}>{avg}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: colors.textSecondary }}>Máx</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: getColor(max) }}>{max}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: colors.textSecondary }}>Registros</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{values.length}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MiniChart;
