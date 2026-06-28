// frontend/src/app/practice/math-methods/_components/ExamInstructions.tsx
type ExamProfile = {
    examKey: string;
    title: string;
    readingMins: number;
    writingMins: number;
    allowCAS: boolean;
    showHints: boolean;
    exactRequired: boolean;
    workingRequired: boolean;
    instructions: string[];
};

export default function ExamInstructions({ profile }: { profile: ExamProfile | null }) {
    if (!profile) return null;

    return (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
            <div className="text-foreground font-semibold text-lg">{profile.title}</div>

            <div className="mt-2 text-muted-foreground text-sm">
                <div>Reading time: <span className="font-semibold text-foreground">{profile.readingMins}</span> minutes</div>
                <div>Writing time: <span className="font-semibold text-foreground">{profile.writingMins}</span> minutes</div>
            </div>

            <div className="mt-4 text-foreground font-semibold text-sm">Instructions</div>
            <ul className="mt-2 list-disc pl-5 text-muted-foreground text-sm space-y-1">
                {profile.instructions?.map((x, i) => (
                    <li key={i}>{x}</li>
                ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded border border-border bg-muted">CAS: {profile.allowCAS ? "Allowed" : "Not allowed"}</span>
                <span className="px-2 py-1 rounded border border-border bg-muted">Exact required: {profile.exactRequired ? "Yes" : "No"}</span>
                <span className="px-2 py-1 rounded border border-border bg-muted">Working required: {profile.workingRequired ? "Yes" : "No"}</span>
            </div>
        </div>
    );
}
