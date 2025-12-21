// frontend/src/lib/api.ts
import axios from "axios";
import { PracticeQuestion } from "@/types/question"; // ✅ FIX 1

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

/**
 * Generic helpers
 */
export async function apiGet(path: string) {
    const res = await axios.get(`${API_BASE}${path}`);
    return res.data;
}


export async function apiPost<T>(
    path: string,
    data: any
): Promise<T> {
    const res = await axios.post(`${API_BASE}${path}`, data);
    return res.data as T;
}

/**
 * =========================
 * Day 1 — Practice questions
 * =========================
 */
export async function fetchPracticeQuestions(
    topic: string
): Promise<{ questions: PracticeQuestion[] }> {
    // ✅ FIX 2: assert response shape
    return apiGet(
        `/api/questions/practice?topic=${topic}`
    ) as Promise<{ questions: PracticeQuestion[] }>;
}

/**
 * =========================
 * Day 2 — Submit answer
 * =========================
 */
export async function submitAnswer(
    questionId: number,
    answer: string
) {
    return apiPost("/api/questions/submit", {
        questionId,
        answer,
    });
}

/**
 * =========================
 * Day 3 — AI explain
 * =========================
 */
export async function aiExplain(
    question: string,
    answer: string
): Promise<{ explanation: string }> {
    return apiPost<{ explanation: string }>(
        "/api/ai/explain",
        { question, answer }
    );
}

/**
 * =========================
 * Day 4 — AI similar
 * =========================
 */
export async function aiSimilarQuestion(
    question: string
): Promise<PracticeQuestion> {
    return apiPost<PracticeQuestion>(
        "/api/ai/similar",
        { question }
    );
}

