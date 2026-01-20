"use client";

import { useEffect, useState } from "react";
import ExamSessionClient from "@/components/exam/ExamSessionClient";
import {
    fetchExam,
    fetchExamQuestionsByExamKey,
    ExamDTO,
    ExamQuestionDTO,
} from "@/lib/apiClient";

export default function Exam1SessionPage() {
    // ✅ Keep a single source of truth for Option B
    const examKey = "VCE_MM_EXAM1_2025";

    const [loading, setLoading] = useState(true);
    const [exam, setExam] = useState<ExamDTO | null>(null);
    const [questions, setQuestions] = useState<ExamQuestionDTO[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                // Load exam metadata (includes pdf url/filePath)
                const examMeta = await fetchExam(examKey);

                // Load exam question set
                const qs = await fetchExamQuestionsByExamKey(examKey);

                if (!cancelled) {
                    setExam(examMeta);
                    setQuestions(qs);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message || "Failed to load exam.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 text-slate-300">
                Loading exam…
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 text-red-300">
                <p className="font-semibold">Unable to start exam</p>
                <p className="text-sm text-slate-300 mt-2">{error}</p>
                <p className="text-xs text-slate-400 mt-2">
                    Expected backend endpoints:
                    <span className="font-mono"> GET /api/exams/{examKey}</span> and{" "}
                    <span className="font-mono">GET /api/exams/{examKey}/questions</span>
                </p>
            </div>
        );
    }

    if (!exam || questions.length === 0) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-10 text-slate-300">
                No exam questions found for <span className="font-mono">{examKey}</span>.
            </div>
        );
    }

    // Prefer uploaded filePath (when you add upload later), otherwise use URL
    const pdfSrc = exam.pdf?.filePath || exam.pdf?.url || null;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <ExamSessionClient
                initialQuestions={questions as any} // we’ll tighten typing after the client is updated to accept ExamQuestionDTO
                subject="math-methods"
                examKey={examKey}
                examTitle={exam.title || "VCE Mathematical Methods — Exam 1"}
                examPdfSrc={pdfSrc}
                readingMins={exam.readingMins ?? 15}
                writingMins={exam.writingMins ?? 60}
                allowCAS={Boolean(exam.allowCAS)}
                exactRequired={Boolean(exam.exactRequired)}
                workingRequired={Boolean(exam.workingRequired)}
            />
        </div>
    );
}
