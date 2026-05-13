import React, { useState } from "react";
import { useRouter } from "expo-router";
import { PATH } from "@aitutor/shared";
import { Screen } from "../src/components/Screen";
import { Button, Input, Label } from "../src/components/ui";
import apiClient from "../src/lib/apiClient";
import { Text, View } from "../src/tw";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email) {
      setError("Enter the email address for your account.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await apiClient.post(PATH.auth.forgotPassword, { email });
      setIsSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not send the reset email.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen className="justify-center p-6">
      <View className="rounded-2xl border border-border bg-card p-8">
        <Text className="mb-2 text-3xl font-bold text-foreground">Reset Password</Text>
        <Text className="mb-8 text-muted-foreground">
          {isSent ? "Check your inbox for reset instructions." : "We'll send password reset instructions."}
        </Text>

        {error && (
          <View className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <Text className="text-sm text-destructive">{error}</Text>
          </View>
        )}

        {!isSent && (
          <View className="mb-6">
            <Label>Email</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        )}

        <Button
          label={isSent ? "Back to login" : "Send reset email"}
          loading={isLoading}
          onPress={isSent ? () => router.replace("/login") : handleSubmit}
        />
      </View>
    </Screen>
  );
}
