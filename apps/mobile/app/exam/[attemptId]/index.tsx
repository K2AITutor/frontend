import React, { useEffect, useMemo, useState } from "react";
import { Alert, Vibration } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { MathView } from "../../../src/components/math/MathView";
import { Screen, ScreenHeader } from "../../../src/components/Screen";
import { Badge, Button, Input } from "../../../src/components/ui";
import apiClient from "../../../src/lib/apiClient";
import { loadExamAnswers, saveExamAnswer } from "../../../src/lib/examCache";
import { Pressable, ScrollView, Text, View } from "../../../src/tw";

type ExamQuestion = {
  id: string | number;
  questionNumber?: string;
  prompt?: string;
  questionText?: string;
  marks?: number;
};

export default function ExamAttemptScreen() {
  const router = useRouter();
  const { attemptId } = useLocalSearchParams<{ attemptId: string }>();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(60 * 60);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    let mounted = true;

    async function loadAttempt() {
      const cached = await loadExamAnswers(attemptId);
      if (mounted) setAnswers(cached);

      const response = await apiClient.get(`/attempts/${attemptId}`);
      if (mounted) {
        setQuestions(response.data.questions || []);
        setSecondsRemaining(response.data.secondsRemaining || 60 * 60);
      }
    }

    loadAttempt().catch(() => {
      if (mounted) setQuestions([]);
    });

    return () => {
      mounted = false;
    };
  }, [attemptId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const autosave = setInterval(() => {
      apiClient.post(`/attempts/${attemptId}/autosave`, { answers }).catch(() => undefined);
    }, 15_000);

    return () => clearInterval(autosave);
  }, [answers, attemptId]);

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }, [secondsRemaining]);

  function updateAnswer(answer: string) {
    if (!currentQuestion) return;
    const questionId = String(currentQuestion.id);
    setAnswers((value) => ({ ...value, [questionId]: answer }));
    saveExamAnswer(attemptId, questionId, answer).catch(() => undefined);
  }

  function submitExam() {
    Vibration.vibrate(10);
    Alert.alert("Submit exam?", "You will not be able to edit answers after submission.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        style: "destructive",
        onPress: async () => {
          await apiClient.post(`/attempts/${attemptId}/submit`, { answers });
          router.replace(`/exam/${attemptId}/review`);
        },
      },
    ]);
  }

  return (
    <Screen>
      <ScreenHeader
        title="Exam"
        subtitle={`Time remaining ${timerLabel}`}
        leftIcon={ChevronLeft}
        onLeftPress={() => router.back()}
        rightContent={<Badge label={`${currentIndex + 1}/${Math.max(questions.length, 1)}`} />}
      />
      <ScrollView className="flex-1 p-6">
        <View className="mb-4 flex-row flex-wrap gap-2">
          {questions.map((question, index) => (
            <Pressable
              key={question.id}
              onPress={() => setCurrentIndex(index)}
              className={`h-10 w-10 items-center justify-center rounded-xl ${
                index === currentIndex ? "bg-primary" : "bg-muted"
              }`}
            >
              <Text className={index === currentIndex ? "text-primary-foreground" : "text-foreground"}>
                {index + 1}
              </Text>
            </Pressable>
          ))}
        </View>

        {currentQuestion ? (
          <View className="gap-5">
            <View className="rounded-3xl border border-border bg-card p-5">
              <MathView value={currentQuestion.questionText || currentQuestion.prompt || ""} />
            </View>
            <Input
              value={answers[String(currentQuestion.id)] || ""}
              onChangeText={updateAnswer}
              multiline
              placeholder="Write your answer"
              className="min-h-36"
            />
            <Button label="Submit Exam" variant="destructive" onPress={submitExam} />
          </View>
        ) : (
          <Text className="text-muted-foreground">Loading exam...</Text>
        )}
      </ScrollView>
    </Screen>
  );
}
