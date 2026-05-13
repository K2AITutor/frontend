import { Platform } from "react-native";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";

export async function requestTrackingConsentIfNeeded() {
  if (Platform.OS !== "ios") return "unavailable";

  const current = await getTrackingPermissionsAsync();
  if (current.status !== "undetermined") return current.status;

  const next = await requestTrackingPermissionsAsync();
  return next.status;
}
