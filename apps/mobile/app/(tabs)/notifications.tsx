import React from "react";
import { View, Text, ScrollView } from "../../src/tw";
import { Bell, CheckCircle, FileText, Trophy, MessageSquare } from "lucide-react-native";
import { EmptyState } from "../../src/components/EmptyState";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "achievement" as const,
    title: "Streak Milestone!",
    message: "You've hit a 5-day practice streak. Keep going!",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "assignment" as const,
    title: "Assignment Due Soon",
    message: "Methods Calculus Review is due in 2 days.",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "grade" as const,
    title: "New Grade Posted",
    message: "Your Probability quiz score: 100%",
    timestamp: "1 day ago",
    read: true,
  },
];

const iconMap = {
  achievement: Trophy,
  assignment: FileText,
  grade: CheckCircle,
  message: MessageSquare,
};

const colorMap = {
  achievement: "#eab308",
  assignment: "#f97316",
  grade: "#22c55e",
  message: "#3b82f6",
};

export default function NotificationsScreen() {
  if (MOCK_NOTIFICATIONS.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No Notifications"
        description="You're all caught up! New notifications will appear here."
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="pt-14 pb-6 px-6 bg-card border-b border-border">
        <Text className="text-2xl font-bold text-foreground">Notifications</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {MOCK_NOTIFICATIONS.map((notif) => {
          const Icon = iconMap[notif.type] || MessageSquare;
          const color = colorMap[notif.type] || "#94a3b8";

          return (
            <View
              key={notif.id}
              className={`bg-card p-4 rounded-2xl border border-border mb-3 flex-row items-start gap-3 ${
                !notif.read ? "border-primary/30" : ""
              }`}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon size={18} color={color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className={`font-semibold text-foreground text-sm ${!notif.read ? "" : "opacity-70"}`}>
                    {notif.title}
                  </Text>
                  {!notif.read && (
                    <View className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </View>
                <Text className="text-xs text-muted-foreground mt-1">{notif.message}</Text>
                <Text className="text-[10px] text-muted-foreground mt-2">{notif.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
