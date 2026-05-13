import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

const NotificationHandler = () => {
  useEffect(() => {
    // Solicitar permisos de notificación
    const getPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("Estado de permisos:", status); // Para depurar el estado de los permisos
      if (status !== 'granted') {
        alert('Se necesitan permisos para mostrar notificaciones');
      }
    };

    getPermission();

    // Listener para recibir notificaciones cuando la app está en primer plano
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notificación recibida:", notification);
      Alert.alert("Notificación recibida", notification.request.content.body);
    });

    // Listener para manejar la respuesta de la notificación cuando se toca
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Respuesta de la notificación:", response);
      Alert.alert("Notificación tocada", response.notification.request.content.body);
    });

    // Limpiar los listeners cuando el componente se desmonte
    return () => {
      subscription.remove();
      responseListener.remove();
    };
  }, []);

  return null;
};

export default NotificationHandler;
