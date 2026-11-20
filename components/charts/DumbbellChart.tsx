"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { scaleLinear } from "d3-scale";
import { ArrowDownRight, ArrowUpRight, Minus, Nfc } from "lucide-react";
import { useState } from "react";
import { dimLabel, TOP_THEMES } from "@/lib/constants";
import type { DimensionId, GapRow } from "@/lib/types";
import { useCountUp, useMeasure } from "./useMeasure";

const EASE = [0.16, 1, 0.3, 1] as const;

function GapNumber({ value, x, y, color, delay }: { value: number; x: number; y: number; color: string; delay: number }) {
  const v = useCountUp(value, 1.2, delay);
  return (
    <text x={x} y={y} textAnchor="end" dominantBaseline="middle" className="num" fontSize={20} fontWeight={700} fill={color}>
      {Math.round(v)}
      <tspan fontSize={11} fontWeight={600} fill="#E8EEF7" fillOpacity={0.5} dx={2}>
        pts
      </tspan>
    </text>
  );
}

export interface DumbbellProps {
  rows: GapRow[];
  n: number;
  /** Projected gap per dimension from the Gap Closer simulator. */
  projected?: Partial<Record<DimensionId, number>>;
  /** Dimensions that just changed live. They glow for a moment. */
  flash?: DimensionId[];
}

