import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold">VCE AI Tutor</h1>
      </div>

      <p className="text-muted-foreground max-w-xl mb-8 text-lg">
        Personalised AI-powered practice for VCE Mathematics. Get instant feedback,
        step-by-step explanations, and adaptive recommendations.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/auth/login">
            <Sparkles className="mr-2 h-4 w-4" />
            Get Started
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/practice">
            <BookOpen className="mr-2 h-4 w-4" />
            Practice Now
          </Link>
        </Button>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <FeatureCard
          title="AI-Powered Hints"
          description="Get progressive hints when you're stuck, guiding you to the answer without giving it away."
        />
        <FeatureCard
          title="Step-by-Step Explanations"
          description="Understand every solution with detailed breakdowns tailored to your level."
        />
        <FeatureCard
          title="Adaptive Learning"
          description="Practice questions adapt to your strengths and weaknesses for efficient learning."
        />
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-left">
      <h3 className="font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
