/*Purpose/content: keeps the main Math Methods practice page in the same polished student-portal style.*/
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/dashboard/ui/card';
import { Button } from '@/components/dashboard/ui/button';

export default function MathMethodsPracticeHub() {
    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <h1 className="text-2xl font-bold tracking-tight">
                    VCE Mathematical Methods
                </h1>
                <p className="max-w-3xl text-lg text-muted-foreground">
                    Practise by topic, sit full past examinations, and receive examiner-style
                    feedback.
                </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <div className="mb-2 inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Best place to begin
                        </div>
                        <CardTitle className="text-2xl">Start Topic Practice</CardTitle>
                        <p className="mt-1 text-lg font-medium text-primary">
                            Learn step by step before moving into exam conditions.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <p className="leading-8 text-muted-foreground">
                            Build confidence through guided topic-based questions designed for
                            learning. Get AI hints, explanations, and follow-up support when you
                            make mistakes.
                        </p>

                        <div className="rounded-lg border border-border bg-muted/50 p-4">
                            <h3 className="mb-3 text-lg font-semibold">What you get</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>• AI hints and explanations</li>
                                <li>• Topic-by-topic preparation</li>
                                <li>• Similar question support</li>
                                <li>• Focus on weak areas</li>
                            </ul>
                        </div>

                        <Button asChild>
                            <Link href="/student/practice/math-methods/topic">
                                Start Topic Practice
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Examination 1 — No CAS</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <p className="leading-8 text-muted-foreground">
                            Practise real VCAA Examination 1 questions under exam conditions, with
                            exact answers required.
                        </p>

                        <ul className="space-y-2 text-muted-foreground">
                            <li>• Past papers (2006–2025)</li>
                            <li>• Exact values enforced</li>
                            <li>• Examiner-style marking</li>
                        </ul>

                        <Button asChild variant="destructive">
                            <Link href="/student/practice/math-methods/exam-1">
                                Exam 1 Practice
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Examination 2 — CAS</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <p className="leading-8 text-muted-foreground">
                            Prepare for Examination 2 with CAS-based extended response questions.
                        </p>

                        <ul className="space-y-2 text-muted-foreground">
                            <li>• CAS allowed</li>
                            <li>• Interpretation & reasoning</li>
                            <li>• Examiner feedback</li>
                        </ul>

                        <Button asChild>
                            <Link href="/student/practice/math-methods/exam-2">
                                Exam 2 Practice
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
