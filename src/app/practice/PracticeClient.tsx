// frontend/src/app/practice/PracticeClient.tsx
"use client";

import { useState } from "react";
import QuestionCard from "@/components/practice/QuestionCard";
import { submitAnswer, aiExplain, aiSimilarQuestion } from "@/lib/api";
import { PracticeQuestion } from "@/types/question";

export default function PracticeClient({
    initialQuestions,
}: {
    initialQuestions: PracticeQuestion[];
}) {
    const [question, setQuestion] = useState(initialQuestions[0]);
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<any>(null);
    const [explanation, setExplanation] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* Topic selector (visual only for demo) */}
            <select className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg">
                <option>-- Choose a Topic --</option>
                <option>Quadratics</option>
                <option>Linear Equations</option>
                <option>Simultaneous Equations</option>
                <option>Probability</option>
                <option>Geometry</option>
                <option>Trigonometry</option>
            </select>

            {/* Question */}
            <QuestionCard question={question} />

            {/* Answer input */}
            <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg"
            />

            {/* Submit */}
            <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                onClick={async () => {
                    const res = await submitAnswer(question.id, answer);
                    setResult(res);
                }}
            >
                Submit Answer
            </button>

            {/* Result */}
            {result && (
                <div
                    className={`glass p-4 ${result.correct ? "text-green-400" : "text-red-400"
                        }`}
                >
                    <p className="font-semibold">
                        {result.correct ? "Correct" : "Incorrect"}
                    </p>

                    {!result.correct && (
                        <p className="text-slate-300 mt-2">
                            Explanation: {result.explanation}
                        </p>
                    )}

                    {/* AI Explain */}
                    <button
                        className="mt-4 mr-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
                        onClick={async () => {
                            const ai = await aiExplain(question.prompt, question.answer);
                            setExplanation(ai.explanation);
                        }}
                    >
                        Explain with AI
                    </button>
                </div>
            )}

            {/* AI Explanation */}
            {explanation && (
                <div className="glass p-4 text-slate-300 whitespace-pre-wrap">
                    <h3 className="font-semibold mb-2">AI Explanation</h3>
                    {explanation}

                    <button
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
                        onClick={async () => {
                            const next = await aiSimilarQuestion(question.prompt);
                            setQuestion(next);
                            setAnswer("");
                            setResult(null);
                            setExplanation(null);
                        }}
                    >
                        Try Similar Question
                    </button>
                </div>
            )}
        </div>
    );
}
