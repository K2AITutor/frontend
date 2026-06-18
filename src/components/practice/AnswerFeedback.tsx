"use client";

import { Clock } from "lucide-react";
import { HybridMarkingBadge } from "@/components/marking/HybridMarkingBadge";
import { ConfidenceMeter } from "@/components/marking/ConfidenceMeter";
import { MarkingSourceTimeline } from "@/components/marking/MarkingSourceTimeline";
import { ErrorTagPicker } from "@/components/marking/ErrorTagPicker";
import { RubricChecklist } from "@/components/marking/RubricChecklist";
import type { HybridMarkingResult, Rubric, CriterionScore } from "@/lib/types/marking";

interface AnswerFeedbackProps {
  result: HybridMarkingResult;
  maxScore?: number;
  humanReviewPending?: boolean;
  submissionId?: string;
  rubric?: Rubric;
}

export default function AnswerFeedback({
  result,
  maxScore,
  humanReviewPending,
  submissionId,
  rubric,
}: AnswerFeedbackProps) {
  const displayMax = maxScore ?? result.finalScore;

  return (
    <div className="space-y-4">
      {/* Score + source badge */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold">
          {result.finalScore}
          <span className="text-base font-normal text-muted-foreground"> / {displayMax}</span>
        </span>
        <HybridMarkingBadge source={result.routingDecision.chosenSource} />
      </div>

      {/* Pending review banner */}
      {humanReviewPending && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            <strong>Awaiting teacher review.</strong> Your score may change after the teacher reviews it.
          </span>
        </div>
      )}

      {/* Confidence meter */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">AI Confidence</p>
        <ConfidenceMeter value={result.finalConfidence} />
      </div>

      {/* Per-criterion breakdown (when rubric available) */}
      {rubric && result.perCriterion.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Criterion Breakdown</p>
          <RubricChecklist rubric={rubric} perCriterion={result.perCriterion} editable={false} />
        </div>
      )}

      {/* Error tags (read-only) */}
      {result.errorTags.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Detected Issues</p>
          <ErrorTagPicker
            available={result.errorTags}
            value={result.errorTags.map((t) => t.tagCode)}
            readOnly
          />
        </div>
      )}

      {/* Marking source timeline */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Marking Sources</p>
        <MarkingSourceTimeline
          sources={result.sources}
          routingDecision={result.routingDecision}
        />
      </div>

      {/* Link to full submission */}
      {submissionId && (
        <p className="text-xs text-muted-foreground">
          Submission ID:{" "}
          <a
            href={`/student/submissions/${submissionId}`}
            className="underline hover:text-foreground"
          >
            {submissionId}
          </a>
        </p>
      )}
    </div>
  );
}
