import React from "react";
import Constants from "expo-constants";
import { Linking } from "react-native";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button } from "../../src/components/ui";
import { Text, View } from "../../src/tw";

export default function AboutSettingsScreen() {
  return (
    <SettingsScreen title="About" subtitle="App version and support">
      <View className="gap-4 rounded-3xl border border-border bg-card p-5">
        <Text className="text-lg font-bold text-foreground">VCE Tutor</Text>
        <Text className="text-sm text-muted-foreground">
          Version {Constants.expoConfig?.version || "1.0.0"}
        </Text>
        <Button label="Support" onPress={() => Linking.openURL("mailto:support@vcetutor.app")} />
        <Button
          label="Privacy Policy"
          variant="outline"
          onPress={() => Linking.openURL("https://vcetutor.app/privacy")}
        />
      </View>
    </SettingsScreen>
  );
}
