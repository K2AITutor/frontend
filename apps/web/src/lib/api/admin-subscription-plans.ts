import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  stripePriceId: string | null;
  questionsPerDay: number;
  aiExplanationsPerDay: number;
  examAccess: string;
  _count?: {
    subscriptions: number;
  };
}

export interface CreateSubscriptionPlanDto {
  name: string;
  price: number;
  stripePriceId?: string;
  questionsPerDay?: number;
  aiExplanationsPerDay?: number;
  examAccess?: string;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  price?: number;
  stripePriceId?: string;
  questionsPerDay?: number;
  aiExplanationsPerDay?: number;
  examAccess?: string;
}

export async function fetchSubscriptionPlans(token: string): Promise<SubscriptionPlan[]> {
  return apiGet<SubscriptionPlan[]>("/admin/subscription-plans", token);
}

export async function createSubscriptionPlan(dto: CreateSubscriptionPlanDto, token: string): Promise<SubscriptionPlan> {
  return apiPost<SubscriptionPlan>("/admin/subscription-plans", dto, token);
}

export async function updateSubscriptionPlan(id: number, dto: UpdateSubscriptionPlanDto, token: string): Promise<SubscriptionPlan> {
  return apiPut<SubscriptionPlan>(`/admin/subscription-plans/${id}`, dto, token);
}

export async function deleteSubscriptionPlan(id: number, token: string): Promise<void> {
  return apiDelete<void>(`/admin/subscription-plans/${id}`, token);
}
