"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Filter, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useReviewQueue, type ReviewQueueFilters } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ReviewQueueItem } from "@/lib/types/review";

const REASON_OPTIONS = [
  { value: "all", label: "All reasons" },
  { value: "ensemble_divergence", label: "Ensemble divergence" },
  { value: "low_overall_confidence", label: "Low confidence" },
  { value: "escalated", label: "Escalated" },
];

const confidenceBadge = (level: ReviewQueueItem["confidenceLevel"]) => {
  if (level === "low") return { variant: "destructive" as const, label: "Low" };
  if (level === "medium") return { variant: "secondary" as const, label: "Medium" };
  return { variant: "outline" as const, label: "High" };
};

const reasonLabel = (reason: string) =>
  REASON_OPTIONS.find((o) => o.value === reason)?.label ?? reason;

const columnHelper = createColumnHelper<ReviewQueueItem>();

export default function TeacherReviewQueuePage() {
  usePageTitle("Review Queue");

  const [subject, setSubject] = useState("");
  const [minConf, setMinConf] = useState("");
  const [maxConf, setMaxConf] = useState("");
  const [reason, setReason] = useState("all");
  const [page, setPage] = useState(1);

  const filters: ReviewQueueFilters = {
    ...(subject.trim() && { subject: subject.trim() }),
    ...(minConf !== "" && { minConfidence: Number(minConf) / 100 }),
    ...(maxConf !== "" && { maxConfidence: Number(maxConf) / 100 }),
    ...(reason !== "all" && { reason }),
    page,
  };

  const { data, isLoading, error, refetch } = useReviewQueue(filters);

  const hasFilters = !!(subject || minConf || maxConf || reason !== "all");

  const columns = [
    columnHelper.accessor("studentName", {
      header: SortHeader("Student"),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor("subject", {
      header: SortHeader("Subject"),
    }),
    columnHelper.accessor("questionType", {
      header: SortHeader("Type"),
      cell: (info) => <span className="capitalize">{info.getValue().replace("_", " ")}</span>,
    }),
    columnHelper.accessor((row) => row.aiScore, {
      id: "aiScore",
      header: SortHeader("AI Score"),
      cell: (info) => {
        const item = info.row.original;
        return `${item.aiScore}/${item.maxScore}`;
      },
    }),
    columnHelper.accessor("aiConfidence", {
      header: SortHeader("Confidence"),
      cell: (info) => {
        const item = info.row.original;
        const badge = confidenceBadge(item.confidenceLevel);
        return (
          <Badge variant={badge.variant} className="text-xs">
            {badge.label} ({(item.aiConfidence * 100).toFixed(0)}%)
          </Badge>
        );
      },
    }),
    columnHelper.accessor("reason", {
      header: SortHeader("Reason"),
      cell: (info) => (
        <span className="text-sm text-muted-foreground">{reasonLabel(info.getValue())}</span>
      ),
    }),
    columnHelper.accessor("submittedAt", {
      header: SortHeader("Submitted"),
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {new Date(info.getValue()).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    }),
    columnHelper.display({
      id: "action",
      header: () => <span className="sr-only">Action</span>,
      enableSorting: false,
      cell: (info) => (
        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link href={`/teacher/review/${info.row.original.id}`} className="flex items-center gap-1">
              Open <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      ),
    }),
  ];

  const handleClearFilters = () => {
    setSubject("");
    setMinConf("");
    setMaxConf("");
    setReason("all");
    setPage(1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load review queue</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
        <p className="text-muted-foreground">
          {data ? `${data.total} submission${data.total !== 1 ? "s" : ""} awaiting review` : "Loading…"}
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="subject-filter">Subject</Label>
              <Input
                id="subject-filter"
                placeholder="e.g. Math Methods"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="min-conf">Min confidence (%)</Label>
              <Input
                id="min-conf"
                type="number"
                min="0"
                max="100"
                step="5"
                placeholder="0"
                value={minConf}
                onChange={(e) => { setMinConf(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-conf">Max confidence (%)</Label>
              <Input
                id="max-conf"
                type="number"
                min="0"
                max="100"
                step="5"
                placeholder="100"
                value={maxConf}
                onChange={(e) => { setMaxConf(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => { setReason(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All reasons" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            hidePageSize
            emptyMessage={
              hasFilters
                ? "No submissions match the current filters."
                : "No submissions are waiting for review."
            }
            server={{
              total: data?.total ?? 0,
              pageIndex: page - 1,
              pageSize: data?.pageSize ?? 10,
              onPaginationChange: ({ pageIndex }) => setPage(pageIndex + 1),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
