import PracticeClient from "@/app/practice/[subject]/PracticeClient";
import { fetchPracticeQuestions } from "@/lib/apiClient";
import { MATH_METHODS_TOPICS } from "@/constants/mathMethodsTopics";
import { PracticeQuestion } from "@/types/question";

export default async function MathMethodsTopicPracticePage() {
    const subject = "MATH_METHODS";
    const defaultTopicCode = MATH_METHODS_TOPICS?.[0]?.code || "MM_T1";

    let initialQuestions: PracticeQuestion[] = [];

    try {
        initialQuestions = await fetchPracticeQuestions(subject, defaultTopicCode);
    } catch (error) {
        console.error("[topic-page] failed to load practice questions", error);
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <PracticeClient subject={subject} initialQuestions={initialQuestions} />
        </div>
    );
}