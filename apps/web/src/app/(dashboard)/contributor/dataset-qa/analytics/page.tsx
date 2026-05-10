"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    AlertTriangle,
    BarChart3,
    BookOpenCheck,
    Brain,
    CheckCircle2,
    Database,
    FileDown,
    ShieldCheck,
} from "lucide-react";
import { usePageTitle } from "@/lib/usePageTitle";
import { DatasetQaQuestion, DatasetQaStatus, useDatasetQaQuestions } from "@/lib/api/contributor";
import { Badge } from "@/components/dashboard/ui/badge";
import { Button } from "@/components/dashboard/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/dashboard/ui/select";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/dashboard/ui/table";

type TrainingLabel =
    | "TRAIN_READY"
    | "EVAL_READY"
    | "MANUAL_ONLY"
    | "NEEDS_REVIEW"
    | "EXCLUDE_FROM_TRAINING";

interface ExamOption {
    key: string;
    label: string;
    available: boolean;
}

interface SubjectOption {
    key: string;
    label: string;
    exams: ExamOption[];
}

const SUBJECTS: SubjectOption[] = [
    {
        key: "VCE_MM",
        label: "VCE Mathematical Methods",
        exams: [
            { key: "VCE_MM_EXAM1_2025", label: "2025 Exam 1", available: true },
            { key: "VCE_MM_EXAM1_2024", label: "2024 Exam 1", available: true },
        ],
    },
    {
        key: "VCE_SPEC",
        label: "VCE Specialist Mathematics",
        exams: [{ key: "VCE_SPEC_EXAM1_2025", label: "2025 Exam 1", available: false }],
    },
    {
        key: "VCE_GENERAL",
        label: "VCE General Mathematics",
        exams: [{ key: "VCE_GENERAL_EXAM1_2025", label: "2025 Exam 1", available: false }],
    },
];

const STATUS_LABELS: Record<DatasetQaStatus, string> = {
    READY_FOR_QA: "Ready for QA",
    APPROVED: "Approved",
    NEEDS_FIX: "Needs fix",
    REJECTED: "Rejected",
    MANUAL_REVIEW: "Manual review",
};

const TRAINING_LABELS: Record<TrainingLabel, string> = {
    TRAIN_READY: "Train ready",
    EVAL_READY: "Eval ready",
    MANUAL_ONLY: "Manual only",
    NEEDS_REVIEW: "Needs review",
    EXCLUDE_FROM_TRAINING: "Exclude",
};

const SECTION_GUIDE = [
    {
        section: "Dataset summary",
        shows: "Total records, total marks, review decisions, and available exams.",
        why: "Confirms whether the dataset is complete enough to use or still needs QA work.",
    },
    {
        section: "Topic coverage",
        shows: "Question count and marks grouped by topic and subtopic.",
        why: "Shows whether the exam data is balanced or over-representing a small part of the course.",
    },
    {
        section: "Answer type mix",
        shows: "How many questions are expressions, numbers, intervals, coordinates, graph/manual tasks, or other types.",
        why: "Helps decide what the model can learn from now and which answer formats need better tooling.",
    },
    {
        section: "Machine-markable coverage",
        shows: "Auto-checkable versus manual-review records and the marking engine used.",
        why: "Separates records useful for automated practice from records that need human evaluation.",
    },
    {
        section: "Training suitability",
        shows: "Derived labels such as train ready, eval ready, needs review, manual only, or exclude.",
        why: "Prevents weak or incomplete records from being used blindly for model training or evaluation.",
    },
    {
        section: "Problem flags",
        shows: "Missing answers, missing worked solutions, missing rubric, manual-review items, and rejected records.",
        why: "Gives contributors a focused fix list before the dataset is locked.",
    },
];

const TOPIC_LABELS: Record<string, string> = {
    MM_CALC_DIFF_RULES: "Differentiation rules",
    MM_CALC_ANTI_DIFF: "Antidifferentiation",
    MM_FUNC_TRIGONOMETRIC: "Trigonometric functions",
    MM_CIRC: "Circular functions",
    MM_STAT_RANDOM_VARIABLES: "Random variables",
    MM_STAT_BINOMIAL: "Binomial distributions",
    MM_FUNC_POLYNOMIAL: "Polynomial functions",
    MM_FUNC_RESTRICTED_DOMAIN: "Restricted domains and inverse functions",
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
};

