"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle, History, Download } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { useTeacherHistory } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import type { TeacherHistoryItem } from "@/lib/types/teacher";

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

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(1);
  const { data: history, isLoading, error, refetch } = useTeacherHistory(range);

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

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRangeChange = (v: string) => { setRange(v); setPage(1); };
  const handleDecisionChange = (v: string) => { setDecisionFilter(v); setPage(1); };

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
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              {history && history.length > 0
                ? "No reviews match the selected filters."
                : "No review history in the selected range."}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Corrected</TableHead>
                    <TableHead>Score change</TableHead>
                    <TableHead>Agreed with AI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((item) => {
                    const badge = decisionBadge(item.decision);
                    const scoreDelta = item.correctedScore - item.originalScore;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">{item.id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.submittedAt).toLocaleDateString("en-AU", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${badge.className}`}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.originalScore}</TableCell>
                        <TableCell>{item.correctedScore}</TableCell>
                        <TableCell>
                          {scoreDelta === 0 ? (
                            <span className="text-muted-foreground text-sm">—</span>
                          ) : (
                            <span
                              className={`text-sm font-medium ${
                                scoreDelta > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {scoreDelta > 0 ? "+" : ""}
                              {scoreDelta}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.agreementWithAi ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {pageCount > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
                  <span>
                    Page {currentPage} of {pageCount} · {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
