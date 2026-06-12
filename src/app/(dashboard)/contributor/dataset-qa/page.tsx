"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, CheckCircle2, FileText, FlaskConical, Rocket, Save, Search, ShieldCheck, XCircle } from "lucide-react";
import { usePageTitle } from "@/lib/usePageTitle";
import {
    DatasetQaQuestion,
    DatasetQaStatus,
    publishDatasetQaQuestions,
    testDatasetQaAnswer,
    updateDatasetQaQuestion,
    useDatasetQaQuestions,
} from "@/lib/api/contributor";
import MathpixMarkdown from "@/components/practice/MathpixMarkdown";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Input } from "@/components/dashboard/ui/input";
import { Label } from "@/components/dashboard/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/dashboard/ui/select";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { Textarea } from "@/components/dashboard/ui/textarea";

const EXAMS = [
    { key: "VCE_MM_EXAM1_2025", label: "2025 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2024", label: "2024 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2023", label: "2023 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2022", label: "2022 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2021", label: "2021 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2020", label: "2020 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2019", label: "2019 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2018", label: "2018 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2017", label: "2017 Mathematical Methods Exam 1" },
    { key: "VCE_MM_EXAM1_2016", label: "2016 Mathematical Methods Exam 1" },
];

const PRACTICE_QA_SOURCES = [
    { key: "PRACTICE_MM_CH01_FUNCTIONS_RELATIONS", label: "Practice QA - Chapter 1 Functions and relations" },
    { key: "PRACTICE_MM_CH02_COORDINATE_GEOMETRY", label: "Practice QA - Chapter 2 Coordinate geometry" },
    { key: "PRACTICE_MM_CH03_TRANSFORMATIONS", label: "Practice QA - Chapter 3 Transformations" },
    { key: "PRACTICE_MM_CH04_POLYNOMIAL_FUNCTIONS", label: "Practice QA - Chapter 4 Polynomial functions" },
    { key: "PRACTICE_MM_CH05_EXPONENTIAL_LOG_FUNCTIONS", label: "Practice QA - Chapter 5 Exponential/log functions" },
    { key: "PRACTICE_MM_CH06_CIRCULAR_FUNCTIONS", label: "Practice QA - Chapter 6 Circular functions" },
    { key: "PRACTICE_MM_CH07_FURTHER_FUNCTIONS", label: "Practice QA - Chapter 7 Further functions" },
    { key: "PRACTICE_MM_CH09_DIFFERENTIATION", label: "Practice QA - Chapter 9 Differentiation" },
    {
        key: "PRACTICE_MM_CH10_APPLICATIONS_OF_DIFFERENTIATION",
        label: "Practice QA - Chapter 10 Applications of differentiation",
    },
    { key: "PRACTICE_MM_CH11_INTEGRATION", label: "Practice QA - Chapter 11 Integration" },
    { key: "PRACTICE_MM_CH13_DISCRETE_RANDOM_VARIABLES", label: "Practice QA - Chapter 13 Discrete random variables" },
    { key: "PRACTICE_MM_CH14_BINOMIAL_DISTRIBUTION", label: "Practice QA - Chapter 14 Binomial distribution" },
    { key: "PRACTICE_MM_CH15_CONTINUOUS_RANDOM_VARIABLES", label: "Practice QA - Chapter 15 Continuous random variables" },
    { key: "PRACTICE_MM_CH16_NORMAL_DISTRIBUTION", label: "Practice QA - Chapter 16 Normal distribution" },
];

const STATUS_LABELS: Record<DatasetQaStatus, string> = {
    READY_FOR_QA: "Ready for QA",
    APPROVED: "Approved",
    NEEDS_FIX: "Needs fix",
    REJECTED: "Rejected",
    MANUAL_REVIEW: "Manual review",
};

const STATUS_STYLES: Record<DatasetQaStatus, string> = {
    READY_FOR_QA: "bg-slate-100 text-slate-900 hover:bg-slate-100",
    APPROVED: "bg-emerald-600 text-white hover:bg-emerald-600",
    NEEDS_FIX: "bg-amber-500 text-slate-950 hover:bg-amber-500",
    REJECTED: "bg-red-600 text-white hover:bg-red-600",
    MANUAL_REVIEW: "bg-purple-600 text-white hover:bg-purple-600",
};

