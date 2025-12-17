const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getTopics() {
    const res = await fetch(`${BASE_URL}/knowledge-engine/topics`);
    return res.json();
}

export async function getQuestion(topicId: number) {
    const res = await fetch(`${BASE_URL}/knowledge-engine/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
    });

    return res.json();
}

export async function submitAnswer(payload: {
    questionId: number;
    answerIndex?: number;
    answerText?: string;
}) {
    const res = await fetch(`${BASE_URL}/knowledge-engine/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    return res.json();
}
