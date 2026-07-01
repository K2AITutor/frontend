"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { fetchExam, fetchExamQuestionsByExamKey, type ExamDTO, type ExamQuestionDTO } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";

const EXAM_OPTIONS = [
    { year: 2025, examKey: "VCE_MM_EXAM2_2025" },
    { year: 2024, examKey: "VCE_MM_EXAM2_2024" },
    { year: 2023, examKey: "VCE_MM_EXAM2_2023" },
    { year: 2022, examKey: "VCE_MM_EXAM2_2022" },
    { year: 2021, examKey: "VCE_MM_EXAM2_2021" },
    { year: 2020, examKey: "VCE_MM_EXAM2_2020" },
    { year: 2019, examKey: "VCE_MM_EXAM2_2019" },
    { year: 2018, examKey: "VCE_MM_EXAM2_2018" },
    { year: 2017, examKey: "VCE_MM_EXAM2_2017" },
    { year: 2016, examKey: "VCE_MM_EXAM2_2016" },
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
    SECTION_A: "Section A multiple-choice",
    SECTION_B: "Section B extended response",
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
    MULTIPLE_CHOICE: "Multiple-choice",
    EXTENDED_RESPONSE: "Extended response",
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

function questionSectionText(question: ExamQuestionDTO) {
    return `${question.partLabel ?? ""} ${question.questionNumber ?? ""}`.toLowerCase();
}

function isSectionAQuestion(question: ExamQuestionDTO) {
    const sectionText = questionSectionText(question);
    return sectionText.includes("section a") || question.answerType === "MULTIPLE_CHOICE";
}

function isSectionBQuestion(question: ExamQuestionDTO) {
    const sectionText = questionSectionText(question);
    return sectionText.includes("section b") || !isSectionAQuestion(question);
}

export default function Exam2BriefingPage() {
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
                            : message || `No loaded dataset found for ${selectedExam.year} Exam 2.`
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

    const sectionACount = useMemo(
        () => questions.filter(isSectionAQuestion).length,
        [questions]
    );

    const sectionBCount = useMemo(
        () => questions.filter(isSectionBQuestion).length,
        [questions]
    );

    const tableRows = useMemo(() => topicSummary(questions), [questions]);
    const canStart = !loading && !error && questions.length > 0;
    const startHref = `/student/practice/math-methods/exam-2/session?examKey=${encodeURIComponent(selectedExam.examKey)}&mode=practice`;
    const examModeHref = `/student/practice/math-methods/exam-2/session?examKey=${encodeURIComponent(selectedExam.examKey)}&mode=exam`;

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div>
                            <p className="text-sm font-medium text-primary">VCE Mathematical Methods</p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight">Examination 2 practice</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                Exam 2 is the technology-active Mathematical Methods paper. Use this page to review
                                the loaded Section A and Section B dataset, confirm what has been published from QA,
                                then start the selected past exam when it is ready.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">Reading: 15 min</span>
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">Writing: 120 min</span>
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">CAS: Allowed</span>
                            <span className="rounded-full border border-border bg-muted px-3 py-2 text-muted-foreground">Section A + B</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <Card className="xl:col-span-7">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Notes and guide</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            These are the core rules students should keep in mind before starting a past Exam 2.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="font-semibold">Exam conditions</h3>
                                <ul className="mt-3 space-y-2 text-muted-foreground">
                                    <li>Use technology where appropriate and keep exact values when required.</li>
                                    <li>Section A contains multiple-choice questions.</li>
                                    <li>Section B contains extended-response questions requiring working.</li>
                                    <li>Diagrams are not drawn to scale unless stated.</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="font-semibold">Answer expectations</h3>
                                <ul className="mt-3 space-y-2 text-muted-foreground">
                                    <li>For multiple-choice, choose the single best option.</li>
                                    <li>For extended response, show method and give clear final answers.</li>
                                    <li>Use correct interval, coordinate, function, and probability notation.</li>
                                    <li>For modelling questions, state conclusions in context when asked.</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="font-semibold">Input format in the app</h3>
                                <ul className="mt-3 space-y-2 text-muted-foreground">
                                    <li>Use calculator-style typing such as <span className="font-mono">sqrt(2)</span>.</li>
                                    <li>Use <span className="font-mono">pi</span> for π and <span className="font-mono">^</span> for powers.</li>
                                    <li>Use <span className="font-mono">*</span> for multiplication when it avoids ambiguity.</li>
                                    <li>For answer sets, intervals, and coordinates, use the guided keypad formats.</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <h3 className="font-semibold">Common mark losses</h3>
                                <ul className="mt-3 space-y-2 text-muted-foreground">
                                    <li>Selecting a Section A option before checking the whole question.</li>
                                    <li>Rounding too early or giving decimal answers where exact form is required.</li>
                                    <li>Missing units or context in probability and modelling answers.</li>
                                    <li>Correct final answer with insufficient working in multi-mark parts.</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <aside className="xl:col-span-5 space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Select past exam</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Choose a year to inspect the published Exam 2 dataset before starting.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {EXAM_OPTIONS.map((option) => {
                                    const selected = option.year === selectedYear;
                                    return (
                                        <Button
                                            key={option.examKey}
                                            type="button"
                                            size="sm"
                                            variant={selected ? "default" : "outline"}
                                            onClick={() => setSelectedYear(option.year)}
                                        >
                                            {option.year}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold">
                                            {exam?.title ?? `${selectedExam.year} VCE Mathematical Methods Exam 2`}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">{selectedExam.examKey}</p>
                                    </div>
                                    <span className={`rounded-full border px-2 py-1 text-xs font-medium ${canStart ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-border bg-muted text-muted-foreground"}`}>
                                        {loading ? "Loading" : canStart ? "Loaded" : "Not loaded"}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
                                    <div className="rounded-md border border-border bg-card px-2 py-3">
                                        <div className="text-lg font-semibold">{questions.length}</div>
                                        <div className="text-xs text-muted-foreground">Parts</div>
                                    </div>
                                    <div className="rounded-md border border-border bg-card px-2 py-3">
                                        <div className="text-lg font-semibold">{totalMarks}</div>
                                        <div className="text-xs text-muted-foreground">Marks</div>
                                    </div>
                                    <div className="rounded-md border border-border bg-card px-2 py-3">
                                        <div className="text-lg font-semibold">{sectionACount}</div>
                                        <div className="text-xs text-muted-foreground">Section A</div>
                                    </div>
                                    <div className="rounded-md border border-border bg-card px-2 py-3">
                                        <div className="text-lg font-semibold">{sectionBCount}</div>
                                        <div className="text-xs text-muted-foreground">Section B</div>
                                    </div>
                                </div>

                                <div className="mt-2 rounded-md border border-border bg-card px-2 py-3 text-center text-sm">
                                    <div className="text-lg font-semibold">{autoMarkedCount}</div>
                                    <div className="text-xs text-muted-foreground">Auto-check ready</div>
                                </div>
                            </div>

                            {canStart ? (
                                <Button asChild className="w-full">
                                    <Link href={startHref}>
                                        Start {selectedExam.year} practice
                                    </Link>
                                </Button>
                            ) : (
                                <Button type="button" disabled className="w-full">
                                    Start {selectedExam.year} practice
                                </Button>
                            )}
                            {canStart && (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={examModeHref}>
                                        Try {selectedExam.year} exam mode
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg">Loaded dataset questions</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Topic and section coverage for the selected past Exam 2.
                            </p>
                        </div>
                        {canStart && (
                            <Button asChild size="sm">
                                <Link href={startHref}>
                                    Start {selectedExam.year} practice
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground">Loading dataset questions from PostgreSQL...</p>
                    ) : error ? (
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
                            {error}
                        </div>
                    ) : questions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No published questions are available for this exam yet. Approve and publish QA records before students can start.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-muted-foreground">
                                    <tr className="border-b border-border">
                                        <th className="py-2 pr-4 text-left font-medium">Topic</th>
                                        <th className="py-2 pr-4 text-left font-medium">Subtopic</th>
                                        <th className="py-2 pr-4 text-left font-medium">Question parts</th>
                                        <th className="py-2 pr-4 text-left font-medium">Marks</th>
                                        <th className="py-2 text-left font-medium">Marking</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row) => (
                                        <tr key={`${row.topicCode}-${row.subtopicCode}`} className="border-b border-border">
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">{topicDisplayName(row.topicCode)}</div>
                                                <div className="mt-0.5 text-xs text-muted-foreground">{row.topicCode}</div>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div>{subtopicDisplayName(row.subtopicCode)}</div>
                                                <div className="mt-0.5 text-xs text-muted-foreground">{row.subtopicCode}</div>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">{row.parts}</td>
                                            <td className="py-3 pr-4 text-muted-foreground">{row.marks}</td>
                                            <td className="py-3 text-muted-foreground">
                                                {row.auto}/{row.parts} auto-check
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