const TOPIC_LABELS: Record<string, string> = {
    MM_CALC_DIFF_RULES: "Differentiation rules",
    MM_CALC_ANTI_DIFF: "Antidifferentiation",
    MM_FUNC_TRIGONOMETRIC: "Trigonometric functions",
    MM_CIRC: "Circular functions",
    MM_STAT_RANDOM_VARIABLES: "Random variables",
    MM_STAT_BINOMIAL: "Binomial distributions",
    MM_STAT_NORMAL: "Normal distribution",
    MM_STAT_MODEL_INTERPRET: "Continuous random variables",
    MM_FUNC_POLYNOMIAL: "Polynomial functions",
    MM_FUNC_COMBINED_TRANSFORMS: "Transformations",
    MM_FUNC_RATIONAL: "Further functions",
    MM_FUNC_RESTRICTED_DOMAIN: "Restricted domains and inverse functions",
    MM_ALG_LINES: "Coordinate geometry",
    MM_ALG_EQUATIONS_EXP_LOG: "Exponential and logarithmic equations",
    MM_EXP_LOG: "Exponential and logarithmic functions",
    MM_ALG_PARAMETERS: "Parameter analysis",
    MM_CALC_STATIONARY_POINTS: "Stationary points",
    MM_MIXED: "Mixed methods",
};

const SUBTOPIC_LABELS: Record<string, string> = {
    PRODUCT_RULE: "Product rule",
    TANGENTS_NORMALS: "Tangents and normals",
    ANTIDERIVATIVES: "Antiderivatives",
    TRIG_GRAPHS: "Trigonometric graphs",
    TRIG_EQUATIONS: "Trigonometric equations",
    DISCRETE_RV_DISTRIBUTION: "Discrete random variable distributions",
    EXPECTED_VALUE: "Expected value",
    EXPONENTIAL_EQUATIONS: "Exponential equations",
    ONE_TO_ONE_INVERSE: "One-to-one functions and inverse functions",
    BINOMIAL_MEAN_VARIANCE: "Binomial mean and variance",
    FACTOR_THEOREM: "Factor theorem",
    POLYNOMIAL_FACTORISATION: "Polynomial factorisation",
    POLYNOMIAL_INEQUALITIES: "Polynomial inequalities",
    CUBIC_QUARTIC_GRAPHS: "Cubic and quartic graphs",
    POINTS_OF_INFLECTION: "Points of inflection",
    STATIONARY_POINTS: "Stationary points",
    PARAMETER_ANALYSIS: "Parameter analysis",
    AVERAGE_RATE: "Average rate of change",
    DERIVATIVE_BASICS: "Derivative basics",
    CHAIN_RULE: "Chain rule",
    QUOTIENT_RULE: "Quotient rule",
    TRIG_EXP_LOG_DERIVATIVES: "Trigonometric, exponential and logarithmic derivatives",
    GRADIENTS: "Gradients",
    LINE_EQUATIONS: "Line equations",
    INTERSECTIONS: "Intersections",
    DISTANCE_MIDPOINT: "Distance and midpoint",
    TRANSLATIONS: "Translations",
    DILATIONS: "Dilations",
    REFLECTIONS: "Reflections",
    COMBINED_TRANSFORMS: "Combined transformations",
    RATIONAL_FUNCTIONS: "Rational functions",
    RADICAL_FUNCTIONS: "Radical functions",
    ASYMPTOTES: "Asymptotes",
    RESTRICTED_DOMAIN: "Restricted domain",
    VARIANCE: "Variance",
    PROBABILITY_MODELS: "Probability models",
    BINOMIAL_MODEL: "Binomial model",
    BINOMIAL_PROBABILITY: "Binomial probability",
    BINOMIAL_APPLICATIONS: "Binomial applications",
    CONTINUOUS_RV: "Continuous random variables",
    PDF_PROPERTIES: "Density function properties",
    CONTINUOUS_PROBABILITY: "Continuous probability",
    TRANSFORMED_DENSITIES: "Transformed densities",
    NORMAL_MODEL: "Normal model",
    STANDARD_NORMAL: "Standard normal",
    Z_SCORES: "Z-scores",
    NORMAL_APPLICATIONS: "Normal applications",
};

