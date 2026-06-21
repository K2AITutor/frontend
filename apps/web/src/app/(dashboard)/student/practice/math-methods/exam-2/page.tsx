// frontend/src/app/practice/math-methods/exam-2/page.tsx
import Link from "next/link";
import PracticeClient from "../../[subject]/PracticeClient";
import type { PracticeQuestion } from "@/types/question";
import { SUBJECT } from "@/lib/subjects";
import { apiGet } from "@/lib/apiClient";
import { PATH } from "@aitutor/shared";
import { Card, CardContent } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";

async function fetchExam2Questions(): Promise<PracticeQuestion[]> {
    const topicCodes = ["MM_T3", "MM_T4", "MM_T5", "MM_T6", "MM_T7", "MM_T8"]; // Diff + Apps + Int + Prob/Stats

    const results = await Promise.all(
        topicCodes.map(async (topicCode) => {
            try {
                return await apiGet<PracticeQuestion[]>(
                    `${PATH.questions.practice}?subject=MATH_METHODS&topicCode=${encodeURIComponent(topicCode)}`
                );
            } catch (err) {
                return [];
            }
        })
    );

    // Flatten + de-dup by id
    const flat = results.flat();
    const uniq = Array.from(new Map(flat.map((q) => [q.id, q])).values());

    // Optional: shuffle to feel like an exam paper
    uniq.sort(() => Math.random() - 0.5);

    // Limit to something "exam-like" (adjust later)
    return uniq.slice(0, 40);
}

export default async function MathMethodsExam2Page() {
    const initialQuestions = await fetchExam2Questions();

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/student/practice">
                                ← Back
                            </Link>
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Mathematical Methods</span> · Exam 2 (Practice Mode)
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ✅ PracticeClient only takes (initialQuestions, subject) */}
            <PracticeClient initialQuestions={initialQuestions} subject={SUBJECT.MATH_METHODS} />
        </div>
    );
}
