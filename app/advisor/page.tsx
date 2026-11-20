"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, EyeOff, Inbox, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { RoleGate } from "@/components/shell/RoleGate";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { CountUp } from "@/components/ui/CountUp";
import { useCompass } from "@/lib/store/compass";
import { useHydrated, cn } from "@/lib/hooks";
import { PROGRAM_STATS } from "@/lib/constants";
import type { SupportRequest } from "@/lib/types";

/** Synthetic requests from other interns. Each contains only what that intern chose to share. */
const SYNTHETIC: SupportRequest[] = [
  {
    id: "syn-1",
    internName: "",
    alias: "Anonymous intern",
    createdAt: Date.UTC(2026, 10, 18, 15),
    topic: "Career path",
    fields: { Topic: "Career path", "Cohort and team": "Calgary · Personal Banking", "How to reach me": "Email", "My message": "Not sure how return offers work for my team." },
    status: "scheduled",
  },
  {
    id: "syn-2",
    internName: "Jonah Kim",
    alias: "Jonah Kim",
    createdAt: Date.UTC(2026, 10, 19, 13),
    topic: "Workload",
    fields: { Topic: "Workload", "How to reach me": "Teams chat", "My message": "Two deadlines landed in the same week. Want advice on raising it." },
    status: "new",
  },
  {
    id: "syn-3",
    internName: "",
    alias: "Anonymous intern",
    createdAt: Date.UTC(2026, 10, 19, 19),
    topic: "Belonging",
    fields: { Topic: "Belonging", "Cohort and team": "Remote · Technology", "How to reach me": "Video call" },
    status: "new",
  },
];

export default function AdvisorPage() {
  return (
    <RoleGate allow="advisor">
      <Queue />
    </RoleGate>
  );
}

function Queue() {
  const hydrated = useHydrated();
  const local = useCompass((s) => s.support);
  const [server, setServer] = useState<SupportRequest[]>([]);
  const [scheduled, setScheduled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch("/api/support", { cache: "no-store" })
        .then((r) => r.json())
        .then((j: { requests: SupportRequest[] }) => !stop && setServer(j.requests))
        .catch(() => undefined);
    load();
    const t = setInterval(load, 3000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  const ids = new Set(local.map((r) => r.id));
  const live = hydrated ? [...local, ...server.filter((s) => !ids.has(s.id))] : [];
  const all = [...live, ...SYNTHETIC];

  return (
    <div>
      <PageHeader
        eyebrow="Early Talent advisor"
        title="Requests interns chose to send."
        right={
          <Pill tone="blue">
            <ShieldCheck size={12} /> Restricted view
          </Pill>
        }
      >
        You only see requests an intern sent you, and only the fields they ticked. No browsing, no profiles, no risk scores.
      </PageHeader>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-rbc-mist/60">Voluntary requests this term</p>
          <p className="num mt-1 text-4xl font-bold text-white">
            <CountUp value={PROGRAM_STATS.supportRequests + live.length} />
          </p>
        </Card>
        <Card delay={0.05} className="p-4 sm:p-5">
          <p className="text-xs text-rbc-mist/60">In your queue</p>
          <p className="num mt-1 text-4xl font-bold text-rbc-yellow">
            <CountUp value={all.length} />
          </p>
        </Card>
        <Card delay={0.1} className="p-4 sm:p-5">
          <p className="text-xs text-rbc-mist/60">Median first response</p>
          <p className="num mt-1 text-4xl font-bold text-success">
            <CountUp value={1.2} decimals={1} suffix=" days" />
          </p>
        </Card>
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {all.map((r, i) => {
            const isScheduled = scheduled[r.id] || r.status === "scheduled";
            const fresh = live.some((l) => l.id === r.id);
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ delay: i * 0.05 }}>
                <Card className={cn(fresh && "border-rbc-yellow/40")}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Inbox size={16} className="text-rbc-sky" />
                        <p className="font-semibold text-white">{r.alias}</p>
                        <Pill tone="yellow">{r.topic}</Pill>
                        {fresh && <Pill tone="success">New</Pill>}
                      </div>
                      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                        {Object.entries(r.fields)
                          .filter(([k]) => k !== "Topic" && k !== "My name")
                          .map(([k, v]) => (
                            <div key={k} className="rounded-xl bg-white/[0.04] p-2.5">
                              <dt className="text-[11px] text-rbc-mist/50">{k}</dt>
                              <dd className="text-sm text-rbc-mist/90">{v}</dd>
                            </div>
                          ))}
                      </dl>
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-rbc-mist/50">
                        <EyeOff size={12} /> Fields the intern did not tick are never sent to this view.
                      </p>
                    </div>
                    <button
                      onClick={() => setScheduled({ ...scheduled, [r.id]: true })}
                      disabled={isScheduled}
                      className={cn("shrink-0", isScheduled ? "btn-ghost text-success" : "btn-primary")}
                    >
                      <CalendarCheck size={16} /> {isScheduled ? "Chat scheduled" : "Offer a chat"}
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="mt-6 text-xs text-rbc-mist/50">Synthetic requests. Production needs RBC SSO, server side RBAC, audit logs and retention limits.</p>
    </div>
  );
}
