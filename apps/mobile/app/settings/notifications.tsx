import React from "react";
import { useNotificationPreferences, useUserProfile } from "@aitutor/shared";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button } from "../../src/components/ui";
import { Text, View } from "../../src/tw";

export default function NotificationSettingsScreen() {
  const { data: profile } = useUserProfile();
  const userId =
    typeof profile?.userId === "number"
      ? profile.userId
      : typeof profile?.id === "number"
        ? profile.id
        : undefined;
  const { data: preferences } = useNotificationPreferences(userId);

  return (
    <SettingsScreen title="Notifications" subtitle="Choose how VCE Tutor reaches you">
      <View className="gap-4 rounded-3xl border border-border bg-card p-5">
        <Text className="text-lg font-bold text-foreground">Current Preferences</Text>
        <Text className="text-sm text-muted-foreground">Email: {preferences?.email ? "On" : "Off"}</Text>
        <Text className="text-sm text-muted-foreground">SMS: {preferences?.sms ? "On" : "Off"}</Text>
        <Text className="text-sm text-muted-foreground">Marketing: {preferences?.marketing ? "On" : "Off"}</Text>
        <Button label="Update preferences" disabled />
      </View>
    </SettingsScreen>
  );
}
