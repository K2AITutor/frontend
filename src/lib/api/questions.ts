"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export function usePracticeQuestions(topic: string) {
  return useQuery({
    queryKey: ["practiceQuestions", topic],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/questions/practice?topic=${encodeURIComponent(topic)}`,
        { cache: "no-store", credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch practice questions");
      return res.json();
    },
    enabled: !!topic,
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const res = await fetch(`${API_BASE}/questions/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questionId, answer }),
      });

      if (!res.ok) throw new Error("Submit failed");
      return res.json();
    },
  });
}