export function DumbbellChart({ rows, n, projected, flash = [] }: DumbbellProps) {
  const [ref, width] = useMeasure<HTMLDivElement>();
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<{ row: GapRow; y: number } | null>(null);

  const compact = width > 0 && width < 600;
  const rowH = compact ? 66 : 56;
  const labelW = compact ? 0 : Math.min(230, width * 0.3);
  const numW = 70;
  const top = 26;
  const trackL = labelW + 12;
  const trackR = Math.max(trackL + 40, width - numW - 8);
  const x = scaleLinear().domain([0, 100]).range([trackL, trackR]);
  const height = top + rows.length * rowH + 8;
  const sorted = [...rows].sort((a, b) => b.gap - a.gap);

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg width={width} height={height} role="img" aria-label="Experience Gap by dimension: expected versus experienced">
          <defs>
            <linearGradient id="db-bar" x1="0" x2="1">
              <stop offset="0" stopColor="#4DA3FF" stopOpacity="0.85" />
              <stop offset="1" stopColor="#FFDF01" stopOpacity="0.85" />
            </linearGradient>
            <filter id="db-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={top - 8} y2={height - 4} stroke="#E8EEF7" strokeOpacity={0.06} strokeDasharray="2 4" />
              <text x={x(t)} y={10} textAnchor="middle" fontSize={10} fill="#E8EEF7" fillOpacity={0.4}>
                {t}%
              </text>
            </g>
          ))}

          {sorted.map((row, i) => {
            const yMid = top + i * rowH + (compact ? rowH * 0.62 : rowH / 2);
            const lo = Math.min(row.expectedPct, row.experiencedPct);
            const hi = Math.max(row.expectedPct, row.experiencedPct);
            const ahead = row.experiencedPct > row.expectedPct;
            const p = projected?.[row.dimension];
            const projX = p !== undefined && p < row.gap ? x(row.expectedPct - p) : null;
            const delay = reduce ? 0 : 0.15 + i * 0.07;
            const isFlash = flash.includes(row.dimension);
            const gapColor = ahead ? "#2ECC8F" : row.gap >= 25 ? "#FFDF01" : "#FFFFFF";

            return (
              <g
                key={row.dimension}
                style={{ cursor: "pointer", outline: "none" }}
                onMouseEnter={() => setHover({ row, y: yMid })}
                onFocus={() => setHover({ row, y: yMid })}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${dimLabel(row.dimension)}: expected ${row.expectedPct} percent, experienced ${row.experiencedPct} percent, gap ${row.gap} points`}
              >
                <motion.rect
                  x={0}
                  width={width}
                  height={rowH - 6}
                  rx={14}
                  initial={false}
                  animate={{
                    y: yMid - (compact ? rowH * 0.62 : rowH / 2) + 3,
                    fill: isFlash ? "rgba(255,223,1,0.12)" : hover?.row.dimension === row.dimension ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0)",
                  }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
                <motion.text
                  x={compact ? trackL : 8}
                  initial={false}
                  animate={{ y: compact ? yMid - 22 : yMid }}
                  transition={{ duration: 0.6, ease: EASE }}
                  dominantBaseline="middle"
                  fontSize={compact ? 12.5 : 13.5}
                  fontWeight={600}
                  fill="#E8EEF7"
                >
                  {dimLabel(row.dimension)}
                </motion.text>

                <motion.line
                  x1={x(0)}
                  x2={x(100)}
                  initial={false}
                  animate={{ y1: yMid, y2: yMid }}
                  stroke="#E8EEF7"
                  strokeOpacity={0.07}
                  strokeWidth={6}
                  strokeLinecap="round"
                />

                <motion.rect
                  height={8}
                  rx={4}
                  fill={ahead ? "#2ECC8F" : "url(#db-bar)"}
                  fillOpacity={ahead ? 0.6 : 1}
                  initial={{ x: x(0), width: 0, y: yMid - 4 }}
                  animate={{ x: x(lo), width: Math.max(0, x(hi) - x(lo)), y: yMid - 4 }}
                  transition={{ duration: 1.1, delay, ease: EASE }}
                />

                {projX !== null && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.line
                      initial={false}
                      animate={{ x1: x(row.experiencedPct), x2: projX, y1: yMid + 13, y2: yMid + 13 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      stroke="#4DA3FF"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                    <motion.circle
                      r={9}
                      fill="#4DA3FF"
                      fillOpacity={0.15}
                      stroke="#4DA3FF"
                      strokeDasharray="3 2"
                      strokeWidth={1.5}
                      initial={{ cx: x(row.experiencedPct), cy: yMid }}
                      animate={{ cx: projX, cy: yMid }}
                      transition={{ duration: 0.7, ease: EASE }}
                    />
                  </motion.g>
                )}

                <motion.circle
                  r={9}
                  fill="#005DAA"
                  stroke="#4DA3FF"
                  strokeWidth={2.5}
                  initial={{ cx: x(0), cy: yMid, opacity: 0 }}
                  animate={{ cx: x(row.experiencedPct), cy: yMid, opacity: 1 }}
                  transition={{ duration: 1.1, delay, ease: EASE }}
                />
                <motion.circle
                  r={8}
                  fill="#FFDF01"
                  filter="url(#db-glow)"
                  initial={{ cx: x(0), cy: yMid, opacity: 0 }}
                  animate={{ cx: x(row.expectedPct), cy: yMid, opacity: 1 }}
                  transition={{ duration: 1.1, delay: delay + 0.05, ease: EASE }}
                />

                <motion.g initial={false} animate={{ y: yMid }} transition={{ duration: 0.6, ease: EASE }}>
                  <GapNumber value={row.gap} x={width - 6} y={0} color={gapColor} delay={delay} />
                  {p !== undefined && p < row.gap && (
                    <text x={width - 6} y={17} textAnchor="end" fontSize={10.5} fill="#4DA3FF" fontWeight={600}>
                      to {p} projected
                    </text>
                  )}
                </motion.g>
              </g>
            );
          })}
        </svg>
      )}
      {width === 0 && <div style={{ height: 9 * 56 + 30 }} className="skeleton" />}

      <AnimatePresence>
        {hover && (
          <motion.div
            key={hover.row.dimension}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="glass-strong pointer-events-none absolute z-20 w-72 rounded-2xl p-4 text-xs shadow-card"
            style={{
              top: Math.min(hover.y + 24, height - 150),
              left: Math.max(0, Math.min(width - 288, x(hover.row.experiencedPct) - 40)),
            }}
          >
            <p className="font-semibold text-white">{dimLabel(hover.row.dimension)}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div>
                <p className="text-rbc-mist/50">Expected</p>
                <p className="num text-base font-bold text-rbc-yellow">{hover.row.expectedPct}%</p>
              </div>
              <div>
                <p className="text-rbc-mist/50">Experienced</p>
                <p className="num text-base font-bold text-rbc-sky">{hover.row.experiencedPct}%</p>
              </div>
              <div>
                <p className="text-rbc-mist/50">n</p>
                <p className="num text-base font-bold text-white">{n}</p>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1 text-rbc-mist/80">
              {hover.row.trend > 0 ? (
                <ArrowUpRight size={14} className="text-danger" />
              ) : hover.row.trend < 0 ? (
                <ArrowDownRight size={14} className="text-success" />
              ) : (
                <Minus size={14} />
              )}
              {hover.row.trend > 0
                ? `Widened ${hover.row.trend} pts in 2 weeks`
                : hover.row.trend < 0
                  ? `Closed ${-hover.row.trend} pts in 2 weeks`
                  : "Flat over 2 weeks"}
            </p>
            <p className="mt-1 flex items-center gap-1 text-rbc-mist/80">
              <Nfc size={13} className="text-rbc-gold" /> {hover.row.tapShare}% of experience is tap verified
            </p>
            <p className="mt-2 border-t border-white/10 pt-2 italic text-rbc-mist/80">
              Top theme: &ldquo;{TOP_THEMES[hover.row.dimension].text}&rdquo;
              <span className="not-italic text-rbc-mist/50"> ({TOP_THEMES[hover.row.dimension].share}% of opt-in mentions)</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DumbbellLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-rbc-mist/70">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-rbc-yellow shadow-glow" /> Expected at onboarding
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full border-2 border-rbc-sky bg-rbc-blue" /> Experienced now
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full border border-dashed border-rbc-sky bg-rbc-sky/15" /> Projected (illustrative)
      </span>
    </div>
  );
}
