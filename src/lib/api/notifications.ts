"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/apiClient";

export interface Notification {
  id: number;
  userId: number;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  id: number;
  userId: number;
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface UpdatePreferencesPayload {
  email?: boolean;
  sms?: boolean;
  marketing?: boolean;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function useNotifications(userId?: number, token?: string) {
  return useQuery({
    queryKey: ["notifications", userId, token],
    queryFn: () =>
      apiGet<Notification[]>(`/notifications/me/${userId}`, token),
    enabled: !!userId && !!token,
    refetchInterval: 30_000,
  });
}

export function useUnreadCount(userId?: number, token?: string) {
  return useQuery({
    queryKey: ["notifications-unread", userId, token],
    queryFn: () =>
      apiGet<UnreadCountResponse>(`/notifications/me/${userId}/unread-count`, token),
    enabled: !!userId && !!token,
    refetchInterval: 30_000,
  });
}

export function useNotificationPreferences(userId?: number, token?: string) {
  return useQuery({
    queryKey: ["notification-preferences", userId, token],
    queryFn: () =>
      apiGet<NotificationPreference>(`/notifications/preferences/${userId}`, token),
    enabled: !!userId && !!token,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useMarkAsRead(userId?: number, token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: number) =>
      apiPost<Notification>(
        `/notifications/${notificationId}/read/${userId}`,
        {},
        token
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId, token] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread", userId, token] });
    },
  });
}

export function useMarkAllAsRead(userId?: number, token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiPost<{ affected: number }>(
        `/notifications/mark-all-read/${userId}`,
        {},
        token
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId, token] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread", userId, token] });
    },
  });
}

export function useUpdateNotificationPreferences(userId?: number, token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: UpdatePreferencesPayload) =>
      apiPut<NotificationPreference>(
        `/notifications/preferences/${userId}`,
        preferences,
        token
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences", userId, token] });
    },
  });
}
