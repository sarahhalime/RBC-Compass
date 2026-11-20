"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { AREAS, COHORTS, dimShort } from "@/lib/constants";
import { computeGap } from "@/lib/gap";
import type { Intern } from "@/lib/types";

/** Every cohort by business area slice. Any slice under 10 contributors renders blurred and locked. */
export function SliceMatrix({ interns, weekEnd }: { interns: Intern[]; weekEnd: number }) {
  let hiddenCount = 0;
  const grid = COHORTS.map((cohort) =>
    AREAS.map((area) => {
      const snap = computeGap(interns, { cohorts: [cohort], areas: [area], weekStart: 1, weekEnd });
      if (snap.hidden) hiddenCount++;
      const top = snap.hidden ? null : [...snap.rows].sort((a, b) => b.gap - a.gap)[0];
      return { cohort, area, snap, top };
    }),
  );

  return (
    <div>
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-1.5 text-left">
          <thead>
            <tr>
              <th className="w-24" />
              {AREAS.map((a) => (
                <th key={a} scope="col" className="px-1 pb-1 text-[11px] font-semibold text-rbc-mist/60">
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={row[0].cohort}>
                <th scope="row" className="pr-2 text-xs font-semibold text-white">
                  {row[0].cohort}
                </th>
                {row.map((cell, ci) => (
                  <td key={cell.area}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (ri * 6 + ci) * 0.015 }}
                      className="relative h-16 overflow-hidden rounded-xl border border-white/10"
                    >
                      {cell.snap.hidden ? (
                        <>
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-rbc-blue/50 via-rbc-sky/20 to-rbc-yellow/20 blur-md" />
                          <div className="relative flex h-full flex-col items-center justify-center gap-0.5 bg-rbc-ink/40 text-center">
                            <Lock size={13} className="text-rbc-yellow" />
                            <span className="text-[10px] font-semibold leading-tight text-white">Hidden (n&lt;10)</span>
                          </div>
                        </>
                      ) : (
                        <div
                          className="flex h-full flex-col justify-between p-2"
                          style={{
                            background: `linear-gradient(135deg, rgba(255,223,1,${Math.min(0.32, cell.top!.gap / 120)}), rgba(0,93,170,0.18))`,
                          }}
                        >
                          <span className="text-[10px] text-rbc-mist/60">n={cell.snap.n}</span>
                          <span className="text-[11px] font-semibold leading-tight text-white">
                            {dimShort(cell.top!.dimension)} <span className="num text-rbc-yellow">{cell.top!.gap}</span>
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-rbc-mist/60">
        {hiddenCount} of {COHORTS.length * AREAS.length} slices are hidden because fewer than 10 interns contributed. Each visible tile shows its biggest gap. Exact small counts are never displayed.
      </p>
    </div>
  );
}
