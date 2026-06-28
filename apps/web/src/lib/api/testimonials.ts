import { PATH } from "@aitutor/shared";
import { apiGet } from "../apiClient";
import type { PublicTestimonial } from "@aitutor/shared";

export type { PublicTestimonial };

export async function fetchTestimonials(): Promise<PublicTestimonial[]> {
  return apiGet<PublicTestimonial[]>(PATH.public.testimonials);
}
