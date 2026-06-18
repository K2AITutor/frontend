"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileX2, ArrowRight, Search } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Input } from "@/components/dashboard/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { toast } from "@/components/dashboard/ui/sonner";
import {
  useStudentSubmissions,
  type StudentSubmissionListItem,
  type SubmissionStatus,
} from "@/lib/api/student-submissions";
import { usePracticeSubjects } from "@/lib/api/subjects";

// Mirror STATUS_CONFIG from submissions/[id]/page.tsx so the badge styling is
// consistent between the list and the detail screen. Use solid, high-contrast
// fills (not low-opacity tints) so the status reads clearly — matching the
// admin content badges.
const STATUS_CONFIG: Record<SubmissionStatus, { label: string; classes: string }> = {
  pending_review: { label: "Pending Review", classes: "border-transparent bg-amber-500 text-white" },
  reviewed: { label: "Reviewed", classes: "border-transparent bg-sky-600 text-white" },
  approved: { label: "Approved", classes: "border-transparent bg-emerald-600 text-white" },
  overridden: { label: "Overridden", classes: "border-transparent bg-violet-600 text-white" },
  escalated: { label: "Escalated", classes: "border-transparent bg-red-600 text-white" },
};

// Score colour mirrors the detail page: >=100% emerald, >0% amber, =0 red.
function scoreClasses(percent: number | null, awarded: number): string {
  if (percent === null) return awarded > 0 ? "text-amber-600" : "text-red-600";
  if (percent >= 100) return "text-emerald-600";
  if (percent > 0) return "text-amber-600";
  return "text-red-600";
}

const DATE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

// Statuses the backend can actually return (mapped from teacher corrections).
const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending_review", label: "Pending Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "overridden", label: "Overridden" },
  { value: "escalated", label: "Escalated" },
];

const SCORE_OPTIONS = [
  { value: "all", label: "All scores" },
  { value: "correct", label: "Correct" },
  { value: "partial", label: "Partial" },
  { value: "incorrect", label: "Incorrect" },
];

const columnHelper = createColumnHelper<StudentSubmissionListItem>();

const PAGE_SIZE = 10;

export function SubmissionsListClient() {
  const [page, setPage] = useState(1);
  const [subject, setSubject] = useState<string>("all"); // slug or "all"
  const [status, setStatus] = useState<string>("all");
  const [score, setScore] = useState<string>("all");
  const [question, setQuestion] = useState<string>(""); // free-text search
  const [dateRange, setDateRange] = useState<string>("all");

  const { data, isLoading, error, refetch } = useStudentSubmissions({
    page,
    pageSize: PAGE_SIZE,
    subject,
    status,
    score,
    question,
    dateRange,
  });

  // Subject dropdown options reuse the Phase 2 personalized catalog.
  const { data: catalog } = usePracticeSubjects();
  const subjectOptions = useMemo(
    () => catalog?.subjects?.map((s) => ({ value: s.slug, label: s.name })) ?? [],
    [catalog],
  );

  // One error toast per failed load (CODING_STANDARDS: pair feedback with errors).
  useEffect(() => {
    if (error) {
      toast.error("Could not load your submissions. Please try again.");
    }
  }, [error]);

  // Any filter changing must reset to page 1, otherwise the current page can
  // land beyond the filtered result's page count and render empty.
  const setFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const anyFilterActive =
    subject !== "all" ||
    status !== "all" ||
    score !== "all" ||
    dateRange !== "all" ||
    question.trim() !== "";

  const items = data?.items ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: SortHeader("Title"),
        cell: (info) => {
          const item = info.row.original;
          return (
            <Link
              href={`/student/submissions/${item.id}`}
              className="block max-w-md truncate font-medium text-foreground hover:text-primary hover:underline"
              title={item.title}
            >
              {item.title}
            </Link>
          );
        },
      }),
      columnHelper.accessor("subjectName", {
        header: SortHeader("Subject"),
        cell: (info) => (
          <Badge variant="outline" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor((row) => row.score.percent ?? -1, {
        id: "score",
        header: SortHeader("Score"),
        cell: (info) => {
          const { score } = info.row.original;
          return (
            <span className={`text-sm font-semibold tabular-nums ${scoreClasses(score.percent, score.awarded)}`}>
              {score.awarded}/{score.max}
              {score.percent !== null && (
                <span className="ml-1 font-normal text-muted-foreground">({score.percent}%)</span>
              )}
            </span>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: SortHeader("Status"),
        cell: (info) => {
          const status = info.getValue();
          const cfg = STATUS_CONFIG[status] ?? {
            label: status,
            classes: "border-transparent bg-slate-500 text-white",
          };
          return (
            <Badge variant="outline" className={`text-xs ${cfg.classes}`}>
              {cfg.label}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("submittedAt", {
        header: SortHeader("Submitted"),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {new Date(info.getValue()).toLocaleString("en-AU", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        ),
      }),
    ],
    [],
  );

  // Error state: never leave a blank screen — show a retry affordance.
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load your submission history.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  // Full-page empty state ONLY when the user genuinely has no submissions — i.e.
  // no filter is active. When a filter is active and the result is empty, we keep
  // the table + filters mounted and show an in-table "no data" message instead.
  if (!isLoading && !anyFilterActive && data && data.total === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border">
        <FileX2 className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No submissions yet.</p>
        <Link href="/student/practice">
          <Button className="gap-2">
            Start practicing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">Your Submissions</CardTitle>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Search and filter your past practice submissions, scores, and review status.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search questions…"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setPage(1);
                }}
                className="bg-muted/50 pl-9"
              />
            </div>

            <Select value={subject} onValueChange={setFilter(setSubject)}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjectOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setFilter(setStatus)}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={score} onValueChange={setFilter(setScore)}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue placeholder="All scores" />
              </SelectTrigger>
              <SelectContent>
                {SCORE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setFilter(setDateRange)}>
              <SelectTrigger className="w-full bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
          hidePageSize
          emptyMessage={
            anyFilterActive
              ? "No submissions match the selected filters."
              : "No submissions yet."
          }
          server={{
            total: data?.total ?? 0,
            pageIndex: (data?.page ?? page) - 1,
            pageSize: PAGE_SIZE,
            onPaginationChange: ({ pageIndex }) => setPage(pageIndex + 1),
          }}
        />
      </CardContent>
    </Card>
  );
}
