"use client";

import { useMutation } from "@tanstack/react-query";
import { apiPost } from "../apiClient";
import { PATH } from "@aitutor/shared";

export function useAskKnowledge() {
  return useMutation({
    mutationFn: async (payload: { question: string }) => {
      return apiPost<any>(PATH.knowledge.ask, payload);
    },
  });
}
