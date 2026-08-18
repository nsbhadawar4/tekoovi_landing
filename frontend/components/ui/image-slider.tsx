"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Image carousel with prev/next, dots, keyboard arrows and a thumbnail strip. */
export function ImageSlider({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (n: number) => setIndex((i) => (i + n + count) % count);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[26px] bg-[linear-gradient(140deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_45%,rgba(138,92,255,0.28))] p-px">
        <div
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(-1);
            if (e.key === "ArrowRight") go(1);
          }}
          className="group relative overflow-hidden rounded-[25px] bg-bg-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
        >
          {/* track */}
          <div
            className="flex transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, i) => (
              <div
                key={i}
                className="relative aspect-[16/9] w-full shrink-0 basis-full"
              >
                {/* blurred fill so any aspect ratio sits gap-free */}
                <div
                  aria-hidden
                  className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl saturate-125"
                  style={{ backgroundImage: `url(${src})` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${alt} — ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            ))}
          </div>

          {count > 1 && (
            <>
              {/* controls */}
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/70 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 text-white opacity-0 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-black/70 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* counter */}
              <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                {index + 1} / {count}
              </span>

              {/* dots */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === index
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* thumbnail strip */}
      {count > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                i === index
                  ? "border-brand-2/70 opacity-100 ring-1 ring-brand-2/50"
                  : "border-white/10 opacity-55 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
