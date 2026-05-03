"use client";

import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ThumbsUp,
  ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { useTeacherStats, useReviewQueue } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ReviewQueueItem } from "@/lib/types/review";

const confidenceBadgeVariant = (level: ReviewQueueItem["confidenceLevel"]) => {
  if (level === "low") return "destructive" as const;
  if (level === "medium") return "secondary" as const;
  return "outline" as const;
};

function QueuePreviewRow({ item }: { item: ReviewQueueItem }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{item.studentName}</p>
        <p className="text-xs text-muted-foreground">
          {item.subject} · {item.questionType.replace("_", " ")}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <Badge variant={confidenceBadgeVariant(item.confidenceLevel)} className="text-xs capitalize">
          {(item.aiConfidence * 100).toFixed(0)}%
        </Badge>
        <Button asChild size="sm" variant="outline">
          <Link href={`/teacher/review/${item.id}`}>Review</Link>
        </Button>
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  usePageTitle("Teacher Dashboard");

  const { data: session } = useSession();
  const { data: stats, isLoading, error, refetch } = useTeacherStats();
  const { data: queue, isError: queueError, refetch: refetchQueue } = useReviewQueue({ page: 1 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load dashboard</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const statCards = [
    {
      icon: <ClipboardList className="h-8 w-8 text-amber-500 shrink-0" />,
      value: stats?.queueDepth ?? 0,
      label: "Awaiting review",
    },
    {
      icon: <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />,
      value: stats?.reviewedToday ?? 0,
      label: "Reviewed today",
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-500 shrink-0" />,
      value: `${stats?.escalationRatePct ?? 0}%`,
      label: "Escalation rate",
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-500 shrink-0" />,
      value: stats?.avgResolutionMinutes?.toFixed(1) ?? "—",
      label: "Avg resolution (min)",
    },
    {
      icon: <ThumbsUp className="h-8 w-8 text-primary shrink-0" />,
      value: `${stats?.agreementRatePct ?? 0}%`,
      label: "Agreement with AI",
    },
  ];

  const previewItems = queue?.items.slice(0, 5) ?? [];
  const teacherName = session?.user?.name;

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {teacherName ? `Welcome back, ${teacherName}` : "Teacher Dashboard"}
        </h1>
        <p className="text-muted-foreground">Review AI-marked submissions and manage your queue</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 flex flex-col items-start gap-2">
              {s.icon}
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queue preview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Review Queue
              {queue?.total != null && queue.total > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({previewItems.length} of {queue.total})
                </span>
              )}
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/teacher/review" className="flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {queueError ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-muted-foreground">Failed to load queue</p>
              <Button variant="outline" size="sm" onClick={() => refetchQueue()}>Retry</Button>
            </div>
          ) : previewItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Queue is empty — no submissions awaiting review.
            </p>
          ) : (
            previewItems.map((item) => (
              <QueuePreviewRow key={item.id} item={item} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-16 text-base">
          <Link href="/teacher/review">Review Queue</Link>
        </Button>
        <Button asChild variant="outline" className="h-16 text-base">
          <Link href="/teacher/history">Review History</Link>
        </Button>
        <Button asChild variant="outline" className="h-16 text-base">
          <Link href="/teacher/stats">My Stats</Link>
        </Button>
      </div>
    </div>
  );
}
