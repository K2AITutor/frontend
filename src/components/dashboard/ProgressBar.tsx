export default function ProgressBar({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    return (
        <div className="progress">
            <div className="progress-header">
                <span>{label}</span>
                <span>{value}%</span>
            </div>

            <div className="progress-track">
                <div
                    className="progress-fill"
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
