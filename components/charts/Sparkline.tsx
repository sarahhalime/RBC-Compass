"use client";

import { motion } from "framer-motion";
import { scaleLinear } from "d3-scale";
import { curveMonotoneX, line } from "d3-shape";
import { useId } from "react";
import { DRAW_VARIANTS } from "./draw";

/** Tiny gap trend. Red when widening over the last 2 weeks, green when closing. */
export function Sparkline({
  values,
  width = 84,
  height = 26,
  invert = false,
}: {
  values: number[];
  width?: number;
  height?: number;
  /** When true, going up is good (for example experienced %). */
  invert?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  if (values.length < 2) return <svg width={width} height={height} aria-hidden />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(2, (max - min) * 0.2);
  const x = scaleLinear().domain([0, values.length - 1]).range([2, width - 4]);
  const y = scaleLinear().domain([min - pad, max + pad]).range([height - 3, 3]);
  const d = line<number>()
    .x((_, i) => x(i))
    .y((v) => y(v))
    .curve(curveMonotoneX)(values)!;
  const delta = values[values.length - 1] - values[Math.max(0, values.length - 3)];
  const widening = invert ? delta < 0 : delta > 0;
  const color = delta === 0 ? "#E8EEF7" : widening ? "#FF5C6C" : "#2ECC8F";
  const area = `${d} L${x(values.length - 1)},${height} L${x(0)},${height} Z`;

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path d={area} fill={`url(#sg-${id})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        variants={DRAW_VARIANTS}
        initial="hidden"
        animate="shown"
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.circle
        cx={x(values.length - 1)}
        cy={y(values[values.length - 1])}
        r={2.6}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9 }}
      />
    </svg>
  );
}
