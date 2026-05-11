import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/lib/queryClient";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import "../src/global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Text style={{ position: 'absolute', top: 0, left: 0, zIndex: 999, color: 'red' }}>Layout Rendered</Text>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
