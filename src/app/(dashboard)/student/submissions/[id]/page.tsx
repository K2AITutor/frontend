"use client";

import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
  BookOpenCheck,
} from "lucide-react";
import Link from "next/link";
import { useStudentSubmission } from "@/lib/api/student-submissions";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { RubricChecklist } from "@/components/marking/RubricChecklist";
import MathpixMarkdown from "@/components/practice/MathpixMarkdown";

// Mirror STATUS_CONFIG from the submissions list so the badge styling is
// consistent between the list and the detail screen. Use solid, high-contrast
// fills (not low-opacity tints) so the status reads clearly.
const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending_review: { label: "Pending Review", classes: "border-transparent bg-amber-500 text-white" },
  reviewed:       { label: "Reviewed",        classes: "border-transparent bg-sky-600 text-white" },
  approved:       { label: "Approved",        classes: "border-transparent bg-emerald-600 text-white" },
  overridden:     { label: "Overridden",      classes: "border-transparent bg-violet-600 text-white" },
  escalated:      { label: "Escalated",       classes: "border-transparent bg-red-600 text-white" },
};

// Reused section label styling — matches the uppercase muted headers used
// across the dashboard tables and cards.
const SECTION_LABEL = "mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

// Turn a raw error-tag code (e.g. "sign_error") into a friendly label so the
// student never sees internal codes.
function prettifyTag(code: string): string {
  return code.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function getPath(obj: any, path: string): unknown {
  return path.split(".").reduce((current, part) => current?.[part], obj);
}

function answerDisplay(value: string) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="whitespace-pre-wrap text-base text-foreground">{value}</p>
    </div>
  );
}

function mathDisplay(value: string) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 text-base text-foreground">
      <MathpixMarkdown value={value.includes("\\(") || value.includes("$$") ? value : `\\(${value}\\)`} />
    </div>
  );
}

