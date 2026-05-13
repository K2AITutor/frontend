import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import apiClient from "./apiClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const existing = (await Notifications.getPermissionsAsync()) as any;
  const finalGranted =
    existing.granted ||
    existing.status === "granted" ||
    ((await Notifications.requestPermissionsAsync()) as any).granted ||
    ((await Notifications.getPermissionsAsync()) as any).status === "granted";

  if (!finalGranted) return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await apiClient.post("/notifications/devices", {
    token,
    platform: Platform.OS,
  });
  return token;
}
