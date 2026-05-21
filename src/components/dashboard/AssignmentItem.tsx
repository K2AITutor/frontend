"use client";

import { Badge } from "@/components/dashboard/ui/badge";
import { Clock, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

type AssignmentStatus = "pending" | "in_progress" | "completed";
type Priority = "high" | "medium" | "low";

interface AssignmentItemProps {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: AssignmentStatus;
  priority: Priority;
  className?: string;
}

const statusConfig: Record<
  AssignmentStatus,
  { icon: React.ReactNode; label: string; className: string }
> = {
  pending: {
    icon: <Circle className="h-4 w-4" />,
    label: "Pending",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  },
  in_progress: {
    icon: <Clock className="h-4 w-4" />,
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  completed: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

const priorityConfig: Record<Priority, { className: string }> = {
  high: { className: "border-l-red-500" },
  medium: { className: "border-l-yellow-500" },
  low: { className: "border-l-green-500" },
};

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays} days`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDueDateColor(dateString: string, status: AssignmentStatus): string {
  if (status === "completed") return "text-muted-foreground";

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "text-red-600 dark:text-red-400";
  if (diffDays <= 2) return "text-orange-600 dark:text-orange-400";
  return "text-muted-foreground";
}

export function AssignmentItem({
  title,
  course,
  dueDate,
  status,
  priority,
  className,
}: AssignmentItemProps) {
  const statusCfg = statusConfig[status];
  const priorityCfg = priorityConfig[priority];

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-l-4 bg-card p-4",
        priorityCfg.className,
        className
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{title}</p>
          <p className="text-xs text-muted-foreground">{course}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-xs font-medium whitespace-nowrap",
            getDueDateColor(dueDate, status)
          )}
        >
          {formatDueDate(dueDate)}
        </span>
        <Badge className={cn("text-xs", statusCfg.className)}>
          {statusCfg.label}
        </Badge>
      </div>
    </div>
  );
}
