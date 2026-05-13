import React from "react";
import { View, Text, ScrollView, Pressable, useCSSVariable } from "../../src/tw";
import { useRouter } from "expo-router";
import { BookOpen, Clock, Trophy, Brain } from "lucide-react-native";
import { Screen, ScreenHeader } from "../../src/components/Screen";
import { useSubjects } from "@aitutor/shared";

export default function PracticeScreen() {
  const router = useRouter();
  const primary = useCSSVariable("--color-primary");
  const { data: subjects = [], isLoading, isError } = useSubjects();
  const fallbackIcons = [BookOpen, Brain, Clock, Trophy];

  return (
    <Screen>
      <ScreenHeader
        title="Practice"
        subtitle="Choose a topic to start your AI-powered practice session"
      />

      <ScrollView className="flex-1 p-6">
        {isLoading && (
          <Text className="mb-4 text-sm text-muted-foreground">Loading subjects...</Text>
        )}
        {isError && (
          <Text className="mb-4 text-sm text-destructive">
            We could not load subjects. Pull to refresh will be added in the next phase.
          </Text>
        )}
        <View className="flex-row flex-wrap gap-3 mb-8">
          {subjects.map((subject, index) => {
            const Icon = fallbackIcons[index % fallbackIcons.length];

            return (
            <View
              key={subject.id}
              className="bg-card p-5 rounded-3xl border border-border w-full"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                    <Icon size={24} color={primary} />
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-foreground">
                      {subject.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {subject.description || "Start a tailored practice session"}
                    </Text>
                  </View>
                </View>
                <Text className="text-primary font-bold text-lg">New</Text>
              </View>

              <View className="h-2.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: "0%" }}
                />
              </View>

              <Pressable
                className="w-full bg-primary py-3.5 rounded-2xl active:opacity-80"
                onPress={() => router.push(`/practice/${subject.id}`)}
              >
                <Text className="text-primary-foreground font-semibold text-center">
                  Start Practice
                </Text>
              </Pressable>
            </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
