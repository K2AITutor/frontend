"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../../lib/api";
import { getToken } from "../../lib/storage";

export default function PracticePage() {
    const token = getToken();

    const [topics, setTopics] = useState([]);
    const [topicId, setTopicId] = useState(null);
    const [question, setQuestion] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        apiGet("/topics").then(setTopics);
    }, []);

    async function loadQuestion() {
        setResult(null);
        const q = await apiPost("/engine/question", { topicId }, token);
        setQuestion(q);
    }

    async function submit(index) {
        const r = await apiPost("/engine/submit", {
            questionId: question.id,
            answerIndex: index
        }, token);
        setResult(r);
    }

    return (
        <div>
            <h1 className="text-3xl">Practice</h1>

            <select
                className="mt-4 p-2 bg-slate-800"
                onChange={e => setTopicId(Number(e.target.value))}
            >
                <option>Select a topic</option>
                {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>

            <button className="btn mt-4" onClick={loadQuestion}>Load Question</button>

            {question && (
                <div className="mt-6 bg-slate-800 p-4 rounded">
                    <h2>{question.question}</h2>

                    {question.options.map((opt, i) => (
                        <button key={i} className="btn mt-2 block" onClick={() => submit(i)}>
                            {opt}
                        </button>
                    ))}

                    {result && (
                        <div className="mt-4">
                            <p className={result.correct ? "text-green-400" : "text-red-400"}>
                                {result.correct ? "Correct!" : "Incorrect"}
                            </p>
                            <p className="text-slate-300 mt-2">
                                Explanation: {result.explanation}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
