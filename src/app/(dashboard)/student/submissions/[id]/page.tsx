"use client";

import { ArrowLeft, Loader2, AlertCircle, Clock, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useStudentSubmission } from "@/lib/api/student-submissions";
import { HybridMarkingBadge } from "@/components/marking/HybridMarkingBadge";
import { ConfidenceMeter } from "@/components/marking/ConfidenceMeter";
import { MarkingSourceTimeline } from "@/components/marking/MarkingSourceTimeline";
import { RubricChecklist } from "@/components/marking/RubricChecklist";
import { ErrorTagPicker } from "@/components/marking/ErrorTagPicker";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending_review: { label: "Pending Review", classes: "bg-amber-500/15 text-amber-300 border-amber-500/20" },
  reviewed:       { label: "Reviewed",        classes: "bg-sky-500/15 text-sky-300 border-sky-500/20" },
  approved:       { label: "Approved",        classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  overridden:     { label: "Overridden",      classes: "bg-violet-500/15 text-violet-300 border-violet-500/20" },
  escalated:      { label: "Escalated",       classes: "bg-red-500/15 text-red-300 border-red-500/20" },
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
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm text-slate-400">Loading submission…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center max-w-sm w-full">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
          <p className="text-white font-semibold text-lg mb-1">Submission not found</p>
          <p className="text-sm text-slate-400 mb-6">This submission may no longer be available.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { submission, question, studentAnswer, rubric, aiMarking, flags, humanReviewPending } = data;

  const statusCfg = STATUS_CONFIG[submission.status] ?? { label: submission.status, classes: "bg-slate-500/15 text-slate-300 border-white/10" };
  const scorePct = question.maxScore ? Math.round((aiMarking.finalScore / question.maxScore) * 100) : null;
  const isCorrect = scorePct !== null && scorePct >= 100;
  const isPartial = scorePct !== null && scorePct > 0 && scorePct < 100;

  return (
    <div className="min-h-screen bg-[#0b1020] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Back link */}
        <Link
          href="/student/submissions"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to History
        </Link>

        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Submission Review</h1>
              {submission.submittedAt && (
                <p className="mt-1 text-sm text-slate-400">
                  {new Date(submission.submittedAt).toLocaleString("en-AU", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Score summary chip */}
              {scorePct !== null && (
                <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
                  isCorrect ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                  : isPartial ? "bg-amber-500/15 text-amber-300 border-amber-500/20"
                  : "bg-red-500/15 text-red-300 border-red-500/20"
                }`}>
                  {isCorrect ? <CheckCircle className="h-3.5 w-3.5" /> : isPartial ? <HelpCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                  {aiMarking.finalScore} / {question.maxScore}
                </div>
              )}

              {/* Status badge */}
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusCfg.classes}`}>
                {statusCfg.label}
              </span>
            </div>
          </div>
        </section>

        {/* Pending review banner */}
        {humanReviewPending && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
            <Clock className="h-5 w-5 shrink-0 text-amber-400" />
            <span>
              <strong className="font-semibold text-amber-300">Awaiting teacher review.</strong>{" "}
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
                className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
                <span>{f.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">

          {/* Left column: Question + Answer + Rubric */}
          <div className="space-y-5">

            {/* Question */}
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Question</div>
              <p className="text-lg font-medium leading-relaxed text-white">
                {question.questionText}
              </p>
              {question.maxScore != null && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                    {question.maxScore} {question.maxScore === 1 ? "mark" : "marks"}
                  </span>
                  {question.type && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300 capitalize">
                      {question.type.replace(/_/g, " ")}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Student Answer */}
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Your Answer</div>

              {studentAnswer.text ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <p className="whitespace-pre-wrap text-base text-slate-100">{studentAnswer.text}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No answer recorded.</p>
              )}

              {studentAnswer.working && studentAnswer.working.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Working steps</div>
                  {studentAnswer.working.map((w) => (
                    <div
                      key={w.step}
                      className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 font-mono text-sm text-slate-200"
                    >
                      <span className="mr-2 text-slate-500">{w.step}.</span>
                      {w.latex}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rubric */}
            {rubric && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Marking Rubric</div>
                <RubricChecklist
                  rubric={rubric}
                  perCriterion={aiMarking.perCriterion}
                  editable={false}
                />
              </div>
            )}
          </div>

          {/* Right column: AI Marking */}
          <div className="space-y-5">

            {/* Score + Source */}
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">AI Marking Result</div>

              <div className="flex flex-wrap items-center gap-4">
                <div className={`text-5xl font-bold tabular-nums ${isCorrect ? "text-emerald-400" : isPartial ? "text-amber-400" : "text-red-400"}`}>
                  {aiMarking.finalScore}
                  <span className="text-2xl font-normal text-slate-500"> / {question.maxScore ?? aiMarking.finalScore}</span>
                </div>
                <HybridMarkingBadge source={aiMarking.routingDecision.chosenSource} />
              </div>

              {scorePct !== null && (
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${isCorrect ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${scorePct}%` }}
                  />
                </div>
              )}
            </div>

            {/* Confidence */}
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">AI Confidence</div>
              <ConfidenceMeter value={aiMarking.finalConfidence} />
            </div>

            {/* Error tags */}
            {aiMarking.errorTags?.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Detected Issues</div>
                <ErrorTagPicker
                  available={aiMarking.errorTags}
                  value={aiMarking.errorTags.map((t) => t.tagCode)}
                  readOnly
                />
              </div>
            )}

            {/* Marking sources */}
            {aiMarking.sources?.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Marking Sources</div>
                <MarkingSourceTimeline
                  sources={aiMarking.sources}
                  routingDecision={aiMarking.routingDecision}
                />
              </div>
            )}

            {/* Routing decision */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
              <span className="font-semibold text-white">Decision: </span>
              {aiMarking.routingDecision.reason}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
