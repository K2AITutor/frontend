const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  stripePriceId: string | null;
  _count?: {
    subscriptions: number;
  };
}

export interface CreateSubscriptionPlanDto {
  name: string;
  price: number;
  stripePriceId?: string;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  price?: number;
  stripePriceId?: string;
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const res = await fetch(`${API_BASE}/admin/subscription-plans`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch subscription plans");
  return res.json();
}

export async function createSubscriptionPlan(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE}/admin/subscription-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create subscription plan");
  return res.json();
}

export async function updateSubscriptionPlan(id: number, dto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
  const res = await fetch(`${API_BASE}/admin/subscription-plans/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update subscription plan");
  return res.json();
}

export async function deleteSubscriptionPlan(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/subscription-plans/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete subscription plan");
  }
}