function readableCode(code: string | null | undefined, labels: Record<string, string>) {
    if (!code) return "-";
    return labels[code] ?? code.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusCounts(rows: DatasetQaQuestion[]) {
    return rows.reduce(
        (acc, row) => {
            acc[row.reviewStatus] = (acc[row.reviewStatus] ?? 0) + 1;
            return acc;
        },
        {} as Record<DatasetQaStatus, number>
    );
}

export default function ContributorDatasetQaPage() {
    usePageTitle("Dataset QA");

    const [datasetSourceKey, setDatasetSourceKey] = useState(EXAMS[0].key);
    const [reviewerName, setReviewerName] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | DatasetQaStatus>("ALL");
    const [search, setSearch] = useState("");
    const datasetSources = useMemo(
        () => [
            ...EXAMS.map((exam) => ({ ...exam, kind: "exam" as const })),
            ...PRACTICE_QA_SOURCES.map((source) => ({ ...source, kind: "practiceQa" as const })),
        ],
        []
    );
    const { data = [], isLoading: loading, isError: hasError, refetch } = useDatasetQaQuestions(datasetSourceKey);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [publishMessage, setPublishMessage] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return data.filter((row) => {
            const statusOk = statusFilter === "ALL" || row.reviewStatus === statusFilter;
            const searchOk =
                !term ||
                row.questionNumber.toLowerCase().includes(term) ||
                String(row.topicCode ?? "").toLowerCase().includes(term) ||
                String(row.subtopicCode ?? "").toLowerCase().includes(term) ||
                row.questionText.toLowerCase().includes(term);
            return statusOk && searchOk;
        });
    }, [data, search, statusFilter]);

    const selected = useMemo(() => {
        if (!data.length) return null;
        return data.find((row) => row.id === selectedId) ?? filtered[0] ?? data[0];
    }, [data, filtered, selectedId]);

    const counts = statusCounts(data);
    const approvedUnpublishedCount = data.filter(
        (row) => row.reviewStatus === "APPROVED" && row.contentStatus !== "ACTIVE"
    ).length;

    async function handlePublishApproved() {
        setPublishing(true);
        setPublishMessage(null);
        try {
            const result = await publishDatasetQaQuestions(datasetSourceKey);
            setPublishMessage(result.message);
            await refetch();
        } catch (error: any) {
            setPublishMessage(error?.message || "Failed to publish approved records.");
        } finally {
            setPublishing(false);
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Dataset QA</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Review seeded exam and practice-topic QA records from the backend database.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[180px_190px_260px_280px]">
                    <Button variant="outline" asChild>
                        <Link href="/contributor/dataset-qa/analytics">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                        </Link>
                    </Button>
                    <Button
                        type="button"
                        onClick={handlePublishApproved}
                        disabled={publishing || approvedUnpublishedCount === 0}
                    >
                        <Rocket className="mr-2 h-4 w-4" />
                        {publishing ? "Publishing..." : `Publish ${approvedUnpublishedCount}`}
                    </Button>
                    <div className="space-y-2">
                        <Label>Dataset source</Label>
                        <Select value={datasetSourceKey} onValueChange={(value) => {
                            setDatasetSourceKey(value);
                            setSelectedId(null);
                            setPublishMessage(null);
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select dataset" />
                            </SelectTrigger>
                            <SelectContent>
                                {datasetSources.map((source) => (
                                    <SelectItem key={source.key} value={source.key}>
                                        {source.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Reviewer name</Label>
                        <Input
                            value={reviewerName}
                            onChange={(event) => setReviewerName(event.target.value)}
                            placeholder="Enter your name before saving"
                        />
                    </div>
                </div>
            </div>
            {publishMessage ? (
                <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                    {publishMessage}
                </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-5">
                {(Object.keys(STATUS_LABELS) as DatasetQaStatus[]).map((status) => (
                    <Card key={status}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</p>
                            <p className="mt-1 text-2xl font-semibold">{counts[status] ?? 0}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        QA review guideline
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Review each record as if you are preparing it for a student and for future model training.
                            Do not approve a record only because it loads on screen.
                        </p>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {[
                                "Enter your reviewer name before saving any decision.",
                                "Select the exam year and open the first Ready for QA record.",
                                "Compare the rendered question with the original exam or trusted source.",
                                "Check topic, subtopic, marks, answer type, and manual-review flag.",
                                "For auto-check questions, run the marker using the expected answer.",
                                "Read the worked solution and marking rubric for accuracy and clarity.",
                                "Choose Approve, Needs Fix, Manual, or Reject, then write a short note.",
                                "Move to the next question and repeat until the queue is complete.",
                            ].map((step, index) => (
                                <div key={step} className="rounded-md border p-3 text-sm">
                                    <span className="mr-2 font-semibold text-primary">{index + 1}.</span>
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="font-semibold">Golden example: 2025 Question 1a</p>
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <p>Question: differentiate y = x^2 cos(x).</p>
                            <p>Expected answer: 2x cos(x) - x^2 sin(x).</p>
                            <p>Marker test: paste the expected answer and confirm it scores 1 / 1.</p>
                            <p>Topic check: Differentiation rules / Product rule.</p>
                            <p>Decision: Approve only if the rendered question, answer, solution, rubric, and marker result all match.</p>
                            <p>Reviewer note example: Checked against source. Expected answer marks correct. Product rule topic is correct.</p>
                        </div>
                        <Button className="mt-4 w-full" variant="outline" asChild>
                            <Link href="/docs/contributor-dataset-qa-guide.pdf" target="_blank">
                                Open full guide
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <DatasetQaSkeleton />
            ) : hasError ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Failed to load dataset QA questions.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">QA queue</CardTitle>
                            <div className="grid gap-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="pl-9"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search question, topic, subtopic"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All statuses</SelectItem>
                                        {(Object.keys(STATUS_LABELS) as DatasetQaStatus[]).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="max-h-[720px] space-y-2 overflow-y-auto">
                            {filtered.map((row) => (
                                <button
                                    key={row.id}
                                    onClick={() => setSelectedId(row.id)}
                                    className={`w-full rounded-md border p-3 text-left transition hover:bg-muted ${selected?.id === row.id ? "border-primary bg-primary/10" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">Question {row.questionNumber}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {readableCode(row.topicCode, TOPIC_LABELS)}
                                            </p>
                                        </div>
                                        <Badge className={STATUS_STYLES[row.reviewStatus]}>
                                            {STATUS_LABELS[row.reviewStatus]}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span>{row.marks} mark{row.marks === 1 ? "" : "s"}</span>
                                        <span>{row.answerType}</span>
                                        <span>{row.isMarkable ? "Auto-check" : "Manual"}</span>
                                        {row.contentStatus === "ACTIVE" ? <span>Live</span> : null}
                                    </div>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {selected ? (
                        <DatasetQaEditor
                            key={selected.id}
                            question={selected}
                            reviewerName={reviewerName}
                            onSaved={async () => {
                                await refetch();
                            }}
                        />
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center text-muted-foreground">
                                No dataset questions found for this exam.
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

function DatasetQaEditor({
    question,
    reviewerName,
    onSaved,
}: {
    question: DatasetQaQuestion;
    reviewerName: string;
    onSaved: () => Promise<void>;
}) {
    const [questionText, setQuestionText] = useState(question.questionText);
    const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
    const [acceptedAnswers, setAcceptedAnswers] = useState(question.acceptedAnswers.join("\n"));
    const [workedSolution, setWorkedSolution] = useState(question.workedSolution);
    const [topicCode, setTopicCode] = useState(question.topicCode ?? "");
    const [subtopicCode, setSubtopicCode] = useState(question.subtopicCode ?? "");
    const [reviewStatus, setReviewStatus] = useState<DatasetQaStatus>(question.reviewStatus);
    const [reviewNotes, setReviewNotes] = useState(question.reviewNotes ?? "");
    const [testAnswer, setTestAnswer] = useState(question.correctAnswer);
    const [message, setMessage] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    async function handleTest() {
        setTesting(true);
        setMessage(null);
        try {
            const result = await testDatasetQaAnswer(question.id, testAnswer);
            setTestResult(result);
        } catch (error: any) {
            setMessage(error?.message || "Failed to test answer");
        } finally {
            setTesting(false);
        }
    }

    async function handleSave(nextStatus = reviewStatus) {
        setSaving(true);
        setMessage(null);
        try {
            await updateDatasetQaQuestion(question.id, {
                reviewerName,
                reviewStatus: nextStatus,
                reviewNotes,
                questionText,
                correctAnswer,
                acceptedAnswers: acceptedAnswers.split(/\n+/g).map((item) => item.trim()).filter(Boolean),
                workedSolution,
                topicCode,
                subtopicCode,
            });
            setReviewStatus(nextStatus);
            await onSaved();
            setMessage(`Saved ${STATUS_LABELS[nextStatus]} for Question ${question.questionNumber}.`);
        } catch (error: any) {
            setMessage(error?.message || "Failed to save QA review");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                            <CardTitle>Question {question.questionNumber}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {readableCode(question.topicCode, TOPIC_LABELS)} /{" "}
                                {readableCode(question.subtopicCode, SUBTOPIC_LABELS)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{question.answerType}</Badge>
                            <Badge variant="outline">{question.marks} mark{question.marks === 1 ? "" : "s"}</Badge>
                            <Badge className={STATUS_STYLES[reviewStatus]}>{STATUS_LABELS[reviewStatus]}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-muted/30 p-4">
                        <MathpixMarkdown value={questionText} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 2xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Editable dataset fields</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field label="Question markdown">
                            <Textarea rows={8} value={questionText} onChange={(event) => setQuestionText(event.target.value)} />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Topic code">
                                <Input value={topicCode} onChange={(event) => setTopicCode(event.target.value)} />
                            </Field>
                            <Field label="Subtopic code">
                                <Input value={subtopicCode} onChange={(event) => setSubtopicCode(event.target.value)} />
                            </Field>
                        </div>
                        <Field label="Correct answer">
                            <Textarea rows={4} value={correctAnswer} onChange={(event) => setCorrectAnswer(event.target.value)} />
                        </Field>
                        <Field label="Accepted answers">
                            <Textarea
                                rows={4}
                                value={acceptedAnswers}
                                onChange={(event) => setAcceptedAnswers(event.target.value)}
                                placeholder="One accepted answer per line"
                            />
                        </Field>
                        <Field label="Worked solution">
                            <Textarea rows={8} value={workedSolution} onChange={(event) => setWorkedSolution(event.target.value)} />
                        </Field>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Answer test</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                rows={4}
                                value={testAnswer}
                                onChange={(event) => setTestAnswer(event.target.value)}
                                placeholder="Paste or type a student answer"
                            />
                            <Button onClick={handleTest} disabled={testing}>
                                <FlaskConical className="mr-2 h-4 w-4" />
                                {testing ? "Testing..." : "Run marker"}
                            </Button>
                            {testResult ? (
                                <div className="rounded-md border p-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        {testResult.isCorrect ? (
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                        <span className="font-medium">
                                            {testResult.isCorrect === true
                                                ? "Correct"
                                                : testResult.isCorrect === false
                                                    ? "Incorrect"
                                                    : "Manual review required"}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-muted-foreground">
                                        Score: {testResult.score ?? "-"} / {testResult.maxScore ?? question.marks}
                                    </p>
                                    {testResult.errorTags?.length ? (
                                        <p className="mt-2 text-muted-foreground">
                                            Tags: {testResult.errorTags.join(", ")}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">QA decision</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field label="Status">
                                <Select value={reviewStatus} onValueChange={(value) => setReviewStatus(value as DatasetQaStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(STATUS_LABELS) as DatasetQaStatus[]).map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {STATUS_LABELS[status]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Reviewer notes">
                                <Textarea
                                    rows={5}
                                    value={reviewNotes}
                                    onChange={(event) => setReviewNotes(event.target.value)}
                                    placeholder="Record what you checked or what needs fixing"
                                />
                            </Field>
                            <div className="grid gap-2 md:grid-cols-4">
                                <Button onClick={() => handleSave("APPROVED")} disabled={saving || !reviewerName.trim()}>
                                    Approve
                                </Button>
                                <Button variant="outline" onClick={() => handleSave("NEEDS_FIX")} disabled={saving || !reviewerName.trim()}>
                                    Needs Fix
                                </Button>
                                <Button variant="outline" onClick={() => handleSave("MANUAL_REVIEW")} disabled={saving || !reviewerName.trim()}>
                                    Manual
                                </Button>
                                <Button variant="destructive" onClick={() => handleSave("REJECTED")} disabled={saving || !reviewerName.trim()}>
                                    Reject
                                </Button>
                            </div>
                            <Button variant="outline" onClick={() => handleSave()} disabled={saving || !reviewerName.trim()}>
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Saving..." : "Save current status"}
                            </Button>
                            {!reviewerName.trim() ? (
                                <p className="text-sm text-amber-600">Enter reviewer name before saving.</p>
                            ) : null}
                            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Marking rubric</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {question.markingRubric?.length ? (
                                question.markingRubric.map((item, index) => (
                                    <div key={index} className="grid grid-cols-[80px_1fr] overflow-hidden rounded-md border text-sm">
                                        <div className="bg-muted p-3 font-medium">{item.marks ?? "-"} mark</div>
                                        <div className="p-3">{item.criterion ?? "-"}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No rubric found for this record.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

function DatasetQaSkeleton() {
    return (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
            <Skeleton className="h-[640px]" />
            <div className="space-y-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-[520px]" />
            </div>
        </div>
    );
}
