"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowUpCircle,
} from "lucide-react";
import { toast } from "@/components/dashboard/ui/sonner";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Badge } from "@/components/dashboard/ui/badge";
import { Separator } from "@/components/dashboard/ui/separator";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { Label } from "@/components/dashboard/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { useSubmissionFull, useSubmitTeacherCorrection } from "@/lib/api/teacher";
import { usePageTitle } from "@/lib/usePageTitle";
import { HybridMarkingBadge } from "@/components/marking/HybridMarkingBadge";
import { ConfidenceMeter } from "@/components/marking/ConfidenceMeter";
import { MarkingSourceTimeline } from "@/components/marking/MarkingSourceTimeline";
import { RubricChecklist } from "@/components/marking/RubricChecklist";
import { ErrorTagPicker } from "@/components/marking/ErrorTagPicker";
import { ScoreOverrideInput } from "@/components/marking/ScoreOverrideInput";
import type { ReviewDecisionType } from "@aitutor/shared";

type Decision = ReviewDecisionType;

const DECISION_CONFIG: Record<
  Decision,
  { label: string; variant: "default" | "outline" | "destructive" | "secondary"; icon: React.ReactNode; description: string }
> = {
  approve: {
    label: "Approve",
    variant: "default",
    icon: <CheckCircle className="h-4 w-4" />,
    description: "Accept the AI score as-is. No changes to the student's result.",
  },
  override: {
    label: "Override",
    variant: "secondary",
    icon: <AlertTriangle className="h-4 w-4" />,
    description: "Replace the AI score with your corrected score. Student's result will be updated.",
  },
  escalate: {
    label: "Escalate",
    variant: "destructive",
    icon: <ArrowUpCircle className="h-4 w-4" />,
    description: "Flag this submission for admin review. Score will not change yet.",
  },
};

