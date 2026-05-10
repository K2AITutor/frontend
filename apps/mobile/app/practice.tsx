import React from "react";
import { View, Text, ScrollView, Pressable } from "../src/tw";
import { useRouter } from "expo-router";
import { ChevronLeft, BookOpen, Clock, Trophy } from "lucide-react-native";

export default function PracticeScreen() {
  const router = useRouter();

  const topics = [
    { id: "1", name: "Functions & Graphs", progress: 72, icon: BookOpen },
    { id: "2", name: "Algebra", progress: 45, icon: Clock },
    { id: "3", name: "Calculus", progress: 12, icon: Trophy },
  ];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-6 px-6 bg-card border-b border-border flex-row items-center">
        <Pressable onPress={() => router.back()} className="mr-4">
          <ChevronLeft size={24} color="#14b8a6" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Practice Hub</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <Text className="text-muted-foreground mb-6">
          Choose a topic to start your AI-powered practice session.
        </Text>

        <View className="space-y-4">
          {topics.map((topic) => (
            <View 
              key={topic.id}
              className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-4"
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center mr-3">
                    <topic.icon size={20} color="#14b8a6" />
                  </View>
                  <Text className="text-lg font-semibold text-foreground">{topic.name}</Text>
                </View>
                <Text className="text-primary font-bold">{topic.progress}%</Text>
              </View>

              <View className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
                <View 
                  className="h-full bg-primary" 
                  style={{ width: `${topic.progress}%` }}
                />
              </View>

              <Pressable 
                className="w-full bg-primary py-3 rounded-xl active:opacity-80"
                onPress={() => console.log(`Starting topic ${topic.name}`)}
              >
                <Text className="text-primary-foreground font-semibold text-center">
                  Continue Learning
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
