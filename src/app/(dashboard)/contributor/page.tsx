"use client";

import Link from "next/link";
import { usePageTitle } from "@/lib/usePageTitle";
import { useContributorDashboardData } from "@/lib/api/contributor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Skeleton } from "@/components/dashboard/ui/skeleton";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
    ClipboardList,
    BookOpen,
    Library,
    ArrowRight,
    Clock3,
    FilePlus2,
    CheckCircle2,
} from "lucide-react";

export default function ContributorDashboardPage() {
    usePageTitle("Contributor Dashboard");
    const { data, isLoading, isError } = useContributorDashboardData();

    if (isLoading) return <ContributorDashboardSkeleton />;

    if (isError || !data) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Failed to load contributor dashboard</p>
            </div>
        );
    }

    const hasRecentTasks = data.recentTasks.length > 0;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Contributor Dashboard</h1>
                <p className="text-muted-foreground">
                    Build structured question drafts, lightweight rubrics, and future dataset-ready content.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatsCard
                    title="Assigned Tasks"
                    value={data.summary.assignedTasks}
                    subtitle="Work formally assigned"
                    icon={ClipboardList}
                />
                <StatsCard
                    title="To Do"
                    value={data.summary.todoTasks}
                    subtitle="Ready to start"
                    icon={Clock3}
                />
                <StatsCard
                    title="Draft Questions"
                    value={data.summary.draftQuestions}
                    subtitle="Created by you"
                    icon={BookOpen}
                />
                <StatsCard
                    title="Draft Rubrics"
                    value={data.summary.draftRubrics}
                    subtitle="Linked marking guides"
                    icon={Library}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">What to do next</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 font-medium">
                                <FilePlus2 className="h-4 w-4" />
                                Create a question draft
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Add structured question content with prompt, metadata, answer type, and source.
                            </p>
                            <Button size="sm" className="w-full" asChild>
                                <Link href="/contributor/questions/new">New Draft</Link>
                            </Button>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Review your drafts
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Check question details, fix metadata, and submit ready drafts for review.
                            </p>
                            <Button size="sm" variant="outline" className="w-full" asChild>
                                <Link href="/contributor/questions">Open Drafts</Link>
                            </Button>
                        </div>

                        <div className="rounded-lg border p-4">
                            <div className="mb-3 flex items-center gap-2 font-medium">
                                <Library className="h-4 w-4" />
                                Build rubrics
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Add lightweight criteria, marking notes, and model answers linked to questions.
                            </p>
                            <Button size="sm" variant="outline" className="w-full" asChild>
                                <Link href="/contributor/rubrics">View Rubrics</Link>
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
                            <Link href="/contributor/questions/new">
                                <BookOpen className="mr-2 h-4 w-4" />
                                New Question Draft
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/contributor/questions">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                View Question Drafts
                            </Link>
                        </Button>

                        <Button variant="outline" className="w-full justify-start" asChild>
                            <Link href="/contributor/rubrics">
                                <Library className="mr-2 h-4 w-4" />
                                View Rubric Drafts
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Tasks</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/contributor/tasks">
                                View all <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {hasRecentTasks ? (
                        data.recentTasks.map((task) => (
                            <div
                                key={task.id}
                                className="rounded-lg border p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">{task.title}</p>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span className="rounded bg-muted px-2 py-1">{task.type}</span>
                                        <span className="rounded bg-muted px-2 py-1">{task.status}</span>
                                        <span className="rounded bg-muted px-2 py-1">Priority {task.priority}</span>
                                    </div>
                                </div>

                                <Button variant="outline" asChild>
                                    <Link href="/contributor/tasks">Open</Link>
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-lg border border-dashed p-6 text-center">
                            <p className="font-medium">No assigned tasks yet</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Start manually by creating a new question draft, then build a rubric for it.
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <Button asChild>
                                    <Link href="/contributor/questions/new">Create Question Draft</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/contributor/questions">View Existing Drafts</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ContributorDashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-80" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
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