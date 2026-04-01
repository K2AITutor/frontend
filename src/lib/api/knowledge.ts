"use client";

import { useMutation } from "@tanstack/react-query";

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export function useAskKnowledge() {
  return useMutation({
    mutationFn: async (payload: { question: string }) => {
      const res = await fetch(`${API_BASE}/knowledge/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to ask knowledge");
      return res.json();
    },
  });
}
