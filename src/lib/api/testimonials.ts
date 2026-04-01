const API_BASE_RAW =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

const API_BASE = (() => {
  const clean = String(API_BASE_RAW).replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
})();

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  subject: string;
  quote: string;
  rating: number;
  atarImprovement: string | null;
  order: number;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(`${API_BASE}/testimonials`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch testimonials");
  return res.json();
}
