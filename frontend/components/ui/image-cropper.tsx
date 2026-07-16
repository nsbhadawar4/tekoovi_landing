"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";

/* -------------------------------------------------------------- */
/*  Image cropper — dependency-free.                               */
/*  Cover-fits the source into a fixed-aspect frame, lets the user  */
/*  pan (drag) and zoom (slider / wheel), then exports the visible  */
/*  region to a JPEG blob at a fixed output width.                 */
/* -------------------------------------------------------------- */

type Point = { x: number; y: number };

export function ImageCropper({
  src,
  aspect = 16 / 10,
  outputWidth = 1200,
  busy = false,
  onCancel,
  onCrop,
}: {
  src: string;
  aspect?: number;
  outputWidth?: number;
  busy?: boolean;
  onCancel: () => void;
  onCrop: (blob: Blob) => void;
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

  // Center the image inside the crop frame for the given geometry.
  const center = useCallback(
    (bw: number, n: { w: number; h: number }, z: number) => {
      const bh = bw / aspect;
      const s = Math.max(bw / n.w, bh / n.h) * z;
      setOffset({ x: (bw - n.w * s) / 2, y: (bh - n.h * s) / 2 });
    },
    [aspect],
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

  const coverScale =
    nat && boxW ? Math.max(boxW / nat.w, boxH / nat.h) : 1;
  const scale = coverScale * zoom;
  const dispW = nat ? nat.w * scale : 0;
  const dispH = nat ? nat.h * scale : 0;

  const clamp = useCallback(
    (o: Point): Point => ({
      x: Math.min(0, Math.max(boxW - dispW, o.x)),
      y: Math.min(0, Math.max(boxH - dispH, o.y)),
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
    const oldS = coverScale * zoom;
    const newS = coverScale * z;
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
    const s = coverScale * zoom;
    // Source rectangle currently under the crop frame.
    const sx = -offset.x / s;
    const sy = -offset.y / s;
    const sw = boxW / s;
    const sh = boxH / s;

    const outW = outputWidth;
    const outH = Math.round(outputWidth / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    canvas.toBlob(
      (blob) => {
        if (blob) onCrop(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d14] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Crop image</h3>
          <button
            onClick={onCancel}
            disabled={busy}
            aria-label="Close"
            className="text-white/40 transition-colors hover:text-white disabled:opacity-50"
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
          className="relative mt-4 w-full cursor-grab touch-none overflow-hidden rounded-xl border border-white/10 bg-black/40 active:cursor-grabbing"
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
            <div className="absolute inset-0 grid place-items-center text-xs text-white/40">
              Loading…
            </div>
          )}
        </div>

        {/* zoom */}
        <div className="mt-4 flex items-center gap-3">
          <ZoomIn className="h-4 w-4 shrink-0 text-white/50" />
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

        <p className="mt-3 text-[11px] text-white/40">
          Drag to reposition · scroll or use the slider to zoom.
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={busy || !nat}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {busy ? "Uploading…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
