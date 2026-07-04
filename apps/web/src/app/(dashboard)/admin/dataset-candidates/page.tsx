"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "@/components/dashboard/ui/sonner";
import { Loader2, AlertCircle, ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";
import {
  useDatasetCandidates,
  useValidateDatasetCandidate,
  type CandidateStatusFilter,
} from "@/lib/api/admin-dataset-candidates";
import type {
  DatasetCandidate,
  DatasetCandidateStatus,
} from "@/lib/types/dataset";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { label: string; value: CandidateStatusFilter }[] = [
  { label: "Candidate", value: "CANDIDATE" },
  { label: "Validated", value: "VALIDATED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Promoted", value: "PROMOTED" },
  { label: "All", value: "all" },
];

// Solid badge fills (white text), not faded tints — matches the admin StatusBadge convention.
const STATUS_BADGE: Record<DatasetCandidateStatus, string> = {
  CANDIDATE: "bg-amber-500 text-white",
  VALIDATED: "bg-emerald-600 text-white",
  REJECTED: "bg-red-600 text-white",
  PROMOTED: "bg-blue-600 text-white",
};

function StatusBadge({ status }: { status: DatasetCandidateStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STATUS_BADGE[status],
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

function formatScore(c: DatasetCandidate) {
  if (c.score == null && c.maxScore == null) return "—";
  return `${c.score ?? "—"} / ${c.maxScore ?? "—"}`;
}

function formatConfidence(value: number | null) {
  if (value == null) return "—";
  return `${Math.round(value * 100)}%`;
}

const columnHelper = createColumnHelper<DatasetCandidate>();

export default function AdminDatasetCandidatesPage() {
  const [status, setStatus] = useState<CandidateStatusFilter>("CANDIDATE");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error, refetch } = useDatasetCandidates(page, status);

  const validate = useValidateDatasetCandidate();

  // Review dialog state.
  const [selected, setSelected] = useState<DatasetCandidate | null>(null);
  const [reviewerName, setReviewerName] = useState("");
  const [source, setSource] = useState<"OWNER_REVIEW" | "EXPERT_REVIEW">("OWNER_REVIEW");
  const [rejectionReason, setRejectionReason] = useState("");

  function openReview(candidate: DatasetCandidate) {
    setSelected(candidate);
    setReviewerName(candidate.reviewerName ?? "");
    setSource(candidate.source === "EXPERT_REVIEW" ? "EXPERT_REVIEW" : "OWNER_REVIEW");
    setRejectionReason(candidate.rejectionReason ?? "");
  }

  function closeReview() {
    setSelected(null);
  }

  function submitDecision(decision: "VALIDATED" | "REJECTED") {
    if (!selected) return;
    if (!reviewerName.trim()) {
      toast.error("Reviewer name is required");
      return;
    }
    if (decision === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    validate.mutate(
      {
        id: selected.id,
        payload:
          decision === "VALIDATED"
            ? { status: "VALIDATED", source, reviewerName: reviewerName.trim() }
            : {
                status: "REJECTED",
                reviewerName: reviewerName.trim(),
                rejectionReason: rejectionReason.trim(),
              },
      },
      {
        onSuccess: () => {
          toast.success(
            decision === "VALIDATED"
              ? "Candidate validated"
              : "Candidate rejected",
          );
          closeReview();
        },
        onError: () => toast.error("Failed to save review decision"),
      },
    );
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor("questionId", {
        header: SortHeader("Question"),
        enableSorting: false,
        cell: (info) => {
          const c = info.row.original;
          return (
            <div className="flex flex-col">
              <span className="font-medium">#{c.questionId}</span>
              <span className="text-xs text-muted-foreground">
                {[c.question?.subjectCode, c.question?.topicCode]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("source", {
        header: "Source",
        enableSorting: false,
        cell: (info) => (
          <span className="text-xs font-mono">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        enableSorting: false,
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "score",
        header: "Score",
        cell: (info) => (
          <span className="text-sm tabular-nums">{formatScore(info.row.original)}</span>
        ),
      }),
      columnHelper.accessor("confidence", {
        header: "Confidence",
        enableSorting: false,
        cell: (info) => (
          <span className="text-sm tabular-nums">{formatConfidence(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created",
        enableSorting: false,
        cell: (info) => (
          <span className="text-xs text-muted-foreground">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "action",
        header: () => <span className="sr-only">Action</span>,
        cell: (info) => (
          <Button size="sm" variant="outline" onClick={() => openReview(info.row.original)}>
            <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
            Review
          </Button>
        ),
      }),
    ],
    [],
  );

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load dataset candidates</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pageSize = data?.pageSize ?? 25;
  const isPromoted = selected?.status === "PROMOTED";

  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dataset Candidates</h1>
        <p className="text-muted-foreground">
          Review candidate rows from student practice and validate them for training datasets.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Candidates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isFetching}
            emptyMessage="No candidates for this status."
            server={{
              total,
              pageIndex: page - 1,
              pageSize,
              onPaginationChange: ({ pageIndex }) => setPage(pageIndex + 1),
            }}
            hidePageSize
            toolbar={
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value as CandidateStatusFilter);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeReview()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Candidate</DialogTitle>
            <DialogDescription>
              Validate to mark this candidate eligible for the next dataset build, or reject it.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Question</span>
                  <p className="font-medium">
                    #{selected.questionId}
                    {selected.question?.subjectCode
                      ? ` · ${selected.question.subjectCode}`
                      : ""}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current status</span>
                  <p>
                    <StatusBadge status={selected.status} />
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Score</span>
                  <p className="tabular-nums">{formatScore(selected)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Confidence</span>
                  <p className="tabular-nums">{formatConfidence(selected.confidence)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Normalized answer
                </span>
                <pre className="max-h-32 overflow-auto rounded-md border bg-muted/40 p-2 text-xs whitespace-pre-wrap">
                  {selected.normalizedAnswer || "—"}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Expected answer
                </span>
                <pre className="max-h-32 overflow-auto rounded-md border bg-muted/40 p-2 text-xs whitespace-pre-wrap">
                  {selected.expectedAnswer || "—"}
                </pre>
              </div>

              {selected.errorTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selected.errorTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-slate-700 px-1.5 py-0.5 text-xs text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {isPromoted && (
                <p className="flex items-center gap-2 rounded-md bg-blue-50 p-2 text-xs text-blue-700">
                  <AlertCircle className="h-4 w-4" />
                  This candidate is already promoted into a dataset. Re-deciding will not remove it
                  from the built dataset.
                </p>
              )}

              <div className="space-y-2 border-t pt-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Reviewer name *</label>
                  <Input
                    placeholder="Your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Review source</label>
                  <Select
                    value={source}
                    onValueChange={(value) =>
                      setSource(value as "OWNER_REVIEW" | "EXPERT_REVIEW")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER_REVIEW">Owner review</SelectItem>
                      <SelectItem value="EXPERT_REVIEW">Expert review</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Applied when validating. Both owner-approved and expert-reviewed candidates are
                    eligible for dataset builds.
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Rejection reason</label>
                  <Textarea
                    placeholder="Required when rejecting"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeReview} disabled={validate.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => submitDecision("REJECTED")}
              disabled={validate.isPending}
            >
              {validate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject
            </Button>
            <Button onClick={() => submitDecision("VALIDATED")} disabled={validate.isPending}>
              {validate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Validate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
