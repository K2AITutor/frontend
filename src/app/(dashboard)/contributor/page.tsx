"use client";

import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";
import { DatasetQaQuestion, DatasetQaStatus, useDatasetQaQuestions } from "@/lib/api/contributor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
    FileText,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    ClipboardCheck,
    BarChart3,
} from "lucide-react";

export default function ContributorDashboardPage() {
    usePageTitle("Contributor Dashboard");
    const { data = [], isLoading, isError } = useDatasetQaQuestions("VCE_MM_EXAM1_2025");

    if (isLoading) return <ContributorDashboardSkeleton />;

    if (isError || !data) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Failed to load contributor dashboard</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Contributor Dashboard</h1>
                <p className="text-muted-foreground">
                    Review dataset questions, test expected answers, and record QA decisions before release.
                </p>
            </div>

            <DatasetOverviewStats rows={data} />

            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Dataset QA"
                    value="Exam 1"
                    subtitle="Review ready-for-QA records"
                    icon={ShieldCheck}
                />
                <StatsCard
                    title="Questions"
                    value={data.length}
                    subtitle="2025 Exam 1 records loaded"
                    icon={ClipboardCheck}
                />
                <StatsCard
                    title="Manual Review"
                    value={data.filter((row) => row.reviewStatus === "MANUAL_REVIEW").length}
                    subtitle="Graph, proof, or non-machine items"
                    icon={AlertTriangle}
                />
                <StatsCard
                    title="Analytics"
                    value="Coverage"
                    subtitle="Review model-training readiness"
                    icon={BarChart3}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">What to do next</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 font-medium">
                                <ShieldCheck className="h-4 w-4" />
                                Open Dataset QA
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Review question text, expected answers, worked solutions, topic codes, and marker results.
                            </p>
                            <Button size="sm" className="w-full" asChild>
                                <Link href="/contributor/dataset-qa">Start QA Review</Link>
                            </Button>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 font-medium">
                                <BarChart3 className="h-4 w-4" />
                                Review Dataset Analytics
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Check topic coverage, machine-markable records, problem flags, and training suitability.
                            </p>
                            <Button size="sm" variant="outline" className="w-full" asChild>
                                <Link href="/contributor/dataset-qa/analytics">Open Analytics</Link>
                            </Button>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 font-medium">
                                <FileText className="h-4 w-4" />
                                Read the QA guide
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Follow the student testing flow and use consistent approve, fix, reject, or manual-review decisions.
                            </p>
                            <Button size="sm" variant="outline" className="w-full" asChild>
                                <Link href="/docs/contributor-dataset-qa-guide.pdf" target="_blank">
                                    Open PDF Guide
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" asChild>
                            <Link href="/contributor/dataset-qa">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Dataset QA Tool
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/contributor/dataset-qa/analytics">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Dataset Analytics
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/docs/contributor-dataset-qa-guide.pdf" target="_blank">
                                <FileText className="mr-2 h-4 w-4" />
                                QA Guide PDF
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="#golden-example">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Golden Example
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card id="golden-example">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Golden Example</CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="rounded-lg border p-5">
                        <p className="font-medium">Use 2025 Exam 1, Question 1a as the model QA check.</p>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                            <p>Expected answer: <span className="font-medium text-foreground">2x cos(x) - x^2 sin(x)</span></p>
                            <p>Marker result: <span className="font-medium text-foreground">Correct, 1 / 1</span></p>
                            <p>Topic check: Differentiation rules / Product rule.</p>
                            <p>Decision: Approved when text, answer, solution, rubric, and marker result match.</p>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Reviewer note example: Checked against source. Expected answer marks correct.
                            Product rule topic is correct.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/contributor/dataset-qa">Open Dataset QA</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href="/docs/contributor-dataset-qa-guide.pdf" target="_blank">
                                    Open Full Guide
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function DatasetOverviewStats({ rows }: { rows: DatasetQaQuestion[] }) {
    const statuses: DatasetQaStatus[] = ["READY_FOR_QA", "APPROVED", "NEEDS_FIX", "REJECTED", "MANUAL_REVIEW"];
    const labels: Record<DatasetQaStatus, string> = {
        READY_FOR_QA: "Ready for QA",
        APPROVED: "Approved",
        NEEDS_FIX: "Needs fix",
        REJECTED: "Rejected",
        MANUAL_REVIEW: "Manual review",
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Dataset Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5">
                {statuses.map((status) => (
                    <div key={status} className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">{labels[status]}</p>
                        <p className="mt-1 text-2xl font-semibold">
                            {rows.filter((row) => row.reviewStatus === status).length}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function ContributorDashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Skeleton className="h-[260px] xl:col-span-2" />
                <Skeleton className="h-[260px]" />
            </div>

            <Skeleton className="h-[240px]" />
        </div>
    );
}
