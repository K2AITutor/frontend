"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Separator } from "@/components/dashboard/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/dashboard/ui/sheet";
import { ConfidenceMeter } from "@/components/marking/ConfidenceMeter";
import { HybridMarkingBadge } from "@/components/marking/HybridMarkingBadge";
import { useSubmissionFull } from "@/lib/api/teacher";
import type { Annotation } from "@/lib/api/admin-marking";

interface Props {
  annotation: Annotation | null;
  onClose: () => void;
}

export function AnnotationDrawer({ annotation, onClose }: Props) {
  return (
    <Sheet open={annotation !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-xl w-full flex flex-col p-0">
        {annotation && <DrawerBody annotation={annotation} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({ annotation }: { annotation: Annotation }) {
  const { data, isLoading, error, refetch } = useSubmissionFull(annotation.submissionId);

  return (
    <>
      <SheetHeader className="px-6 pt-6 pb-4 pr-12 border-b shrink-0">
        <SheetTitle>Annotation Audit</SheetTitle>
        <SheetDescription>
          {annotation.teacherName} · {new Date(annotation.createdAt).toLocaleDateString()}
        </SheetDescription>
      </SheetHeader>

      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
        {/* Teacher verdict */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Teacher Verdict
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={annotation.agreementWithModel ? "default" : "destructive"}>
              {annotation.agreementWithModel ? "Agreed with AI" : "Overridden AI"}
            </Badge>
            {annotation.errorTags.length > 0
              ? annotation.errorTags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))
              : <span className="text-xs text-muted-foreground">No error tags</span>
            }
          </div>
        </div>

        <Separator />

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-10 gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load submission details</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {data && (
          <>
            {/* Question */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Question
              </p>
              <p className="text-sm whitespace-pre-wrap">{data.question.prompt}</p>
              {data.question.expectedAnswer && (
                <div className="mt-2 rounded bg-muted px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  <span className="font-medium">Expected: </span>
                  {data.question.expectedAnswer}
                </div>
              )}
            </div>

            <Separator />

            {/* Student answer */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                Student Answer
              </p>
              {data.studentAnswer.text ? (
                <p className="text-sm whitespace-pre-wrap">{data.studentAnswer.text}</p>
              ) : (
                <span className="text-sm text-muted-foreground">No text answer</span>
              )}
              {data.studentAnswer.ocrText &&
                data.studentAnswer.ocrText !== data.studentAnswer.text && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">OCR</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.studentAnswer.ocrText}
                    </p>
                  </div>
                )}
            </div>

            <Separator />

            {/* AI marking */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                AI Marking
              </p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {data.aiMarking.finalScore}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{data.question.maxScore}
                    </span>
                  </p>
                </div>
                <HybridMarkingBadge source={data.aiMarking.routingDecision.chosenSource} />
              </div>
              <ConfidenceMeter value={data.aiMarking.finalConfidence} />
              {data.aiMarking.errorTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">AI-detected error tags</p>
                  <div className="flex flex-wrap gap-1">
                    {data.aiMarking.errorTags.map((t) => (
                      <Badge key={t.tagCode} variant="outline" className="text-xs">
                        {t.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
