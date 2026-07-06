import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, useCSSVariable } from "../../src/tw";
import { useRouter } from "expo-router";
import { BookOpen, Clock, Trophy, Brain, Camera } from "lucide-react-native";
import { Screen, ScreenHeader } from "../../src/components/Screen";
import { useSubjects, useGradePhotoAnswer } from "@aitutor/shared";
import { Alert, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MathView } from "../../src/components/math/MathView";
import { FeatureGate } from "../../src/components/FeatureGate";

export default function PracticeScreen() {
  const router = useRouter();
  const primary = useCSSVariable("--color-primary");
  const primaryForeground = useCSSVariable("--color-primary-foreground");
  const { data: subjects = [], isLoading, isError } = useSubjects();
  const fallbackIcons = [BookOpen, Brain, Clock, Trophy];

  const gradePhotoAnswer = useGradePhotoAnswer();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState<any>(null);

  const handlePhotoTutor = async () => {
    // 1. Request permissions
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "We need camera and photo library access to scan math questions. Please enable them in your device Settings."
      );
      return;
    }

    // 2. Alert to choose source
    Alert.alert(
      "AI Photo Math Scan",
      "Choose a source to scan the math equation:",
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
        image: result.assets[0].base64,
        subject: "MATH_METHODS",
      }, {
        onSuccess: (data) => {
          setModalData(data);
          setModalVisible(true);
        },
      });
    } catch (error) {
      console.error("[Photo Tutor] Error uploading photo:", error);
      Alert.alert("Upload Failed", "AI could not process the photo. Please try again.");
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title="Practice"
        subtitle="Choose a topic to start your AI-powered practice session"
      />

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
        {/* Sleek Gradient AI Photo Tutor Hero Card */}
        <FeatureGate flag="ai-photo-tutor">
          <View className="bg-primary/10 border border-primary/20 p-6 rounded-3xl mb-8 flex-row items-center justify-between overflow-hidden">
            <View className="flex-1 mr-4">
              <Text className="text-xl font-bold text-foreground mb-1">
                AI Photo Math Tutor
              </Text>
              <Text className="text-xs text-muted-foreground leading-5">
                Snap a photo of any math question to parse and explain it instantly with step-by-step LaTeX formatting.
              </Text>
              <Pressable
                className="mt-4 bg-primary px-5 py-3 rounded-2xl flex-row items-center self-start active:opacity-80"
                onPress={handlePhotoTutor}
              >
                <Camera size={16} color={primaryForeground} className="mr-2" />
                <Text className="text-primary-foreground font-bold text-sm">
                  Snap Math Problem
                </Text>
              </Pressable>
            </View>
          </View>
        </FeatureGate>

        {isLoading && (
          <Text className="mb-4 text-sm text-muted-foreground">Loading subjects...</Text>
        )}
        {isError && (
          <Text className="mb-4 text-sm text-destructive">
            We could not load subjects. Pull to refresh will be added in the next phase.
          </Text>
        )}

        <FeatureGate
          flag="practice-sessions"
          fallback={
            <Text className="mb-4 text-sm text-muted-foreground">
              Practice sessions are currently unavailable.
            </Text>
          }
        >
        <View className="flex-row flex-wrap gap-3 mb-8">
          {subjects.map((subject, index) => {
            const Icon = fallbackIcons[index % fallbackIcons.length];
            const SUBJECT_CODE_MAP: Record<number, string> = {
              1: "MATH_METHODS",
              2: "SPECIALIST_MATHS",
              3: "PHYSICS",
              4: "CHEMISTRY",
              5: "BIOLOGY",
              6: "ENGLISH",
              7: "PSYCHOLOGY",
            };
            const isAvailable = subject.id === 1; // Only Maths Methods is currently available for practice

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
                  {isAvailable && <Text className="text-primary font-bold text-lg">New</Text>}
                </View>

                <View className="h-2.5 w-full bg-muted rounded-full overflow-hidden mb-4">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: "0%" }}
                  />
                </View>

                <Pressable
                  className={`w-full py-3.5 rounded-2xl ${isAvailable ? "bg-primary active:opacity-80" : "bg-muted/80"}`}
                  disabled={!isAvailable}
                  onPress={() => {
                    const subjectCode = SUBJECT_CODE_MAP[subject.id] || "MATH_METHODS";
                    router.push(`/practice/${subjectCode}`);
                  }}
                >
                  <Text className={`${isAvailable ? "text-primary-foreground font-semibold" : "text-muted-foreground font-medium"} text-center`}>
                    {isAvailable ? "Start Practice" : "Coming Soon"}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
        </FeatureGate>
      </ScrollView>

      {/* Full-Screen Beautiful LaTeX Math Solution Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Screen className="p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-foreground">AI Photo Solution</Text>
            <Pressable
              onPress={() => setModalVisible(false)}
              className="bg-muted px-4 py-2 rounded-xl active:opacity-80"
            >
              <Text className="text-sm font-bold text-muted-foreground">Close</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {modalData && (
              <View className="gap-6 mb-8">
                <View className="bg-card p-5 rounded-3xl border border-border">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Scanned Equation
                  </Text>
                  <MathView value={`\\[ ${modalData.latexFormula} \\]`} />
                </View>

                <View className="bg-card p-5 rounded-3xl border border-border">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    AI Step-by-Step Explanation
                  </Text>
                  <MathView value={modalData.explanation} />
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
              AI Scanning Image...
            </Text>
            <Text className="text-xs text-muted-foreground text-center leading-4">
              Our AI is extracting math formulas and generating step-by-step solutions.
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
}
