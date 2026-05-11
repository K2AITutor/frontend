import type {
  PlanLimits,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageStatus,
  Invoice,
} from "@aitutor/shared";

export type {
  PlanLimits,
  SubscriptionPlan,
  SubscriptionStatus,
  UsageStatus,
  Invoice,
};

const API_BASE = (() => {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const clean = String(raw).trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

function authHeaders(token: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/billing/plans`, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error("Failed to fetch subscription plans");
    }

    return res.json();
}

export async function getSubscription(userId: number, token: string): Promise<SubscriptionStatus> {
    const res = await fetch(`${API_BASE}/billing/me/${userId}`, {
        cache: 'no-store',
        headers: authHeaders(token),
    });

    if (!res.ok) {
        if (res.status === 404) {
            return { hasSubscription: false, message: 'User not found' };
        }
        throw new Error("Failed to fetch subscription status");
    }

    return res.json();
}

export async function createCheckout(userId: number, planId: number, token: string) {
    const res = await fetch(`${API_BASE}/billing/checkout`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ userId, planId }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create checkout session");
    }

    return res.json();
}

export async function cancelSubscription(userId: number, token: string) {
    const res = await fetch(`${API_BASE}/billing/cancel/${userId}`, {
        method: "POST",
        headers: authHeaders(token),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to cancel subscription");
    }

    return res.json();
}

export async function getInvoices(userId: number, token: string): Promise<{ invoices: Invoice[] }> {
    const res = await fetch(`${API_BASE}/billing/invoices/${userId}`, {
        cache: 'no-store',
        headers: authHeaders(token),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch invoices");
    }

    return res.json();
}

export async function getUsage(userId: number, token: string): Promise<UsageStatus> {
    const res = await fetch(`${API_BASE}/billing/usage/${userId}`, {
        cache: 'no-store',
        headers: authHeaders(token),
    });

    if (!res.ok) {
        return { questionsUsed: 0, aiExplanationsUsed: 0, limits: null };
    }

    return res.json();
}
