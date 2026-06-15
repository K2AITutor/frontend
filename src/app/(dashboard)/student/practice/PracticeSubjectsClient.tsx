"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BookText,
  Brain,
  Calculator,
  Clock,
  Dna,
  FlaskConical,
  Landmark,
  LineChart,
  Sigma,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/dashboard/ui/button";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/dashboard/ui/card";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { toast } from "@/components/dashboard/ui/sonner";
import {
  usePracticeSubjects,
  type PracticeSubjectPersonalized,
} from "@/lib/api/subjects";

/**
 * Map of supported lucide icon names (as returned by the API) to components.
 * A static map keeps the client bundle small (importing the whole lucide-react
 * namespace would ship every icon). Unknown / null names fall back to BookOpen.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  Sigma,
  Atom,
  FlaskConical,
  Landmark,
  LineChart,
  TrendingUp,
  Dna,
  BookText,
  Brain,
  BookOpen,
};

function resolveIcon(name: string | null): LucideIcon {
  if (!name) return BookOpen;
  return ICON_MAP[name] ?? BookOpen;
}

function SubjectCard({ subject }: { subject: PracticeSubjectPersonalized }) {
  const isActive = subject.status === "active";
  const hasProgress = subject.questionsAttempted > 0;
  const Icon = resolveIcon(subject.icon);

  return (
    <Card
      className={`relative flex flex-col ${!isActive ? "opacity-60" : ""} ${
        subject.recommended ? "ring-2 ring-primary" : ""
      }`}
    >
      {subject.recommended && (
        <Badge className="absolute right-3 top-3 gap-1">
          <Sparkles className="h-3 w-3" />
          Nên luyện tiếp
        </Badge>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex flex-col">
            <CardTitle className="text-lg">{subject.name}</CardTitle>
            {isActive ? (
              <Badge variant="secondary" className="mt-1 w-fit">
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="mt-1 w-fit gap-1">
                <Clock className="h-3 w-3" />
                Coming Soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {hasProgress ? (
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tiến độ</span>
                <span className="font-medium">{subject.progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${subject.progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Câu đã làm</span>
              <span className="font-medium">{subject.questionsAttempted}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Điểm TB</span>
              <span className="font-medium">{subject.averageScore}%</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isActive
              ? "Practice with AI-powered hints and explanations"
              : "This subject will be available soon"}
          </p>
        )}
      </CardContent>

      <CardFooter>
        {isActive ? (
          <Button asChild className="w-full">
            <Link href={`/student/practice/${subject.slug}`}>
              <BookOpen className="mr-2 h-4 w-4" />
              Start Practice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" disabled className="w-full">
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function SubjectCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function PracticeSubjectsClient() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePracticeSubjects();

  useEffect(() => {
    if (isError) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không tải được danh sách môn luyện tập"
      );
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SubjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Không tải được danh sách môn luyện tập.
        </p>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Đang tải lại..." : "Thử lại"}
        </Button>
      </div>
    );
  }

  const subjects = data?.subjects ?? [];

  if (subjects.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Chưa có môn luyện tập nào.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard key={subject.code} subject={subject} />
      ))}
    </div>
  );
}
