import { useEffect, useState } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { getToken } from "../../src/lib/secureStore";
import apiClient from "../../src/lib/apiClient";
import { House, BookOpen, Bell, User } from "lucide-react-native";
import { useCSSVariable } from "../../src/tw";
import { authenticateIfBiometricEnabled } from "../../src/lib/biometricAuth";

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const card = useCSSVariable("--color-card");
  const border = useCSSVariable("--color-border");
  const primary = useCSSVariable("--color-primary");
  const muted = useCSSVariable("--color-muted-foreground");

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

        const unlocked = await authenticateIfBiometricEnabled();
        if (!unlocked) {
          router.replace("/login");
          return;
        }

        const me: any = await apiClient.get("/auth/me");
        const role = String(me.data?.role || me.data?.user?.role || "").toUpperCase();
        if (role && role !== "STUDENT") {
          router.replace("/unsupported-role");
          return;
        }

        setIsAuthChecked(true);
      } catch {
        router.replace("/login");
      }
    }
    checkAuth();
  }, [router, segments]);

  if (!isAuthChecked) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: card,
          borderTopColor: border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
