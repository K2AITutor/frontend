import type {
  PublicFAQCategory,
  PublicFAQ,
} from "@aitutor/shared";

export type { PublicFAQCategory, PublicFAQ };

const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export async function fetchFAQCategories(): Promise<PublicFAQCategory[]> {
  const res = await fetch(`${API_BASE}/faq-categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch FAQ categories");
  return res.json();
}

export async function fetchFAQs(category?: string): Promise<PublicFAQ[]> {
  const url = category
    ? `${API_BASE}/faqs?category=${encodeURIComponent(category)}`
    : `${API_BASE}/faqs`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch FAQs");
  return res.json();
}
