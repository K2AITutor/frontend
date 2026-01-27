"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

const MOCK_API_BASE = "http://localhost:4002/api";

export function usePracticeQuestions(topic: string) {
    return useQuery({
        queryKey: ["practiceQuestions", topic],
        queryFn: async () => {
            const res = await fetch(
                `${MOCK_API_BASE}/questions/practice?topic=${encodeURIComponent(topic)}`,
                { cache: 'no-store' }
            );

            if (!res.ok) {
                throw new Error('Failed to fetch practice questions');
            }

            return res.json();
        },
        enabled: !!topic,
    });
}

export function useSubmitAnswer() {
    return useMutation({
        mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
            const res = await fetch(`${MOCK_API_BASE}/questions/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId, answer }),
            });

            if (!res.ok) throw new Error("Submit failed");
            return res.json();
        },
    });
}
