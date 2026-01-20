// frontend/src/lib/apiClient.ts

/**
 * API base resolver
 *
 * - Server Components (Docker): use internal Docker network
 * - Client Components (Browser): use host-exposed port
 *
 * IMPORTANT: This returns a base INCLUDING "/api"
 * so all calls should use `${API_BASE}/...`
 */

type SubjectCode = string;

export type QuestionDTO = {
    id: string;
    prompt: string;
    answerType: string;
    marks: number;
    // ...whatever else your UI expects
};

function getApiBase() {
    const base =
        typeof window === "undefined"
            ? process.env.INTERNAL_API_BASE || "http://backend:4000"
            : process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

    // normalize trailing slash
    const clean = base.replace(/\/+$/, "");

    // ensure /api suffix exactly once
    return clean.endsWith("/api") ? clean : `${clean}/api`;
}

async function safeFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed (${res.status}) ${res.statusText}: ${text}`);
    }

    return (await res.json()) as T;
}

// ✅ more useful error body (does NOT change behavior)
async function safeText(res: Response): Promise<string> {
    try {
        return await res.text();
    } catch {
        return "";
    }
}

/* ============================
 * Option B: Exam APIs (NEW)
 * ============================ */

export type ExamDocumentDTO = {
    url?: string | null;
    filePath?: string | null;
};

export type ExamDTO = {
    examKey: string;
    title?: string | null;
    readingMins?: number | null;
    writingMins?: number | null;
    allowCAS?: boolean | null;
    showHints?: boolean | null;
    exactRequired?: boolean | null;
    workingRequired?: boolean | null;
    instructions?: string | null;
    pdf?: ExamDocumentDTO | null;
};

export type ExamQuestionDTO = {
    id: number;
    examKey: string;
    questionNumber: string; // e.g. "1a"
    marks: number;
    answerType: string;
    prompt: string; // minimal prompt, student reads PDF
    skillCode?: string | null;
    pdfPage?: number | null;
    groupId?: number | null;
    partLabel?: string | null;
};

// GET /api/exams/:examKey
export async function fetchExam(examKey: string): Promise<ExamDTO> {
    const base = getApiBase();
    const url = `${base}/exams/${encodeURIComponent(examKey)}`;

    // optional debug
    // console.debug("[apiClient] fetchExam:", url);

    return safeFetch<ExamDTO>(url, { cache: "no-store" });
}

// GET /api/exams/:examKey/questions
export async function fetchExamQuestionsByExamKey(
    examKey: string
): Promise<ExamQuestionDTO[]> {
    const base = getApiBase();
    const url = `${base}/exams/${encodeURIComponent(examKey)}/questions`;

    // optional debug
    // console.debug("[apiClient] fetchExamQuestionsByExamKey:", url);

    return safeFetch<ExamQuestionDTO[]>(url, { cache: "no-store" });
}

// POST /api/exams/:examKey/submit
export async function submitExamAnswer(args: {
    examKey: string;
    questionId: number | string;
    answer: string;
    userId?: number;
}) {
    const { examKey, questionId, answer, userId } = args;

    const res = await fetch(`${getApiBase()}/exams/${encodeURIComponent(examKey)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questionId: Number(questionId),
            answer,
            ...(typeof userId === "number" ? { userId } : {}),
        }),
    });

    if (!res.ok) {
        const text = await safeText(res);
        throw new Error(text || `Submit failed (status ${res.status})`);
    }

    return res.json();
}

/* ============================
 * Legacy Exam Questions API (keep)
 * - This hits /questions/exam?subject=...&examYear=...&examName=...
 * ============================ */

export async function fetchExamQuestions(
    subject: SubjectCode,
    examYear: number,
    examName: string
): Promise<QuestionDTO[]> {
    const base = getApiBase();

    const url =
        `${base}/questions/exam` +
        `?subject=${encodeURIComponent(subject)}` +
        `&examYear=${encodeURIComponent(String(examYear))}` +
        `&examName=${encodeURIComponent(examName)}`;

    return safeFetch<QuestionDTO[]>(url, { cache: "no-store" });
}

