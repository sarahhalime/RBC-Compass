"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/hooks";

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  strength?: number;
  type?: "button" | "submit";
  ariaLabel?: string;
};

/** Button that leans toward the pointer on desktop. Falls back to a normal button with reduced motion. */
export function Magnetic({ children, className, href, onClick, disabled, strength = 0.3, type = "button", ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const inner = href ? (
    <Link href={href} className={cn("btn", className)} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <button type={type} className={cn("btn", className)} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  );

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      className="inline-flex"
    >
      {inner}
    </motion.div>
  );
}
