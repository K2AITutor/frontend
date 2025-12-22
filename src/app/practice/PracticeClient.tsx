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
  /* ===================== CORE STATE ===================== */
  const [question, setQuestion] = useState<PracticeQuestion | null>(
    initialQuestions[0] ?? null
  );
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);

  /* ===================== LOADING STATES (STEP 1) ===================== */
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
        <p>No question loaded.</p>
      </div>
    );
  }

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
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExplain = async () => {
    if (isExplaining) return;

    try {
      setIsExplaining(true);
      const ai = await aiExplain({
        subject: "MATH_METHODS",
        skillCode: question.skillCode,
        question: question.prompt,
        studentAnswer: answer,
        correctAnswer: question.answer,
      });
      setExplanation(ai);
    } catch (err) {
      console.error(err);
      setExplanation({
        stepByStep: ["Review the differentiation rule applied here."],
        finalAdvice: "Try breaking the function into inner and outer parts.",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleHint = async () => {
    if (isHinting || hintLevel > 3) return;

    try {
      setIsHinting(true);
      const res = await aiHint({
        subject: "MATH_METHODS",
        skillCode: question.skillCode,
        question: question.prompt,
        studentAnswer: answer,
        level: hintLevel,
      });

      setHints((prev) => [...prev, res.hint]);
      setHintLevel((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
    } finally {
      setIsHinting(false);
    }
  };

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* Topic selector (visual only for demo) */}
      <select className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg">
        <option>-- Choose a Topic --</option>
        <option>Quadratics</option>
        <option>Linear Equations</option>
        <option>Probability</option>
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
        disabled={isSubmitting}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold disabled:opacity-50"
        onClick={handleSubmit}
      >
        {isSubmitting ? "Checking..." : "Submit Answer"}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`glass p-4 ${
            result.correct ? "text-green-400" : "text-red-400"
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
            disabled={isExplaining}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm disabled:opacity-50"
            onClick={handleExplain}
          >
            {isExplaining ? "Thinking..." : "Explain with AI"}
          </button>
        </div>
      )}

      {/* Hint system */}
      {!result?.correct && (
        <div className="glass p-4">
          <h3 className="font-semibold mb-2">Need a hint?</h3>

          <button
            disabled={isHinting || hintLevel > 3}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm disabled:opacity-50"
            onClick={handleHint}
          >
            {isHinting ? "Thinking..." : `Hint ${hintLevel}`}
          </button>

          <ul className="mt-3 list-disc ml-6 text-slate-300">
            {hints.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* AI Explanation */}
      {explanation && (
        <div className="glass p-4 text-slate-300">
          <h3 className="font-semibold mb-2">AI Explanation</h3>

          <ul className="list-disc ml-6 mt-2">
            {explanation.stepByStep.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ul>

          <p className="mt-3 text-purple-300">
            {explanation.finalAdvice}
          </p>

          <button
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm"
            onClick={async () => {
              const next = await aiSimilarQuestion({
                subject: "MATH_METHODS",
                skillCode: question.skillCode,
                question: question.prompt,
              });

              setQuestion({
                ...question,
                prompt: next.question,
                answer: next.correctAnswer,
              });

              setAnswer("");
              setResult(null);
              setExplanation(null);
              resetHints();
            }}
          >
            Try Similar Question
          </button>
        </div>
      )}
    </div>
  );
}
