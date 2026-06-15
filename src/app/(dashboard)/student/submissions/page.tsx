import type { Metadata } from "next";
import { SubmissionsListClient } from "./SubmissionsListClient";

export const metadata: Metadata = {
  title: "Submission History | K2 AI Tutor",
  description: "Review your past practice submissions, scores, and review status.",
};

export default function StudentSubmissionsPage() {
  return (
    <div className="space-y-6 p-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submission History</h1>
        <p className="text-muted-foreground">Submission history — review your past practice submissions and scores.</p>
      </div>
      <SubmissionsListClient />
    </div>
  );
}
