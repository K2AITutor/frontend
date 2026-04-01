// frontend/src/app/practice/math-methods/exam-2/page.tsx
import Link from "next/link";
import PracticeClient from "../../[subject]/PracticeClient";
import type { PracticeQuestion } from "@/types/question";
import { SUBJECT } from "@/lib/subjects";

/**
 * Ensure base includes /api (your backend logs show routes under /api)
 * Examples:
 *  - http://backend:4000      -> http://backend:4000/api
 *  - http://backend:4000/api  -> unchanged
 */
function ensureApiBase(base: string) {
    return base.endsWith("/api") ? base : `${base.replace(/\/$/, "")}/api`;
}

async function fetchExam2Questions(): Promise<PracticeQuestion[]> {
    // Server-side fetch inside Docker network
    const rawBase =
        process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:4000";
    const API_BASE = ensureApiBase(rawBase);

    // ✅ For now: reuse your existing practice endpoint to get a “mock Exam 2 set”
    // Later you can replace this with a dedicated endpoint like:
    //   GET /api/questions/exam?subject=MATH_METHODS&exam=2&year=2025
    //
    // Exam 2 tends to be mixed + more applied, so we pull from multiple topics.
    const topicCodes = ["MM_T3", "MM_T4", "MM_T5", "MM_T6", "MM_T7", "MM_T8"]; // Diff + Apps + Int + Prob/Stats

    const results = await Promise.all(
        topicCodes.map(async (topicCode) => {
            const res = await fetch(
                `${API_BASE}/questions/practice?subject=MATH_METHODS&topicCode=${encodeURIComponent(
                    topicCode
                )}`,
                { cache: "no-store" }
            );
            if (!res.ok) return [];
            return (await res.json()) as PracticeQuestion[];
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
