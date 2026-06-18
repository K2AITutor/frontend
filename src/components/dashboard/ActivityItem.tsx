"use client";

import {
  CheckCircle,
  BookOpen,
  Trophy,
  FileText,
  MessageSquare,
  Bell,
  AlertTriangle,
  Info,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ActivityType =
  | "quiz_completed"
  | "lesson_completed"
  | "achievement"
  | "practice"
  | "grade"
  | "assignment"
  | "message"
  | "warning"
  | "info"
  | "success";

interface ActivityScore {
  awarded: number;
  max: number;
  percent: number | null;
}

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  className?: string;
  // Submission detail link — when provided the whole item becomes a link.
  href?: string;
  subjectName?: string;
  score?: ActivityScore;
}

const activityConfig: Record<
  ActivityType,
  { icon: LucideIcon; bgColor: string; iconColor: string }
> = {
  quiz_completed: {
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  lesson_completed: {
    icon: BookOpen,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  achievement: {
    icon: Trophy,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  practice: {
    icon: FileText,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  grade: {
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
  assignment: {
    icon: FileText,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  message: {
    icon: MessageSquare,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

function formatScore(score: ActivityScore): string {
  const base = `${score.awarded}/${score.max}`;
  return score.percent !== null ? `${base} (${score.percent}%)` : base;
}

export function ActivityItem({
  type,
  title,
  description,
  timestamp,
  className,
  href,
  subjectName,
  score,
}: ActivityItemProps) {
  const config = activityConfig[type] || activityConfig.info;
  const Icon = config.icon;

  const content = (
    <>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
        {(subjectName || score) && (
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {subjectName && <span className="truncate">{subjectName}</span>}
            {subjectName && score && <span aria-hidden>•</span>}
            {score && (
              <span className="font-medium text-foreground">{formatScore(score)}</span>
            )}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatRelativeTime(timestamp)}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          "flex items-start gap-3 rounded-md py-3 transition-colors hover:bg-muted/50",
          className
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-start gap-3 py-3", className)}>{content}</div>
  );
}
