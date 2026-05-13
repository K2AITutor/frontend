import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Screen, ScreenHeader } from "../../../src/components/Screen";
import { Badge, Button } from "../../../src/components/ui";
import apiClient from "../../../src/lib/apiClient";
import { Pressable, ScrollView, Text, View } from "../../../src/tw";

type ReviewItem = {
  id: string | number;
  questionNumber?: string;
  prompt?: string;
  studentAnswer?: string;
  modelAnswer?: string;
  feedback?: string;
  correct?: boolean;
  flagged?: boolean;
  score?: number;
  maxScore?: number;
};

export default function ExamReviewScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "incorrect" | "flagged">("all");

  useEffect(() => {
    apiClient
      .get(`/attempts/${attemptId}/review`)
      .then((response) => setItems(response.data.questions || response.data || []))
      .catch(() => setItems([]));
  }, [attemptId]);

  const filteredItems = items.filter((item) => {
    if (filter === "incorrect") return item.correct === false;
    if (filter === "flagged") return item.flagged;
    return true;
  });

  return (
    <Screen>
      <ScreenHeader
        title="Exam Review"
        subtitle={`${filteredItems.length} questions`}
        leftIcon={ChevronLeft}
        onLeftPress={() => router.back()}
      />
      <ScrollView className="flex-1 p-6">
        <View className="mb-5 flex-row gap-2">
          <Button label="All" size="sm" variant={filter === "all" ? "default" : "outline"} onPress={() => setFilter("all")} />
          <Button label="Incorrect" size="sm" variant={filter === "incorrect" ? "default" : "outline"} onPress={() => setFilter("incorrect")} />
          <Button label="Flagged" size="sm" variant={filter === "flagged" ? "default" : "outline"} onPress={() => setFilter("flagged")} />
        </View>

        {filteredItems.map((item, index) => {
          const id = String(item.id);
          const isExpanded = expanded === id;

          return (
            <Pressable
              key={id}
              onPress={() => setExpanded(isExpanded ? null : id)}
              className="mb-4 rounded-3xl border border-border bg-card p-5"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-lg font-bold text-foreground">
                    Question {item.questionNumber || index + 1}
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={2}>
                    {item.prompt || "Tap to review answer details"}
                  </Text>
                </View>
                <Badge
                  variant={item.correct ? "success" : "destructive"}
                  label={
                    item.score != null
                      ? `${item.score}/${item.maxScore ?? "?"}`
                      : item.correct
                        ? "Correct"
                        : "Review"
                  }
                />
              </View>

              {isExpanded && (
                <View className="mt-5 gap-4 border-t border-border pt-4">
                  <View>
                    <Text className="mb-1 text-xs font-bold uppercase text-muted-foreground">Your answer</Text>
                    <Text className="text-sm text-foreground">{item.studentAnswer || "No answer recorded"}</Text>
                  </View>
                  <View>
                    <Text className="mb-1 text-xs font-bold uppercase text-muted-foreground">Model answer</Text>
                    <Text className="text-sm text-foreground">{item.modelAnswer || "Not available"}</Text>
                  </View>
                  <View>
                    <Text className="mb-1 text-xs font-bold uppercase text-muted-foreground">AI feedback</Text>
                    <Text className="text-sm text-muted-foreground">{item.feedback || "No feedback yet."}</Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
