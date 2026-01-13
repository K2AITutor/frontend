// frontend/src/app/practice/math-methods/exam-1/page.tsx
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

async function fetchExam1Questions(): Promise<PracticeQuestion[]> {
    const rawBase =
        process.env.INTERNAL_API_BASE ||
        process.env.NEXT_PUBLIC_API_BASE ||
        "http://backend:4000";

    const API_BASE = ensureApiBase(rawBase);

    // ✅ Dedicated exam endpoint (backend)
    // NOTE: For now backend may ignore examYear/examName and return by subject fallback.
    const examYear = 2025;
    const examName = "Mathematical Methods Examination 1";

    const url =
        `${API_BASE}/questions/exam` +
        `?subject=${encodeURIComponent(SUBJECT.MATH_METHODS)}` +
        `&examYear=${encodeURIComponent(String(examYear))}` +
        `&examName=${encodeURIComponent(examName)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    return (await res.json()) as PracticeQuestion[];
}

export default async function MathMethodsExam1Page() {
    const initialQuestions = await fetchExam1Questions();

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
                    <span className="font-semibold">Mathematical Methods</span> · Exam 1 (Exam Mode)
                </div>
            </div>

            <div className="px-6 pb-10">
                <PracticeClient
                    initialQuestions={initialQuestions}
                    subject={SUBJECT.MATH_METHODS}
                />
            </div>
        </div>
    );
}
