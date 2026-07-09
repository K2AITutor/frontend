import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, BookOpen } from "lucide-react-native";
import { useTopicCatalogue } from "@aitutor/shared";
import { Screen, ScreenHeader } from "../../../src/components/Screen";
import { Pressable, ScrollView, Text, useCSSVariable, View } from "../../../src/tw";

export default function SubjectPracticeScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const primary = useCSSVariable("--color-primary");
  const { data, isLoading, isError } = useTopicCatalogue(subject);

  return (
    <Screen>
      <ScreenHeader
        title={data?.subjectCode || "Practice Topics"}
        subtitle="Pick a topic to start a focused session"
        leftIcon={ChevronLeft}
        onLeftPress={() => router.back()}
      />
      <ScrollView className="flex-1 p-6">
        {isLoading && <Text className="text-muted-foreground">Loading topics...</Text>}
        {isError && (
          <Text className="text-destructive">We could not load topics for this subject.</Text>
        )}

        {data?.groups.map((group) => (
          <View key={group.strandCode} className="mb-8">
            <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {group.strandName}
            </Text>
            <View className="gap-3">
              {group.topics.map((topic) => (
                <Pressable
                  key={topic.topicCode}
                  className="rounded-3xl border border-border bg-card p-5 active:opacity-80"
                  onPress={() => router.push(`/practice/${subject}/${topic.topicCode}/start`)}
                >
                  <View className="flex-row items-center">
                    <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <BookOpen size={22} color={primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground">{topic.name}</Text>
                      <Text className="mt-1 text-xs text-muted-foreground">
                        {topic.questionCount ?? 0} questions available
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
