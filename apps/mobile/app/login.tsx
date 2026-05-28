import React, { useState } from "react";
import { useRouter } from "expo-router";
import { type LoginResponse } from "@aitutor/shared";
import apiClient from "../src/lib/apiClient";
import { saveToken, saveTokens } from "../src/lib/secureStore";
import { Screen } from "../src/components/Screen";
import { registerForPushNotifications } from "../src/lib/pushNotifications";
import { Button, Input, Label } from "../src/components/ui";
import { Text, View } from "../src/tw";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<LoginResponse>("/auth/signin", {
        email,
        password,
      });

      const { access_token, refresh_token, role } = response.data;
      if (access_token) {
        if (role && String(role).toUpperCase() !== "STUDENT") {
          setError("The mobile app is currently for students. Please use the web app for this account.");
          return;
        }
        await saveTokens(access_token, refresh_token);
        registerForPushNotifications().catch(() => undefined);
        router.replace("/");
      } else {
        setError("Login failed. No token received.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const message = err.response?.data?.message || "An error occurred during login.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen className="items-center justify-center p-6">
      <View className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-sm border border-border">
        <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back</Text>
        <Text className="text-muted-foreground mb-8">Sign in to continue your learning</Text>

        {error && (
          <View className="bg-destructive/10 p-4 rounded-xl mb-6 border border-destructive/20">
            <Text className="text-destructive text-sm">{error}</Text>
          </View>
        )}

        <View className="gap-4">
          <View>
            <Label>Email</Label>
            <Input
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Label>Password</Label>
            <Input
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
          </View>

          <Button
            label={isLoading ? "Signing in..." : "Login"}
            onPress={handleLogin}
            loading={isLoading}
            className="mt-4"
          />

          <View className="mt-2 flex-row justify-between">
            <Button
              variant="link"
              size="sm"
              label="Forgot password?"
              onPress={() => router.push("/forgot-password")}
            />
            <Button
              variant="link"
              size="sm"
              label="Create account"
              onPress={() => router.push("/register")}
            />
          </View>

          {__DEV__ && (
            <Button
              variant="outline"
              className="mt-4"
              label="Dev: Bypass Login (Mock)"
              onPress={async () => {
                try {
                  await saveToken("mock-dev-token");
                  router.replace("/");
                } catch {
                  setError("Bypass failed. Check console.");
                }
              }}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
