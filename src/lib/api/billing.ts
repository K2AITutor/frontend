
const API_BASE = (() => {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
    const clean = String(raw).trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export interface PlanLimits {
    questionsPerDay: number;
    aiExplanationsPerDay: number;
    examAccess: 'limited' | 'full';
}

export interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    // Not returned by the public /billing/plans endpoint (admin-only field).
    stripePriceId?: string | null;
    questionsPerDay: number;
    aiExplanationsPerDay: number;
    examAccess: string;
}

export interface SubscriptionStatus {
    hasSubscription: boolean;
    subscription?: {
        planId: number;
        planName: string;
        price: number;
        status: string;
        currentPeriodEnd: Date;
        stripeSubscriptionId: string;
        limits: PlanLimits;
    };
    message?: string;
}

export interface UsageStatus {
    questionsUsed: number;
    aiExplanationsUsed: number;
    limits: PlanLimits | null;
}

export interface Invoice {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: Date;
    hostedInvoiceUrl: string;
    invoicePdf: string;
}

function authHeaders(token: string): Record<string, string> {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

/* ---------------- Fetch Plans (public) ---------------- */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/billing/plans`, { cache: 'no-store' });

    if (!res.ok) {
        throw new Error("Failed to fetch subscription plans");
    }

    return res.json();
}

/* ---------------- Get My Subscription ---------------- */
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

/* ---------------- Create Checkout Session ---------------- */
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

/* ---------------- Cancel Subscription ---------------- */
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

/* ---------------- Get Invoices ---------------- */
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

/* ---------------- Get Daily Usage ---------------- */
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
