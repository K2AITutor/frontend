import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import apiClient from "./apiClient";

let Notifications: any = null;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (e) {
    console.warn("[Notifications] Push notification library is not supported in Expo Go. Skipping initialization.");
  }
} else {
  console.log("[Notifications] Running in Expo Go. Skipping native expo-notifications loading to avoid SDK warnings.");
}

export async function registerForPushNotifications() {
  if (!Notifications || !Device.isDevice) return null;

  try {
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
  } catch (error) {
    console.error("[Notifications] Failed to register push token:", error);
    return null;
  }
}

