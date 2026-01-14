import Link from "next/link";
import PracticeClient from "../../[subject]/PracticeClient";
import type { PracticeQuestion } from "@/types/question";
import { SUBJECT } from "@/lib/subjects";
import ExamInstructions from "../_components/ExamInstructions";

function ensureApiBase(base: string) {
    return base.endsWith("/api") ? base : `${base.replace(/\/$/, "")}/api`;
}

type ExamProfile = {
    examKey: string;
    title: string;
    readingMins: number;
    writingMins: number;
    allowCAS: boolean;
    showHints: boolean;
    exactRequired: boolean;
    workingRequired: boolean;
    instructions: string[];
};

const EXAM_KEY = "VCE_MM_EXAM1_2025";
const EXAM_YEAR = 2025;
const EXAM_NAME = "VCAA 2025 Exam 1"; // must match your seeded QuestionGroup examName

async function fetchExam1Profile(): Promise<ExamProfile | null> {
    const rawBase =
        process.env.INTERNAL_API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://backend:4000";
    const API_BASE = ensureApiBase(rawBase);

    const res = await fetch(`${API_BASE}/questions/examProfile?examKey=${encodeURIComponent(EXAM_KEY)}`, {
        cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as ExamProfile;
}

async function fetchExam1Questions(): Promise<PracticeQuestion[]> {
    const rawBase =
        process.env.INTERNAL_API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://backend:4000";
    const API_BASE = ensureApiBase(rawBase);

    const url =
        `${API_BASE}/questions/exam` +
        `?subject=${encodeURIComponent(SUBJECT.MATH_METHODS)}` +
        `&examYear=${encodeURIComponent(String(EXAM_YEAR))}` +
        `&examName=${encodeURIComponent(EXAM_NAME)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as PracticeQuestion[];
}

export default async function MathMethodsExam1Page() {
    const [profile, initialQuestions] = await Promise.all([
        fetchExam1Profile(),
        fetchExam1Questions(),
    ]);

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
                    <span className="font-semibold">Mathematical Methods</span> · Exam 1
                </div>
            </div>

            <div className="px-6 pb-10">
                <ExamInstructions profile={profile} />
                <PracticeClient
                    initialQuestions={initialQuestions}
                    subject={SUBJECT.MATH_METHODS}
                    examKey={EXAM_KEY}
                />

            </div>
        </div>
    );
}
