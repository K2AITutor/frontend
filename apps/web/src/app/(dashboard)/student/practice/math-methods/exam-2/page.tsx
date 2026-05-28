// frontend/src/app/practice/math-methods/exam-2/page.tsx
import Link from "next/link";
import PracticeClient from "../../[subject]/PracticeClient";
import type { PracticeQuestion } from "@/types/question";
import { SUBJECT } from "@/lib/subjects";
import { apiGet } from "@/lib/apiClient";
import { PATH } from "@aitutor/shared";

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

    // Limit to something “exam-like” (adjust later)
    return uniq.slice(0, 40);
}

export default async function MathMethodsExam2Page() {
    const initialQuestions = await fetchExam2Questions();

    return (
        <div className="min-h-screen">
            <div className="p-6 flex items-center justify-between">
                <Link
                    href="/practice"
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                >
                    ← Back
                </Link>

                <div className="text-slate-300 text-sm">
                    <span className="font-semibold">Mathematical Methods</span> · Exam 2 (Practice Mode)
                </div>
            </div>

            <div className="px-6 pb-10">
                {/* ✅ PracticeClient only takes (initialQuestions, subject) */}
            
                <PracticeClient initialQuestions={initialQuestions} subject={SUBJECT.MATH_METHODS} />
            </div>
        </div>
    );
}
