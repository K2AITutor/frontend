import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "../../src/tw";
import { useRouter } from "expo-router";
import { User, Lock, Palette, Bell, CreditCard, LogOut } from "lucide-react-native";
import apiClient from "../../src/lib/apiClient";
import { clearToken } from "../../src/lib/secureStore";
import { SettingsLink } from "../../src/components/SettingsLink";
import type { StudentDashboardData } from "@aitutor/shared";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentDashboardData["profile"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiClient.get("/auth/me");
        setProfile(res.data.profile);
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await clearToken();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="pt-14 pb-6 px-6 bg-card border-b border-border">
          <View className="h-7 w-24 bg-muted rounded-full" />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-6 items-center border-b border-border bg-card/30">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-2 border-primary/30">
            <Text className="text-3xl font-bold text-primary">
              {profile?.name?.split(" ").map((n: string) => n[0]).join("")}
            </Text>
          </View>
          <Text className="text-xl font-bold text-foreground">{profile?.name}</Text>
          <Text className="text-sm text-muted-foreground">{profile?.email}</Text>
          <View className="flex-row mt-3 bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-bold">{profile?.grade}</Text>
          </View>
        </View>

        <View className="p-6 space-y-2">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Account</Text>

          <SettingsLink icon={User} label="Personal Information" />
          <SettingsLink icon={Lock} label="Security & Password" />
          <SettingsLink
            icon={CreditCard}
            label="Subscription Plan"
            onPress={() => router.push("/subscription")}
          />

          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-2 ml-1">Preferences</Text>

          <SettingsLink icon={Palette} label="Appearance" sublabel="Dark Mode" />
          <SettingsLink icon={Bell} label="Notifications" />

          <View className="h-4" />

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-destructive/10 py-4 rounded-2xl border border-destructive/20 active:bg-destructive/20"
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="ml-2 text-destructive font-bold">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
