"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchExam, fetchExamQuestionsByExamKey, type ExamDTO, type ExamQuestionDTO } from "@/lib/apiClient";

const EXAM_OPTIONS = [
    { year: 2025, examKey: "VCE_MM_EXAM1_2025" },
    { year: 2024, examKey: "VCE_MM_EXAM1_2024" },
    { year: 2023, examKey: "VCE_MM_EXAM1_2023" },
    { year: 2022, examKey: "VCE_MM_EXAM1_2022" },
    { year: 2021, examKey: "VCE_MM_EXAM1_2021" },
    { year: 2020, examKey: "VCE_MM_EXAM1_2020" },
    { year: 2019, examKey: "VCE_MM_EXAM1_2019" },
    { year: 2018, examKey: "VCE_MM_EXAM1_2018" },
    { year: 2017, examKey: "VCE_MM_EXAM1_2017" },
    { year: 2016, examKey: "VCE_MM_EXAM1_2016" },
];

const TOPIC_DISPLAY: Record<string, string> = {
    MM_ALG_EQUATIONS_EXP_LOG: "Exponential and logarithmic equations",
    MM_ALG_PARAMETERS: "Parameters and modelling",
    MM_CALC_ANTI_DIFF: "Antidifferentiation",
    MM_CALC_DIFF_RULES: "Differentiation rules",
    MM_CALC_STATIONARY_POINTS: "Applications of differentiation",
    MM_FUNC_POLYNOMIAL: "Polynomial functions",
    MM_FUNC_RESTRICTED_DOMAIN: "Functions, relations and inverse functions",
    MM_FUNC_TRIGONOMETRIC: "Circular functions",
    MM_STAT_BINOMIAL: "Binomial distribution",
    MM_STAT_RANDOM_VARIABLES: "Random variables and probability distributions",

    MM_CALC_DIFF: "Differentiation",
    MM_CALC_APP: "Applications of differentiation",
    MM_CALC_INT: "Integration",
    MM_CIRC: "Circular functions",
    MM_CONT_RV: "Continuous random variables",
    MM_DISCRETE_RV: "Discrete random variables",
    MM_EXP_LOG: "Exponential and logarithmic functions",
    MM_FUNC_REL: "Functions and relations",
    MM_POLY: "Polynomial functions",
    MM_BINOM: "Binomial distribution",
    MM_MIXED: "Mixed methods and modelling",
};

const SUBTOPIC_DISPLAY: Record<string, string> = {
    ANTIDERIVATIVES: "Antiderivatives",
    BINOMIAL_MEAN_VARIANCE: "Mean and variance of a binomial distribution",
    CONTINUOUS_PROBABILITY: "Continuous probability",
    CUBIC_QUARTIC_GRAPHS: "Cubic and quartic graphs",
    DISCRETE_RV_DISTRIBUTION: "Discrete random variable distributions",
    DOMAIN_RANGE: "Domain and range",
    EXPONENTIAL_EQUATIONS: "Exponential equations",
    EXPECTED_VALUE: "Expected value",
    FACTOR_THEOREM: "Factor theorem",
    ONE_TO_ONE_INVERSE: "One-to-one and inverse functions",
    PARAMETER_ANALYSIS: "Parameter analysis",
    PDF_PROPERTIES: "Probability density functions",
    POINTS_OF_INFLECTION: "Points of inflection",
    POLYNOMIAL_FACTORISATION: "Polynomial factorisation",
    POLYNOMIAL_INEQUALITIES: "Polynomial inequalities",
    PRODUCT_RULE: "Product rule",
    STATIONARY_POINTS: "Stationary points",
    TANGENTS_NORMALS: "Tangents and normals",
    TRANSFORMED_DENSITIES: "Transformations of density functions",
    TRIG_EQUATIONS: "Trigonometric equations",
    TRIG_GRAPHS: "Graphs of circular functions",
};

function readableCode(value: string) {
    return value
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
}

function topicDisplayName(topicCode: string) {
    return TOPIC_DISPLAY[topicCode] ?? readableCode(topicCode);
}

function subtopicDisplayName(subtopicCode: string) {
    return SUBTOPIC_DISPLAY[subtopicCode] ?? readableCode(subtopicCode);
}

