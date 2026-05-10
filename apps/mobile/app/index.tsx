import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, Pressable, ScrollView } from "../src/tw";
import { getToken, clearToken } from "../src/lib/secureStore";
import apiClient from "../src/lib/apiClient";
import { 
  BookOpen, 
  Clock, 
  Target, 
  Trophy, 
  Flame, 
  ArrowRight, 
  Settings as SettingsIcon,
  LogOut
} from "lucide-react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/login");
          return;
        }

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

  const handleLogout = async () => {
    await clearToken();
    router.replace("/login");
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground animate-pulse text-lg font-medium">Loading Dashboard...</Text>
      </View>
    );
  }

  if (!data) return null;

  const { profile, stats, courses } = data;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Hi, {profile.name.split(' ')[0]}!</Text>
          <Text className="text-sm text-muted-foreground">{profile.grade}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.push('/settings')} className="p-2 rounded-full bg-muted active:bg-border">
            <SettingsIcon size={20} color="#94a3b8" />
          </Pressable>
          <Pressable onPress={handleLogout} className="p-2 rounded-full bg-destructive/10 active:bg-destructive/20">
            <LogOut size={20} color="#ef4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Streak & CTA */}
        <View className="bg-accent/10 border border-accent/20 rounded-3xl p-5 flex-row items-center justify-between mb-6 shadow-sm">
          <View className="flex-row items-center">
            <View className="bg-accent/20 p-2 rounded-xl">
               <Flame size={24} color="#f97316" />
            </View>
            <Text className="ml-3 font-bold text-foreground text-lg">{profile.streak} day streak</Text>
          </View>
          <Pressable 
            onPress={() => router.push('/practice')}
            className="bg-primary px-5 py-2.5 rounded-2xl shadow-lg shadow-primary/20 active:scale-95"
          >
            <Text className="text-primary-foreground font-bold text-sm">Practice Now</Text>
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          <StatCard title="Hours" value={stats.totalHoursLearned} icon={Clock} color="#6366f1" />
          <StatCard title="Answers" value={stats.questionsAnswered} icon={Target} color="#14b8a6" />
          <StatCard title="Avg Score" value={`${stats.averageScore}%`} icon={Trophy} color="#eab308" />
          <StatCard title="Courses" value={stats.coursesEnrolled} icon={BookOpen} color="#ec4899" />
        </View>

        {/* Progress Card */}
        <View className="bg-card p-6 rounded-3xl border border-border mb-8 shadow-sm">
          <Text className="text-lg font-bold text-foreground mb-4">Overall Progress</Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-muted-foreground">Curriculum completion</Text>
            <Text className="text-sm font-bold text-primary">{profile.overallProgress}%</Text>
          </View>
          <View className="h-3.5 w-full bg-muted rounded-full overflow-hidden">
            <View className="h-full bg-primary" style={{ width: `${profile.overallProgress}%` }} />
          </View>
        </View>

        {/* Course List */}
        <View className="mb-10">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-foreground">My Courses</Text>
            <Pressable>
              <Text className="text-primary font-bold">View All</Text>
            </Pressable>
          </View>

          {courses.map((course: any) => (
            <Pressable 
              key={course.id}
              className="bg-card p-5 rounded-3xl border border-border mb-4 flex-row items-center justify-between active:scale-[0.98] transition-transform"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                  <BookOpen size={24} color="#14b8a6" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-foreground text-base">{course.name}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{course.nextLesson}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-primary">{course.progress}%</Text>
                <ArrowRight size={16} color="#94a3b8" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <View className="bg-card p-4 rounded-3xl border border-border flex-1 min-w-[140px] shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</Text>
        <Icon size={14} color={color} />
      </View>
      <Text className="text-2xl font-black text-foreground">{value}</Text>
    </View>
  );
}
