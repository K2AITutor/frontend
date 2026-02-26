// frontend/src/components/practice/QuestionCard.tsx
"use client";
import MathRenderer from "@/components/ui/MathRenderer";
import { PracticeQuestion } from "@/types/question";

export default function QuestionCard({
    question,
}: {
    question: { prompt: string };
}) {
    return (
        <div className="glass p-4">
            <div className="text-lg font-medium leading-relaxed">
                <MathRenderer math={question.prompt} />
            </div>
        </div>
    );
}
