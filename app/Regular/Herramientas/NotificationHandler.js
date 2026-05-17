import { useEffect, useRef } from 'react';
import { Platform, AppState, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlarm } from './GlobalAlarmModal';

let Notifications = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

const CHANNEL_ID = 'recordatorios_alarm';
const CATEGORY_ID = 'recordatorio';

async function crearCanal() {
  if (Platform.OS === 'android' && Notifications) {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Recordatorios',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 500, 200, 500],
        bypassDnd: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    } catch {}
  }
}

async function crearCategorias() {
  if (!Notifications) return;
  try {
    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: 'POSPONER',
        buttonTitle: 'Posponer 5 min',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'DETENER',
        buttonTitle: 'Detener',
        options: { opensAppToForeground: false },
      },
    ]);
  } catch {}
}

async function permisos() {
  if (!Notifications) return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch { return false; }
}

async function notifContent(titulo, cuerpo) {
  return {
    title: titulo,
    body: cuerpo,
    sound: 'default',
    categoryIdentifier: CATEGORY_ID,
    ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
  };
}

async function mostrarNotif(titulo, cuerpo) {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: await notifContent(titulo, cuerpo),
      trigger: { seconds: 1 },
    });
  } catch {}
}

function vibrarAlarma() {
  try {
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
  } catch {}
}

async function leerRecordatorios() {
  try {
    const raw = await AsyncStorage.getItem('@recordatorios');
    if (!raw || !raw.trim()) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function parsearFecha(fecha, hora) {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hour, minute] = hora.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

async function agendarRecordatorio(id, titulo, fecha, hora) {
  if (!Notifications) return;
  const triggerDate = parsearFecha(fecha, hora);
  if (triggerDate <= new Date()) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: await notifContent('Recordatorio', titulo),
      trigger: { date: triggerDate.getTime() },
      identifier: `REMINDER-${id}`,
    });
  } catch {}
}

async function posponerRecordatorio(reminderId) {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`REMINDER-${reminderId}`);
    const nuevaFecha = new Date(Date.now() + 5 * 60 * 1000);
    await Notifications.scheduleNotificationAsync({
      content: await notifContent('Recordatorio (pospuesto)', 'Tienes un recordatorio pendiente'),
      trigger: { date: nuevaFecha.getTime() },
      identifier: `REMINDER-${reminderId}`,
    });
    const raw = await AsyncStorage.getItem('@recordatorios');
    if (raw && raw.trim()) {
      const list = JSON.parse(raw);
      const idx = list.findIndex(r => r.id === parseInt(reminderId));
      if (idx !== -1) {
        list[idx].notificado = false;
        list[idx].hora = `${String(nuevaFecha.getHours()).padStart(2, '0')}:${String(nuevaFecha.getMinutes()).padStart(2, '0')}:00`;
        await AsyncStorage.setItem('@recordatorios', JSON.stringify(list));
      }
    }
  } catch {}
}

const NotificationHandler = () => {
  const timerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      await crearCanal();
      await crearCategorias();
      const ok = await permisos();
      if (!ok || !Notifications) return;

      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const scheduledIds = new Set(scheduled.map(n => n.identifier));

      const list = await leerRecordatorios();
      for (const r of list) {
        const id = `REMINDER-${r.id}`;
        if (!scheduledIds.has(id)) {
          await agendarRecordatorio(r.id, r.titulo, r.fecha, r.hora);
        }
      }
    };
    init();

    if (Notifications) {
      const subscription = Notifications.addNotificationReceivedListener(n => {
        if (Platform.OS !== 'web') vibrarAlarma();
        const identifier = n.request.identifier || '';
        const match = identifier.match(/^REMINDER-(\d+)$/);
        const titulo = n.request.content.body || 'Tienes un recordatorio';
        const id = match ? match[1] : null;
        showAlarm(id, titulo, id ? () => posponerRecordatorio(id) : null);
      });
      const responseListener = Notifications.addNotificationResponseReceivedListener(r => {
        const actionId = r.actionIdentifier;
        if (actionId === 'POSPONER') {
          const match = r.notification.request.identifier.match(/^REMINDER-(\d+)$/);
          if (match) posponerRecordatorio(match[1]);
        }
      });
      return () => {
        subscription.remove();
        responseListener.remove();
      };
    }
  }, []);

  useEffect(() => {
    const disparar = async (r, list) => {
      r.notificado = true;
      await AsyncStorage.setItem('@recordatorios', JSON.stringify(list));
      await mostrarNotif('Recordatorio', r.titulo);
      showAlarm(String(r.id), r.titulo, () => posponerRecordatorio(r.id));
    };

    timerRef.current = setInterval(async () => {
      try {
        const list = await leerRecordatorios();
        if (list.length === 0) return;
        const ahora = new Date();
        for (const r of list) {
          const fecha = parsearFecha(r.fecha, r.hora);
          const diff = ahora.getTime() - fecha.getTime();
          if (diff >= 0 && diff < 35000 && !r.notificado) {
            await disparar(r, list);
            break;
          }
        }
      } catch {}
    }, 10000);

    const subAppState = AppState.addEventListener('change', async (next) => {
      if (next === 'active') {
        try {
          const list = await leerRecordatorios();
          if (list.length === 0) return;
          const ahora = new Date();
          for (const r of list) {
            const fecha = parsearFecha(r.fecha, r.hora);
            const diff = ahora.getTime() - fecha.getTime();
            if (diff >= 0 && diff < 120000 && !r.notificado) {
              await disparar(r, list);
              break;
            }
          }
        } catch {}
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      subAppState.remove();
    };
  }, []);

  return null;
};

export default NotificationHandler;
export { CHANNEL_ID, agendarRecordatorio, mostrarNotif, vibrarAlarma, permisos, crearCanal, posponerRecordatorio };
