"use client";

import { DetailDrawer } from "@/components/dashboard/ui/detail-drawer";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Separator } from "@/components/dashboard/ui/separator";
import { Loader2, AlertCircle, FileQuestion } from "lucide-react";
import { useTeacherHistoryDetail } from "@/lib/api/teacher";
import type {
  TeacherHistoryDetail,
  TeacherDecision,
} from "@/lib/types/teacher";

interface Props {
  attemptId: string | null;
  onClose: () => void;
}

const DECISION_BADGE: Record<
  TeacherDecision,
  { className: string; label: string }
> = {
  approve: { className: "bg-green-50 text-green-700 border-green-200", label: "Approved" },
  override: { className: "bg-amber-50 text-amber-700 border-amber-200", label: "Overridden" },
  escalate: { className: "bg-red-50 text-red-700 border-red-200", label: "Escalated" },
};

const CONFIDENCE_BADGE: Record<
  TeacherHistoryDetail["aiMarking"]["confidenceLevel"],
  string
> = {
  high: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-red-50 text-red-700 border-red-200",
};

export function HistoryDetailDrawer({ attemptId, onClose }: Props) {
  return (
    <DetailDrawer
      open={attemptId !== null}
      onClose={onClose}
      title="Review Detail"
      description="Full context for a single graded submission."
      size="2xl"
    >
      {attemptId && <DrawerBody attemptId={attemptId} />}
    </DetailDrawer>
  );
}

function DrawerBody({ attemptId }: { attemptId: string }) {
  const { data, isLoading, error, refetch } = useTeacherHistoryDetail(attemptId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center py-10 gap-3">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-sm text-muted-foreground">Failed to load review detail</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center py-10 gap-3">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No detail available.</p>
      </div>
    );
  }

  const { submission, student, context, question, aiMarking, correction, rubric } = data;
  const decisionBadge = context.decision ? DECISION_BADGE[context.decision] : null;
  const scoreDelta =
    correction != null ? correction.correctedScore - correction.originalScore : null;

  return (
    <>
      {/* Group 4 — Student & context */}
      <Section title="Student & Context">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Student" value={student.name} />
          <Field label="Subject" value={context.subject} mono />
          <Field label="Question type" value={context.questionType} />
          <Field
            label="Submitted"
            value={new Date(submission.submittedAt).toLocaleString("en-AU")}
          />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Decision</p>
            {decisionBadge ? (
              <Badge variant="outline" className={`text-xs ${decisionBadge.className}`}>
                {decisionBadge.label}
              </Badge>
            ) : (
              <p className="text-sm text-muted-foreground">Not reviewed yet</p>
            )}
          </div>
          <Field
            label="Reviewed"
            value={
              submission.reviewedAt
                ? new Date(submission.reviewedAt).toLocaleString("en-AU")
                : "—"
            }
          />
        </div>
      </Section>

      <Separator />

      {/* Group 1 — Question + student answer + correct answer */}
      <Section title="Question & Answers">
        <TextBlock label="Question" value={question.questionText} />
        <TextBlock label="Student answer" value={question.studentAnswer} />
        <TextBlock
          label="Correct answer"
          value={question.correctAnswer ?? "No sample answer yet"}
          muted={question.correctAnswer == null}
        />
      </Section>

      <Separator />

      {/* Group 3 — AI marking */}
      <Section title="AI Marking">
        <div className="grid grid-cols-2 gap-4">
          <Field label="AI score" value={`${aiMarking.aiScore} / ${context.maxScore}`} />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {(aiMarking.confidence * 100).toFixed(0)}%
              </span>
              <Badge
                variant="outline"
                className={`text-xs capitalize ${CONFIDENCE_BADGE[aiMarking.confidenceLevel]}`}
              >
                {aiMarking.confidenceLevel}
              </Badge>
            </div>
          </div>
          <Field label="Routing reason" value={aiMarking.routingReason} mono />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">AI error tags</p>
          {aiMarking.aiErrorTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {aiMarking.aiErrorTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None</p>
          )}
        </div>
        {aiMarking.aiExplanation != null && (
          <TextBlock label="AI explanation" value={aiMarking.aiExplanation} />
        )}
      </Section>

      <Separator />

      {/* Group 2 — Teacher comments & corrections */}
      <Section title="Teacher Review">
        {correction == null ? (
          <p className="text-sm text-muted-foreground">
            This submission has not been reviewed by a teacher yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Corrected score"
                value={`${correction.correctedScore} / ${context.maxScore}`}
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Score change</p>
                {scoreDelta === 0 || scoreDelta == null ? (
                  <span className="text-sm text-muted-foreground">—</span>
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
              </div>
            </div>

            <TextBlock
              label="Comment"
              value={correction.comment ?? "No comment"}
              muted={correction.comment == null}
            />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Teacher error tags</p>
              {correction.teacherErrorTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {correction.teacherErrorTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Criterion overrides</p>
              {correction.criterionOverrides.length > 0 ? (
                <div className="space-y-1.5">
                  {correction.criterionOverrides.map((ov) => (
                    <div
                      key={ov.criterionId}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{ov.label}</span>
                      <span className="font-mono text-muted-foreground">
                        {ov.overrideScore}
                        {ov.maxMarks != null ? ` / ${ov.maxMarks}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">None</p>
              )}
            </div>
          </>
        )}
      </Section>

      {rubric.criteria.length > 0 && (
        <>
          <Separator />
          <Section title="Rubric Criteria">
            <div className="space-y-1.5">
              {rubric.criteria.map((c) => (
                <div
                  key={c.id}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.code}</span>
                    <span className="font-mono text-muted-foreground">
                      max {c.maxMarks}
                    </span>
                  </div>
                  {c.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function TextBlock({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div
        className={`max-h-60 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-muted/30 px-3 py-2 text-sm ${
          muted ? "italic text-muted-foreground" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
