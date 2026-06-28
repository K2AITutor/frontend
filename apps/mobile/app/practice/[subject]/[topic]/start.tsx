import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Clock, Target } from "lucide-react-native";
import { Screen, ScreenHeader } from "../../../../src/components/Screen";
import { Badge, Button, Tabs } from "../../../../src/components/ui";
import { Text, useCSSVariable, View } from "../../../../src/tw";

type Difficulty = "adaptive" | "easy" | "medium" | "hard";

export default function PracticeStartScreen() {
  const router = useRouter();
  const { subject, topic } = useLocalSearchParams<{ subject: string; topic: string }>();
  const [difficulty, setDifficulty] = useState<Difficulty>("adaptive");
  const primary = useCSSVariable("--color-primary");

  function startSession() {
    router.push({
      pathname: "/practice/session/[sessionId]",
      params: {
        sessionId: `${subject}-${topic}-${Date.now()}`,
        subject,
        topic,
        difficulty,
      },
    });
  }

  return (
    <Screen>
      <ScreenHeader
        title="Start Practice"
        subtitle={`${subject} • ${topic}`}
        leftIcon={ChevronLeft}
        onLeftPress={() => router.back()}
      />
      <View className="flex-1 p-6">
        <View className="rounded-3xl border border-border bg-card p-6">
          <Badge label="AI-guided session" variant="success" className="mb-4" />
          <Text className="mb-3 text-2xl font-bold text-foreground">Ready for a focused set?</Text>
          <Text className="mb-6 text-muted-foreground">
            You'll get one question at a time, instant feedback, hints, and a short summary of what
            to revise next.
          </Text>

          <View className="mb-6 gap-3">
            <View className="flex-row items-center rounded-2xl bg-muted/50 p-4">
              <Target size={20} color={primary} />
              <Text className="ml-3 text-sm text-foreground">5-10 adaptive questions</Text>
            </View>
            <View className="flex-row items-center rounded-2xl bg-muted/50 p-4">
              <Clock size={20} color={primary} />
              <Text className="ml-3 text-sm text-foreground">About 10 minutes</Text>
            </View>
          </View>

          <Text className="mb-3 text-sm font-bold text-foreground">Difficulty</Text>
          <Tabs<Difficulty>
            value={difficulty}
            onValueChange={setDifficulty}
            items={[
              { value: "adaptive", label: "Adaptive" },
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Med" },
              { value: "hard", label: "Hard" },
            ]}
            className="mb-8"
          />

          <Button label="Start session" onPress={startSession} />
        </View>
      </View>
    </Screen>
  );
}
