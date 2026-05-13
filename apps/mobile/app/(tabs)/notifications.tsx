import React from "react";
import { Pressable, View, Text, ScrollView, useCSSVariable } from "../../src/tw";
import { Bell, CheckCircle, FileText, Trophy, MessageSquare } from "lucide-react-native";
import { EmptyState } from "../../src/components/EmptyState";
import { Screen, ScreenHeader } from "../../src/components/Screen";
import { cn } from "../../src/lib/utils";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUserProfile,
} from "@aitutor/shared";

const iconMap = {
  success: Trophy,
  warning: FileText,
  info: MessageSquare,
  error: CheckCircle,
};

const bgClassMap = {
  success: "bg-emerald-500/15",
  warning: "bg-orange-500/15",
  info: "bg-primary/15",
  error: "bg-destructive/15",
};

export default function NotificationsScreen() {
  const gold = useCSSVariable("--color-accent-gold");
  const orange = useCSSVariable("--color-accent-coral");
  const green = useCSSVariable("--color-primary");
  const primary = useCSSVariable("--color-primary");
  const destructive = useCSSVariable("--color-destructive");
  const muted = useCSSVariable("--color-muted-foreground");
  const { data: profile } = useUserProfile();
  const userId =
    typeof profile?.userId === "number"
      ? profile.userId
      : typeof profile?.id === "number"
        ? profile.id
        : undefined;
  const { data: notifications = [], isLoading } = useNotifications(userId);
  const markRead = useMarkNotificationRead(userId);
  const markAllRead = useMarkAllNotificationsRead(userId);

  if (!isLoading && notifications.length === 0) {
    return (
      <Screen>
        <ScreenHeader title="Notifications" />
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! New notifications will appear here."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        title="Notifications"
        rightContent={
          notifications.length > 0 ? (
            <Pressable onPress={() => markAllRead.mutate()} className="rounded-full bg-primary/10 px-3 py-2">
              <Text className="text-xs font-bold text-primary">Mark all read</Text>
            </Pressable>
          ) : null
        }
      />

      <ScrollView className="flex-1 p-4">
        {isLoading && (
          <Text className="mb-4 text-sm text-muted-foreground">Loading notifications...</Text>
        )}
        {notifications.map((notif) => {
          const Icon = iconMap[notif.type] || MessageSquare;
          const colorMap = {
            success: green,
            warning: orange,
            info: primary,
            error: destructive,
          };
          const color = colorMap[notif.type] || muted;
          const bgClass = bgClassMap[notif.type] || "bg-muted";

          return (
            <Pressable
              key={notif.id}
              onPress={() => !notif.isRead && markRead.mutate(notif.id)}
              onLongPress={() => !notif.isRead && markRead.mutate(notif.id)}
              className={`bg-card p-4 rounded-2xl border border-border mb-3 flex-row items-start gap-3 ${
                !notif.isRead ? "border-primary/30" : ""
              }`}
            >
              <View
                className={cn("w-10 h-10 rounded-xl items-center justify-center", bgClass)}
              >
                <Icon size={18} color={color} />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className={`font-semibold text-foreground text-sm ${!notif.isRead ? "" : "opacity-70"}`}>
                    {notif.title}
                  </Text>
                  {!notif.isRead && (
                    <View className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </View>
                <Text className="text-xs text-muted-foreground mt-1">{notif.message}</Text>
                <Text className="text-[10px] text-muted-foreground mt-2">{notif.createdAt}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
