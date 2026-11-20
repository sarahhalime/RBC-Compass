"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/** Slow drifting light fields, subtle grain, and a soft cursor glow on desktop. */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#0A2A5E_0%,#06142E_55%,#040d1f_100%)]" />
      <div className="absolute -left-[15%] -top-[20%] h-[70vh] w-[70vh] rounded-full bg-[#005DAA] opacity-[0.22] blur-[120px] animate-drift" />
      <div
        className="absolute -right-[10%] top-[30%] h-[60vh] w-[60vh] rounded-full bg-[#4DA3FF] opacity-[0.12] blur-[140px] animate-drift"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-25%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-[#FFDF01] opacity-[0.05] blur-[140px] animate-drift"
        style={{ animationDelay: "-11s" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(232,238,247,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(232,238,247,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
    </div>
  );
}

export function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const x = useSpring(mx, { stiffness: 120, damping: 20 });
  const y = useSpring(my, { stiffness: 120, damping: 20 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine && !reduce);
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX - 200);
      my.set(e.clientY - 200);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(77,163,255,0.12),transparent_65%)]"
    />
  );
}
