"use client";

import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle, History } from "lucide-react";
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

const decisionBadge = (decision: TeacherHistoryItem["decision"]) => {
  if (decision === "approve") return { variant: "outline" as const, label: "Approved" };
  if (decision === "override") return { variant: "secondary" as const, label: "Overridden" };
  return { variant: "destructive" as const, label: "Escalated" };
};

export default function TeacherHistoryPage() {
  usePageTitle("Review History");

  const [range, setRange] = useState("7d");
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

  const agreementCount = history?.filter((h) => h.agreementWithAi).length ?? 0;
  const total = history?.length ?? 0;
  const agreementPct = total > 0 ? Math.round((agreementCount / total) * 100) : 0;

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
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No review history in the selected range.
            </div>
          ) : (
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
                {history.map((item) => {
                  const badge = decisionBadge(item.decision);
                  const scoreDelta = item.correctedScore - item.originalScore;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.submittedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className="text-xs">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
