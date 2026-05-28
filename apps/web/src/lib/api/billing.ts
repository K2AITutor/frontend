import { PATH } from "@aitutor/shared";
import { apiGet, apiPost } from "../apiClient";
import type {
  SubscriptionPlan,
  SubscriptionStatus,
  UsageStatus,
  Invoice,
} from "@aitutor/shared";

export type { SubscriptionPlan, SubscriptionStatus, UsageStatus, Invoice };

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
    return apiGet<SubscriptionPlan[]>(PATH.billing.plans);
}

export async function getSubscription(userId: number, token: string): Promise<SubscriptionStatus> {
    return apiGet<SubscriptionStatus>(PATH.billing.me(userId), token);
}

export async function createCheckout(userId: number, planId: number, token: string) {
    return apiPost<{ checkoutUrl: string }>(PATH.billing.checkout, { userId, planId }, token);
}

export async function cancelSubscription(userId: number, token: string) {
    return apiPost<{ message: string }>(PATH.billing.cancel(userId), {}, token);
}

export async function getInvoices(userId: number, token: string): Promise<{ invoices: Invoice[] }> {
    return apiGet<{ invoices: Invoice[] }>(PATH.billing.invoices(userId), token);
}

export async function getUsage(userId: number, token: string): Promise<UsageStatus> {
    try {
        return await apiGet<UsageStatus>(PATH.billing.usage(userId), token);
    } catch {
        return { questionsUsed: 0, aiExplanationsUsed: 0, limits: null };
    }
}
