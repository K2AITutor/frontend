"use client";

import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "warning" | "info" | "success" | "error";

interface SystemAlertProps {
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  className?: string;
}

const alertConfig: Record<
  AlertType,
  { icon: React.ReactNode; bgColor: string; borderColor: string; iconColor: string }
> = {
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    bgColor: "bg-yellow-50 dark:bg-yellow-900/10",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    bgColor: "bg-blue-50 dark:bg-blue-900/10",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  success: {
    icon: <CheckCircle className="h-4 w-4" />,
    bgColor: "bg-green-50 dark:bg-green-900/10",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    bgColor: "bg-red-50 dark:bg-red-900/10",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
  },
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SystemAlert({
  type,
  title,
  message,
  timestamp,
  className,
}: SystemAlertProps) {
  const config = alertConfig[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className={cn("mt-0.5", config.iconColor)}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{title}</p>
          <span className="text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{message}</p>
      </div>
    </div>
  );
}
