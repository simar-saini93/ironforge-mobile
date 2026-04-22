import * as Notifications from 'expo-notifications';
import * as Device        from 'expo-device';
import Constants          from 'expo-constants';
import { Platform }       from 'react-native';
import { supabase }       from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
    shouldShowBanner: true,
    shouldShowList:   true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn('Push notifications: no projectId, skipping');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:       'default',
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#E8FF00',
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

export async function savePushToken(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({
    push_token:            token,
    push_token_updated_at: new Date().toISOString(),
  }).eq('id', user.id);
}
