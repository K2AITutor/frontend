import React, { useState } from "react";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform } from "react-native";
import { PATH, type LoginResponse } from "@aitutor/shared";
import { Screen } from "../src/components/Screen";
import { Button, Input, Label } from "../src/components/ui";
import apiClient from "../src/lib/apiClient";
import { saveTokens } from "../src/lib/secureStore";
import { ScrollView, Text, View } from "../src/tw";

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [yearLevel, setYearLevel] = useState("Year 12");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!firstName || !lastName || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await apiClient.post<LoginResponse>(PATH.auth.signup, {
        firstName,
        lastName,
        email,
        password,
        yearLevel,
      });

      if (response.data.access_token) {
        await saveTokens(response.data.access_token, response.data.refresh_token);
        router.replace("/");
      } else {
        router.replace("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not create your account.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center items-center p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
            <Text className="mb-2 text-3xl font-bold text-foreground">Create Account</Text>
            <Text className="mb-8 text-muted-foreground">Start your VCE learning plan.</Text>

            {error && (
              <View className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                <Text className="text-sm text-destructive">{error}</Text>
              </View>
            )}

            <View className="w-full gap-4">
              <View>
                <Label>First name</Label>
                <Input value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
              </View>
              <View>
                <Label>Last name</Label>
                <Input value={lastName} onChangeText={setLastName} autoCapitalize="words" />
              </View>
              <View>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View>
                <Label>Password</Label>
                <Input value={password} onChangeText={setPassword} secureTextEntry />
              </View>
              <View>
                <Label>Year level</Label>
                <Input value={yearLevel} onChangeText={setYearLevel} />
              </View>

              <Button label="Create account" loading={isLoading} onPress={handleRegister} className="mt-2" />
              <Button
                variant="ghost"
                label="I already have an account"
                onPress={() => router.replace("/login")}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
