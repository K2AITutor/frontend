import type { Subject } from "./subjects";
import type { SubscriptionPlan } from "./billing";
import type { FAQ, FAQCategory } from "./faq";
import type { Testimonial } from "@/types/testimonial";

/**
 * Server-side data fetching for public pages (Server Components only).
 *
 * Differences from the client `lib/api/*` helpers:
 *  - Resolves the backend base from INTERNAL_API_BASE_URL (server -> backend),
 *    so the backend URL is never exposed to the browser and no CORS is needed.
 *  - Uses ISR caching (`next.revalidate`) instead of `cache: "no-store"`,
 *    since this data is near-static.
 */
function serverApiBase(): string {
  const raw =
    process.env.INTERNAL_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000/api";
  const clean = String(raw).trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

async function getJSON<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${serverApiBase()}${path}`, {
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Public fetch failed: ${path} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// Revalidate windows tuned to how often each dataset actually changes.
const ONE_HOUR = 3600;
const TEN_MIN = 600;

export function getSubjectsSSR(): Promise<Subject[]> {
  return getJSON<Subject[]>("/subjects", ONE_HOUR);
}

export function getTestimonialsSSR(): Promise<Testimonial[]> {
  return getJSON<Testimonial[]>("/testimonials", ONE_HOUR);
}

export function getPlansSSR(): Promise<SubscriptionPlan[]> {
  return getJSON<SubscriptionPlan[]>("/billing/plans", TEN_MIN);
}

export function getFAQCategoriesSSR(): Promise<FAQCategory[]> {
  return getJSON<FAQCategory[]>("/faq-categories", ONE_HOUR);
}

export function getFAQsSSR(): Promise<FAQ[]> {
  return getJSON<FAQ[]>("/faqs", ONE_HOUR);
}
