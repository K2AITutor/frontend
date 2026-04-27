"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Filter, ExternalLink } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { useReviewQueue, type ReviewQueueFilters } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import type { ReviewQueueItem } from "@/lib/types/review";

const REASON_OPTIONS = [
  { value: "", label: "All reasons" },
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

export default function TeacherReviewQueuePage() {
  usePageTitle("Review Queue");

  const [subject, setSubject] = useState("");
  const [minConf, setMinConf] = useState("");
  const [maxConf, setMaxConf] = useState("");
  const [reason, setReason] = useState("");
  const [page, setPage] = useState(1);

  const filters: ReviewQueueFilters = {
    ...(subject.trim() && { subject: subject.trim() }),
    ...(minConf !== "" && { minConfidence: Number(minConf) }),
    ...(maxConf !== "" && { maxConfidence: Number(maxConf) }),
    ...(reason && { reason }),
    page,
  };

  const { data, isLoading, error, refetch } = useReviewQueue(filters);

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  const handleClearFilters = () => {
    setSubject("");
    setMinConf("");
    setMaxConf("");
    setReason("");
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
              <Label htmlFor="min-conf">Min confidence (0–1)</Label>
              <Input
                id="min-conf"
                type="number"
                min="0"
                max="1"
                step="0.05"
                placeholder="0.00"
                value={minConf}
                onChange={(e) => { setMinConf(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-conf">Max confidence (0–1)</Label>
              <Input
                id="max-conf"
                type="number"
                min="0"
                max="1"
                step="0.05"
                placeholder="1.00"
                value={maxConf}
                onChange={(e) => { setMaxConf(e.target.value); setPage(1); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => { setReason(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All reasons" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((o) => (
                    <SelectItem key={o.value || "all"} value={o.value || "all"}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {(subject || minConf || maxConf || reason) && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No submissions match the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => {
                  const badge = confidenceBadge(item.confidenceLevel);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.studentName}</TableCell>
                      <TableCell>{item.subject}</TableCell>
                      <TableCell className="capitalize">
                        {item.questionType.replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        {item.aiScore}/{item.maxScore}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant} className="text-xs">
                          {badge.label} ({(item.aiConfidence * 100).toFixed(0)}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {reasonLabel(item.reason)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.submittedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/teacher/review/${item.id}`} className="flex items-center gap-1">
                            Open <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
