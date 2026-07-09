import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PATH } from "../constants/api";
import type { SubscriptionPlan, SubscriptionStatus, UsageStatus } from "../types/billing";
import { useFetcher } from "./FetcherContext";

export function useBillingPlans() {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: ({ signal }) => fetcher.get<SubscriptionPlan[]>(PATH.billing.plans, { signal }),
  });
}

export function useMySubscription(userId?: number) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["billing", "subscription", userId],
    enabled: userId != null,
    queryFn: ({ signal }) => fetcher.get<SubscriptionStatus>(PATH.billing.me(userId!), { signal }),
  });
}

export function useUsageStatus(userId?: number) {
  const fetcher = useFetcher();

  return useQuery({
    queryKey: ["billing", "usage", userId],
    enabled: userId != null,
    queryFn: ({ signal }) => fetcher.get<UsageStatus>(PATH.billing.usage(userId!), { signal }),
  });
}

export function useCancelSubscription(userId?: number) {
  const fetcher = useFetcher();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (userId == null) throw new Error("userId is required to cancel a subscription");
      return fetcher.post<SubscriptionStatus>(PATH.billing.cancel(userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "subscription", userId] });
      queryClient.invalidateQueries({ queryKey: ["billing", "usage", userId] });
    },
  });
}
