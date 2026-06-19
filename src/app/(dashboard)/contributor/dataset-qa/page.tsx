"use client";

import Link from "next/link";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle2, FileText, FlaskConical, Rocket, Save, Search, ShieldCheck, XCircle } from "lucide-react";
import { usePageTitle } from "@/lib/usePageTitle";
import {
    DatasetQaQuestion,
    DatasetQaStatus,
    DatasetTrainingReadiness,
    DatasetQaChecklist,
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

const TRAINING_READINESS_LABELS: Record<DatasetTrainingReadiness, string> = {
    PRACTICE_ONLY: "Practice only",
    TRAINING_READY: "Training ready",
    EXPERT_REVIEW: "Expert review",
};

const TRAINING_READINESS_STYLES: Record<DatasetTrainingReadiness, string> = {
    PRACTICE_ONLY: "border-slate-500/40 bg-slate-500/10 text-slate-200",
    TRAINING_READY: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
    EXPERT_REVIEW: "border-sky-500/40 bg-sky-500/15 text-sky-100",
};

function isManualReviewQuestion(question: DatasetQaQuestion, reviewStatus = question.reviewStatus) {
    return !question.isMarkable || reviewStatus === "MANUAL_REVIEW";
}

function isAutoCheckSafe(question: DatasetQaQuestion, checklist = question.qaChecklist, reviewStatus = question.reviewStatus) {
    return !isManualReviewQuestion(question, reviewStatus) && Boolean(checklist.markerTestPassed);
}

function markerVisibilityLabel(question: DatasetQaQuestion, checklist = question.qaChecklist, reviewStatus = question.reviewStatus) {
    if (isManualReviewQuestion(question, reviewStatus)) {
        return {
            label: "Manual review",
            detail: "Student answers need human review before scoring.",
            className: "border-purple-500/40 bg-purple-500/15 text-purple-100",
        };
    }

    if (isAutoCheckSafe(question, checklist, reviewStatus)) {
        return {
            label: "Auto-check safe",
            detail: "Expected answer passes the marker test and can be auto-scored.",
            className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
        };
    }

    return {
        label: "Auto-check pending",
        detail: "Run the marker test with the expected answer before approval.",
        className: "border-amber-500/40 bg-amber-500/15 text-amber-100",
    };
}

function contentVisibilityLabel(question: DatasetQaQuestion) {
    if (question.contentStatus === "ACTIVE") {
        return {
            label: "Live in practice",
            detail: "Students can see this record.",
            className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
        };
    }

    if (question.reviewStatus === "APPROVED") {
        return {
            label: "Waiting publish",
            detail: "Approved by contributor; owner/admin must publish before students see it.",
            className: "border-blue-500/40 bg-blue-500/15 text-blue-100",
        };
    }

    return {
        label: "Not live",
        detail: "Still in QA and hidden from student practice.",
        className: "border-slate-500/40 bg-slate-500/10 text-slate-200",
    };
}

function QaVisibilityBadges({
    question,
    checklist = question.qaChecklist,
    reviewStatus = question.reviewStatus,
    trainingReadiness = question.trainingReadiness,
    compact = false,
}: {
    question: DatasetQaQuestion;
    checklist?: DatasetQaChecklist;
    reviewStatus?: DatasetQaStatus;
    trainingReadiness?: DatasetTrainingReadiness;
    compact?: boolean;
}) {
    const marker = markerVisibilityLabel(question, checklist, reviewStatus);
    const content = contentVisibilityLabel({ ...question, reviewStatus });

    return (
        <div className={`flex flex-wrap gap-2 ${compact ? "text-[11px]" : "text-xs"}`}>
            <Badge variant="outline" className={marker.className} title={marker.detail}>
                {marker.label}
            </Badge>
            <Badge variant="outline" className={TRAINING_READINESS_STYLES[trainingReadiness]}>
                {TRAINING_READINESS_LABELS[trainingReadiness]}
            </Badge>
            <Badge variant="outline" className={content.className} title={content.detail}>
                {content.label}
            </Badge>
        </div>
    );
}

const CHECKLIST_ITEMS: Array<{ key: keyof DatasetQaChecklist; label: string }> = [
    { key: "sourceMatched", label: "Source matched" },
    { key: "topicChecked", label: "Topic checked" },
    { key: "answerChecked", label: "Answer checked" },
    { key: "acceptedAnswersChecked", label: "Accepted answers checked" },
    { key: "markerTestPassed", label: "Marker test passed" },
    { key: "rubricChecked", label: "Rubric checked" },
    { key: "solutionChecked", label: "Solution checked" },
];

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

function canPublishForRole(role: unknown) {
    return ["admin", "teacher"].includes(String(role ?? "").toLowerCase());
}

function approvedUnpublishedRows(rows: DatasetQaQuestion[]) {
    return rows.filter((row) => row.reviewStatus === "APPROVED" && row.contentStatus !== "ACTIVE");
}

function finalReviewSummary(rows: DatasetQaQuestion[]) {
    const byReviewer = Object.values(
        rows.reduce(
            (acc, row) => {
                const key = row.reviewerName?.trim() || `User ${row.reviewerUserId ?? "unknown"}`;
                if (!acc[key]) {
                    acc[key] = {
                        reviewer: key,
                        count: 0,
                        trainingReady: 0,
                        practiceOnly: 0,
                        expertReview: 0,
                        latestReviewedAt: "",
                    };
                }
                acc[key].count += 1;
                if (row.trainingReadiness === "TRAINING_READY") acc[key].trainingReady += 1;
                if (row.trainingReadiness === "PRACTICE_ONLY") acc[key].practiceOnly += 1;
                if (row.trainingReadiness === "EXPERT_REVIEW") acc[key].expertReview += 1;
                if (row.reviewedAt && row.reviewedAt > acc[key].latestReviewedAt) {
                    acc[key].latestReviewedAt = row.reviewedAt;
                }
                return acc;
            },
            {} as Record<
                string,
                {
                    reviewer: string;
                    count: number;
                    trainingReady: number;
                    practiceOnly: number;
                    expertReview: number;
                    latestReviewedAt: string;
                }
            >
        )
    ).sort((a, b) => b.count - a.count || a.reviewer.localeCompare(b.reviewer));

    const byTopic = Object.values(
        rows.reduce(
            (acc, row) => {
                const key = row.topicCode || "UNMAPPED";
                if (!acc[key]) {
                    acc[key] = {
                        topicCode: key,
                        count: 0,
                        marks: 0,
                        reviewers: new Set<string>(),
                    };
                }
                acc[key].count += 1;
                acc[key].marks += Number(row.marks || 0);
                acc[key].reviewers.add(row.reviewerName?.trim() || `User ${row.reviewerUserId ?? "unknown"}`);
                return acc;
            },
            {} as Record<string, { topicCode: string; count: number; marks: number; reviewers: Set<string> }>
        )
    ).sort((a, b) => b.count - a.count || a.topicCode.localeCompare(b.topicCode));

    return {
        byReviewer,
        byTopic,
        trainingReady: rows.filter((row) => row.trainingReadiness === "TRAINING_READY").length,
        practiceOnly: rows.filter((row) => row.trainingReadiness === "PRACTICE_ONLY").length,
        expertReview: rows.filter((row) => row.trainingReadiness === "EXPERT_REVIEW").length,
    };
}

function formatReviewDate(value: string | null | undefined) {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function asDatasetRows(value: unknown): DatasetQaQuestion[] {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
        const maybeRecords = (value as { records?: unknown; items?: unknown; data?: unknown }).records;
        const maybeItems = (value as { records?: unknown; items?: unknown; data?: unknown }).items;
        const maybeData = (value as { records?: unknown; items?: unknown; data?: unknown }).data;
        if (Array.isArray(maybeRecords)) return maybeRecords;
        if (Array.isArray(maybeItems)) return maybeItems;
        if (Array.isArray(maybeData)) return maybeData;
    }
    return [];
}

export default function ContributorDatasetQaPage() {
    usePageTitle("Dataset QA");

    const { data: session } = useSession();
    const canPublish = canPublishForRole((session?.user as any)?.role);
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
    const { data: rawData, isLoading: loading, isError: hasError, refetch } = useDatasetQaQuestions(datasetSourceKey);
    const data = useMemo(() => asDatasetRows(rawData), [rawData]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedPublishIds, setSelectedPublishIds] = useState<Set<number>>(new Set());
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
    const approvedForFinalReview = useMemo(() => approvedUnpublishedRows(data), [data]);
    const publishSummary = useMemo(() => finalReviewSummary(approvedForFinalReview), [approvedForFinalReview]);

    async function handlePublishApproved() {
        if (!canPublish || selectedPublishIds.size === 0) return;

        setPublishing(true);
        setPublishMessage(null);
        try {
            const result = await publishDatasetQaQuestions(datasetSourceKey, Array.from(selectedPublishIds));
            setPublishMessage(result.message);
            setSelectedPublishIds(new Set());
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

                <div className="grid gap-3 md:grid-cols-[180px_260px_280px]">
                    <Button variant="outline" asChild>
                        <Link href="/docs/contributor-dataset-qa-guide.pdf" target="_blank">
                            <FileText className="mr-2 h-4 w-4" />
                            Guide PDF
                        </Link>
                    </Button>
                    <div className="space-y-2">
                        <Label>Dataset source</Label>
                        <Select value={datasetSourceKey} onValueChange={(value) => {
                            setDatasetSourceKey(value);
                            setSelectedId(null);
                            setSelectedPublishIds(new Set());
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

            <FinalReviewPanel
                rows={approvedForFinalReview}
                summary={publishSummary}
                canPublish={canPublish}
                selectedIds={selectedPublishIds}
                setSelectedIds={setSelectedPublishIds}
                publishing={publishing}
                onPublish={handlePublishApproved}
            />

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
                                    </div>
                                    <div className="mt-3">
                                        <QaVisibilityBadges question={row} compact />
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
    const [rubricText, setRubricText] = useState(formatRubricForEdit(question.markingRubric));
    const [commonMistakes, setCommonMistakes] = useState(question.commonMistakes.join("\n"));
    const [trainingReadiness, setTrainingReadiness] = useState<DatasetTrainingReadiness>(question.trainingReadiness);
    const [qaChecklist, setQaChecklist] = useState<DatasetQaChecklist>(question.qaChecklist);
    const [topicCode, setTopicCode] = useState(question.topicCode ?? "");
    const [subtopicCode, setSubtopicCode] = useState(question.subtopicCode ?? "");
    const [reviewStatus, setReviewStatus] = useState<DatasetQaStatus>(question.reviewStatus);
    const [reviewNotes, setReviewNotes] = useState(question.reviewNotes ?? "");
    const [testAnswer, setTestAnswer] = useState(question.correctAnswer);
    const [message, setMessage] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<any>(question.lastMarkerTest ?? null);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    async function handleTest() {
        setTesting(true);
        setMessage(null);
        try {
            const result = await testDatasetQaAnswer(question.id, testAnswer);
            setTestResult(result);
            setQaChecklist((current) => ({
                ...current,
                markerTestPassed: result.isCorrect === true && Number(result.score ?? 0) >= Number(result.maxScore ?? question.marks),
            }));
        } catch (error: any) {
            setMessage(error?.message || "Failed to test answer");
        } finally {
            setTesting(false);
        }
    }

    function toggleChecklist(key: keyof DatasetQaChecklist) {
        setQaChecklist((current) => ({ ...current, [key]: !current[key] }));
    }

    function approvalBlockers(nextStatus: DatasetQaStatus) {
        if (nextStatus !== "APPROVED") return [];

        const blockers: string[] = [];
        if (!questionText.trim()) blockers.push("question text");
        if (!topicCode.trim()) blockers.push("topic code");
        if (!subtopicCode.trim()) blockers.push("subtopic code");
        if (!correctAnswer.trim() && question.isMarkable) blockers.push("correct answer");
        if (!workedSolution.trim()) blockers.push("worked solution");
        if (!rubricText.trim()) blockers.push("marking rubric");
        if (trainingReadiness === "TRAINING_READY" && !commonMistakes.trim()) {
            blockers.push("common mistakes for training-ready records");
        }

        const missingChecks = CHECKLIST_ITEMS
            .filter((item) => {
                if (!question.isMarkable && item.key === "markerTestPassed") return false;
                return !qaChecklist[item.key];
            })
            .map((item) => item.label.toLowerCase());

        if (missingChecks.length) {
            blockers.push(`checklist incomplete: ${missingChecks.join(", ")}`);
        }

        return blockers;
    }

    async function handleSave(nextStatus = reviewStatus) {
        const blockers = approvalBlockers(nextStatus);
        if (blockers.length) {
            setMessage(`Cannot approve yet. Missing: ${blockers.join("; ")}.`);
            return;
        }

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
                markingRubric: parseRubricFromEdit(rubricText),
                commonMistakes: commonMistakes.split(/\n+/g).map((item) => item.trim()).filter(Boolean),
                trainingReadiness,
                qaChecklist,
                lastMarkerTest: testResult,
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
                            <div className="mt-3">
                                <QaVisibilityBadges
                                    question={question}
                                    checklist={qaChecklist}
                                    reviewStatus={reviewStatus}
                                    trainingReadiness={trainingReadiness}
                                />
                            </div>
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
                        <Field label="Marking rubric">
                            <Textarea
                                rows={7}
                                value={rubricText}
                                onChange={(event) => setRubricText(event.target.value)}
                                placeholder="One criterion per line, for example: 1 | Correct derivative using the product rule."
                            />
                        </Field>
                        <Field label="Common mistakes">
                            <Textarea
                                rows={5}
                                value={commonMistakes}
                                onChange={(event) => setCommonMistakes(event.target.value)}
                                placeholder="One common mistake per line"
                            />
                        </Field>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Training quality gate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border bg-muted/20 p-3">
                                <QaVisibilityBadges
                                    question={question}
                                    checklist={qaChecklist}
                                    reviewStatus={reviewStatus}
                                    trainingReadiness={trainingReadiness}
                                />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Auto-check safe records can be machine-scored. Manual review records need human judgement.
                                    Training ready records are suitable for model training; practice-only records should stay out of training data.
                                </p>
                            </div>
                            <Field label="Training readiness">
                                <Select
                                    value={trainingReadiness}
                                    onValueChange={(value) => setTrainingReadiness(value as DatasetTrainingReadiness)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(TRAINING_READINESS_LABELS) as DatasetTrainingReadiness[]).map((value) => (
                                            <SelectItem key={value} value={value}>
                                                {TRAINING_READINESS_LABELS[value]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <div className="grid gap-2 md:grid-cols-2">
                                {CHECKLIST_ITEMS.map((item) => {
                                    const checked = qaChecklist[item.key];
                                    const disabled = !question.isMarkable && item.key === "markerTestPassed";

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => toggleChecklist(item.key)}
                                            className={`rounded-md border p-3 text-left text-sm transition ${
                                                checked
                                                    ? "border-emerald-600 bg-emerald-600/15 text-emerald-100"
                                                    : "bg-muted/20 text-muted-foreground"
                                            } ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-muted"}`}
                                        >
                                            <span className="font-medium">{checked ? "Checked" : "Open"}</span>
                                            <span className="ml-2">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Approve requires all applicable checks. Use Expert review when the record is useful but not ready for model training.
                            </p>
                        </CardContent>
                    </Card>

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
                            {parseRubricFromEdit(rubricText).length ? (
                                parseRubricFromEdit(rubricText).map((item, index) => (
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

function FinalReviewPanel({
    rows,
    summary,
    canPublish,
    selectedIds,
    setSelectedIds,
    publishing,
    onPublish,
}: {
    rows: DatasetQaQuestion[];
    summary: ReturnType<typeof finalReviewSummary>;
    canPublish: boolean;
    selectedIds: Set<number>;
    setSelectedIds: Dispatch<SetStateAction<Set<number>>>;
    publishing: boolean;
    onPublish: () => Promise<void>;
}) {
    const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

    function toggleOne(id: number) {
        setSelectedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        setSelectedIds((current) => {
            if (rows.length > 0 && rows.every((row) => current.has(row.id))) {
                return new Set();
            }
            return new Set(rows.map((row) => row.id));
        });
    }

    return (
        <Card>
            <CardHeader className="flex flex-col gap-3 pb-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Rocket className="h-5 w-5 text-primary" />
                        Owner final review
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Contributor approval is evidence for final review. Student practice only changes after an admin or teacher publishes selected records.
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={onPublish}
                    disabled={!canPublish || publishing || selectedIds.size === 0}
                >
                    <Rocket className="mr-2 h-4 w-4" />
                    {publishing ? "Publishing..." : `Publish selected ${selectedIds.size}`}
                </Button>
            </CardHeader>
            <CardContent className="space-y-5">
                {!canPublish ? (
                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                        Contributors can approve records, but only an admin or teacher can publish them to student practice.
                    </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Approved waiting publish</p>
                        <p className="mt-1 text-2xl font-semibold">{rows.length}</p>
                    </div>
                    <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Training ready</p>
                        <p className="mt-1 text-2xl font-semibold">{summary.trainingReady}</p>
                    </div>
                    <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Practice only</p>
                        <p className="mt-1 text-2xl font-semibold">{summary.practiceOnly}</p>
                    </div>
                    <div className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">Expert review</p>
                        <p className="mt-1 text-2xl font-semibold">{summary.expertReview}</p>
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-md border">
                        <div className="border-b p-3 font-medium">Approved by reviewer</div>
                        <div className="divide-y">
                            {summary.byReviewer.length ? (
                                summary.byReviewer.map((row) => (
                                    <div key={row.reviewer} className="grid grid-cols-[1fr_70px_96px] gap-3 p-3 text-sm">
                                        <div>
                                            <div className="font-medium">{row.reviewer}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Latest review {formatReviewDate(row.latestReviewedAt)}
                                            </div>
                                        </div>
                                        <div className="text-right font-semibold">{row.count}</div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            {row.trainingReady} train
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-muted-foreground">No approved unpublished records.</div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <div className="border-b p-3 font-medium">Approved by category</div>
                        <div className="max-h-64 divide-y overflow-auto">
                            {summary.byTopic.length ? (
                                summary.byTopic.map((row) => (
                                    <div key={row.topicCode} className="grid grid-cols-[1fr_72px_72px] gap-3 p-3 text-sm">
                                        <div>
                                            <div className="font-medium">{readableCode(row.topicCode, TOPIC_LABELS)}</div>
                                            <div className="text-xs text-muted-foreground">{row.topicCode}</div>
                                        </div>
                                        <div className="text-right">{row.count} q</div>
                                        <div className="text-right">{row.marks} marks</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-muted-foreground">No category summary yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="rounded-md border">
                    <div className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-medium">Publish queue</p>
                            <p className="text-sm text-muted-foreground">
                                Select only the records you have final-reviewed and want students to see.
                            </p>
                        </div>
                        {canPublish ? (
                            <Button type="button" variant="outline" size="sm" onClick={toggleAll} disabled={!rows.length}>
                                {allSelected ? "Clear selection" : "Select all approved"}
                            </Button>
                        ) : null}
                    </div>
                    <div className="max-h-80 divide-y overflow-auto">
                        {rows.length ? (
                            rows.map((row) => (
                                <label
                                    key={row.id}
                                    className="grid cursor-pointer grid-cols-[24px_88px_minmax(0,1fr)_140px] gap-3 p-3 text-sm hover:bg-muted/40"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1"
                                        disabled={!canPublish}
                                        checked={selectedIds.has(row.id)}
                                        onChange={() => toggleOne(row.id)}
                                    />
                                    <div className="font-medium">Q{row.questionNumber}</div>
                                    <div className="min-w-0">
                                        <div className="truncate">{readableCode(row.topicCode, TOPIC_LABELS)}</div>
                                        <div className="truncate text-xs text-muted-foreground">
                                            {readableCode(row.subtopicCode, SUBTOPIC_LABELS)}
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <div>{row.reviewerName || "Reviewer unknown"}</div>
                                        <Badge variant="outline" className="mt-1">
                                            {TRAINING_READINESS_LABELS[row.trainingReadiness]}
                                        </Badge>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <div className="p-4 text-sm text-muted-foreground">
                                No approved records are waiting for owner publish.
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
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

function formatRubricForEdit(rubric: Array<{ marks?: number; criterion?: string }>) {
    return rubric
        .map((item) => {
            const marks = item.marks == null ? "" : String(item.marks);
            return `${marks} | ${item.criterion ?? ""}`.trim();
        })
        .filter(Boolean)
        .join("\n");
}

function parseRubricFromEdit(value: string) {
    return value
        .split(/\n+/g)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [marksPart, ...criterionParts] = line.split("|");
            const parsedMarks = Number(marksPart.trim());
            const criterion = criterionParts.length ? criterionParts.join("|").trim() : line;

            return {
                marks: Number.isFinite(parsedMarks) ? parsedMarks : undefined,
                criterion,
            };
        })
        .filter((item) => item.criterion);
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
