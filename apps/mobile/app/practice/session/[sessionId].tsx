import React, { useState } from "react";
import { Vibration, Alert, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Lightbulb, Camera } from "lucide-react-native";
import {
  useAiHint,
  usePracticeQuestion,
  useSubmitPracticeAnswer,
  useGradePhotoAnswer,
} from "@aitutor/shared";
import * as ImagePicker from "expo-image-picker";
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

  const gradePhotoAnswer = useGradePhotoAnswer();
  const [photoData, setPhotoData] = useState<any>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const handlePhotoScan = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "We need camera and photo library access to scan math solutions. Please enable them in your device Settings."
      );
      return;
    }

    Alert.alert(
      "Scan Handwritten Solution",
      "Choose a source to scan your solution:",
      [
        {
          text: "Take Photo",
          onPress: () => launchImageSource("camera"),
        },
        {
          text: "Choose from Library",
          onPress: () => launchImageSource("gallery"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const launchImageSource = async (source: "camera" | "gallery") => {
    try {
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      };

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (result.canceled || !result.assets?.[0]?.base64) {
        return;
      }

      await gradePhotoAnswer.mutateAsync({
        questionId: current.id,
        image: result.assets[0].base64,
        subject,
      }, {
        onSuccess: (data) => {
          setPhotoData(data);
          setPhotoModalVisible(true);
        },
      });
    } catch (error) {
      console.error("[Photo Solution] Error uploading photo:", error);
      Alert.alert("Upload Failed", "AI could not process your solution. Please try again.");
    }
  };
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
              <View className="gap-3">
                <Input
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Type your answer"
                  multiline
                  className="min-h-28"
                />
                <Button
                  variant="outline"
                  label="Scan Handwritten Solution"
                  onPress={handlePhotoScan}
                >
                  <Camera size={16} color={primary} className="mr-2" />
                </Button>
              </View>
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

      {/* Beautiful LaTeX Math Solution Verification Modal */}
      <Modal
        visible={photoModalVisible}
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <Screen className="p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-foreground">AI Photo Grading</Text>
            <Pressable
              onPress={() => setPhotoModalVisible(false)}
              className="bg-muted px-4 py-2 rounded-xl active:opacity-80"
            >
              <Text className="text-sm font-bold text-muted-foreground">Close</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {photoData && (
              <View className="gap-6 mb-8">
                {/* Correctness Badge */}
                <View className={`p-4 rounded-2xl items-center ${photoData.isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                  <Text className={`text-lg font-bold ${photoData.isCorrect ? "text-green-500" : "text-red-500"}`}>
                    {photoData.isCorrect ? "Correct!" : "Incorrect / Needs Review"}
                  </Text>
                  <Text className="text-sm font-semibold text-muted-foreground mt-1">
                    Score: {photoData.score}/{photoData.maxScore}
                  </Text>
                </View>

                {/* Hand-written solution OCR verification */}
                <View className="bg-card p-5 rounded-3xl border border-border">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    AI Converted Your Handwriting To:
                  </Text>
                  <MathView value={`\\[ ${photoData.latexFormula} \\]`} />
                  <Text className="text-[10px] text-muted-foreground mt-3 italic text-center">
                    Verify if the formula above correctly represents your handwriting.
                  </Text>
                </View>

                {/* Feedback / grading steps */}
                <View className="bg-card p-5 rounded-3xl border border-border">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Grading & Step-by-Step Explanation
                  </Text>
                  <MathView value={photoData.explanation} />
                </View>
              </View>
            )}
          </ScrollView>
        </Screen>
      </Modal>

      {/* Premium Processing overlay */}
      {gradePhotoAnswer.isPending && (
        <View className="absolute inset-0 bg-background/80 items-center justify-center z-50">
          <View className="bg-card p-8 rounded-3xl border border-border items-center max-w-xs shadow-lg">
            <Camera size={32} color={primary} className="animate-pulse mb-4" />
            <Text className="text-base font-bold text-foreground mb-2 text-center">
              AI Analyzing Solution...
            </Text>
            <Text className="text-xs text-muted-foreground text-center leading-4">
              Our AI is extracting math formulas from your handwriting and grading it.
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
