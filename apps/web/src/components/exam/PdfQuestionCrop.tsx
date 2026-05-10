"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CropBoxRel } from "@/lib/examAssets";

type Props = {
    pdfUrl: string;                 // /exams/<examKey>/exam.pdf
    page: number;                   // 1-based
    crop?: CropBoxRel;              // relative [x1,y1,x2,y2]
    title?: string;
};

type PdfJs = any;

function clamp01(n: number) {
    return Math.max(0, Math.min(1, n));
}

export default function PdfQuestionCrop({ pdfUrl, page, crop, title }: Props) {
    const [pdfjs, setPdfjs] = useState<PdfJs | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const [zoom, setZoom] = useState(1); // UI zoom multiplier

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const safeCrop = useMemo(() => {
        if (!crop) return null;
        const [x1, y1, x2, y2] = crop;
        const a: CropBoxRel = [clamp01(x1), clamp01(y1), clamp01(x2), clamp01(y2)];
        // avoid inverted boxes
        if (a[2] <= a[0] || a[3] <= a[1]) return null;
        return a;
    }, [crop]);

    // Load pdfjs dynamically (client only)
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const mod = await import("pdfjs-dist/legacy/build/pdf");
                const lib = mod as any;

                // Worker: use CDN worker that matches installed pdfjs version.
                // (Most reliable for Next without extra build steps)
                const v = lib?.version || "4.10.38";
                lib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
                if (!alive) return;
                setPdfjs(lib);
            } catch (e: any) {
                if (!alive) return;
                setErr(e?.message || "Failed to load PDF renderer");
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    // Render whenever pdfUrl/page/crop/zoom changes
    useEffect(() => {
        if (!pdfjs) return;
        if (!canvasRef.current) return;

        let cancelled = false;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        setLoading(true);
        setErr(null);

        (async () => {
            try {
                // Load doc
                const loadingTask = pdfjs.getDocument({ url: pdfUrl });
                const pdf = await loadingTask.promise;

                if (cancelled) return;

                const p = await pdf.getPage(page);
                if (cancelled) return;

                // Scale: render at devicePixelRatio for sharp text
                const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
                const baseScale = 1.6; // increase for clarity; keep reasonable for performance
                const viewport = p.getViewport({ scale: baseScale * dpr * zoom });

                // Render full page to offscreen canvas
                const off = document.createElement("canvas");
                off.width = Math.floor(viewport.width);
                off.height = Math.floor(viewport.height);

                const offCtx = off.getContext("2d");
                if (!offCtx) throw new Error("Canvas context not available");

                await p.render({ canvasContext: offCtx, viewport }).promise;

                if (cancelled) return;

                // Crop selection (or full page)
                let sx = 0, sy = 0, sw = off.width, sh = off.height;
                if (safeCrop) {
                    const [x1, y1, x2, y2] = safeCrop;
                    sx = Math.floor(x1 * off.width);
                    sy = Math.floor(y1 * off.height);
                    sw = Math.floor((x2 - x1) * off.width);
                    sh = Math.floor((y2 - y1) * off.height);

                    // safety
                    sw = Math.max(1, Math.min(sw, off.width - sx));
                    sh = Math.max(1, Math.min(sh, off.height - sy));
                }

                // Visible canvas = cropped area
                canvas.width = sw;
                canvas.height = sh;

                ctx.clearRect(0, 0, sw, sh);
                ctx.drawImage(off, sx, sy, sw, sh, 0, 0, sw, sh);

                setLoading(false);
            } catch (e: any) {
                if (cancelled) return;
                setErr(e?.message || "Failed to render PDF page");
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [pdfjs, pdfUrl, page, safeCrop, zoom]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-sm text-slate-300">
                    {title ?? "Question view"}{" "}
                    <span className="text-slate-500">•</span>{" "}
                    Page {page}
                    {safeCrop ? "" : " (full page)"}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                        title="Zoom out"
                    >
                        −
                    </button>
                    <div className="text-xs text-slate-300 w-14 text-center">
                        {Math.round(zoom * 100)}%
                    </div>
                    <button
                        onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                        title="Zoom in"
                    >
                        +
                    </button>
                    <button
                        onClick={() => setZoom(1)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                        title="Reset zoom"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="w-full h-[75vh] overflow-auto rounded border border-slate-700 bg-black/20">
                <div className="min-h-full w-full flex justify-center py-6 px-4">
                    <div className="bg-white rounded shadow p-2">
                        {err ? (
                            <div className="text-sm text-red-600 p-4 max-w-[60ch]">
                                <div className="font-semibold mb-1">PDF render error</div>
                                <div className="break-words">{err}</div>
                                <div className="mt-2 text-xs text-slate-600">
                                    Check that the PDF exists at: <span className="font-mono">{pdfUrl}</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {loading && (
                                    <div className="text-xs text-slate-600 px-2 py-1 mb-2">
                                        Rendering…
                                    </div>
                                )}
                                <canvas ref={canvasRef} style={{ display: "block" }} />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
