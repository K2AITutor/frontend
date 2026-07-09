import React from "react";
import { Linking } from "react-native";
import { Screen } from "../src/components/Screen";
import { Button } from "../src/components/ui";
import { clearToken } from "../src/lib/secureStore";
import { Text, View } from "../src/tw";
import { useRouter } from "expo-router";

export default function UnsupportedRoleScreen() {
  const router = useRouter();

  async function handleLogout() {
    await clearToken();
    router.replace("/login");
  }

  return (
    <Screen className="justify-center p-6">
      <View className="rounded-2xl border border-border bg-card p-8">
        <Text className="mb-3 text-3xl font-bold text-foreground">Use the Web App</Text>
        <Text className="mb-8 text-muted-foreground">
          The mobile app is currently built for student learning. Contributor and admin accounts
          should use the web dashboard.
        </Text>
        <View className="gap-3">
          <Button label="Open Web Dashboard" onPress={() => Linking.openURL("https://vcetutor.app")} />
          <Button variant="outline" label="Log out" onPress={handleLogout} />
        </View>
      </View>
    </Screen>
  );
}
