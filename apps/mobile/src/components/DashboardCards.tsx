import React from "react";
import { View, Text, useCSSVariable } from "../tw";
import { ArrowRight, BookOpen } from "lucide-react-native";
import type { StudentCourse } from "@aitutor/shared";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress } from "./ui";
import { cn } from "../lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  className?: string;
}) {
  return (
    <Card className={cn("flex-1 min-w-[140px]", className)}>
      <CardContent className="p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-2">
            <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              {title}
            </Text>
            <Text className="text-2xl font-black text-foreground">{value}</Text>
            {subtitle && (
              <Text className="text-[10px] text-muted-foreground mt-1">
                {subtitle}
              </Text>
            )}
          </View>
          <View
            className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon size={18} color={color} />
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

export function CourseCard({ course }: { course: StudentCourse }) {
  const primary = useCSSVariable("--color-primary");

  const getGradeVariant = (grade?: string): any => {
    if (!grade) return "outline";
    if (grade.startsWith("A")) return "success";
    if (grade.startsWith("B")) return "secondary";
    return "destructive";
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center">
            <BookOpen size={20} color={primary} />
          </View>
          <CardTitle className="text-base">{course.name}</CardTitle>
        </View>
        {course.grade && (
          <Badge variant={getGradeVariant(course.grade)} label={course.grade} />
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-muted-foreground">Progress</Text>
            <Text className="text-xs font-bold text-foreground">
              {course.progress}%
            </Text>
          </View>
          <Progress value={course.progress} className="h-2" />
        </View>

        {course.nextLesson && (
          <View className="flex-row items-center justify-between pt-2 border-t border-border">
            <View>
              <Text className="text-[10px] text-muted-foreground">
                Next lesson
              </Text>
              <Text className="text-sm font-bold text-foreground">
                {course.nextLesson}
              </Text>
            </View>
            <Button
              variant="ghost"
              size="sm"
              className="flex-row items-center"
              label="Continue"
            >
              <ArrowRight size={14} color={primary} />
            </Button>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
