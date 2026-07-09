import { Alert, Platform, ToastAndroid } from "react-native";

type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
}

export function showToast({ title, message }: ToastOptions) {
  const text = message ? `${title}: ${message}` : title;

  if (Platform.OS === "android") {
    ToastAndroid.show(text, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(title, message);
}
