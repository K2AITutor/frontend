"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

const MOCK_API_BASE = "http://localhost:4002/api";

export function useTopics() {
    return useQuery({
        queryKey: ["topics"],
        queryFn: async () => {
            const res = await fetch(`${MOCK_API_BASE}/knowledge-engine/topics`);
            return res.json();
        },
    });
}

export function useGenerateQuestion() {
    return useMutation({
        mutationFn: async (topicId: number) => {
            const res = await fetch(`${MOCK_API_BASE}/knowledge-engine/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topicId }),
            });

            return res.json();
        },
    });
}

export function useSubmitKnowledgeAnswer() {
    return useMutation({
        mutationFn: async (payload: {
            questionId: number;
            answerIndex?: number;
            answerText?: string;
        }) => {
            const res = await fetch(`${MOCK_API_BASE}/knowledge-engine/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            return res.json();
        },
    });
}