function topicSummary(questions: ExamQuestionDTO[]) {
    const rows = new Map<string, { topicCode: string; subtopicCode: string; parts: number; marks: number; auto: number }>();

    for (const question of questions) {
        const topicCode = question.topicCode || "UNTAGGED";
        const subtopicCode = question.subtopicCode || "UNTAGGED";
        const key = `${topicCode}:${subtopicCode}`;
        const current = rows.get(key) ?? { topicCode, subtopicCode, parts: 0, marks: 0, auto: 0 };
        current.parts += 1;
        current.marks += Number(question.marks || 0);
        current.auto += question.isMarkable === false ? 0 : 1;
        rows.set(key, current);
    }

    return Array.from(rows.values()).sort((a, b) => {
        if (a.topicCode !== b.topicCode) return a.topicCode.localeCompare(b.topicCode);
        return a.subtopicCode.localeCompare(b.subtopicCode);
    });
}

export default function Exam1BriefingPage() {
    const { data: session, status } = useSession();
    const [selectedYear, setSelectedYear] = useState(2025);
    const selectedExam = EXAM_OPTIONS.find((exam) => exam.year === selectedYear) ?? EXAM_OPTIONS[0];

    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [questions, setQuestions] = useState<ExamQuestionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            setError("Please log in again to load past exam datasets.");
            setLoading(false);
            return;
        }
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            setExam(null);
            setQuestions([]);

            try {
                const token = (session?.user as any)?.accessToken;
                if (!token) {
                    throw new Error("Your login session is missing an API token. Please log out and log in again.");
                }

                const [meta, rows] = await Promise.all([
                    fetchExam(selectedExam.examKey, token),
                    fetchExamQuestionsByExamKey(selectedExam.examKey, token),
                ]);

                if (!cancelled) {
                    setExam(meta);
                    setQuestions(rows);
                }
            } catch (e: any) {
                if (!cancelled) {
                    const message = String(e?.message || "");
                    setError(
                        message.toLowerCase() === "unauthorized"
                            ? "Your login token has expired. Please log out and log in again, then reload this page."
                            : message || `No loaded dataset found for ${selectedExam.year} Exam 1.`
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedExam.examKey, selectedExam.year, session, status]);

    const totalMarks = useMemo(
        () => questions.reduce((sum, question) => sum + Number(question.marks || 0), 0),
        [questions]
    );

    const autoMarkedCount = useMemo(
        () => questions.filter((question) => question.isMarkable !== false).length,
        [questions]
    );

    const tableRows = useMemo(() => topicSummary(questions), [questions]);
    const canStart = !loading && !error && questions.length > 0;
    const startHref = `/student/practice/math-methods/exam-1/session?examKey=${encodeURIComponent(selectedExam.examKey)}`;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 text-slate-200">
            <section className="glass p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                        <p className="text-sm font-medium text-emerald-300">VCE Mathematical Methods</p>
                        <h1 className="mt-2 text-2xl font-semibold">Examination 1 practice</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                            Exam 1 is the non-CAS paper for Mathematical Methods. Use this page to review the
                            exam conditions, check which dataset questions are loaded for each past exam, then start
                            the selected test when the dataset is ready.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <span className="rounded bg-slate-800 px-3 py-2">Reading: 15 min</span>
                        <span className="rounded bg-slate-800 px-3 py-2">Writing: 60 min</span>
                        <span className="rounded bg-slate-800 px-3 py-2">CAS: Not allowed</span>
                        <span className="rounded bg-slate-800 px-3 py-2">Exact values</span>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <section className="xl:col-span-7 glass p-6 space-y-5">
                    <div>
                        <h2 className="text-lg font-semibold">Notes and guide</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            These are the core rules students should keep in mind before starting a past Exam 1.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                            <h3 className="font-semibold text-slate-100">Exam conditions</h3>
                            <ul className="mt-3 space-y-2 text-slate-300">
                                <li>Answer all questions in the spaces provided.</li>
                                <li>Show appropriate working where more than one mark is available.</li>
                                <li>Diagrams are not drawn to scale unless stated.</li>
                                <li>Use exact values unless the question asks for a decimal approximation.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                            <h3 className="font-semibold text-slate-100">Answer expectations</h3>
                            <ul className="mt-3 space-y-2 text-slate-300">
                                <li>Use correct notation for intervals, coordinates, and functions.</li>
                                <li>Include endpoints correctly in domain and inequality questions.</li>
                                <li>For algebra and calculus, simplify enough for the answer to be clear.</li>
                                <li>For explanation questions, write the reasoning, not only the final result.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                            <h3 className="font-semibold text-slate-100">Input format in the app</h3>
                            <ul className="mt-3 space-y-2 text-slate-300">
                                <li>Use calculator-style typing such as <span className="font-mono">sqrt(2)</span>.</li>
                                <li>Use <span className="font-mono">pi</span> for π and <span className="font-mono">^</span> for powers.</li>
                                <li>Use <span className="font-mono">*</span> for multiplication when it avoids ambiguity.</li>
                                <li>For answer sets, separate values with commas.</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                            <h3 className="font-semibold text-slate-100">Common mark losses</h3>
                            <ul className="mt-3 space-y-2 text-slate-300">
                                <li>Decimal answers where exact form is required.</li>
                                <li>Missing a solution in a trigonometric or polynomial equation.</li>
                                <li>Dropping endpoint brackets in intervals.</li>
                                <li>Correct answer with no method when working is required.</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <aside className="xl:col-span-5 space-y-6">
                    <section className="glass p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold">Select past exam</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Choose a year to inspect the loaded dataset before starting.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {EXAM_OPTIONS.map((option) => {
                                const selected = option.year === selectedYear;
                                return (
                                    <button
                                        key={option.examKey}
                                        type="button"
                                        onClick={() => setSelectedYear(option.year)}
                                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${selected
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                            }`}
                                    >
                                        {option.year}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold">
                                        {exam?.title ?? `${selectedExam.year} VCE Mathematical Methods Exam 1`}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-400">{selectedExam.examKey}</p>
                                </div>
                                <span className={`rounded px-2 py-1 text-xs ${canStart ? "bg-emerald-900/60 text-emerald-200" : "bg-slate-800 text-slate-400"}`}>
                                    {loading ? "Loading" : canStart ? "Loaded" : "Not loaded"}
                                </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="rounded bg-slate-800 px-2 py-3">
                                    <div className="text-lg font-semibold">{questions.length}</div>
                                    <div className="text-xs text-slate-400">Parts</div>
                                </div>
                                <div className="rounded bg-slate-800 px-2 py-3">
                                    <div className="text-lg font-semibold">{totalMarks}</div>
                                    <div className="text-xs text-slate-400">Marks</div>
                                </div>
                                <div className="rounded bg-slate-800 px-2 py-3">
                                    <div className="text-lg font-semibold">{autoMarkedCount}</div>
                                    <div className="text-xs text-slate-400">Auto-check</div>
                                </div>
                            </div>
                        </div>

                        {canStart ? (
                            <Link
                                href={startHref}
                                className="block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-500"
                            >
                                Start {selectedExam.year} test
                            </Link>
                        ) : (
                            <button
                                type="button"
                                disabled
                                className="w-full rounded-lg bg-slate-800 px-5 py-3 font-semibold text-slate-500"
                            >
                                Start {selectedExam.year} test
                            </button>
                        )}
                    </section>
                </aside>
            </div>

            <section className="glass p-6">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold">Loaded dataset questions</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Topic coverage for the selected past exam.
                        </p>
                    </div>
                    {canStart && (
                        <Link
                            href={startHref}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            Start {selectedExam.year} test
                        </Link>
                    )}
                </div>

                <div className="mt-5">
                    {loading ? (
                        <p className="text-sm text-slate-300">Loading dataset questions from PostgreSQL...</p>
                    ) : error ? (
                        <div className="rounded-lg border border-amber-800 bg-amber-950/30 p-4 text-sm text-amber-200">
                            {error}
                        </div>
                    ) : questions.length === 0 ? (
                        <p className="text-sm text-slate-300">
                            No published questions are available for this exam yet. Approve and publish QA records before students can start.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-slate-400">
                                    <tr className="border-b border-slate-700">
                                        <th className="py-2 pr-4 text-left font-medium">Topic</th>
                                        <th className="py-2 pr-4 text-left font-medium">Subtopic</th>
                                        <th className="py-2 pr-4 text-left font-medium">Question parts</th>
                                        <th className="py-2 pr-4 text-left font-medium">Marks</th>
                                        <th className="py-2 text-left font-medium">Marking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row) => (
                                        <tr key={`${row.topicCode}-${row.subtopicCode}`} className="border-b border-slate-800">
                                            <td className="py-3 pr-4">
                                                <div className="font-medium text-slate-100">{topicDisplayName(row.topicCode)}</div>
                                                <div className="mt-0.5 text-xs text-slate-500">{row.topicCode}</div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="text-slate-200">{subtopicDisplayName(row.subtopicCode)}</div>
                                                <div className="mt-0.5 text-xs text-slate-500">{row.subtopicCode}</div>
                                            </td>
                                            <td className="py-3 pr-4 text-slate-300">{row.parts}</td>
                                            <td className="py-3 pr-4 text-slate-300">{row.marks}</td>
                                            <td className="py-3 text-slate-300">
                                                {row.auto}/{row.parts} auto-check
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
