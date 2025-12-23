"use client";

import { useState } from "react";
import QuestionCard from "@/components/practice/QuestionCard";
import {
    submitAnswer,
    aiExplain,
    aiSimilarQuestion,
    aiHint,
} from "@/lib/apiClient";
import { PracticeQuestion } from "@/types/question";

export default function PracticeClient({
    initialQuestions,
}: {
    initialQuestions: PracticeQuestion[];
}) {
    /* ===================== QUESTION FLOW ===================== */
    const [questions] = useState<PracticeQuestion[]>(initialQuestions);
    const [currentIndex, setCurrentIndex] = useState(0);

    const question = questions[currentIndex] ?? null;

    /* ===================== CORE STATE ===================== */
    const [answer, setAnswer] = useState("");
    const [result, setResult] = useState<any>(null);
    const [explanation, setExplanation] = useState<any>(null);

    /* ===================== LOADING STATES ===================== */
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [isHinting, setIsHinting] = useState(false);

    /* ===================== HINT STATE ===================== */
    const [hintLevel, setHintLevel] = useState<1 | 2 | 3>(1);
    const [hints, setHints] = useState<string[]>([]);

    const resetHints = () => {
        setHintLevel(1);
        setHints([]);
    };

    if (!question) {
        return (
            <div className="p-8 text-center text-slate-300">
                <p>No questions loaded.</p>
            </div>
        );
    }

    const aiAvailable = Boolean(question.skillCode);

    /* ===================== HANDLERS ===================== */

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const res = await submitAnswer(question.id, answer);
            setResult(res);
            setExplanation(null);
            resetHints();
        } catch (err) {
            console.error("Submit failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExplain = async () => {
        if (!aiAvailable || isExplaining) return;

        try {
            setIsExplaining(true);

            const ai = await aiExplain({
                subject: "MATH_METHODS",
                skillCode: question.skillCode!,
                question: question.prompt,
                studentAnswer: answer,
                correctAnswer: question.answer,
            });

            setExplanation(ai);
        } catch (err) {
            console.error("AI explain failed:", err);
        } finally {
            setIsExplaining(false);
        }
    };

    const handleHint = async () => {
        if (!aiAvailable || isHinting || hintLevel > 3) return;

        try {
            setIsHinting(true);

            const res = await aiHint({
                subject: "MATH_METHODS",
                skillCode: question.skillCode!,
                question: question.prompt,
                studentAnswer: answer,
                level: hintLevel,
            });

            setHints((prev) => [...prev, res.hint]);
            setHintLevel((prev) =>
                prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev
            );
        } catch (err) {
            console.error("AI hint failed:", err);
        } finally {
            setIsHinting(false);
        }
    };

    const handleSimilar = async () => {
        if (!aiAvailable) return;

        try {
            const next = await aiSimilarQuestion({
                subject: "MATH_METHODS",
                skillCode: question.skillCode!,
                question: question.prompt,
            });

            setExplanation({
                stepByStep: ["Try this similar question:"],
                finalAdvice: next.question,
            });

            setAnswer("");
            setResult(null);
            resetHints();
        } catch (err) {
            console.error("AI similar failed:", err);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex >= questions.length - 1) return;

        setCurrentIndex((i) => i + 1);
        setAnswer("");
        setResult(null);
        setExplanation(null);
        resetHints();
    };

    /* ===================== UI ===================== */

    return (
        <div className="space-y-6">
            <div className="text-sm text-slate-400">
                Question {currentIndex + 1} of {questions.length}
            </div>

            <QuestionCard question={question} />

            <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg"
            />

            <button
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
                onClick={handleSubmit}
            >
                {isSubmitting ? "Checking..." : "Submit Answer"}
            </button>

            {result && (
                <div className={`glass p-4 ${result.correct ? "text-green-400" : "text-red-400"}`}>
                    <p className="font-semibold">
                        {result.correct ? "Correct" : "Incorrect"}
                    </p>

                    {!result.correct && (
                        <p className="text-slate-300 mt-2">
                            Explanation: {result.explanation}
                        </p>
                    )}

                    {aiAvailable && (
                        <button
                            className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
                            onClick={handleExplain}
                        >
                            Explain with AI
                        </button>
                    )}

                    {currentIndex < questions.length - 1 && (
                        <button
                            className="mt-3 ml-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                            onClick={handleNextQuestion}
                        >
                            Next Question →
                        </button>
                    )}
                </div>
            )}

            {!result?.correct && aiAvailable && (
                <div className="glass p-4">
                    <button
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm"
                        onClick={handleHint}
                    >
                        Hint {hintLevel}
                    </button>

                    <ul className="mt-3 list-disc ml-6 text-slate-300">
                        {hints.map((h, i) => (
                            <li key={i}>{h}</li>
                        ))}
                    </ul>
                </div>
            )}

            {explanation && (
                <div className="glass p-4 text-slate-300">
                    <h3 className="font-semibold mb-2">AI Explanation</h3>

                    <ul className="list-disc ml-6">
                        {explanation.stepByStep?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>

                    <p className="mt-3 text-purple-300">
                        {explanation.finalAdvice}
                    </p>

                    <button
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
                        onClick={handleSimilar}
                    >
                        Try Similar Question
                    </button>
                </div>
            )}
        </div>
    );
}
