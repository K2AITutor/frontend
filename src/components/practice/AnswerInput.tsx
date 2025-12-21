// frontend/src/components/practice/AnswerInput.tsx
import { useState } from 'react';

export default function AnswerInput({
    onSubmit,
}: {
    onSubmit: (answer: string) => void;
}) {
    const [answer, setAnswer] = useState('');

    return (
        <div className="mt-2">
            <input
                className="border p-2 w-full"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
            />
            <button
                className="mt-2 bg-blue-600 text-white px-4 py-1"
                onClick={() => onSubmit(answer)}
            >
                Submit
            </button>
        </div>
    );
}
