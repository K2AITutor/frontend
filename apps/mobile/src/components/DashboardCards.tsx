import { View, Text, Pressable } from "../tw";
import { ArrowRight } from "lucide-react-native";
import type { StudentCourse } from "@aitutor/shared";

export function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}) {
  return (
    <View className="bg-card p-4 rounded-3xl border border-border flex-1 min-w-[140px] shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {title}
        </Text>
        <Icon size={14} color={color} />
      </View>
      <Text className="text-2xl font-black text-foreground">{value}</Text>
    </View>
  );
}

export function CourseCard({ course }: { course: StudentCourse }) {
  return (
    <Pressable className="bg-card p-5 rounded-3xl border border-border mb-4 flex-row items-center justify-between active:scale-[0.98]">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
          <ArrowRight size={24} color="#14b8a6" />
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
  );
}
