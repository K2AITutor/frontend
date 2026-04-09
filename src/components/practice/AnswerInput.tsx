// frontend/src/components/practice/AnswerInput.tsx
import { useState } from 'react';
import MathInput from '../ui/MathInput';

export default function AnswerInput({
    onSubmit,
}: {
    /** Called with the Nerdamer-formatted expression so the backend can evaluate it */
    onSubmit: (answer: string) => void;
}) {
    // latex: what MathLive renders; nerdamer: plain algebraic form for evaluation
    const [latex, setLatex] = useState('');
    const [nerdamer, setNerdamer] = useState('');

    return (
        <div className="mt-2 space-y-3">
            <MathInput
                value={latex}
                onChange={setLatex}
                onNerdamerChange={setNerdamer}
                className="w-full"
            />

            {/* Format preview boxes */}
            <div className="grid grid-cols-2 gap-3">
                {/* LaTeX box */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        LaTeX
                    </p>
                    <p className="font-mono text-sm text-amber-300 break-all min-h-[1.5rem]">
                        {latex || <span className="text-slate-600 italic">—</span>}
                    </p>
                </div>

                {/* Nerdamer box */}
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Nerdamer
                    </p>
                    <p className="font-mono text-sm text-indigo-300 break-all min-h-[1.5rem]">
                        {nerdamer || <span className="text-slate-600 italic">—</span>}
                    </p>
                </div>
            </div>

            <button
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
                onClick={() => onSubmit(nerdamer || latex)}
            >
                Submit
            </button>
        </div>
    );
}
