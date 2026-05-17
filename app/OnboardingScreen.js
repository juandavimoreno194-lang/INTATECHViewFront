import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './Regular/Herramientas/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'person-circle',
    color: '#6C5CE7',
    bg: '#6C5CE71A',
    title: 'Completa tu perfil',
    desc: 'Ve a tu perfil y agrega tu tipo de sangre, peso y altura. Con esos datos las alertas serán más precisas.',
    tip: 'Ir a Perfil',
    tipIcon: 'person-outline',
  },
  {
    icon: 'pulse',
    color: '#0984E3',
    bg: '#0984E31A',
    title: 'Registra tu salud',
    desc: 'Usa las herramientas del menú: Glucosa, IMC, Cardio y más. Cada medición queda guardada con fecha y clasificación.',
    tip: 'Desde el menú principal',
    tipIcon: 'grid-outline',
  },
  {
    icon: 'alarm',
    color: '#FF6B6B',
    bg: '#FF6B6B1A',
    title: 'Crea recordatorios',
    desc: 'Agrega alertas para medicamentos y citas médicas. La app te notificará en el momento exacto.',
    tip: 'Herramienta Recordatorios',
    tipIcon: 'calendar-outline',
  },
];

const OnboardingScreen = ({ navigation, route }) => {
  const colors = useTheme();
  const scrollRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const userId = route?.params?.userId;

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(idx);
  };

  const goTo = (idx) => {
    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
    setCurrent(idx);
  };

  const finish = async () => {
    if (userId) {
      await AsyncStorage.setItem(`@guide_${userId}`, '1').catch(() => {});
    }
    navigation.replace('HomeRegularScreen');
  };

  const isLast = current === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.skip} onPress={finish}>
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>Omitir</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.bg }]}>
              <Ionicons name={slide.icon} size={90} color={slide.color} />
            </View>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{slide.desc}</Text>
            <View style={[styles.tipBox, { backgroundColor: slide.color + '15', borderColor: slide.color + '40' }]}>
              <Ionicons name={slide.tipIcon} size={15} color={slide.color} />
              <Text style={[styles.tipText, { color: slide.color }]}>{slide.tip}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === current ? SLIDES[current].color : colors.border },
              i === current && styles.dotActive,
            ]}
            onPress={() => goTo(i)}
          />
        ))}
      </View>

      <View style={styles.btnRow}>
        {!isLast ? (
          <>
            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: SLIDES[current].color }]}
              onPress={finish}
            >
              <Text style={[styles.btnOutlineText, { color: SLIDES[current].color }]}>Saltar guía</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: SLIDES[current].color }]}
              onPress={() => goTo(current + 1)}
            >
              <Text style={styles.btnPrimaryText}>Siguiente</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: SLIDES[current].color, flex: 1 }]}
            onPress={finish}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.btnPrimaryText}>Comenzar a usar la app</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  skip: { position: 'absolute', top: 52, right: 20, zIndex: 10, padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600' },

  slide: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 36, paddingTop: 60, paddingBottom: 20,
  },
  iconCircle: {
    width: 160, height: 160, borderRadius: 80,
    justifyContent: 'center', alignItems: 'center', marginBottom: 36,
  },
  slideTitle: { fontSize: 25, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
  slideDesc: { fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 20 },
  tipBox: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1,
  },
  tipText: { fontSize: 13, fontWeight: '700' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24, borderRadius: 4 },

  btnRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, paddingBottom: 44 },
  btnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16, borderRadius: 16,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnOutline: {
    paddingHorizontal: 20, padding: 16, borderRadius: 16, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { fontSize: 15, fontWeight: '600' },
});

export default OnboardingScreen;
