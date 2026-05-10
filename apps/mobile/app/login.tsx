import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, Pressable, useCSSVariable } from "../src/tw";
import apiClient from "../src/lib/apiClient";
import { saveToken } from "../src/lib/secureStore";

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
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      });

      const { access_token } = response.data;
      if (access_token) {
        await saveToken(access_token);
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

  const placeholderColor = useCSSVariable("--color-muted-foreground");

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <View className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-sm border border-border">
        <Text className="text-3xl font-bold text-foreground mb-2">Welcome Back</Text>
        <Text className="text-muted-foreground mb-8">Sign in to continue your learning</Text>

        {error && (
          <View className="bg-destructive/10 p-4 rounded-xl mb-6 border border-destructive/20">
            <Text className="text-destructive text-sm">{error}</Text>
          </View>
        )}

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-2 ml-1">Email</Text>
            <TextInput
              className="w-full bg-muted border border-border px-4 py-4 rounded-xl text-foreground"
              placeholder="name@example.com"
              placeholderTextColor={placeholderColor}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-muted-foreground mb-2 mt-4 ml-1">Password</Text>
            <TextInput
              className="w-full bg-muted border border-border px-4 py-4 rounded-xl text-foreground"
              placeholder="••••••••"
              value={password}
              placeholderTextColor={placeholderColor}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full py-4 rounded-xl mt-8 ${
              isLoading ? "bg-primary opacity-50" : "bg-primary active:opacity-80"
            }`}
          >
            <Text className="text-primary-foreground font-semibold text-center text-lg">
              {isLoading ? "Signing in..." : "Login"}
            </Text>
          </Pressable>

          {/* Development Bypass Button - Simplified for testing */}
          <Pressable
            onPress={async () => {
              console.log("Bypass clicked");
              try {
                await saveToken("mock-dev-token");
                console.log("Token saved, redirecting...");
                router.replace("/");
              } catch (e) {
                console.error("Bypass failed:", e);
                setError("Bypass failed. Check console.");
              }
            }}
            className="w-full py-3 rounded-xl mt-4 border border-border bg-muted/50 active:bg-muted"
          >
            <Text className="text-muted-foreground font-medium text-center">
              Dev: Bypass Login (Mock)
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
