import { PracticeQuestion } from "@/types/question";

const MOCK_API_BASE = "http://localhost:4002/api";

/* ---------------- Submit Answer ---------------- */
export async function submitAnswer(questionId: string, answer: string) {

    const res = await fetch(`${MOCK_API_BASE}/questions/submit`, {
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
export async function fetchPracticeQuestions(
    subject: string,
    topicCode: string
): Promise<PracticeQuestion[]> {

    const res = await fetch(
        `${MOCK_API_BASE}/questions/practice?subject=${subject}&topicCode=${topicCode}`,
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

    const res = await fetch(`${MOCK_API_BASE}/ai-tutor/explain`, {
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

    const res = await fetch(`${MOCK_API_BASE}/ai-tutor/hint`, {
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

    const res = await fetch(`${MOCK_API_BASE}/ai-tutor/similar`, {
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
    const res = await fetch(
        `${MOCK_API_BASE}/recommendation/next?userId=${userId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return res.json() as Promise<PracticeQuestion[]>;
}

/* ---------------- Adaptive Recommendations ---------------- */
export async function getAdaptiveRecommendation() {
    const res = await fetch(`${MOCK_API_BASE}/recommendations/adaptive`);

    if (!res.ok) {
        throw new Error("Failed to fetch adaptive recommendation");
    }

    return res.json();
}

