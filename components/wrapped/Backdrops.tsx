"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Waves({ color = "#4DA3FF" }: { color?: string }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <motion.svg
          key={i}
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-[200%]"
          style={{ opacity: 0.18 + i * 0.1 }}
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 14 - i * 3, repeat: Infinity, ease: "linear" }}
        >
          <path
            d={`M0 ${110 + i * 22} C 150 ${60 + i * 20}, 300 ${160 - i * 10}, 600 ${110 + i * 22} S 1050 ${60 + i * 20}, 1200 ${110 + i * 22} V200 H0 Z`}
            fill={color}
          />
        </motion.svg>
      ))}
    </div>
  );
}

export function Particles({ count = 26, color = "#FFDF01" }: { count?: number; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37.3) % 100;
        const size = 2 + ((i * 7) % 5);
        const dur = 6 + ((i * 13) % 7);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ left: `${left}%`, bottom: -10, width: size, height: size, background: color, boxShadow: `0 0 ${size * 3}px ${color}` }}
            animate={reduce ? { opacity: 0.4, y: -200 - i * 10 } : { y: [0, -900], opacity: [0, 0.9, 0] }}
            transition={{ duration: dur, repeat: Infinity, delay: (i * 0.37) % dur, ease: "linear" }}
          />
        );
      })}
    </div>
  );
}

export function Orbits() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden">
      {[260, 380, 520].map((s, i) => (
        <motion.div
          key={s}
          className="absolute rounded-full border border-dashed border-white/15"
          style={{ width: s, height: s }}
          animate={reduce ? undefined : { rotate: i % 2 ? -360 : 360 }}
          transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-rbc-yellow shadow-glow" />
        </motion.div>
      ))}
    </div>
  );
}
