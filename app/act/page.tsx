"use client";

import { motion } from "framer-motion";
import { Flag, Megaphone, Rocket, ThumbsUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { CountUp } from "@/components/ui/CountUp";
import { useCompass } from "@/lib/store/compass";
import { useHydrated } from "@/lib/hooks";
import { dimShort } from "@/lib/constants";
import { INTERVENTIONS } from "@/lib/gap";
import type { DimensionId } from "@/lib/types";

interface Story {
  id: string;
  title: string;
  dimension: DimensionId | "onboarding";
  voice: string;
  steps: { label: string; when: string }[];
  stage: number;
  before: number;
  after: number;
  afterLabel: string;
  owner: string;
  fresh?: boolean;
}

const PAST: Story[] = [
  {
    id: "onboarding-kit",
    title: "Day one access checklist",
    dimension: "onboarding",
    voice: "\u201cI waited 4 days for my laptop and repo access.\u201d 31% of week 1 reflections said something like this.",
    steps: [
      { label: "Gap flagged", when: "Week 1" },
      { label: "Leader green-lit", when: "Week 2" },
      { label: "Action launched", when: "Week 2" },
      { label: "Gap trend after", when: "Week 4" },
    ],
    stage: 4,
    before: 22,
    after: 9,
    afterLabel: "measured",
    owner: "Early Talent Program Office with Tech Onboarding",
  },
  {
    id: "socials",
    title: "Structured intern socials by business area",
    dimension: "network",
    voice: "\u201cSocials are fun but I keep meeting the same people.\u201d",
    steps: [
      { label: "Gap flagged", when: "Week 2" },
      { label: "Leader green-lit", when: "Week 3" },
      { label: "Action launched", when: "Week 4" },
      { label: "Gap trend after", when: "Week 6" },
    ],
    stage: 4,
    before: 26,
    after: 18,
    afterLabel: "measured",
    owner: "Intern Council with Early Talent",
  },
];

const STAGE_ICONS = [Flag, ThumbsUp, Rocket, TrendingDown];

export default function ActPage() {
  const hydrated = useHydrated();
  const actions = useCompass((s) => s.actions);

  const fresh: Story[] = hydrated
    ? actions.map((a) => {
        const iv = INTERVENTIONS.find((i) => i.id === a.interventionId)!;
        return {
          id: a.id,
          title: iv.name,
          dimension: a.dimension,
          voice: `Interns told us ${dimShort(a.dimension).toLowerCase()} was not what they expected. Gap of ${a.gapBefore} pts at week 6.`,
          steps: [
            { label: "Gap flagged", when: "Week 6" },
            { label: "Leader green-lit", when: "Today" },
            { label: "Action launched", when: `In ${iv.effortWeeks} wk` },
            { label: "Gap trend after", when: "Pilot" },
          ],
          stage: 2,
          before: a.gapBefore,
          after: a.projectedGap,
          afterLabel: "projected",
          owner: iv.owner,
          fresh: true,
        };
      })
    : [];

  const stories = [...fresh.reverse(), ...PAST];

  return (
    <div>
      <PageHeader
        eyebrow="Closing the loop"
        title={
          <>
            You Spoke. <span className="text-rbc-yellow text-glow">We Acted.</span>
          </>
        }
        right={
          <Link href="/insights#simulator" className="btn-ghost">
            <Megaphone size={16} /> Open the Gap Closer
          </Link>
        }
      >
        Every action starts with intern voice and ends with a measured gap. Interns see this page too, so they know speaking up works.
      </PageHeader>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-rbc-mist/60">Actions launched this term</p>
          <p className="num mt-1 text-4xl font-bold text-white">
            <CountUp value={PAST.length + fresh.length} />
          </p>
        </Card>
        <Card delay={0.05} className="p-4 sm:p-5">
          <p className="text-xs text-rbc-mist/60">Average gap closed (measured)</p>
          <p className="num mt-1 text-4xl font-bold text-success">
            <CountUp value={Math.round(PAST.reduce((a, s) => a + (s.before - s.after), 0) / PAST.length)} suffix=" pts" />
          </p>
        </Card>
        <Card delay={0.1} className="p-4 sm:p-5">
          <p className="text-xs text-rbc-mist/60">Median time from voice to action</p>
          <p className="num mt-1 text-4xl font-bold text-rbc-yellow">
            <CountUp value={1.5} decimals={1} suffix=" wk" />
          </p>
        </Card>
      </div>

      <div className="relative space-y-5">
        {stories.map((s, si) => (
          <Card key={s.id} delay={si * 0.08} className={s.fresh ? "border-rbc-yellow/40 shadow-glow" : ""}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {s.fresh && <Pill tone="yellow">New · green-lit today</Pill>}
                  <Pill tone="blue">{s.dimension === "onboarding" ? "Onboarding" : dimShort(s.dimension)}</Pill>
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-white">{s.title}</h2>
                <p className="mt-1 max-w-2xl text-sm italic text-rbc-mist/70">{s.voice}</p>
                <p className="mt-1 text-xs text-rbc-mist/50">Owner: {s.owner}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-sm font-semibold text-danger">
                  Before <span className="num">{s.before}</span>
                </span>
                <motion.span initial={{ width: 0 }} animate={{ width: 28 }} transition={{ delay: 0.6 }} className="h-px bg-white/30" />
                <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-sm font-semibold text-success">
                  {s.afterLabel === "projected" ? "Projected" : "After"}{" "}
                  <span className="num">
                    <CountUp value={s.after} />
                  </span>
                </span>
              </div>
            </div>

            <div className="relative mt-6">
              <div className="absolute left-4 right-4 top-4 h-0.5 bg-white/10 sm:left-[12.5%] sm:right-[12.5%]" />
              <motion.div
                className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-rbc-yellow to-success sm:left-[12.5%]"
                initial={{ width: 0 }}
                animate={{ width: `${(Math.min(s.stage, 4) - 1) * (75 / 3)}%` }}
                transition={{ duration: 1.2, delay: 0.3 + si * 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
              <ol className="relative grid grid-cols-4">
                {s.steps.map((st, i) => {
                  const Icon = STAGE_ICONS[i];
                  const done = i < s.stage;
                  return (
                    <li key={st.label} className="flex flex-col items-center text-center">
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.25 + si * 0.1, type: "spring", stiffness: 300, damping: 18 }}
                        className={
                          done
                            ? "grid h-9 w-9 place-items-center rounded-full bg-rbc-yellow text-rbc-ink shadow-glow"
                            : "grid h-9 w-9 place-items-center rounded-full border border-dashed border-white/25 bg-rbc-ink text-rbc-mist/50"
                        }
                      >
                        <Icon size={16} />
                      </motion.span>
                      <span className="mt-2 text-xs font-semibold text-white">{st.label}</span>
                      <span className="text-[11px] text-rbc-mist/50">{st.when}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-xs text-rbc-mist/50">Past actions and results are synthetic examples for this prototype.</p>
    </div>
  );
}
