import PracticeClient from "./PracticeClient";
import { fetchPracticeQuestions } from "@/lib/apiClient";
import { PracticeQuestion } from "@/types/question";

export default async function PracticePage() {
    // ✅ Default topic on first load (VCAA Unit 1 → Functions)
    const DEFAULT_TOPIC_CODE = "MM_T1";

    let questions: PracticeQuestion[] = [];

    try {
        questions = await fetchPracticeQuestions(
            "MATH_METHODS",
            DEFAULT_TOPIC_CODE
        );
    } catch (err) {
        console.error("Failed to load practice questions:", err);
    }

    // ✅ Safety guard (prevents white screen)
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
