// frontend/src/components/practice/QuestionCard.tsx
"use client";

import { PracticeQuestion } from "@/types/question";
import MathpixMarkdown from "./MathpixMarkdown";

export default function QuestionCard({
    question,
    className = "",
    contentClassName = "",
}: {
    question: PracticeQuestion;
    className?: string;
    contentClassName?: string;
}) {
    const prompt = String(question.questionText ?? "");
    const questionNumber = String((question as any).questionNumber ?? "").trim();
    const partLabel = questionNumber.match(/[a-z](?:_[ivx]+)?$/i)?.[0]?.replace(/_/g, ".") ?? "";
    const marks = (question as any).marks;

    return (
        <div className={`glass p-4 space-y-4 ${className}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {(question as any).topicCode && (
                        <span className="px-2 py-1 rounded border border-border bg-muted">
                            {(question as any).topicCode}
                        </span>
                    )}
                    {(question as any).subtopicCode && (
                        <span className="px-2 py-1 rounded border border-border bg-muted">
                            {(question as any).subtopicCode}
                        </span>
                    )}
                    {(question as any).isMarkable === false && (
                        <span className="px-2 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200">
                            Manual review
                        </span>
                    )}
                </div>

                {marks != null && (
                    <span className="shrink-0 px-2 py-1 rounded border border-border bg-muted text-xs text-muted-foreground">
                        {marks} mark{Number(marks) === 1 ? "" : "s"}
                    </span>
                )}
            </div>

            <div className="flex gap-4 text-foreground">
                {partLabel && (
                    <div className="w-8 shrink-0 pt-1 text-lg font-semibold">
                        {partLabel}.
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <MathpixMarkdown value={prompt} className={contentClassName} />
                </div>
            </div>
        </div>
    );
}
