// frontend/src/lib/api/questions.ts

import { PracticeQuestion } from "@/types/question";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:4000";

export async function fetchPracticeQuestionsApi(subject: string, topicCode: string) {
    const url = `${API_BASE}/api/questions/practice?subject=${encodeURIComponent(
        subject
    )}&topicCode=${encodeURIComponent(topicCode)}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
        throw new Error(
            `Failed to fetch practice questions (status ${res.status}). Check that topicCode ${topicCode} returns questions.`
        );
    }

    return (await res.json()) as PracticeQuestion[];
}
