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
    // ✅ inside Docker network, your backend service is called "api"
    const serverDefault = "http://api:4000";
    const browserDefault = "http://localhost:4000";

    const base =
        typeof window === "undefined"
            ? process.env.INTERNAL_API_BASE || serverDefault
            : process.env.NEXT_PUBLIC_API_BASE || browserDefault;

    const clean = base.replace(/\/+$/, "");

    // ensure /api suffix exactly once
    return clean.endsWith("/api") ? clean : `${clean}/api`;
}

/**
 * Read Response body as text safely.
 * (Never throws.)
 */
async function safeText(res: Response): Promise<string> {
    try {
        return await res.text();
    } catch {
        return "";
    }
}

/**
 * ✅ Robust JSON parser:
 * - avoids "Unexpected end of JSON input"
 * - handles HTML/text error bodies
 * - surfaces meaningful messages
 */
async function safeJsonFromResponse<T>(res: Response, urlForError: string): Promise<T> {
    const text = await safeText(res);
    const trimmed = text.trim();

    // Empty body => don't call res.json()
    if (!trimmed) {
        if (!res.ok) {
            throw new Error(`API ${res.status} ${res.statusText} (empty response) for ${urlForError}`);
        }
        // allow empty-success responses (rare but happens)
        return {} as T;
    }

    let data: any;
    try {
        data = JSON.parse(trimmed);
    } catch {
        // If server returned HTML/text, show a snippet
        const snippet = trimmed.slice(0, 400);
        if (!res.ok) {
            throw new Error(
                `API ${res.status} ${res.statusText} returned non-JSON for ${urlForError}: ${snippet}`
            );
        }
        throw new Error(`API returned non-JSON for ${urlForError}: ${snippet}`);
    }

    if (!res.ok) {
        const msg =
            data?.message ||
            data?.error ||
            data?.detail ||
            `API ${res.status} ${res.statusText} for ${urlForError}`;
        throw new Error(msg);
    }

    return data as T;
}

async function safeFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    return await safeJsonFromResponse<T>(res, url);
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
    return safeFetch<ExamDTO>(url, { cache: "no-store" });
}

// GET /api/exams/:examKey/questions
export async function fetchExamQuestionsByExamKey(examKey: string): Promise<ExamQuestionDTO[]> {
    const base = getApiBase();
    const url = `${base}/exams/${encodeURIComponent(examKey)}/questions`;
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

    const url = `${getApiBase()}/exams/${encodeURIComponent(examKey)}/submit`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questionId: Number(questionId),
            answer,
            ...(typeof userId === "number" ? { userId } : {}),
        }),
    });

    return await safeJsonFromResponse(res, url);
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
export async function submitAnswer(questionId: string, studentAnswer: string, examKey?: string) {
    const url = `${getApiBase()}/questions/submit`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questionId: Number(questionId),
            answer: studentAnswer,
            ...(examKey ? { examKey } : {}),
        }),
    });

    return await safeJsonFromResponse(res, url);
}

/* ---------------- Fetch Practice Questions ---------------- */
export async function fetchPracticeQuestions(subject: string, topicCode: string): Promise<PracticeQuestion[]> {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/questions/practice?subject=${encodeURIComponent(subject)}&topicCode=${encodeURIComponent(
        topicCode
    )}`;

    const res = await fetch(url, { cache: "no-store" });

    // Use robust parsing so we never crash on empty/non-JSON bodies
    return await safeJsonFromResponse<PracticeQuestion[]>(res, url);
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
    const url = `${API_BASE}/ai-tutor/explain`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return await safeJsonFromResponse(res, url);
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
    const url = `${API_BASE}/ai-tutor/hint`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return await safeJsonFromResponse(res, url);
}

/* ---------------- AI Similar Question ---------------- */
export async function aiSimilarQuestion(payload: { subject: string; skillCode: string; question: string }) {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/ai-tutor/similar`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return await safeJsonFromResponse(res, url);
}
/* ---------------- Generic POST (Auth & Others) ---------------- */
export async function apiPost(endpoint: string, body: any) {
    const API_BASE = getApiBase();
    const url = `${API_BASE}${endpoint}`;
    
    // Debug logging to help identify "Failed to fetch" causes
    console.log(`[apiPost] Requesting: ${url}`); 

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`[apiPost] Error ${res.status} from ${url}:`, text);
            // Try to parse JSON error if possible
            try {
                 const json = JSON.parse(text);
                 return json; // Return error object to caller
            } catch {
                 throw new Error(text || `Request failed with status ${res.status}`);
            }
        }

        return res.json();
    } catch (error) {
        console.error(`[apiPost] Network error requesting ${url}:`, error);
        throw error;
    }
}

/* ---------------- Recommendations ---------------- */
export async function fetchRecommendations(userId: number) {
    const API_BASE = getApiBase();
    const url = `${API_BASE}/recommendation/next?userId=${encodeURIComponent(String(userId))}`;

    const res = await fetch(url, { cache: "no-store" });
    return await safeJsonFromResponse<PracticeQuestion[]>(res, url);
}

/* ---------------- Adaptive Recommendation ---------------- */
export async function getAdaptiveRecommendation(subject?: string) {
    const API_BASE = getApiBase();
    const url = subject
        ? `${API_BASE}/recommendation/adaptive?subject=${encodeURIComponent(subject)}`
        : `${API_BASE}/recommendation/adaptive`;

    const res = await fetch(url, { cache: "no-store" });
    return await safeJsonFromResponse(res, url);
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

    const url = `${API_BASE}/questions/similar?${params.toString()}`;
    const res = await fetch(url, { cache: "no-store" });

    // keep legacy behavior: if backend returns non-ok, just return []
    if (!res.ok) return [];

    // robust JSON parsing (still safe)
    try {
        return await safeJsonFromResponse<any[]>(res, url);
    } catch {
        return [];
    }
}