function readableCode(code: string | null | undefined, labels: Record<string, string>) {
    if (!code) return "Unmapped";
    return labels[code] ?? code.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function getTrainingLabel(row: DatasetQaQuestion): TrainingLabel {
    const hasAnswer = Boolean(row.correctAnswer?.trim() || row.acceptedAnswers?.length);
    const hasSolution = Boolean(row.workedSolution?.trim());
    const hasRubric = Boolean(row.markingRubric?.length);

    if (row.reviewStatus === "REJECTED") return "EXCLUDE_FROM_TRAINING";
    if (!row.questionText?.trim() || !hasAnswer || !hasSolution || !hasRubric) return "EXCLUDE_FROM_TRAINING";
    if (row.reviewStatus === "NEEDS_FIX" || row.reviewStatus === "READY_FOR_QA") return "NEEDS_REVIEW";
    if (row.reviewStatus === "MANUAL_REVIEW" || !row.isMarkable) return "MANUAL_ONLY";
    if (row.reviewStatus === "APPROVED" && row.isMarkable) return "TRAIN_READY";
    return "EVAL_READY";
}

function countBy<T extends string>(rows: DatasetQaQuestion[], getKey: (row: DatasetQaQuestion) => T) {
    return rows.reduce(
        (acc, row) => {
            const key = getKey(row);
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        },
        {} as Record<T, number>
    );
}

function buildAnalytics(rows: DatasetQaQuestion[]) {
    const totalMarks = rows.reduce((sum, row) => sum + Number(row.marks || 0), 0);
    const statusCounts = countBy(rows, (row) => row.reviewStatus);
    const trainingCounts = rows.reduce(
        (acc, row) => {
            const label = getTrainingLabel(row);
            acc[label] = (acc[label] ?? 0) + 1;
            return acc;
        },
        {} as Record<TrainingLabel, number>
    );
    const answerTypeRows = Object.entries(countBy(rows, (row) => row.answerType || "UNKNOWN"))
        .map(([answerType, count]) => ({
            answerType,
            count,
            marks: rows
                .filter((row) => (row.answerType || "UNKNOWN") === answerType)
                .reduce((sum, row) => sum + Number(row.marks || 0), 0),
        }))
        .sort((a, b) => b.count - a.count || a.answerType.localeCompare(b.answerType));

    const topicRows = Object.values(
        rows.reduce(
            (acc, row) => {
                const key = `${row.topicCode || "UNMAPPED"}::${row.subtopicCode || "UNMAPPED"}`;
                if (!acc[key]) {
                    acc[key] = {
                        topicCode: row.topicCode || "UNMAPPED",
                        subtopicCode: row.subtopicCode || "UNMAPPED",
                        count: 0,
                        marks: 0,
                        autoCheck: 0,
                        manual: 0,
                    };
                }
                acc[key].count += 1;
                acc[key].marks += Number(row.marks || 0);
                if (row.isMarkable) acc[key].autoCheck += 1;
                else acc[key].manual += 1;
                return acc;
            },
            {} as Record<
                string,
                {
                    topicCode: string;
                    subtopicCode: string;
                    count: number;
                    marks: number;
                    autoCheck: number;
                    manual: number;
                }
            >
        )
    ).sort((a, b) => b.marks - a.marks || a.topicCode.localeCompare(b.topicCode));

    const flaggedRows = rows
        .map((row) => {
            const flags = [];
            if (!row.correctAnswer?.trim() && !row.acceptedAnswers?.length) flags.push("Missing answer");
            if (!row.workedSolution?.trim()) flags.push("Missing solution");
            if (!row.markingRubric?.length) flags.push("Missing rubric");
            if (row.reviewStatus === "NEEDS_FIX") flags.push("Needs fix");
            if (row.reviewStatus === "REJECTED") flags.push("Rejected");
            if (row.reviewStatus === "MANUAL_REVIEW" || !row.isMarkable) flags.push("Manual review");
            if (!row.topicCode || !row.subtopicCode) flags.push("Missing topic mapping");
            return { row, flags };
        })
        .filter((item) => item.flags.length > 0)
        .sort((a, b) => b.flags.length - a.flags.length || a.row.questionNumber.localeCompare(b.row.questionNumber));

    const machineRows = Object.values(
        rows.reduce(
            (acc, row) => {
                const key = row.isMarkable ? row.machineEngine || "AUTO_CHECK" : "MANUAL_REVIEW";
                if (!acc[key]) acc[key] = { engine: key, count: 0, marks: 0 };
                acc[key].count += 1;
                acc[key].marks += Number(row.marks || 0);
                return acc;
            },
            {} as Record<string, { engine: string; count: number; marks: number }>
        )
    ).sort((a, b) => b.count - a.count || a.engine.localeCompare(b.engine));

    return {
        totalMarks,
        statusCounts,
        trainingCounts,
        answerTypeRows,
        topicRows,
        flaggedRows,
        machineRows,
        autoCheckCount: rows.filter((row) => row.isMarkable).length,
        manualCount: rows.filter((row) => !row.isMarkable || row.reviewStatus === "MANUAL_REVIEW").length,
    };
}

export default function ContributorDatasetAnalyticsPage() {
    usePageTitle("Dataset Analytics");

    const [subjectKey, setSubjectKey] = useState(SUBJECTS[0].key);
    const selectedSubject = SUBJECTS.find((subject) => subject.key === subjectKey) ?? SUBJECTS[0];
    const availableExam = selectedSubject.exams.find((exam) => exam.available) ?? selectedSubject.exams[0];
    const [examKeyBySubject, setExamKeyBySubject] = useState<Record<string, string>>({
        [SUBJECTS[0].key]: SUBJECTS[0].exams[0].key,
    });
    const examKey = examKeyBySubject[subjectKey] ?? availableExam.key;
    const selectedExam = selectedSubject.exams.find((exam) => exam.key === examKey) ?? availableExam;
    const { data = [], isLoading, isError } = useDatasetQaQuestions(examKey, selectedExam.available);
    const analytics = useMemo(() => buildAnalytics(data), [data]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Dataset Analytics</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Evaluate dataset quality, coverage, QA status, and training suitability across subjects.
                    </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[260px_220px]">
                    <Select
                        value={subjectKey}
                        onValueChange={(value) => {
                            setSubjectKey(value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {SUBJECTS.map((subject) => (
                                <SelectItem key={subject.key} value={subject.key}>
                                    {subject.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={examKey}
                        onValueChange={(value) =>
                            setExamKeyBySubject((current) => ({
                                ...current,
                                [subjectKey]: value,
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select exam" />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedSubject.exams.map((exam) => (
                                <SelectItem key={exam.key} value={exam.key}>
                                    {exam.label}{exam.available ? "" : " (planned)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {!selectedExam.available ? (
                <Card>
                    <CardContent className="p-8">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-1 h-5 w-5 text-amber-500" />
                            <div>
                                <p className="font-medium">No QA dataset loaded for this subject yet.</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add seed data and expose it through Dataset QA before analytics can calculate coverage.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : isLoading ? (
                <AnalyticsSkeleton />
            ) : isError ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Failed to load dataset analytics.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            title="Dataset records"
                            value={data.length}
                            subtitle={`${analytics.totalMarks} total marks`}
                            icon={<Database className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Approved"
                            value={analytics.statusCounts.APPROVED ?? 0}
                            subtitle={`${analytics.statusCounts.READY_FOR_QA ?? 0} still ready for QA`}
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Auto-checkable"
                            value={analytics.autoCheckCount}
                            subtitle={`${analytics.manualCount} manual-review records`}
                            icon={<ShieldCheck className="h-5 w-5" />}
                        />
                        <MetricCard
                            title="Train ready"
                            value={analytics.trainingCounts.TRAIN_READY ?? 0}
                            subtitle={`${analytics.trainingCounts.NEEDS_REVIEW ?? 0} need review first`}
                            icon={<Brain className="h-5 w-5" />}
                        />
                    </div>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Analytics Guide</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Section</TableHead>
                                        <TableHead>What it shows</TableHead>
                                        <TableHead>Why it matters</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {SECTION_GUIDE.map((row) => (
                                        <TableRow key={row.section}>
                                            <TableCell className="font-medium">{row.section}</TableCell>
                                            <TableCell>{row.shows}</TableCell>
                                            <TableCell>{row.why}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Review Quality</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Records</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(Object.keys(STATUS_LABELS) as DatasetQaStatus[]).map((status) => (
                                            <TableRow key={status}>
                                                <TableCell>{STATUS_LABELS[status]}</TableCell>
                                                <TableCell className="text-right">{analytics.statusCounts[status] ?? 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Training Suitability</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Label</TableHead>
                                            <TableHead className="text-right">Records</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(Object.keys(TRAINING_LABELS) as TrainingLabel[]).map((label) => (
                                            <TableRow key={label}>
                                                <TableCell>{TRAINING_LABELS[label]}</TableCell>
                                                <TableCell className="text-right">{analytics.trainingCounts[label] ?? 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col gap-3 pb-2 md:flex-row md:items-center md:justify-between">
                            <CardTitle className="text-lg">Topic Coverage</CardTitle>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/contributor/dataset-qa">
                                    <BookOpenCheck className="mr-2 h-4 w-4" />
                                    Open QA queue
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Subtopic</TableHead>
                                        <TableHead className="text-right">Question parts</TableHead>
                                        <TableHead className="text-right">Marks</TableHead>
                                        <TableHead className="text-right">Auto-check</TableHead>
                                        <TableHead className="text-right">Manual</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.topicRows.map((row) => (
                                        <TableRow key={`${row.topicCode}-${row.subtopicCode}`}>
                                            <TableCell>
                                                <div className="font-medium">{readableCode(row.topicCode, TOPIC_LABELS)}</div>
                                                <div className="text-xs text-muted-foreground">{row.topicCode}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div>{readableCode(row.subtopicCode, SUBTOPIC_LABELS)}</div>
                                                <div className="text-xs text-muted-foreground">{row.subtopicCode}</div>
                                            </TableCell>
                                            <TableCell className="text-right">{row.count}</TableCell>
                                            <TableCell className="text-right">{row.marks}</TableCell>
                                            <TableCell className="text-right">{row.autoCheck}</TableCell>
                                            <TableCell className="text-right">{row.manual}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 xl:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Answer Type Mix</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Answer type</TableHead>
                                            <TableHead className="text-right">Records</TableHead>
                                            <TableHead className="text-right">Marks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analytics.answerTypeRows.map((row) => (
                                            <TableRow key={row.answerType}>
                                                <TableCell>{row.answerType}</TableCell>
                                                <TableCell className="text-right">{row.count}</TableCell>
                                                <TableCell className="text-right">{row.marks}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Marking Engine Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Engine</TableHead>
                                            <TableHead className="text-right">Records</TableHead>
                                            <TableHead className="text-right">Marks</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {analytics.machineRows.map((row) => (
                                            <TableRow key={row.engine}>
                                                <TableCell>{row.engine}</TableCell>
                                                <TableCell className="text-right">{row.count}</TableCell>
                                                <TableCell className="text-right">{row.marks}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader className="flex flex-col gap-3 pb-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-lg">Problem Flags</CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Fix these before using the dataset for model training or evaluation.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" disabled>
                                <FileDown className="mr-2 h-4 w-4" />
                                Export later
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Question</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Flags</TableHead>
                                        <TableHead>Training label</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.flaggedRows.length ? (
                                        analytics.flaggedRows.map(({ row, flags }) => (
                                            <TableRow key={row.id}>
                                                <TableCell className="font-medium">Question {row.questionNumber}</TableCell>
                                                <TableCell>{readableCode(row.topicCode, TOPIC_LABELS)}</TableCell>
                                                <TableCell>{STATUS_LABELS[row.reviewStatus]}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {flags.map((flag) => (
                                                            <Badge key={flag} variant="outline">
                                                                {flag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{TRAINING_LABELS[getTrainingLabel(row)]}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                No problem flags found for this dataset.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

function MetricCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-1 text-3xl font-semibold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
            </CardContent>
        </Card>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-28" />
                ))}
            </div>
            <Skeleton className="h-72" />
            <div className="grid gap-6 xl:grid-cols-2">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
            </div>
            <Skeleton className="h-[420px]" />
        </div>
    );
}
