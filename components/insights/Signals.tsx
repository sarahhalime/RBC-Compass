"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Eye, Gauge } from "lucide-react";
import { COHORTS, dimShort } from "@/lib/constants";
import { gapVelocity, RETENTION_WEIGHTS, retentionPressure } from "@/lib/gap";
import { cn } from "@/lib/hooks";
import type { Alert, GapRow, Intern } from "@/lib/types";
import { Sparkline } from "../charts/Sparkline";
import { CountUp } from "../ui/CountUp";
import { InfoTip, Pill } from "../ui/primitives";

export function AlertCards({ alerts, onSimulate }: { alerts: Alert[]; onSimulate: (a: Alert) => void }) {
  if (!alerts.length) {
    return <p className="text-sm text-rbc-mist/60">No cohort gap is widening faster than 8 pts in 2 weeks. Nice.</p>;
  }
  return (
    <div className="space-y-3">
      {alerts.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className={cn(
            "relative overflow-hidden rounded-2xl border p-4",
            a.severity === "act" ? "border-danger/40 bg-danger/[0.07]" : "border-warning/40 bg-warning/[0.06]",
          )}
        >
          {a.severity === "act" && (
            <motion.span
              aria-hidden
              className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-danger"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
          <div className="flex items-center gap-2">
            {a.severity === "act" ? (
              <AlertTriangle size={16} className="text-danger" />
            ) : (
              <Eye size={16} className="text-warning" />
            )}
            <Pill tone={a.severity === "act" ? "danger" : "warning"}>{a.severity === "act" ? "Act now" : "Watch"}</Pill>
            <span className="text-[11px] text-rbc-mist/50">Cohort level</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-white">{a.message}</p>
          <p className="mt-1 text-sm text-rbc-mist/75">{a.action}</p>
          <button onClick={() => onSimulate(a)} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rbc-yellow hover:underline">
            Try it in the Gap Closer <ArrowRight size={13} />
          </button>
        </motion.div>
      ))}
    </div>
  );
}

export function VelocityGrid({ rows }: { rows: GapRow[] }) {
  const sorted = [...rows].sort((a, b) => gapVelocity(b.history) - gapVelocity(a.history));
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {sorted.map((r, i) => {
        const v = gapVelocity(r.history);
        return (
          <motion.div
            key={r.dimension}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
          >
            <div>
              <p className="text-xs font-semibold text-white">{dimShort(r.dimension)}</p>
              <p className={cn("num text-[11px] font-semibold", v > 0 ? "text-danger" : v < 0 ? "text-success" : "text-rbc-mist/50")}>
                {v > 0 ? "+" : ""}
                {v.toFixed(1)} pts/wk
              </p>
            </div>
            <Sparkline values={r.history} />
          </motion.div>
        );
      })}
    </div>
  );
}

export function RetentionPanel({ interns }: { interns: Intern[] }) {
  const data = COHORTS.map((c) => retentionPressure(interns, c));
  const w = RETENTION_WEIGHTS;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Gauge size={16} className="text-rbc-yellow" />
        <h3 className="text-sm font-semibold text-white">Retention Pressure by cohort</h3>
        <InfoTip
          wide
          content={
            <>
              <p className="font-semibold text-white">How it is calculated</p>
              <p className="mt-1">
                Index = {w.widening * 100}% x (average of the top 3 widening gaps over 2 weeks, divided by {w.wideningCap} pts, capped at 1) + {w.intent * 100}% x (share of opt-in reflections mentioning intent to leave, divided by {w.intentCap * 100}%, capped at 1). Scaled 0 to 100.
              </p>
              <p className="mt-2">Only opt-in reflections count. Missing reflections are never treated as risk. Never computed for individuals.</p>
            </>
          }
        />
      </div>
      <div className="space-y-2.5">
        {data.map((d, i) => {
          const color = d.band === "High" ? "#FF5C6C" : d.band === "Elevated" ? "#FFB020" : "#2ECC8F";
          return (
            <div key={d.cohort} className="flex items-center gap-3">
              <span className="w-20 text-xs font-semibold text-rbc-mist/80">{d.cohort}</span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${d.index}%` }}
                  transition={{ duration: 1.2, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="num w-8 text-right text-sm font-bold text-white">
                <CountUp value={d.index} />
              </span>
              <span className="w-16 text-[11px] font-semibold" style={{ color }}>
                {d.band}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-[11px] leading-relaxed text-rbc-mist/60">
        Directional signal, not a validated attrition prediction. No individual risk scores, ever.
      </p>
    </div>
  );
}
