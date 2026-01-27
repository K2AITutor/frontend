"use client";

import {
  CheckCircle,
  FileText,
  Trophy,
  MessageSquare,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "grade" | "assignment" | "achievement" | "message";

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  className?: string;
}

const notificationConfig: Record<
  NotificationType,
  { icon: React.ReactNode; bgColor: string; iconColor: string }
> = {
  grade: {
    icon: <CheckCircle className="h-4 w-4" />,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  assignment: {
    icon: <FileText className="h-4 w-4" />,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  achievement: {
    icon: <Trophy className="h-4 w-4" />,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  message: {
    icon: <MessageSquare className="h-4 w-4" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

export function NotificationItem({
  type,
  title,
  message,
  timestamp,
  read,
  className,
}: NotificationItemProps) {
  const config = notificationConfig[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg p-3 transition-colors",
        !read && "bg-primary/5",
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <span className={config.iconColor}>{config.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm truncate",
              !read ? "font-semibold" : "font-medium"
            )}
          >
            {title}
          </p>
          {!read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{message}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(timestamp)}
      </span>
    </div>
  );
}
