import { PATH } from "@aitutor/shared";
import { apiGet } from "../apiClient";
import type {
  PublicFAQCategory,
  PublicFAQ,
} from "@aitutor/shared";

export type { PublicFAQCategory, PublicFAQ };

export async function fetchFAQCategories(): Promise<PublicFAQCategory[]> {
  return apiGet<PublicFAQCategory[]>(PATH.public.faqCategories);
}

export async function fetchFAQs(category?: string): Promise<PublicFAQ[]> {
  const url = category
    ? `${PATH.public.faqs}?category=${encodeURIComponent(category)}`
    : PATH.public.faqs;

  return apiGet<PublicFAQ[]>(url);
}
