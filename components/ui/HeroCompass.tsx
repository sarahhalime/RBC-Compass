"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Full size animated compass for the landing hero. */
export function HeroCompass({ size = 520 }: { size?: number }) {
  const reduce = useReducedMotion();
  const c = 260;
  return (
    <svg viewBox="0 0 520 520" width={size} height={size} className="h-auto w-full max-w-[520px]" aria-hidden>
      <defs>
        <radialGradient id="hc-core">
          <stop offset="0" stopColor="#0A2A5E" />
          <stop offset="1" stopColor="#06142E" />
        </radialGradient>
        <linearGradient id="hc-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4DA3FF" />
          <stop offset="0.5" stopColor="#005DAA" />
          <stop offset="1" stopColor="#FFDF01" />
        </linearGradient>
        <filter id="hc-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <motion.circle
        cx={c}
        cy={c}
        r={240}
        fill="none"
        stroke="url(#hc-ring)"
        strokeOpacity={0.35}
        strokeWidth={1}
        strokeDasharray="2 8"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        style={{ originX: "260px", originY: "260px" }}
      />
      <circle cx={c} cy={c} r={200} fill="url(#hc-core)" stroke="url(#hc-ring)" strokeWidth={3} />

      <motion.g
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        style={{ originX: "260px", originY: "260px" }}
      >
        {Array.from({ length: 72 }).map((_, i) => (
          <line
            key={i}
            x1={c}
            y1={68}
            x2={c}
            y2={i % 9 === 0 ? 86 : 76}
            stroke="#E8EEF7"
            strokeOpacity={i % 9 === 0 ? 0.7 : 0.2}
            strokeWidth={i % 9 === 0 ? 2 : 1}
            transform={`rotate(${i * 5} ${c} ${c})`}
          />
        ))}
      </motion.g>

      {[
        { t: "N", a: 0 },
        { t: "E", a: 90 },
        { t: "S", a: 180 },
        { t: "W", a: 270 },
      ].map(({ t, a }) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return (
          <text
            key={t}
            x={c + Math.cos(rad) * 150}
            y={c + Math.sin(rad) * 150}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={22}
            fontWeight={700}
            fill={t === "N" ? "#FFDF01" : "#E8EEF7"}
            fillOpacity={t === "N" ? 1 : 0.45}
            className="font-display"
          >
            {t}
          </text>
        );
      })}

      <motion.g
        style={{ originX: "260px", originY: "260px" }}
        initial={{ rotate: -120 }}
        animate={reduce ? { rotate: 0 } : { rotate: [-120, 18, -10, 6, -3, 0, 8, -6, 0] }}
        transition={reduce ? undefined : { duration: 9, times: [0, 0.12, 0.2, 0.28, 0.34, 0.4, 0.65, 0.85, 1], repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
      >
        <path d="M260 120 L280 260 L260 248 L240 260 Z" fill="#FFDF01" filter="url(#hc-glow)" />
        <path d="M260 400 L240 260 L260 272 L280 260 Z" fill="#E8EEF7" fillOpacity={0.5} />
        <circle cx={c} cy={c} r={14} fill="#06142E" stroke="#FFDF01" strokeWidth={3} />
      </motion.g>
    </svg>
  );
}
