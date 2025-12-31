/**
 * API base resolver
 *
 * - Server Components (Docker): use internal Docker network
 * - Client Components (Browser): use host-exposed port
 */
function getApiBase() {
    // Server-side (Next.js Server Components)
    if (typeof window === "undefined") {
        return process.env.INTERNAL_API_BASE || "http://backend:4000/api";
    }

    // Client-side (Browser)
    return (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "http://localhost:4000/api"
    );
}

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

/* ---------------- Fetch Practice Questions (Server Component) ---------------- */
import { PracticeQuestion } from "@/types/question";

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

/* ---------------- AI Explain (B2) ---------------- */
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

/* ---------------- AI Hint (B4) ---------------- */
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

/* ---------------- AI Similar Question (B3) ---------------- */
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
    const API_BASE =
        typeof window === "undefined"
            ? process.env.INTERNAL_API_BASE || "http://backend:4000/api"
            : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

    const res = await fetch(
        `${API_BASE}/recommendation/next?userId=${userId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return res.json() as Promise<PracticeQuestion[]>;
}
/* ----------------  ---------------- */
export async function getAdaptiveRecommendation() {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/recommendations/adaptive`
    );

    if (!res.ok) {
        throw new Error("Failed to fetch adaptive recommendation");
    }

    return res.json();
}

