import React from "react";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button } from "../../src/components/ui";
import { useThemePreference } from "../../src/lib/ThemeProvider";
import { Text, View } from "../../src/tw";

export default function AppearanceSettingsScreen() {
  const { colorScheme, preference, setPreference } = useThemePreference();

  return (
    <SettingsScreen title="Appearance" subtitle={`Currently using ${colorScheme} mode`}>
      <View className="gap-3 rounded-3xl border border-border bg-card p-5">
        <Text className="mb-2 text-lg font-bold text-foreground">Theme</Text>
        <Button
          label="Use system setting"
          variant={preference === "system" ? "default" : "outline"}
          onPress={() => setPreference("system")}
        />
        <Button
          label="Light mode"
          variant={preference === "light" ? "default" : "outline"}
          onPress={() => setPreference("light")}
        />
        <Button
          label="Dark mode"
          variant={preference === "dark" ? "default" : "outline"}
          onPress={() => setPreference("dark")}
        />
      </View>
    </SettingsScreen>
  );
}
