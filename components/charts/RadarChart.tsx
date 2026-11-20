"use client";

import { motion, useReducedMotion } from "framer-motion";
import { dimShort } from "@/lib/constants";
import type { DimensionId } from "@/lib/types";
import { DRAW_VARIANTS } from "./draw";

export interface RadarPoint {
  dimension: DimensionId;
  expected: number;
  experienced?: number;
}

/** Expectation polygon (yellow outline) over experience polygon (blue fill). Scale 1 to 5. */
export function RadarChart({
  points,
  size = 360,
  showExperience = true,
  pulseGaps = true,
  drawDelay = 0,
}: {
  points: RadarPoint[];
  size?: number;
  showExperience?: boolean;
  pulseGaps?: boolean;
  drawDelay?: number;
}) {
  const reduce = useReducedMotion();
  const c = size / 2;
  const R = size / 2 - 52;
  const n = points.length;
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number) => {
    const r = (Math.max(0, v - 1) / 4) * R;
    return [c + r * Math.cos(angle(i)), c + r * Math.sin(angle(i))] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const expPath = `M${points.map((p, i) => pt(i, p.expected).join(",")).join(" L")} Z`;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full max-w-[420px]" role="img" aria-label="Personal radar: expected versus experienced">
      <defs>
        <radialGradient id="rad-fill">
          <stop offset="0" stopColor="#4DA3FF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#005DAA" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {[1, 2, 3, 4, 5].map((lvl) => (
        <polygon
          key={lvl}
          points={poly(points.map(() => lvl))}
          fill="none"
          stroke="#E8EEF7"
          strokeOpacity={lvl === 5 ? 0.16 : 0.07}
        />
      ))}
      {points.map((p, i) => {
        const [x, y] = pt(i, 5);
        const [lx, ly] = pt(i, 5.9);
        return (
          <g key={p.dimension}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="#E8EEF7" strokeOpacity={0.07} />
            <text
              x={lx}
              y={ly}
              textAnchor={Math.abs(lx - c) < 8 ? "middle" : lx > c ? "start" : "end"}
              dominantBaseline="middle"
              fontSize={11.5}
              fill="#E8EEF7"
              fillOpacity={0.75}
              fontWeight={600}
            >
              {dimShort(p.dimension)}
            </text>
          </g>
        );
      })}

      {showExperience && (
        <motion.path
          d={`M${poly(points.map((p) => p.experienced ?? 1)).split(" ").join(" L")} Z`}
          fill="url(#rad-fill)"
          stroke="#4DA3FF"
          strokeWidth={2}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, d: `M${poly(points.map((p) => p.experienced ?? 1)).split(" ").join(" L")} Z` }}
          transition={{ duration: 1, delay: drawDelay + 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: `${c}px`, originY: `${c}px` }}
        />
      )}

      <motion.path
        d={expPath}
        fill="none"
        stroke="#FFDF01"
        strokeWidth={2.5}
        strokeLinejoin="round"
        variants={DRAW_VARIANTS}
        initial={reduce ? false : "hidden"}
        animate="shown"
        transition={{ duration: 1.4, delay: drawDelay, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 6px rgba(255,223,1,0.5))" }}
      />

      {points.map((p, i) => {
        const [x, y] = pt(i, p.expected);
        const gap = showExperience && p.experienced !== undefined ? p.expected - p.experienced : 0;
        return (
          <g key={`dot-${p.dimension}`}>
            {pulseGaps && gap >= 1.5 && !reduce && (
              <motion.circle
                cx={x}
                cy={y}
                fill="#FFDF01"
                initial={{ r: 4, opacity: 0.6 }}
                animate={{ r: [4, 14, 4], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
              />
            )}
            <motion.circle
              cx={x}
              cy={y}
              r={4}
              fill="#FFDF01"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: drawDelay + 0.8 + i * 0.05 }}
            />
          </g>
        );
      })}
    </svg>
  );
}
