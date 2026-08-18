"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type CarouselProps = {
  /** One entry per slide. */
  slides: ReactNode[];
  /** Accessible name, e.g. "Client success stories". */
  label: string;
  /** Width of a slide — Tailwind basis classes set how many fit per view. */
  slideClass?: string;
  /** Advance on a timer until the pointer, focus or the tab takes over. */
  autoPlay?: boolean;
  intervalMs?: number;
  /** Arrow buttons floating over the rail (always shown in the header row). */
  showArrows?: boolean;
  showDots?: boolean;
  /** Thin scrub line under the rail — reads well under wide slides. */
  showProgress?: boolean;
  className?: string;
  railClassName?: string;
};

/**
 * Scroll-snap carousel.
 *
 * Built on real overflow scrolling rather than a transformed track, so touch
 * swipe, trackpad gestures, keyboard and screen readers all work natively; the
 * arrows, dots and pointer-drag just script the same scroll position.
 */
export function Carousel({
  slides,
  label,
  slideClass = "basis-full",
  autoPlay = false,
  intervalMs = 5600,
  showArrows = true,
  showDots = true,
  showProgress = false,
  className,
  railClassName,
}: CarouselProps) {
  const railRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [stops, setStops] = useState(1);
  const [paused, setPaused] = useState(false);

  /** Distance between two slide starts, and how many scroll stops exist. */
  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return { step: 1, count: 1 };
    const first = rail.children[0] as HTMLElement | undefined;
    const second = rail.children[1] as HTMLElement | undefined;
    const step =
      first && second
        ? second.offsetLeft - first.offsetLeft
        : (first?.offsetWidth ?? rail.clientWidth);
    const scrollable = rail.scrollWidth - rail.clientWidth;
    const count = step > 0 ? Math.max(1, Math.round(scrollable / step) + 1) : 1;
    return { step: step || 1, count };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const sync = () => {
      const { step, count } = measure();
      setStops(count);
      setIndex(Math.min(count - 1, Math.max(0, Math.round(rail.scrollLeft / step))));
    };

    sync();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    rail.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(rail);
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [measure, slides.length]);

  const goTo = useCallback(
    (next: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const { step, count } = measure();
      const target = ((next % count) + count) % count;
      rail.scrollTo({ left: target * step, behavior: "smooth" });
    },
    [measure],
  );

  // Autoplay pauses on hover, focus, drag and while the tab is hidden.
  useEffect(() => {
    if (!autoPlay || paused || stops < 2) return;
    const id = window.setInterval(() => goTo(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, paused, stops, index, intervalMs, goTo]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /* --- pointer drag (mouse); touch scrolls natively --- */
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "touch") return;
    const rail = railRef.current;
    if (!rail) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      startLeft: rail.scrollLeft,
      moved: 0,
    };
    setPaused(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    const rail = railRef.current;
    if (!drag.current.active || !rail) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(delta));
    rail.scrollLeft = drag.current.startLeft - delta;
  }

  function endDrag() {
    if (!drag.current.active) return;
    drag.current.active = false;
    setPaused(false);
    // Settle on the nearest slide once the hand lets go.
    const { step } = measure();
    const rail = railRef.current;
    if (rail) goTo(Math.round(rail.scrollLeft / step));
  }

  // A drag that ends on a link must not also open it.
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved > 8) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = 0;
    }
  }

  const many = stops > 1;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        endDrag();
        setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <ul
        ref={railRef}
        tabIndex={0}
        aria-label={`${label} — use the arrow keys to browse`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            goTo(index - 1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            goTo(index + 1);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={cn(
          "no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-[28px] outline-none sm:gap-6",
          "focus-visible:ring-2 focus-visible:ring-brand-2/50",
          many && "cursor-grab active:cursor-grabbing",
          railClassName,
        )}
      >
        {slides.map((slide, i) => (
          <li
            key={i}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={cn("shrink-0 snap-start", slideClass)}
          >
            {slide}
          </li>
        ))}
      </ul>

      {many && (showArrows || showDots || showProgress) && (
        <div className="mt-7 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            {showDots &&
              Array.from({ length: stops }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-out-expo",
                    i === index
                      ? "w-8 bg-linear-to-r from-brand-2 to-brand-3 shadow-[0_0_12px_2px_rgba(138,92,255,0.5)]"
                      : "w-1.5 bg-ink-3/40 hover:bg-ink-3/70",
                  )}
                />
              ))}
          </div>

          {showProgress && (
            <div className="hidden h-px flex-1 bg-line sm:block">
              <div
                className="h-px bg-linear-to-r from-brand-2 to-brand-3 transition-[width] duration-500 ease-out-expo"
                style={{ width: `${((index + 1) / stops) * 100}%` }}
              />
            </div>
          )}

          {showArrows && (
            <div className="flex items-center gap-2">
              <ArrowButton
                label="Previous slide"
                onClick={() => goTo(index - 1)}
              >
                <ChevronLeft className="h-4.5 w-4.5" />
              </ArrowButton>
              <ArrowButton label="Next slide" onClick={() => goTo(index + 1)}>
                <ChevronRight className="h-4.5 w-4.5" />
              </ArrowButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/[0.03] text-ink-2 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-2/50 hover:bg-brand/10 hover:text-ink hover:shadow-[var(--shadow-brand)] active:translate-y-0"
    >
      {children}
    </button>
  );
}
