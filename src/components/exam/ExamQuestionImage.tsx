export default function ExamQuestionImage({
    src,
    alt,
}: {
    src: string;
    alt?: string;
}) {
    return (
        <div className="overflow-auto max-h-[80vh] bg-white rounded">
            <img
                src={src}
                alt={alt ?? "Exam question"}
                className="block mx-auto"
                style={{
                    maxWidth: "100%",
                    height: "auto",
                    imageRendering: "auto", // IMPORTANT
                }}
                loading="eager"
                draggable={false}
            />
        </div>
    );
}
