import React, { useState } from "react";
import { Vibration } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lightbulb } from "lucide-react-native";
import {
  useAiHint,
  usePracticeQuestion,
  useSubmitPracticeAnswer,
} from "@aitutor/shared";
import { MathView } from "../../../src/components/math/MathView";
import { NativeSheet } from "../../../src/components/NativeSheet";
import { Screen, ScreenHeader } from "../../../src/components/Screen";
import { Badge, Button, Input } from "../../../src/components/ui";
import { Pressable, ScrollView, Text, useCSSVariable, View } from "../../../src/tw";

export default function PracticeSessionScreen() {
  const router = useRouter();
  const primary = useCSSVariable("--color-primary");
  const { subject, topic, difficulty } = useLocalSearchParams<{
    sessionId: string;
    subject?: string;
    topic?: string;
    difficulty?: string;
  }>();
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const question = usePracticeQuestion({
    subject,
    topicCode: topic,
    difficulty,
  });
  const submitAnswer = useSubmitPracticeAnswer();
  const hint = useAiHint();
  const current = question.data as any;
  const options = Array.isArray(current?.options) ? (current.options as string[]) : [];
  const prompt = String(current?.questionText || current?.question || current?.prompt || "");

  function submit() {
    if (!current?.id) return;
    Vibration.vibrate(10);
    submitAnswer.mutate({
      questionId: current.id,
      answer: selectedOption || answer,
      subject,
      topicCode: topic,
    });
  }

  return (
    <Screen>
      <ScreenHeader
        title="Practice Session"
        subtitle={topic ? `Topic ${topic}` : "Adaptive practice"}
        leftIcon={ChevronLeft}
        onLeftPress={() => router.back()}
        rightContent={
          current?.marks ? <Badge label={`${current.marks} marks`} variant="outline" /> : null
        }
      />
      <ScrollView className="flex-1 p-6">
        {question.isLoading && <Text className="text-muted-foreground">Loading question...</Text>}
        {question.isError && (
          <Text className="text-destructive">We could not load the next question.</Text>
        )}

        {current && (
          <View className="gap-6">
            <View className="rounded-3xl border border-border bg-card p-5">
              <MathView value={prompt} />
            </View>

            {options.length > 0 ? (
              <View className="gap-3">
                {options.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setSelectedOption(option)}
                    className={`rounded-2xl border p-4 ${
                      selectedOption === option
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <Text className="text-foreground">{option}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Input
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your answer"
                multiline
                className="min-h-28"
              />
            )}

            <View className="flex-row gap-3">
              <Button
                className="flex-1"
                variant="outline"
                label="Hint"
                onPress={() =>
                  current?.id &&
                  hint.mutate(current.id, {
                    onSuccess: () => setHintOpen(true),
                  })
                }
              >
                <Lightbulb size={16} color={primary} />
              </Button>
              <Button
                className="flex-1"
                label="Submit"
                loading={submitAnswer.isPending}
                disabled={!selectedOption && !answer}
                onPress={() => {
                  submit();
                  setFeedbackOpen(true);
                }}
              />
            </View>
          </View>
        )}
      </ScrollView>
      <NativeSheet open={hintOpen && Boolean(hint.data?.hint)} title="Hint" onDismiss={() => setHintOpen(false)}>
        <Text className="text-sm leading-6 text-muted-foreground">{hint.data?.hint}</Text>
      </NativeSheet>
      <NativeSheet
        open={feedbackOpen && Boolean(submitAnswer.data)}
        title={submitAnswer.data?.correct ? "Correct" : "Review this one"}
        onDismiss={() => setFeedbackOpen(false)}
      >
        {submitAnswer.data?.explanation && (
          <Text className="text-sm leading-6 text-muted-foreground">
            {submitAnswer.data.explanation}
          </Text>
        )}
        {submitAnswer.data?.score != null && (
          <Text className="mt-4 text-sm font-bold text-primary">
            Score: {submitAnswer.data.score}/{submitAnswer.data.maxScore ?? current?.marks ?? "?"}
          </Text>
        )}
      </NativeSheet>
    </Screen>
  );
}
