import React, { useState } from "react";
import { View, Text, ScrollView } from "../../src/tw";
import type { StudentCourse } from "@aitutor/shared";
import { useStudentDashboardData } from "@aitutor/shared";
import { StatCard, CourseCard } from "../../src/components/DashboardCards";
import { Skeleton, SkeletonStats, SkeletonCard } from "../../src/components/Skeleton";
import { Badge } from "../../src/components/ui/Badge";
import { Clock, Target, Trophy, BookOpen, Flame, ArrowRight } from "lucide-react-native";
import { Pressable, useCSSVariable } from "../../src/tw";
import { useRouter } from "expo-router";
import { Screen, ScreenHeader } from "../../src/components/Screen";
import { FeatureGate } from "../../src/components/FeatureGate";

export default function HomeScreen() {
  const router = useRouter();
  const primary = useCSSVariable("--color-primary");
  const primaryForeground = useCSSVariable("--color-primary-foreground");
  const coral = useCSSVariable("--color-accent-coral");
  const gold = useCSSVariable("--color-accent-gold");
  const { data, isLoading, isError } = useStudentDashboardData();
  const [showAssignments, setShowAssignments] = useState(true);

  if (isLoading) {
    return (
      <Screen>
        <ScreenHeader title="Loading..." />
        <ScrollView className="flex-1 p-6">
          <SkeletonStats />
          <Skeleton className="h-24 w-full rounded-3xl mb-8" />
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </ScrollView>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <ScreenHeader title="Dashboard" subtitle="We could not load your learning data." />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-center text-muted-foreground">
            Check your connection and try again.
          </Text>
        </View>
      </Screen>
    );
  }

  const { profile, stats, courses, assignments, recentActivities } = data;
  const pendingAssignments = assignments.filter((assignment) => assignment.status !== "completed");

  return (
    <Screen>
      <ScreenHeader
        title={`Welcome back, ${profile.name.split(" ")[0]}!`}
        subtitle={`${profile.grade} • ${profile.email}`}
      />

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
            <ArrowRight size={14} color={primaryForeground} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8 -mx-6"
          contentContainerClassName="gap-4 px-6"
        >
          <StatCard
            title="Hours Learned"
            value={stats.totalHoursLearned}
            subtitle="Total study time"
            icon={Clock}
            color={primary}
            className="w-48"
          />
          <StatCard
            title="Questions Answered"
            value={stats.questionsAnswered}
            subtitle="Practice questions"
            icon={Target}
            color={primary}
            className="w-48"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            subtitle="Across all subjects"
            icon={Trophy}
            color={gold}
            className="w-48"
          />
          <StatCard
            title="Courses Enrolled"
            value={stats.coursesEnrolled}
            subtitle={`${stats.assignmentsPending || 0} pending tasks`}
            icon={BookOpen}
            color={coral}
            className="w-48"
          />
        </ScrollView>

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

        <View className="mb-8 rounded-3xl border border-border bg-card p-5">
          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setShowAssignments((value) => !value)}
          >
            <View>
              <Text className="text-xl font-bold text-foreground">Upcoming Assignments</Text>
              <Text className="text-xs text-muted-foreground">
                {pendingAssignments.length} pending task{pendingAssignments.length === 1 ? "" : "s"}
              </Text>
            </View>
            <Text className="text-primary font-bold">{showAssignments ? "Hide" : "Show"}</Text>
          </Pressable>

          {showAssignments && (
            <View className="mt-5 gap-3">
              {pendingAssignments.length > 0 ? (
                pendingAssignments.map((assignment) => (
                  <View key={assignment.id} className="rounded-2xl border border-border bg-muted/40 p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="font-bold text-foreground">{assignment.title}</Text>
                        <Text className="mt-1 text-xs text-muted-foreground">{assignment.course}</Text>
                      </View>
                      <Badge variant={assignment.priority === "high" ? "destructive" : "secondary"} label={assignment.priority} />
                    </View>
                    <Text className="mt-3 text-xs text-muted-foreground">Due {assignment.dueDate}</Text>
                  </View>
                ))
              ) : (
                <Text className="py-6 text-center text-muted-foreground">No pending assignments. Great job.</Text>
              )}
            </View>
          )}
        </View>

        <FeatureGate flag="dashboard-activity-feed">
          <View className="mb-10">
            <Text className="mb-4 text-xl font-bold text-foreground">Recent Activity</Text>
            {recentActivities.slice(0, 3).map((activity) => (
              <View key={activity.id} className="mb-3 rounded-2xl border border-border bg-card p-4">
                <Text className="font-semibold text-foreground">{activity.title}</Text>
                <Text className="mt-1 text-xs text-muted-foreground">{activity.description}</Text>
                <Text className="mt-2 text-[10px] text-muted-foreground">{activity.timestamp}</Text>
              </View>
            ))}
          </View>
        </FeatureGate>
      </ScrollView>
    </Screen>
  );
}
