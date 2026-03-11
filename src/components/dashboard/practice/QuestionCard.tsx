// frontend/src/components/practice/QuestionCard.tsx
"use client";
import { submitAnswer } from "@/lib/apiClient";

import { PracticeQuestion } from "@/types/question";

export default function QuestionCard({
    question,
}: {
    question: PracticeQuestion;
}) {
    return (
        <div className="glass p-4">
            <p className="text-lg font-medium">{question.prompt}</p>
        </div>
    );
}
