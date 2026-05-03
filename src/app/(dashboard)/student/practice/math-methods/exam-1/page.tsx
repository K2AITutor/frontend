"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchExamQuestionsByExamKey, type ExamQuestionDTO } from "@/lib/apiClient";

export default function Exam1BriefingPage() {
    const examKey = "VCE_MM_EXAM1_2025";
    const { data: session, status } = useSession();
    const [questions, setQuestions] = useState<ExamQuestionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            setError("Please log in again to load this exam.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const token = (session?.user as any)?.accessToken;
                if (!token) {
                    throw new Error("Your login session is missing an API token. Please log out and log in again.");
                }
                const rows = await fetchExamQuestionsByExamKey(
                    examKey,
                    token
                );
                if (!cancelled) setQuestions(rows);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || "Failed to load dataset questions.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [session, status]);

    const totalMarks = useMemo(
        () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
        [questions]
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 text-slate-200">
            {/* Header */}
            <div className="glass p-6">
                <h1 className="text-2xl font-semibold mb-2">
                    2025 VCE Mathematical Methods
                </h1>
                <h2 className="text-lg text-slate-300 mb-4">
                    Examination 1 (No CAS)
                </h2>

                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="px-2 py-1 rounded bg-slate-800">Reading time: 15 minutes</span>
                    <span className="px-2 py-1 rounded bg-slate-800">Writing time: 60 minutes</span>
                    <span className="px-2 py-1 rounded bg-slate-800">CAS: Not allowed</span>
                    <span className="px-2 py-1 rounded bg-slate-800">Exact values required</span>
                    <span className="px-2 py-1 rounded bg-emerald-900/60 text-emerald-200">
                        Dataset: {loading ? "loading" : `${questions.length} parts`}
                    </span>
                    {!loading && questions.length > 0 && (
                        <span className="px-2 py-1 rounded bg-slate-800">{totalMarks} marks</span>
                    )}
                </div>
            </div>

            <div className="glass p-6">
                <h3 className="font-semibold mb-3">Loaded dataset questions</h3>
                {loading ? (
                    <p className="text-sm text-slate-300">Loading questions from PostgreSQL…</p>
                ) : error ? (
                    <p className="text-sm text-red-300">{error}</p>
                ) : questions.length === 0 ? (
                    <p className="text-sm text-slate-300">
                        No seeded questions found for this exam yet. Run the backend seed after applying the dataset.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-slate-400">
                                <tr className="border-b border-slate-700">
                                    <th className="py-2 pr-3 text-left font-medium">Question</th>
                                    <th className="py-2 pr-3 text-left font-medium">Marks</th>
                                    <th className="py-2 pr-3 text-left font-medium">Topic</th>
                                    <th className="py-2 text-left font-medium">Marking</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions.map((question) => (
                                    <tr key={question.id} className="border-b border-slate-800">
                                        <td className="py-2 pr-3 text-slate-100">Question {question.questionNumber}</td>
                                        <td className="py-2 pr-3 text-slate-300">{question.marks}</td>
                                        <td className="py-2 pr-3 text-slate-300">
                                            {question.topicCode || "Untitled"}
                                            {question.subtopicCode ? (
                                                <span className="block text-xs text-slate-500">
                                                    {question.subtopicCode}
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="py-2 text-slate-300">
                                            {question.isMarkable === false ? "Manual review" : "Auto-check"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Exam Conditions */}
            <div className="glass p-6">
                <h3 className="font-semibold mb-3">Exam conditions</h3>
                <ul className="list-disc ml-6 space-y-2 text-sm text-slate-300">
                    <li>Answer all questions in the spaces provided.</li>
                    <li>Write your responses in English.</li>
                    <li>
                        In all questions where a numerical answer is required, an exact
                        value must be given unless otherwise specified.
                    </li>
                    <li>
                        In questions where more than one mark is available, appropriate
                        working must be shown.
                    </li>
                    <li>
                        Unless otherwise indicated, diagrams in this examination are not
                        drawn to scale.
                    </li>
                </ul>
            </div>

            {/* Examiner Expectations */}
            <div className="glass p-6">
                <h3 className="font-semibold mb-3">What examiners look for</h3>
                <p className="text-sm text-slate-300 mb-3">
                    Examiners assess what is written, not what is intended.
                    Marks are awarded for correct method, correct notation,
                    and correct final answers.
                </p>
                <ul className="list-disc ml-6 space-y-2 text-sm text-slate-300">
                    <li>Correct mathematical method</li>
                    <li>Accurate notation and symbols</li>
                    <li>Exact values where required</li>
                    <li>Complete answers that address the question</li>
                </ul>
            </div>

            {/* Required Answer Formats */}
            <div className="glass p-6">
                <h3 className="font-semibold mb-3">Required answer formats</h3>

                <div className="space-y-4 text-sm text-slate-300">
                    <div>
                        <p className="font-medium text-slate-200 mb-1">Domains and intervals</p>
                        <p>Correct examples:</p>
                        <ul className="list-disc ml-6 mb-2">
                            <li>x ≥ 4</li>
                            <li>[4, ∞)</li>
                        </ul>
                        <p>Incorrect examples:</p>
                        <ul className="list-disc ml-6">
                            <li>x &gt; 4</li>
                            <li>(4, ∞)</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-medium text-slate-200 mb-1">Exact values</p>
                        <p>Correct examples:</p>
                        <ul className="list-disc ml-6 mb-2">
                            <li>1/3</li>
                            <li>√5</li>
                        </ul>
                        <p>Incorrect examples:</p>
                        <ul className="list-disc ml-6">
                            <li>0.333</li>
                            <li>2.236</li>
                        </ul>
                    </div>

                    <div>
                        <p className="font-medium text-slate-200 mb-1">Algebraic expressions</p>
                        <p>Use standard mathematical notation, for example:</p>
                        <ul className="list-disc ml-6">
                            <li>x² + 3x − 1</li>
                            <li>(x + 1)(x − 2)</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Common Mistakes */}
            <div className="glass p-6">
                <h3 className="font-semibold mb-3">Common reasons marks are lost</h3>
                <ul className="list-disc ml-6 space-y-2 text-sm text-slate-300">
                    <li>Incorrect or missing endpoint inclusion in intervals</li>
                    <li>Using decimal approximations instead of exact values</li>
                    <li>Incorrect inequality symbols</li>
                    <li>Incomplete answers or missing working</li>
                </ul>
            </div>

            {/* Start Exam */}
            <div className="flex justify-end">
                <a
                    href="/student/practice/math-methods/exam-1/session"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                >
                    Start Examination
                </a>
            </div>
        </div>
    );
}
