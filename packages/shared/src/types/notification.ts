export type ApiNotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: number;
  userId: number;
  type: ApiNotificationType;
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
