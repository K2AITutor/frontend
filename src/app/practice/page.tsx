// frontend/src/app/practice/page.tsx

import AppLayout from "@/components/AppLayout";
import PracticeClient from "./PracticeClient";
import { fetchPracticeQuestions } from "@/lib/api";
import { PracticeQuestion } from "@/types/question";

export default async function PracticePage() {
    const data = await fetchPracticeQuestions("differentiation");

    const questions: PracticeQuestion[] = (data.questions ?? []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt,
        answer: q.answer,
        explanation: q.explanation,
    }));

    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto mt-10">
                <h1 className="text-4xl font-bold mb-2">
                    VCE Practice — <span className="text-blue-400">Quadratics</span>
                </h1>

                <p className="text-slate-400 mb-6">
                    Practice real VCE-style questions with instant feedback and AI explanations.
                </p>

                <div className="glass p-6">
                    <PracticeClient initialQuestions={questions} />
                </div>
            </div>
        </AppLayout>
    );
}
