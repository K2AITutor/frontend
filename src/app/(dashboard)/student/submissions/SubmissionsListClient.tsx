"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileX2, ArrowRight } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
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
// consistent between the list and the detail screen.
const STATUS_CONFIG: Record<SubmissionStatus, { label: string; classes: string }> = {
  pending_review: { label: "Pending Review", classes: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  reviewed: { label: "Reviewed", classes: "bg-sky-500/15 text-sky-700 border-sky-500/30" },
  approved: { label: "Approved", classes: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  overridden: { label: "Overridden", classes: "bg-violet-500/15 text-violet-700 border-violet-500/30" },
  escalated: { label: "Escalated", classes: "bg-red-500/15 text-red-700 border-red-500/30" },
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

const columnHelper = createColumnHelper<StudentSubmissionListItem>();

const PAGE_SIZE = 10;

export function SubmissionsListClient() {
  const [page, setPage] = useState(1);
  const [subject, setSubject] = useState<string>("all"); // slug or "all"
  const [dateRange, setDateRange] = useState<string>("all"); // client-side

  const { data, isLoading, error, refetch } = useStudentSubmissions({
    page,
    pageSize: PAGE_SIZE,
    subject: subject === "all" ? undefined : subject,
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

  // Client-side date filter applies only to the current server page's items.
  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (dateRange === "all") return items;
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return items.filter((item) => new Date(item.submittedAt).getTime() >= cutoff);
  }, [data, dateRange]);

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
            classes: "bg-slate-500/15 text-slate-600 border-slate-500/30",
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

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setPage(1);
  };

  const handleDateChange = (value: string) => {
    setDateRange(value);
  };

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

  // Empty state (no submissions for this user) — only when the unfiltered list
  // is genuinely empty, not when the local date filter hid everything.
  if (!isLoading && data && data.total === 0) {
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

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Select value={subject} onValueChange={handleSubjectChange}>
        <SelectTrigger className="w-full bg-muted/50 sm:w-[200px]">
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
      <Select value={dateRange} onValueChange={handleDateChange}>
        <SelectTrigger className="w-full bg-muted/50 sm:w-[170px]">
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
  );

  return (
    <DataTable
      columns={columns}
      data={filteredItems}
      isLoading={isLoading}
      toolbar={toolbar}
      hidePageSize
      emptyMessage={
        dateRange !== "all"
          ? "No submissions in the selected date range."
          : "No submissions match the selected filters."
      }
      server={{
        total: data?.total ?? 0,
        pageIndex: (data?.page ?? page) - 1,
        pageSize: PAGE_SIZE,
        onPaginationChange: ({ pageIndex }) => setPage(pageIndex + 1),
      }}
    />
  );
}
