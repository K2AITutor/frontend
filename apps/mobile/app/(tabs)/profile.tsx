import React from "react";
import { View, Text, Pressable, ScrollView, useCSSVariable } from "../../src/tw";
import { useRouter } from "expo-router";
import { User, Lock, Palette, Bell, CreditCard, LogOut, Flag } from "lucide-react-native";
import { clearToken } from "../../src/lib/secureStore";
import { resetSessionAuth } from "../../src/lib/biometricAuth";
import { SettingsLink } from "../../src/components/SettingsLink";
import { FeatureGate } from "../../src/components/FeatureGate";
import { useUserProfile } from "@aitutor/shared";
import { Screen, ScreenHeader } from "../../src/components/Screen";
import { posthog } from "../../src/lib/observability";

export default function ProfileScreen() {
  const router = useRouter();
  const destructive = useCSSVariable("--color-destructive");
  const { data, isLoading } = useUserProfile();
  const profile = (data?.profile && typeof data.profile === "object" ? data.profile : data) as
    | {
        name?: string;
        email?: string;
        grade?: string;
        yearLevel?: string;
        firstName?: string;
        lastName?: string;
      }
    | undefined;
  const name =
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
    data?.email ||
    "Student";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);

  const handleLogout = async () => {
    resetSessionAuth();
    await clearToken();
    try {
      posthog.reset();
    } catch {
      // observability disabled — nothing to reset
    }
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Profile" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Profile" />

      <ScrollView className="flex-1">
        <View className="p-6 items-center border-b border-border bg-card/30">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-4 border-2 border-primary/30">
            <Text className="text-3xl font-bold text-primary">
              {initials}
            </Text>
          </View>
          <Text className="text-xl font-bold text-foreground">{name}</Text>
          <Text className="text-sm text-muted-foreground">{profile?.email || data?.email}</Text>
          <View className="flex-row mt-3 bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-primary text-xs font-bold">
              {profile?.grade || profile?.yearLevel || "VCE Student"}
            </Text>
          </View>
        </View>

        <View className="p-6 space-y-2">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 ml-1">Account</Text>

          <SettingsLink
            icon={User}
            label="Personal Information"
            onPress={() => router.push("/settings/personal")}
          />
          <SettingsLink
            icon={Lock}
            label="Security & Password"
            onPress={() => router.push("/settings/security")}
          />
          <FeatureGate flag="subscriptions">
            <SettingsLink
              icon={CreditCard}
              label="Subscription Plan"
              onPress={() => router.push("/settings/subscription")}
            />
          </FeatureGate>

          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-2 ml-1">Preferences</Text>

          <FeatureGate flag="appearance-dark-mode">
            <SettingsLink
              icon={Palette}
              label="Appearance"
              sublabel="Dark Mode"
              onPress={() => router.push("/settings/appearance")}
            />
          </FeatureGate>
          <FeatureGate flag="push-notifications">
            <SettingsLink
              icon={Bell}
              label="Notifications"
              onPress={() => router.push("/settings/notifications")}
            />
          </FeatureGate>
          <SettingsLink
            icon={User}
            label="About VCE Tutor"
            onPress={() => router.push("/settings/about")}
          />
          <FeatureGate flag="account-deletion">
            <SettingsLink
              icon={LogOut}
              label="Delete Account"
              sublabel="Permanently remove your account"
              onPress={() => router.push("/settings/delete-account")}
            />
          </FeatureGate>

          {__DEV__ && (
            <SettingsLink
              icon={Flag}
              label="Feature Flags"
              sublabel="Developer overrides"
              onPress={() => router.push("/settings/feature-flags")}
            />
          )}

          <View className="h-4" />

          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-destructive/10 py-4 rounded-2xl border border-destructive/20 active:bg-destructive/20"
          >
            <LogOut size={18} color={destructive} />
            <Text className="ml-2 text-destructive font-bold">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
