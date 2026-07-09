"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string; display: boolean }
  | { type: "image"; url: string; alt: string };

function normaliseMathpixText(value: string) {
  return String(value ?? "")
    .replace(/\\{2,}([()[\]])/g, "\\$1")
    .replace(/\\{2,}(frac|sqrt|cos|sin|tan|log|ln|operatorname|begin|end|text|left|right|in|leq|geq|pi|theta|alpha|beta|times|cdot|pm|sum|int)\b/g, "\\$1");
}

function parseBlockSegments(input: string): Segment[] {
  const text = normaliseMathpixText(input);
  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      segments.push({ type: "image", alt: match[1] || "", url: match[2] });
    } else if (match[3] != null) {
      segments.push({ type: "math", value: match[3], display: true });
    } else if (match[4] != null) {
      segments.push({ type: "math", value: match[4], display: true });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

function parseInlineSegments(input: string): Segment[] {
  const pattern = /\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(input))) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: input.slice(lastIndex, match.index) });
    }

    segments.push({
      type: "math",
      value: match[1] ?? match[2] ?? "",
      display: false,
    });

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < input.length) {
    segments.push({ type: "text", value: input.slice(lastIndex) });
  }

  return segments;
}

function renderMath(value: string, display: boolean) {
  try {
    return katex.renderToString(value, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      trust: false,
    });
  } catch {
    return value;
  }
}

function TextBlock({ value }: { value: string }) {
  const paragraphs = value
    .split(/\n{2,}/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!paragraphs.length) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        const inlineSegments = parseInlineSegments(paragraph);

        return (
          <p key={`${index}-${paragraph.slice(0, 16)}`} className="whitespace-pre-wrap break-words">
            {inlineSegments.map((segment, segmentIndex) => {
              if (segment.type === "text") return segment.value;
              if (segment.type === "math") {
                return (
                  <span
                    key={`${segmentIndex}-${segment.value.slice(0, 12)}`}
                    className="inline-block align-baseline text-slate-100"
                    dangerouslySetInnerHTML={{
                      __html: renderMath(segment.value, false),
                    }}
                  />
                );
              }
              return null;
            })}
          </p>
        );
      })}
    </>
  );
}

export default function MathpixMarkdown({ value, className = "" }: { value: string; className?: string }) {
  const segments = parseBlockSegments(value);

  return (
    <div className={`space-y-4 text-base leading-8 text-slate-100 ${className}`}>
      {segments.map((segment, index) => {
        if (segment.type === "image") {
          return (
            <img
              key={`${segment.url}-${index}`}
              src={segment.url}
              alt={segment.alt}
              className="max-w-full rounded border border-slate-700 bg-white"
            />
          );
        }

        if (segment.type === "math") {
          const html = renderMath(segment.value, segment.display);
          return (
            <div
              key={`${index}-${segment.value.slice(0, 16)}`}
              className="overflow-x-auto py-1 text-slate-100"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return <TextBlock key={`${index}-${segment.value.slice(0, 16)}`} value={segment.value} />;
      })}
    </div>
  );
}
