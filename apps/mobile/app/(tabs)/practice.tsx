import React from "react";
import { View, Text, ScrollView, Pressable } from "../../src/tw";
import { useRouter } from "expo-router";
import { BookOpen, Clock, Trophy, Brain } from "lucide-react-native";

export default function PracticeScreen() {
  const router = useRouter();

  const topics = [
    { id: "1", name: "Functions & Graphs", progress: 72, icon: BookOpen, questions: 45 },
    { id: "2", name: "Algebra", progress: 45, icon: Brain, questions: 38 },
    { id: "3", name: "Calculus", progress: 12, icon: Clock, questions: 52 },
    { id: "4", name: "Probability & Statistics", progress: 85, icon: Trophy, questions: 30 },
  ];

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Practice</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Choose a topic to start your AI-powered practice session
        </Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="flex-row flex-wrap gap-3 mb-8">
          {topics.map((topic) => (
            <View
              key={topic.id}
              className="bg-card p-5 rounded-3xl border border-border w-full"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                    <topic.icon size={24} color="#14b8a6" />
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-foreground">
                      {topic.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {topic.questions} questions
                    </Text>
                  </View>
                </View>
                <Text className="text-primary font-bold text-lg">{topic.progress}%</Text>
              </View>

              <View className="h-2.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${topic.progress}%` }}
                />
              </View>

              <Pressable
                className="w-full bg-primary py-3.5 rounded-2xl active:opacity-80"
                onPress={() => console.log(`Starting topic: ${topic.name}`)}
              >
                <Text className="text-primary-foreground font-semibold text-center">
                  {topic.progress > 0 ? "Continue Learning" : "Start Practice"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