export default function StudentSubmissionPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data, isLoading, error, refetch } = useStudentSubmission(id);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading submission…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <div>
          <p className="text-lg font-semibold">Submission not found</p>
          <p className="text-sm text-muted-foreground">This submission may no longer be available.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const { submission, question, studentAnswer, rubric, aiMarking, flags, humanReviewPending, feedback } = data;
  const artifact = (data.markingArtifact ?? data.markingMeta ?? {}) as Record<string, any>;
  const inputArtifact = (artifact.input ?? artifact.answerInput ?? {}) as Record<string, any>;
  const diagnostics = (aiMarking as any)?.diagnostics ?? artifact.diagnostics ?? {};

  const statusCfg = STATUS_CONFIG[submission.status] ?? {
    label: submission.status,
    classes: "border-transparent bg-slate-500 text-white",
  };
  const scorePct = question.maxScore ? Math.round((aiMarking.finalScore / question.maxScore) * 100) : null;
  const isCorrect = scorePct !== null && scorePct >= 100;
  const isPartial = scorePct !== null && scorePct > 0 && scorePct < 100;
  const scoreText = isCorrect ? "text-emerald-600" : isPartial ? "text-amber-600" : "text-red-600";
  const scoreBar = isCorrect ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500";
  const scoreChip = isCorrect
    ? "border-transparent bg-emerald-600 text-white"
    : isPartial
    ? "border-transparent bg-amber-500 text-white"
    : "border-transparent bg-red-600 text-white";

  // Student-facing visibility gates: hide teacher/pipeline internals and any
  // section that has no real data to show.
  const hasFeedback = !!feedback && feedback.trim().length > 0;
  const rawAnswer = firstText(
    data.rawAnswer,
    studentAnswer.rawAnswer,
    getPath(artifact, "rawAnswer"),
    getPath(inputArtifact, "rawAnswer"),
    studentAnswer.text,
  );
  const interpretedAnswer = firstText(
    data.interpretedAnswer,
    data.normalizedAnswer,
    studentAnswer.interpretedAnswer,
    studentAnswer.displayAnswer,
    studentAnswer.normalizedAnswer,
    getPath(artifact, "displayAnswer"),
    getPath(artifact, "normalizedAnswer"),
    getPath(inputArtifact, "displayAnswer"),
    getPath(inputArtifact, "normalizedAnswer"),
    getPath(diagnostics, "normalizedStudent"),
  );
  const expectedAnswer = firstText(
    data.expectedAnswer,
    question.expectedAnswer,
    getPath(artifact, "expectedAnswer"),
    getPath(artifact, "normalizedExpectedAnswer"),
    getPath(diagnostics, "normalizedCorrect"),
  );
  const expectedSolution = firstText(
    data.expectedSolution,
    data.workedSolution,
    getPath(artifact, "workedSolution"),
    getPath(artifact, "solution"),
    getPath(artifact, "explanation"),
    getPath(aiMarking, "sources.0.evidence"),
  );
  const hasExpected = !!expectedAnswer;
  const hasExpectedSolution = !!expectedSolution && expectedSolution !== expectedAnswer;
  const errorTags = aiMarking.errorTags ?? [];
  // The rubric is only meaningful when there is a per-criterion breakdown to
  // display; otherwise it renders as an empty "—" list and looks broken.
  const hasRubric = !!rubric && rubric.criteria.length > 0 && aiMarking.perCriterion.length > 0;

  const subjectLabel = question.subjectName || question.subjectCode || null;
  const typeLabel = question.type ? question.type.replace(/_/g, " ") : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 pb-20">
      {/* Back link */}
      <Link
        href="/student/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </Link>

      {/* Header — title, context, single score, status */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">Submission Review</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                {subjectLabel && <span className="font-medium text-foreground">{subjectLabel}</span>}
                {subjectLabel && typeLabel && <span aria-hidden>•</span>}
                {typeLabel && <span className="capitalize">{typeLabel}</span>}
                {submission.submittedAt && (
                  <>
                    {(subjectLabel || typeLabel) && <span aria-hidden>•</span>}
                    <span>
                      {new Date(submission.submittedAt).toLocaleString("en-AU", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {scorePct !== null && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${scoreChip}`}>
                  {isCorrect ? <CheckCircle className="h-3.5 w-3.5" /> : isPartial ? <HelpCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {aiMarking.finalScore} / {question.maxScore}
                </span>
              )}
              <Badge variant="outline" className={`text-xs ${statusCfg.classes}`}>
                {statusCfg.label}
              </Badge>
            </div>
          </div>

          {/* Single score progress bar (no duplicate score card) */}
          {scorePct !== null && (
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className={`font-semibold ${scoreText}`}>
                  {isCorrect ? "Correct" : isPartial ? "Partially correct" : "Incorrect"}
                </span>
                <span className="tabular-nums">{scorePct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full transition-all ${scoreBar}`} style={{ width: `${scorePct}%` }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending review banner */}
      {humanReviewPending && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-50 px-5 py-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <Clock className="h-5 w-5 shrink-0 text-amber-500" />
          <span>
            <strong className="font-semibold">Awaiting teacher review.</strong>{" "}
            The score shown is a preliminary AI result and may change after review.
          </span>
        </div>
      )}

      {/* Flags */}
      {flags?.length > 0 && (
        <div className="space-y-2">
          {flags.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-50 px-4 py-3 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
              <span>{f.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Question */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className={SECTION_LABEL}>Question</div>
          <p className="text-lg font-medium leading-relaxed text-foreground">{question.questionText}</p>
          {question.maxScore != null && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {question.maxScore} {question.maxScore === 1 ? "mark" : "marks"}
              </Badge>
              {typeLabel && (
                <Badge variant="secondary" className="text-xs capitalize">
                  {typeLabel}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Answer */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className={SECTION_LABEL}>Answer Submitted</div>

          {rawAnswer ? (
            <div>
              <div className="mb-2 text-sm font-medium text-foreground">Raw answer</div>
              {answerDisplay(rawAnswer)}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">No answer recorded.</p>
          )}

          {interpretedAnswer && interpretedAnswer !== rawAnswer && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-foreground">Interpreted answer</div>
              {mathDisplay(interpretedAnswer)}
              <p className="mt-2 text-xs text-muted-foreground">
                This is the normalized form the marking engine used for comparison.
              </p>
            </div>
          )}

          {studentAnswer.working && studentAnswer.working.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Working steps</div>
              {studentAnswer.working.map((w) => (
                <div
                  key={w.step}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm text-foreground"
                >
                  <span className="mr-2 text-muted-foreground">{w.step}.</span>
                  {w.latex}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correct Answer */}
      {hasExpected && (
        <Card className="shadow-sm border-emerald-500/30">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <BookOpenCheck className="h-4 w-4" />
              Expected Answer
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/60 p-4 dark:bg-emerald-900/15">
              <MathpixMarkdown value={expectedAnswer} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expected Solution */}
      {hasExpectedSolution && (
        <Card className="shadow-sm border-emerald-500/30">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <BookOpenCheck className="h-4 w-4" />
              Expected Solution
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-50/60 p-4 dark:bg-emerald-900/15">
              <MathpixMarkdown value={expectedSolution} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback — the primary student value, full text, never truncated */}
      {hasFeedback && (
        <Card className="shadow-sm border-sky-500/30">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <Lightbulb className="h-4 w-4" />
              Feedback
            </div>
            <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">{feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Detected issues — friendly badges, not the raw teacher picker */}
      {errorTags.length > 0 && (
        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className={SECTION_LABEL}>Areas to Improve</div>
            <div className="flex flex-wrap gap-2">
              {errorTags.map((t) => (
                <span
                  key={t.tagCode}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  {prettifyTag(t.label || t.tagCode)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rubric — only when there is a per-criterion breakdown to show */}
      {hasRubric && (
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Marking Rubric
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <RubricChecklist rubric={rubric} perCriterion={aiMarking.perCriterion} editable={false} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
