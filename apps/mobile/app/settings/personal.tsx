import React from "react";
import { useUserProfile } from "@aitutor/shared";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button, Input, Label } from "../../src/components/ui";
import { Text, View } from "../../src/tw";

export default function PersonalSettingsScreen() {
  const { data } = useUserProfile();
  const profile = (data?.profile && typeof data.profile === "object" ? data.profile : data) as any;

  return (
    <SettingsScreen title="Personal Information" subtitle="Manage your student profile">
      <View className="gap-4 rounded-3xl border border-border bg-card p-5">
        <View>
          <Label>Name</Label>
          <Input value={profile?.name || [profile?.firstName, profile?.lastName].filter(Boolean).join(" ")} editable={false} />
        </View>
        <View>
          <Label>Email</Label>
          <Input value={profile?.email || data?.email || ""} editable={false} />
        </View>
        <View>
          <Label>Year level</Label>
          <Input value={profile?.grade || profile?.yearLevel || "VCE Student"} editable={false} />
        </View>
        <Text className="text-xs text-muted-foreground">
          Editing personal details will be enabled once the backend profile update endpoint is available.
        </Text>
        <Button label="Save changes" disabled />
      </View>
    </SettingsScreen>
  );
}
