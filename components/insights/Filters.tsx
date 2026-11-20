"use client";

import { motion } from "framer-motion";
import { Check, Lock, RotateCcw } from "lucide-react";
import { AREAS, COHORTS } from "@/lib/constants";
import { applyPrivacy } from "@/lib/privacy";
import { cn } from "@/lib/hooks";
import type { Filter, Intern } from "@/lib/types";
import { Tooltip } from "../ui/primitives";

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function ChipGroup<T extends string>({
  label,
  values,
  selected,
  candidate,
  interns,
  onChange,
}: {
  label: string;
  values: readonly T[];
  selected: T[];
  candidate: (next: T[]) => Pick<Filter, "cohorts" | "areas">;
  interns: Intern[];
  onChange: (next: T[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-rbc-mist/60">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange([])}
          className={cn("chip", selected.length === 0 && "border-rbc-yellow/50 bg-rbc-yellow/10 text-rbc-yellow")}
          aria-pressed={selected.length === 0}
        >
          All
        </button>
        {values.map((v) => {
          const on = selected.includes(v);
          const next = toggle(selected, v);
          const result = next.length === 0 ? { hidden: false, n: 0 } : applyPrivacy(interns, candidate(next));
          const locked = !on && result.hidden;
          const chip = (
            <motion.button
              layout
              key={v}
              disabled={locked}
              onClick={() => onChange(next)}
              aria-pressed={on}
              className={cn(
                "chip",
                on && "border-rbc-sky/60 bg-rbc-sky/15 text-white",
                locked && "cursor-not-allowed opacity-45",
              )}
            >
              {on && <Check size={13} className="text-rbc-sky" />}
              {locked && <Lock size={12} className="text-rbc-yellow" />}
              {v}
            </motion.button>
          );
          return locked ? (
            <Tooltip key={v} content={result.message ?? "Locked to protect privacy"}>
              {chip}
            </Tooltip>
          ) : (
            chip
          );
        })}
      </div>
    </div>
  );
}

export function Filters({
  filter,
  setFilter,
  interns,
}: {
  filter: Filter;
  setFilter: (f: Filter) => void;
  interns: Intern[];
}) {
  const start = filter.weekStart;
  const end = filter.weekEnd;
  return (
    <div className="space-y-5">
      <ChipGroup
        label="Cohort"
        values={COHORTS}
        selected={filter.cohorts}
        interns={interns}
        candidate={(next) => ({ cohorts: next, areas: filter.areas })}
        onChange={(cohorts) => setFilter({ ...filter, cohorts })}
      />
      <ChipGroup
        label="Business area"
        values={AREAS}
        selected={filter.areas}
        interns={interns}
        candidate={(next) => ({ cohorts: filter.cohorts, areas: next })}
        onChange={(areas) => setFilter({ ...filter, areas })}
      />
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-rbc-mist/60">Week range</p>
          <p className="num text-xs font-semibold text-white">
            Weeks {start} to {end}
          </p>
        </div>
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
          <motion.div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-rbc-yellow"
            animate={{ left: `${((start - 1) / 5) * 100}%`, width: `${((end - start) / 5) * 100}%` }}
          />
          <input
            aria-label="From week"
            type="range"
            min={1}
            max={6}
            value={start}
            onChange={(e) => setFilter({ ...filter, weekStart: Math.min(Number(e.target.value), end - 1) })}
            className="dual-range"
          />
          <input
            aria-label="To week"
            type="range"
            min={1}
            max={6}
            value={end}
            onChange={(e) => setFilter({ ...filter, weekEnd: Math.max(Number(e.target.value), start + 1) })}
            className="dual-range"
          />
        </div>
        <div className="mt-1 flex justify-between px-0.5 text-[10px] text-rbc-mist/40">
          {[1, 2, 3, 4, 5, 6].map((w) => (
            <span key={w}>W{w}</span>
          ))}
        </div>
      </div>
      {(filter.cohorts.length > 0 || filter.areas.length > 0 || start !== 1 || end !== 6) && (
        <button
          className="btn-ghost px-3 py-1.5 text-xs"
          onClick={() => setFilter({ cohorts: [], areas: [], weekStart: 1, weekEnd: 6 })}
        >
          <RotateCcw size={13} /> Reset filters
        </button>
      )}
    </div>
  );
}
