import React, { useState } from "react";
import { useRouter } from "expo-router";
import { PATH } from "@aitutor/shared";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button, Input, Label } from "../../src/components/ui";
import apiClient from "../../src/lib/apiClient";
import { clearToken } from "../../src/lib/secureStore";
import { Text, View } from "../../src/tw";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteAccount() {
    if (confirmation !== "DELETE") {
      setError("Type DELETE to confirm.");
      return;
    }

    setError(null);
    setIsDeleting(true);
    try {
      await apiClient.delete(PATH.auth.me);
      await clearToken();
      router.replace("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not delete your account.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <SettingsScreen title="Delete Account" subtitle="Permanently remove your VCE Tutor account">
      <View className="gap-4 rounded-3xl border border-destructive/30 bg-card p-5">
        <Text className="text-lg font-bold text-destructive">This cannot be undone</Text>
        <Text className="text-sm text-muted-foreground">
          Your account, profile, progress, and saved learning data will be scheduled for deletion.
        </Text>
        {error && <Text className="text-sm text-destructive">{error}</Text>}
        <View>
          <Label>Type DELETE to confirm</Label>
          <Input value={confirmation} onChangeText={setConfirmation} autoCapitalize="characters" />
        </View>
        <Button
          label="Delete my account"
          variant="destructive"
          loading={isDeleting}
          onPress={deleteAccount}
        />
      </View>
    </SettingsScreen>
  );
}
