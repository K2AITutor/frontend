// frontend/src/components/practice/AnswerFeedback.tsx
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
            {!correct && (
                <p className="text-sm mt-1">{explanation}</p>
            )}
        </div>
    );
}
