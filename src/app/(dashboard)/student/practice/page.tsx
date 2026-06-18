import type { Metadata } from "next";
import PracticeSubjectsClient from "./PracticeSubjectsClient";

export const metadata: Metadata = {
  title: "Practice Dashboard - VCE AI Tutor",
};

export default function PracticeDashboardPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">VCE Practice Dashboard</h1>
          <p className="text-muted-foreground">
            Choose a VCE subject to start practicing. AI-powered feedback helps you learn faster.
          </p>
        </div>

        <PracticeSubjectsClient />
      </div>
    </div>
  );
}
