"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, XCircle, History, Download } from "lucide-react";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { useTeacherHistory } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import type { TeacherHistoryItem } from "@/lib/types/teacher";
import { HistoryDetailDrawer } from "@/components/teacher/HistoryDetailDrawer";

const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const DECISION_OPTIONS = [
  { value: "all", label: "All decisions" },
  { value: "approve", label: "Approved" },
  { value: "override", label: "Overridden" },
  { value: "escalate", label: "Escalated" },
];

const columnHelper = createColumnHelper<TeacherHistoryItem>();

const decisionBadge = (decision: TeacherHistoryItem["decision"]) => {
  if (decision === "approve") return { className: "bg-green-50 text-green-700 border-green-200", label: "Approved" };
  if (decision === "override") return { className: "bg-amber-50 text-amber-700 border-amber-200", label: "Overridden" };
  return { className: "bg-red-50 text-red-700 border-red-200", label: "Escalated" };
};

function exportCsv(items: TeacherHistoryItem[]) {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["Submission", "Submitted", "Decision", "AI Score", "Corrected", "Score Change", "Agreed with AI"]
    .map(q)
    .join(",");
  const rows = items.map((item) => {
    const delta = item.correctedScore - item.originalScore;
    const deltaStr = delta === 0 ? "0" : delta > 0 ? `+${delta}` : `${delta}`;
    return [
      q(item.id),
      q(new Date(item.submittedAt).toLocaleDateString("en-AU", { day: "2-digit", month: "2-digit", year: "numeric" })),
      q(item.decision),
      item.originalScore,
      item.correctedScore,
      q(deltaStr),
      q(item.agreementWithAi ? "Yes" : "No"),
    ].join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `review-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TeacherHistoryPage() {
  usePageTitle("Review History");

  const [range, setRange] = useState("7d");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: history, isLoading, error, refetch } = useTeacherHistory(range);

  const columns = [
    columnHelper.accessor("id", {
      header: SortHeader("Submission"),
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor("submittedAt", {
      header: SortHeader("Submitted"),
      cell: (info) => (
        <span className="text-sm text-muted-foreground">
          {new Date(info.getValue()).toLocaleDateString("en-AU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    }),
    columnHelper.accessor("decision", {
      header: SortHeader("Decision"),
      cell: (info) => {
        const badge = decisionBadge(info.getValue());
        return (
          <Badge variant="outline" className={`text-xs ${badge.className}`}>
            {badge.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("originalScore", {
      header: SortHeader("AI Score"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("correctedScore", {
      header: SortHeader("Corrected"),
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.correctedScore - row.originalScore, {
      id: "scoreChange",
      header: SortHeader("Score change"),
      cell: (info) => {
        const scoreDelta = info.getValue();
        return scoreDelta === 0 ? (
          <span className="text-muted-foreground text-sm">—</span>
        ) : (
          <span
            className={`text-sm font-medium ${scoreDelta > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {scoreDelta > 0 ? "+" : ""}
            {scoreDelta}
          </span>
        );
      },
    }),
    columnHelper.accessor("agreementWithAi", {
      header: SortHeader("Agreed with AI"),
      cell: (info) =>
        info.getValue() ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        ),
    }),
  ];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load history</p>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const total = history?.length ?? 0;
  const agreementCount = history?.filter((h) => h.agreementWithAi).length ?? 0;
  const agreementPct = total > 0 ? Math.round((agreementCount / total) * 100) : 0;

  const filtered = history
    ? decisionFilter === "all"
      ? history
      : history.filter((h) => h.decision === decisionFilter)
    : [];

  const handleRangeChange = (v: string) => setRange(v);
  const handleDecisionChange = (v: string) => setDecisionFilter(v);

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Review History</h1>
            <p className="text-muted-foreground">
              {total} review{total !== 1 ? "s" : ""} · {agreementPct}% agreed with AI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={decisionFilter} onValueChange={handleDecisionChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECISION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {history && history.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportCsv(filtered)}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filtered}
            enableSearch={false}
            isLoading={isLoading}
            onRowClick={(row) => setOpenId(row.id)}
            emptyMessage={
              history && history.length > 0
                ? "No reviews match the selected filters."
                : "No review history in the selected range."
            }
          />
        </CardContent>
      </Card>

      <HistoryDetailDrawer attemptId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
