// frontend/src/components/practice/AnswerFeedback.tsx
import MathRenderer from "@/components/ui/MathRenderer";

export default function AnswerFeedback({
    correct,
    explanation,
}: {
    correct: boolean;
    explanation: string;
}) {
    return (
        <div className="mt-3">
            <p className={correct ? 'text-green-600' : 'text-red-600'}>
                {correct ? 'Correct ✅' : 'Incorrect ❌'}
            </p>
            {!correct && explanation && (
                <div className="text-sm mt-1 text-slate-300">
                    <MathRenderer math={explanation} />
                </div>
            )}
        </div>
    );
}
