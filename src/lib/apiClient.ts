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

/* ---------------- Submit Answer ---------------- */
export async function submitAnswer(questionId: string, answer: string) {
    const API_BASE = getApiBase();

    const res = await fetch(`${API_BASE}/questions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questionId: Number(questionId),
            answer,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

/* ---------------- Fetch Practice Questions ---------------- */
export async function fetchPracticeQuestions(
    subject: string,
    topicCode: string
): Promise<PracticeQuestion[]> {
    const API_BASE = getApiBase();

    const res = await fetch(
        `${API_BASE}/questions/practice?subject=${encodeURIComponent(
            subject
        )}&topicCode=${encodeURIComponent(topicCode)}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        const text = await res.text();
        console.error("Fetch practice failed:", text);
        throw new Error("Failed to fetch practice questions");
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
        const text = await res.text();
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
        const text = await res.text();
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
        const text = await res.text();
        console.error("AI similar failed:", text);
        throw new Error("AI similar failed");
    }

    return res.json();
}

/* ---------------- Recommendations ---------------- */
export async function fetchRecommendations(userId: number) {
    const API_BASE = getApiBase();

    const res = await fetch(
        `${API_BASE}/recommendation/next?userId=${encodeURIComponent(
            String(userId)
        )}`,
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

/**
 * API base resolver
 *
 * - Server Components (Docker): use internal Docker network
 * - Client Components (Browser): use host-exposed port
 
function getApiBase() {
    if (typeof window === "undefined") {
        return process.env.INTERNAL_API_BASE || "http://backend:4000";
    }
    return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
}

/* ---------------- Types ---------------- 
import { PracticeQuestion } from "@/types/question";

/* ---------------- Submit Answer ---------------- 
export async function submitAnswer(questionId: string, answer: string) {
    const API_BASE = getApiBase();

    const res = await fetch(`${API_BASE}/questions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            questionId: Number(questionId),
            answer,
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }

    return res.json();
}

/* ---------------- Fetch Practice Questions ---------------- 
export async function fetchPracticeQuestions(
    subject: string,
    topicCode: string
): Promise<PracticeQuestion[]> {
    const API_BASE = getApiBase();

    const res = await fetch(
        `${API_BASE}/questions/practice?subject=${subject}&topicCode=${topicCode}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        const text = await res.text();
        console.error("Fetch practice failed:", text);
        throw new Error("Failed to fetch practice questions");
    }

    return res.json();
}

/* ---------------- AI Explain ---------------- 
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
        const text = await res.text();
        console.error("AI explain failed:", text);
        throw new Error("AI explain failed");
    }

    return res.json();
}

/* ---------------- AI Hint ---------------- 
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
        const text = await res.text();
        console.error("AI hint failed:", text);
        throw new Error("AI hint failed");
    }

    return res.json();
}

/* ---------------- AI Similar Question ---------------- 
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
        const text = await res.text();
        console.error("AI similar failed:", text);
        throw new Error("AI similar failed");
    }

    return res.json();
}

/* ---------------- Recommendations ---------------- 
export async function fetchRecommendations(userId: number) {
    const API_BASE = getApiBase();

    const res = await fetch(`${API_BASE}/recommendation/next?userId=${userId}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return res.json() as Promise<PracticeQuestion[]>;
}

/* ---------------- Adaptive Recommendation ---------------- 
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
*/