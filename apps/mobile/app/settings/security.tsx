import React, { useEffect, useState } from "react";
import { SettingsScreen } from "../../src/components/SettingsScreen";
import { Button, Input, Label } from "../../src/components/ui";
import apiClient from "../../src/lib/apiClient";
import {
  isBiometricUnlockEnabled,
  setBiometricUnlockEnabled,
} from "../../src/lib/biometricAuth";
import { PATH } from "@aitutor/shared";
import { Text, View } from "../../src/tw";
import { FeatureGate } from "../../src/components/FeatureGate";

export default function SecuritySettingsScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    isBiometricUnlockEnabled().then(setBiometricEnabled);
  }, []);

  async function toggleBiometric() {
    const next = !biometricEnabled;
    await setBiometricUnlockEnabled(next);
    setBiometricEnabled(next);
  }

  async function changePassword() {
    await apiClient.post(PATH.auth.changePassword, { currentPassword, newPassword });
    setMessage("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <SettingsScreen title="Security" subtitle="Password and biometric unlock">
      <FeatureGate flag="biometric-unlock">
        <View className="mb-6 rounded-3xl border border-border bg-card p-5">
          <Text className="mb-2 text-lg font-bold text-foreground">Biometric Unlock</Text>
          <Text className="mb-4 text-sm text-muted-foreground">
            Use Face ID, Touch ID, or Android biometrics after opening the app.
          </Text>
          <Button
            label={biometricEnabled ? "Disable biometric unlock" : "Enable biometric unlock"}
            variant={biometricEnabled ? "outline" : "default"}
            onPress={toggleBiometric}
          />
        </View>
      </FeatureGate>

      <View className="gap-4 rounded-3xl border border-border bg-card p-5">
        <Text className="text-lg font-bold text-foreground">Change Password</Text>
        {message && <Text className="text-sm text-primary">{message}</Text>}
        <View>
          <Label>Current password</Label>
          <Input value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        </View>
        <View>
          <Label>New password</Label>
          <Input value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        </View>
        <Button label="Update password" onPress={changePassword} disabled={!currentPassword || !newPassword} />
      </View>
    </SettingsScreen>
  );
}
