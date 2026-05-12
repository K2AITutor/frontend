import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "../../src/tw";
import apiClient from "../../src/lib/apiClient";
import type { StudentDashboardData, StudentCourse } from "@aitutor/shared";
import { StatCard, CourseCard } from "../../src/components/DashboardCards";
import { Skeleton, SkeletonStats, SkeletonCard } from "../../src/components/Skeleton";
import { Badge } from "../../src/components/ui/Badge";
import { Clock, Target, Trophy, BookOpen, Flame, ArrowRight } from "lucide-react-native";
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
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </View>
        <ScrollView className="flex-1 p-6">
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
      {/* Welcome Header */}
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">
            Welcome back, {profile.name.split(" ")[0]}!
          </Text>
          <Text className="text-xs text-muted-foreground">
            {profile.grade} • {profile.email}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="flex-row items-center justify-between mb-6">
          <Badge
            variant="orange"
            label={`${profile.streak} day streak`}
            className="flex-row items-center gap-1.5 px-4 py-2"
          />
          <Pressable
            onPress={() => router.navigate("/(tabs)/practice")}
            className="bg-primary px-5 py-2.5 rounded-xl flex-row items-center active:opacity-80"
          >
            <Text className="text-primary-foreground font-bold text-sm mr-2">
              Start Practice
            </Text>
            <ArrowRight size={14} color="#fff" />
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-4 mb-8">
          <StatCard
            title="Hours Learned"
            value={stats.totalHoursLearned}
            subtitle="Total study time"
            icon={Clock}
            color="#6366f1"
          />
          <StatCard
            title="Questions Answered"
            value={stats.questionsAnswered}
            subtitle="Practice questions"
            icon={Target}
            color="#14b8a6"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            subtitle="Across all subjects"
            icon={Trophy}
            color="#eab308"
          />
          <StatCard
            title="Courses Enrolled"
            value={stats.coursesEnrolled}
            subtitle={`${stats.assignmentsPending || 0} pending tasks`}
            icon={BookOpen}
            color="#ec4899"
          />
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
