"use client";

import { useEffect, useRef, useState } from "react";
import { fetchExamMeta } from "@/lib/examAssets";

type RectPx = { x: number; y: number; w: number; h: number };

export default function PdfCropperPage() {
    const [examKey, setExamKey] = useState("VCE_MM_EXAM1_2025");
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    const [pdfjs, setPdfjs] = useState<any>(null);
    const [err, setErr] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pageSize, setPageSize] = useState<{ w: number; h: number } | null>(null);

    const [dragging, setDragging] = useState(false);
    const [start, setStart] = useState<{ x: number; y: number } | null>(null);
    const [rect, setRect] = useState<RectPx | null>(null);

    // load pdfjs dynamically
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const mod = await import("pdfjs-dist/legacy/build/pdf");
                const lib = mod as any;

                // ✅ Use local worker (reliable in Next)
                lib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

                if (!alive) return;
                setPdfjs(lib);
                setStatus("pdfjs loaded");
            } catch (e: any) {
                if (!alive) return;
                setErr(e?.message || "Failed to load pdfjs");
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const loadMeta = async () => {
        setErr(null);
        setStatus(null);

        const meta = await fetchExamMeta(examKey);
        if (!meta) {
            setErr(`meta.json not found at /exams/${examKey}/meta.json`);
            setPdfUrl(null);
            return;
        }

        setPdfUrl(meta.pdfUrl);
        setPage(meta.defaultPage ?? 1);
        setStatus(`meta loaded: pdfUrl=${meta.pdfUrl}`);
    };

    const renderPage = async () => {
        setErr(null);
        setStatus(null);

        if (!pdfjs) {
            setErr("pdfjs not loaded yet");
            return;
        }
        if (!pdfUrl) {
            setErr("pdfUrl is empty. Click 'Load meta.json' first (or check meta.json).");
            return;
        }

        // quick fetch check so we can show 404 clearly
        try {
            const head = await fetch(pdfUrl, { method: "GET" });
            if (!head.ok) {
                setErr(`PDF not reachable: ${pdfUrl} (HTTP ${head.status})`);
                return;
            }
        } catch {
            setErr(`PDF fetch failed: ${pdfUrl}`);
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) {
            setErr("canvas not available");
            return;
        }

        setLoading(true);
        setRect(null);
        setStart(null);

        try {
            setStatus("loading PDF…");
            const task = pdfjs.getDocument({ url: pdfUrl });
            const pdf = await task.promise;

            setStatus(`loaded PDF. rendering page ${page}…`);
            const p = await pdf.getPage(page);

            const dpr = window.devicePixelRatio || 1;
            const scale = 1.3 * dpr;
            const viewport = p.getViewport({ scale });

            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);

            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("No canvas context");

            // ensure white background (some PDFs render transparent background)
            ctx.save();
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            await p.render({ canvasContext: ctx, viewport }).promise;

            setPageSize({ w: canvas.width, h: canvas.height });
            setStatus(`rendered page ${page} (${canvas.width}×${canvas.height})`);
        } catch (e: any) {
            setErr(e?.message || "Render failed");
        } finally {
            setLoading(false);
        }
    };

    // drag selection
    const onMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        setDragging(true);
        setStart({ x, y });
        setRect({ x, y, w: 0, h: 0 });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging || !start) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        const rx = Math.min(start.x, x);
        const ry = Math.min(start.y, y);
        const rw = Math.abs(x - start.x);
        const rh = Math.abs(y - start.y);

        setRect({ x: rx, y: ry, w: rw, h: rh });
    };

    const onMouseUp = () => setDragging(false);

    // draw overlay box
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !rect) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // redraw border only (page already rendered)
        ctx.save();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.restore();
    }, [rect]);

    const cropJson = (() => {
        if (!rect || !pageSize) return null;
        const x1 = rect.x / pageSize.w;
        const y1 = rect.y / pageSize.h;
        const x2 = (rect.x + rect.w) / pageSize.w;
        const y2 = (rect.y + rect.h) / pageSize.h;
        const box = [
            Number(x1.toFixed(4)),
            Number(y1.toFixed(4)),
            Number(x2.toFixed(4)),
            Number(y2.toFixed(4)),
        ];
        return { page, crop: box };
    })();

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 text-slate-200 space-y-4">
            <h1 className="text-xl font-semibold">PDF Crop Tool</h1>

            <div className="glass p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                    <label className="text-sm">
                        Exam key{" "}
                        <input
                            value={examKey}
                            onChange={(e) => setExamKey(e.target.value)}
                            className="ml-2 px-3 py-2 rounded bg-slate-900 border border-slate-700"
                        />
                    </label>

                    <button
                        onClick={loadMeta}
                        className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm"
                    >
                        Load meta.json
                    </button>

                    <label className="text-sm">
                        Page{" "}
                        <input
                            type="number"
                            value={page}
                            onChange={(e) => setPage(Number(e.target.value))}
                            className="ml-2 w-20 px-3 py-2 rounded bg-slate-900 border border-slate-700"
                        />
                    </label>

                    <button
                        onClick={renderPage}
                        disabled={loading}
                        className="px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-sm"
                    >
                        {loading ? "Rendering..." : "Render page"}
                    </button>

                    {pdfUrl && (
                        <a
                            className="text-xs underline text-slate-300"
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open PDF
                        </a>
                    )}
                </div>

                <div className="text-xs text-slate-400">
                    Drag a rectangle on the page. Copy the output JSON into your meta.json under the question key.
                </div>

                {status && <div className="text-xs text-slate-300">Status: {status}</div>}
                {err && <div className="text-red-300 text-sm">Error: {err}</div>}
            </div>

            <div className="glass p-4">
                <div className="overflow-auto rounded border border-slate-700 bg-black/20 p-3">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        style={{ display: "block", cursor: "crosshair" }}
                    />
                </div>

                <div className="mt-4">
                    <div className="text-sm text-slate-300 mb-1">Crop JSON</div>
                    <pre className="text-xs bg-slate-900/50 p-3 rounded whitespace-pre-wrap break-words">
                        {cropJson ? JSON.stringify(cropJson, null, 2) : "Drag to select a crop region…"}
                    </pre>
                </div>
            </div>
        </div>
    );
}