/* ---------------- Types ---------------- */
import { PracticeQuestion } from "@/types/question";

/* ---------------- Submit Answer (practice + examKey passthrough) ---------------- */
export async function submitAnswer(
    questionId: string,
    studentAnswer: string,
    examKey?: string
) {
    const res = await fetch(`${getApiBase()}/questions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questionId: Number(questionId),
            answer: studentAnswer,
            ...(examKey ? { examKey } : {}),
        }),
    });

    if (!res.ok) {
        const text = await safeText(res);
        throw new Error(text || `Submit failed (status ${res.status})`);
    }

    return res.json();
}

/* ---------------- Fetch Practice Questions ---------------- */
export async function fetchPracticeQuestions(
    subject: string,
    topicCode: string
): Promise<PracticeQuestion[]> {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/questions/practice?subject=${encodeURIComponent(
        subject
    )}&topicCode=${encodeURIComponent(topicCode)}`;

    // optional debug
    // console.debug("[apiClient] fetchPracticeQuestions:", url);

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
        const text = await safeText(res);
        console.error("Fetch practice failed:", { url, status: res.status, text });
        throw new Error(
            `Failed to fetch practice questions (status ${res.status}). ` +
            `subject=${subject}, topicCode=${topicCode}. ` +
            (text ? `Body: ${text}` : "")
        );
    }

    return res.json();
}

/* ---------------- AI Explain ---------------- */
export async function aiExplain(payload: {
    subject: string;
    skillCode: string;
    question: string;
    studentAnswer: string;
    correctAnswer: string;
}) {
    const API_BASE = getApiBase();

    const res = await fetch(`${API_BASE}/ai-tutor/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await safeText(res);
        console.error("AI explain failed:", text);
        throw new Error("AI explain failed");
    }

    return res.json();
}

/* ---------------- AI Hint ---------------- */
export async function aiHint(payload: {
    subject: string;
    skillCode: string;
    question: string;
    studentAnswer?: string;
    level: 1 | 2 | 3;
}) {
    const API_BASE = getApiBase();

    const res = await fetch(`${API_BASE}/ai-tutor/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await safeText(res);
        console.error("AI hint failed:", text);
        throw new Error("AI hint failed");
    }

    return res.json();
}

/* ---------------- AI Similar Question ---------------- */
export async function aiSimilarQuestion(payload: {
    subject: string;
    skillCode: string;
    question: string;
}) {
    const API_BASE = getApiBase();

    const res = await fetch(`${API_BASE}/ai-tutor/similar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await safeText(res);
        console.error("AI similar failed:", text);
        throw new Error("AI similar failed");
    }

    return res.json();
}

/* ---------------- Recommendations ---------------- */
export async function fetchRecommendations(userId: number) {
    const API_BASE = getApiBase();

    const res = await fetch(
        `${API_BASE}/recommendation/next?userId=${encodeURIComponent(String(userId))}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return res.json() as Promise<PracticeQuestion[]>;
}

/* ---------------- Adaptive Recommendation ---------------- */
export async function getAdaptiveRecommendation(subject: string) {
    const API_BASE = getApiBase();

    const res = await fetch(
        `${API_BASE}/recommendation/adaptive?subject=${encodeURIComponent(subject)}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Recommendation unavailable");
    }

    return res.json();
}

/* ---------------- fetchSimilarQuestions ---------------- */
export async function fetchSimilarQuestions(args: {
    subject: string;
    questionId: string;
    skillGaps: string[];
    limit?: number;
}) {
    const API_BASE = getApiBase();
    const { subject, questionId, skillGaps, limit = 5 } = args;

    const params = new URLSearchParams();
    params.set("subject", subject);
    params.set("questionId", questionId);
    params.set("limit", String(limit));
    // NOTE: you were doing both set + append; keep as-is to avoid breaking backend parsing
    params.set("skillCodes", skillGaps.join(","));
    for (const g of skillGaps) params.append("skillCodes", g);

    const res = await fetch(`${API_BASE}/questions/similar?${params.toString()}`, {
        cache: "no-store",
    });

    if (!res.ok) return [];
    return await res.json();
}
