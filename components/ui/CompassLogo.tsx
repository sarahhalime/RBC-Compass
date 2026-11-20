"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Compass mark. The needle drifts gently, and snaps to north when `success` is true. */
export function CompassLogo({
  size = 32,
  success = false,
  className,
}: {
  size?: number;
  success?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="cl-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4DA3FF" />
          <stop offset="1" stopColor="#005DAA" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="21" fill="#0A2A5E" stroke="url(#cl-ring)" strokeWidth="2.5" />
      {[0, 90, 180, 270].map((a) => (
        <line
          key={a}
          x1="24"
          y1="5.5"
          x2="24"
          y2="9"
          stroke="#E8EEF7"
          strokeOpacity={a === 0 ? 0.9 : 0.35}
          strokeWidth="1.6"
          strokeLinecap="round"
          transform={`rotate(${a} 24 24)`}
        />
      ))}
      <motion.g
        style={{ originX: "24px", originY: "24px", transformBox: "view-box" }}
        animate={
          success || reduce
            ? { rotate: 0 }
            : { rotate: [-14, 10, -6, 12, -14] }
        }
        transition={
          success
            ? { type: "spring", stiffness: 380, damping: 14 }
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <path d="M24 9 L28.5 24 L24 22 L19.5 24 Z" fill="#FFDF01" />
        <path d="M24 39 L19.5 24 L24 26 L28.5 24 Z" fill="#E8EEF7" fillOpacity="0.55" />
        <circle cx="24" cy="24" r="2.4" fill="#06142E" stroke="#FFDF01" strokeWidth="1.2" />
      </motion.g>
    </svg>
  );
}
