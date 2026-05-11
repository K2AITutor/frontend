import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "../../src/tw";
import apiClient from "../../src/lib/apiClient";
import type { StudentDashboardData, StudentCourse } from "@aitutor/shared";
import { StatCard, CourseCard } from "../../src/components/DashboardCards";
import { SkeletonStats, SkeletonCard } from "../../src/components/Skeleton";
import { Clock, Target, Trophy, BookOpen, Flame } from "lucide-react-native";
import { Pressable } from "../../src/tw";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await apiClient.get("/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <View className="pt-14 pb-6 px-6 bg-card border-b border-border">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-24" />
        </View>
        <ScrollView className="flex-1 p-6">
          <Skeleton className="h-20 w-full rounded-3xl mb-6" />
          <SkeletonStats />
          <Skeleton className="h-24 w-full rounded-3xl mb-8" />
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      </View>
    );
  }

  if (!data) return null;

  const { profile, stats, courses } = data;

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">
          Hi, {profile.name.split(" ")[0]}!
        </Text>
        <Text className="text-sm text-muted-foreground">{profile.grade}</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-accent/10 border border-accent/20 rounded-3xl p-5 flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View className="bg-accent/20 p-2 rounded-xl">
              <Flame size={24} color="#f97316" />
            </View>
            <Text className="ml-3 font-bold text-foreground text-lg">
              {profile.streak} day streak
            </Text>
          </View>
          <Pressable
            onPress={() => router.navigate("/(tabs)/practice")}
            className="bg-primary px-5 py-2.5 rounded-2xl active:scale-95"
          >
            <Text className="text-primary-foreground font-bold text-sm">
              Practice Now
            </Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-8">
          <StatCard title="Hours" value={stats.totalHoursLearned} icon={Clock} color="#6366f1" />
          <StatCard title="Answers" value={stats.questionsAnswered} icon={Target} color="#14b8a6" />
          <StatCard title="Avg Score" value={`${stats.averageScore}%`} icon={Trophy} color="#eab308" />
          <StatCard title="Courses" value={stats.coursesEnrolled} icon={BookOpen} color="#ec4899" />
        </View>

        <View className="bg-card p-6 rounded-3xl border border-border mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">Overall Progress</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-muted-foreground">Curriculum completion</Text>
            <Text className="text-sm font-bold text-primary">{profile.overallProgress}%</Text>
          </View>
          <View className="h-3.5 w-full bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-primary" style={{ width: `${profile.overallProgress}%` }} />
          </View>
        </View>

        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-foreground">My Courses</Text>
            <Pressable>
              <Text className="text-primary font-bold">View All</Text>
            </Pressable>
          </View>

          {courses.map((course: StudentCourse) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
