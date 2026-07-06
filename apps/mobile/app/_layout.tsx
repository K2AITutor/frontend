import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/lib/queryClient";
import { Stack, useRouter } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { FetcherProvider } from "@aitutor/shared";
import { AppErrorBoundary } from "../src/components/AppErrorBoundary";
import { ThemeProvider } from "../src/lib/ThemeProvider";
import { FeatureFlagProvider } from "../src/lib/featureFlags";
import { mobileFetcher, setUnauthorizedHandler } from "../src/lib/apiClient";
import { initObservability } from "../src/lib/observability";
import { requestTrackingConsentIfNeeded } from "../src/lib/privacy";
import "../src/global.css";

SplashScreen.preventAutoHideAsync();
initObservability();

const GestureRoot = GestureHandlerRootView as React.ComponentType<{
  children: React.ReactNode;
  style?: { flex: number };
}>;

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded, fontError] = useFonts({
    "DM Sans": require("../assets/fonts/DMSans.ttf"),
    "Instrument Serif": require("../assets/fonts/InstrumentSerif-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  useEffect(() => {
    setUnauthorizedHandler(() => router.replace("/login"));
    requestTrackingConsentIfNeeded().catch(() => undefined);
    return () => setUnauthorizedHandler(null);
  }, [router]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureRoot style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FetcherProvider fetcher={mobileFetcher}>
            <QueryClientProvider client={queryClient}>
              <FeatureFlagProvider>
                <BottomSheetModalProvider>
                  <AppErrorBoundary>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="login" />
                      <Stack.Screen name="register" />
                      <Stack.Screen name="forgot-password" />
                      <Stack.Screen name="subscription" />
                      <Stack.Screen name="unsupported-role" />
                    </Stack>
                  </AppErrorBoundary>
                </BottomSheetModalProvider>
              </FeatureFlagProvider>
            </QueryClientProvider>
          </FetcherProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureRoot>
  );
}
