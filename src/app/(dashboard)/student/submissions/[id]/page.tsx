"use client";

import { ArrowLeft, Loader2, AlertCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useStudentSubmission } from "@/lib/api/student-submissions";
import { HybridMarkingBadge } from "@/components/marking/HybridMarkingBadge";
import { ConfidenceMeter } from "@/components/marking/ConfidenceMeter";
import { MarkingSourceTimeline } from "@/components/marking/MarkingSourceTimeline";
import { RubricChecklist } from "@/components/marking/RubricChecklist";
import { ErrorTagPicker } from "@/components/marking/ErrorTagPicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Separator } from "@/components/dashboard/ui/separator";

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  reviewed: "Reviewed",
  approved: "Approved",
  overridden: "Overridden",
  escalated: "Escalated",
};

export default function StudentSubmissionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, isLoading, error, refetch } = useStudentSubmission(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Failed to load submission.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm underline hover:text-foreground"
        >
          Retry
        </button>
      </div>
    );
  }

  const { submission, question, studentAnswer, rubric, aiMarking, flags, humanReviewPending } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <div>
        <Link
          href="/student/practice"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Practice
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Submission Review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submission.submittedAt
              ? new Date(submission.submittedAt).toLocaleString("en-AU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : ""}
          </p>
        </div>
        <Badge variant={submission.status === "pending_review" ? "outline" : "secondary"}>
          {STATUS_LABELS[submission.status] ?? submission.status}
        </Badge>
      </div>

      {/* Pending review banner */}
      {humanReviewPending && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          <Clock className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong>Đang chờ giáo viên xem xét.</strong> Điểm hiển thị là kết quả AI tạm thời và có thể thay đổi.
          </span>
        </div>
      )}

      {/* Flags */}
      {flags?.length > 0 && (
        <div className="space-y-1">
          {flags.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{f.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column: Question + Student Answer + Rubric */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{question.prompt}</p>
              {question.maxScore != null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Max score: {question.maxScore}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentAnswer.text && (
                <p className="whitespace-pre-wrap text-sm">{studentAnswer.text}</p>
              )}
              {studentAnswer.working && studentAnswer.working.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Working steps</p>
                  {studentAnswer.working.map((w) => (
                    <div
                      key={w.step}
                      className="rounded bg-muted/50 px-2 py-1 font-mono text-xs"
                    >
                      {w.step}. {w.latex}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {rubric && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <RubricChecklist
                  rubric={rubric}
                  perCriterion={aiMarking.perCriterion}
                  editable={false}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: AI Marking Results */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Marking Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score chip */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold">
                  {aiMarking.finalScore}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}/ {question.maxScore ?? aiMarking.finalScore}
                  </span>
                </span>
                <HybridMarkingBadge source={aiMarking.routingDecision.chosenSource} />
              </div>

              <Separator />

              {/* Confidence */}
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">AI Confidence</p>
                <ConfidenceMeter value={aiMarking.finalConfidence} />
              </div>

              {/* Error tags */}
              {aiMarking.errorTags?.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">Detected Issues</p>
                  <ErrorTagPicker
                    available={aiMarking.errorTags}
                    value={aiMarking.errorTags.map((t) => t.tagCode)}
                    readOnly
                  />
                </div>
              )}

              <Separator />

              {/* Marking sources */}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Marking Sources</p>
                <MarkingSourceTimeline
                  sources={aiMarking.sources}
                  routingDecision={aiMarking.routingDecision}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
