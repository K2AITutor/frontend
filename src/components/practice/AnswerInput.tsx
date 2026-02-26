// frontend/src/components/practice/AnswerInput.tsx
import { useState } from 'react';
import MathInput from '../ui/MathInput';

export default function AnswerInput({
    onSubmit,
}: {
    onSubmit: (answer: string) => void;
}) {
    const [answer, setAnswer] = useState('');

    return (
        <div className="mt-2 space-y-2">
            <MathInput
                value={answer}
                onChange={(val) => setAnswer(val)}
                className="w-full"
            />
            <button
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                onClick={() => onSubmit(answer)}
            >
                Submit
            </button>
        </div>
    );
}
