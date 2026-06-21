import { PATH } from "@aitutor/shared";
import { apiGet } from "../apiClient";
import type {
  PublicFAQCategory,
  PublicFAQ,
  FAQCategory,
  FAQ,
} from "@aitutor/shared";

export type { PublicFAQCategory, PublicFAQ, FAQCategory, FAQ };

export async function fetchFAQCategories(): Promise<PublicFAQCategory[]> {
  return apiGet<PublicFAQCategory[]>(PATH.public.faqCategories);
}

export async function fetchFAQs(category?: string): Promise<PublicFAQ[]> {
  const url = category
    ? `${PATH.public.faqs}?category=${encodeURIComponent(category)}`
    : PATH.public.faqs;

  return apiGet<PublicFAQ[]>(url);
}
