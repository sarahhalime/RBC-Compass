"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Concentric rings that burst outward each time `trigger` changes. */
export function TapRipple({ trigger, color = "#FFDF01" }: { trigger: number; color?: string }) {
  const reduce = useReducedMotion();
  if (reduce || !trigger) return null;
  return (
    <AnimatePresence>
      <div key={trigger} aria-hidden className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border-2"
            style={{ borderColor: color, width: 120, height: 120 }}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 4.5, opacity: 0 }}
            transition={{ duration: 1.4, delay: i * 0.18, ease: "easeOut" }}
          />
        ))}
      </div>
    </AnimatePresence>
  );
}

/** Looping "tag detected" pulse for the phone landing page. */
export function DetectPulse() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute h-40 w-40 rounded-full border border-rbc-yellow/60"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={reduce ? { opacity: 0.4, scale: 1 } : { scale: [0.4, 2.6], opacity: [0.8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
