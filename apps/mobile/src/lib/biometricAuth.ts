import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_KEY = "biometric_unlock_enabled";

let sessionAuthenticated = false;

export function resetSessionAuth() {
  sessionAuthenticated = false;
}

export async function setBiometricUnlockEnabled(enabled: boolean) {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? "true" : "false");
}

export async function isBiometricUnlockEnabled() {
  return (await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)) === "true";
}

export async function authenticateIfBiometricEnabled() {
  if (sessionAuthenticated) return true;
  if (!(await isBiometricUnlockEnabled())) {
    sessionAuthenticated = true;
    return true;
  }

  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) {
    sessionAuthenticated = true;
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock VCE Tutor",
    cancelLabel: "Use password",
    disableDeviceFallback: false,
  });

  if (result.success) sessionAuthenticated = true;
  return result.success;
}
