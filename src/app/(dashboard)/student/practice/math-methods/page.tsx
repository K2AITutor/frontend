import Link from "next/link";

export default function MathMethodsHomePage() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10 text-slate-200">
            <header>
                <h1 className="text-3xl font-semibold mb-2">VCE Mathematical Methods</h1>
                <p className="text-slate-300">
                    Practise by topic, sit full past examinations, and receive examiner-style feedback.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Practice */}
                <div className="glass p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Practice by Topic</h2>
                    <p className="text-sm text-slate-300">
                        Learn and strengthen individual skills with instant feedback, guided hints,
                        and similar practice questions.
                    </p>
                    <ul className="text-sm list-disc ml-5 text-slate-400 space-y-1">
                        <li>AI hints and explanations</li>
                        <li>Similar question generation</li>
                        <li>Focus on weak areas</li>
                    </ul>

                    {/* ✅ FIX: keep inside student dashboard */}
                    <Link
                        href="/student/practice/math-methods/topic"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                    >
                        Start Topic Practice
                    </Link>
                </div>

                {/* Exam 1 */}
                <div className="glass p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Examination 1 — No CAS</h2>
                    <p className="text-sm text-slate-300">
                        Practise real VCAA Examination 1 questions under exam conditions, with exact
                        answers required.
                    </p>
                    <ul className="text-sm list-disc ml-5 text-slate-400 space-y-1">
                        <li>Past papers (2006–2025)</li>
                        <li>Exact values enforced</li>
                        <li>Examiner-style marking</li>
                    </ul>

                    {/* ✅ FIX: keep inside student dashboard */}
                    <Link
                        href="/student/practice/math-methods/exam-1"
                        className="inline-block mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-semibold"
                    >
                        Exam 1 Practice
                    </Link>
                </div>

                {/* Exam 2 */}
                <div className="glass p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Examination 2 — CAS</h2>
                    <p className="text-sm text-slate-300">
                        Prepare for Examination 2 with CAS-based extended response questions.
                    </p>
                    <ul className="text-sm list-disc ml-5 text-slate-400 space-y-1">
                        <li>CAS allowed</li>
                        <li>Interpretation & reasoning</li>
                        <li>Examiner feedback</li>
                    </ul>

                    {/* ✅ FIX: keep inside student dashboard */}
                    <Link
                        href="/student/practice/math-methods/exam-2"
                        className="inline-block mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold"
                    >
                        Exam 2 Practice
                    </Link>
                </div>

                {/* ✅ FIX: keep inside student dashboard */}
                <Link
                    href="/student/practice/math-methods/insights"
                    className="inline-block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold"
                >
                    View Weak-Skill Dashboard →
                </Link>
            </div>
        </div>
    );
}
