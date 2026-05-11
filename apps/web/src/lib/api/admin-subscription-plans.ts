import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/apiClient";
import type {
  AdminSubscriptionPlan,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from "@aitutor/shared";

export type {
  AdminSubscriptionPlan,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
};

export async function fetchSubscriptionPlans(token: string): Promise<AdminSubscriptionPlan[]> {
  return apiGet<AdminSubscriptionPlan[]>("/admin/subscription-plans", token);
}

export async function createSubscriptionPlan(dto: CreateSubscriptionPlanDto, token: string): Promise<AdminSubscriptionPlan> {
  return apiPost<AdminSubscriptionPlan>("/admin/subscription-plans", dto, token);
}

export async function updateSubscriptionPlan(id: number, dto: UpdateSubscriptionPlanDto, token: string): Promise<AdminSubscriptionPlan> {
  return apiPut<AdminSubscriptionPlan>(`/admin/subscription-plans/${id}`, dto, token);
}

export async function deleteSubscriptionPlan(id: number, token: string): Promise<void> {
  return apiDelete<void>(`/admin/subscription-plans/${id}`, token);
}
