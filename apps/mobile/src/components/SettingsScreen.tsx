import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Screen, ScreenHeader } from "./Screen";
import { ScrollView } from "../tw";

export function SettingsScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Screen>
      <ScreenHeader title={title} subtitle={subtitle} leftIcon={ChevronLeft} onLeftPress={() => router.back()} />
      <ScrollView className="flex-1 p-6">{children}</ScrollView>
    </Screen>
  );
}