export default function AnnotationWorkspacePage({
  params,
}: {
<<<<<<<< HEAD:apps/web/src/app/(dashboard)/teacher/review/[submissionId]/page.tsx
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
========
  params: { attemptId: string };
}) {
  const { attemptId } = params;
>>>>>>>> origin/main:src/app/(dashboard)/teacher/review/[attemptId]/page.tsx
  usePageTitle("Annotation Workspace");
  const router = useRouter();

  const { data, isLoading, error, refetch } = useSubmissionFull(attemptId);
  const mutation = useSubmitTeacherCorrection(attemptId);

  // Form state
  const [criterionOverrides, setCriterionOverrides] = useState<Record<string, number>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState<number | "">("");
  const [comment, setComment] = useState("");

  // Confirm dialog
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);

  const initialTagsRef = useRef<string[]>([]);

  // Pre-seed from AI marking once data loads
  useEffect(() => {
    if (!data) return;
    setFinalScore(data.aiMarking.finalScore);
    const tags = data.aiMarking.errorTags.map((t) => t.tagCode);
    setSelectedTags(tags);
    initialTagsRef.current = tags;
  }, [data]);

  const isDirty =
    data != null &&
    (finalScore !== data.aiMarking.finalScore ||
      comment.trim() !== "" ||
      Object.keys(criterionOverrides).length > 0 ||
      JSON.stringify([...selectedTags].sort()) !==
        JSON.stringify([...initialTagsRef.current].sort()));

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleCriterionChange = (criterionId: string, score: number) => {
    setCriterionOverrides((prev) => ({ ...prev, [criterionId]: score }));
  };

  const openConfirm = (decision: Decision) => {
    if (decision === "override" && finalScore === "") {
      toast.error("Please enter a corrected score before overriding.");
      return;
    }
    setPendingDecision(decision);
  };

  const handleConfirm = async () => {
    if (!pendingDecision || !data) return;
    const aiScore = data.aiMarking.finalScore;
    const correctedScore =
      pendingDecision === "approve"
        ? aiScore
        : finalScore !== ""
        ? (finalScore as number)
        : aiScore;

    try {
      await mutation.mutateAsync({
        correctedScore,
        criterionOverrides,
        errorTags: selectedTags,
        comment,
        decision: pendingDecision,
      });
      toast.success(
        pendingDecision === "approve"
          ? "Submission approved."
          : pendingDecision === "override"
          ? "Score overridden successfully."
          : "Submission escalated."
      );
      router.push("/teacher/review");
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setPendingDecision(null);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-muted-foreground">Failed to load submission</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { submission, question, studentAnswer, rubric, aiMarking, flags } = data;
  const maxScore = question.maxScore;
  const aiScore = aiMarking.finalScore;
  const confPct = Math.round(aiMarking.finalConfidence * 100);

  return (
    <div className="p-6 pb-20 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          onClick={() => {
            if (isDirty && !window.confirm("You have unsaved changes. Leave without reviewing?")) return;
            router.push("/teacher/review");
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Queue
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">
            Review — {submission.studentName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {question.type.replace("_", " ")} · {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("en-AU") : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HybridMarkingBadge source={aiMarking.routingDecision.chosenSource} />
          <Badge variant={confPct < 50 ? "destructive" : confPct < 75 ? "secondary" : "outline"}>
            {confPct}% confidence
          </Badge>
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {flags.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 rounded-md border border-yellow-300 bg-yellow-50 px-2.5 py-1 text-xs text-yellow-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              {f.message}
            </div>
          ))}
        </div>
      )}

      {/* 3-column workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Column 1: Question + Student Answer ─────────────── */}
        <div className="space-y-4">
          {/* Question */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm whitespace-pre-wrap">{question.questionText}</p>
              {question.expectedAnswer && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Expected</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {question.expectedAnswer}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Student Answer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Student Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentAnswer.text && (
                <p className="text-sm whitespace-pre-wrap">{studentAnswer.text}</p>
              )}
              {studentAnswer.ocrText && studentAnswer.ocrText !== studentAnswer.text && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">OCR</p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {studentAnswer.ocrText}
                  </p>
                </div>
              )}
              {studentAnswer.working && studentAnswer.working.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Working</p>
                  <ol className="space-y-1">
                    {studentAnswer.working.map((w) => (
                      <li key={w.step} className="text-sm font-mono bg-muted rounded px-2 py-1">
                        {w.step}. {w.latex}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rubric read-only */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rubric (AI view)</CardTitle>
            </CardHeader>
            <CardContent>
              <RubricChecklist
                rubric={rubric}
                perCriterion={aiMarking.perCriterion}
                editable={false}
              />
            </CardContent>
          </Card>
        </div>

        {/* ── Column 2: AI Marking Analysis ───────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Marking Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score + Confidence */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">AI Score</p>
                  <p className="text-3xl font-bold tabular-nums">
                    {aiScore}
                    <span className="text-base font-normal text-muted-foreground">
                      /{maxScore}
                    </span>
                  </p>
                </div>
                <HybridMarkingBadge source={aiMarking.routingDecision.chosenSource} />
              </div>

              <ConfidenceMeter value={aiMarking.finalConfidence} />

              <Separator />

              {/* Sources */}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Marking Sources
                </p>
                <MarkingSourceTimeline
                  sources={aiMarking.sources}
                  routingDecision={aiMarking.routingDecision}
                />
              </div>

              <Separator />

              {/* Error tags (read-only) */}
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  AI-detected Error Tags
                </p>
                <ErrorTagPicker
                  available={aiMarking.errorTags}
                  value={aiMarking.errorTags.map((t) => t.tagCode)}
                  readOnly
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Column 3: Review Form ────────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Score override */}
              <ScoreOverrideInput
                aiScore={aiScore}
                maxScore={maxScore}
                value={finalScore}
                onChange={setFinalScore}
              />

              <Separator />

              {/* Criterion overrides */}
              <div>
                <Label className="text-sm font-medium">Criterion Scores</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Override per-criterion (optional)
                </p>
                <RubricChecklist
                  rubric={rubric}
                  perCriterion={aiMarking.perCriterion}
                  editable
                  value={criterionOverrides}
                  onChange={handleCriterionChange}
                />
              </div>

              <Separator />

              {/* Error tags editable */}
              <div>
                <Label className="text-sm font-medium">Error Tags</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Toggle or add tags
                </p>
                <ErrorTagPicker
                  available={aiMarking.errorTags}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  allowCustom
                />
              </div>

              <Separator />

              {/* Comment */}
              <div className="space-y-1.5">
                <Label htmlFor="review-comment" className="text-sm font-medium">
                  Comment <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="review-comment"
                  placeholder="Reasoning for your decision…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <Separator />

              {/* Decision buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Decision</Label>
                <div className="flex flex-col gap-3">
                  {(["approve", "override", "escalate"] as Decision[]).map((dec) => {
                    const cfg = DECISION_CONFIG[dec];
                    return (
                      <div key={dec} className="space-y-1">
                        <Button
                          variant={cfg.variant}
                          className="w-full justify-start gap-2"
                          onClick={() => openConfirm(dec)}
                          disabled={mutation.isPending}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Button>
                        <p className="text-xs text-muted-foreground px-1">{cfg.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      {pendingDecision && (
        <Dialog open onOpenChange={(open) => !open && setPendingDecision(null)}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {DECISION_CONFIG[pendingDecision].icon}
                {DECISION_CONFIG[pendingDecision].label} Submission
              </DialogTitle>
              <DialogDescription>
                {DECISION_CONFIG[pendingDecision].description}
                {pendingDecision === "override" && finalScore !== "" && (
                  <span className="block mt-2 font-medium text-foreground">
                    New score: {finalScore} / {maxScore}{" "}
                    <span className="text-muted-foreground font-normal">
                      (was {aiScore})
                    </span>
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setPendingDecision(null)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={DECISION_CONFIG[pendingDecision].variant}
                onClick={handleConfirm}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  `Confirm ${DECISION_CONFIG[pendingDecision].label}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
