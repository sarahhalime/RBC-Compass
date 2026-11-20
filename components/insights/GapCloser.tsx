"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CheckCircle2, CircleDollarSign, Rocket, UserRound } from "lucide-react";
import Link from "next/link";
import { dimShort } from "@/lib/constants";
import { INTERVENTIONS, intensityCurve } from "@/lib/gap";
import { useCompass } from "@/lib/store/compass";
import { cn } from "@/lib/hooks";
import type { DimensionId, GapRow } from "@/lib/types";
import { InfoTip, Pill } from "../ui/primitives";
import { CountUp } from "../ui/CountUp";
import { Magnetic } from "../ui/Magnetic";

export function GapCloser({
  rows,
  selected,
  setSelected,
  intensity,
  setIntensity,
  projected,
  disabled,
}: {
  rows: GapRow[];
  selected: string;
  setSelected: (id: string) => void;
  intensity: number;
  setIntensity: (v: number) => void;
  projected: Partial<Record<DimensionId, number>>;
  disabled?: boolean;
}) {
  const greenLight = useCompass((s) => s.greenLight);
  const actions = useCompass((s) => s.actions);
  const toast = useCompass((s) => s.toast);
  const iv = INTERVENTIONS.find((i) => i.id === selected)!;
  const primary = Object.entries(iv.effects).sort((a, b) => b[1] - a[1])[0][0] as DimensionId;
  const row = rows.find((r) => r.dimension === primary);
  const before = row?.gap ?? 0;
  const after = projected[primary] ?? before;
  const already = actions.some((a) => a.interventionId === iv.id);

  const onGreenLight = () => {
    greenLight({
      id: `act-${iv.id}`,
      interventionId: iv.id,
      dimension: primary,
      intensity,
      gapBefore: before,
      projectedGap: after,
      at: Date.now(),
    });
    toast({ title: `${iv.name} green-lit`, body: "Added to You Spoke. We Acted. Interns will see it.", tone: "success" });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-2" role="radiogroup" aria-label="Intervention">
        {INTERVENTIONS.map((i) => {
          const on = i.id === selected;
          return (
            <motion.button
              key={i.id}
              role="radio"
              aria-checked={on}
              onClick={() => setSelected(i.id)}
              whileHover={{ x: 3 }}
              className={cn(
                "relative w-full overflow-hidden rounded-2xl border p-3.5 text-left transition-colors",
                on ? "border-rbc-yellow/50 bg-rbc-yellow/[0.07]" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]",
              )}
            >
              {on && <motion.span layoutId="iv-bar" className="absolute inset-y-2 left-0 w-1 rounded-r bg-rbc-yellow" />}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{i.name}</span>
                <span className="flex gap-1">
                  <Pill tone="yellow">{i.cost}</Pill>
                  <Pill>{i.effortWeeks} wk</Pill>
                </span>
              </div>
              <p className="mt-1 text-xs text-rbc-mist/60">
                Targets {Object.keys(i.effects).map((d) => dimShort(d as DimensionId)).join(", ")}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-rbc-ink/40 p-5">
        <AnimatePresence mode="wait">
          <motion.div key={iv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <p className="text-sm leading-relaxed text-rbc-mist/80">{iv.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-white/[0.04] p-2.5">
                <CircleDollarSign size={14} className="text-rbc-yellow" />
                <p className="mt-1 text-rbc-mist/50">Cost</p>
                <p className="font-semibold text-white">{iv.cost}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2.5">
                <CalendarClock size={14} className="text-rbc-sky" />
                <p className="mt-1 text-rbc-mist/50">Effort</p>
                <p className="font-semibold text-white">{iv.effortWeeks} weeks</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2.5">
                <UserRound size={14} className="text-success" />
                <p className="mt-1 text-rbc-mist/50">Owner</p>
                <p className="font-semibold leading-tight text-white">{iv.owner}</p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-rbc-mist/50">{iv.costNote}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="intensity" className="font-semibold text-rbc-mist/70">
              Intensity
            </label>
            <span className="num font-semibold text-white">{intensity}%</span>
          </div>
          <input
            id="intensity"
            type="range"
            min={0}
            max={100}
            step={5}
            value={intensity}
            disabled={disabled}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="range mt-2 w-full"
            style={{ ["--fill" as string]: `${intensity}%` }}
          />
          <div className="mt-1 flex justify-between text-[10px] text-rbc-mist/40">
            <span>Pilot team</span>
            <span>Full cohort</span>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-rbc-mist/60">{dimShort(primary)} gap</p>
            <p className="num text-3xl font-bold text-white">
              <span className="text-rbc-mist/50 line-through decoration-1">{before}</span>{" "}
              <span className="text-rbc-sky">
                <CountUp value={after} duration={0.6} />
              </span>
              <span className="ml-1 text-sm text-rbc-mist/50">pts</span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-rbc-mist/50">
              Illustrative projection, to be validated in a pilot
              <InfoTip
                wide
                content={
                  <>
                    <p className="font-semibold text-white">Simple documented coefficients</p>
                    <p className="mt-1">
                      Projected gap = current gap minus (max effect × curve(intensity)). The curve has diminishing returns: {Math.round(intensityCurve(50) * 100)}% of the max effect at 50% intensity.
                    </p>
                    <p className="mt-1">
                      Max effects: {Object.entries(iv.effects).map(([d, v]) => `${dimShort(d as DimensionId)} ${v} pts`).join(", ")}. Assumptions, not measured results.
                    </p>
                  </>
                }
              />
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {already ? (
            <Link href="/act" className="btn-ghost border-success/40 text-success">
              <CheckCircle2 size={16} /> Green-lit. See it in We Acted
            </Link>
          ) : (
            <Magnetic className="btn-primary" onClick={onGreenLight} disabled={disabled || intensity === 0}>
              <Rocket size={16} /> Green-light this
            </Magnetic>
          )}
        </div>
      </div>
    </div>
  );
}
