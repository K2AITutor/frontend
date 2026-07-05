import * as SecureStore from 'expo-secure-store';

export async function saveToken(token: string) {
  await SecureStore.setItemAsync('access_token', token);
}

export async function saveTokens(accessToken: string, refreshToken?: string) {
  await SecureStore.setItemAsync('access_token', accessToken);
  if (refreshToken) {
    await SecureStore.setItemAsync('refresh_token', refreshToken);
  }
}

export async function getToken() {
  return await SecureStore.getItemAsync('access_token');
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync('refresh_token');
}

export async function clearToken() {
  await SecureStore.deleteItemAsync('access_token');
  await SecureStore.deleteItemAsync('refresh_token');
}
