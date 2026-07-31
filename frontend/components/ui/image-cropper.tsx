"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";

/* -------------------------------------------------------------- */
/*  Image cropper — dependency-free.                               */
/*  Fits the source into a fixed-aspect frame, lets the user pan    */
/*  (drag) and zoom (slider / wheel), then exports the visible      */
/*  region at a fixed output width.                                 */
/*                                                                  */
/*  Two fits:                                                       */
/*   • "cover"   — fills the frame (photos: hero banner, cards).     */
/*   • "contain" — the whole image is visible at zoom 1 and the      */
/*                 spare space stays transparent. Logos need this;   */
/*                 a wide wordmark can never fit a square frame      */
/*                 under cover, which is why it looked cut off.      */
/* -------------------------------------------------------------- */

type Point = { x: number; y: number };

export type CropFit = "cover" | "contain";

export function ImageCropper({
  src,
  aspect = 16 / 10,
  fit = "cover",
  outputWidth = 1100,
  quality = 0.82,
  busy = false,
  onCancel,
  onCrop,
}: {
  src: string;
  aspect?: number;
  fit?: CropFit;
  outputWidth?: number;
  quality?: number;
  busy?: boolean;
  onCancel: () => void;
  onCrop: (dataUrl: string) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ start: Point; origin: Point } | null>(null);
  // Latest geometry, readable inside callbacks without re-subscribing effects.
  const geom = useRef<{
    boxW: number;
    nat: { w: number; h: number } | null;
    zoom: number;
  }>({ boxW: 0, nat: null, zoom: 1 });

  const [boxW, setBoxW] = useState(0);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  const boxH = boxW / aspect;

  // Scale at zoom 1: cover fills the frame, contain fits the whole image in.
  const baseScaleFor = useCallback(
    (bw: number, bh: number, n: { w: number; h: number }) =>
      fit === "contain"
        ? Math.min(bw / n.w, bh / n.h)
        : Math.max(bw / n.w, bh / n.h),
    [fit],
  );

  // Center the image inside the crop frame for the given geometry.
  const center = useCallback(
    (bw: number, n: { w: number; h: number }, z: number) => {
      const bh = bw / aspect;
      const s = baseScaleFor(bw, bh, n) * z;
      setOffset({ x: (bw - n.w * s) / 2, y: (bh - n.h * s) / 2 });
    },
    [aspect, baseScaleFor],
  );

  // Load the image to learn its natural size (and keep it for canvas export).
  // Centering happens in this onload callback — an external-system callback,
  // never synchronously in the effect body.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const n = { w: img.naturalWidth, h: img.naturalHeight };
      geom.current.nat = n;
      geom.current.zoom = 1;
      setNat(n);
      setZoom(1);
      if (geom.current.boxW) center(geom.current.boxW, n, 1);
    };
    img.src = src;
  }, [src, center]);

  // Measure the crop frame width (responsive) on mount + resize.
  useEffect(() => {
    const measure = () => {
      const w = boxRef.current?.clientWidth ?? 0;
      geom.current.boxW = w;
      setBoxW(w);
      if (w && geom.current.nat) center(w, geom.current.nat, geom.current.zoom);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [center]);

  const baseScale = nat && boxW ? baseScaleFor(boxW, boxH, nat) : 1;
  const scale = baseScale * zoom;
  const dispW = nat ? nat.w * scale : 0;
  const dispH = nat ? nat.h * scale : 0;

  // An axis smaller than the frame (only possible under "contain") has nothing
  // to pan — it stays centred instead of being dragged off the edge.
  const clamp = useCallback(
    (o: Point): Point => ({
      x:
        dispW <= boxW
          ? (boxW - dispW) / 2
          : Math.min(0, Math.max(boxW - dispW, o.x)),
      y:
        dispH <= boxH
          ? (boxH - dispH) / 2
          : Math.min(0, Math.max(boxH - dispH, o.y)),
    }),
    [boxW, boxH, dispW, dispH],
  );

  function onPointerDown(e: React.PointerEvent) {
    if (!nat) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      start: { x: e.clientX, y: e.clientY },
      origin: offset,
    };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    setOffset(
      clamp({
        x: d.origin.x + (e.clientX - d.start.x),
        y: d.origin.y + (e.clientY - d.start.y),
      }),
    );
  }
  function onPointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // Zoom around the frame centre so the middle of the image stays put.
  function applyZoom(next: number) {
    const z = Math.min(3, Math.max(1, next));
    geom.current.zoom = z;
    if (!nat || !boxW) return setZoom(z);
    const oldS = baseScale * zoom;
    const newS = baseScale * z;
    const cx = boxW / 2;
    const cy = boxH / 2;
    const srcX = (cx - offset.x) / oldS;
    const srcY = (cy - offset.y) / oldS;
    setZoom(z);
    setOffset(clamp({ x: cx - srcX * newS, y: cy - srcY * newS }));
  }

  function onWheel(e: React.WheelEvent) {
    applyZoom(zoom - e.deltaY * 0.0015);
  }

  function handleCrop() {
    const img = imgRef.current;
    if (!img || !nat || !boxW) return;

    const outW = outputWidth;
    const outH = Math.round(outputWidth / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";

    // Paint the image exactly where the preview shows it, scaled from frame
    // pixels to output pixels. Drawing by destination (rather than by source
    // rect) keeps working under "contain", where the image is smaller than the
    // frame and part of the canvas stays empty.
    const k = outW / boxW;
    ctx.drawImage(img, offset.x * k, offset.y * k, dispW * k, dispH * k);

    // A data URL is stored directly in the content (works on serverless — no
    // filesystem write needed). "contain" exports PNG so the padding around a
    // logo stays transparent instead of turning into black JPEG bars.
    onCrop(
      fit === "contain"
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", quality),
    );
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-bg/80 p-3 backdrop-blur-sm sm:p-4">
      <div className="card-elevated my-auto w-full max-w-md rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Crop image</h3>
          <button
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
            className="text-ink-3 transition-colors hover:text-ink disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* crop frame */}
        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          style={{
            height: boxH || undefined,
            backgroundImage: nat ? `url(${src})` : undefined,
            backgroundRepeat: "no-repeat",
            backgroundSize: nat ? `${dispW}px ${dispH}px` : undefined,
            backgroundPosition: `${offset.x}px ${offset.y}px`,
            touchAction: "none",
          }}
          className="relative mt-4 w-full cursor-grab touch-none overflow-hidden rounded-xl border border-line bg-bg/50 active:cursor-grabbing"
        >
          {/* grid guides */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/10" />
            ))}
          </div>
          {!nat && (
            <div className="absolute inset-0 grid place-items-center text-xs text-ink-3">
              Loading…
            </div>
          )}
        </div>

        {/* zoom */}
        <div className="mt-4 flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-ink-3" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            className="h-1 w-full cursor-pointer accent-brand"
          />
        </div>

        <p className="mt-3 text-[11px] text-ink-3">
          Drag to reposition · scroll or use the slider to zoom.
        </p>

        <div className="mt-5 flex gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-lg border border-line bg-white/[0.02] px-4 py-2.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-50 sm:flex-none sm:py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={busy || !nat}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl btn-brand px-4 py-2.5 text-sm font-semibold text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-50 sm:flex-none sm:py-2"
          >
            <Check className="h-4 w-4" />
            {busy ? "Uploading…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
