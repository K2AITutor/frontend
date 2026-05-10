"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/dashboard/ui/dropdown-menu";
import { ScrollArea } from "@/components/dashboard/ui/scroll-area";
import { NotificationItem } from "./NotificationItem";
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/lib/api/notifications";

export function NotificationBell() {
  const { data: session } = useSession();
  const userId = Number((session?.user as any)?.id) || undefined;
  const token = (session?.user as any)?.accessToken as string | undefined;

  const { data: notifications = [] } = useNotifications(userId, token);
  const { data: unreadData } = useUnreadCount(userId, token);
  const markAsRead = useMarkAsRead(userId, token);
  const markAllAsRead = useMarkAllAsRead(userId, token);

  const unreadCount = unreadData?.unreadCount ?? 0;

  function handleMarkAsRead(notificationId: number, isRead: boolean) {
    if (!isRead) {
      markAsRead.mutate(notificationId);
    }
  }

  function handleMarkAllAsRead() {
    markAllAsRead.mutate();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-primary hover:underline disabled:opacity-50"
              disabled={markAllAsRead.isPending}
            >
              Mark all as read
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="my-0" />

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  apiType={notification.type}
                  title={notification.title}
                  message={notification.message}
                  timestamp={notification.createdAt}
                  read={notification.isRead}
                  onClick={() =>
                    handleMarkAsRead(notification.id, notification.isRead)
                  }
                  className="rounded-none border-b last:border-b-0"
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
