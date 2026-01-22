// frontend/src/app/practice/math-methods/topic/page.tsx
import PracticeClient from "@/app/practice/[subject]/PracticeClient";
import { fetchPracticeQuestions } from "@/lib/apiClient";
import { MATH_METHODS_TOPICS } from "@/constants/mathMethodsTopics";
import { PracticeQuestion } from "@/types/question";

export default async function MathMethodsTopicPracticePage() {
    // IMPORTANT:
    // Your existing /practice/[subject]/page.tsx uses subjectCode = "MATH_METHODS"
    // and the backend likely expects that enum value for practice endpoints.
    const subject = "MATH_METHODS";

    // Load a sensible default topic so the page is never empty.
    const defaultTopicCode = MATH_METHODS_TOPICS?.[0]?.code || "MM_T1";

    let initialQuestions: PracticeQuestion[] = [];
    try {
        initialQuestions = await fetchPracticeQuestions(subject, defaultTopicCode);
    } catch {
        // PracticeClient will show "No questions loaded."
        // (You can add a nicer empty state later.)
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <PracticeClient
                subject={subject}
                initialQuestions={initialQuestions}
            />
        </div>
    );
}
