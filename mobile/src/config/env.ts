import { Platform } from 'react-native';

/**
 * Set `EXPO_PUBLIC_BFF_URL` (e.g. in `.env` loaded by Expo) to override.
 * Android emulator uses host loopback `10.0.2.2` instead of `localhost`.
 */
const DEFAULT_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000';

export function getBffBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_BFF_URL;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, '');
  }
  return DEFAULT_HOST;
}
