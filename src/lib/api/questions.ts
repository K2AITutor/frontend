// frontend/src/lib/api/questions.ts

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

/**
 * Day 1: Fetch practice questions
 * GET /api/questions/practice?topic=
 */
export async function fetchPracticeQuestions(topic: string) {
    const res = await fetch(
        `${API_BASE}/api/questions/practice?topic=${encodeURIComponent(topic)}`,
        { cache: 'no-store' }
    );

    if (!res.ok) {
        throw new Error('Failed to fetch practice questions');
    }

    return res.json();
}

/**
 * Day 2: Submit answer for auto-marking
 * POST /api/questions/submit
 */
export async function submitAnswer(questionId: string, answer: string) {
    const res = await fetch(`${API_BASE}/questions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer }),  // Correct structure
    });

    if (!res.ok) throw new Error("Submit failed");
    return res.json();
}
