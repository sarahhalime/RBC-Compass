"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, HeartHandshake, Send, Undo2 } from "lucide-react";
import { useState } from "react";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { useCompass } from "@/lib/store/compass";
import { useMaya, useHydrated, cn } from "@/lib/hooks";
import { personalGap } from "@/lib/gap";
import { dimLabel } from "@/lib/constants";
import { SAMPLE_REFLECTION } from "@/lib/maya";
import type { SupportRequest } from "@/lib/types";

const TOPICS = ["Mentorship", "Workload", "Career path", "Belonging", "Something else"];
const CONTACT = ["Teams chat", "Email", "Video call"];

type FieldKey = "name" | "team" | "reflection" | "gap" | "contact" | "message";

export default function SupportPage() {
  const maya = useMaya();
  const hydrated = useHydrated();
  const reflections = useCompass((s) => s.reflections);
  const support = useCompass((s) => s.support);
  const addSupport = useCompass((s) => s.addSupport);
  const withdrawSupport = useCompass((s) => s.withdrawSupport);
  const consent = useCompass((s) => s.consent);
  const setConsent = useCompass((s) => s.setConsent);
  const toast = useCompass((s) => s.toast);

  const [topic, setTopic] = useState("Mentorship");
  const [contact, setContact] = useState("Teams chat");
  const [message, setMessage] = useState("I would like help finding regular time with my mentor.");
  const [share, setShare] = useState<Record<FieldKey, boolean>>({
    name: false,
    team: true,
    reflection: false,
    gap: true,
    contact: true,
    message: true,
  });

  const latestReflection = (hydrated && reflections.length ? reflections[reflections.length - 1].text : SAMPLE_REFLECTION) || SAMPLE_REFLECTION;
  const topGap = [...personalGap(maya)].sort((a, b) => b.gap - a.gap)[0];

  const FIELDS: { key: FieldKey; label: string; value: string }[] = [
    { key: "name", label: "My name", value: maya.name },
    { key: "team", label: "Cohort and team", value: `${maya.cohort} · ${maya.area} · ${maya.team}` },
    { key: "gap", label: "My biggest gap", value: `${dimLabel(topGap.dimension)} (expected ${topGap.expected} of 5, experiencing ${topGap.experienced.toFixed(1)})` },
    { key: "reflection", label: "My latest reflection", value: latestReflection },
    { key: "contact", label: "How to reach me", value: contact },
    { key: "message", label: "My message", value: message },
  ];

  const preview: Record<string, string> = { Topic: topic };
  FIELDS.forEach((x) => {
    if (share[x.key] && x.value.trim()) preview[x.label] = x.value;
  });

  const send = () => {
    const req: SupportRequest = {
      id: `sr-${Date.now()}`,
      internName: share.name ? maya.name : "",
      alias: share.name ? maya.name : "Anonymous intern",
      createdAt: Date.now(),
      topic,
      fields: preview,
      status: "new",
    };
    addSupport(req);
    if (consent < 3) setConsent(3, `Sent a support request about ${topic}. Shared: ${Object.keys(preview).join(", ")}.`);
    fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) }).catch(() => undefined);
    toast({ title: "Request sent", body: "An Early Talent advisor will reach out within 2 business days." });
  };

  const withdraw = (id: string) => {
    withdrawSupport(id);
    fetch(`/api/support?id=${id}`, { method: "DELETE" }).catch(() => undefined);
    toast({ title: "Request withdrawn", body: "The advisor can no longer see it.", tone: "info" });
  };

  return (
    <div>
      <PageHeader eyebrow="Opt-in support" title="Ask for help, on your terms.">
        Pick exactly what the advisor sees. The preview on the right is the whole request, nothing more.
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-white">What is it about?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOPICS.map((t) => (
              <button key={t} onClick={() => setTopic(t)} aria-pressed={topic === t} className={cn("chip", topic === t && "border-rbc-yellow/60 bg-rbc-yellow/10 text-rbc-yellow")}>
                {t}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm font-semibold text-white">Choose what to share</p>
          <div className="mt-3 space-y-2">
            {FIELDS.map((f) => (
              <label key={f.key} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors", share[f.key] ? "border-rbc-sky/40 bg-rbc-sky/[0.06]" : "border-white/[0.08] bg-white/[0.02]")}>
                <input type="checkbox" checked={share[f.key]} onChange={(e) => setShare({ ...share, [f.key]: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#FFDF01]" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{f.label}</span>
                  {f.key === "contact" ? (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {CONTACT.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setContact(c);
                          }}
                          className={cn("rounded-full border px-2.5 py-0.5 text-[11px]", contact === c ? "border-rbc-yellow/60 text-rbc-yellow" : "border-white/15 text-rbc-mist/70")}
                        >
                          {c}
                        </button>
                      ))}
                    </span>
                  ) : f.key === "message" ? (
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onClick={(e) => e.preventDefault()}
                      rows={2}
                      aria-label="Message to advisor"
                      className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-rbc-ink/50 p-2 text-sm text-white focus:border-rbc-yellow/50 focus:outline-none"
                    />
                  ) : (
                    <span className="mt-0.5 line-clamp-2 block text-xs text-rbc-mist/60">{f.value}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card delay={0.05} className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <Eye size={17} className="text-rbc-yellow" />
              <h2 className="font-display text-lg font-bold text-white">Exactly what the advisor will see</h2>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-rbc-ink/60 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{share.name ? maya.name : "Anonymous intern"}</p>
                <Pill tone="yellow">{topic}</Pill>
              </div>
              <dl className="mt-3 space-y-2">
                <AnimatePresence initial={false}>
                  {Object.entries(preview)
                    .filter(([k]) => k !== "Topic" && k !== "My name")
                    .map(([k, v]) => (
                      <motion.div key={k} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <dt className="text-[11px] text-rbc-mist/50">{k}</dt>
                        <dd className="text-sm text-rbc-mist/90">{v}</dd>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </dl>
            </div>
            <p className="mt-3 text-xs text-rbc-mist/50">Not shared: your mood history, other reflections, tap history and anything unchecked.</p>
            <button onClick={send} className="btn-primary mt-4 w-full py-3">
              <Send size={16} /> Send to an advisor
            </button>
          </Card>

          {hydrated && support.length > 0 && (
            <Card delay={0.1}>
              <div className="mb-3 flex items-center gap-2">
                <HeartHandshake size={17} className="text-success" />
                <h2 className="text-sm font-semibold text-white">Your requests</h2>
              </div>
              <ul className="space-y-2">
                {support.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.04] p-3 text-sm">
                    <span className="flex items-center gap-2 text-white">
                      <Check size={14} className="text-success" /> {r.topic}
                      <span className="text-xs text-rbc-mist/50">· {Object.keys(r.fields).length} fields shared</span>
                    </span>
                    <button onClick={() => withdraw(r.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-rbc-mist/70 hover:text-white">
                      <Undo2 size={13} /> Withdraw
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
