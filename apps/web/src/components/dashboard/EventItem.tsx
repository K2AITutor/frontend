"use client";

import { Calendar, Users, FileEdit, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "meeting" | "exam" | "event";

interface EventItemProps {
  title: string;
  date: string;
  time: string;
  type: EventType;
  className?: string;
}

const eventConfig: Record<
  EventType,
  { icon: React.ReactNode; bgColor: string; iconColor: string }
> = {
  meeting: {
    icon: <Users className="h-4 w-4" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  exam: {
    icon: <FileEdit className="h-4 w-4" />,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
  },
  event: {
    icon: <PartyPopper className="h-4 w-4" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};

function formatDate(dateString: string): { day: string; month: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString("en-US", { month: "short" }),
  };
}

export function EventItem({
  title,
  date,
  time,
  type,
  className,
}: EventItemProps) {
  const config = eventConfig[type];
  const { day, month } = formatDate(date);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-3",
        className
      )}
    >
      {/* Date Box */}
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-muted">
        <span className="text-lg font-bold leading-none">{day}</span>
        <span className="text-xs text-muted-foreground uppercase">{month}</span>
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>

      {/* Event Type Icon */}
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <span className={config.iconColor}>{config.icon}</span>
      </div>
    </div>
  );
}
