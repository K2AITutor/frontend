"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ExamSessionClient from "@/components/exam/ExamSessionClient";
import {
  fetchExam,
  fetchExamQuestionsByExamKey,
  ExamDTO,
  ExamQuestionDTO,
} from "@/lib/apiClient";

export default function Exam1SessionPage() {
  const searchParams = useSearchParams();
  const examKey = searchParams.get("examKey") || "VCE_MM_EXAM1_2025";
  const sessionMode = searchParams.get("mode") === "exam" ? "exam" : "practice";
  const { data: session, status } = useSession();

  const [exam, setExam] = useState<ExamDTO | null>(null);
  const [questions, setQuestions] = useState<ExamQuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("Please log in again to start this examination.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = (session?.user as any)?.accessToken;
        if (!token) {
          throw new Error("Your login session is missing an API token. Please log out and log in again.");
        }
        const meta = await fetchExam(examKey, token);
        const qs = await fetchExamQuestionsByExamKey(examKey, token);

        if (!cancelled) {
          setExam(meta);
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
  }, [examKey, session, status]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">
        Loading examination…
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-red-600 dark:text-red-300">
        <p className="font-semibold">Unable to start examination</p>
        <p className="text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-muted-foreground">
        No questions available for this examination.
      </div>
    );
  }

  const pdfSrc = exam.pdf?.filePath || exam.pdf?.url || null;

  return (
    <div className="p-6">
      <ExamSessionClient
        initialQuestions={questions as any}
        subject="math-methods"
        examKey={examKey}
        sessionMode={sessionMode}
        examTitle={exam.title ?? "VCE Mathematical Methods — Exam 1"}
        examPdfSrc={pdfSrc}
        questionImageBase={`/exams/${examKey}/questions`} // ✅ NEW: PNG base path
        readingMins={exam.readingMins ?? 15}
        writingMins={exam.writingMins ?? 60}
        allowCAS={false}
        exactRequired={true}
        workingRequired={true}
      />
    </div>
  );
}
