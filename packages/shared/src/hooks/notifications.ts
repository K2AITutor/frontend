import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { Notification, NotificationPreference, UnreadCountResponse } from "../types/notification";
import { useFetcher } from "./FetcherContext";

export function useNotifications(userId?: number) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["notifications", userId],
    enabled: userId != null,
    queryFn: ({ signal }) => fetcher.get<Notification[]>(PATH.notifications.me(userId!), { signal }),
  });
}

export function useUnreadNotificationCount(userId?: number) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["notifications", "unreadCount", userId],
    enabled: userId != null,
    queryFn: ({ signal }) =>
      fetcher.get<UnreadCountResponse>(PATH.notifications.unreadCount(userId!), { signal }),
  });
}

export function useNotificationPreferences(userId?: number) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["notifications", "preferences", userId],
    enabled: userId != null,
    queryFn: ({ signal }) =>
      fetcher.get<NotificationPreference>(PATH.notifications.preferences(userId!), { signal }),
  });
}

export function useMarkNotificationRead(userId?: number) {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) => {
      if (userId == null) throw new Error("userId is required to mark a notification read");
      return fetcher.post<Notification>(PATH.notifications.markRead(notificationId, userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unreadCount", userId] });
    },
  });
}

export function useMarkAllNotificationsRead(userId?: number) {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (userId == null) throw new Error("userId is required to mark notifications read");
      return fetcher.post<{ success: boolean }>(PATH.notifications.markAllRead(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unreadCount", userId] });
    },
  });
}
