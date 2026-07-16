"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const sizes: Record<Size, string> = {
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-[15px]",
};

const variants: Record<Variant, string> = {
  primary: "btn-brand text-white",
  secondary:
    "glass text-ink hover:bg-white/[0.07] hover:border-white/15",
  ghost: "text-ink-2 hover:text-ink",
};

type ButtonProps = {
  children: ReactNode;
  href?: string;
  external?: boolean;
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  withArrow?: boolean;
  className?: string;
  onClick?: () => void;
};

export function Button({
  children,
  href,
  external,
  variant = "primary",
  size = "md",
  magnetic = false,
  withArrow = false,
  className,
  onClick,
}: ButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  function handleMove(e: React.MouseEvent) {
    if (!magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  const cls = cn(
    "group relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-300 will-change-transform",
    sizes[size],
    variants[variant],
    className,
  );

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {withArrow && (
        <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
    </>
  );

  const motionProps = {
    ref: ref as never,
    onMouseMove: handleMove,
    onMouseLeave: reset,
    onClick,
    style: { x: sx, y: sy },
    className: cls,
  };

  if (href) {
    return (
      <motion.a
        {...motionProps}
        href={href}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button {...motionProps} type="button">
      {inner}
    </motion.button>
  );
}
