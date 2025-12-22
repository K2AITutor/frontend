import PracticeClient from "./PracticeClient";
import { fetchPracticeQuestions } from "@/lib/apiClient";
import { PracticeQuestion } from "@/types/question";

export default async function PracticePage() {
    const data = await fetchPracticeQuestions("differentiation");

    const questions = (data.questions ?? []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt,
        answer: q.answer,
        skillCode: q.skillCode,
    }));

    // ✅ SAFETY GUARD (critical)
    if (questions.length === 0) {
        return (
            <div className="p-8 text-center text-slate-300">
                <h2 className="text-xl font-semibold mb-2">
                    No practice questions available
                </h2>
                <p>Please check backend seed data.</p>
            </div>
        );
    }

    return <PracticeClient initialQuestions={questions} />;
}
